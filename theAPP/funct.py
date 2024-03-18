from openai import OpenAI
import os
from pdfminer.high_level import extract_text

client = OpenAI(
  api_key='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',  # this is also the default, it can be omitted
)




def extract_text_from_pdf(pdf_path):
    return extract_text(pdf_path)

def convert_to_markdown(text):
    lines = text.split("\\\\n")
    for i, line in enumerate(lines):
        stripped = line.strip()
        if stripped.isupper() and len(stripped) < 50:
            lines[i] = f"## {stripped}"
    return "\\\\n".join(lines)

def process_pdfs_in_directory(pdf_directory): # markdown_directory
    for filename in os.listdir(pdf_directory):
        if filename.endswith(".pdf"):
            ...
            # [The rest of the code to process each PDF]
            # markdown_filename = filename.replace(".pdf", "_markdown.md")
            # markdown_path = os.path.join(markdown_directory, markdown_filename)

            # Check if the markdown file already exists
            # if os.path.exists(markdown_path):
            #     print(f"Markdown for {filename} already exists. Skipping...")
            #     continue

            pdf_path = os.path.join(pdf_directory, filename)

            # Extract text from PDF
            extracted_text = extract_text_from_pdf(pdf_path)

            # Convert extracted text to markdown
            markdown_text = convert_to_markdown(extracted_text)

            return markdown_text

            # # Save the markdown text
            # with open(markdown_path, "w") as md_file:
            #     md_file.write(markdown_text)
            # print(f"Processed {filename} and saved Markdown to {markdown_filename}")

pdf_directory = "/content/PDFS"
# markdown_directory = "path_to_save_markdown_files"
notes = process_pdfs_in_directory(pdf_directory)

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
# print(response.choices[0].message.content)

JSON_data = str(response.choices[0].message.content)

import matplotlib.pyplot as plt
import networkx as nx
import json

# The JSON data provided

JSON_data_dict = json.loads(JSON_data)


def build_graph(data):
    G = nx.Graph()
    root = data['title']
    G.add_node(root, size=20, color='lightblue')

    for topic in data['main_topics']:
        G.add_node(topic['name'], size=15, color='lightgreen')
        G.add_edge(root, topic['name'], weight=2)

        for subtopic in topic['subtopics']:
            subtopic_name = f"{topic['name']}: {subtopic}"
            G.add_node(subtopic_name, size=10, color='lightgrey')
            G.add_edge(topic['name'], subtopic_name, weight=1)

    return G

G = build_graph(JSON_data_dict)

# Specify node positions using the spring layout
pos = nx.spring_layout(G, k=0.15, iterations=20)

# Draw the graph
plt.figure(figsize=(12, 12))
nx.draw(G, pos, with_labels=True, node_size=[G.nodes[node]['size']*100 for node in G.nodes],
        node_color=[G.nodes[node]['color'] for node in G.nodes],
        font_size=8, edge_color='gray')

plt.title(JSON_data_dict['title'])
plt.show()

