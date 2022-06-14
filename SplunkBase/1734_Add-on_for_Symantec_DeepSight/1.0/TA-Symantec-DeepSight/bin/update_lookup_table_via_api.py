import os
import re
import sys
import tempfile
import time
import splunk
from splunk.models.base import SplunkAppObjModel
from splunk.models.field import BoolField
from splunk.models.field import Field
from splunk.models.field import IntField
from splunk.appserver.mrsparkle.lib.util import make_splunkhome_path


class SplunkLookupTableFile(SplunkAppObjModel):
    '''Class for Splunk lookup table files.

    Note that on save(), the "path" is actually
    the file that will be copied into place to replace the existing lookup
    table.
    '''

    resource = '/data/lookup-table-files'
    name = Field()
    path = Field(api_name="eai:data")


class SplunkLookupTransform(SplunkAppObjModel):
    '''Class for Splunk lookups as defined in transforms.conf.'''

    resource = '/data/transforms/lookups'
    case_sensitive_match = BoolField()
    filename = Field()
    name = Field()


def get_lookup_transform(lookup_name, namespace, owner, key):
    '''Retrieve a Splunk lookup stanza in transforms.conf by lookup name.

    @param lookup_name: The lookup STANZA name (NOT the file name).
    @param namespace: A Splunk namespace to limit the search to.
    @param owner: A Splunk user.
    @param key: A Splunk session key.

    @return: The path to the Splunk lookup table.
    '''
    try:
        return SplunkLookupTransform.get(SplunkLookupTransform.build_id(lookup_name, namespace, owner), sessionKey=key)
    except splunk.ResourceNotFound as e:
	raise
    except Exception as e:
	raise

    return None


def get_lookup_table_location(lookup_name=None, namespace=None, owner=None, key=None, fullpath=True, transform=None):
    '''Retrieve the location of a Splunk lookup table file by lookup name.

    @param lookup_name: The lookup STANZA name (NOT the file name).
    @param namespace: A Splunk namespace to limit the search to.
    @param owner: A Splunk user.
    @param key: A Splunk session key.

    @param fullpath: Return full path if True, file name alone if False.
    @param transform: An existing lookup object. Other parameters except for
        fullpath are ignored if this is present.

    @return: The path to the Splunk lookup table or None if an error occurs.
    '''

    if not transform:
        transform = get_lookup_transform(lookup_name, namespace, owner, key)
    try:
        path = SplunkLookupTableFile.get(SplunkLookupTableFile.build_id(transform.filename, namespace, owner), sessionKey=key).path
        if not fullpath:
            return os.path.basename(path)
        return path
    except splunk.ResourceNotFound as e:
        raise
    except Exception as e:
        raise

    return None

def update_lookup_table(filename, lookup_file, namespace, owner, key):
    '''Update a  Splunk lookup table file with a new file.

    @param filename: The full path to the replacement lookup table file.
    @param lookup_file: The lookup FILE name (NOT the stanza name)
    @param namespace: A Splunk namespace to limit the search to.
    @param owner: A Splunk user.
    @param key: A Splunk session key.

    @return: Boolean success status.

    WARNING: "owner" should be "nobody" to update
    a public lookup table file; otherwise the file will be replicated
    only for the admin user.

    Also, the temporary CSV file MUST be located in the following directory:

        $SPLUNK_HOME/var/run/splunk/lookup_tmp

    This staging area is hard-coded as a "safe" area in the
    LookupTableConfPathMapper.

    '''
    try:
        # Owner passed in should be nobody, otherwise the lookup table will
        # end up in a user's personal directory.
        id_val = SplunkLookupTableFile.build_id(lookup_file, namespace, owner)
        lookup_table_file = SplunkLookupTableFile.get(id_val, sessionKey=key)
        entity = lookup_table_file.manager()._put_args(id=id_val, postargs={'eai:data': filename}, sessionKey=key)
        if entity is not None:
            return True
    except splunk.ResourceNotFound as e:
        raise
    except Exception as e:
        raise

    return False


if __name__ == "__main__":

    # Session key
    key = splunk.auth.getSessionKey('admin', 'changeme')

    # Lookup parameters
    lookup_name = 'simple_asset_lookup'
    lookup_namespace = 'SA-IdentityManagement'
    lookup_owner = 'nobody'  # This should nearly always be "nobody"
    
    # Temp file with which we will replace the lookup table file.
    # Note that this needs to be a full path, despite the fact that the API only allows
    # updating lookup table files from the staging directory shown below.
    tempfile = make_splunkhome_path(['var', 'run', 'splunk', 'lookup_tmp', 'tmp.csv'])
    
    # Get the filename for the lookup. This does NOT need to be a full path, since the
    # same lookup cannot exist twice in the same app.
    lookup_table_file_path = get_lookup_table_location(lookup_name, lookup_namespace, lookup_owner, key, fullpath=False)
    
    # Print the lookup path
    print 'Lookup named %s backed by source file %s' % (lookup_name, lookup_table_file_path)
    
    # Update it (source file must already exist in $SPLUNK_HOME/var/run/splunk/lookup_tmp)
    success = update_lookup_table(tempfile, lookup_table_file_path, lookup_namespace, lookup_owner, key)
    
    # Print the result
    print 'Lookup named %s update status: %s' % (lookup_name, success)
