
# Author: Vincent Alquier <v.alquier@itrust.fr>
# Copyrights (c) 2015 by ITrust

"""Plugin loading mechanism.
A Plugin is a python package (or module).
"""

import pkgutil
import six


class PluginsLoader(dict):

    def load(self, path=None, prefix=""):
        """Load all the plugins found on path. path is list of path to look
        for modules in. Importing a module must be enough to enable it.
        Raises ImportError in case of troubles importing a plugin.
        """
        if path is None:
            return
        #else:
        if isinstance(path, six.string_types):
            path = [path]
        for ffinder, name, ispkg in pkgutil.iter_modules(path, prefix):
            module = ffinder.find_module(name).load_module(name)
            self[name] = module
