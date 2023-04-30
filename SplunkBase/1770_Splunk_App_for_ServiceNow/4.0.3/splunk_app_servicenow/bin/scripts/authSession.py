import urllib, urllib2
import splunk.entity as entity

# access the credentials in /servicesNS/nobody/<YourApp>/storage/passwords
def getCredentials(sessionKey):
	myapp = 'snow'
	try:
		# list all credentials
		entities = entity.getEntities(['admin', 'passwords'], namespace=myapp, 
                                    owner='nobody', sessionKey=sessionKey) 
	except Exception, e:
		raise Exception("Could not get %s credentials from splunk. Error: %s" 
                      % (myapp, str(e)))

	# return first set of credentials
   	for i, c in entities.items(): 
        	return c['username'], c['clear_password']

		raise Exception("No credentials have been found")  

