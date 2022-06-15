from BaseItem import BaseItem

__author__  = "Cedric Le Roux"
__version__ = "1.0.0"
__email__   = "cleroux@splunk.com"

class Snort(BaseItem):

    def parse(self):
	return self.generic_parser()

