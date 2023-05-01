#!/usr/bin/python
# By: PJ Balsley
# Purpose: To print out temperature from Dallas sensor for splunk logs.
# Copyright 2016
#

#- Import needed modules
import os
import glob
import time
import datetime
import fnmatch
import socket
import sys


#- Enable 1-wire kernal support.
#- requires root, so instead is executed vi /etc/modules
#os.system('modprobe w1-gpio')
#os.system('modprobe w1-therm')


#- Setup base values.
base_dir = "/sys/bus/w1/devices/"
date_log = str(datetime.datetime.now())
mypid = str(os.getpid())
hostname = socket.gethostname()
List = []


#- Find all 1-wire devices.
for subdir, dirs, files in os.walk(base_dir):
  for dir in fnmatch.filter(dirs, "28-*"):
    tmpdir = os.path.join(subdir, dir)
    List.append(os.path.join(tmpdir, 'w1_slave'))


#- Read raw data from w1 device log.
def read_temp_raw(device):
  error_data = ""
  raw_temp = ""

  f = open(device, 'r')
  data = f.readlines()
  f.close()

  if data[0].strip()[-3:] == 'YES':
    raw_temp = data[1][data[1].find('t=')+2:]

    try:
      #error check that raw_temp is a number, or errors.
      if not float(raw_temp)==0:
        bad1 = 1
    except:
      #format error log to send into splunk internal error messages.
      error_data = date_log + " " + hostname + " get_temp.py[" + mypid + "]: ERROR sensor=" + device_name + ", error=" + str(raw_temp) 
      sys.stderr.write(error_data + "\n")

      #set the raw temp to 0 so that the logs will continue to work.
      raw_temp = "0"
      pass

  return raw_temp
 

#- Get each device sensor temperature.
for device in List:
  device_name = ""
  temp = ""
  temp_c = ""
  temp_f = ""
  finaldata = ""

  device_name = device.split('/')[5]
  temp = float(read_temp_raw(device))

  temp_c = temp / 1000.0
  temp_f = temp_c * 9.0 / 5.0 + 32.0

  #-Format and return the output.
  finaldata = date_log + " " + hostname + " get_temp.py[" + mypid + "]: sensor=" + device_name +", temp_c=" + str(temp_c) + ", temp_f=" + str(temp_f) + ", temp_raw=" + str(temp)
  sys.stdout.write(finaldata + "\n")

# EOF
