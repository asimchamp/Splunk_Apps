import os, sys

# Remove problematic environmental variables if they exist.
for envvar in ("PYTHONPATH", "LD_LIBRARY_PATH"):
    if envvar in os.environ:
        del os.environ[envvar]

# Assign to absolute path to your python executable
python_executable = "/usr/bin/python"
# Assign the absolute path to subscribe.py
real_script = "/opt/splunk/etc/apps/zeromq/bin/subscribe.py"

os.execv(python_executable, [ python_executable, real_script ])
 
