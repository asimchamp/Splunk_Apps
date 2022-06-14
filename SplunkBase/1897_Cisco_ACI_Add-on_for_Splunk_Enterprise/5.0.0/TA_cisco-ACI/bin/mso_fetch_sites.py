from splunk.persistconn.application import PersistentServerConnectionApplication
import logging
import json
import requests
from splunk.clilib import cli_common as cli

LOGIN_URL = "https://{}/api/v1/auth/login"
SITES_URL = "https://{}/api/v1/sites"
GET_DOMAIN_ID_URL = "https://{}/api/v1/auth/login-domains"
TIME_OUT = 180


class FetchSites(PersistentServerConnectionApplication):
    """Fetch Site Configuration Handler."""

    def __init__(self, _command_line, _command_arg):
        """Initialize object with given parameters."""
        self.form_data = {}
        self.payload = {}
        self.token = None
        self.verify = self.get_verify_ssl()
        self.header = {"Content-Type": "application/json"}
        super(PersistentServerConnectionApplication, self).__init__()

    def get_verify_ssl(self):
        """Read Verify SSL value from app_setup.conf."""
        try:
            config = cli.getConfStanza("app_setup", "fetch_sites_ssl") or {}
            verify = config.get("verify_ssl", "True").upper()
            verify = True if verify in ("T", "TRUE", "Y", "YES", "1") else False
            return verify
        except Exception:
            logging.error("Could not get verify ssl value from app_setup.conf. defaulting to True")
        return True

    # Handle a synchronous from splunkd.
    def handle(self, in_string):
        """
        After user clicks on Fetch Sites, Called for a simple synchronous request.

        @param in_string: request data passed in
        @rtype: string or dict
        @return: String to return in response.  If a dict was passed in,
                 it will automatically be JSON encoded before being returned.
        """
        status = None
        try:
            err_list = []
            req_data = json.loads(in_string)
            self.form_data = dict(req_data.get("form"))
            self.is_domainId_available = True

            hosts = self.form_data.get("cisco_mso_host").split(",")
            hosts = [each.strip() for each in hosts if each.strip()]
            port = self.form_data.get("cisco_mso_port").strip()

            self.data = {
                "username": self.form_data.get("cisco_mso_username"),
                "password": self.form_data.get("cisco_mso_password"),
            }

            for index, host in enumerate(hosts):
                try:
                    if port:
                        host += ":" + port

                    if self.form_data.get("cisco_mso_domain") and not self.data.get("domainId"):
                        self.data["domainId"] = self.get_domain_id(self.form_data.get("cisco_mso_domain"), host)

                    resp = self.login(host)

                    self.token = resp.get("token")
                    self.header["Authorization"] = "Bearer {}".format(self.token)

                    sites = self.fetch_sites(host)
                    self.payload["sites"] = sites
                    status = 200
                    return {"payload": self.payload, "status": status}
                except Exception as e:
                    err = str(e) + "|"
                    err_list.append(err)
                    if index == len(hosts) - 1 or not self.is_domainId_available:
                        raise Exception(err_list)
        except Exception as e:
            err = str(e).replace("[", "").replace("]", "")
            self.payload["error"] = '"<br>'.join(err.split('|", '))
            status = 500

        return {"payload": self.payload, "status": status}

    def handleStream(self, handle, in_string):
        """For future use."""
        raise NotImplementedError("PersistentServerConnectionApplication.handleStream")

    def done(self):
        """Virtual method which can be optionally overridden to receive a callback after the request completes."""
        pass

    def login(self, host):
        """Handle login call to MSO."""
        url = LOGIN_URL.format(host)
        try:
            data = json.dumps(self.data)

            resp = requests.post(url, data=data, headers=self.header, verify=self.verify, timeout=TIME_OUT)

            if resp.ok:
                return resp.json()

            resp.raise_for_status()
        except Exception as e:
            logging.error(
                "Error occurred while login with provided credentials...Host: {} Error: {}".format(host, str(e))
            )
            raise Exception("Could not login with provided credentials...Host: {} Error: {}".format(host, str(e)))

    def fetch_sites(self, host):
        """Fetch sites available in given MSO."""
        try:
            url = SITES_URL.format(host)
            sites = {}

            resp = requests.get(url, headers=self.header, verify=self.verify, timeout=TIME_OUT)

            if resp.ok:
                resp = resp.json().get("sites")
                for each in resp:
                    urls = ", ".join(each.get("urls"))
                    urls = urls.replace("https://", "").replace("http://", "")
                    sites[each.get("name")] = urls

                return sites

            resp.raise_for_status()
        except Exception as e:
            logging.error("Error occurred while fetching site details. Host: {}, Error: {}".format(host, str(e)))
            raise

    def get_domain_id(self, domain_name, host):
        """Fetch domainID available in MSO for all the Domains."""
        try:
            url = GET_DOMAIN_ID_URL.format(host)
            resp = requests.get(url, headers=self.header, verify=self.verify, timeout=TIME_OUT)

            if resp.ok:
                resp = resp.json().get("domains")

                for each in resp:
                    if each.get("name") == self.form_data.get("cisco_mso_domain"):
                        return each.get("id")
                else:
                    self.is_domainId_available = False
                    raise Exception(
                        "Could not find ID for provided domain. Invalid domain name is provided OR No such domain exist"
                        " for Host: {}".format(host)
                    )
            resp.raise_for_status()
        except Exception as e:
            logging.error("Error while fetching id for provided domain. Host: {}, Error: {}".format(host, str(e)))
            raise
