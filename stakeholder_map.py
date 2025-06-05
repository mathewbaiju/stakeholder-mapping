import json
import os

def generate_mermaid_id(name):
    """Generates a Mermaid-friendly ID from a string."""
    # Remove special characters and replace spaces/hyphens with underscores
    clean_name = ''.join(char for char in name if char.isalnum() or char.isspace() or char == '_')
    return clean_name.replace(" ", "_").replace("-", "_")

def generate_stakeholder_map(data):
    """Generates a Mermaid diagram definition from program data."""
    mermaid_string = "graph TD;\\n"
    mermaid_string += "    %% Styles (optional, but can make it look nicer)\\n"
    mermaid_string += "    classDef person fill:#D5F5E3,stroke:#1E8449,stroke-width:2px,color:#000;\\n"
    mermaid_string += "    classDef team fill:#EBF5FB,stroke:#2E86C1,stroke-width:2px,color:#000;\\n\\n"
    
    mermaid_string += "    %% Stakeholders (People) and Team Nodes\\n"

    people = data.get("people", [])
    teams_from_people = {person.get("team") for person in people if person.get("team")}
    
    # Collect all unique team names from people, explicit team list, and dependencies
    all_team_names = set(teams_from_people)
    for team_entry in data.get("teams", []): # Ensure all teams from "teams" list are considered
        all_team_names.add(team_entry.get("name"))
    for dep in data.get("dependencies", []):
        all_team_names.add(dep.get("from"))
        all_team_names.add(dep.get("to"))
    all_team_names.discard(None) # Remove None if any team was not specified

    # Create team nodes
    team_nodes = {}
    for team_name in sorted(list(all_team_names)): # Sort for consistent output
        team_id = f"team_{generate_mermaid_id(team_name)}"
        team_nodes[team_name] = team_id
        mermaid_string += f'    {team_id}[\\"{team_name}\\"];\\n'
        mermaid_string += f'    class {team_id} team;\\n'
        
    mermaid_string += "\\n"

    # Process people and link to their teams
    for person in sorted(people, key=lambda x: x.get("name", "")): # Sort for consistent output
        person_name = person.get("name", "Unnamed Person")
        person_id = f"person_{generate_mermaid_id(person_name)}"
        team_name = person.get("team")
        role = person.get("role", "N/A")
        
        mermaid_string += f'    {person_id}[\\"{person_name}<br/><i>{role}</i>\\"];\\n'
        mermaid_string += f'    class {person_id} person;\\n'
        
        if team_name and team_name in team_nodes:
            team_id = team_nodes[team_name]
            mermaid_string += f"    {person_id} -->|member of| {team_id};\\n"
        elif team_name: # Team mentioned with person but not in explicit list or deps
            # This case should ideally be handled by the comprehensive all_team_names collection
            # but as a fallback, create the team node if somehow missed.
            fallback_team_id = f"team_{generate_mermaid_id(team_name)}"
            if team_name not in team_nodes: # Check if truly missed
                 mermaid_string += f'    {fallback_team_id}[\\"{team_name}\\"];\\n'
                 mermaid_string += f'    class {fallback_team_id} team;\\n'
                 team_nodes[team_name] = fallback_team_id # Add to known nodes
            mermaid_string += f"    {person_id} -->|member of| {fallback_team_id};\\n"


    mermaid_string += "\\n    %% Team Dependencies\\n"
    for dep in data.get("dependencies", []):
        from_team_name = dep.get("from")
        to_team_name = dep.get("to")
        reason = dep.get("reason", "Dependency")

        if from_team_name and to_team_name and from_team_name in team_nodes and to_team_name in team_nodes:
            from_team_id = team_nodes[from_team_name]
            to_team_id = team_nodes[to_team_name]
            # Escape quotes in reason for Mermaid string
            escaped_reason = reason.replace('"', '#quot;') 
            mermaid_string += f'    {from_team_id} -- \\"{escaped_reason}\\" --> {to_team_id};\\n'
        else:
            if not from_team_name or from_team_name not in team_nodes:
                print(f"Warning: Dependency source team '{from_team_name}' not found or defined. Skipping dependency.")
            if not to_team_name or to_team_name not in team_nodes:
                print(f"Warning: Dependency target team '{to_team_name}' not found or defined. Skipping dependency.")
                
    return mermaid_string

def main():
    # Construct the full path to the JSON file relative to the script's location
    # This makes the script more portable
    script_dir = os.path.dirname(os.path.abspath(__file__))
    json_file_path = os.path.join(script_dir, "program_data.json")
    
    if not os.path.exists(json_file_path):
        print(f"Error: '{json_file_path}' not found.")
        print("Please ensure 'program_data.json' is in the same directory as the script.")
        return

    try:
        with open(json_file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except json.JSONDecodeError as e:
        print(f"Error: Could not decode JSON from '{json_file_path}'. Please check its format. Details: {e}")
        return
    except Exception as e:
        print(f"An error occurred while reading '{json_file_path}': {e}")
        return

    diagram_definition = generate_stakeholder_map(data)
    
    print("\\nMermaid Diagram Definition (copy and paste into a Mermaid renderer):\\n")
    print(diagram_definition)

if __name__ == "__main__":
    main() 