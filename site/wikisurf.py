import os
from flask import Flask, render_template, jsonify
from parse import *
import networkx as nx
from flaskext.csrf import csrf, csrf_exempt
from bs4 import BeautifulSoup
import urllib

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

@app.route('/wiki/<article>')
def embed_wiki_html(article):
	url_name = "http://en.wikipedia.org/w/api.php?action=mobileview&page="+article.encode('utf-8')+"&sections=all&format=xml&sectionprop=fromtitle|toclevel|line&notransform=yes"
	#url_name = url_name.encode('utf-8')
	page = urllib.urlopen(url_name)
	soup = BeautifulSoup(page, "xml")
	print soup.prettify()
	list_of_html = soup.find_all('section')
	html = ''.join(x.string for x in list_of_html)

	dic = {'html':html, 'title':article}
	return jsonify(dic)


if __name__ == '__main__':
	port = int(os.environ.get('PORT', 5000))
	app.run(host='0.0.0.0', port=port, debug=True)
	csrf(app)
