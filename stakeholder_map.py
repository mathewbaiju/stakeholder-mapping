import json
import os
import argparse

def generate_mermaid_id(name):
    """Generates a Mermaid-friendly ID from a string."""
    # Remove special characters and replace spaces/hyphens with underscores
    clean_name = ''.join(char for char in name if char.isalnum() or char.isspace() or char == '_')
    return clean_name.replace(" ", "_").replace("-", "_")

def generate_dependency_map(data, filter_id=None):
    """Generates a Mermaid diagram definition from dependency data."""
    mermaid_string = "graph LR;\\n"

    # Define styles for statuses
    mermaid_string += "    %% Status Styles\\n"
    mermaid_string += "    classDef on_hold fill:#FCF3CF,stroke:#F1C40F,stroke-width:2px,color:#000;\\n"
    mermaid_string += "    classDef closed fill:#D5F5E3,stroke:#1E8449,stroke-width:2px,color:#000;\\n"
    mermaid_string += "    classDef on_track fill:#EBF5FB,stroke:#2E86C1,stroke-width:2px,color:#000;\\n"
    mermaid_string += "    classDef executing fill:#F5B7B1,stroke:#C0392B,stroke-width:2px,color:#000;\\n"
    mermaid_string += "    classDef in_progress fill:#FADBD8,stroke:#C0392B,stroke-width:2px,color:#000;\\n"
    mermaid_string += "    classDef default_status fill:#F2F3F4,stroke:#7B7D7D,stroke-width:2px,color:#000;\\n\\n"
    
    initiative_id = generate_mermaid_id(data.get("id", "initiative"))
    initiative_name = data.get("name", "Initiative")
    initiative_status = data.get("status", "")
    mermaid_string += f'    {initiative_id}("{initiative_name}<br/><i>{initiative_status}</i>");\\n'
    
    initiative_status_class = initiative_status.lower().replace(" ", "_") if initiative_status else "default_status"
    mermaid_string += f"    class {initiative_id} {initiative_status_class};\\n\\n"
    
    # Process 'depends_on' relationships
    depends_on = data.get("depends_on", [])
    if filter_id:
        depends_on = [item for item in depends_on if item.get("id") == filter_id]

    if depends_on:
        mermaid_string += "    %% depends_on\\n"
        for item in depends_on:
            item_id = generate_mermaid_id(item["id"])
            item_name = item["name"].replace('"', '#quot;')
            item_status = item.get("status", "")
            mermaid_string += f'    {item_id}("{item_name}<br/><i>{item_status}</i>");\\n'
            
            # Apply class based on status
            status_class = item_status.lower().replace(" ", "_") if item_status else "default_status"
            mermaid_string += f'    class {item_id} {status_class};\\n'

            mermaid_string += f'    {initiative_id} -- "depends on" --> {item_id};\\n'
        mermaid_string += "\\n"

    # Process 'is_dependency_for' relationships
    is_dependency_for = data.get("is_dependency_for", [])

    if is_dependency_for:
        mermaid_string += "    %% is_dependency_for\\n"
        for item in is_dependency_for:
            item_id = generate_mermaid_id(item["id"])
            item_name = item["name"].replace('"', '#quot;')
            item_status = item.get("status", "")
            mermaid_string += f'    {item_id}("{item_name}<br/><i>{item_status}</i>");\\n'

            # Apply class based on status
            status_class = item_status.lower().replace(" ", "_") if item_status else "default_status"
            mermaid_string += f'    class {item_id} {status_class};\\n'

            mermaid_string += f'    {item_id} -- "is dependency for" --> {initiative_id};\\n'
        mermaid_string += "\\n"
                
    return mermaid_string

def main():
    parser = argparse.ArgumentParser(description="Generate a dependency map from a JSON file.")
    parser.add_argument("--filter_id", help="Filter the diagram to show only a specific ID.")
    args = parser.parse_args()

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

    initiative_data = data.get("initiative")
    if not initiative_data:
        print("Error: 'initiative' key not found in JSON data.")
        return

    diagram_definition = generate_dependency_map(initiative_data, filter_id=args.filter_id)
    
    print("\\nMermaid Diagram Definition (copy and paste into a Mermaid renderer):\\n")
    print(diagram_definition)

if __name__ == "__main__":
    main() 