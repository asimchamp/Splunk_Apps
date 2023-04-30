# Copyright (C) 2005-2011 Splunk Inc. All Rights Reserved.  Version 4.0
#
# Based on the pyrangemap.py included in the default search app
# Repurposed by Ron Naken (ron@splunk.com)
import re,sys,os,math
import splunk.Intersplunk as si

def getLabel(floor, ciel, label):

    if label == 'low':
        s = str(floor)
    elif label == 'high':
        s = str(ciel)
    elif label == 'mid':
        s = str(long(((ciel - floor) / 2) + floor))
    else:
        s = str(floor) + "-" + str(ciel)
    return s

def getRanges(options, result):
    ranges = {}
    try:
        bins = long(options.get('bins', 1))
        overlap = options.get('overlap', 'f')
        maxfield = options.get('maxfield', None)            # high field
        minfield = options.get('minfield', None)            # high field
        label = options.get('label', 'range')

        if (overlap == 'low' and label == 'low') or (overlap == 'high' and label == 'high'):
            label = 'range'

        if minfield == None:
            min = long(options.get('min', 0))                   # minimum floor
        else:
            val = result.get(minfield, None)
            if val == None:
                si.generateErrorResults("Error with minfield calculation.")
                exit(0)
            else:
                min = long(val)

        if maxfield == None:
            high = long(options.get('max', 1))
        else:
            val = result.get(maxfield, None)
            if val == None:
                si.generateErrorResults("Error with maxfield calculation.")
                exit(0)
            else:
                high = long(val)

        if high <= min:
            si.generateErrorResults("Error in min/max values.")
            exit(0)

        i  = 0
        fl = min
        size = long(((high - min) + 1)/ bins)
        while i < (bins - 1):
            if overlap == 'low':
                floor = min
            else:
                floor = fl
            if overlap == 'high':
                ciel = high
            else:
                ciel = fl + size - 1                
            ranges[getLabel(floor, ciel, label)] = (floor, ciel)
            fl += size
            i += 1

        if overlap == 'low':
            floor = min
        else:
            floor = fl
        ranges[getLabel(floor, high, label)] = (floor, high)
        return ranges

    except Exception, e:
        si.generateErrorResults("Error parsing options.")
        exit(0)
            
if __name__ == '__main__':
    try:

        keywords,options = si.getKeywordsAndOptions()

        # field=foo green[0::20] yellow[21::80] red[81::100]
        # field=foo green=0-20 yellow=21-80 red=81-100 default=black
        field = options.get('field', None)
        if field == None:
            si.generateErrorResults("'field' argument required, such as field=y")
            exit(0)

        (isgetinfo, sys.argv) = si.isGetInfo(sys.argv)
        if isgetinfo:    # outputInfo automatically calls sys.exit()
            si.outputInfo(True, False, True, False, None, True, False, [field])

        defaultval = options.get('default', 'OTHER')
        results,dummyresults,settings = si.getOrganizedResults()

        ranges = getRanges(options, results[0])

        # for each results
        for result in results:
            # get field value
            myvalue = result.get(field, None)
            myranges = []
            if myvalue != None:
                try:
                    myvalue = long(myvalue)
                    for rangename,rangeval in ranges.items():
                        if rangeval[0] <= myvalue <= rangeval[1]:
                            # allows for multiple ranges
                            myranges.append(rangename)
                except:
                    pass
            if len(myranges) == 0:
                myranges = [defaultval]
            result['range'] = ' '.join(myranges)
        si.outputResults(results)
    except Exception, e:
        import traceback
        stack =  traceback.format_exc()
        si.generateErrorResults("Error '%s'. %s" % (e, stack))
