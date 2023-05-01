#!/usr/bin/python
#
# briang67 1/1/15
# This script connects to the blockchain.info API and uses the
# exchangerates module to retrieve bitcoin exchange rates.
# The splunk data input should call the wrapper script ./bcchart.sh
# Make sure the wrapper script ./bcchart.sh has the correct full path
# to this script's location.

# This script requires the blockchain python module, which can be installed by
# running 'pip install blockchain'.
# Module documentation can be found here:
# https://github.com/blockchain/api-v1-client-python
# https://github.com/blockchain/api-v1-client-python/blob/master/docs/exchangerates.md

from blockchain import exchangerates
from time import localtime,strftime
import time
import os
import sys

indexTime = "[" + strftime("%m/%d/%Y %H:%M:%S %p %Z",localtime()) + "]"

ticker = exchangerates.get_ticker()

print indexTime+" eventcat=currency, "+"ISK="+str(ticker['ISK'].p15min)+", EUR="+str(ticker['EUR'].p15min)+", USD="+str(ticker['USD'].p15min)+", TWD="+str(ticker['TWD'].p15min)+", CHF="+str(ticker['CHF'].p15min)+", RUB="+str(ticker['RUB'].p15min)+", CLP="+str(ticker['CLP'].p15min)+", KRW="+str(ticker['KRW'].p15min)+", THB="+str(ticker['THB'].p15min)+", JPY="+str(ticker['JPY'].p15min)+", DKK="+str(ticker['DKK'].p15min)+", BRL="+str(ticker['BRL'].p15min)+", CAD="+str(ticker['CAD'].p15min)+", GBP="+str(ticker['GBP'].p15min)+", NZD="+str(ticker['NZD'].p15min)+", PLN="+str(ticker['PLN'].p15min)+", CNY="+str(ticker['CNY'].p15min)+", SEK="+str(ticker['SEK'].p15min)+", SGD="+str(ticker['SGD'].p15min)+", HKD="+str(ticker['HKD'].p15min)+", AUD="+str(ticker['AUD'].p15min) 


#print indexTime+" "+"eventcat=stat"+", "+"trade_volume_btc="+str(stats.trade_volume_btc)+", "+"miners_revenue_usd="+str(stats.miners_revenue_usd)+", "+"btc_mined="+str(stats.btc_mined)+", "+"trade_volume_usd="+str(stats.trade_volume_usd)+", "+"difficulty="+str(stats.difficulty)+", "+"minutes_between_blocks="+str(stats.minutes_between_blocks)+", "+"number_of_transactions="+str(stats.number_of_transactions)+", "+"hash_rate="+str(stats.hash_rate)+", "+"tstamp="+str(stats.timestamp)+", "+"mined_blocks="+str(stats.mined_blocks)+", "+"blocks_size="+str(stats.blocks_size)+", "+"total_fees_btc="+str(stats.total_fees_btc)+", "+"total_btc_sent="+str(stats.total_btc_sent)+", "+"estimated_btc_sent="+str(stats.estimated_btc_sent)+", "+"total_btc="+str(stats.total_btc)+", "+"total_blocks="+str(stats.total_blocks)+", "+"next_retarget="+str(stats.next_retarget)+", "+"est_trans_volume_usd="+str(stats.estimated_transaction_volume_usd)+", "+"miners_revenue_btc="+str(stats.miners_revenue_btc)+", "+"market_price_usd="+str(stats.market_price_usd)



