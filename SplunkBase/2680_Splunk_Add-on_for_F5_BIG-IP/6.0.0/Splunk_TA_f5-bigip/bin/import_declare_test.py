import os
import re
import sys
from os.path import dirname

ta_name = "Splunk_TA_f5-bigip"
pattern = re.compile(r"[\\/]etc[\\/]apps[\\/][^\\/]+[\\/]bin[\\/]?$")
new_paths = [path for path in sys.path if not pattern.search(path) or ta_name in path]
new_paths.append(os.path.join(dirname(dirname(__file__)), "lib"))
new_paths.insert(0, os.path.sep.join([os.path.dirname(__file__), ta_name]))
sys.path = new_paths
TEMPLATES_CONF = "f5_templates_ts"
CHECKPOINTER = "namespace_collection"
SETTINGS_CONF = "splunk_ta_f5_settings"
