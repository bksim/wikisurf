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

def get_links(center, depth):
    global graph #edits the global graph
    # base case
    if depth <= 0:
        return
    else:        
        url_name = "http://en.wikipedia.org/w/api.php?action=query&titles=" + \
                   center + "&prop=links&pllimit=500&format=xml"

        # note: max pllimit (links to return) of 500 allowed
        connection = urllib.urlopen(url_name)
        doc = minidom.parse(connection)
        connection.close()
        
        # prints pretty version of xml
        #print doc.toprettyxml()

        for node in doc.getElementsByTagName("pl"):
            if str(node.getAttribute('ns')) == '0': #cuts out category/template pages
                title = node.getAttribute('title').encode('utf-8')
                #print title
                graph.add_edge(center, title)
                get_links(title,depth-1)
    
if __name__ == '__main__':
    # documentation: http://en.wikipedia.org/w/api.php

    ############ variables to change ################
    
    center_page_title = "Alex_Morgan" # 'center' of graph
    depth = 1 # max "distance" away from center

    ############ end variables to change ############

    
    graph = nx.DiGraph() # directed graph
    
    start_time = time.clock()
    get_links(center_page_title.encode('utf-8'), depth)
    end_time = time.clock()

    # write to file
    
    out = open("center=" + str(center_page_title) + ",depth=" + str(depth) + ".txt",'w')
    out.write("Center article: " + str(center_page_title) + "\n")
    out.write("Depth: " + str(depth) + "\n")
    out.write("Time to analyze: " + str(end_time - start_time) + "\n\n")
    
    out.write("***Nodes (n = " + str(graph.number_of_nodes()) + ")***\n")
    for node in graph.nodes():
        out.write(str(node) + "\n")
    out.write("\n\n")
    out.write("***Edges (n = " + str(graph.number_of_edges()) + ")***\n")
    for edge in graph.edges():
        out.write(str(edge) + "\n")
    out.close()

    print "done"



def output_json(G, fname):
    dic={}
    node_dict = {}
    for node in G.nodes():
        node_dict[node] = {'shape':'dot', 'label':node, 'link':'http://en.wikipedia.org/wiki/%s' % node}
        
    dic['nodes'] = node_dict

    edge_dict = {}
    for node in G.nodes():
        edge_dict[node] = G[node]

    dic['edges'] = edge_dict

    json.dump(dic, open(fname, 'w'), indent=2)