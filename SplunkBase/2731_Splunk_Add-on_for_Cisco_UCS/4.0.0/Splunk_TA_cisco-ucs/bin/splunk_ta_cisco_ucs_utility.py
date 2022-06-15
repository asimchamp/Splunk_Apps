#
# SPDX-FileCopyrightText: 2021 Splunk, Inc. <sales@splunk.com>
# SPDX-License-Identifier: LicenseRef-Splunk-1-2020
#
#
import json
import splunk.rest as rest
import logging

from ta_util2 import log_files
from splunktaucclib.rest_handler import util

_LOGGER = logging.getLogger(log_files.splunk_ta_cisco_ucs_utility)


def do_input_exists(field, value, session_key):
    _LOGGER.info("Checking if any input is using '{}' of '{}'".format(value, field))
    app_name = util.get_base_app_name()
    uri = "/servicesNS/nobody/" + app_name + "/data/inputs/cisco_ucs_task/"

    try:
        resp, content = rest.simpleRequest(
            uri,
            sessionKey=session_key,
            method="GET",
            getargs={"output_mode": "json"},
            raiseAllErrors=True,
        )

        if resp.status == 200:
            all_inputs = json.loads(content).get("entry", [])

            for entry in all_inputs:
                input_name = entry.get("name")
                input_field_value = entry["content"].get(field)

                # Check for each value in multi-value field separated by "|"
                if "|" in str(input_field_value):
                    input_field_values = [
                        x.strip() for x in str(input_field_value).split("|")
                    ]
                    if value in input_field_values:
                        return True, input_name
                elif input_field_value == value:
                    return True, input_name

            _LOGGER.info(
                "Did not find any input which is using '{}' of '{}'".format(value, field)
            )
    except Exception as e:
        import traceback

        _LOGGER.error(
            "Unexpected error occured while checking for input existence"
            " with specified field - {} and value - {}. Error: {}".format(
                field, value, str(e)
            )
        )
        _LOGGER.debug(traceback.format_exc())
    # Return fallback to `False` to continue deletion of servers/templates
    # if it does not find task or spec file don't exist
    return False, None

