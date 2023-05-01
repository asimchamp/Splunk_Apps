
# Author: Vincent Alquier <v.alquier@itrust.fr>
# Copyrights (c) 2013 by ITrust

"""Utilities functions to convert from snake_case to camelCase or from
camelCase to snake_case.

usage:
to_snake_case('getState') == 'get_state'
to_camel_case('get_url') == 'getUrl'


To convert multiple strings, use the CamelCaseDecoder and SnakeCaseDecoder
classes:

camelcase = CamelCaseDecoder()
for s in ['']:


When converting from snake_case to camelCase:

  * do NOT uppercase first character:
    to_camel_case('get_state') == 'getState'

  * do NOT remove leading underscore:
    to_camel_case('_get_state') == '_getState'

  * do NOT remove any additional underscore:
    to_camel_case('__dict__') == '__dict__'
    to_camel_case('_to__camel_case_') == '_to_CamelCase_'

  * do NOT remove/convert unknown characters:
    to_camel_case('black&_white') == 'black&White'
    to_camel_case('scan$$_get_state') == 'scan$$GetState'
    to_camel_case('request._do__post') == 'request.Do_Post'
    to_camel_case('request._do_POST') == 'request.DoPOST'

  * you can specify a list of characters to use as word separators (warning:
    the behaviour is not defined if you use '_' as separator):
    to_camel_case('_to_camel_case_', sep='_') == ???
    to_camel_case('scan$$_get_state', sep='$') == 'scan$$_getState'
    to_camel_case('request._do_POST', sep='.') == 'request._doPOST'

  * the default sep value is r'\s' (= r' \t\n\r\f\v'):
    to_camel_case('scan get_url do__POST') == 'scan getUrl do_POST'


When converting from camelCase to snake_case:

  * try to detect acronyms in camel-cased strings:
    to_snake_case('getURL') == 'get_url'
    to_snake_case('getHTTPHeader') == 'get_http_header'

  * do NOT add a leading underscore if first character is upper cased:
    to_snake_case('GetState') == 'get_state'

  * do NOT remove any underscore:
    to_snake_case('_to_CamelCase_') == '_to__camel_case_'

  * do NOT remove/convert unknown characters:
    to_snake_case('Black&White') == 'black&_white'
    to_snake_case('scan$$GetState') == 'scan$$_get_state'
    to_snake_case('request.Do_POST') == 'request._do__post'

  * you can specify a list of characters to use as word separators:
    to_snake_case('_to_CamelCase_', sep='_') == '_to_camel_case_'
    to_snake_case('scan$$GetState', sep='$') == 'scan$$get_state'
    to_snake_case('request.Do_POST', sep='._') == 'request.do_post'

  * the default sep value is r'\s' (= r' \t\n\r\f\v'):
    to_snake_case('scan getURL do_POST') == 'scan get_url do__post'

  * you can keep detected acronyms uppercased:
    to_snake_case('getURL', uc_acronyms=True) == 'get_URL'
    to_snake_case('HTTPHeader', uc_acronyms=True) == 'HTTP_header'
    to_snake_case('CIA NSA FBI', uc_acronyms=True) == 'CIA NSA FBI'

Remember, conversions are not always reversible :
to_snake_case('GetURL') == 'get_url'
to_camel_case('get_url') == 'getUrl'

to_snake_case('request.Do_POST') == 'request._do__post'
to_camel_case('request._do__post') == 'request.Do_Post'

But
to_snake_case('GetURL', uc_acronyms=True) == 'get_URL'
to_camel_case('get_URL', uc_first=True) == 'GetURL'
"""

import re
from .common import ucfirst


def to_camel_case(s, sep=r'\s', uc_first=False):
    """Converts string from snake_case to camelCase.
    """
    return SnakeCaseDecoder(sep, uc_first).to_camel(s)


def to_snake_case(s, sep=r'\s', uc_acronyms=False):
    """Converts string from camelCase to snake_case.
    """
    return CamelCaseDecoder(sep, uc_acronyms).to_snake(s)


class CamelCaseDecoder(object):

    def __init__(self, sep=r'\s', uc_acronyms=False):
        """Compile the decoder regexp. Use sep to specify the word separators.
        Set uc_acronyms to True to preserve acronyms case.
        """
        acronym = r'[A-Z]+(?![a-z])'
        word = r'[A-Z][a-z]+'
        self.re = re.compile(
            r'(^|[{0}])?(?:({1})|({2}))'.format(sep, acronym, word))
        if uc_acronyms:
            self.replacement = self._repl2
        else:
            self.replacement = self._repl1

    def _repl1(self, match):
        """For internal use only.
        """
        separator, acronym, word = match.groups()
        if separator is None:
            separator = '_'
        return separator + (acronym or word).lower()

    def _repl2(self, match):
        """For internal use only.
        """
        separator, acronym, word = match.groups()
        if separator is None:
            separator = '_'
        return separator + (acronym or word.lower())

    def to_snake(self, s):
        """Convert the given string s from camelCase to snake_case.
        """
        return self.re.sub(self.replacement, s)


class SnakeCaseDecoder(object):

    def __init__(self, sep=r'\s', uc_first=False):
        """Compile the decoder regexp. Use sep to specify the word separators.
        warning: the behaviour is not defined if you use '_' as separator and
        may change in the future !
        """
        self.re = re.compile(r'(^|[{0}])?(_*)([a-zA-Z]+)'.format(sep))
        if uc_first:
            self.replacement = self._repl2
        else:
            self.replacement = self._repl1

    def _repl1(self, match):
        """For internal use only.
        """
        separator, underscores, word = match.groups()
        if separator is None:
            return (underscores or '')[1:] + ucfirst(word)
        #else
        return separator + (underscores or '') + word

    def _repl2(self, match):
        """For internal use only.
        """
        separator, underscores, word = match.groups()
        return (separator or '') + (underscores or '')[1:] + ucfirst(word)

    def to_camel(self, s):
        """Convert the given string s from snake_case to camelCase.
        """
        return self.re.sub(self.replacement, s)
