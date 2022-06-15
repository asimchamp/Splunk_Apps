from __future__ import absolute_import

__author__ = 'mwirges'

from . import Client
from . import jwt_client

client = None


def setupClient(config, is_behind_gateway = False):
    global client

    client = jwt_client.JWT_APIClient(config) if is_behind_gateway else Client.APIClient(config)

# end setupClient
