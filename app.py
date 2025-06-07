import json
from flask import Flask, jsonify, render_template

app = Flask(__name__)

@app.route('/')
def index():
    """Serves the main HTML page."""
    return render_template('index.html')

@app.route('/api/data')
def get_data():
    """Provides the dependency data as JSON."""
    with open('program_data.json', 'r') as f:
        data = json.load(f)
    return jsonify(data)

if __name__ == '__main__':
    app.run(debug=True) 