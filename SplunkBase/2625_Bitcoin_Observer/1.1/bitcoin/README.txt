briang67 1/1/15

This application connects to the blockchain.info website API to retrieve 
bitcoin blockchain data.  This is accomplished via 3 scripted inputs
which rely on a local python install (not the version bundled with Splunk) 
and the blockchain module.

The module can be installed by running 'pip install blockchain' from the 
command prompt. 

Script detail:
bcblock.py - Returns info related to the latest block. The script uses a local
key file which is updated with the block_height of the most recent block. The
script retrieves all of the transactions for each individual block.

bcchart.py - returns BTC values vs world currencies

bcstat.py - returns higher level stats for the bitcoin network

If there is a problem collecting data, attempt to run the scripts manually
by running the corresponding wrapper scripts in the bin directory - 
bcblock.sh, bcstats.sh, bcchart.sh 

Verify that the python path is correct, the blockchain module is installed and
that there is connectivity with the blockchain.info site.

Splunked data is sent to the bitcoin index. When performing manual searches
use index=bitcoin.

The "eventcat" field is used to label six different event types.
eventcat=block - high level block information
eventcat=transaction - details transaction objects for individual blocks.
eventcat=input_from - addresses that have received bitcoins and the
corresponding amounts.
eventcat=output_to - addresses that have sent bitcoins and the corresponding
amounts.
eventcat=stat - high level bitcoin network statisitics
eventcat=currency - bitcoin value vs foreign currencies

The 'block_height' field is used as a common identifier across the
block, transaction, input_from, output_to event types. 
The 'tx_index' field is used as a common identifier to link transaction
events to input_from and input_out events.

Traversing a block to a bitcoin address follows this path:

block -> transaction -> input_from
block -> transaction -> output_to

Navigation:
There are 7 views available with the app.
'Meta Stats' and 'Miner Stats' contain overview stats and trends for the
bitcoin network.  This includes the current block height, transaction trends,
hashrate, minutes between blocks, etc.

'Bitcoin Address Info' provides details on the most re-used bitcoin addresses
in the last 24 hours. Drilling down on a bitcoin address in the pie charts
provides a way to see transaction amounts for this address and a map detailing 
the location of the transaction.

A note about the accuracy of location information: Bitcoin uses peer-to-peer 
connections to share the transaction database called the "Blockchain". This
app uses the blockchain.info "Relayed by IP" address to determine location.
This is just the first IP address that blockchain.info saw broadcast the
transaction, not necessarily the IP address that originated the transaction.
Mobile wallets and non-full nodes typically do not broadcast IP information.

More detail about how IP addresses are handled on the bitcoin network
can be found here:
http://cointext.com/bitcoin-and-ip-address-privacy/

'Bitcoin Address Query' provides a form that allows a seach on a specific
bitcoin address to see historical transaction information.

'Block Explorer' provides a way to drill down to individual blocks and 
transactions to see specfic transfer amounts

'Currency Charts' provides a trend chart of bitcoin value vs a basket
of currencies

'GeoLocation' provides a world view map of recent transactions



