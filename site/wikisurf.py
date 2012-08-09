from flask import Flask, render_template, jsonify
from parse import *
import networkx as nx
from flaskext.csrf import csrf, csrf_exempt

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
	

if __name__ == '__main__':
	app.run(debug=True)
	csrf(app)
