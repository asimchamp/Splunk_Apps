
# encoding = utf-8
# Always put this line at the beginning of this file
import ta_etintel_declare

import os
import sys

from alert_actions_base import ModularAlertBase
import modalert_checket_helper

class AlertActionWorkerchecket(ModularAlertBase):

    def __init__(self, ta_name, alert_name):
        super(AlertActionWorkerchecket, self).__init__(ta_name, alert_name)

    def validate_params(self):

        if not self.get_global_setting("api_key"):
            self.log_error('api_key is a mandatory setup parameter, but its value is None.')
            return False

        if not self.get_global_setting("authorization_code"):
            self.log_error('authorization_code is a mandatory setup parameter, but its value is None.')
            return False

        if not self.get_param("object"):
            self.log_error('object is a mandatory parameter, but its value is None.')
            return False
        return True

    def process_event(self, *args, **kwargs):
        status = 0
        try:
            if not self.validate_params():
                return 3
            status = modalert_checket_helper.process_event(self, *args, **kwargs)
        except (AttributeError, TypeError) as ae:
            self.log_error("Error: {}. Please double check spelling and also verify that a compatible version of Splunk_SA_CIM is installed.".format(str(ae)))
        
            with open("out.txt", "w") as f_out:
                f_out.write(str(ae))
            return 4
        except Exception as e:
            msg = "Unexpected error: {}."
            if e:
                with open("out.txt", "w") as f_out:
                    f_out.write(msg.format(str(e)))
                self.log_error(msg.format(str(e)))
            else:
                import traceback
                self.log_error(msg.format(traceback.format_exc()))
            return 5
        return status

if __name__ == "__main__":
    exitcode = AlertActionWorkerchecket("TA-etintel", "checket").run(sys.argv)
    sys.exit(exitcode)
