import json,re,glob,os,sys,base64,math

MAX_TEXT_SIZE = 10000          # only pay attention to first 10k
MAX_NGRAMS    = 300            # only look at top 300 ngrams per cavnar&trenkle
MISMATCH_DIST = 2 * MAX_NGRAMS # mistmatch of ngram is same as twice the max distance between two ngrams
RE_TOKEN_DELIMITERS = "[ \t\n\r~`!@#$%^&*()_+123567890-={}|[\]\\:;\"'<>?,./]+";
TEXTSUFFIX = ".text"
MODELSUFFIX = ".json"


class NGramModel:


    def __init__(self, name):
        self._name = name
        self._ngrams = []
        self._ngramPositions = {}
        pass

    # creates model from name and text
    def initFromText(self, text):
        self._ngrams = self.generateNGrams(text)
        self._buildPositions()

    # creates model from raw text file
    def initFromTextFile(self, text_filename):
        f = open(text_filename, "r")
        text = f.read()
        f.close()
        self._ngrams = self.generateNGrams(text)
        self._buildPositions()
    
###    def save(self, model_filename):
###        model = [self._name, self._ngrams]
###        fp = open(model_filename, "wb")
###        json.dump(model, fp)
###        fp.close()

    def _buildPositions(self):
        self._ngramPositions = {}
        # initial term positions
        for i, ngram in enumerate(self._ngrams):
            self._ngramPositions[ngram] = i
    
    def getName(self):
        return self._name
    
    # distance is the sum of the differences in ngram position
    def distance(self, other_model):
        dist = 0
        # for each ngram 
        for ngram, pos1 in self._ngramPositions.items():
            pos2 = other_model._ngramPositions.get(ngram, None)
            if pos2 == None:
                dist += MISMATCH_DIST
            else: 
                dist += abs(pos2 - pos1)
        return dist

    # givens a term, adds ngrams
    def _generateNGrams(self, term, ngramsize, counts):
        spaces = ' '*(ngramsize-1)
        paddedterm = spaces + term + spaces
        for i in xrange(0, len(paddedterm) - ngramsize + 1):
            ngram = paddedterm[i: i+ngramsize]
            if ngram in counts:
                counts[ngram] += 1
            else:
                counts[ngram] = 1

    # given text, puts best ngrams into _ngrams
    def generateNGrams(self, text):
        self._ngrams = []

        # cap at 10k
        text = text[:MAX_TEXT_SIZE]
        text = text.lower()
        tokens = re.split(RE_TOKEN_DELIMITERS, text)

        counts = {}
        # for each token
        for token in tokens:
            # generate ngrams
            for ngramsize in xrange(1, 6):
                self._generateNGrams(token, ngramsize, counts)

        tokencount = counts.items()
        tokencount.sort(lambda x,y: cmp(y[1], x[1]))
        # only take top ngrams
        tokencount = tokencount[:MAX_NGRAMS]
        ngrams = [base64.b64encode(k) for k,v in tokencount]
        return ngrams
    

class NGramClassifier:

    def __init__(self, model_filename):
        self._models = {}
        self.loadModels(model_filename)

    def loadModels(self, model_filename):
        try:
            fp = open(model_filename, "rb")
            models = json.load(fp)
            fp.close()
            for name, ngrams in models.items():
                model = NGramModel(name)
                model._ngrams = ngrams
                model._buildPositions()
                self._models[name] = model
        except Exception, e:
            print "Cannot find model file.  Consider rebuilding.  Error: %s" % e


    def saveModels(self, model_filename):
        modelsdict = {}
        for name, model in self._models.items():
            modelsdict[name] = model._ngrams
        fp = open(model_filename, "wb")
        json.dump(modelsdict, fp)
        fp.close()
    
    def buildModels(self, txtdir, model_filename):
        built_anything = False
        filepattern = os.path.join(txtdir, "*" + TEXTSUFFIX)
        txtfiles = glob.glob(filepattern)
        # for each text file we found
        for txtfile in txtfiles:
            # foo/bar/english.txt --> english
            modelname = os.path.splitext(os.path.split(txtfile)[1])[0]
            if not modelname in self._models:
                print "unknown model:", modelname
                # load model from text
                model = NGramModel(modelname)
                model.initFromTextFile(txtfile)
                self._models[modelname] = model
                built_anything = True
        if built_anything:
            self.saveModels(model_filename)

    # chinese_2 -> chinese
    def langName(self, modelname):
        return modelname.split("_")[0]

    # returns the name of best matching model.
    def bestMatch(self, text, bias_table={}):
        #print "Text:", text[:100]
        mymodel = NGramModel("example")
        mymodel.initFromText(text)
        minDist = 999999999
        bestMatch = None
        all = []
        for name, model in self._models.items():
            dist = mymodel.distance(model)
            # bias in favor of 20 most common languages
            lang = self.langName(name)
            if lang in bias_table:
                dist = dist  - 10*bias_table[lang]
            if (dist < minDist):
                #print model.getName(), dist
                minDist = dist
                bestMatch = model
        if bestMatch == None:
            return None
        return self.langName(bestMatch.getName())

bias_table = { 'chinese': 1151, 'english': 1000, 'spanish': 500, 'hindi': 490,
  'russian': 277, 'arabic': 255, 'portuguese': 240, 'bengali': 215,
  'french': 200, 'malay': 175, 'german': 166, 'japanese': 132, 'farsi': 110, 
  'punjabi': 103, 'vietnamese': 86, 'tamil': 78, 'korean': 78,
  'turkish': 75, 
  'italian': 62, 'thai': 60, 'burmese': 56, 'cantonese': 55, 
  'polish': 46 
}
proportional_bias_table = {'portuguese': 0.0427807486631016, 'chinese': 0.2051693404634581, 'german': 0.029590017825311943, 'spanish': 0.08912655971479501, 'japanese': 0.023529411764705882, 'cantonese': 0.00980392156862745, 'polish': 0.00819964349376114, 'arabic': 0.045454545454545456, 'farsi': 0.0196078431372549, 'vietnamese': 0.015329768270944741, 'hindi': 0.0873440285204991, 'korean': 0.013903743315508022, 'malay': 0.031194295900178252, 'french': 0.035650623885918005, 'bengali': 0.03832442067736185, 'russian': 0.049376114081996436, 'thai': 0.0106951871657754, 'tamil': 0.013903743315508022, 'punjabi': 0.018360071301247772, 'turkish': 0.013368983957219251, 'burmese': 0.009982174688057042, 'english': 0.17825311942959002, 'italian': 0.01105169340463458}

def test():
    traindir = "ngram_training" 
    ng = NGramClassifier("models.json")
    ng.buildModels(traindir, "models.json")
    
    text = """Cross promotion of docs  currently live under support   in header nav proposed move to drop down nav under  Splunkbase Community  remain in Support nav  potentially add to resources as well      Goal is to provide greater visibility to community  not hide it I think we can address this through better training  getting started  etc       Erik   Erin will come back with revised header   timeline for next steps action items for other teams      print  BEST LANGUAGE GUESS    ng bestMatch text  """
    print ng.bestMatch(text, bias_table)
    #print ng.bestMatch("elvis was here")
    print ng.bestMatch("elvis de la here", bias_table)
    print ng.bestMatch("elvis di la here", bias_table)
    print ng.bestMatch("elvis croissant de la here", bias_table)
    print ng.bestMatch("is om enige opdrag blindelings uit te voer, is vir enige staatsdepartement regtig weet waar dit vandaan kom nie. En die maklikste voertuig om hierdie")
