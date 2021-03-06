# Description: IPFIX data parser.
# Created by: Matthew Gao
# Copyright 2013 Dell, Inc.

from struct import *
import sys

class DataManager:
    def __init__(self, output = sys.stdout, error = sys.stderr):
        self.resultList=[]
        self._msghdr_st=Struct("!HHLLL")
        self._sethdr_st = Struct("!HH")
        self._out = output
        self._err = error
        
    def parseHdr(self,message):
        
        offset=0
        lens=self._msghdr_st.size
        
        try:
            mbuf=message[offset:offset+lens]
            (version, length, sequence, export_epoch, odid)\
                  =self._msghdr_st.unpack_from(mbuf,0)
        except Exception as e:
            self.log("DataManager - Error",e)
            return None
        
        offset=self._msghdr_st.size+offset
        lens=self._sethdr_st.size
        
        try:
            mbuf=message[offset:offset+lens]
            (setID,setLen)=self._sethdr_st.unpack_from(mbuf,0)
        except Exception as e:
            self.log("DataManager - Error",e)
            return None
        return (version, length, sequence, export_epoch, odid, setID, setLen)
        
    def parseDate(self,message,TmpId,setLen,fmtMap):

        offset=self._msghdr_st.size+self._sethdr_st.size
        length=setLen+self._msghdr_st.size
        
        if fmtMap.has_key(TmpId) is False:
            self.log("DataManager - Warning","Unknown template ID: "+str(TmpId))
            return None
        
        #print fmtMap[TmpId]
        _msg_st=Struct(fmtMap[TmpId])
        lens=_msg_st.size
        try:
            while length>=(offset+lens):
                mbuf=message[offset:offset+lens]
                rrr=_msg_st.unpack_from(mbuf,0)
                self.resultList.append(rrr)
                offset=offset+lens
                
        except Exception as e:
            self.log("DataManager - Error",e)
            return None
        return self.resultList
        
    def log(self, severity, message):
        """Logs messages about the state of this modular input to Splunk.
        These messages will show up in Splunk's internal logs.

        :param severity: ``string``, severity of message, see severites defined as class constants.
        :param message: Message to log.
        """

        self._err.write("%s %s\n" % (severity, message))
        self._err.flush()
