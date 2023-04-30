#!/usr/bin/python
# -*- coding: utf-8 -*-

import math, json
import traceback

def buildModel(modelfile, corpusfile):

    try:
        f = open(corpusfile, "r")
        data = json.load(f)
        f.close()

        # !should be a configuration
        # remove terms that are very rare
        min_term_percent = None #0.2
        min_prob_multiplier = None

        model = calcModel(data, min_term_percent, min_prob_multiplier)
        saveModel(modelfile, model)
    except Exception, e:
        raise Exception("Error Building Model: %s.  Stacktrace: %s" % (e, traceback.format_exc()))


def saveModel(fname, model):
    try:
        f = open(fname, "w")
        # convert dict to something jsonable.  it currently uses dict keys that aren't a string
        avg_prob, known_tokens, prob_of_prediction, prob_token_given_prediction = model
        jsonable_predictions = prob_token_given_prediction.items()
        model = avg_prob, known_tokens, prob_of_prediction, jsonable_predictions

        json.dump(model, f)
        f.close()
        # print 'Wrote learned model to" %s"' % fname
    except Exception, e:
        raise Exception("Error Saving Model: %s.  Stacktrace: %s" % (e, traceback.format_exc()))


def loadModel(fname):
    try:
        f = open(fname, "r")
        model = json.load(f)
        f.close()

        avg_prob, known_tokens, json_prob_of_rating, jsonable_rating = model
        prob_token_given_rating = {}
        for k,v in jsonable_rating:
            key = (k[0], k[1])
            prob_token_given_rating[key] = v

        prob_of_rating = {}
        for k,v in json_prob_of_rating.items():
            prob_of_rating[k] = float(v)

        model = avg_prob, known_tokens, prob_of_rating, prob_token_given_rating
        return model
    except Exception, e:
        raise Exception("Error Loading Model: %s.  Stacktrace: %s" % (e, traceback.format_exc()))

#def predict(model, result, predicted_field):
#    instance = generateInstance(result, predicted_field)
#    returns = bayes.score(model, tokens)
#    return None

# data.append((prediction, tokens))


def calcModel(data, min_term_percent, min_prob_multiplier):


    # Estimate the probability P(c) of each class c ∈ C by dividing the number of words in documents in c by the total number of words in the corpus.
    token_counts = {}
    
    total_token_count = 0
    for prediction, tokens in data:
        token_count = len(tokens)
        total_token_count += token_count
        token_counts[prediction] = token_count + token_counts.get(prediction, 0)

    # P(prediction)
    prob_of_prediction = {}
    for prediction, count in token_counts.items():
        prob = 0
        ratio = float(count) / total_token_count
        if ratio > 0: prob = math.log(ratio)
        prob_of_prediction[prediction] = prob
    #print "BEFORE:", prob_of_prediction

    # ALTERNATIVE CALC OF P(C) is # of docs in C. ignores tokens
    if True:
        class_counts = {}
        for prediction, tokens in data:
            if prediction not in class_counts:
                class_counts[prediction] = 1
            else:
                class_counts[prediction] += 1
        doc_count = len(data)
        for prediction, count in class_counts.items():
            prob = 0
            ratio = float(count) / doc_count
            if ratio > 0: prob = math.log(ratio)
            prob_of_prediction[prediction] = prob
    #print "AFTER:", prob_of_prediction



    # Estimate the probability distribution P(w | c) for all words w
    # and classes c. This can be done by dividing the count w in
    # documents in c, by the total number of words in c.
    token_prediction_counts = {}
    known_tokens = set()
    term_counts = {}
    for prediction, tokens in data:
        for token in tokens:
            known_tokens.add(token)
            token_prediction_counts[(token, prediction)] = 1 + token_prediction_counts.get((token, prediction), 0)
            term_counts[token] = 1 + term_counts.get(token, 0) # for removing items
    prob_token_given_prediction = {}
    
    for (token, prediction), count in token_prediction_counts.items():
        prob = 0
        ratio = float(count) / token_counts[prediction]
        if ratio > 0: prob = math.log(ratio)
        prob_token_given_prediction[(token, prediction)] = prob

    total = 0
    for v in prob_token_given_prediction.values():
        total += v
    avg_prob = float(total) / len(prob_token_given_prediction)

    # EXPERIEMENT IN ERASING TOKENS THAT OCCUR IN LESS THAN N% OF REVIEWS
    #print "Original Token Count:", len(token_prediction_counts)
    if min_term_percent != None:
        min_count = min(2, (min_term_percent / 100.0) * len(data))
        for token, count in term_counts.items():
            if count < min_count:
                known_tokens.remove(token)
                for prediction in prob_of_prediction.keys():
                    key = (token, prediction)
                    if key in token_prediction_counts:
                        del token_prediction_counts[key]
                        del prob_token_given_prediction[key]
        #print "After removing rare:", len(token_prediction_counts)

    if min_prob_multiplier != None:
        # REMOVE TERMS THAT AREN'T HIGHLY INDICATIVE WITH PREDICTION
        for (token, prediction),prob in prob_token_given_prediction.items():
            if prob < (avg_prob + min_prob_multiplier):
                key = (token, prediction)
                del token_prediction_counts[key]
                del prob_token_given_prediction[key]
        #print "After removing weakly correlated:", len(token_prediction_counts)

    return (avg_prob, list(known_tokens), prob_of_prediction, prob_token_given_prediction)


def score(model, tokens):
    avg_prob, known_tokens, prob_of_prediction, prob_token_given_prediction = model

    best_prediction = None
    best_score = float('-inf')
    weighted_sum = 0.0
    score_sum = 0.0
    for prediction in prob_of_prediction.keys():

        unknown_term_prob = math.log(1.0 / (math.exp(prob_of_prediction[prediction]) + len(known_tokens)))
        probs = 0 # multiplying logs
        for token in tokens:
            # 1.0 here means ignore unknown words.  zero was too harsh! perhaps it should be something else.
            prob = prob_token_given_prediction.get((token, prediction), -1.0) 
            if prob == -1:
                prob = unknown_term_prob
            probs += prob # we're adding logs or probs to get multiplication -- was multiplication

        prediction_score = prob_of_prediction[prediction] + probs

        if prediction_score > best_score:
            best_score = prediction_score
            best_prediction = prediction
    return best_prediction



def test(model, test_data, scoring_categories):

    error_sum = 0.0
    guesses = 0
    correct = 0
    default_val = scoring_categories[None]
    
    for i, (prediction_actual, tokens) in enumerate(test_data):
        prediction_guess = score(model, tokens)
        if prediction_guess == None:
            prediction_guess = default_val
            guesses += 1
        diff = abs(prediction_actual - prediction_guess)
        if scoring_categories[prediction_actual] == scoring_categories[prediction_guess]:
            correct += 1
            # print ":)", prediction_actual
            # print ":) ACTUAL: %s GUESS: %s." % (prediction_actual, prediction_guess)
        # else:
            # print "!!:( ACTUAL: %s GUESS: %s." % (prediction_actual, prediction_guess)            
            # print "ACTUAL: %s GUESS: %s. TOKENS: %s" % (prediction_actual, prediction_guess, ' '.join(tokens))
            # print

        error_sum += diff * diff
    #mean squared error
    error = math.sqrt(error_sum / len(test_data))
    correct_perc = (100 * float(correct) / len(test_data))
    print "Correct: %s%%" % correct_perc,
    print "Error:", error,
    print "Guesses: %s%%" % (100 * float(guesses) / len(test_data))
    return correct_perc
        
