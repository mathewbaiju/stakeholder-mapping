document.addEventListener('DOMContentLoaded', function() {
    let allData = {};
    let network = null;
    const container = document.getElementById('mynetwork');
    const legendContainer = document.getElementById('legend');
    const allNodesMap = new Map();
    const tableTitle = document.getElementById('table-title');
    const tableBody = document.getElementById('outcomes-table').getElementsByTagName('tbody')[0];
    const filterInput = document.getElementById('filter-input');

    function drawNetwork(filterId = null) {
        if (!allData.initiative) return;

        const nodes = new vis.DataSet();
        const edges = new vis.DataSet();
        const initiative = allData.initiative;

        nodes.add({ id: initiative.id, label: initiative.name, title: initiative.description, group: 'initiative', level: 1 });

        initiative.is_dependency_for.forEach(item => {
            nodes.add({ id: item.id, label: item.name, group: item.status, level: 0 });
            edges.add({ from: item.id, to: initiative.id, label: 'is dependency for' });
        });

        let dependsOn = initiative.depends_on;
        if (filterId) {
            dependsOn = dependsOn.filter(item => item.id === filterId);
        }

        dependsOn.forEach(item => {
            nodes.add({ id: item.id, label: item.name, group: item.status, level: 2 });
            edges.add({ from: initiative.id, to: item.id, label: 'depends on' });
        });

        const graphData = { nodes, edges };
        const options = {
            nodes: { shape: 'box' },
            layout: { hierarchical: { direction: 'LR', levelSeparation: 300, nodeSpacing: 200, sortMethod: 'directed' } },
            groups: {
                initiative: { color: { background: '#FADBD8', border: '#C0392B' } },
                'On Hold': { color: { background: '#FCF3CF', border: '#F1C40F' } },
                'Closed': { color: { background: '#D5F5E3', border: '#1E8449' } },
                'On Track': { color: { background: '#EBF5FB', border: '#2E86C1' } },
                'Executing': { color: { background: '#F5B7B1', border: '#C0392B' } },
                'In Progress': { color: { background: '#FADBD8', border: '#C0392B' } }
            }
        };
        network = new vis.Network(container, graphData, options);
        
        network.on("click", function(params) {
            if (params.nodes.length > 0) {
                const nodeId = params.nodes[0];
                const itemData = allNodesMap.get(nodeId);

                if (itemData) {
                    populateTable(itemData);
                }

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
            }
        });
    }

    function createLegend() {
        legendContainer.innerHTML = '';
        const groups = {
            initiative: { color: { background: '#FADBD8', border: '#C0392B' } },
            'On Hold': { color: { background: '#FCF3CF', border: '#F1C40F' } },
            'Closed': { color: { background: '#D5F5E3', border: '#1E8449' } },
            'On Track': { color: { background: '#EBF5FB', border: '#2E86C1' } },
            'Executing': { color: { background: '#F5B7B1', border: '#C0392B' } },
            'In Progress': { color: { background: '#FADBD8', border: '#C0392B' } }
        };
        for (const groupName in groups) {
            const color = groups[groupName].color.background;
            const border = groups[groupName].color.border;
            const legendItem = document.createElement('div');
            legendItem.className = 'legend-item';
            legendItem.innerHTML = `<div class="legend-color-box" style="background-color: ${color}; border: 1px solid ${border};"></div> ${groupName}`;
            legendContainer.appendChild(legendItem);
        }
    }

    function populateTable(item) {
        tableBody.innerHTML = ''; // Clear existing rows
        tableTitle.textContent = `Outcomes for ${item.name}`;

        const outcomes = item.depends_on ? item.depends_on.filter(dep => dep.type === 'outcome') : [];

        if (outcomes.length > 0) {
            outcomes.forEach(outcome => {
                const row = tableBody.insertRow();
                row.insertCell(0).textContent = outcome.id;
                row.insertCell(1).textContent = outcome.name;
                row.insertCell(2).textContent = outcome.status;
            });
        } else {
            const row = tableBody.insertRow();
            const cell = row.insertCell(0);
            cell.colSpan = 3;
            cell.textContent = 'No outcomes found for this item.';
            cell.style.textAlign = 'center';
        }
    }

    function buildAllNodesMap(item) {
        allNodesMap.set(item.id, item);
        if (item.depends_on) item.depends_on.forEach(buildAllNodesMap);
        if (item.is_dependency_for) item.is_dependency_for.forEach(buildAllNodesMap);
    }
    
    fetch('/api/data')
        .then(response => response.json())
        .then(data => {
            allData = data;
            buildAllNodesMap(allData.initiative);
            drawNetwork();
            createLegend();
            populateTable(allData.program);
        })
        .catch(error => console.error('Error fetching data:', error));

    document.getElementById('filter-button').addEventListener('click', () => {
        const filterId = document.getElementById('filter-input').value;
        drawNetwork(filterId);
    });

    document.getElementById('clear-button').addEventListener('click', () => {
        document.getElementById('filter-input').value = '';
        drawNetwork();
    });
}); 