import os
import json
import shutil
from jinja2 import Environment, FileSystemLoader

# Create output directories
os.makedirs('docs/static', exist_ok=True)
os.makedirs('docs/api', exist_ok=True)

# Copy static files
shutil.copytree('static', 'docs/static', dirs_exist_ok=True)

# Setup Jinja2 environment
env = Environment(loader=FileSystemLoader('templates'))

# Load master program data
with open('data/program_data.json', 'r') as f:
    program_data = json.load(f)

# Generate welcome page
template = env.get_template('welcome.html')
html = template.render(programs=program_data['programs'])
with open('docs/index.html', 'w') as f:
    f.write(html)

# Generate explore pages for each program
template = env.get_template('explore.html')
for program in program_data['programs']:
    program_id = program['file'].split('/')[1].replace('.json', '')
    
    # Generate explore pages for each role
    roles = ['executive', 'program-manager', 'engineering-manager', 'product-manager']
    for role in roles:
        # Create directory for this program
        os.makedirs(f'docs/explore/{program_id}', exist_ok=True)
        
        html = template.render(program=program_id, role=role)
        with open(f'docs/explore/{program_id}/{role}.html', 'w') as f:
            f.write(html)

# Generate API data files
os.makedirs('docs/api/data', exist_ok=True)
for program in program_data['programs']:
    program_id = program['file'].split('/')[1].replace('.json', '')
    
    # Load program data
    with open(f'data/{program["file"]}', 'r') as f:
        program_data = json.load(f)
    
    # Save as static JSON
    with open(f'docs/api/data/{program_id}.json', 'w') as f:
        json.dump({'program': program_data}, f, indent=2)

print("Static site generated in 'docs' directory") 