#####################################################################################
# Wikisurf
# scrape_links.py
# 
# brandon sim, ayzaan wahid
# 
# edit history
# 8/7/2012: basic code gets all links on page out to a certain distance
#           using wikipedia API [bks]
#
#####################################################################################

import urllib
from xml.dom import minidom
import time
import networkx as nx # have to install this for this code to run for graphs
import simplejson as json


def get_graph(center, depth):
    """Returns an nx graph given the center node, and required depth.
    """

    graph = nx.DiGraph() 

    print ('Getting %s graph' % center)
    # base case
    if depth <= 0:
        return
    else:        
        url_name = "http://en.wikipedia.org/w/api.php?action=query&titles=" + \
                   center + "&prop=links&pllimit=500&format=xml"
        
        #For local testing because my urllib times out
        #url_name = 'http://localhost:8000/com.xml/'
        print('Loaded URL')
        # note: max pllimit (links to return) of 500 allowed
        connection = urllib.urlopen(url_name)
        print('url open')
        doc = minidom.parse(connection)
        connection.close()
        
        # prints pretty version of xml
        #print doc.toprettyxml()

        for node in doc.getElementsByTagName("pl"):
            if str(node.getAttribute('ns')) == '0': #cuts out category/template pages
                title = node.getAttribute('title').encode('utf-8')
                #print title
                graph.add_edge(center, title)
                get_graph(title,depth-1)
    return graph


def output_json(G):
    dic={}
    node_dict = {}
    for node in G.nodes():
        node_dict[node] = {'shape':'dot', 'label':str(node), 'link':'http://en.wikipedia.org/wiki/%s' % str(node)}
        
    dic['nodes'] = node_dict

    edge_dict = {}
    for node in G.nodes():
        edge_dict[node] = str(G[node])

    dic['edges'] = edge_dict

    return dic