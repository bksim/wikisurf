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


"""
Graph represented as a dictionary
Where the key is the article, and the item is a list of articles
that the article links to
"""
graph = {}

"""find one path from start to end"""
def find_path(graph, start, end, path=[]):
    path = path + [start]
    if start == end:
        return path
    if not graph.has_key(start):
        return None
    for node in graph[start]:
        if node not in path:
            newpath = find_path(graph, node, end, path)
            if newpath: return newpath
    return None

"""returns a list of all possible paths from start to end"""
def find_all_paths(graph, start, end, path=[]):
    path = path + [start]
    if start == end:
        return [path]
    if not graph.has_key(start):
        return []
    paths = []
    for node in graph[start]:
        if node not in path:
            newpaths = find_all_paths(graph, node, end, path)
            for newpath in newpaths:
                paths.append(newpath)
    return paths

"""Populates graph"""
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
        list_of_links = []

        #only get first 50 of each article -- [:50]
        for node in doc.getElementsByTagName("pl")[:50]:
            if str(node.getAttribute('ns')) == '0':
                title = node.getAttribute('title')
                list_of_links.append(title)
                # if distance == 0:
                #     print '----' + title
                # else:
                #     print title
                get_links(title,distance-1)

        
        graph[center] = list_of_links

    
if __name__ == '__main__':
    # documentation: http://en.wikipedia.org/w/api.php
    
    center_page_title = "Computer" # 'center' of graph

    max_distance = 1 # max "distance" away from center

    get_links(center_page_title, max_distance)

    print "done"


    
