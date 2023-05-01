#!/usr/bin/python
#
# briang67 1/1/15
# This script connects to the blockchain.info API and uses the 
# blockexplorer module to retrieve transaction information for the 
# the most recent bitcoin block.
# The splunk data input should call the wrapper script ./bcblock.sh
# Make sure the wrapper script ./bcblock.sh has the correct full path
# to this script's location.
# 
# The script keeps track of which block to retrieve with a local key file.
# Everytime block info is retrieved the key file is updated with the new
# block height #.

# This script requires the blockchain python module, which can be installed by
# running 'pip install blockchain'.  
# Module documentation can be found here:
# https://github.com/blockchain/api-v1-client-python
# https://github.com/blockchain/api-v1-client-python/blob/master/docs/blockexporer.md

from blockchain import blockexplorer
from time import localtime,strftime
import time
import os
import sys

#Determine relative path for key file location
appdir = os.path.join(os.path.dirname(__file__)+ os.sep)
keyfile = 'key'
apppath = appdir + keyfile

#Use indexTime just to report an error. Script output will be timestamped
#using the block time.
indexTime = "[" + strftime("%m/%d/%Y %H:%M:%S %p %Z",localtime()) + "]"

default = 'NA'
latest_block = blockexplorer.get_latest_block()

try:
	block = blockexplorer.get_block(str(latest_block.block_index))
except:
	print indexTime+" "+"Error retrieving blockchain info"

#fr = open('/opt/splunk/etc/apps/bitcoin/bin/key', 'r')
fr = open(apppath, 'r')
block_read = fr.readline()
#print block_read
fr.close()

if (str(block.height) == str(block_read)):
	sys.exit()


#Use the block timestamp for the event time
blockTime = "[" + time.strftime('%m/%d/%Y %H:%M:%S UTC',time.gmtime(block.time)) + "]"

print blockTime+" "+"eventcat=block"+", "+"block_hash="+str(block.hash)+", "+"block_version="+str(block.version)+", "+"block_previous_block="+str(block.previous_block)+", "+"block_merkle_root="+str(block.merkle_root)+", "+"block_time="+str(block.time)+", "+"block_bits="+str(block.bits)+", "+"block_fee="+str(block.fee)+", "+"block_nonce="+str(block.nonce)+", "+"block_n_tx="+str(block.n_tx)+", "+"block_size="+str(block.size)+", "+"block_block_index="+str(block.block_index)+", "+"block_main_chain="+str(block.main_chain)+", "+"block_height="+str(block.height)+", "+"block_received_time="+str(block.received_time)+", "+"block_relayed_by="+str(block.relayed_by)

for tx in block.transactions:
	#print tx

	###Use transaction time for timestamp
	tx_timeConvert = "[" + time.strftime('%m/%d/%Y %H:%M:%S UTC',time.gmtime(tx.time)) + "]"
	print tx_timeConvert+" "+"eventcat=transaction"+", "+"tx_time="+str(tx.time)+", "+"tx_blockTime="+blockTime+", "+"tx_relayed_by="+str(tx.relayed_by)+", "+"tx_block_index="+str(block.block_index)+", "+"tx_doublespend="+str(tx.double_spend)+", "+"block_height="+str(tx.block_height)+", "+"tx_hash="+str(tx.hash)+", "+"tx_index="+str(tx.tx_index)+", "+"tx_version="+str(tx.version)+", "+"tx_size="+str(tx.size)


	###Use blocktime for event timestamp
	#print blockTime+" "+"eventcat=transaction"+", "+"tx_time="+str(tx.time)+", "+"tx_timeConvert="+tx_timeConvert+", "+"tx.relayed_by="+str(tx.relayed_by)+", "+"tx_block_index="+str(block.block_index)+", "+"tx_doublespend="+str(tx.double_spend)+", "+"tx_block_height="+str(tx.block_height)+", "+"tx_hash="+str(tx.hash)+", "+"tx_index="+str(tx.tx_index)+", "+"tx_version="+str(tx.version)+", "+"tx_size="+str(tx.size)
	for x in tx.inputs:
		print tx_timeConvert+" "+"eventcat=input_from, "+"block_height="+str(tx.block_height)+", "+"tx_index="+str(tx.tx_index)+",",
 		for attr in dir(x):
			if hasattr(x, attr ):
				if not attr in ['__doc__','__init__','__module__']:
					print ( "in.%s=%s," % (attr, getattr(x, attr))),
		print ""
	for x in tx.outputs:
                print tx_timeConvert+" "+"eventcat=output_to, "+"block_height="+str(tx.block_height)+", "+"tx_index="+str(tx.tx_index)+",",
                for attr in dir(x):
                        if hasattr(x, attr ):
                                if not attr in ['__doc__','__init__','__module__']:
                                        print ( "out.%s=%s," % (attr, getattr(x, attr))),
		print ""

#Update key file with new block height
fo = open(apppath, 'w')
fo.write(str(block.height))
fo.close()

