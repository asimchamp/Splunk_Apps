# SPDX-FileCopyrightText: 2020 2020
#
# SPDX-License-Identifier: Apache-2.0

"""
REST Schema
"""


from abc import abstractproperty

__all__ = [
    "RestSchemaError",
    "RestSchema",
]


class RestSchemaError(Exception):
    pass


class RestSchema:
    """
    REST Scheme.
    """

    def __init__(self, *args, **kwargs):
        pass

    @staticmethod
    def endpoint_name(name, namespace):
        return "{}_{}".format(namespace, name)

    @abstractproperty
    def product(self):
        pass

    @abstractproperty
    def namespace(self):
        pass

    @abstractproperty
    def version(self):
        pass
