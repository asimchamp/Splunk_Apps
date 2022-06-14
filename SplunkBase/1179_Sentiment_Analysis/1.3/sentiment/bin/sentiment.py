import sys, os, csv, train



def getParameters():
    argcount = len(sys.argv)
    if argcount > 3:
        raise Exception("Usage: run   <modelname> <field>  (defaults to 'model' and '_raw')")
        
    modelname = "model"
    if argcount >= 2:
        modelname = sys.argv[1]

    if ".." in modelname or "/" in modelname or "\\" in modelname:
        raise Exception("Model name cannot contain cannot contain '..', '/', or '\\'.")

    for dir in ['local','default']:
        modelfile = os.path.join(__file__, "..", "..", dir ,"%s.json" % modelname)
        modelfile = os.path.abspath(modelfile)
        if os.path.exists(modelfile):
            break
    else:
        raise Exception("Cannot find model file: '%s'" % modelname)

    srcfield = "_raw"
    if argcount == 3:
        srcfield = sys.argv[2]
    return modelfile, srcfield

if __name__ == '__main__':

    try:
        modelfile, srcfield = getParameters()

        fieldpos = None
        # set max field size to max
        csv.field_size_limit(sys.maxint)
        rows = [r for r in csv.reader(sys.stdin)]

        # if we're called with no results, don't bother expensive loading of the model
        model, settings = None, None
        if len(rows) > 1:
            model, settings = train.loadModel(modelfile)

        outrows = []
        # for each row
        for row in rows:
            # if this is the first row, find the column position of the source text field
            if fieldpos == None:
                fieldpos = row.index(srcfield) if srcfield in row else -1
                if fieldpos < 0:
                     raise Exception('Search results do not have the specified text field: "%s"' % srcfield)
                sentpos = row.index('sentiment') if 'sentiment' in row else -1
                if sentpos < 0:
                     row.append('sentiment')
            else:
                text = row[fieldpos]
                sentiment = train.calcSentiment(model, text, settings)
                if sentpos < 0:
                    # append on sentiment value in the last column
                    row.append(sentiment)
                else:
                    row[sentpos] = sentiment

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
    
