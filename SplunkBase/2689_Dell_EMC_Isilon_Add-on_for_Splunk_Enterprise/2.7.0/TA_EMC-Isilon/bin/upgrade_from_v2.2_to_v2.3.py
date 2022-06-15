from __future__ import print_function
from future import standard_library
standard_library.install_aliases()
from builtins import input
import os
import configparser

file_path = os.path.abspath(__file__)

CP = configparser.ConfigParser()

node = ""
while True:
    node = input("Enter nodes (comma-separated non-blank values) : ").strip()
    if not node == "":
        break

content = ""

nodes = node.split(',')

for nd in nodes:
    if nd.strip().find(" ") != -1 or nd.strip() == "":
        print("Please provide the hosts in a comma separated way(e.g. node1,node2,node3)")
        exit(1)
    content += "[" + nd.strip() + "]\nverify = false\ncert_path = \n\n"

try:
    local_path = os.path.join(os.path.dirname(os.path.dirname(file_path)), "local")
    if not os.path.exists(local_path):
        os.makedirs(local_path)
    conf_path = os.path.join(local_path, "isilonappsetup.conf")

    if not os.path.exists(conf_path):
        conf_file = open(conf_path, "w")
        conf_file.write(content)
        conf_file.close()
    else:
        CP.read(conf_path)
        for nd in nodes:
            if CP.has_section(nd.strip()):
                CP.set(nd.strip(), "verify", value="false")
                CP.set(nd.strip(), "cert_path", value="")
            else:
                CP.add_section(nd.strip())
                CP.set(nd.strip(), "verify", value="false")
                CP.set(nd.strip(), "cert_path", value="")
        CP.write(open(conf_path, "w"))

    print("Added stanzas to TA_EMC-Isilon->local->isilonappsetup.conf. Splunk restart is required to affect the changes.")
except Exception as e:
    print(e)
