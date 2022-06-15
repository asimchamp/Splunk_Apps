import sys, os, csv, re
import splunk.Intersplunk as si
import os,zlib,bz2,sys


def getCompressionSize(datastring):
    return len(zlib.compress(bz2.compress(datastring)))


def getDistance(v1, v2, size1, size2):
    """Normalized Compressor Distance  ( x , y ) 
        = [ C ( xy - C ( x ) ] [ C ( xy ) - C ( y ) ] C ( x ) C ( y ) 
    NCD measures separately how much the compression of each of the
    documents is improved by using the information included in the
    other document. The compression distance assigned to the document
    pair is the product of these two measurements."""

    size12 = getCompressionSize(v1 + " " + v2)
    NCD = (size12 - size1) * (size12 - size2) * size1 * size2
    return NCD


# add (dist,j) to mybests if it's a closer distance than any existing distance
def updateMyBests(mybests, j, dist):
    for mybest in mybests:
        if dist < mybest[0]:
            mybest[0] = dist
            mybest[1] = j
            break
    

def updateBests(bests, i, j, dist):
    updateMyBests(bests[i], j, dist)
    updateMyBests(bests[j], i, dist)


def markupMutualBesties(results, bests):
    l = len(results)
    # change all bests to just be sets of indexes of the closest indexes
    for i in xrange(0, l):
        bests[i] = set([v[1] for v in bests[i] if v[1] != None])
    for i in xrange(0, l):
        mybests1 = bests[i]
        mycluster1 = results[i].get('clusterid', None)
        #print "1:", mybests1
        for j in xrange(i+1, l):
            mybests2 = bests[j]
            #print "2:", mybests2
            # if bestest buddies.  put in same cluster
            if i in mybests2 and j in mybests1:
                mycluster2 = results[j].get('clusterid', None)
                # if one of them already has a clusterid, use it
                if mycluster1 != None and mycluster2 != None:
                    continue
                if mycluster1 != None and mycluster2 == None:
                    results[j]['clusterid'] = mycluster1
                elif mycluster2 != None and mycluster1 == None:
                    results[i]['clusterid'] = mycluster2
                else:
                    # if neither is in a cluster, give it an id of i
                    results[i]['clusterid'] = i
                    results[j]['clusterid'] = i
        # if no good item to cluster, put in -1 cluster
        if 'clusterid' not in results[i]:
            results[j]['clusterid'] = -1

def cluster_results(results, field):

    clusters = []
    l = len(results)
    bests = []
    for i in xrange(0, l):
        bests.append( [[float('inf'), None], [float('inf'), None], [float('inf'), None]])

    for i in xrange(0, l):
        v1 = results[i].get(field, None)
        if v1 == None: continue
        size1 = getCompressionSize(v1)
        for j in xrange(i+1, l):
            v2 = results[j].get(field, None)
            if v2 == None: continue
            size2 = getCompressionSize(v2)
            dist = getDistance(v1,v2, size1, size2)
            updateBests(bests,i,j,dist)

    markupMutualBesties(results, bests)


def usage():
    raise Exception("Usage: icluster [<field>]")


def getParameters():
    argcount = len(sys.argv)
    if argcount > 2:
        usage()
    field = "_raw"
    if argcount == 2:
        field = sys.argv[1]
    return field


if __name__ == '__main__':

    try:
        messages = {}
        field = getParameters()

        # get results
        results,dummyresults,settings = si.getOrganizedResults()

        cluster_results(results, field)

        si.outputResults(results, messages )

    except Exception, e:
        raise
        si.generateErrorResults(e)


