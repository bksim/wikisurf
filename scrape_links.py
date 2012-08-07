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
#import networkx # have to install this for this code to run for graphs


def get_links(center, distance):
    # base case
    if distance < 0:
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
            title = node.getAttribute('title')
            print title
            get_links(title,distance-1)


    
if __name__ == '__main__':
    # documentation: http://en.wikipedia.org/w/api.php
    
    center_page_title = "Computer" # 'center' of graph

    max_distance = 1 # max "distance" away from center

    get_links(center_page_title, max_distance)

    print "done"


    
