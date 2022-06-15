#
# SPDX-FileCopyrightText: 2021 Splunk, Inc. <sales@splunk.com>
# SPDX-License-Identifier: LicenseRef-Splunk-8-2021
#
#
from snow_consts import FIELD_SEPARATOR


def split_string_to_dict(event_data_dict: dict, event_field: str) -> dict:
    all_fields = event_field.split(FIELD_SEPARATOR)
    for each_field in all_fields:
        field_kv_list = each_field.split("=", 1)
        # Verifying that fields are in key value format and key is not null
        if len(field_kv_list) == 2 and field_kv_list[0].strip():
            event_data_dict.update({field_kv_list[0].strip(): field_kv_list[1].strip()})
        else:
            msg = "The field '{}' is not in key value format. Expected format: key1=value||key2=value2.".format(  # noqa : E501
                str(each_field)
            )
            return {"Error Message": msg}
    return event_data_dict
