
# encoding = utf-8

from email import header
import os
import string
import sys
import time
import datetime
from dataclasses import dataclass
from pathlib import Path
from atomicfile import AtomicFile
from TA_etintel_consts import VERSION
from zlib import MAX_WBITS, decompress
from csv import DictReader, DictWriter
import logging
from hashlib import md5

logger = logging.getLogger()

@dataclass
class RuleFile:
    src_file: str
    md5_file: str
    output_file: str
    header: str = ""

RULE_FILES = [
    RuleFile(src_file="detailed-iprepdata.txt.gz", md5_file="detailed-iprepdata.txt.gz.md5sum", output_file="iprepdata.csv"),
    RuleFile(src_file="detailed-domainrepdata.txt.gz", md5_file="detailed-domainrepdata.txt.gz.md5sum", output_file="domainrepdata.csv"),
    RuleFile(src_file="categories.txt", md5_file="categories.txt.md5sum", output_file="categories.csv", header="category,name,description\n")
]

def lookup_filepath(file_path):
    return str(lookup_dir() / file_path)

def lookup_dir() -> Path:
    return bin_dir() / '..' / 'lookups'

def bin_dir() -> Path:
    return Path(__file__).parent.resolve()


class ETRuleFileDownloader:
    def __init__(self, helper, lookup_dir):
        self.helper = helper
        self.lookup_dir = lookup_dir
        self.auth_code = helper.get_global_setting("authorization_code")

    def _make_url(self, file_name):
        return "https://rules.emergingthreatspro.com/{0}/reputation/{1}".format(self.auth_code, file_name)

    def _make_output_path(self, rule_file: RuleFile) -> Path:
        return self.lookup_dir / Path(rule_file.output_file)

    def download_rule(self, rule_file: RuleFile):
        try:
            resp_data = self._fetch_file(rule_file.src_file)
            resp_md5 = self._fetch_file(rule_file.md5_file)
            checksum = resp_md5.content.rstrip().decode("utf-8") 

            if md5(resp_data.content).hexdigest() != checksum and self.helper.get_arg("check_file_integrity"):
                msg = "MD5 mismatch detected for {}: {} != {}".format(rule_file.src_file, checksum, md5(resp_data.content).hexdigest())
                self.helper.log_error(msg)
                raise Exception(msg)
            output_path = self._make_output_path(rule_file)
            
            with AtomicFile(output_path, 'w') as f_out:
                f_out.write(rule_file.header)
                if rule_file.src_file.endswith('.gz'):
                    decompressed_data = decompress(resp_data.content, 16 + MAX_WBITS).decode("utf-8")
                    f_out.write(decompressed_data)
                else:
                    f_out.write(resp_data.text)

                self.helper.log_info("Wrote to {}".format(output_path))
        except Exception as e:
            self.helper.log_error(e)
            raise e

    def _fetch_file(self, filename):
        url = self._make_url(filename)
        headers = {
        "User-Agent": "ET-SPLUNK-TA ({})".format(VERSION)
        }
        response = self.helper.send_http_request(url, "get", headers=headers)
        response.raise_for_status()
        return response



def read_csv2dict(csvfile):
    with open(csvfile, 'r') as f:
        header = [h.strip() for h in f.readline().split(",")]
        reader = DictReader(f, fieldnames=header)
        data = [el for el in reader]
        count = 0
        for dic in data:
            dic.update({'id': count + 1})
            data[count] = dic
            count += 1
        return (header, data)


def write_dict2csv(data, csvfile, header):
    count = 0
    for dic in data:
        dic.pop('id')
        data[count] = dic
        count += 1
    with open(csvfile, 'w') as f:
        # header = dic[0].keys()
        writer = DictWriter(f, fieldnames=header, lineterminator='\n')
        writer.writeheader()
        for row in data[1:]:
            writer.writerow(row)


def index_array(array, key):
    dic = {}
    for line in array:
        dic[line[key]] = line
    return dic
    
def unindex_array(array):
    return [item for item in array.values()]


def normalise(ltbl, rtbl, rkey, cols):
    for k, v in ltbl.items():
        rval = v[rkey]
        for col in cols:
            try:
                val = rtbl[rval][col]
                v.update({col: val})
                ltbl[k] = v
            except KeyError as e:
                logger.error("%s doesn't have corresp category: %s", v, rval)
                logger.error(e)
    return ltbl


def combine_data(helper):
    _, categories = read_csv2dict(lookup_filepath("categories.csv"))
    _, threats = read_csv2dict(lookup_filepath("cat.threat.csv"))
    # Combine IP Data
    helper.log_debug("normalising iprepdata")
    ip_cols, ipdict = read_csv2dict(lookup_filepath("iprepdata.csv"))
    helper.log_debug("adding category info to iprepdata")
    helper.log_debug(str(categories))
    ipdict1 = normalise(
        index_array(ipdict, 'id'),
        index_array(categories, 'category'),
        rkey="category",
        cols=("name", "description"))
    helper.log_debug("adding threat info to iprepdata")
    ipdict2 = normalise(ipdict1,
                        index_array(threats, 'category'),
                        rkey="category",
                        cols=("threat", ))
    ip_cols += ['name', 'description', 'threat']
    write_dict2csv(
        unindex_array(ipdict2),
        lookup_filepath("combined.ip.csv"),
        header=ip_cols)

    # Combine Domain Data
    helper.log_debug("normalising domainrepdata")
    dom_cols, domaindict = read_csv2dict(lookup_filepath("domainrepdata.csv"))
    helper.log_debug("adding category info to domainrepdata")
    domaindict1 = normalise(
        index_array(domaindict, 'id'),
        index_array(categories, 'category'),
        rkey="category",
        cols=("name", "description"))
    helper.log_debug("adding threat info to domainrepdata")
    domaindict2 = normalise(domaindict1,
                            index_array(threats, 'category'),
                            rkey="category",
                            cols=("threat", ))
    dom_cols += ['name', 'description', 'threat']
    write_dict2csv(
        unindex_array(domaindict2),
        lookup_filepath("combined.domain.csv"),
        header=dom_cols)



def validate_input(helper, definition):
    """Implement your own validation logic to validate the input stanza configurations"""
    # This example accesses the modular input variable
    # check_file_integrity = definition.parameters.get('check_file_integrity', None)
    pass

def collect_events(helper, ew):
    helper.log_info("starting update_repdata")

    et_downloader = ETRuleFileDownloader(helper, lookup_dir())

    for rule_file in RULE_FILES:
        try:
            et_downloader.download_rule(rule_file)
        except Exception as e:
            helper.log_error("error downloading update_repdata rule files: {}".format(e))
            return 1
    helper.log_info("downloaded update_repdata rule files")

    combine_data(helper)

    helper.log_info("successfully generated update_repdata files")

    