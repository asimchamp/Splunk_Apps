echo "$@" > /tmp/ammap_map_results.run
python $SPLUNK_HOME/etc/apps/beeware/bin/map_results.py "$@"
