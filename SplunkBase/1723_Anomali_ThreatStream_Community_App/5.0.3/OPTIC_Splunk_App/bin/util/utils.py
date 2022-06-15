import time, dateutil.parser
import calendar, datetime

#Timestamp is a datetime object in UTC time
def UTC_time_to_epoch(timestamp):
  epoch = calendar.timegm(timestamp.utctimetuple())
  return epoch
  
def _parse_time(timestr, logger, conver_from_utc=True):
    parser = dateutil.parser.parser()
    try:
        date = unicode(timestr)  # the parser needs unicode string
        dt = parser.parse(date)
        if conver_from_utc:
            return int(UTC_time_to_epoch(dt))
        else:
            return int(time.mktime(dt.timetuple()))
    except Exception as e:
        logger.error("unknown date: %s" % timestr)
        logger.exception(e)
        return 0
    
def get_runtime_state(prop, kvsm):
    data = kvsm.get_kvs_item_by_id('ts_runtime_states', prop)
    return data

def set_runtime_states_batch(data, kvsm):
    kvsm.add_kvs_batch('ts_runtime_states', data)
    
def is_false_pos(indicator, kvsm):
    if not indicator:
        return False
    falpos_kvs = kvsm.get_kvs('ts_ioc_falsepos',  {'indicator' : indicator})
    return not (not falpos_kvs)
