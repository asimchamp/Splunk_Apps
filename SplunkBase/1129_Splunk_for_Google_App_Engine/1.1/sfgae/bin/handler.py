import splunk.admin as admin

class ConfigApp(admin.MConfigHandler):
  '''
  set supported arguments
  '''
  def setup(self):
    if self.requestedAction == admin.ACTION_EDIT:
      for arg in ['app', 'version']:
        self.supportedArgs.addOptArg(arg)
        
  '''
  load current settings
  '''
  def handleList(self, confInfo):
    confDict = self.readConf('sfgae')
    if confDict != None:
      for stanza, settings in confDict.items():
        for key, val in settings.items():
          confInfo[stanza].append(key, val)
          
  '''
  Save settngs
  '''
  def handleEdit(self, confInfo):
      self.writeConf('sfgae', 'sfgae_entity', self.callerArgs.data)
      
# initialize the handler
admin.init(ConfigApp, admin.CONTEXT_NONE)