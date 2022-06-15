# Copyright (C) 2005-2016 Splunk Inc. All Rights Reserved.
# The file contains the specification for database identities (username/password)

[<name>]

username = <string>
# required
# the username for this database connection identity

password = <string>
# required
# The encrypted value of the password for this database connection identity.

domain_name = <string>
# optional
# Specifies the windows domain name which the username belongs to

use_win_auth =  [true|false]
# optional
# Specifies wether the Windows Authentication Domain is used

identity_type =  [normal|cyberark]
# optional
# Specifies type of the identity
# normal is the default type
# normal - username and password provided by user
# cyberark - after providing neeeded data password is requested from CyberArk

protocol_type =  [http|https]
# optional
# Specifies type of the connection to CyberArk
# http is the default type
# http - unsecure connection to a CyberArk
# https - secure connection, certificate is required

appId = <string>
# optional
# required when identity_type = cyberark
# Specifies Application ID needed to get credentials from the CyberArk

safe = <string>
# optional
# required when identity_type = cyberark
# Specifies Safe in the CyberArk where the password is saved

object = <string>
# optional
# required when identity_type = cyberark
# Specifies object name in the CyberArk where the password is saved

url = <string>
# optional
# required when identity_type = cyberark
# Domain where CyberArk Central Credential Provider is hosted

port = <integer>
# optional
# required when identity_type = cyberark
# Port where CyberArk Central Credential Provider is available

certificate = <string>
# optional
# required when identity_type = cyberark and protocol_type = https
# The encrypted value of the certificate for this CyberArk connection.
