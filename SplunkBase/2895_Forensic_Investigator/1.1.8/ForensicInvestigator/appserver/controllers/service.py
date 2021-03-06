import logging
import os
import sys
import json
import cherrypy
import splunk
import splunk.appserver.mrsparkle.controllers as controllers
import splunk.appserver.mrsparkle.lib.util as util
import splunk.util
import splunk.clilib.cli_common
import shutil
from splunk.appserver.mrsparkle.lib.decorators import expose_page
from splunk.appserver.mrsparkle.lib.routes import route
from splunk.appserver.mrsparkle.lib import jsonresponse
#hashing a GoGo
import hashlib


logger = logging.getLogger('splunk')
settings = splunk.clilib.cli_common.getConfStanza('filehasher', 'directories')
savepath = settings['savepath']
pendingPath = settings['temppath']

class service(controllers.BaseController):

    def render_json(self, response_data, set_mime="text/json"):
        cherrypy.response.headers["Content-Type"] = set_mime
        if isinstance(response_data, jsonresponse.JsonResponse):
            response = response_data.toJson().replace("</", "<\\/")
        else:
            response = json.dumps(response_data).replace("</", "<\\/")
        return " " * 256  + "\n" + response
   
    @route('/:action=list')
    @expose_page(must_login=True, methods=['GET','POST'])
    def list(self, **kwargs):
        md5Hash = hashlib.md5()
        sha1Hash = hashlib.sha1()
        sha2Hash = hashlib.sha256()
        sha5Hash = hashlib.sha512()
        files = []        
        if os.path.exists(savepath):
            savedFiles = os.listdir(savepath)
        else:
            savedFiles = []
            
        for fname in savedFiles:
            size=0
            saveFile=os.path.join(savepath, fname)
            isFile = os.path.isfile(saveFile)
            if(isFile and fname[0] != '.'):
                size = os.path.getsize(saveFile)
        #hashing begin!
        with open(saveFile, 'rb') as aFile:
            buffer = aFile.read()
            md5Hash.update(buffer)
            sha1Hash.update(buffer)
            sha2Hash.update(buffer)
            sha5Hash.update(buffer)
        md5Value = md5Hash.hexdigest()
        sha1Value = sha1Hash.hexdigest()
        sha2Value = sha2Hash.hexdigest()
        sha5Value = sha5Hash.hexdigest()
        files.append({'name': fname, 'size': size, 'md5': md5Value, 'sha1': sha1Value, 'sha2': sha2Value, 'sha5' : sha5Value, 'isFile': isFile, 'finished': True })

        if os.path.exists(pendingPath):
            pendingFiles = os.listdir(pendingPath)
        else:
            pendingFiles = []
        
        for fname in pendingFiles:
            size=0
            isFile = os.path.isfile(os.path.join(pendingPath, fname))
            pendingFolder = os.path.join(pendingPath, fname)
            if(not isFile and fname[0] != '.'):
                chunks = os.listdir(pendingFolder)
                size = 0
                parts = 0
                for chunk in chunks:
                    try:
                        chunkNumber = int(chunk[chunk.rfind('.')+1:])
                    except:
                        chunkNumber = -1
                    
                    if(chunkNumber>0):
                        chunkPath = os.path.join(pendingFolder, chunk)
                        if(os.path.isfile(chunkPath) and chunk[0] != '.'):
                            parts = parts + 1
                            size = size + os.path.getsize(chunkPath)
                            fname = chunk[:chunk.rfind('.')]
                                
                if(fname):
                    files.append({'name': fname, 'size': size, 'isFile': isFile, 'finished': False, 'parts': parts })
        
        return self.render_json(files)

    @route('/:action=remove/:fname')
    @expose_page(must_login=True, methods=['GET','POST'])
    def remove(self, fname, **kwargs):
        
        os.remove(os.path.join(savepath,fname))
        return self.render_json(fname)
    
    @route('/:action=removeall')
    @expose_page(must_login=True, methods=['GET','POST'])
    def removeall(self, **kwargs):
        if os.path.exists(savepath):
            logger.warn('purge uploaded files '+ savepath)
            shutil.rmtree(savepath)
            
        return self.render_json([0])
    
    @route('/:action=removepending')
    @expose_page(must_login=True, methods=['GET','POST'])
    def removepending(self, **kwargs):
        if os.path.exists(pendingPath):
            logger.warn('purge pending files '+ pendingPath)
            shutil.rmtree(pendingPath)
            
        return self.render_json([0])
