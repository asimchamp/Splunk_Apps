
# encoding = utf-8
# Always put this line at the beginning of this file
import ta_ziften_zenith_declare 

import os
import sys

from alert_actions_base import ModularAlertBase 
import modalert_zenith_quarantine_helper

class AlertActionWorkerzenith_quarantine(ModularAlertBase):

    def __init__(self, ta_name, alert_name):
        super(AlertActionWorkerzenith_quarantine, self).__init__(ta_name, alert_name)

    def validate_params(self):

        if not self.get_global_setting("zenith_ar_management_host_ip"):
            self.log_error('zenith_ar_management_host_ip is a mandatory setup parameter, but its value is None.')
            return False

        if not self.get_global_setting("zenith_ar_username"):
            self.log_error('zenith_ar_username is a mandatory setup parameter, but its value is None.')
            return False

        if not self.get_global_setting("zenith_ar_api_key"):
            self.log_error('zenith_ar_api_key is a mandatory setup parameter, but its value is None.')
            return False
        return True

    def process_event(self, *args, **kwargs):
        status = 0
        try:
            self.prepare_meta_for_cam()

            if not self.validate_params():
                return 3 
            status = modalert_zenith_quarantine_helper.process_event(self, *args, **kwargs)
        except (AttributeError, TypeError) as ae:
            self.log_error("Error: {}. Please double check spelling and also verify that a compatible version of Splunk_SA_CIM is installed.".format(ae.message))
            return 4
        except Exception as e:
            msg = "Unexpected error: {}."
            if e.message:
                self.log_error(msg.format(e.message))
            else:
                import traceback
                self.log_error(msg.format(traceback.format_exc()))
            return 5
        return status

if __name__ == "__main__":
    exitcode = AlertActionWorkerzenith_quarantine("TA-ziften", "zenith_quarantine").run(sys.argv)
    sys.exit(exitcode)
