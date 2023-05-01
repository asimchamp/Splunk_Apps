
class SPLIndicator(object):
    """
    {'indicator_id':'53cd2b56eaa76e73eed83521', 'type':'value', 'value_type':'ipv4-addr', 'value':'192.168.0.5'},
    {'indicator_id':'53cd2b56eaa76e73eed8352d', 'type':'regex', 'value_type':'ipv4-addr', 'value':'192\.168\.1\.(0|1|2)'},
    {'indicator_id':'53cd2b56eaa76e73eed83526', 'type':'regex', 'value_type':'ipv6-addr', 'value':'2001:0db8:0000:0000:0000:ff00:0042:832[0-9]' },
    {'indicator_id':'53cd2b56eaa76e73eed83527', 'type':'value', 'value_type':'ipv6-addr', 'value':'2607:f0d0:1002:51::4'},
    {'indicator_id':'53cd2b56eaa76e73eed8352b', 'type':'value', 'value_type':'domain', 'value':'example.com'},
    {'indicator_id':'53cd2b56eaa76e73eed83533', 'type':'regex', 'value_type':'domain', 'value':'^mega'},
    {'indicator_id':'53cd2b56eaa76e73eed8352e', 'type':'value', 'value_type':'url', 'value':'http://example.com/index1.html'}, 
    {'indicator_id':'53cd2b56eaa76e73eed83533', 'type':'value', 'value_type':'url', 'value':'http://www.msn.com/?ocid=hmlogout'},
    """

    # SPLIndicator(indicator_id, type='value', value_type='ipv4-addr', value='192.168.0.5')
    def __init__(self, indicator_id=None, type=None, value_type=None, value=None, ioc_id=None, raw_id=None, enabled=True):
	self.indicator_id = indicator_id

	self.type       = type
	self.value_type = value_type
	self.value      = value

	self.ioc_id = ioc_id # exposed but not currently used
	self.raw_id = raw_id # exposed but not currently used

	self.enabled = enabled

    def to_dict(self):
	o = {}
	for (k,v) in self.__dict__.iteritems():
		o[ k ] = v
	return o

    def set_ioc_id(self, id):
	self.ioc_id = id
    
    def set_raw_id(self, id):
	self.raw_id = id

    def set_value_type(self, v):
	self.value_type = v
    def get_value_type(self):
	return self.value_type

