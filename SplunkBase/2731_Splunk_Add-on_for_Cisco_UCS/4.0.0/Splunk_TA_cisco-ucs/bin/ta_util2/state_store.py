#
# SPDX-FileCopyrightText: 2021 Splunk, Inc. <sales@splunk.com>
# SPDX-License-Identifier: LicenseRef-Splunk-1-2020
#
#
import os.path as op
import os
import json

import ta_util2.kv_client as kvc
import ta_util2.utils as utils


class StateStore:

    def __init__(self, meta_configs, appname, use_kv_store=False):
        """
        @meta_configs: dict like and contains checkpoint_dir, session_key,
        server_uri etc
        """

        self._meta_configs = meta_configs
        self._appname = appname
        self._states_cache = {}
        self._kv_client = None
        if utils.is_true(use_kv_store):
            self._state_collection = "states"
            self._kv_client = kvc.KVClient(meta_configs["server_uri"],
                                           meta_configs["session_key"])
            kvc.create_collection(self._kv_client, self._state_collection,
                                  self._appname)
            self._pop_states_cache()

    def update_state(self, key, states):
        """
        @state: dict, json serializable
        @return: None if successful, otherwise throws exception
        """

        if self._kv_client:
            states["appkey"] = key
            if key not in self._states_cache:
                res = self._kv_client.insert_collection_data(
                    self._state_collection, states, self._appname)
                self._states_cache[key] = self._kv_client.get_collection_data(
                    self._state_collection, res["_key"], self._appname)
            else:
                self._kv_client.update_collection_data(
                    self._state_collection, self._states_cache[key]["_key"],
                    states, self._appname)
        else:
            fname = op.join(self._meta_configs["checkpoint_dir"], key)
            with open(fname + ".new", "w") as f:
                json.dump(states, f)
            os.rename(fname + ".new", fname)
            if key not in self._states_cache:
                self._states_cache[key] = {}
            self._states_cache[key].update(states)

    def get_state(self, key):
        if self._kv_client:
            return self._states_cache.get(key, None)
        else:
            fname = op.join(self._meta_configs["checkpoint_dir"], key)
            if op.exists(fname):
                with open(fname) as f:
                    state = json.load(f)
                    self._states_cache[key] = state
                    return state
            else:
                return None

    def delete_state(self, key):
        if self._kv_client:
            state = self._states_cache.get(key, None)
            if state is None:
                return

            self._kv_client.delete_collection_data(
                self._state_collection, self._states_cache[key]["_key"],
                self._appname)
            del self._states_cache[key]
        else:
            fname = op.join(self._meta_configs["checkpoint_dir"], key)
            if op.exists(fname):
                os.remove(fname)

    def _pop_states_cache(self):
        states = self._kv_client.get_collection_data(self._state_collection,
                                                     None, self._appname)
        if not states:
            return

        for state in states:
            if "appkey" in state:
                self._states_cache[state["appkey"]] = state
