import hashlib
import csv
import os, shutil
import math
from datetime import datetime

class SummaryHash(object):
    def __init__(self, csv_file, hash_type, error_rate=0.001, logger=None):
        self.csv_file = csv_file
        file_name = os.path.basename(csv_file)
        self.field_name = file_name[0:-12]
        self.hash_type = hash_type
        self.error_rate = error_rate
        self.logger = logger

    def _get_digest(self, value, hash=None):
        h = None
        if hash is None:
            return value
        if hash == 'md5':
            h = hashlib.md5()
        else:
            if hash == 'sha1':
                h = hashlib.sha1()
            else:
                if hash == 'sha256':
                    h = hashlib.sha256()
                else:
                    return value
        h.update(value)
        return h.hexdigest()

    def _gen_hash(self, hash_file):
        with open(self.csv_file, "rb") as csv_handler, open(hash_file, "wb") as hash_handler:
            csv_reader = csv.reader(csv_handler)
            csv_writer = csv.writer(hash_handler)
            first_row = None
            try:
                first_row = csv_reader.next()
            except StopIteration, e:
                return hash_file
            index = first_row.index(self.field_name)
            csv_writer.writerow(first_row)
            for row in csv_reader:
                row[index] = self._get_digest(row[index], self.hash_type)
                csv_writer.writerow(row)
            return hash_file

    def _calculate_initial_capacity(self, error_rate):
        capacity = 0
        with open(self.csv_file) as file_handler:
            capacity = sum(1 for line in file_handler)
        k = int(math.ceil(math.log(1.0 / error_rate, 2)))
        m = int(math.ceil(
                (capacity * abs(math.log(error_rate))) /
                (k * (math.log(2) ** 2))))
        return k*m

    def _gen_bloomfilter(self, bloom_file):
        try:
            from pybloom import ScalableBloomFilter
        except ImportError:
            print("Failed to load pybloom")
        error_rate = self.error_rate
        capacity = self._calculate_initial_capacity(error_rate)
        sbf = ScalableBloomFilter(initial_capacity=capacity, error_rate=error_rate,  mode=ScalableBloomFilter.SMALL_SET_GROWTH)
        with open(self.csv_file, "rb") as csv_handler, open(bloom_file, "wb") as output_handler:
            csv_reader = csv.reader(csv_handler)
            first_row = None
            try:
                first_row = csv_reader.next()
            except StopIteration, e:
                del sbf
                return bloom_file
            index = first_row.index(self.field_name)
            for row in csv_reader:
                sbf.add(row[index])
            sbf.tofile(output_handler)
        del sbf
        return bloom_file

    def gen_hash(self):
        if len(self.hash_type) == 0:
            return self.csv_file
        hash_file = self.csv_file + "." + self.hash_type
        start_time = datetime.now()
        if self.hash_type == 'bloomfilter':
            self._gen_bloomfilter(hash_file)
        else :
            self._gen_hash(hash_file)
        if self.logger:
            self.logger.info("It takes %s to generate hash for %s" % ((datetime.now() - start_time), hash_file))
        else:
            print("It takes %s to generate hash for %s" % ((datetime.now() - start_time), hash_file))
        return hash_file
