#
# SPDX-FileCopyrightText: 2021 Splunk, Inc. <sales@splunk.com>
# SPDX-License-Identifier: LicenseRef-Splunk-1-2020
#
#
import import_declare_test
import sys
import os.path as op
import cisco_ucs_job_factory as jf
import time
import traceback
import queue
import json
import logging

from ta_util2 import job_scheduler as sched
from ta_util2 import job_source as js
from ta_util2 import data_loader as dl
from ta_util2 import utils
from ta_util2 import event_writer
from solnlib import conf_manager
from splunklib import modularinput as smi
from ta_util2 import configure as conf
from ta_util2 import log_files
from cisco_ucs_config import CiscoUcsConfMonitor
import splunk_ta_cisco_ucs_constants as constants
from splunk_ta_cisco_ucs_constants import DEFAULT_LOGGING_LEVEL

all_logs = log_files.get_all_logs()
all_logs.append("splunk_ta_cisco_ucs")
_LOGGER = logging.getLogger(log_files.splunk_ta_cisco_ucs)

APP_NAME = op.basename(op.dirname(op.dirname(op.abspath(__file__))))
SESSION_KEY = "session_key"


def _setup_signal_handler(data_loader):
        """
        Setup signal handlers
        @data_loader: data_loader.DataLoader instance
        """

        def _handle_exit(signum, frame):
            _LOGGER.info("Cisco UCS TA is going to exit...")
            data_loader.tear_down()

        utils.handle_tear_down_signals(_handle_exit)

def _setup_all_loggers(loglevel=DEFAULT_LOGGING_LEVEL, refresh=False):
    for logfile in all_logs:
        utils.setup_logging(logfile, loglevel, refresh)


class ModinputJobSource(js.JobSource):

    def __init__(self, tasks):
        self._done = False
        self._job_q = queue.Queue()
        self.put_jobs(tasks)

    def put_jobs(self, jobs):
        for job in jobs:
            self._job_q.put(job)

    def get_jobs(self, timeout=1):
        jobs = []
        try:
            while 1:
                jobs.append(self._job_q.get(timeout=timeout))
        except queue.Empty:
            return jobs


class CISCO_UCS_TASK(smi.Script):

    def __init__(self):
        super(CISCO_UCS_TASK, self).__init__()

    def get_scheme(self):
        scheme = smi.Scheme('cisco_ucs_task')
        scheme.description = 'Input'
        scheme.use_external_validation = True
        scheme.streaming_mode_xml = True
        scheme.use_single_instance = True

        scheme.add_argument(
            smi.Argument(
                'name',
                title='Name',
                description='Name',
                required_on_create=True
            )
        )
        
        scheme.add_argument(
            smi.Argument(
                'description',
                required_on_create=False,
            )
        )
        
        scheme.add_argument(
            smi.Argument(
                'interval',
                required_on_create=True,
            )
        )
        
        scheme.add_argument(
            smi.Argument(
                'servers',
                required_on_create=True,
            )
        )
        
        scheme.add_argument(
            smi.Argument(
                'templates',
                required_on_create=True,
            )
        )
        
        return scheme

    def validate_input(self, definition):
        return

    def _get_file_change_handler(self, data_loader, meta_configs):
        def reload_and_exit(changed_files):
            changed = [f for f in changed_files if not f.endswith(".signal")]
            if changed:
                _LOGGER.info("Reload conf %s", changed)
                conf.reload_confs(changed, meta_configs[SESSION_KEY],
                                meta_configs["server_uri"])
            data_loader.tear_down()

        return reload_and_exit

    def stream_events(self, inputs, ew):
        meta_configs = self._input_definition.metadata
        conf_objs = []
        input_conf = {}
        for input_name, input_item in inputs.inputs.items():
            input_item["name"] = input_name
            input_conf[input_name] = input_item

        try:
            servers_cfm = conf_manager.ConfManager(
                meta_configs[SESSION_KEY],
                APP_NAME,
                realm="__REST_CREDENTIAL__#{}#configs/conf-{}".format(APP_NAME, constants.SERVERS_CONF))

            templates_cfm = conf_manager.ConfManager(
                meta_configs[SESSION_KEY],
                APP_NAME,
                realm="__REST_CREDENTIAL__#{}#configs/conf-{}".format(APP_NAME, constants.TEMPLATES_CONF))

            settings_cfm = conf_manager.ConfManager(
                meta_configs[SESSION_KEY],
                APP_NAME,
                realm="__REST_CREDENTIAL__#{}#configs/conf-{}".format(APP_NAME, constants.SETTINGS_CONF_FILE))

            #Read servers, templates and settings conf files into variables
            _LOGGER.debug("Read servers, templates, settings conf files")
            splunk_ta_cisco_ucs_settings_conf = settings_cfm.get_conf("splunk_ta_cisco_ucs_settings", refresh=True).get_all()
            loglevel = splunk_ta_cisco_ucs_settings_conf["logging"].get("loglevel", DEFAULT_LOGGING_LEVEL)
            _setup_all_loggers(loglevel, refresh=True)
            try:
                cisco_ucs_servers_conf = servers_cfm.get_conf(constants.SERVERS_CONF, refresh=True).get_all()
            except conf_manager.ConfManagerException as e:
                _LOGGER.info("No server configurations found for this add-on. To start data collection, configure new "
                             "server on Configurations page and link it to an input on Inputs page. Exiting TA..")
                return

            try:
                cisco_ucs_templates_conf = templates_cfm.get_conf(constants.TEMPLATES_CONF, refresh=True).get_all()
            except conf_manager.ConfManagerException as e:
                _LOGGER.info("No template found for this add-on. To start data collection, configure new "
                             "template on Configurations page and link it to an input on Inputs page. Exiting TA..")
                return
            
            conf_objs.append(cisco_ucs_servers_conf)
            conf_objs.append(cisco_ucs_templates_conf)
            conf_objs.append(input_conf)
            conf_objs.append(splunk_ta_cisco_ucs_settings_conf)

            tasks = []
            for _, task in conf_objs[2].items():
                task_configs = self._get_server_and_task_template_info_for_task(
                    task, conf_objs[0], conf_objs[1])
                if task_configs:
                    tasks.extend(task_configs)
            
            log_level = DEFAULT_LOGGING_LEVEL
            for k, v in conf_objs[-1].items():
                if "loglevel" in v:
                    log_level = v["loglevel"]
                    break

            for task_config in tasks:
                task_config["log_level"] = log_level

            if not tasks:
                _LOGGER.info("Data collection for Cisco UCS is not fully configured. "
                     "Please make sure you have configured tasks, and the "
                     "UCS manager and task template referenced by the tasks "
                     "are correctly configured. Refer to ta_app_conf.log for "
                     "more details. Do nothing and quit the TA.")
                return

            filtered_tasks = []

            # Filtered endpoint based on task, if one task have serveral task
            # templates, and some of them have dup class ids, clean them up to
            # avoid dup data collection
            _LOGGER.debug("Proceeding to filter out the tasks")
            existing_class_ids = {}
            for task in tasks:
                if not self._validate_task(task):
                    continue
                content = task["content"].strip()
                classids = []

                for class_id in content.split(","):
                    class_id = class_id.strip()
                    if not class_id:
                        continue

                    cid = "``".join((task["server_url"], task["name"], class_id))
                    if cid not in existing_class_ids:
                        task_and_temp = (task["name"], task["task_template"], task["server_url"])
                        existing_class_ids[cid] = task_and_temp
                    else:
                        _LOGGER.warning("class id=%s already specified in task=%s, "
                                    "template=%s for UCS manager=%s, will have "
                                    "dup data collection.", class_id,
                                    existing_class_ids[cid][0],
                                    existing_class_ids[cid][1],
                                    existing_class_ids[cid][2])
                    classids.append(class_id)


                task["url"] = task["server_url"].strip()
                task["username"] = task["account_name"].strip()
                task["password"] = task["account_password"].strip()
                task["class_ids"] = classids
                task["duration"] = int(task["interval"])

                for k in ("server_url", "account_name", "account_password",
                        "content"):
                    del task[k]
                filtered_tasks.append(task)

            writer = event_writer.EventWriter()
            job_src = ModinputJobSource(filtered_tasks)
            job_factory = jf.CiscoUcsJobFactory(job_src, writer)
            job_scheduler = sched.JobScheduler(job_factory)
            data_loader = dl.GlobalDataLoader.get_data_loader(filtered_tasks, job_scheduler, writer)
            callback = self._get_file_change_handler(data_loader, meta_configs)
            conf_monitor = CiscoUcsConfMonitor(callback)
            data_loader.add_timer(conf_monitor.check_changes, time.time(), 60)
            _setup_signal_handler(data_loader)
            data_loader.run()

        except Exception:
            _LOGGER.error("An error occured while modular input data collection. Traceback: %s", traceback.format_exc())

    def _validate_task(self, task):
        """
        this method will validate values of the fields for a task
        """
        
        is_task_valid = 1

        if not task.get("content"):
            _LOGGER.error("No class id specified for task=%s and template=%s",
                        task["name"], task["task_template"])
            is_task_valid = 0

        if not task.get("server_url"):
            _LOGGER.error("UCS Manager host is empty for task=%s.", task["name"])
            is_task_valid = 0
        elif not task.get("account_name") or not task.get("account_password"):
            _LOGGER.error("Credentials not configured for UCS Manager host %s in "
                        "task=%s", task["url"], task["name"])
            is_task_valid = 0
        
        try:
            _ = int(task["interval"])
        except ValueError:
            is_task_valid = 0
            _LOGGER.error("The interval=%s is not a integer for task=%s.", task["interval"], task["name"])

        return is_task_valid
    
    def _extract(self, x):
        for item in x.split("|"):
            for y in item.split(","):
                y = y.strip()
                yield y

    def _create_task_config(self, task, task_template, remote_server):
        """
        interval in task overrides interval in remote_server
        """

        template_name = task_template["template_name"]
        task_config = {"task_template": template_name}
        task_config.update(task_template)
        task_config.update(remote_server)
        task_config.update(task)

        required_keys = ("account_name", "account_password", "server_url",
                         "content", "index", "interval", "disabled")
        msg = "Required key={} not in found"
        for k in required_keys:
            if k not in task_config:
                _LOGGER.error(msg.format(k))
                raise Exception(msg.format(k))
        return task_config

    def _get_task_templates_for_task(self, task, task_templates):
        templates = {}
        ns_templates = self._extract(task["templates"])
        for temp_name in ns_templates:
            if temp_name in task_templates:
                templates[temp_name] = task_templates[temp_name]
            else:
                msg = ("{0} task template referenced in tasks conf, but not "
                       "defined or disabled in templates conf").format(
                           temp_name)
                _LOGGER.error(msg)

        if not templates:
            msg = "No valid task templates found for task {0}".format(
                task["name"])
            _LOGGER.error(msg)

        return templates

    def _get_task_template_info_for_task(self, task, server_stanza,
                                         remote_server, task_templates):
        task_configs = []
        templates = self._get_task_templates_for_task(
            task, task_templates)
        for name, template in templates.items():
            template["template_name"] = name
            task_config = self._create_task_config(
                task, template, remote_server)
            task_configs.append(task_config)
        return task_configs

    def _get_server_and_task_template_info_for_task(self, task, remote_servers,
                                                    task_templates):
        task_configs = []
        if not task.get("servers"):
            _LOGGER.error('No servers configured for the input "{}"'.format(task.get("name")))
            return None
        if not task.get("templates"):
            _LOGGER.error('No templates configured for the input "{}"'.format(task.get("name")))
            return None
        ns_servers = self._extract(task["servers"])
        for server_stanza in ns_servers:
            if server_stanza in remote_servers:
                remote_server = remote_servers[server_stanza]
                configs = self._get_task_template_info_for_task(
                    task, server_stanza, remote_server, task_templates)
                task_configs.extend(configs)
            else:
                msg = ('task "{}" is attached with invalid/deleted server "{}".').format(
                           task["name"],server_stanza)
                _LOGGER.error(msg)
        return task_configs


if __name__ == '__main__':
    exit_code = CISCO_UCS_TASK().run(sys.argv)
    sys.exit(exit_code)