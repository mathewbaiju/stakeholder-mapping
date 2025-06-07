import json
import os

def generate_mermaid_id(name):
    """Generates a Mermaid-friendly ID from a string."""
    # Remove special characters and replace spaces/hyphens with underscores
    clean_name = ''.join(char for char in name if char.isalnum() or char.isspace() or char == '_')
    return clean_name.replace(" ", "_").replace("-", "_")

def generate_dependency_map(data):
    """Generates a Mermaid diagram definition from dependency data."""
    mermaid_string = "graph LR;\\n"
    
    initiative_id = generate_mermaid_id(data.get("id", "initiative"))
    initiative_name = data.get("name", "Initiative")
    mermaid_string += f'    classDef initiative fill:#FADBD8,stroke:#C0392B,stroke-width:2px,color:#000;\\n'
    mermaid_string += f'    {initiative_id}("{initiative_name}");\\n'
    mermaid_string += f"    class {initiative_id} initiative;\\n\\n"
    
    # Process 'depends_on' relationships
    depends_on = data.get("depends_on", [])
    if depends_on:
        mermaid_string += "    %% depends_on\\n"
        for item in depends_on:
            item_id = generate_mermaid_id(item["id"])
            item_name = item["name"].replace('"', '#quot;')
            item_status = item.get("status", "")
            mermaid_string += f'    {item_id}("{item_name}<br/><i>{item_status}</i>");\\n'
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
            mermaid_string += f'    {item_id} -- "is dependency for" --> {initiative_id};\\n'
        mermaid_string += "\\n"
                
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

    initiative_data = data.get("initiative")
    if not initiative_data:
        print("Error: 'initiative' key not found in JSON data.")
        return

    diagram_definition = generate_dependency_map(initiative_data)
    
    print("\\nMermaid Diagram Definition (copy and paste into a Mermaid renderer):\\n")
    print(diagram_definition)

if __name__ == "__main__":
    main() 