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

    function buildAllNodesMap(item) {
        if (!item) return;
        allNodesMap.set(item.id, item);
        if (item.depends_on) item.depends_on.forEach(buildAllNodesMap);
        if (item.is_dependency_for) item.is_dependency_for.forEach(buildAllNodesMap);
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
            buildAllNodesMap(allData.program);
            
            const network = new vis.Network(container, { nodes, edges }, options);

            network.on('click', function(params) {
                if (params.nodes.length > 0) {
                    const nodeId = params.nodes[0];
                    filterInput.value = nodeId;

                    const itemData = allNodesMap.get(nodeId);
                    if (itemData && itemData.depends_on) {
                        const isExpanded = itemData.depends_on.every(dep => nodes.get(dep.id));
                        
                        if (isExpanded) {
                            itemData.depends_on.forEach(dep => {
                                nodes.remove(dep.id);
                            });
                        } else {
                            const parentNode = nodes.get(nodeId);
                            itemData.depends_on.forEach(dep => {
                                if (!nodes.get(dep.id)) {
                                    nodes.add({
                                        id: dep.id,
                                        label: dep.name,
                                        group: dep.status,
                                        level: parentNode.level + 1,
                                        title: dep.description
                                    });
                                    edges.add({ from: nodeId, to: dep.id, label: 'depends on' });
                                }
                            });
                        }
                    }
                }
            });

            drawNetwork();
            createLegend();
        });

    filterButton.addEventListener('click', () => drawNetwork(filterInput.value));
    clearButton.addEventListener('click', () => {
        filterInput.value = '';
        drawNetwork();
    });
}); 