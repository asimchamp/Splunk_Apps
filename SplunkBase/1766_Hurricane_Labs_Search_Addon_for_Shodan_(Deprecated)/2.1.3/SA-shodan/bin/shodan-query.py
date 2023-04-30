#!/usr/bin/env python

import datetime
import json
import shodan
import splunk.Intersplunk
import sys
import time
import common
import re


def main():
    try:
        sessionkey = re.search(r'sessionKey:(.*)', sys.stdin.read()).groups(1)[0]
        API_KEY_VALUE = common.getCredentials(sessionkey)[1]
        args = list()
        queries = list()
        api = shodan.Shodan(API_KEY_VALUE)

        for arg in sys.argv[1:]:
            try:
                (key,value) = arg.split("=", 1)
            except ValueError:
                args.append(arg)
                continue

            key = key.lower()
            qtype = "search"
            queries.append("{}:{}".format(key,value))

        if len(queries) == 0:
            qtype = "search"
            queries.append(" ".join(args))

        events = list()
        for query in queries:
            try:
                results = api.search(query)["matches"]
            except shodan.APIError:
                results = list()

            for event in results:
                event["_raw"] = json.dumps(event)
                event["source"] = "shodan"
                event["sourcetype"] = "shodan"
                event["query"] = query

                if "timestamp" in event:
                    try:
                        dt = datetime.datetime.strptime(event["timestamp"], "%Y-%m-%dT%H:%M:%S.%f")
                    except ValueError:
                        dt = datetime.datetime.strptime(event["timestamp"], "%Y-%m-%dT%H:%M:%S")
                    event["_time"] = time.mktime(dt.timetuple())
                else:
                    event["_time"] = time.time()

                if "ip_str" in event:
                    event["host"] = event["ip_str"]
                else:
                    event["host"] = "shodan"

                if "location" in event:
                    location = event.pop("location")
                    for k in location:
                        new_k = "location_{}".format(k)
                        event[new_k] = location[k]
                events.append(event)
    except Exception as e:
        events = splunk.Intersplunk.generateErrorResults(str(e))

    splunk.Intersplunk.outputResults(events)

if __name__ == "__main__":
    main()
