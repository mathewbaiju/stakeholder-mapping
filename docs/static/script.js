document.addEventListener('DOMContentLoaded', function() {
    // --- Global State ---
    let allData = {};
    const allNodesMap = new Map();
    const nodes = new vis.DataSet();
    const edges = new vis.DataSet();

    // --- DOM Elements ---
    const container = document.getElementById('mynetwork');
    const legendContainer = document.getElementById('legend');
    const filterInput = document.getElementById('filter-input');
    const filterButton = document.getElementById('filter-button');
    const clearButton = document.getElementById('clear-button');
    const tableTitle = document.getElementById('table-title');
    const tableBody = document.getElementById('outcomes-table').getElementsByTagName('tbody')[0];

    // --- Configuration ---
    const options = {
        nodes: { shape: 'box' },
        layout: {
            hierarchical: {
                direction: 'LR',
                sortMethod: 'directed',
                levelSeparation: 250,
                nodeSpacing: 150
            }
        },
        groups: {
            'On Hold':     { color: { background: '#E5E7E9', border: '#7F8C8D' } },
            'In Progress': { color: { background: '#D5F5E3', border: '#1E8449' } },
            'Executing':   { color: { background: '#D5F5E3', border: '#1E8449' } },
            'On Track':    { color: { background: '#D5F5E3', border: '#1E8449' } },
            'Blocked':     { color: { background: '#FADBD8', border: '#C0392B' } },
            'At Risk':     { color: { background: '#FADBD8', border: '#C0392B' } },
            'Closed':      { color: { background: '#EBF5FB', border: '#2E86C1' } }
        }
    };

    // --- Functions ---

    function populateTable(item) {
        tableBody.innerHTML = ''; // Clear existing rows

        if (item.type === 'program' && item.depends_on) {
            tableTitle.textContent = `Outcomes for ${item.name}`;
            const outcomes = item.depends_on.filter(dep => dep.type === 'outcome');
            
            if (outcomes.length > 0) {
                const JIRA_BASE_URL = "https://jira.autodesk.com/browse/";
                outcomes.forEach(outcome => {
                    const row = tableBody.insertRow();
                    const idCell = row.insertCell(0);
                    idCell.innerHTML = `<a href="${JIRA_BASE_URL}${outcome.id}" target="_blank">${outcome.id}</a>`;
                    row.insertCell(1).textContent = outcome.name;
                    row.insertCell(2).textContent = outcome.status;
                });
            } else {
                const row = tableBody.insertRow();
                const cell = row.insertCell(0);
                cell.colSpan = 3;
                cell.textContent = 'No outcomes for this program.';
                cell.style.textAlign = 'center';
            }
        } else {
            tableTitle.textContent = 'Outcomes';
            const row = tableBody.insertRow();
            const cell = row.insertCell(0);
            cell.colSpan = 3;
            cell.textContent = 'Select a program to see its outcomes.';
            cell.style.textAlign = 'center';
        }
    }

    function buildAllNodesMap(item) {
        if (!item) return;
        allNodesMap.set(item.id, item);
        if (item.depends_on) item.depends_on.forEach(buildAllNodesMap);
        if (item.is_dependency_for) item.is_dependency_for.forEach(buildAllNodesMap);
    }

    function updateDetailsTable(itemData) {
        if (!itemData) {
            // Clear the table if no data
            document.getElementById('detail-id').textContent = '';
            document.getElementById('detail-name').textContent = '';
            document.getElementById('detail-type').textContent = '';
            document.getElementById('detail-status').textContent = '';
            document.getElementById('detail-description').textContent = '';
            document.getElementById('detail-owner').textContent = '';
            document.getElementById('detail-start-date').textContent = '';
            document.getElementById('detail-end-date').textContent = '';
            return;
        }

        // Update the table with the item's data
        const jiraBaseUrl = 'https://jira.autodesk.com/browse/';
        document.getElementById('detail-id').innerHTML = `<a href="${jiraBaseUrl}${itemData.id}" target="_blank">${itemData.id}</a>`;
        document.getElementById('detail-name').textContent = itemData.name || '';
        document.getElementById('detail-type').textContent = itemData.type || '';
        document.getElementById('detail-status').textContent = itemData.status || '';
        document.getElementById('detail-description').textContent = itemData.description || '';
        document.getElementById('detail-owner').textContent = itemData.owner || '';
        document.getElementById('detail-start-date').textContent = itemData.start_date || '';
        document.getElementById('detail-end-date').textContent = itemData.end_date || '';

        // Show/hide outcomes table based on item type
        const outcomesTable = document.getElementById('outcomes-table');
        if (itemData.type === 'program' && itemData.depends_on) {
            outcomesTable.style.display = 'block';
            updateOutcomesTable(itemData.depends_on);
        } else {
            outcomesTable.style.display = 'none';
        }
    }

    function updateOutcomesTable(outcomes) {
        const tbody = document.getElementById('outcomes-body');
        tbody.innerHTML = '';
        const jiraBaseUrl = 'https://jira.autodesk.com/browse/';
        
        outcomes.forEach(outcome => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><a href="${jiraBaseUrl}${outcome.id}" target="_blank">${outcome.id}</a></td>
                <td>${outcome.name}</td>
                <td>${outcome.status}</td>
            `;
            tbody.appendChild(row);
        });
    }

    function drawNetwork(filterId = null) {
        const program = allData.program;
        if (!program) return;
        
        const nodesToAdd = [];
        const edgesToAdd = [];

        nodesToAdd.push({ id: program.id, label: program.name, group: program.status, level: 1, title: program.description });

        program.is_dependency_for.forEach(item => {
            nodesToAdd.push({ id: item.id, label: item.name, group: item.status, level: 0, title: item.description });
            edgesToAdd.push({ from: item.id, to: program.id, label: 'is dependency for' });
        });

        let dependsOn = program.depends_on || [];
        if (filterId) {
            dependsOn = dependsOn.filter(dep => dep.id === filterId);
        }

        dependsOn.forEach(item => {
            nodesToAdd.push({ id: item.id, label: item.name, group: item.status, level: 2, title: item.description });
            edgesToAdd.push({ from: program.id, to: item.id, label: 'depends on' });
        });

        nodes.clear();
        edges.clear();
        nodes.add(nodesToAdd);
        edges.add(edgesToAdd);

        network = new vis.Network(container, { nodes, edges }, options);
        
        network.on("click", function(params) {
            if (params.nodes.length > 0) {
                const nodeId = params.nodes[0];
                const itemData = allNodesMap.get(nodeId);

                // Update the details table
                updateDetailsTable(itemData);

                // Populate the filter box
                document.getElementById('filter-input').value = nodeId;

                // Expand or collapse the node
                if (itemData && itemData.depends_on) {
                    const isExpanded = edges.get({
                        filter: edge => edge.from === nodeId && itemData.depends_on.some(dep => dep.id === edge.to)
                    }).length > 0;

                    if (isExpanded) {
                        // Collapse: remove children and their edges recursively
                        const nodesToRemove = [];
                        const edgesToRemove = [];
                        function getChildrenRecursive(id) {
                            const childEdges = edges.get({ filter: edge => edge.from === id });
                            childEdges.forEach(edge => {
                                edgesToRemove.push(edge.id);
                                nodesToRemove.push(edge.to);
                                getChildrenRecursive(edge.to);
                            });
                        }
                        getChildrenRecursive(nodeId);
                        edges.remove(edgesToRemove);
                        nodes.remove(nodesToRemove);
                    } else {
                        // Expand: add direct children
                        const nodeOnCanvas = nodes.get(nodeId);
                        const parentLevel = nodeOnCanvas.level;
                        itemData.depends_on.forEach(dep => {
                            if (!nodes.get(dep.id)) {
                                nodes.add({ id: dep.id, label: dep.name, group: dep.status, level: parentLevel + 1 });
                                edges.add({ from: nodeId, to: dep.id, label: 'depends on' });
                            }
                        });
                    }
                }
            } else {
                // Clear the details table when clicking on empty space
                updateDetailsTable(null);
            }
        });

        // Show initial program details
        updateDetailsTable(program);
    }

    function createLegend() {
        legendContainer.innerHTML = '';
        for (const groupName in options.groups) {
            const color = options.groups[groupName].color.background;
            const border = options.groups[groupName].color.border;
            const legendItem = document.createElement('div');
            legendItem.className = 'legend-item';
            legendItem.innerHTML = `<div class="legend-color-box" style="background-color: ${color}; border: 1px solid ${border};"></div> ${groupName}`;
            legendContainer.appendChild(legendItem);
        }
    }

    // --- Initialization and Event Listeners ---

    fetch('/api/data')
        .then(response => response.json())
        .then(data => {
            allData = data;
            if (allData.program) allData.program.type = 'program';
            buildAllNodesMap(allData.program);
            drawNetwork();
            createLegend();
            populateTable(allData.program);
        });

    filterButton.addEventListener('click', () => {
        drawNetwork(filterInput.value);
        populateTable(allData.program);
    });

    clearButton.addEventListener('click', () => {
        filterInput.value = '';
        drawNetwork();
        populateTable(allData.program);
    });
}); 
