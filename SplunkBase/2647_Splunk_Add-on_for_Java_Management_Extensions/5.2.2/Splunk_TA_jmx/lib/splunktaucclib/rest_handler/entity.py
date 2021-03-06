# SPDX-FileCopyrightText: 2020 2020
#
# SPDX-License-Identifier: Apache-2.0


from .eai import RestEAI

__all__ = ["RestEntity"]


class RestEntity:
    def __init__(self, name, content, model, user, app, acl=None):
        self.name = name
        self.content = content
        self.model = model
        self._eai = RestEAI(self.model, user, app, acl)

    @property
    def eai(self):
        return self._eai
