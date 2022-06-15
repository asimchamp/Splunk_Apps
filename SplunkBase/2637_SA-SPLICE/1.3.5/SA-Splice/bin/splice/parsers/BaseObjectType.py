
class BaseObjectType(object):
    """
    This is the default base class for STIX/CybOX Objects.
    Every parsers for STIX/CybOX objects must implement it.
    """
    log_messages = {}
    number_of_log_messages = 0
    
    def __init__(self, object_id=None, properties=None):
	self.object_id  = object_id
	self.properties = properties

    def log(self, severity, message):
	"""
	provide a simple logger to modules. severity should be INFO, WARNING, ERROR or DEBUG.
	"""
	self.log_messages[ self.number_of_log_messages ] = (severity, "(object_id=\"%s\") %s" % (self.object_id,message))
	self.number_of_log_messages += 1

    def parse(self):
	raise NotImplementedError('the parse() method is required in every modules')

