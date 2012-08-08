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
import networkx

"""
networkx graph
"""
graph = networkx.Graph()

"""Populates graph"""
def get_links(center, distance):
    # base case
    if distance <= 0:
        return
    else:        
        file = "xml/%s.xml" % center

        # note: max pllimit (links to return) of 500 allowed
        # Open connection to URL
        # connection = urllib.urlopen(url_name)
        # doc = minidom.parse(connection)
        # connection.close()
        
        # prints pretty version of xml
        #print doc.toprettyxml()

        xml_file = open(file)
        doc = minidom.parse(xml_file)

        graph.add_node(center)
        print "Add node %s" % center
        
        for node in doc.getElementsByTagName("pl"):
            if str(node.getAttribute('ns')) == '0':
                title = node.getAttribute('title')
                graph.add_node(title)
                print "Add node %s" % title
                graph.add_edge(center, title)
                print "Add edge %s --> %s" % (center, title)


    
if __name__ == '__main__':
    # documentation: http://en.wikipedia.org/w/api.php
    
    center_page_title = "Computer" # 'center' of graph

    max_distance = 1 # max "distance" away from center
    print "Start"
    get_links(center_page_title, max_distance)

    print "Done"


    
