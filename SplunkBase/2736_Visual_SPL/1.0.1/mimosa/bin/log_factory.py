import os
import logging
import StringIO

class LogFactory(object):
    logging_conf_file = None
    
    @classmethod
    def _get_logging_conf(cls):
        app_dir = os.path.join(os.path.dirname(__file__), '..')
        default_conf = os.path.join(app_dir, 'default', 'logging.conf')
        logging_conf_file = default_conf
        try:
            local_conf = os.path.join(app_dir, 'local', 'logging.conf')
            if os.path.exists(local_conf):
                conf_string = ''
                for fname in [default_conf, local_conf]:
                    with open(fname) as infile:
                        conf_string = conf_string + infile.read()
                logging_conf_file = StringIO.StringIO(conf_string)
        except Exception as e:
            # use default conf 
            pass
        return logging_conf_file

    @classmethod
    def create(cls, logger_name):
        if not cls.logging_conf_file:
            cls.logging_conf_file = cls._get_logging_conf()
            from logging.config import fileConfig
            fileConfig(cls.logging_conf_file)
        return logging.getLogger(logger_name)
        