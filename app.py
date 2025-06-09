from flask import Flask, jsonify, render_template, request
import json

app = Flask(__name__)

@app.route('/')
def welcome():
    return render_template('welcome.html')

@app.route('/explore')
def explore():
    program = request.args.get('program')
    role = request.args.get('role')
    return render_template('explore.html', program=program, role=role)

@app.route('/api/data')
def get_data():
    program = request.args.get('program')
    with open('program_data.json', 'r') as f:
        data = json.load(f)
    return jsonify(data)

if __name__ == '__main__':
    app.run(debug=True, port=5001) 