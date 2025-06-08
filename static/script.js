document.addEventListener('DOMContentLoaded', function() {
    let allData = {};
    let network = null;
    const container = document.getElementById('mynetwork');
    const legendContainer = document.getElementById('legend');
    const allNodesMap = new Map();

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
        if (!allData.program) return;

        const nodes = new vis.DataSet();
        const edges = new vis.DataSet();
        const program = allData.program;

        nodes.add({ id: program.id, label: program.name, title: program.description, group: 'program', level: 1 });

        program.is_dependency_for.forEach(item => {
            nodes.add({ id: item.id, label: item.name, group: item.status, level: 0 });
            edges.add({ from: item.id, to: program.id, label: 'is dependency for' });
        });

        let dependsOn = program.depends_on;
        if (filterId) {
            dependsOn = dependsOn.filter(item => item.id === filterId);
        }

        dependsOn.forEach(item => {
            nodes.add({ id: item.id, label: item.name, group: item.status, level: 2 });
            edges.add({ from: program.id, to: item.id, label: 'depends on' });
        });

        const graphData = { nodes, edges };
        const options = {
            nodes: { shape: 'box' },
            layout: { hierarchical: { direction: 'LR', levelSeparation: 300, nodeSpacing: 200, sortMethod: 'directed' } },
            groups: {
                program: { color: { background: '#FADBD8', border: '#C0392B' } },
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
        const groups = {
            program: { color: { background: '#FADBD8', border: '#C0392B' } },
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

    function buildAllNodesMap(item) {
        allNodesMap.set(item.id, item);
        if (item.depends_on) item.depends_on.forEach(buildAllNodesMap);
        if (item.is_dependency_for) item.is_dependency_for.forEach(buildAllNodesMap);
    }
    
    fetch('/api/data')
        .then(response => response.json())
        .then(data => {
            allData = data;
            buildAllNodesMap(allData.program);
            drawNetwork();
            createLegend();
        })
        .catch(error => console.error('Error fetching data:', error));

    document.getElementById('filter-button').addEventListener('click', () => {
        const filterId = document.getElementById('filter-input').value;
        const selectedNode = allNodesMap.get(filterId);
        
        // Update tables before applying filter
        if (selectedNode) {
            updateDetailsTable(selectedNode);
        }
        
        drawNetwork(filterId);
    });

    document.getElementById('clear-button').addEventListener('click', () => {
        document.getElementById('filter-input').value = '';
        drawNetwork();
    });
}); 