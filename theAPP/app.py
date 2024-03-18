from flask import Flask, render_template, request, redirect, url_for, jsonify
from flask_cors import CORS
from pyvis.network import Network
import json
import os
from pdfminer.high_level import extract_text
from openai import OpenAI
import tempfile

app = Flask(__name__)
CORS(app)

client = OpenAI(
    api_key='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',
)

format = """
{
  "title": "Title of Notes or overall subject of notes",
  "main_topics": [
    {
      "name": "Name of first main topic",
      "subtopics": ["Subtopic One", "Subtopic Two", "Subtopic Three", "Subtopic Four", "Subtopic Five", ..., "subtopics that extend beyond the notes", ...]
    },
    {
      "name": "Name of second main topic",
      "subtopics": ["Subtopic One", "Subtopic Two", "Subtopic Three", "Subtopic Four", "Subtopic Five", ..., "subtopics that extend beyond the notes", ...]
    },
    ...,
    {
      "name": "more topics that extended beyond the notes",
      "subtopics": ...
    },
    ...
  ]
}
"""

def extract_text_from_pdf(pdf_path):
    return extract_text(pdf_path)

def convert_to_markdown(text):
    lines = text.split("\n")
    for i, line in enumerate(lines):
        stripped = line.strip()
        if stripped.isupper() and len(stripped) < 50:
            lines[i] = f"## {stripped}"
    return "\n".join(lines)

def process_pdf(pdf_path):
    extracted_text = extract_text_from_pdf(pdf_path)
    markdown_text = convert_to_markdown(extracted_text)
    return markdown_text

def build_graph_from_json(data):
    net = Network(height='750px', width='100%', bgcolor='#222222', font_color='white')
    net.barnes_hut()
    root = data['title']
    net.add_node(root, size=50, color='lightblue', title=root)

    for topic in data['main_topics']:
        net.add_node(topic['name'], size=30, color='lightgreen', title=topic['name'], shape='box')
        net.add_edge(root, topic['name'], width=2)
        net.add_node(f"{topic['name']}_subtopics", size=10, color='lightgreen', title=" ".join(topic['subtopics']), shape='box', hidden=True)
        net.add_edge(topic['name'], f"{topic['name']}_subtopics", width=2, hidden=True)

    return net


@app.route('/', methods=['GET'])
def index():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'pdf_file' in request.files:
        file = request.files['pdf_file']
        if file.filename != '':
            try:
                with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as temp_file:
                    file.save(temp_file.name)
                    notes = process_pdf(temp_file.name)
                    graph_prompt = f"""

                    Take the following notes and extrapolate them into a JSON text (format it like this: {format})
                    that can be converted into a bubble map / mind map  (Fill in any gaps in knowledge in the notes as necessary in the bubble map.
                    Also add information that would extend knowledge beyond the notes in the bubble map):

                    {notes}

                    """
                    response = client.chat.completions.create(
                        model="gpt-3.5-turbo-0125",#-3.5-turbo-0125
                        response_format={ "type": "json_object" },
                        messages=[
                            {"role": "system", "content": "You are a helpful assistant designed to output JSON"},
                            {"role": "user", "content": f"{graph_prompt}"}
                        ]
                        )
                    json_data = response.choices[0].message.content
                    net = build_graph_from_json(json.loads(json_data))
                    net.save_graph('static/graph.html')
                    return redirect(url_for('show_graph'))
            except Exception as e:
                return jsonify({'message': f'An error occurred: {e}'})
    return jsonify({'message': 'No file uploaded or file is empty'})

@app.route('/graph')
def show_graph():
    return render_template('graph.html', graph_file=url_for('static', filename='graph.html'))

if __name__ == '__main__':
    app.run(debug=True)
