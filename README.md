# Interactive Dependency Map

This tool provides a dynamic, interactive visualization of program initiatives and their dependencies. It launches a web-based interface that reads data from a `program_data.json` file and generates a color-coded, interactive dependency map.

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

*[A screenshot of the interactive web application would go here, showing the legend, filter controls, and the color-coded, interactive dependency map.]*
