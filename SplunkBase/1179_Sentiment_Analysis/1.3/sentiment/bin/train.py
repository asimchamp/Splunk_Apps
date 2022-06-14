#!/usr/bin/python
# -*- coding: utf-8 -*-

import os, glob, re, math, json, csv, sys
from stemmer import PorterStemmer
from terms import *

g_PSTEMMER = PorterStemmer()

RE_EMOTICON = re.compile("(?:[<>]?[:;=][o*'-]?[)([dDpP/:}{@|\]])|(?:[)([dDpP/:}{@|]][\-o\*\']?[:;=][<>]?)")    

def getCorpus(corpdir, max_examples=-1, remove_stopwords=True, dedup=True, phrases=False, stem=False, punct=False, emo=False):
    data = []
    fnames = glob.glob("%s/*" % corpdir)
    # for each file
    for fname in fnames:
        parent, dir = os.path.split(fname)
        corename = os.path.splitext(dir)[0]
        rating = intTryParse(corename)
        if rating == None:
            print "Ignoring non-numeric file: '%s'" % dir
            continue
        # if it's a directory, we're expecting the directory to be named a number that is the score (e.g. -1, 1, 5, 10)
        if os.path.isdir(fname):
                # within the numeric directory (e.g. "5/"), process all the files as examples of score = directory name (e.g., 5)
                example_fnames = glob.glob("%s/*" % fname)
                for i, exfname in enumerate(example_fnames):
                    indicateProgress(i, '+')
                    f = open(File,"r")
                    txt = f.read().lower()
                    f.close()
                    tokens = processDoc(txt, remove_stopwords, dedup, phrases, stem, punct, emo)
                    data.append((rating, tokens))
        else:
            processSingleLineFiles(rating,  max_examples, [fname], data, remove_stopwords, dedup, phrases, stem, punct, emo)

    print "\nloaded %s reviews from %s" % (len(data), corpdir)
    return data


g_last_count = -1
def indicateProgress(count, char):
    global g_last_count

    if g_last_count != count-1:
        print "%sk" % (g_last_count/1000)
        g_last_count = count
        return
    g_last_count = count
    if count % 1000 == 0:
        if count==0:
            sys.stdout.write('\n')
        if (count>0 and (count % 80000 == 0)):
            sys.stdout.write('%sk\n' % (count/1000))
        sys.stdout.write(char)
        sys.stdout.flush()


#???handle file/not dir case
#        if os.path.isdir(fname):
#            parent, dir = os.path.split(fname)
#            rating = intTryParse(dir)
#            if rating == None:
#                print "Ignoring non-numeric directory: '%s'" % dir
#    # if too few files, assume that files are list of single line ratings
#    if len(posFiles) + len(negFiles) < 10:
#        posFiles = glob.glob("%s/pos*.txt" % dir)
#        negFiles = glob.glob("%s/neg*.txt" % dir)
#        print "Assuming single line mode"
#        half = max_examples / 2
#        processSingleLineFiles(1,  max_examples, posFiles, data, remove_stopwords, dedup, phrases, stem, punct, emo)
#        processSingleLineFiles(-1, max_examples, negFiles, data, remove_stopwords, dedup, phrases, stem, punct, emo)
#    else:
#        if max_examples > 0:
#            half = max_examples / 2
#            Files = posFiles[:half] + negFiles[:half]
#        else:
#            Files = posFiles + negFiles
#
#            for i, File in enumerate(Files):
#                if i % 1000 == 0:
#                    print '+',
#                    sys.stdout.flush()
#                rating = int(re.findall("_(\d+).txt", File)[0])
#                f = open(File,"r")
#                txt = f.read().lower()
#                f.close()
#                tokens = processDoc(txt, remove_stopwords, dedup, phrases, stem, punct, emo)
#                data.append((rating, tokens))


def intTryParse(value):
    try:
        return int(value)
    except ValueError:
        return None

def processSingleLineFiles(rating, max_examples, files, data, remove_stopwords, dedup, phrases, stem, punct, emo):
        for fname in files:
            f = open(fname,"r")
            txt = f.read().lower()
            f.close()
            lines = txt.split("\n")
            for i, line in enumerate(lines):
                if max_examples > 0 and i > max_examples:
                    print "reached max"
                    break
                indicateProgress(i, '+')
                tokens = processDoc(line, remove_stopwords, dedup, phrases, stem, punct, emo)
                data.append((rating, tokens))


def processDoc(txt, remove_stopwords, dedup, phrases, stem, punct, emo):
        tokens = re.split("[^a-z']+", txt)
        if stem:
            tokens = [g_PSTEMMER.stemWord(t) for t in tokens]
        if punct:
            punct = re.findall("[!?]", txt)
            tokens.extend(punct)
        if emo:
            emo = RE_EMOTICON.findall(txt)
            tokens.extend(emo)
        if phrases:
            pairs = []
            last = None
            for tok in tokens:
                if last != None and last not in g_STOPWORDS and tok not in g_STOPWORDS:
                    pairs.append("%s_%s" % (last, tok))
                last = tok
            tokens.extend(pairs)
        if remove_stopwords:
            tokens = [t for t in tokens if t not in g_STOPWORDS]
        if dedup:
            tokens = list(set(tokens))
        if '' in tokens:
            tokens.remove('')
        tokens = [ detardedTokens(t) for t in tokens ]
        return tokens

# greeeeeat->great, hiiiiiiiii->hi
RE_DEDUP = re.compile("([a-z])(\\1){2,}")
def detardedTokens(token):
    return RE_DEDUP.sub("\\1", token)

def calcModel(data, min_term_percent, min_prob_multiplier):

    # Estimate the probability P(c) of each class c ∈ C by dividing the number of words in documents in c by the total number of words in the corpus.
    token_counts = {}
    total_token_count = 0
    for rating, tokens in data:
        token_count = len(tokens)
        total_token_count += token_count
        token_counts[rating] = token_count + token_counts.get(rating, 0)
    # P(rating)
    prob_of_rating = {}
    for rating, count in token_counts.items():
        prob_of_rating[rating] = math.log(float(count) / total_token_count)
    
    # Estimate the probability distribution P(w | c) for all words w
    # and classes c. This can be done by dividing the count w in
    # documents in c, by the total number of words in c.
    token_rating_counts = {}
    known_tokens = set()
    term_counts = {}
    for rating, tokens in data:
        for token in tokens:
            known_tokens.add(token)
            token_rating_counts[(token, rating)] = 1 + token_rating_counts.get((token, rating), 0)
            term_counts[token] = 1 + term_counts.get(token, 0) # for removing items
    prob_token_given_rating = {}
    for (token, rating), count in token_rating_counts.items():
        prob = float(count) / token_counts[rating]
        #if token in ["good", "great", "bad", "terrible"]:
        #    print token, rating, prob
        prob_token_given_rating[(token, rating)] = math.log(prob)

    total = 0
    for v in prob_token_given_rating.values():
        total += v
    avg_prob = float(total) / len(prob_token_given_rating)

    # EXPERIEMENT IN ERASING TOKENS THAT OCCUR IN LESS THAN N% OF REVIEWS
    print "Original Token Count:", len(token_rating_counts)
    if min_term_percent != None:
        min_count = min(2, min_term_percent * len(data))
        for token, count in term_counts.items():
            if count < min_count:
                known_tokens.remove(token)
                for rating in prob_of_rating.keys():
                    key = (token, rating)
                    if key in token_rating_counts:
                        del token_rating_counts[key]
                        del prob_token_given_rating[key]
        print "After removing rare:", len(token_rating_counts)

    if min_prob_multiplier != None:
        # REMOVE TERMS THAT AREN'T HIGHLY INDICATIVE WITH RATING
        for (token, rating),prob in prob_token_given_rating.items():
            if prob < (avg_prob + min_prob_multiplier):
                key = (token, rating)
                del token_rating_counts[key]
                del prob_token_given_rating[key]
        print "After removing weakly correlated:", len(token_rating_counts)

    return (avg_prob, list(known_tokens), prob_of_rating, prob_token_given_rating)

def guessProb(prob_token_given_rating, token, rating, avg_prob):
    token = str(token)

    prob1 = prob_token_given_rating.get((token, rating+1), -1.0)
    prob2 = prob_token_given_rating.get((token, rating-1), -1.0)
    if prob1 == -1 and prob2 == -1:
        return avg_prob # 0.0 #1.0
    if prob1 == -1:
        return prob2
    return prob1


def score(model, tokens):
    avg_prob, known_tokens, prob_of_rating, prob_token_given_rating = model

    best_rating = None
    best_score = float('-inf')
    weighted_sum = 0.0
    score_sum = 0.0

    # control test.  just return the most likley rating
    ##     best_rating = -1
    ##     best_score_prob = -1000
    ##     for rating, prob in prob_of_rating.items():
    ##         if prob > best_score_prob:
    ##             best_score_prob = prob
    ##             best_rating = rating
    ##     return best_rating
        
    for rating in prob_of_rating.keys():
        probs = 0 # multiplying logs
        for token in tokens:
            # 1.0 here means ignore unknown words.  zero was too harsh! perhaps it should be something else.
            prob = prob_token_given_rating.get((token, rating), -1.0) 
            if prob == -1:
                prob = guessProb(prob_token_given_rating, token, rating, avg_prob)
            if False and prob < (avg_prob + 3):
                # skip tokens that have lower than average prob #print "skipping %s for %s" % (token, rating)
                continue
            #print "KEEPING", token, rating, prob, avg_prob
            probs += prob # we're adding logs or probs to get multiplication -- was multiplication
                
        rating_score = prob_of_rating[rating] + probs
        #print "\tP(%s) = %s" % (rating, rating_score)
        if rating_score > best_score:
            best_score = rating_score
            best_rating = rating
    #print "P(%s) = %s - %s" % (best_rating, best_score, tokens[:30])
    ##if best_rating == None:
    ##    #print "NO INFO. RETURN AVG"
    ##    return default_val
    return best_rating

## WRITE OUT BRIEF MODEL/LOOKUP-TABLE OF BEST TERMS.  AVG RATING TERM TERM
def outputModelTerms(model, modelname):

    avg_prob, known_tokens, prob_of_rating, prob_token_given_rating = model

    bestTerms = {}
    termRating = {}
    termRatingSum = {}
    for (token, rating),prob in prob_token_given_rating.items():
        if True: #prob >= (avg_prob + 3):
            if rating not in bestTerms:
                bestTerms[rating] = set()
            if token not in termRating:
                termRating[token] = 0.0
                termRatingSum[token] = 0.0
            bestTerms[rating].add(token)
            # convert from log value used to multiply lots of probs fast
            prob = math.exp(prob)
            termRating[token] += rating * prob
            termRatingSum[token] += prob
                
    tokenscores = []
    for token in termRating.keys():
        avg_rating = termRating[token] / termRatingSum[token]
        tokenscores.append((token, avg_rating))
    # sort from low to high scores, secondarily sorting by token
    tokenscores.sort(lambda x, y: 10*cmp(x[1],y[1]) + cmp(x[0],y[0]))

    lookupfilename = os.path.join("..","local","%s_lookup.csv" % modelname)

    f = open(lookupfilename,"w")
    f.write('"%s", %s\n' % ("token", "rating"))
    for token,score in tokenscores:
        f.write('"%s", %s\n' % (token, score))
    f.close()
    print 'Wrote lookup approximation to "%s"' % lookupfilename

def calcSentiment(model, text, remove_stopwords=True, dedup=True, phrases=False, stem=False, punct=False, emo=False):

    tokens = processDoc(text, remove_stopwords, dedup, phrases, stem, punct, emo)
    rating_guess = score(model, tokens)
    return rating_guess


def test(model, test_data, scoring_categories):

    error_sum = 0.0
    guesses = 0
    correct = 0
    default_val = scoring_categories[None]
    
    for i, (rating_actual, tokens) in enumerate(test_data):
        rating_guess = score(model, tokens)
        if rating_guess == None:
            rating_guess = default_val
            guesses += 1
        diff = abs(rating_actual - rating_guess)
        if scoring_categories[rating_actual] == scoring_categories[rating_guess]:
            correct += 1
            # print ":)", rating_actual
            # print ":) ACTUAL: %s GUESS: %s." % (rating_actual, rating_guess)
        # else:
            # print "!!:( ACTUAL: %s GUESS: %s." % (rating_actual, rating_guess)            
            # print "ACTUAL: %s GUESS: %s. TOKENS: %s" % (rating_actual, rating_guess, ' '.join(tokens))
            # print

        error_sum += diff * diff
    #mean squared error
    error = math.sqrt(error_sum) / len(test_data)
    correct_perc = (100 * float(correct) / len(test_data))
    print "Correct: %s%%" % correct_perc,
    print "Error:", error,
    print "Guesses: %s%%" % (100 * float(guesses) / len(test_data))
    return correct_perc
        
### from decimal import *
### def frange(start, end, inc):
###     vals = []
###     inc = Decimal(inc)
###     val = Decimal(start)
###     while val < end:
###         vals.append(float(val))
###         val += inc
###     return vals

def findBestParameters(datadir):

    traindir = os.path.join(datadir, "train")
    print "Training Directory:", traindir
    testdir = os.path.join(datadir, "test")
    print "Test Directory:", testdir

    MAX = 300000
    MIN = 1000
    STEP = (MAX-MIN) / 5

    best_correct = -1
    #for train_size in xrange(MIN, MAX, STEP):
    if True:
        train_size = 500000
        for phrases in [True, False]:
            for remove_stopwords in [True, False]:
                for dedup in [True, False]:
                    for stem in [False, True]:
                        #for punct in [True, False]:        
                        #for emo in [True, False]:
                        punct = False
                        emo = False

                        config = (phrases, remove_stopwords, dedup, stem, punct, emo)
                        # !!!!!!!!!!!! tmp to test other perms
                        #if config != (True, False, True, True, False, False):
                        #    continue

                        test_data  = getCorpus(testdir,  train_size, phrases=phrases, remove_stopwords=remove_stopwords, dedup=dedup, stem=stem, punct=punct, emo=emo)        
                        train_data = getCorpus(traindir, train_size,  phrases=phrases, remove_stopwords=remove_stopwords, dedup=dedup, stem=stem, punct=punct, emo=emo)        
                        ## keep these reasonable constants, rather than trying all permutations and slowing down by 100 times.
                        min_term_percent = 0.005 
                        min_prob_multiplier = 3

                        #for min_term_percent in frange(0, 0.05, 0.005):
                        #    for min_prob_multiplier in frange(0.9, 3, 0.1):
                        if True:
                                print min_term_percent, min_prob_multiplier
                                model = calcModel(train_data, min_term_percent, min_prob_multiplier)
                                print "*"*100

                                ## NEED TO PARAMETERIZE
                                scoring_categories = {None:5, 1:'neg', 2:'neg', 3:'neg', 4:'neutral', 5:'neutral', 6:'neutral', 7:'neutral', 8:'pos', 9:'pos', 10:'pos'}
                                scoring_categories = {None: 0, -1:'neg', 0:'neutral', 1:'pos'}

                                correct = test(model, test_data, scoring_categories)

                                print "%s Training Size: %s -- %s " % (correct, train_size, config)
                                if correct >= best_correct:
                                    best_correct = correct
                                    best = config
                                    print "Config:", config
                                    print "**********"
            

                                    
def saveModel(fname, model, settings):
    f = open(fname, "w")

    # convert dict to something jsonable.  it currently uses dict keys that aren't a string
    avg_prob, known_tokens, prob_of_rating, prob_token_given_rating = model
    jsonable_ratings = prob_token_given_rating.items()
    model = avg_prob, known_tokens, prob_of_rating, jsonable_ratings

    obj = [model, settings]
    json.dump(obj, f)
    f.close()
    print 'Wrote learned model to" %s"' % fname

# model, settings
def loadModel(fname):
    f = open(fname, "r")
    model, settings = json.load(f)
    f.close()

    avg_prob, known_tokens, json_prob_of_rating, jsonable_rating = model
    prob_token_given_rating = {}
    for k,v in jsonable_rating:
        key = (str(k[0]), int(k[1]))
        prob_token_given_rating[key] = v

    prob_of_rating = {}
    for k,v in json_prob_of_rating.items():
        prob_of_rating[int(k)] = float(v)


    model = avg_prob, known_tokens, prob_of_rating, prob_token_given_rating
    return model, settings


### print "\nall raw data\n==========================="
### xtest(25000, 25000, phrases=True, remove_stopwords=False, dedup=False, stem=False, punct=True,  emo=True,  min_term_percent=None, min_prob_multiplier=None)
### print "\nall terms\n==========================="
### xtest(25000, 25000, phrases=True, remove_stopwords=True,  dedup=True,  stem=True,  punct=False, emo=False, min_term_percent=None, min_prob_multiplier=None)
### print "\nremoving to just core terms\n==========================="
### xtest(25000, 25000, phrases=True, remove_stopwords=False, dedup=True,  stem=True,  punct=False, emo=False, min_term_percent=0.05, min_prob_multiplier=2.1)

# 72.02 Training Size: 834000 -- (True, False, True, True, False, False) 
# def xtest(train_size, data_size, **settings):
#     print settings
#    test_data  = getCorpus("test",  train_size, settings)
#    train_data = getCorpus("train", data_size, settings)
#    model = calcModel(train_data, settings['min_term_percent'], settings['min_prob_multiplier'])
#    correct = test(model, test_data)
#    #print "%s%% correct" % correct



def main(command, homedir):
    datadir = os.path.join("..", "training_data", homedir)

    if command == "findparams":
        print "data dir:", traindir
        findBestParameters(datadir)
    elif command == "train":

        modelname = "model"
        if len(sys.argv) >= 4:
            modelname = sys.argv[3]
        if ".." in modelname or "/" in modelname or "\\" in modelname:
            raise Exception('Model name cannot contain cannot contain "..", "/", or "\\".')
        modelfile = os.path.join("..","local","%s.json" % modelname)

        train_size = -1
        # imdb
        settings = { 'phrases':True, 'remove_stopwords':False, 'dedup':False, 'stem':False, 'punct':False, 'emo':False, 'min_term_percent':None, 'min_prob_multiplier':None}
        # twitter
        settings = { 'phrases':False, 'remove_stopwords':True, 'dedup':True, 'stem':True, 'punct':False, 'emo':False, 'min_term_percent':0.005, 'min_prob_multiplier': 3}

        traindir = os.path.join(datadir, "train")
        print "Training Directory:", traindir
        train_data = getCorpus(traindir, train_size, settings)
        model = calcModel(train_data, settings['min_term_percent'], settings['min_prob_multiplier'])

        outputModelTerms(model, modelname)
        saveModel(modelfile, model, settings)


    elif command == "test":

        modelname = "model"
        if len(sys.argv) >= 4:
            modelname = sys.argv[3]
        if ".." in modelname or "/" in modelname or "\\" in modelname:
            raise Exception('Model name cannot contain cannot contain "..", "/", or "\\".')
        modelfile = os.path.join("..","local","%s.json" % modelname)
        if not os.path.exists(modelfile):
            raise Exception('Cannot find model file: "%s"' % modelfile)

        model, settings = loadModel(modelfile)
        test_size = -1 #35000

        testdir = os.path.join(datadir, "test")
        print "test dir:", testdir
        test_data  = getCorpus(testdir,  test_size, settings)

        ## NEED TO PARAMETERIZE
        scoring_categories = {None:5, 1:'neg', 2:'neg', 3:'neg', 4:'neutral', 5:'neutral', 6:'neutral', 7:'neutral', 8:'pos', 9:'pos', 10:'pos'}
        scoring_categories = {None: 0, -1:'neg', 0:'neutral', 1:'pos'}

        test(model, test_data, scoring_categories)
        #print "%s%% correct" % correct

###    elif command == "run":
###
###        modelfile = "model"
###        if len(sys.argv) == 4:
###            modelfile = sys.argv[3]
###
###        model, settings = loadModel("model.json")
###        field = "_raw"
###        if len(sys.argv) == 5:
###            srcfield = sys.argv[4]
###            fieldpos = None
###            rows = [r for r in csv.reader(sys.stdin)]
###            outrows = []
###            # for each row
###            for row in rows:
###                # if this is the first row, find the column position of the source text field
###                if fieldpos == None:
###                    for i, col in enumerate(row):
###                        if col == srcfield:
###                            fieldpos = i
###                            break
###                    # add on the sentiment column as the last column
###                    row.append('sentiment')
###                else:
###                    text = row[fieldpos]
###                    sentiment = calcSentiment(model, text, settings)
###                    # append on sentiment value in the last column
###                    row.append(sentiment)
###            # output rows
###            csv.writer(sys.stdout).writerows(rows)

def usage():
    print "Usage: train <training_data_subdir> <modelname>"
    print "Usage: test  <training_data_subdir> <modelname>"
    print "Usage: findparams <training_data_subdir>"
    sys.exit(-1)



if __name__ == '__main__':
    if len(sys.argv) < 3:
        usage()

    command = sys.argv[1]
    homedir = sys.argv[2]
    if command not in ['train','test', 'findparams']:
        usage()
    try:
        main(command, homedir)
    except Exception, e:
        print "Error:", e

