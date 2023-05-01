from pysnmp import nextid
from pysnmp.proto import error

class Cache:
    __stateReference = nextid.Integer(0xffffff)
    def __init__(self):
        self.__cacheEntries = {}

    def push(self, **securityData):
        stateReference = self.__stateReference()
        self.__cacheEntries[stateReference] = securityData
        return stateReference
    
    def pop(self, stateReference):
        if stateReference in self.__cacheEntries:
            securityData = self.__cacheEntries[stateReference]
        else:
            raise error.ProtocolError(
                'Cache miss for stateReference=%s at %s' %
                (stateReference, self)
                )
        del self.__cacheEntries[stateReference]
        return securityData
