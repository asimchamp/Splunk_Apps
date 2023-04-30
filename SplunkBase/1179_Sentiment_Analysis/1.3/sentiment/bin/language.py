import sys, os, csv, langdetect

if __name__ == '__main__':

    try:
        argcount = len(sys.argv)
        if argcount > 2 :
            raise Exception("Usage: [<field>]")
        srcfield = "_raw"
        if argcount == 2:
            srcfield = sys.argv[1]

        ng = langdetect.NGramClassifier("language_model.json")

        fieldpos = None

        # set max field size to max
        csv.field_size_limit(sys.maxint)
        rows = [r for r in csv.reader(sys.stdin)]
        outrows = []
        # for each row
        for row in rows:
            # if this is the first row, find the column position of the source text field
            if fieldpos == None:
                for i, col in enumerate(row):
                    if col == srcfield:
                        fieldpos = i
                        break
                if fieldpos == None:
                    raise Exception('Search results do not have the specified text field: "%s"' % srcfield)

                # add on the sentiment column as the last column
                row.append('language')
            else:
                text = row[fieldpos]
                language = ng.bestMatch(text, langdetect.bias_table)
                # append on sentiment value in the last column
                row.append(language)

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
