"""
    Includes the XMattersEvent class which wraps the xMatters Event to make it easier
    to use correct formatting
"""
import json

# pylint: disable = import-error
from common_utils.setup_logging import setup_logging
# pylint: enable = import-error

DEFAULT_LOGGER = setup_logging('xmatters_alert_action.log', 'xmatters_event')

class XMattersEvent():
    """
        Class that wraps an xMatters Event so that it is easier to use correct formatting
    """

    def __init__(self, **kwargs):
        """
            Constructor, takes no arguments
        """
        self.logger = kwargs.get('logger', DEFAULT_LOGGER)
        self.properties = {}
        self.recipients = []
        self.priority = None

        self.valid_priorities = [
            'HIGH',
            'MEDIUM',
            'LOW'
        ]


    def add_property(self, key, value):
        """
            Adds a property to the event
            @param key: <str>, The name of the property
            @param value: <str>, The value of the property
        """
        self.properties[key] = value


    def add_recipient(self, target_name):
        """
            Adds a recipient to the recipients list in the xMatters Event
            @param target_name: <str>, the target name of the user, group, team, device in xMatters
        """
        self.recipients.append({
            'targetName': target_name
        })


    def set_priority(self, priority):
        """
            Sets the priority of the xMatters Event
            @param priority: <str>, valid values are HIGH, MEDIUM, and LOW (case insensitive)
            @raise: ValueError, if the priority is invalid
        """
        upper_priority = priority.upper()
        if upper_priority in self.valid_priorities:
            self.priority = upper_priority
        else:
            raise ValueError(
                'error=XM_INVALID_PRIORITY value=%s valid_priorities=%s'
                % (upper_priority, ';'.join(self.valid_priorities))
            )


    def get_json_payload(self):
        """
            Gets the json payload as a string to send to xMatters
            @return <str>
        """
        body = {
            'properties': self.properties
        }

        # empty arrays are considered falsey in python
        if self.recipients:
            body['recipients'] = self.recipients
        if self.priority is not None:
            body['priority'] = self.priority

        return json.dumps(body).encode()
