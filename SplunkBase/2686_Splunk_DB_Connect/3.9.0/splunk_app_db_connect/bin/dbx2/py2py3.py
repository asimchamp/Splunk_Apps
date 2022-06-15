# this is for py2 and py3 caomptible env (Enterprise 7.3 onwards)
try:
    from future.standard_library import install_aliases
    install_aliases()
    from urllib.parse import quote, urlparse
except ImportError:
    # `future` package is not avaialbe in Enterprise version < 7.3
    # fallback to old way
    from urlparse import urlparse
    from urllib import quote


def urlquote(p, safe):
    return quote(p, safe)

def urlparse_wrapper(server_url):
    return urlparse(server_url)