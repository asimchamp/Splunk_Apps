import sys
import json
import time
import random
import hmac
from hashlib import sha1
import urllib
import urllib2

def send_message(settings, consumer_key=None, consumer_secret=None, access_token=None, access_token_secret=None, status=None, recipient=None):
    print >> sys.stderr, "DEBUG Sending message with settings %s" % settings
    
    # Use optional passed in parameters - useful for debugging
    consumer_key = consumer_key or                  settings.get('consumer_key')
    consumer_secret = consumer_secret or            settings.get('consumer_secret')
    access_token = access_token or                  settings.get('access_token')
    access_token_secret = access_token_secret or    settings.get('access_token_secret')
    status = status or                              settings.get('message')
    recipient = recipient or                        settings.get('recipient')
    
    direct_message_endpoint = "https://api.twitter.com/1.1/direct_messages/new.json"
    public_status_endpoint = "https://api.twitter.com/1.1/statuses/update.json"
    if recipient:
        url = direct_message_endpoint
    else:
        url = public_status_endpoint
    
    # STEP 1 - GENERATE BASE STRING
    params = collect_parameters(consumer_key, access_token, status, recipient)
    base_string = generate_base_string(params, url)
    
    # Compare base string to one generated by Twitter for debugging:
    # https://dev.twitter.com/rest/reference/post/statuses/update (Ctrl+F "OAuth Signature Generator")
    print >> sys.stderr, "INFO Base string: %s" % base_string
    
    # STEP 2 - GENERATE AUTH SIGNATURE
    signing_key = percent_encode(consumer_secret) + '&' + percent_encode(access_token_secret)
    signature = hmac.new(signing_key, base_string, sha1).digest().encode('base64').rstrip('\n')
    
    # STEP 3 - GENERATE AUTH HEADER
    auth_header = generate_authorization_header(params, signature)
    
    # STEP 4 - POST TO API
    return make_post_request(url, status, recipient, auth_header)
        

def collect_parameters(consumer_key, access_token, status, recipient=None):
    # https://dev.twitter.com/oauth/overview/creating-signatures
    nonce = generate_nonce()                        # random 32-bit number for identification
    timestamp = str(time.time()).split('.')[0]      # decimal time not needed for twitter API
    param = {
        'oauth_consumer_key': consumer_key,
        'oauth_nonce': nonce,
        'oauth_signature_method': 'HMAC-SHA1',
        'oauth_timestamp': timestamp,
        'oauth_token': access_token,
        'oauth_version': '1.0'
    }
    
    if recipient:
        param['screen_name'] = recipient
        param['text'] = status
    else:
        param['status'] = status
        
    return param
    
    
def generate_base_string(param, url):
    # https://dev.twitter.com/oauth/overview/creating-signatures
    array = []
    first = True
    for key, value in sorted(param.items()):
        if first:
            first = False
        else:
            array.append('&')
        array.append(percent_encode(key))
        array.append('=')
        array.append(percent_encode(value))
        
    parameter_string = ''.join(array)
    base_string = 'POST&' + percent_encode(url) + '&' + percent_encode(parameter_string)
    
    return base_string
    
    
def generate_authorization_header(param, signature):
    # https://dev.twitter.com/oauth/overview/authorizing-requests
    param['oauth_signature'] = signature
    array = ['OAuth ']
    first = True
    for key, value in sorted(param.items()):
        if (key == 'status' or key == 'screen_name' or key == 'text'):       # we don't put status in the header
            continue
        key = percent_encode(key)
        value = percent_encode(value)
        array.append(key)
        array.append('=')
        array.append('"')
        array.append(value)
        array.append('"')
        array.append(', ')
    array.pop(-1)                   # get rid of the last ", "
    auth_header = ''.join(array)
    
    return auth_header
    
    
def make_post_request(url, status, recipient, auth_header):
    if recipient:
        body = {
            'screen_name': recipient,
            'text': status
        }
    else:
        body = {
            'status': status
        }
    body = urllib.urlencode(body)
    req = urllib2.Request(url, body)
    req.add_header('Authorization', auth_header)
    
    # For debugging purposes:
    # https://dev.twitter.com/rest/reference/post/statuses/update (Ctrl+F "OAuth Signature Generator")
    print >> sys.stderr, "INFO curl --request 'POST' '%s' --data '%s' --header 'Authorization: %s' --verbose" % (
        url, body, auth_header
    )

    try:
        res = urllib2.urlopen(req)
        body = res.read()
        print >> sys.stderr, "INFO Twitter server responded with HTTP status=%d" % res.code
        print >> sys.stderr, "DEBUG Twitter server response: %s" % json.dumps(body)
        return 200 <= res.code < 300
    except urllib2.HTTPError, e:
        print >> sys.stderr, "ERROR Error sending message: %s" % e
        return False
    

def percent_encode(str):
    """Percent encode the given string (with no exception for forward slashes)"""
    return urllib.quote(str, '')


def generate_nonce(length=32):
    """Generate a pseudorandom number"""
    return ''.join([str(random.randint(0, 9)) for i in range(length)])


def normalize_bool(value):
    return True if value.lower() in ('1', 'true') else False


if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "--execute":
        payload = json.loads(sys.stdin.read())
        if not send_message(payload.get('configuration')):
            print >> sys.stderr, "FATAL Failed trying to send tweet"
            sys.exit(2)
        else:
            print >> sys.stderr, "INFO Tweet successfully sent"
    else:
        print >> sys.stderr, "FATAL Unsupported execution mode (expected --execute flag)"
        sys.exit(1)
