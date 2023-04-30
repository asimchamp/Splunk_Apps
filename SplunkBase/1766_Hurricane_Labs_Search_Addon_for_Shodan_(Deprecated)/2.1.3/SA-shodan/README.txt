Tested up to 6.6.2 Not tested below 6.0

Hurricane Labs App for Shodan allows you to search Shodan for relevant information about your hosts. 

REQUIREMENTS: You must purchase an API key from Shodan (https://www.shodanhq.com/) before using this app.

UPDATES:
- API key now stored in encrypted credential storage. This change requires the user running the shodan command to be able to decrypt passwords. If the user you'd like to use the app with does not have the "admin_all_objects" role, you will need to give them the "list_storage_passwords" capability.
- Cleaned up other issues found running app inspect.
- Removed Requests library as it was not needed.

SUPPORT:
- This app is developer supported by Hurricane Labs. 
- You can send any inquiries / comments / bugs to splunk-app@hurricanelabs.com
- Response should be relatively fast if emails are sent between 9am-5pm (Eastern)