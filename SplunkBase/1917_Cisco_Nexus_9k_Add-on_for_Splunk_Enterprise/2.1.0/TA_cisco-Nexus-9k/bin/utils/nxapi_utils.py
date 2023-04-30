# Copyright (C) 2013 Cisco Systems Inc.
# All rights reserved

import contextlib
import base64

import socket
import requests
from lxml import etree
import json
import xmltodict

from errors import *

class RequestMsg(object):

    def __init__(
        self,
        msg_type='cli_show',
        ver='0.1',
        sid='1',
        input_cmd='show version',
        out_format='json',
        do_chunk='0',
        ):

        self.msg_type = msg_type
        self.ver = ver
        self.sid = sid
        self.input_cmd = input_cmd
        self.out_format = out_format
        self.do_chunk = do_chunk

    def get_req_msg_str(
        self,
        msg_type='cli_show',
        ver='0.1',
        sid='1',
        input_cmd='show version',
        out_format='json',
        do_chunk='0',
        ):

        req_msg = '<?xml version="1.0" encoding="ISO-8859-1"?>\n'
        req_msg += '<ins_api>\n'
        req_msg += '<type>' + msg_type + '</type>\n'
        req_msg += '<version>' + ver + '</version>\n'
        req_msg += '<chunk>' + do_chunk + '</chunk>\n'
        req_msg += '<sid>' + sid + '</sid>\n'
        req_msg += '<input>' + input_cmd + '</input>\n'
        req_msg += '<output_format>' + out_format + '</output_format>\n'
        req_msg += '</ins_api>\n'
        return req_msg


class RespFetcher(object):

    def __init__(
        self,
        username=None,
        password=None,
        url=None,
        ):
        self.username = username
        self.password = password
        self.url = url
        self.base64_str = base64.urlsafe_b64encode(('%s:%s' % (username,
                password)).encode()).decode()

    def get_resp(
        self,
        req_str,
        cookie,
        timeout,
        ):

        try:
            header = {'Authorization' : 'Basic %s' % self.base64_str, 'Cookie': cookie}
            response = requests.post(self.url, data=req_str, headers=header, timeout=timeout)
            response.raise_for_status()
            resp_str = response.text
            resp_headers = response.headers
            return (resp_headers, resp_str)
        except socket.timeout as e:
            print('Req timeout')
            raise


class RespFetcherHttps(object):

    def __init__(
        self,
        username=None,
        password=None,
        url=None,
        ):

        self.username = username
        self.password = password
        self.url = url
        self.base64_str = base64.urlsafe_b64encode(('%s:%s' % (username,
                password)).encode()).decode()

    def get_resp(
        self,
        req_str,
        cookie,
        timeout,
        ):
        try:
            header = {'Authorization' : 'Basic %s' % self.base64_str, 'Cookie': cookie}
            response = requests.post(self.url, data=req_str, headers=header, timeout=timeout)
            response.raise_for_status()
            resp_str = response.text
            resp_headers = response.headers
            return (resp_headers, resp_str)
        except socket.timeout as e:
            print('Req timeout')
            raise


class NXAPITransport(object):
    '''N9000 Python objects off-the-box transport utilizing NX-API'''
    target_url = ''
    username = ''
    password = ''

    timeout = ''

    out_format = 'xml'
    do_chunk = '0'
    sid = 'sid'
    cookie = 'no-cookie'

    req_obj = RequestMsg()

    @classmethod
    def init(cls, target_url, username, password,timeout=10):
        cls.target_url = target_url
        cls.username = username
        cls.password = password
        cls.timeout = timeout
        cls.req_fetcher = RespFetcher(username=username,
                password=password, url=target_url)

    @classmethod
    def send_cmd_int(cls, cmd, msg_type):
        '''Construct NX-API message. Send commands through NX-API. Only single 
           command for show commands. Internal usage'''
        if msg_type == "cli_show" or msg_type == "cli_show_ascii":
            if " ;" in cmd:
                raise cmd_exec_error("Only single show command supported in internal api")

        req_msg_str = cls.req_obj.get_req_msg_str(msg_type=msg_type,
                input_cmd=cmd, out_format=cls.out_format,
                do_chunk=cls.do_chunk, sid=cls.sid)
        (resp_headers, resp_str) = \
            cls.req_fetcher.get_resp(req_msg_str, cls.cookie,
                cls.timeout)

        if 'Set-Cookie' in resp_headers:
            cls.cookie = resp_headers['Set-Cookie']
        content_type = resp_headers['Content-Type']
        root = etree.fromstring(resp_str)
        body = root.findall('.//body')
        code = root.findall('.//code')
        msg = root.findall('.//msg')

        output = ""
        status = 0
        if len(body) != 0:
            if msg_type == 'cli_show':
                output = etree.tostring(body[0].decode())
            else:
                output = body[0].text

        if output == None:
            output = ""
        if code[0].text == "200":
            status = 0
        else:
            status = int(code[0].text)
        return [output, status, msg[0].text]

    @classmethod
    def send_cmd(cls, cmd, msg_type):
        '''Construct NX-API message. Send commands through NX-API. Multiple 
           commands okay'''
        req_msg_str = cls.req_obj.get_req_msg_str(msg_type=msg_type,
                input_cmd=cmd, out_format=cls.out_format,
                do_chunk=cls.do_chunk, sid=cls.sid)
        (resp_headers, resp_str) = \
            cls.req_fetcher.get_resp(req_msg_str, cls.cookie,
                cls.timeout)
        if 'Set-Cookie' in resp_headers:
            cls.cookie = resp_headers['Set-Cookie']
        content_type = resp_headers['Content-Type']
        root = etree.fromstring(resp_str)
        body = root.findall('.//body')
        code = root.findall('.//code')
        msg = root.findall('.//msg')

        # Any command execution error will result in the entire thing fail
        # This is to align with vsh multiple commands behavior
        if len(code) == 0:
            raise unexpected_error("Unexpected error")
        for i in range(0, len(code)):
            if code[i].text != "200":
                raise cmd_exec_error("Command execution error: {0}".format(msg[i].text))

        output = ""
        if msg_type == 'cli_show':
            for i in range(0, len(body)):
                output += etree.tostring(body[i]).decode()
        else:
            for i in range(0, len(body)):
                if body[i].text is None:
                    continue
                else:
                    output += body[i].text
        return output

    @classmethod
    def cli(cls, cmd):
        '''Run cli show command. Return show output'''
        try:
            output = cls.send_cmd(cmd, "cli_show_ascii")
            return output
        except:
            raise

    @classmethod
    def clip(cls, cmd):
        '''Run cli show command. Print show output'''
        try:
            output = cls.send_cmd(cmd, "cli_show_ascii")
            print(output)
        except:
            raise

    @classmethod
    def clic(cls, cmd):
        '''Run cli configure command. Return configure output'''
        try:
            output = cls.send_cmd(cmd, "cli_conf")
            return output
        except:
            raise

    @classmethod
    def clid(cls, cmd):
        '''Run cli show command. Return JSON output. Only XMLized commands 
           have outputs'''
        if " ;" in cmd:
            raise cmd_exec_error("Only single command is allowed in clid()")
        try:
            output = cls.send_cmd(cmd, "cli_show")
            o = xmltodict.parse(output)
            json_output = json.dumps(o["body"])
            return json_output
        except:
            raise


class NXAPI(object):
    '''A better NX-API utility'''
    def __init__(self):
        self.target_url = ''
        self.username = ''
        self.password = ''
        self.timeout = ''

        self.ver = '0.1'
        self.msg_type = 'cli_show'
        self.cmd = 'show version'
        self.out_format = 'xml'
        self.do_chunk = '0'
        self.sid = 'sid'
        self.cookie = 'no-cookie'

    def set_target_url(self, target_url=None):
        self.target_url = target_url

    def set_username(self, username='admin'):
        self.username = username

    def set_password(self, password='admin'):
        self.password = password

    def set_timeout(self, timeout=0):
        if timeout < 0:
            raise data_type_error('timeout should be greater than 0')
        self.timeout = timeout

    def set_cmd(self, cmd=''):
        self.cmd = cmd

    def set_out_format(self, out_format='xml'):
        if out_format != 'xml' and out_format != 'json':
            raise data_type_error('out_format xml or json')
        self.out_format = out_format

    def set_do_chunk(self, do_chunk='0'):
        if do_chunk != 0 and do_chunk != 1:
            raise data_type_error('do_chunk 0 or 1')
        self.do_chunk = do_chunk

    def set_sid(self, sid='sid'):
        self.sid = sid

    def set_cookie(self, cookie='no-cookie'):
        self.cookie = cookie

    def set_ver(self, ver='0.1'):
        if ver != '0.1':
            raise data_type_error('Only ver 0.1 supported')
        self.ver = ver

    def set_msg_type(self, msg_type='cli_show'):
        if msg_type != 'cli_show' and msg_type != 'cli_show_ascii' \
            and msg_type != 'cli_conf' and msg_type != 'bash':
            raise data_type_error('msg_type incorrect')
        self.msg_type = msg_type

    def get_target_url(self):
        return self.target_url

    def get_username(self):
        return self.username

    def get_password(self):
        return self.username

    def get_timeout(self):
        return self.timeout

    def get_cmd(self):
        return self.cmd

    def get_out_format(self):
        return self.out_format

    def get_do_chunk(self):
        return self.do_chunk

    def get_sid(self):
        return self.sid

    def get_cookie(self):
        return self.cookie

    def req_to_string(self):
        req_msg = '<?xml version="1.0" encoding="ISO-8859-1"?>\n'
        req_msg += '<ins_api>\n'
        req_msg += '<type>' + self.msg_type + '</type>\n'
        req_msg += '<version>' + self.ver + '</version>\n'
        req_msg += '<chunk>' + self.do_chunk + '</chunk>\n'
        req_msg += '<sid>' + self.sid + '</sid>\n'
        req_msg += '<input>' + self.cmd + '</input>\n'
        req_msg += '<output_format>' + self.out_format + '</output_format>\n'
        req_msg += '</ins_api>\n'
        return req_msg

    def send_req(self):
         req = RespFetcher(self.username, self.password, self.target_url)
         return req.get_resp(self.req_to_string(), self.cookie, self.timeout)
