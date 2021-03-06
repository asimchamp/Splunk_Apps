"""
External search command for reading data from HDFS. 

Usage:
  |hdfs <directive> (<hdfs-path>)+ <directive-options>| ... <other splunk commands here> ...
  directives:
  ls    - list the contents of the given hdfs path(s)
  lsr   - recursively list the contents of the given hdfs path(s)
  read  - read the contents of a given file
  rm    - remove the given path
  rmr   - recursively remove the given path (dir) 
   
"""

import csv,sys,time
import splunk.util, splunk.Intersplunk as isp
import urlparse
from hadooputils import * 
from constants import *
from util import *

try:
    from cStringIO import StringIO
except:
    from StringIO import StringIO


def csv_escape(s):
    return s.replace('"', '""')

class HDFSSearchCommand:
    def __init__(self, outputfile=sys.stdout):
        self.directives = {'ls': self.handle_ls, 'lsr' : self.handle_lsr, 'read': self.handle_read} #, 'rmr': self.handle_rmr, 'rm': self.handle_rm}
        self.raiseAll = True           
        self.messages = {}
        self.keywords = []
        self.settings = {}
        self.info     = SearchResultsInfo() # we'll read this if splunk passes it along
        self.output_chunk_size = 64*1024
        self.outputfile = outputfile
        self.clusters   = {}

    def _addMessage(self, msgType, msg):
        #msg = "HCERR1007: Error in 'hdfs' command: " + msg
        msg = "Error in 'hdfs' command: " + msg
        if msgType in self.messages:
           self.messages[msgType].append(msg)
        else:
           self.messages[msgType] = [msg]
           
        self.info.addMessage(msgType, msg)

        if msgType == 'WARN':
           logger.warn(msg)
        elif msgType == 'ERROR':
           logger.error(msg)

    def _validateURI(self, uri):
        if len(self.clusters) == 0:
            msg = None
            #1. hit the clusters endpoint 
            import splunk.entity as entity
            try:
                self.clusters = entity.getEntities('admin/clusters', namespace=self.namespace, owner=self.owner, sessionKey=self.sessionKey)
            except Exception as e:
                logger.exception('Failed to get entities admin/clusters')
                msg = str(e)
                if isinstance(e, splunk.RESTException):
                    msg = e.get_extended_message_text()
            if msg != None:
                raise HcException(HCERR2002, {'entity_path':'admin/clusters', 'search':'', 'uri':'', 'error':msg})
        
        found = False
        for name, cluster in self.clusters.items():
            cluster_uri = cluster.get('uri', '')
            if cluster_uri == '':
               continue
            if not uri.startswith(cluster_uri):
               continue
            found = True
            break

        if not found:
           raise HcException(HCERR1005, {'uri':uri})       
    
    def createHDFSDirLister(self):
        return HDFSDirLister(self.raiseAll)
    
    def _list_files (self, base_path, file_re):
        result = []
        hdfs_uri = ''
	    
        # find hdfs uri
        if base_path.startswith('hdfs://'):
            fs = base_path[8:].find('/')
            if fs > 0:
                hdfs_uri = base_path[:8+fs] 

        hls = self.createHDFSDirLister()
        # process the output of lsr - add absolute paths to results
        for f in hls.lsr(base_path):
            if f.isdir(): 
                continue
            if not file_re.search(f.path):
                continue 
            result.append(hdfs_uri + f.path)

        # we get here iff self.raiseAll == False and there was an error
        if hls.error:
            self._addMessage('WARN', hls.error)

        return result

    def streamResults(self, body_str, outputfile=sys.stdout):
           header_str = ''
           header_io = StringIO()
           self.info.serializeTo(header_io)
           header_str = header_io.getvalue()
           outputfile.write("splunk %s,%u,%u\n" % ("4.3", len(header_str), len(body_str)))
           outputfile.write(header_str)
           outputfile.write(body_str)

    def createHadoopCliJob(self, path):
        return HadoopEnvManager.getCliJob(path)
        
    
    def _read_hdfs_file( self, absfile, delim=None, fields=None):
        body_io = StringIO()
        w = csv.writer(body_io)
        result_count = 0

        hj = self.createHadoopCliJob(absfile)
      
        # make sure path exists and it's a file and no wildcard
        if absfile.find('*') >= 0:
           raise HcException(HCERR1008, {'path':absfile})
        if not hj.exists(absfile):
           raise HcException(HCERR0016, {'path':absfile})
        if hj.isDir(absfile):
           raise HcException(HCERR1006, {'dir':absfile})
          
        hj.text(absfile) # this will read .gz files as well
	    
        cols = ['_raw', 'source', 'host'] 
        need_header = True
        
        delim = None if (delim != None and len(delim) == 0) or fields == None else delim
        if delim != None:
           cols.extend(fields)

        p = urlparse.urlparse(absfile) 

        escaped_path = csv_escape(p.path)
        escaped_host = csv_escape(p.netloc)	 
        
        for line in hj.getStdout():  
            if need_header:
                w.writerow(cols)
                need_header = False
            
            line = line.strip() 
            if len(line) == 0:
               continue            

            # csv escape and write each row individually
            body_io.write('"') 
            body_io.write(csv_escape(line))
            body_io.write('","') 
            body_io.write(escaped_path) 
            body_io.write('","') 
            body_io.write(escaped_host) 
        
            # try to parse (jsut split) the line based on delimiter 
            if delim != None:
               parts = line.split(delim)
               # make sure parts contains at least as many entries as fields
               tmp = len(parts)
               while tmp < len(fields):
                   parts.append('')
                   tmp +=1
                
               for p in parts[:len(fields)]:
                  body_io.write('","')
                  body_io.write(csv_escape(p))     

            body_io.write('"\n') 
            result_count += 1

            # check to see if we need to flush the buffer out
            if body_io.tell() >= self.output_chunk_size:
                self.streamResults(body_io.getvalue(), self.outputfile)
                body_io.truncate(0)
                result_count = 0
                need_header = True

        # flush any remaining result
        if result_count > 0 :
            self.streamResults(body_io.getvalue(), self.outputfile)

        # ensures we don't leave defunct processes around
        hj.wait(True)

    def _list_dir(self, absfile, recursive=True):
        body_io = StringIO()
        w = csv.writer(body_io)
        result_count = 0

        hls = self.createHDFSDirLister()

        #TODO: handle other data formats here (csv, json, etc)
        cols = ['type', 'acl', 'replication', 'size', 'user', 'group', 'date', 'time', 'path', 'source', '_time', '_raw']
        need_header = True

        # CLI complains when doing hadoop fs -ls hdfs://namenode:8020 (without a trailing /)
        if(absfile.startswith('hdfs://') and absfile.count('/') == 2 and not absfile.endswith('/')):
           absfile += '/' 

        gen = hls.lsr(absfile) if recursive else  hls.ls(absfile)

        for f in gen:

		   if need_header:
		      w.writerow(cols)
		      need_header = False

                   #2009-10-05 23:23"
                   ft = time.time()
                   try:
                       ft = time.mktime(time.strptime(f.date + ' ' +  f.time, '%Y-%m-%d %H:%M'))
                   except:
                       pass
                   raw = f.path
		   r = ["dir" if f.isdir() else "file", f.acl, f.replication, f.size, f.user, f.group, f.date, f.time, f.path, absfile, ft, raw]
		   w.writerow(r)
		   result_count += 1

		   # check to see if we need to flush the buffer out
		   if body_io.tell() >= self.output_chunk_size:
		      self.streamResults(body_io.getvalue(), self.outputfile)
		      body_io.truncate(0)
		      result_count = 0
		      need_header = True

	    # flush any remaining result
        if result_count > 0 :
		self.streamResults(body_io.getvalue(), self.outputfile)

        if hls.error and not self.raiseAll:
               self._addMessage('WARN', hls.error)

    def handle_ls(self):
        for p in self.keywords:
            self._list_dir(unquote(p, unescape=True), False)

    def handle_lsr(self):
        for p in self.keywords:
            self._list_dir(unquote(p, unescape=True), True)

    def handle_rmr(self):
        for p in self.keywords:
            hj = self.createHadoopCliJob(p)
            hj.rmr(p)

    def handle_rm(self):
        for p in self.keywords:
            hj = self.createHadoopCliJob(p)
            hj.rm(p)

    def handle_read(self):
        delim   = unquote(self.argvals.get('delim', '')).decode('string_escape')  # converts \t -> tab
        fields  = [x.strip()  for x in unquote(self.argvals.get('fields', '')).split(",") ]
        for p in self.keywords:
            try:
                self._read_hdfs_file(unquote(p, unescape=True), delim, fields)
            except Exception, e:
                 if self.raiseAll:
                    raise
                 msg = toUserFriendlyErrMsg(e)
                 self._addMessage('WARN', msg)                        

    def _main_impl(self):
        if len(self.keywords) == 0:
	       raise HcException(HCERR0505)

        d = self.keywords.pop(0)
        if not d in self.directives:
	       raise HcException(HCERR0506, {'directive':d, 'accepted_values':','.join(self.directives.keys())}) 

        if len(self.keywords) == 0:
	       raise HcException(HCERR0501, {'argument':'uri'})

        for k in self.keywords:
            self._validateURI(k)
            if k.startswith('file://'):
                  k = k[7:] 
            elif not k.startswith('hdfs://'):
                raise HcException(HCERR0503, {'name':'uri', 'value':k, 'accepted_values':'hdfs://<path>'})

        self.directives[d]()

    def main(self):
           results, dummyresults, self.settings = isp.getOrganizedResults()
           self.keywords, self.argvals = isp.getKeywordsAndOptions()

           # in Splunk pre 5.0 we don't get the info, so we just read it from it's standard location
           infoPath = self.settings.get('infoPath', '')
           if len(infoPath) == 0:
              infoPath = os.path.join(getDispatchDir(self.settings.get('sid'), self.settings.get('sharedStorage', None)), 'info.csv')
           self.info.readFrom(infoPath)


           self.raiseAll = splunk.util.normalizeBoolean(unquote(self.argvals.get('raiseall', 'f')))
           self.sessionKey = self.settings.get('sessionKey', None)
           self.owner      = self.settings.get('owner',      None)
           self.namespace  = self.settings.get('namespace',  None)
           self.krb5_principal = unquote(self.argvals.get('kerberos_principal', '')).strip()


           if len(self.krb5_principal) == 0:
              self.krb5_principal = None
           HadoopEnvManager.init(APP_NAME, 'nobody', self.sessionKey, self.krb5_principal)

           self._main_impl()

if __name__ == '__main__':
   rv   = 0
   hdfs = HDFSSearchCommand()     
   #TODO: improve error messaging, here - right now the messages just go to search.log 
   try:
         hdfs.main()
   except Exception, e:
         logger.exception('Failed to run hdfs command')
         import traceback
         stack =  traceback.format_exc()

         if hdfs.info != None:
            msg = toUserFriendlyErrMsg(e) 
            #msg = "HCERR1007: Error in 'hdfs' command: " + msg
            msg = "Error in 'hdfs' command: " + msg
            hdfs.info.addErrorMessage(msg)
            logger.error("sid=%s, %s\nTraceback: %s" % (hdfs.settings.get('sid', 'N/A'), str(e), str(stack)))
         else:
            print "ERROR %s" % str(e).replace('\n', '\\n')
         print >> sys.stderr, "ERROR %s\nTraceback: %s" % (str(e), str(stack))
         rv = 1
   finally:
        try:
            if hdfs.info != None:
               hdfs.streamResults('') # just write out the info
        except Exception, e:
            logger.exception("Failed to update search result info")
   sys.exit(rv)



