from flask import Flask, jsonify, render_template, request
import json
import os

app = Flask(__name__)

def load_program_data(program_id):
    # Load master program data
    with open('data/program_data.json', 'r') as f:
        master_data = json.load(f)
    
    # Find the program entry
    program_entry = next((p for p in master_data['programs'] if p['id'] == program_id), None)
    if not program_entry:
        return None
    
    # Load the specific program data
    program_file = os.path.join('data', program_entry['file'])
    with open(program_file, 'r') as f:
        program_data = json.load(f)
    
    return program_data

@app.route('/')
def welcome():
    # Load master program data for the welcome page
    with open('data/program_data.json', 'r') as f:
        program_data = json.load(f)
    return render_template('welcome.html', programs=program_data['programs'])

@app.route('/explore')
def explore():
    program = request.args.get('program')
    role = request.args.get('role')
    return render_template('explore.html', program=program, role=role)

@app.route('/api/data')
def get_data():
    program = request.args.get('program')
    if not program:
        return jsonify({'error': 'Program parameter is required'}), 400
    
    # Load master program data
    with open('data/program_data.json', 'r') as f:
        master_data = json.load(f)
    
    # Find the program entry and load its data
    program_entry = next((p for p in master_data['programs'] if p['file'].split('/')[1].replace('.json', '') == program), None)
    if not program_entry:
        return jsonify({'error': 'Program not found'}), 404
    
    # Load the specific program data
    program_file = os.path.join('data', program_entry['file'])
    try:
        with open(program_file, 'r') as f:
            program_data = json.load(f)
        return jsonify({'program': program_data})
    except FileNotFoundError:
        return jsonify({'error': f'Program file not found: {program_file}'}), 404
    except json.JSONDecodeError:
        return jsonify({'error': f'Invalid JSON in program file: {program_file}'}), 500

if __name__ == '__main__':
    app.run(debug=True) 