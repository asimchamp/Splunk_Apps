import json
import logging
import requests

try:
    import urllib3
    urllib3.disable_warnings()
except (ImportError, AttributeError):
    pass
else:
    try:
        urllib3.disable_warnings()
    except AttributeError:
        pass
try:
    from requests.packages.urllib3.exceptions import InsecureRequestWarning
except ImportError:
    pass

import mso_urls


class CredentialsError(Exception):
    """Exception class for errors with Credentials class."""

    def __init___(self, message):
        """Initialize with error message."""
        Exception.__init__(self, "Session Credentials Error:{0}".format(message))
        self.message = message


class LoginDomainError(Exception):
    """Exception class for errors with Credentials class."""

    def __init___(self, message):
        """Initialize with error message."""
        Exception.__init__(self, "{}".format(message))
        self.message = message


class Session(object):
    """Session class responsible for all communication with the MSO."""

    def __init__(self, url, username, password, domain_name, timeout, verify_ssl=True):
        """
        Initialize object with given parameters.

        :param url:  MSO URL such as https://<host>
        :type url: string
        :param username: Username that will be used as part of the MSO login credentials.
        :type username: string
        :param password: Password that will be used as part of the MSO login credentials.
        :type password: string
        :param domain_name: Fetch id of domain name which will be used as part of the MSO login credentials.
        :type domain_name: string
        :param timeout: The timeout interval for http/https request.
        :type timeout: int
        :param verify_ssl: Used only for SSL connections with the MSO.\
        Indicates whether SSL certificates must be verified.  Possible\
        values are True and False with the default being False.
        :type verify_ssl: string
        """
        if not isinstance(url, str):
            url = str(url)
        if not isinstance(username, str):
            username = str(username)
        if not isinstance(password, str):
            password = str(password)
        if not isinstance(url, str):
            raise CredentialsError("The URL or MSO address must be a string")
        if not isinstance(username, str):
            raise CredentialsError("The username must be a string")
        if domain_name and not isinstance(domain_name, str):
            raise CredentialsError("The domain_name name must be a string")
        if password is None or password == "None":
            raise CredentialsError("An authentication method must be provided")
        if password:
            if not isinstance(password, str):
                raise CredentialsError("The password must be a string")

        if "https://" in url:
            self.ipaddr = url[len("https://"):]
        else:
            self.ipaddr = url[len("http://"):]
        self.username = username
        self.password = password
        self.domain_name = domain_name
        self.timeout = timeout

        # self.api = "http://<host>:<port>/api/"
        self.api = url
        self.token = None
        self.session = requests.Session()

        # Disable the warnings for SSL
        if not verify_ssl:
            try:
                requests.packages.urllib3.disable_warnings(InsecureRequestWarning)
            except (AttributeError, NameError):
                pass

        if verify_ssl == "False":
            self.verify_ssl = False
        else:
            self.verify_ssl = True

    def get_headers(self, request_type):
        """
        Create headers for GET and POST calls.

        :param request_type: Indicates the type of HTTP Request. GET or POST.
        :type request_type: string
        """
        headers = {"Content-Type": "application/json"}
        if request_type == "GET":
            headers["Authorization"] = "Bearer " + self.token
        return headers

    def fetch_domain_id(self):
        """Fetch ID for domain."""
        try:
            url = "https://{mso_hostname}/{endpoint}".format(mso_hostname=self.ipaddr, endpoint=mso_urls.LOGIN_DOMAIN)

            headers = {"Content-Type": "application/json"}

            response = self.session.get(url=url, headers=headers, timeout=self.timeout, verify=self.verify_ssl)

            if response.ok:
                response = response.json()
                for data in response:
                    for key in response[data]:
                        if key.get("name") == self.domain_name and key.get("id"):
                            return key.get("id")
            else:
                response.raise_for_status()

        except Exception as err:
            raise LoginDomainError(
                "Failed fetching ID for domain {domain}. Exception: {err}".format(domain=self.domain_name, err=str(err))
            )

    def login(self):
        """Perfrom MSO login and initialize token variable."""
        logging.debug("Initializing connection to the MSO")

        if self.domain_name:
            domain_id = self.fetch_domain_id()

            if domain_id:
                credentials = {"username": self.username, "password": self.password, "domainId": str(domain_id)}

            else:
                raise LoginDomainError(
                    "Provided domain is not configured in MSO. Domain: {domain}.".format(domain=self.domain_name)
                )

        else:
            credentials = {"username": self.username, "password": self.password}

        credentials = json.dumps(credentials)
        login_url = "https://{mso_hostname}/{endpoint}".format(mso_hostname=self.ipaddr, endpoint=mso_urls.LOGIN_URL)

        headers = self.get_headers(request_type="POST")
        response = self.session.post(
            url=login_url, data=credentials, headers=headers, timeout=self.timeout, verify=self.verify_ssl
        )

        logging.debug("MSO Login Response: {response}".format(response=response.content))
        response.raise_for_status()

        if response.ok:
            self.token = response.json()["token"]

        return response

    def get(self, api_endpoint, params=None):
        """
        Hit the REST endpoint and return data of api response.

        :param api_endpoint: The MSO API endpoint from data is to be fetched.
        :type api_endpoint: string
        :param params: The parameters to be passed in GET request.
        :type params: dict
        :returns: API response in JSON format
        """
        headers = self.get_headers(request_type="GET")

        url = "https://{mso_hostname}/{endpoint}".format(mso_hostname=self.ipaddr, endpoint=api_endpoint)

        response = self.session.get(
            url=url, headers=headers, params=params, timeout=self.timeout, verify=self.verify_ssl
        )

        if response.ok:
            return response.json()

        elif response.status_code == 401:
            logging.debug(
                "MSO Error: Performing MSO relogin, because token expired or there is some error in token format."
            )
            try:
                self.login()
                return self.get(api_endpoint, params)
            except Exception as err:
                logging.error("MSO Error: Could not re-login to MSO. Error: {err}.".format(err=err))
                raise

        # retry only when exception occurs from server side and not client side
        elif 500 <= response.status_code < 600:
            logging.debug("Received error: %s %s", str(response.status_code), response.text)
            retries = 3
            while retries > 0:
                logging.debug("Retrying query")
                response = self.session.get(url=url, timeout=self.timeout, verify=self.verify_ssl)
                if response.status_code != 200:
                    logging.debug("Retry was not successful.")
                    retries -= 1
                else:
                    logging.debug("Retry was successful.")
                    break
            if retries == 0:
                logging.error(
                    "MSO Error: An error occurred while collecting data for url: {url}. Status Code: {code} "
                    "Response message: {message}".format(url=url, message=response.text, code=response.status_code)
                )
                response.raise_for_status()
        else:
            logging.error(
                "MSO Error: An error occurred while collecting data for url: {url}. Status Code: {code} "
                "Response message: {message}".format(url=url, message=response.text, code=response.status_code)
            )
            response.raise_for_status()

    def close(self):
        """Close the session."""
        self.session.close()
