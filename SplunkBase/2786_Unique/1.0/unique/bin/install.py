# Stuff to do when we need to install the app
import os
from string import Template

APPNAME="unique"

splunk_apps_path = os.path.join(os.environ['SPLUNK_HOME'], 'etc', 'apps')
local_var_path = splunk_apps_path + os.sep + APPNAME + os.sep + "var"

ini_dependencies = os.path.join(splunk_apps_path, APPNAME, "etc", "dependencies.conf")

def build_deps_from_config(config):
    import ConfigParser
    
    dep_apps = {}

    ini = ConfigParser.ConfigParser()
    ini.read(config)
    sections = ini.sections()
    for section in sections:
        dep_apps[section] = {'found': False, 'name': ini.get(section,  'name'), 'download_link': ini.get(section,  'download_link') }

    return dep_apps

dep_apps = build_deps_from_config(ini_dependencies)

# Check for all the required dependencies
for directory in os.listdir(splunk_apps_path):
    if directory in dep_apps:
        dep_apps[directory]['found'] = True

# Check if we installed the app already
def is_installed():
    if os.path.isfile(local_var_path + os.sep + "installed"):
        return True
    else:
        return False

def create_html_from_deps(deps):
    template_file = os.path.join(splunk_apps_path, APPNAME, "default", "data", "ui", "html", "uniqueness_install.template") 
    template_html_output = os.path.join(splunk_apps_path, APPNAME, "default", "data", "ui", "html", "uniqueness_install.html") 

    fp = open(template_file, "r")
    #print(fp.read())
    in_template = Template(fp.read())
    fp.close()

    has_missing = False
    html_table = "<table cellpadding=\"20\" cellspacing=\"10\">\n"
    for dep_k, dep_v in deps.items():
        html_table += "<tr><td>%s</td>" % (dep_k)
        if dep_v['found']:
            html_table += "<td><font color=\"#305d1e\"><b>OK</b></font></td></tr>\n"
        else:
            html_table += "<td><font color=\"#ff0000\"><b>MISSING</b></font></td><td><a href=\"%s\">Download here</a></td></tr>\n" % (dep_v['download_link'])
            has_missing = True
    html_table += "</table>\n"

    html_submit = ""
    if has_missing:
        html_submit = "<div align=\"center\"><font color=\"#ff0000\"><b>Please install missing dependencies</b></font></div>"
    else:
        html_submit = """
			  <form action="/custom/unique/check_install/setup">
			    <input type="submit" value="OK">
			  </form>
        """

    d = dict(apps_dependencies_table=html_table, button_OK_if_everything_is_installed=html_submit)
    out = in_template.safe_substitute(d)

    fp = open(template_html_output, "w")
    fp.write(out)
    fp.close()

print(dep_apps)
create_html_from_deps(dep_apps)


