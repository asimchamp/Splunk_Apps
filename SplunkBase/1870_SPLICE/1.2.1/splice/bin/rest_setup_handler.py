import splunk.admin as admin
import splunk.entity as en

class ConfigApp(admin.MConfigHandler):
	'''
	Set up supported arguments
	http://wiki.splunk.com/Create_setup_screen_using_a_custom_endpoint
	'''
	CONF_FILE   = "splice" # splice.conf
	STANZA_NAME = "splice" # [splice]

	def setup(self):
		if self.requestedAction == admin.ACTION_EDIT or self.requestedAction == admin.ACTION_CREATE:
			#for arg in ['field_1', 'field_2_boolean', 'field_3']:
			for arg in ['mongo_connection_uri']:
				self.supportedArgs.addOptArg(arg)

	'''
	Read the initial values of the parameters from the custom file CONF_FILE.conf
	and write them to the setup screen.

	If the app has never been set up, uses <appname>/default/CONF_FILE.conf. 
	If app has been set up, looks at local/CONF_FILE.conf first, then looks at 
	default/CONF_FILE.conf only if there is no value for a field in local/CONF_FILE.conf

	For boolean fields, may need to switch the true/false setting
	For text fields, if the conf file says None, set to the empty string.
	'''
	def handleList(self, confInfo):

		confDict = self.readConf( self.CONF_FILE )
		if None != confDict:
			for stanza, settings in confDict.items():
				for key, val in settings.items():

					if key in ['mongo_connection_uri'] and val in [None, '']:
						val = ''

					confInfo[stanza].append(key, val)

	'''
	After user clicks Save on setup screen, take updated parameters, normalize them, and 
	save them somewhere
	'''
	def handleEdit(self, confInfo):
		name = self.callerArgs.id
		args = self.callerArgs

		if self.callerArgs.data['mongo_connection_uri'][0] in [None, '']:
				self.callerArgs.data['mongo_connection_uri'][0] = '' 

		'''
		Since we are using a conf file to store parameters, write them to the stanza
		in <appname>/local/splice.conf  
		'''	
		self.writeConf(self.CONF_FILE, self.STANZA_NAME, self.callerArgs.data)
			
# initialize the handler
admin.init(ConfigApp, admin.CONTEXT_NONE)

