import os
import sys

def get_app_path(subpath=None):
    app_path = os.path.split(os.path.split(__file__)[0])[0]
    app_path = os.path.abspath(os.path.join(app_path, ".."))
    if subpath:
        return os.path.join(app_path, subpath)
    return app_path

def write_log_exception(aException):
    try:
	LOG_FILE = "logs.txt";
	_app_path = get_app_path()
	_log_file = open(os.path.join(_app_path, "local", LOG_FILE), "wt")
	exc_type, exc_obj, exc_tb = sys.exc_info()
	fname = os.path.split(exc_tb.tb_frame.f_code.co_filename)[1]
	_log_file.write("Exception type: %s. FileName: %s. Line: %s.\n" % (exc_type,fname,exc_tb.tb_lineno))
    except:
	return
