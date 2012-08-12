import os
from flask import Flask, render_template, jsonify
from parse import *
import networkx as nx
from flaskext.csrf import csrf, csrf_exempt
from bs4 import BeautifulSoup
import urllib2

app = Flask(__name__)


@app.route('/')
def main_page():
	return render_template('index.html')

@csrf_exempt
@app.route('/<article>/<depth>')
def get_article(article, depth):
	center_page_title = article.encode('utf-8')
	graph_depth = int(depth)

	graph = get_graph(center_page_title, graph_depth)
	graph_json = output_arbor_json(graph)

	return jsonify(graph_json)

@app.route('/<article>')
def embed_wiki_html(article):
	url_name = "http://en.wikipedia.org/w/api.php?action=mobileview&page=%s&sections=all&format=xml&sectionprop=fromtitle|toclevel|line&notransform=yes" % article
	page = urllib2.urlopen(url_name)
	soup = BeautifulSoup(page, "xml")
	list_of_html = soup.find_all('section')
	html = ''.join(x.string for x in list_of_html)

	return render_template('wiki.html', html=html)


if __name__ == '__main__':
	port = int(os.environ.get('PORT', 5000))
	app.run(host='0.0.0.0', port=port, debug=True)
	csrf(app)
