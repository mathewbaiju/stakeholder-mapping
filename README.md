# Platform Strategic Initiatives Explorer

A web application to explore and visualize platform strategic initiatives, their outcomes, and dependencies.

## GitHub Pages Setup

This site is configured to be hosted on GitHub Pages. To set it up:

1. Push this repository to GitHub
2. Go to your repository settings
3. Under "Pages", select:
   - Source: Deploy from a branch
   - Branch: gh-pages
   - Folder: / (root)
4. Click Save

The GitHub Actions workflow will automatically:
1. Generate static HTML pages from the Flask templates
2. Copy all necessary static files
3. Deploy to the gh-pages branch

## Development

To run the site locally:

1. Install Python dependencies:
   ```bash
   pip install flask jinja2
   ```

2. Run the Flask development server:
   ```bash
   python app.py
   ```

3. To build the static site:
   ```bash
   python build_static.py
   ```

## Structure

- `/data/` - JSON data files for programs
- `/static/` - CSS, JavaScript, and other static assets
- `/templates/` - HTML templates
- `/docs/` - Generated static site (don't edit directly)

## Adding/Updating Content

1. Edit the JSON files in the `/data/` directory
2. Commit and push your changes
3. GitHub Actions will automatically rebuild and deploy the site

## Tech Stack

*   **Python 3**: The core language for the backend server.
*   **Flask**: A lightweight web framework for Python used to serve the application and data.
*   **HTML/CSS/JavaScript**: The frontend of the application.
*   **vis.js**: A JavaScript library used for network visualization and creating the interactive diagram.

## Environment Setup

To set up the environment on your local machine, follow these steps:

1.  **Install Python 3**: If you don't have Python 3 installed, you can download it from the [official Python website](https://www.python.org/downloads/).

2.  **Clone the repository**:
    ```bash
    git clone https://github.com/mathewbaiju/stakeholder-mapping.git
    cd stakeholder-mapping
    ```
3.  **Install dependencies**: The project uses Flask to run the web server. Install it using pip:
    ```bash
    pip install -r requirements.txt
    ```

## How to Run

To launch the interactive dependency map, run the Flask application from your terminal:

```bash
python3 app.py
```

Then, open your web browser and navigate to `http://127.0.0.1:5000`.

## Features

The interactive dependency map has several features to help you explore your data:

*   **Interactive Diagram**: A pannable, zoomable diagram of your dependencies.
*   **Color-Coded Nodes**: Nodes are colored based on their status (`On Track`, `Closed`, `On Hold`, etc.). A legend at the top of the page explains what each color means.
*   **Click to Expand/Collapse**: Click on a node to see its next-level dependencies. Click it again to hide them.
*   **Click to Filter**: Click on any node to automatically populate the filter box with its ID. You can then click the "Filter" button to see a focused view of that dependency.
*   **Clear Filter**: Use the "Clear" button to return to the full, unfiltered view.

## Example Output

The web application will render a live, interactive diagram that looks something like this:

![image](https://github.com/user-attachments/assets/b48dbb87-14af-4624-a6d6-4d1b09723329)

