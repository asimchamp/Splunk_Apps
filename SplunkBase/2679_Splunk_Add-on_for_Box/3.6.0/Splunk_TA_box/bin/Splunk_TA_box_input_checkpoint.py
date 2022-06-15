#
# SPDX-FileCopyrightText: 2021 Splunk, Inc. <sales@splunk.com>
# SPDX-License-Identifier: LicenseRef-Splunk-8-2021
#
#
import import_declare_test
import splunk.admin as admin
from solnlib import log
import state_store as ss
from solnlib.splunkenv import make_splunkhome_path
import traceback
import logging
import log_files

_LOGGER = logging.getLogger(log_files.ta_box_data_input_ckpt)

class CheckpointHandler(admin.MConfigHandler):
    def setup(self):
        self.supportedArgs.addReqArg("input_name")
        return
   
    @staticmethod
    def get_session_key(self):
        return self.getSessionKey()
    
    """
    This handler is to get checkpoint of data input
    It takes 'input_name' as caller args and
    Returns the confInfo dict object in response.
    """
    def handleList(self, confInfo):
        try:
            _LOGGER.debug("In checkpoint handler to get checkpoint of data input")
            # Get args parameters from the request
            input_name = self.callerArgs.data['input_name'][0]
            session_key = self.get_session_key(self)
            appname = "Splunk_TA_box"
            metadata = {
                'checkpoint_dir': make_splunkhome_path(["var", "lib", "splunk", "modinputs", "box_service"]),
                'session_key': session_key
            }
            state = ss.StateStore(metadata, appname)
            checkpoint_data = state.get_state(input_name)
            if checkpoint_data:
                _LOGGER.info("Found checkpoint for %s", input_name)
                confInfo['token']['checkpoint_exist'] = True
            else:
                _LOGGER.info("Checkpoint not found of %s", input_name)
                confInfo['token']['checkpoint_exist'] = False
        
        except Exception as exc:
            _LOGGER.error("Error %s", traceback.format_exc())
        return

if __name__ == '__main__':
    admin.init(CheckpointHandler, admin.CONTEXT_APP_AND_USER)
