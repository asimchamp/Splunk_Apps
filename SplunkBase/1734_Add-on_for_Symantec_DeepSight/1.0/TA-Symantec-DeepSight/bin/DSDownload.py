##############
# Data feed downloader for Symantec feeds
# V0.1 
# Splunk, Inc. 2014
#############

import base64                   # encoding credentials for obix
import csv
import httplib
import os                       # os.walk for dir traversal. os.path to join file paths
import re                       # regex match for xml match
import socket
import StringIO
import ssl
import sys                      # for system params and sys.exit()
import traceback
import urllib2                  # for connecting to the DeepSight server
import zipfile                  # for the extraction of zip archives acquired from the obix server

# Splunk imports
import splunk
import splunk.entity as entity  # for splunk config info
import splunk.mining.dcutils as dcu
from splunk.appserver.mrsparkle.lib.util import make_splunkhome_path

# Custom libraries
import update_lookup_table_via_api as lookup

# Constants
APP = 'TA-Symantec-DeepSight'
DSUSER = ""
DSPASSWORD = ""
FEEDID = '21'  # csv IP reputation feed ID
LOOKUP_TMP = make_splunkhome_path(['var', 'run', 'splunk', 'lookup_tmp'])
LOOKUP_NAME = 'deepSightIpFeed'
LOOKUP_OWNER = 'nobody'


# custom handler stuff stolen wholesale. major props to Micheal Kinsley
# custom HTTPS opener, banner's oracle 10g server supports SSLv3 only
class HTTPSConnectionV3(httplib.HTTPSConnection):
    def __init__(self, *args, **kwargs):
        httplib.HTTPSConnection.__init__(self, *args, **kwargs)

    def connect(self):
        sock = socket.create_connection((self.host, self.port), self.timeout)
        if self._tunnel_host:
            self.sock = sock
            self._tunnel()
        try:
            self.sock = ssl.wrap_socket(sock, self.key_file, self.cert_file, ssl_version=ssl.PROTOCOL_SSLv3)
        except ssl.SSLError:
            print("Trying SSLv3.")
            self.sock = ssl.wrap_socket(sock, self.key_file, self.cert_file, ssl_version=ssl.PROTOCOL_SSLv23)


class HTTPSHandlerV3(urllib2.HTTPSHandler):
    def https_open(self, req):
        return self.do_open(HTTPSConnectionV3, req)
# install opener
urllib2.install_opener(urllib2.build_opener(HTTPSHandlerV3()))


## Major props to Ledion. copying his function, verbatim and then adding comments and traceback and logging
## http://blogs.splunk.com/2011/03/15/storing-encrypted-credentials/
## access the credentials in /servicesNS/nobody/<YourApp>/admin/passwords
def getCredentials(sessionKey):
    '''Given a splunk sesionKey returns a clear text user name and password from a splunk password container'''
    logger = dcu.getLogger()  
    # this is the folder name for the app and not the app's common name
    try:
        # list all credentials
        entities = entity.getEntities(['storage', 'passwords'], namespace=APP, owner='nobody', sessionKey=sessionKey)
    except Exception, e:
        stack = traceback.format_exc()
        logger.warn(stack)
        logger.warn("entity exception")
        raise Exception("Could not get %s credentials from splunk. Error: %s" % (APP, str(e)))
    # return first set of credentials
    for c in entities.values():
        if c['username'] != 'wildfire_api_key':
            return c['username'], c['clear_password']
    logger.warn("No credentials")
    raise Exception("No credentials have been found")


def request(url, textdata, headers):
    '''Given a url, data, and headers, makes the request and returns the result'''
    req = urllib2.Request(url, textdata, headers)
    response = urllib2.urlopen(req)
    result = response.read()
    return result


def makeSeqXml(feedId, DSUSER, DSPASSWORD):
    '''Given a feedId, a username and password, returns an XML file that is used for acquiring the Deep Sight Sequence Number'''
    header = '''<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:sym="http://symantec.com/">
   <soap:Header>
      <sym:AuthHeader>'''
    username = "<sym:UserName>" + DSUSER + "</sym:UserName>"
    password = "<sym:Password>" + DSPASSWORD + "</sym:Password>"
    middle = '''</sym:AuthHeader>
   </soap:Header>
   <soap:Body>
      <sym:GetFeedFileList>'''
    feed = "<sym:dataFeedTypeId>" + feedId + "</sym:dataFeedTypeId>"
    footer = '''<sym:sequenceNumber>0</sym:sequenceNumber>
      </sym:GetFeedFileList>
   </soap:Body>
   </soap:Envelope>
   '''
    seqFile = header + username + password + middle + feed + footer
    return seqFile


def getSeqXml(feedId, DSUSER, DSPASSWORD):
    '''Returns the sequence number for a connection to DeepSight'''
    print "Starting web services call to DeepSight."
    headers = {'Content-Type': 'text/xml; charset=utf-8', 'Action': 'https://datafeeds.symantec.com/Feeds/GetFeedFileList'}
    data = makeSeqXml(feedId, DSUSER, DSPASSWORD)
    url = 'https://datafeeds.symantec.com/Feeds/Datafeed.asmx'
    result = request(url, data, headers)
    sequence = re.search(r"\<SequenceNumber\>+\d+\</SequenceNumber\>+", result)
    sequencenum = re.search("\d+", sequence.group(0))
    num = sequencenum.group(0)
    print "Got the initial file sequence number: " + num
    return num


def getFeed(SeqFileXML):
    print "Starting web services call to DeepSight."
    print "Getting feed file"
    headers = {"Content-Type": "text/xml; charset=utf-8",
               "Action": "https://datafeeds.symantec.com/Feeds/GetFeedFile",
               "User-Agent": "Mozilla/5.0"}
    url = "https://datafeeds.symantec.com/Feeds/Datafeed.asmx"
    result = request(url, SeqFileXML, headers)
    return result


def makeSeqFileXml(feedId, sequenceNumber, DSUSER, DSPASSWORD):
    header = '''<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:sym="http://symantec.com/">
       <soap:Header>
          <sym:AuthHeader>'''
    username = '''<sym:UserName>''' + DSUSER + '''</sym:UserName>'''
    password = '''<sym:Password>''' + DSPASSWORD + '''</sym:Password>'''
    middle = '''</sym:AuthHeader>
       </soap:Header>
       <soap:Body>
          <sym:GetFeedFile>
             <sym:dataFeedTypeId>'''

    sequence = '''</sym:dataFeedTypeId>          <sym:sequenceNumber>''' + seqnum+'''</sym:sequenceNumber>'''
    footer = '''      </sym:GetFeedFile>
       </soap:Body>
    </soap:Envelope>
    '''
    SeqFileXML = header + username + password + middle + feedId + sequence + footer    
    return SeqFileXML

### Begin main

# Get Splunk credentials.

# Uncomment for testing from CLI
# Syntax for CLI testing:
#
#    splunk cmd python ./DSDownload.py
#sessionKey = splunk.auth.getSessionKey('admin', 'changeme')

# Uncomment for production use
sessionKey = sys.stdin.readline().strip()# get the sessionKey

if len(sessionKey) == 0:
    sys.stderr.write("Did not receive a session key from splunkd. " +
                     "Please enable passAuth in inputs.conf for this " +
                     "script\n")
    exit(2)

### get remote credentials from Splunk secure credential store
print "Got a session key: ", sessionKey
DSUSER, DSPASSWORD = getCredentials(sessionKey)
print "got creds from splunk " + DSUSER + " <PASSWORD REDACTED>"

# get the sequence number from DS
print "Getting Sequence Number: "
seqnum = getSeqXml(FEEDID, DSUSER, DSPASSWORD)

# create a new data file for request
SeqFileXML = makeSeqFileXml(FEEDID, seqnum, DSUSER, DSPASSWORD)

print "Getting feed data..."
# the result of the request for feed
result = getFeed(SeqFileXML)

print "base64 decoding feed..."
#convert base64 result to binary
splitres = (((result.split("File>"))[1]).split("</"))[0]
splitres = base64.b64decode(splitres)

print "Writing feed file to disk"
#write the output to disk
feedfile = make_splunkhome_path(['etc', 'apps', APP, 'feed', 'feed.zip'])
feedContent = open(feedfile, "wb")
feedContent.write(str(splitres))
feedContent.close()

print "Attempting to unzip the feed contents..."
zipped = zipfile.ZipFile(feedfile)
extractedfilename = (zipped.namelist())[0]
content = zipped.read(extractedfilename)
print "Feed contents extracted : %s" % (extractedfilename)

# Strip quotes from the lookup table before writing to disk to avoid generating
# error in threatlist modular input; cf. SOLNESS-4579.
tempfile = make_splunkhome_path([LOOKUP_TMP, 'tmp.csv'])
with open(tempfile, 'w') as fh:
    infile = csv.DictReader(StringIO.StringIO(zipped.read(extractedfilename)))
    outfile = csv.DictWriter(fh, fieldnames=infile.fieldnames, quoting=csv.QUOTE_MINIMAL)
    outfile.writeheader()
    for line in infile:
        outfile.writerow(line)
zipped.close()

# move the lookup table via rest api
lookup_table_file_path = lookup.get_lookup_table_location(LOOKUP_NAME, APP, LOOKUP_OWNER, sessionKey, fullpath=False)

# Print the lookup path
print 'Lookup named %s backed by source file %s' % (LOOKUP_NAME, lookup_table_file_path)

# Update it from source file in $SPLUNK_HOME/var/run/splunk/lookup_tmp
success = lookup.update_lookup_table(tempfile, lookup_table_file_path, APP, LOOKUP_OWNER, sessionKey)

# Print the result
print 'Lookup named %s update status: %s' % (LOOKUP_NAME, success)
