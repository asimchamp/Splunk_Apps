import sys, os, csv, re, string
from stemmer import PorterStemmer
from terms import *

g_PSTEMMER = PorterStemmer()

MIN_TOKEN_LEN = 2
MAX_PHRASE_LEN = 7
g_PUNCT = '~`!#^*()+={}[]&|\\;:"\'<>?,./$%@'
g_rePUNCT = g_PUNCT.replace(']', '\\]')

def usage():
    raise Exception("Usage: run [field=<field>] [minlen=<int>] [type=full]  [deaccent=true] [hiii=true] [stem=true]")

def getParameters():
    argcount = len(sys.argv)

    field="_raw"
    minlen = 1
    ptype="basic"
    deaccent=False
    hiii = False
    stem=False
    params = re.findall('(\\w+)\s*=\s*"?(\\w+)', " ".join(sys.argv))
    for k,v in params:
        v = v.lower()
        if k=="field":
            field=v
        elif k=="minlen":
            try:
                v = int(v)
            except:
                raise usage()
            minlen=v
        elif k=="type":
            if v=="full":
                ptype=v
            else:
                usage()
        elif k=="hiii":
            v = v.startswith("t") or v.startswith("y") or v == "1"
            hiii = v
        elif k=="stem":
            v = v.startswith("t") or v.startswith("y") or v == "1"
            stem = v
        elif k=="deaccent":
            v = v.startswith("t") or v.startswith("y") or v == "1"
            deaccent = v
        else:
            usage()
        
    return field, (minlen, ptype, deaccent, hiii, stem)

import unicodedata

def not_combining(char):
        return unicodedata.category(char) != 'Mn'


def strip_accents(text, encoding):
        unicode_text= unicodedata.normalize('NFD', text.decode(encoding))
        return filter(not_combining, unicode_text).encode(encoding)

# greeeeeat->great, hiiiiiiiii->hi
RE_DEDUP = re.compile("([a-z])(\\1){2,}")
def detardedToken(token):
    return RE_DEDUP.sub("\\1", token)

def process(text, options):
    minlen, ptype, deaccent, hiii, stem = options
    if deaccent == True:
        text = strip_accents(text, 'utf-8')
    if ptype=="full":
        tokens = re.split("([%s\\s])+" % g_rePUNCT, text.lower())
    else:
        #tokens = re.split("([^\\w'])+", text.lower())
        tokens = re.split("([^a-z])+", text.lower())

    #print "TOKENS:", tokens
    phrases = []
    phrase = []
    for tok in tokens:
        if tok.isspace():
            continue
        punct = tok in g_PUNCT
        stopper = tok in g_STOPWORDS or punct or len(tok) < MIN_TOKEN_LEN
        if stem:
            tok = g_PSTEMMER.stemWord(tok)
        if hiii:
            tok = detardedToken(tok)
        if stopper or len(phrase) > MAX_PHRASE_LEN: # prevent really long phrases in foreign languages
            #print "TOK:", tok, "PHRASE:", phrase, stopper
            phrase = []
        else:
            phrase.append(tok)
            #print "TOK:", tok, "PHRASE:", phrase, stopper
            for i in xrange(0, len(phrase)):
                subphrase = phrase[i:]
                if len(subphrase) >= minlen and subphrase[0] not in g_PUNCT  and subphrase[-1] not in g_PUNCT:
                    ptext = " ".join(subphrase)
                    phrases.append(ptext)
    if len(phrases) == 0:
        phrases.append(text)
    #print "PHRASS", phrases
    return phrases

# copied from Intersplunk
def getEncodedMV(vals):
    s = ""
    for val in vals:
        val = val.replace('$', '$$')
        if len(s):
            s += ';'
        s += '$' + val + '$'
    return s

#def toUTF8(value):
#    if isinstance(value, unicode):
#        return value.encode('utf-8')
#    return value

def unicode_csv_reader(utf8_data, dialect=csv.excel, **kwargs):
    csv_reader = csv.reader(utf8_data, dialect=dialect, **kwargs)
    for row in csv_reader:
        try:
            yield [unicode(cell, 'utf-8') for cell in row]
        except Exception, e:
            yield row


if __name__ == '__main__':

    try:

        field, options = getParameters()

        fieldpos = None
        # set max field size to max
        csv.field_size_limit(sys.maxint)
        #rows = [r for r in csv.reader(sys.stdin)]
        rows = [r for r in unicode_csv_reader(sys.stdin)]


        OUTFIELD = 'token'
        OUTFIELDMV = '__mv_token'

        outrows = []
        # for each row                                                                                                                                                    
        for row in rows:
            # if this is the first row, find the column position of the source text field                                                                                 
            if fieldpos == None:
                for i, col in enumerate(row):
                    if col == field:
                        fieldpos = i
                        break
                if fieldpos == None:
                    if len(rows) > 1:
                        raise Exception('Search results do not have the specified text field: "%s" row: "%s" count: "%s"' % (field, row, len(rows)))
                    else:
                        break

                outfield_pos   = row.index(OUTFIELD) if OUTFIELD in row else -1
                outfieldmv_pos = row.index(OUTFIELDMV) if OUTFIELDMV in row else -1
                if outfield_pos < 0:   row.append(OUTFIELD)
                if outfieldmv_pos < 0: row.append(OUTFIELDMV)

                #llog("FIELDPOS %s MVFIELDPOS %s ROW %s" % (outfield_pos, outfieldmv_pos, row))
            else:
                text = row[fieldpos]
                tokens = process(text, options)
                # append on phrases value in the last column                                                                                                              
                #llog("TEXT=%s TOKENS=%s" % (text, tokens))
                val = "\n".join(tokens)
                mvval = getEncodedMV(tokens)
                if outfield_pos < 0:
                    row.append(val)
                else:
                    row[outfield_pos] = val
                if outfieldmv_pos < 0:
                    row.append(mvval)
                else:
                    row[outfieldmv_pos] = mvval

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
    
