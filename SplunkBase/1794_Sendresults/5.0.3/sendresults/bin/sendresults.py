###############################################################################
###############################################################################
##
##  SENDRESULTS - a splunk email command
##
##  Discovered Intelligence
##  https://discoveredintelligence.ca
##
##  For support contact:
##  support@discoveredintelligence.ca
##
###############################################################################
###############################################################################

import sys, os, string, shutil, socket
import random
import time
import json
from collections import defaultdict
import splunk.Intersplunk # pylint: disable=F0401
import splunk.entity as entity # pylint: disable=F0401
from splunk.rest import simpleRequest # pylint: disable=F0401
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email import encoders, utils
import logging as logger

## Create a unique identifier for this invocation
NOWTIME         = time.time()
SALT            = random.randint(0, 100000)
INVOCATION_ID   = str(NOWTIME) + ':' + str(SALT)
INVOCATION_TYPE = "command"

###############################################################################
#
# Function:   getAlternateCredentials
#
# Descrition: This function calls the Splunk REST API to get the SMTP credentials
#             Using the "show_password" way :(
#
# Arguments:
#    sessionKey - key used to authenticate with Splunk
#
###############################################################################

def getAlternateCredentials(sessionKey):
    try:
        uri = 'admin/alert_actions/email'

        # Need to send a POST with show_password flag set to True to get user/pass
        response, content = simpleRequest(uri, method='POST', postargs={'show_password': True, 'output_mode': 'json'}, sessionKey=sessionKey)

        # invalid server response status check
        if response['status']!='200':
            logger.error('getCredentials - unable to retrieve credentials; check simpleRequest response')
            return None

        # parse credentials from the returned response
        contentJson = json.loads(content)
        userCredentials = contentJson['entry'][0]['content']

        auth_username  = userCredentials.get('auth_username')
        clear_password = userCredentials.get('clear_password')

        # set the user/pass if found
        if (len(auth_username) and len(clear_password)):
            return auth_username, clear_password

    except Exception as e:
        logger.error("Could not get email credentials from splunk, using no credentials. Error: %s" % (str(e)))

    return '', ''

###############################################################################
#
# Function:   getCredentials
#
# Descrition: This function calls the Splunk REST API to get the SMTP credentials
#             Handles pre-8.0.5 and 8.1.1+ methods.
#
# Arguments:
#    sessionKey - key used to authenticate with Splunk
#    namespace - Splunk namespace value for the REST API
#
###############################################################################

def getCredentials(sessionKey, namespace):
   try:
      # Retreive the email alert action settings
      ent = entity.getEntity('admin/alert_actions', 'email', namespace=namespace, owner='nobody', sessionKey=sessionKey)
      if 'auth_username' in ent and 'clear_password' in ent:
          # This is pre-Splunk changing how the password is stored
          if (not ent['clear_password'].startswith('$1$') and not ent['clear_password'].startswith('$7$')):
              return ent['auth_username'], ent['clear_password']
          else:
            # This is the 8.1.1+ way to get the password
            encrypted_password = ent['clear_password']
            splunkhome = os.environ.get('SPLUNK_HOME')
            if splunkhome == None:
                logger.error('getCredentials - unable to retrieve credentials; SPLUNK_HOME not set')
                return None
            # if splunk home has white spaces in path
            splunkhome='\"' + splunkhome + '\"'
            if sys.platform == "win32":
                encr_passwd_env = "\"set \"ENCRYPTED_PASSWORD=" + encrypted_password + "\" "
                commandparams = ["cmd", "/C", encr_passwd_env, "&&", os.path.join(splunkhome, "bin", "splunk"), "show-decrypted", "--value", "\"\"\""]
            else:
                encr_passwd_env = "ENCRYPTED_PASSWORD='" + encrypted_password + "'"
                commandparams = [encr_passwd_env, os.path.join(splunkhome, "bin", "splunk"), "show-decrypted", "--value", "''"]
            command = ' '.join(commandparams)
            stream = os.popen(command)
            clear_password = stream.read()
            # the decrypted password is appended with a '\n'
            if len(clear_password) >= 1:
                clear_password = clear_password[:-1]
            return ent['auth_username'], clear_password
      elif 'auth_username' not in ent:
          # This is the weird 8.0.5-8.1.0 way of getting credentials
          username, password = getAlternateCredentials(sessionKey)
          return username, password
   except Exception as e:
      logger.error("Could not get email credentials from splunk, using no credentials. Error: %s" % (str(e)))

   return '', ''

###############################################################################
#
# Function:   getEmailAlertActions
#
# Descrition: This function calls the Splunk REST API to get the various alert
#             email configuration settings needed to send SMTP messages in the
#             way that Splunk does
#
# Arguments:
#    argvals  - hash of various arguments passed into the search.
#    settings - hash of various Splunk configuration settings.
#
###############################################################################

def getEmailAlertActions(argvals, settings):
    try:
        namespace  = settings.get("namespace", None)
        sessionKey = settings['sessionKey']
        ent = entity.getEntity('admin/alert_actions', 'email', namespace=namespace, owner='nobody', sessionKey=sessionKey)

        argvals['server'] = ent['mailserver']
        argvals['sender'] = ent['from']
        argvals['use_ssl'] = ent['use_ssl']
        argvals['use_tls'] = ent['use_tls']

        namespace  = settings.get("namespace", None)
        username, password = getCredentials(settings['sessionKey'], namespace)
        argvals['username'] = username
        argvals['password'] = password

    except Exception as e:
        logger.error('invocation_id=%s invocation_type="%s" msg="Could not get email alert actions from splunk" error="%s"' % (INVOCATION_ID,INVOCATION_TYPE,str(e)))
        raise

###############################################################################
#
# Function:   sendemail
#
# Descrition: This function sends a MIME encoded e-mail message using Splunk SMTP
#			  Settings.
#
# Arguments:
#    recipient - maps the the field 'email_to' in the event returned by Search.
#    bcc - adds additional email addresses to the message envelope.
#    subject - maps to the field 'subject' in the event returned by Search.
#    body - maps the field 'message' in the event returned by Search.
#    argvals - hash of various arguments needed to configure the SMTP connection etc.
#
###############################################################################

def sendemail(recipient, bcc, subject, body, argvals):

    server = getarg(argvals, "server", "localhost")
    sender = getarg(argvals, "sender", "splunk")
    use_ssl = toBool(getarg(argvals, "use_ssl"  , "false"))
    use_tls = toBool(getarg(argvals, "use_tls"  , "false"))
    username = getarg(argvals, "username"  , "")
    password = getarg(argvals, "password"  , "")

    # make sure the sender is a valid email address
    if (sender.find("@") == -1):
        sender = sender + '@' + socket.gethostname()

    if sender.endswith("@"):
        sender = sender + 'localhost'

    all_recipients = recipient.split(",") + bcc

    text = "Please view this email in HTML to see the content."

    # Create message wrapper. Ensure MIME encoded message is defined so that
    # e-mail message displays in HTML format on the receiving e-mail client.
    message = MIMEMultipart('alternative')
    message.preamble = 'This is a multi-part message in MIME format.'
    message.add_header('From', sender)
    message.add_header('To', recipient)
    message.add_header('Subject', subject)
    message.add_header('Date', utils.formatdate(localtime=True))
    message.add_header('X-Priority', "3")
    partHtml = MIMEText(body, 'html','utf-8')
    partText = MIMEText(text, 'plain','utf-8')
    # THIS ORDER MATTERS - rfc1341 7.2.3
    message.attach(partText)
    message.attach(partHtml)

    try:
        # send the mail
        if not use_ssl:
            smtp = smtplib.SMTP(server)
        else:
            smtp = smtplib.SMTP_SSL(server)
        if use_tls:
            smtp.ehlo()
            smtp.starttls()
        if len(username) > 0 and len(password) >0:
            smtp.login(str(username), str(password))
        smtp.sendmail(sender, all_recipients, message.as_string())
        smtp.quit()
        return
    except Exception as e:
        logger.error('invocation_id=%s invocation_type="%s" msg="Could not send email" rcpt="%s" error="%s"' % (INVOCATION_ID,INVOCATION_TYPE,all_recipients,str(e)))
        raise

# # Clear leading / trailing whitespace from recipients
# recipients = [r.strip() for r in recipients]
# validRecipients = []
# if ssContent.get('action.email.allowedDomainList') != "" and ssContent.get('action.email.allowedDomainList') != None:
#     domains = []
#     domains.extend(EMAIL_DELIM.split(ssContent['action.email.allowedDomainList']))
#     domains = [d.strip() for d in domains]
#     for recipient in recipients:
#         dom = recipient.partition("@")[2]
#         if not dom in domains:
#             logger.error("For subject=%s, email recipient=%s is not among the alowedDomainList=%s in alert_actions.conf file. Removing it from the recipients list."
#                          % (ssContent.get('action.email.subject'), recipient, ssContent.get('action.email.allowedDomainList')))
#         else:
#             validRecipients.append(recipient)
# else:
#     validRecipients = recipients

######################################################
######################################################
# Helper functions from a canonical splunk script.
#

def unquote(val):
    if val is not None and len(val) > 1 and val.startswith('"') and val.endswith('"'):
        return val[1:-1]
    return val

def toBool(strVal):
   if strVal == None:
       return False

   lStrVal = strVal.lower()
   if lStrVal == "true" or lStrVal == "t" or lStrVal == "1" or lStrVal == "yes" or lStrVal == "y" :
       return True
   return False

def getarg(argvals, name, defaultVal=None):
    return unquote(argvals.get(name, defaultVal))

######################################################
######################################################
#
# Main
#

logger.basicConfig(format='%(asctime)s %(levelname)s %(message)s', filename=os.path.join(os.environ['SPLUNK_HOME'],'var','log','splunk','sendresults.log'), filemode='a+', level=logger.INFO)

logger.info('invocation_id=%s invocation_type="%s" py_version=%s' % (INVOCATION_ID, INVOCATION_TYPE,str(sys.version_info)))

keywords, argvals  = splunk.Intersplunk.getKeywordsAndOptions()

default_format     = "table {font-family:Arial;font-size:12px;border: 1px solid black;padding:3px}th {background-color:#4F81BD;color:#fff;border-left: solid 1px #e9e9e9} td {border:solid 1px #e9e9e9}"

em_body_fromArg    = getarg(argvals, "body", "")
em_subject_fromArg = getarg(argvals, "subject", "")
em_sender_fromArg  = getarg(argvals, "sender", "")
em_footer_fromArg  = getarg(argvals, "footer", "")
maxrcpts           = int(getarg(argvals, "maxrcpts", "200"))
result_format      = getarg(argvals, "msgstyle", default_format)
format_columns     = getarg(argvals, "format_columns", "")
showemail          = toBool(getarg(argvals, "showemail", "true"))
showsubj           = toBool(getarg(argvals, "showsubj",  "true"))
showbody           = toBool(getarg(argvals, "showbody",  "true"))
showfooter         = toBool(getarg(argvals, "showfooter",  "true"))
showresults        = toBool(getarg(argvals, "showresults",  "true"))
bccresults         = getarg(argvals, "bcc", "")

exclude_cols = []
class_cols = {}

if format_columns.replace(' ','') != "":
    for col in format_columns.split(","):
        class_cols[col.replace(' ','')] = col.replace(' ','')+'-class'
        exclude_cols.append(col.replace(' ','')+'-class')

if bccresults == "":
    bcc = []
else:
    bcc = bccresults.split(",")

results = []
message = '<html>\n'
message += '<head>\n'
message += '<meta charset="UTF-8">\n'
message += '<title>Events Composing Alert</title>\n'
message += '<style>' + result_format + '</style>\n'
message += '</head>\n'
message += '<body>\n'

try:
    results,dummyresults,settings = splunk.Intersplunk.getOrganizedResults()
    getEmailAlertActions(argvals, settings)

    if em_sender_fromArg != "":
        argvals['sender'] = em_sender_fromArg

    recipient_list = defaultdict(list)
    event_list     = defaultdict(list)
    fields         = []
    missing_email  = 0
    header         = ""

    for event in results:
        if 'email_to' not in list(event.keys()):
            missing_email += 1
        else :
            if event['email_to'] not in list(recipient_list.keys()):

                if em_subject_fromArg != "" :
                    subj = em_subject_fromArg
                elif 'email_subj' in list(event.keys()) :
                    subj = event['email_subj']
                else :
                    subj = "Splunk Alert!"

                if em_body_fromArg != "" :
                    body = em_body_fromArg
                elif 'email_body' in list(event.keys()) :
                    body = event['email_body']
                else :
                    body = "You are receiving this e-mail because a set of sensitive events detected by a splunk search contained your e-mail as the responsible party. Auto-generated results compilation follows:"

                if em_footer_fromArg != "" :
                    footer = em_footer_fromArg
                elif 'email_footer' in list(event.keys()) :
                    footer = event['email_footer']
                else :
                    footer = ""

                recipient_list[event['email_to']] = {'email_subj': subj, 'email_body': body, 'email_footer': footer}

            event_list[event['email_to']].append(event)

            for key in list(event.keys()):
                if key not in fields :
                    if key in exclude_cols:
                        continue
                    if (not key.startswith("__mv_")) and (key != 'email_to' or showemail) and (key != 'email_subj' or showsubj) and (key != 'email_body' or showbody) and (key != 'email_footer' or showfooter):
                        fields.append(key)

    logger.info('invocation_id=%s invocation_type="%s" rcpts=%s maxrcpt=%s' % (INVOCATION_ID, INVOCATION_TYPE, len(recipient_list), maxrcpts))

    if maxrcpts < 1 :
        logger.error('invocation_id=%s invocation_type="%s" msg="Field maxrcpts must be greater than 0. Increase your maxrcpts"' % (INVOCATION_ID,INVOCATION_TYPE))
        results = splunk.Intersplunk.generateErrorResults("Error : Field maxrcpts must be greater than 0. Increase your maxrcpts.")
    elif len(recipient_list) > maxrcpts :
        logger.error('invocation_id=%s invocation_type="%s" msg="More emails would be generated than permitted. Increase your maxrcpts or change your search"' % (INVOCATION_ID,INVOCATION_TYPE))
        results = splunk.Intersplunk.generateErrorResults("Error : More than emails would be generated than permitted. Increase your maxrcpts or change your search.")
    elif missing_email :
        logger.error('invocation_id=%s invocation_type="%s" msg="All results must contain a field named email_to with the intended recipient"' % (INVOCATION_ID,INVOCATION_TYPE))
        results = splunk.Intersplunk.generateErrorResults("Error : All results must contain a field named email_to with the intended recipient.")
    else :
        header += '<tr>'
        for key in fields :
            header += '<th>' + key + '</th>'
        header += '</tr>\n'

        for recipient in recipient_list :
            outbound = message
            outbound += '<p id="sendresults_body">\n'
            outbound += recipient_list[recipient].get('email_body')
            outbound += '</p>\n'
            if(showresults):
                outbound += '<table id="sendresults_results">\n'
                outbound += header
                for event in event_list[recipient] :
                    outbound += '<tr>\n'
                    for key in fields :
                        c = ""
                        if class_cols.get(key) != None and event.get(class_cols[key]) != None :
                            c = ' class="' + event[class_cols[key]] + '"'
                        if event.get(key) != None :
                            if isinstance(event[key], str) == True :
                                outbound += '<td'+c+'>' + event[key] + '</td>\n'
                            else:
                                if event[key][0] == "##__SPARKLINE__##" :
                                    outbound += '<td'+c+'>' + ",".join(event[key]) + '</td>\n'
                                else:
                                    outbound += '<td'+c+'>' + "<br />".join(event[key]) + '</td>\n'
                        else:
                            outbound += '<td'+c+'> ______ </td>\n'
                    outbound += '</tr>\n'
                outbound += '</table>\n'
            outbound += '<p id="sendresults_footer">\n'
            outbound += recipient_list[recipient].get('email_footer')
            outbound += '</p>\n'
            outbound += '</body>\n'
            outbound += '</html>\n'
            sendemail(recipient, bcc, recipient_list[recipient].get('email_subj') , outbound, argvals)

            logger.info('invocation_id=%s invocation_type="%s" msg="Email sent" rcpt="%s" subject="%s" events=%d' % (INVOCATION_ID,INVOCATION_TYPE,recipient,recipient_list[recipient].get('email_subj'),len(event_list[recipient])))
        logger.info('invocation_id=%s invocation_type="%s" msg="All Email alerts successfully sent"' % (INVOCATION_ID, INVOCATION_TYPE))
except Exception as e:
    logger.error('invocation_id=%s invocation_type="%s" msg="General Error" traceback=%s' % (INVOCATION_ID,INVOCATION_TYPE,str(e)))
    results = splunk.Intersplunk.generateErrorResults("Error : Traceback: " + str(e))

# output results
splunk.Intersplunk.outputResults(results)