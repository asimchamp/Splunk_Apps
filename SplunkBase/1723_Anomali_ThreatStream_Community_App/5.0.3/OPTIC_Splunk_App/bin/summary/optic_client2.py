import os, os.path
import urllib
import urllib2
import requests
import json
from binascii import a2b_hex

class OpticClient(object):
    def __init__(self, username, apikey, url_root, verify=False, **kwargs):
        self.username = username
        self.apikey = apikey
        if url_root.endswith("/"):
            self.url = url_root + "mars/upload/"
            self.key_url = url_root + "userorganization/upload_key/"
            self.reg_url = url_root + "registration/"
            self.login_url = url_root + "user/login/"
        else:
            self.url = url_root + "/mars/upload/"
            self.key_url = url_root + "/userorganization/upload_key/"
            self.reg_url = url_root + "/registration/"
            self.login_url = url_root + "/user/login/"
        self.verify = verify
        self.proxy_host = kwargs.get('proxy_host')
        self.proxy_port = kwargs.get('proxy_port')
        self.proxy_user = kwargs.get('proxy_user')
        self.proxy_password = kwargs.get('proxy_password')
        self.https_proxy = 'https://%s:%s@%s:%s' % (self.proxy_user, self.proxy_password, self.proxy_host, self.proxy_port)
        self.proxy_dict = None
        if self.proxy_host and self.proxy_port:
            self.proxy_dict = {'https':self.https_proxy}
        self.upload_to_cloud = kwargs.get("upload_to_cloud")

    def get_upload_url(self, params, logger=None):
        headers = {'Content-Type':'application/json', 'Authorization' : 'apikey {user}:{apikey}'.format(user=self.username, apikey=self.apikey)}
        optic_url = self.url + "?" + urllib.urlencode(params)
        data = {"username":self.username, "api_key":self.apikey}
        data.update(params)
        if self.upload_to_cloud:
            response = requests.get(optic_url, headers=headers, proxies=self.proxy_dict, verify=self.verify)
        else:
            response = requests.post(self.url, headers=headers, data=json.dumps(data), proxies=self.proxy_dict, verify=self.verify)
        if response.status_code >= 400:
            if response.status_code == 405:
                #for backward compatibility
                print("Get 405 while retrieving upload url, try it again with get")
                if logger:
                    logger.warn("Get 405 while retrieving upload url, try it again with get")
                rewrite_url = self.url + "?" + urllib.urlencode(data)
                response = requests.get(rewrite_url, headers=headers, proxies=self.proxy_dict, verify=self.verify)
                if response.status_code >= 400:
                    raise Exception("Failed to retrieve upload url error_code=%s" % response.status_code)
            else:
                raise Exception("Failed to retrieve upload url error_code=%s" % response.status_code)
        result = response.content
        content_json = json.loads(result)
        return content_json['url']

    def upload(self, file_name, timestamp_utc, date, dcid=None, logger=None):
        file_size = os.path.getsize(file_name)
        params = {'timestamp':timestamp_utc, 'date':date, 'dcid':dcid, 'size':file_size}
        upload_url = self.get_upload_url(params, logger=logger)
        if logger:
            logger.debug("upload_url:%s" % (upload_url))
        print("upload_url:%s, size=%s" % (upload_url, file_size))
        with open(file_name, 'rb') as file_handler:
            headers = {'Content-Type':'binary/octet-stream'}
            if logger:
                logger.debug("PUT %s" % file_name)
                logger.debug("Request Headers:\n{}".format( '\n'.join('{}: {}'.format(k, v) for k, v in headers.items())))
            response = requests.put(upload_url, data = file_handler, headers=headers, proxies=self.proxy_dict, verify=self.verify)
            if response.status_code >= 400:
                raise Exception("Failed to upload file %s error_code=%s" % (file_name, response.status_code))
            if logger:
                logger.debug("Response.status_code=%s" % response.status_code)
                logger.debug("Response Headers:\n{}".format( '\n'.join('{}: {}'.format(k, v) for k, v in response.headers.items())))
        if logger:
            logger.info("uploaded file:%s, size=%d" % (file_name, file_size))
        print("uploaded file:%s, size=%d" % (file_name, file_size))

    def getKey(self,logger=None):
        try:
            headers={'Content-Type':'application/json', 'Authorization' : 'apikey {user}:{apikey}'.format(user=self.username, apikey=self.apikey)}
            optic_url=self.key_url
            if logger:logger.debug("about to go over the network to ask for encryption key from {0}".format(self.key_url))
            response=requests.get(optic_url, headers=headers, proxies=self.proxy_dict, verify=self.verify)
            if logger:logger.debug("got response code: {0}".format(response.status_code))
            if response.status_code >= 400:
                raise Exception("Failed to retrieve encryption key error_code={0}".format(response.status_code))
            content_json = json.loads(response.content)
            hex_key = content_json['key']
            return a2b_hex(hex_key)
        except Exception as duh:
            if logger: logger.exception(duh)
            raise duh

    def register(self, data, logger=None):
        data.update(dict(source='harmony', password_repeat=data['password'],
                    reports_campaign_type='splunkapp'))
        try:
            session = requests.Session()
            headers={'content-type': 'application/json'}
            response = requests.post(self.reg_url,
                data=json.dumps(data),
                headers=headers,
                proxies=self.proxy_dict,
                verify=self.verify)
            if response.status_code >= 400:
                raise Exception ("Failed to register code: %s, reason: %s" % (response.status_code, response.content))
        except Exception as e:
            if logger: logger.exception(e)
            raise e

    def login(self, username, password, logger=None):
        try:
            headers={'content-type': 'application/json'}
            response = requests.post(self.login_url,
                data = json.dumps({'username': username, 'password': password}),
                headers=headers,
                proxies=self.proxy_dict,
                verify=self.verify)
            if response.status_code >= 400:
                raise Exception ("Failed to register code: %s, reason: %s" % (response.status_code, response.content))
            user_detail = response.json()
            #logger.info("user:%s" % user_detail)
            api_key = user_detail['api_key']['key']
            return (username, api_key)
        except Exception as e:
            if logger: logger.exception(e)
            raise e

    def signUp(self, data, logger=None):
        try:
            #logger.info("data=%s" % data)
            self.register(data, logger)
            (username, apikey) = self.login(data['email'], data['password'], logger)
            return (username, apikey)
        except Exception as e:
            raise e