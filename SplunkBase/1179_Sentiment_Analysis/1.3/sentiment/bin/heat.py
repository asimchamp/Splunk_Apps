import sys, os, csv, re, string
from stemmer import PorterStemmer
from terms import *
import unicodedata

g_PSTEMMER = PorterStemmer()

def usage():
    raise Exception("Usage: run [field=<field>]")

def getParameters():
    field="_raw"
    for k,v in re.findall('(\\w+)\s*=\s*"?(\\w+)', " ".join(sys.argv)):
        if k=="field":
            field=v.lower()
        else:
            usage()
    return field

# greeeeeat->great, hiiiiiiiii->hi
RE_DEDUP = re.compile("([a-z])(\\1){2,}")
def detardedToken(token):
    return RE_DEDUP.sub("\\1", token)


def process(text, red_flags):
    count = 0
    classes = set()
    text = " " + text.lower() + " " # all \W on regexes to match first char
    for classname, regex in red_flags.items():
        matchingTerms = regex.findall(text)
        count += len(matchingTerms)
        if len(matchingTerms) > 0:
            #print "TEXT:", text
            #print "PATTERN:", regex.pattern
            #print "MATCHING: '%s'" % matchingTerms
            #print "CLASSNAME:", classname
            classes.add(classname)
    return classes, count

# copied from Intersplunk
def getEncodedMV(vals):
    s = ""
    for val in vals:
        val = val.replace('$', '$$')
        if len(s):
            s += ';'
        s += '$' + val + '$'
    return s

def unicode_csv_reader(utf8_data, dialect=csv.excel, **kwargs):
    csv_reader = csv.reader(utf8_data, dialect=dialect, **kwargs)
    for row in csv_reader:
        yield [unicode(cell, 'utf-8') for cell in row]

def buildRegexes():
    red_flags = dict(g_RED_FLAGS)
    for classname, terms in red_flags.items():
        stems = set()
        regex = ""
        for term in terms:
            stem = g_PSTEMMER.stemWord(term)
            regex += "%s|" % stem
        regex = "\\W(?:%s)\\W" % regex[:-1].replace("*","\\w*") # remove last "|" and replace wildcards
        red_flags[classname] = re.compile(regex)
    return red_flags

if __name__ == '__main__':

    try:
        srcfield = getParameters()

        fieldpos = None
        csv.field_size_limit(sys.maxint)         # set max field size to max
        rows = [r for r in unicode_csv_reader(sys.stdin)]
        red_flags = buildRegexes()

        outrows = []
        # for each row
        for row in rows:
            # if this is the first row, find the column position of the source text field
            if fieldpos == None:
                fieldpos = row.index(srcfield) if srcfield in row else -1
                if fieldpos < 0:
                     raise Exception('Search results do not have the specified text field: "%s"' % srcfield)
                temperature_pos = row.index('temperature') if 'temperature' in row else -1
                if temperature_pos < 0:
                     row.append('temperature')
                emotion_pos = row.index('heat') if 'heat' in row else -1
                mvemotion_pos = row.index('__mv_heat') if '__mv_heat' in row else -1
                if emotion_pos < 0:
                     row.append('__mv_heat')
                     row.append('heat')
            else:
                text = row[fieldpos]
                classes, counts = process(text, red_flags)
                if temperature_pos < 0:
                    row.append(counts)
                else:
                    row[temperature_pos] = counts

                if len(classes) == 0:
                    classes = ["none"]
                mvclasses = getEncodedMV(classes)
                mlclasses = " \n".join(classes)
                if emotion_pos < 0:
                    # append on phrases value in the last column
                    row.append(mvclasses)
                    row.append(mlclasses)
                else:
                    row[mvemotion_pos] = mvclasses
                    row[emotion_pos] = mlclasses



        # output rows
        csv.writer(sys.stdout).writerows(rows)
        exit(0)
    except Exception, e:
        h = ["ERROR"]
        results = [ {"ERROR": e} ]
        dw = csv.DictWriter(sys.stdout, h)
        dw.writerow(dict(zip(h, h)))
        dw.writerows(results)
        exit(-1)
    
