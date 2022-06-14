import os, os.path
import sys
import tarfile
import shutil
from datetime import datetime
import time
from ConfigParser import ConfigParser
from fileinput import filename

TAR_PREFIX = "ts_summary_"
TAR_SURFIX = ".tar.gz"
SECTION = 'myclient'

def escape_strings(filename, logger=None):
    filename_tmp = filename + datetime.now().strftime('%Y-%m-%dT%H-%M-%S.%f')
    touched = False
    with open(filename, "rb") as read_file, open(filename_tmp, "wb") as write_file:
        for line in read_file:
            new_line = line.replace('\\', '\\\\')
            write_file.write(new_line)
            if new_line != line:
                touched = True
    if touched:
        os.remove(filename)
        os.rename(filename_tmp, filename)
    else:
        os.remove(filename_tmp)
    if logger:
        logger.info('touched: %s, escape_strings called for file: %s' % (touched, filename))
                        
class SummaryConfig(object):
    def __init__(self, config_file, logger=None):
        self.config_file = config_file
        self.logger = logger

    def create(self, section=SECTION, data=None):
        with open(self.config_file, "w") as config_handler:
            config = ConfigParser()
            config.add_section(section)
            for key, value in data.items():
                config.set(section, key, value)
            config.write(config_handler)

    def get_options(self, section=SECTION):
        config = ConfigParser()
        config.read(self.config_file)
        dict = {}
        for option in config.options(section):
            dict[option] = config.get(section, option)
        return dict

    def set_options(self, section=SECTION, options={}):
        config = ConfigParser()
        config.read(self.config_file)
        for key, value in options.items():
            config.set(section, key, value)
        with open(self.config_file, "w+") as file_handler:
            config.write(file_handler)

class SummaryBundle(object):
    def __init__(self, working_dir, dest_dir, config_file, logger=None):
        self.working_dir = working_dir
        self.dest_dir = dest_dir
        self.config_file = os.path.basename(config_file)
        options = SummaryConfig(config_file).get_options(SECTION)
        self.search_time = float(options['starttime'])
        self.hash_type = options['hash']
        self.logger = logger

    def _get_bundle_name(self):
        date_str = datetime.utcfromtimestamp(self.search_time).strftime("%Y%m%d")
        timestamp = int(time.time())
        tar_file_name = TAR_PREFIX + str(timestamp) + "_" + date_str + TAR_SURFIX
        return (tar_file_name, timestamp, date_str)


    def create_bundle(self):
        cur_dir = os.getcwd()
        os.chdir(self.working_dir)
        (tar_file_name,timestamp,date_str) = self._get_bundle_name()
        is_empty = True
        with tarfile.open(tar_file_name, "w:gz") as tar_handler:
            if os.path.exists(self.config_file):
                tar_handler.add(self.config_file)
            for root, dirs, files in os.walk(self.working_dir):
                for filename in files:
                    if filename.endswith('summary.csv') and os.path.getsize(filename) > 0:
                        is_empty = False
                        if len(self.hash_type) != 0 :
                            hash_file = filename + "." + self.hash_type
                            escape_strings(hash_file, self.logger)
                            tar_handler.add(hash_file)
                        else:
                            escape_strings(filename, self.logger)
                            tar_handler.add(filename)
        if is_empty:
            if self.logger:
                self.logger.info("No summary files are added to %s, remove it" % tar_file_name)
            print("No summary files are added to %s, remove it" % tar_file_name)
            os.remove(tar_file_name)
        else:
            shutil.move(tar_file_name, self.dest_dir)
        os.chdir(cur_dir)
        if is_empty:
            return (None, None, None)
        else:
            bundle_name = os.path.join(self.dest_dir, tar_file_name)
            return (bundle_name, timestamp, date_str)

if __name__ == '__main__':
    filename = 'src_dest_summary.csv'
    escape_strings(filename)