
g_STOPWORDS = set(["a", "about", "above", "above", "across", "after", "afterwards", "again", "against", "all", "almost", "alone", "along", "already", "also","although","always","am","among", "amongst", "amoungst", "amount",  "an", "and", "another", "any","anyhow","anyone","anything","anyway", "anywhere", "are", "around", "as",  "at", "back","be","became", "because","become","becomes", "becoming", "been", "before", "beforehand", "behind", "being", "below", "beside", "besides", "between", "beyond", "bill", "both", "bottom","but", "by", "call", "can", "cannot", "cant", "co", "con", "could", "couldnt", "cry", "de", "describe", "detail", "do", "done", "down", "due", "during", "each", "eg", "eight", "either", "eleven","else", "elsewhere", "empty", "enough", "etc", "even", "ever", "every", "everyone", "everything", "everywhere", "except", "few", "fifteen", "fify", "fill", "find", "fire", "first", "five", "for", "former", "formerly", "forty", "found", "four", "from", "front", "full", "further", "get", "give", "go", "had", "has", "hasnt", "have", "he", "hence", "her", "here", "hereafter", "hereby", "herein", "hereupon", "hers", "herself", "him", "himself", "his", "how", "however", "hundred", "ie", "if", "in", "inc", "indeed", "interest", "into", "is", "it", "its", "itself", "keep", "last", "latter", "latterly", "least", "less", "ltd", "made", "many", "may", "me", "meanwhile", "might", "mill", "mine", "more", "moreover", "most", "mostly", "move", "much", "must", "my", "myself", "name", "namely", "neither", "never", "nevertheless", "next", "nine", "no", "nobody", "none", "noone", "nor", "not", "nothing", "now", "nowhere", "of", "off", "often", "on", "once", "one", "only", "onto", "or", "other", "others", "otherwise", "our", "ours", "ourselves", "out", "over", "own","part", "per", "perhaps", "please", "put", "rather", "re", "same", "see", "seem", "seemed", "seeming", "seems", "serious", "several", "she", "should", "show", "side", "since", "sincere", "six", "sixty", "so", "some", "somehow", "someone", "something", "sometime", "sometimes", "somewhere", "still", "such", "system", "take", "ten", "than", "that", "the", "their", "them", "themselves", "then", "thence", "there", "thereafter", "thereby", "therefore", "therein", "thereupon", "these", "they", "thickv", "thin", "third", "this", "those", "though", "three", "through", "throughout", "thru", "thus", "to", "together", "too", "top", "toward", "towards", "twelve", "twenty", "two", "un", "under", "until", "up", "upon", "us", "very", "via", "was", "we", "well", "were", "what", "whatever", "when", "whence", "whenever", "where", "whereafter", "whereas", "whereby", "wherein", "whereupon", "wherever", "whether", "which", "while", "whither", "who", "whoever", "whole", "whom", "whose", "why", "will", "with", "within", "without", "would", "yet", "you", "your", "br"])

g_RED_FLAGS = {
    'sexual': {
       'anal', 'anus', '*balls', 'bang', 'beaver', '*blumpkin*', '*boobs*',
       '*breasts', 'butt', '*buttocks*', 'clit', 'cock', 'cum', 
       'dick', 'dildo', 'fist', '*fuck*', '*gangbang*', '*gissum*', 'jism*',
       '*jissum*', '*jysm*', 'kinky', 'muff', 'penis', 'pussy', '*schlong*',
       'tit', 'vagina', 'whore'
    },
    'swearing': {
       '*a-hole*', '*ahole*', 'arse', 'ass', '*asshole*', 'bitch',
       'bloody', '*bollocks*', 'cunt', 'damn', '*faggot*', 'fag', '*fuck*', 
       'damn', '*goddamn*', 'hell', '*jesus*', '*shit', 
    },    
    'insulting': {
        'bastard', 'git', '*noob*', '*nutjob', 'idiot', 'nutter', '*peckerhead*', 'ponce', 'stupid', 'suck', 'tosser', 'turd', 'ugly', 'wanker*', '*wimp'
     },
    'hostile': {
       # strong hostile
       'abuse', 'afflict', 'aggravate', 'aggravation', 'aggression', 'aggressive',
       'aggressiveness', 'ambush', 'antagonism', 'antagonistic', 'antagonize', 'arrest',
       'assail', 'assault', 'attack', 'avenge', 'battle', 'belt', 'block', 'blow', 'bomb',
       'brandish', 'breach', 'brutality', 'butchery', 'combat', 'confront',
       'confrontation', 'convict', 'damage', 'demolish', 'destroy', 'destructive',
       'devastate', 'dispose', 'engulf', 'fight', 'fire', 'fought', 'harm', 'hit', 'hurt',
       'impede', 'infiltration', 'infringement', 'inhibit', 'interfere', 'interference',
       'jerk', 'kick', 'kill', 'killer', 'knock', 'murder', 'obstruct', 'offensive',
       'prosecution', 'provoke', 'resist', 'resistance', 'scare', 'seize', 'shatter',
       'shock', 'shoot', 'shot', 'slam', 'slash', 'smash', 'snatch', 'stamp', 'storm', 'strip',
       'suppress', 'unleash', 'upset', 'vengeance', 'violence', 'violent', 'warrior',
       'whack', 'whip', 'wound',
       # hostile
       'accost', 'aggrieve', 'annihilate', 'annoy', 'assassinate', 'belie', 'besiege',
       'blurt', 'bombard', 'brawl', 'collide', 'contaminate', 'cripple', 'defile', 'degrade',
       'deride', 'detest', 'discredit', 'disrupt', 'harass', 'horrify', 'humiliate',
       'implicate', 'infect', 'inflame', 'infuriate', 'jeer', 'kidnap', 'mangle', 'massacre',
       'misbehave', 'molest', 'offend', 'persecute', 'pollute', 'prowl', 'punch', 'ravage',
       'reactive', 'rebuff', 'rebuke', 'renounce', 'reproach', 'retaliate', 'sabotage',
       'scorch', 'seethe', 'shove', 'shred', 'slander', 'slap', 'slaughter', 'smack', 'smear',
       'spank', 'stab', 'sting', 'strangle', 'sunder', 'taint', 'tamper', 'tease', 'terrorize',
       'thrash', 'torment', 'trample', 'wreck', 'wrestle',
    },
    'upset': {
       'anguish', 'bitter', 'deplore', 'dislike', 'dislike', 'fed', 'frown', 'frown', 'hate',
       'hate', 'hate', 'hater', 'hatred', 'impatience', 'irritable', 'irritation', 'mad',
       'resent', 'resentment', 'sick', 'startle', 'undone',
    }
}



