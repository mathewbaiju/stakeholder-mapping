document.addEventListener('DOMContentLoaded', function() {
    // Entrance animations
    const timeline = gsap.timeline({ defaults: { ease: "power2.out" } });
    
    timeline
        .from('header', { 
            y: -30, 
            opacity: 0, 
            duration: 0.8 
        })
        .from('.column', { 
            y: 30, 
            opacity: 0, 
            duration: 0.6,
            stagger: 0.2
        }, "-=0.4")
        .from('.stakeholder-card, .dependency-card, .initiative-card', {
            y: 20,
            opacity: 0,
            duration: 0.4,
            stagger: 0.1
        }, "-=0.2");

    // Add hover animations for cards
    const cards = document.querySelectorAll('.stakeholder-card, .dependency-card, .initiative-card');
    
    cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            gsap.to(card, {
                scale: 1.02,
                duration: 0.2
            });
        });
        
        card.addEventListener('mouseleave', () => {
            gsap.to(card, {
                scale: 1,
                duration: 0.2
            });
        });
    });

    // Get the program name from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const program = urlParams.get('program');
    
    // Fetch program data from the API
    fetch('/api/data')
        .then(response => response.json())
        .then(data => {
            if (data.program && data.program.depends_on) {
                const outcomes = data.program.depends_on.filter(item => item.type === 'outcome');
                displayOutcomes(outcomes);
            }
        })
        .catch(error => {
            console.error('Error fetching program data:', error);
            document.getElementById('outcomes-content').innerHTML = `
                <div class="error-message">
                    <span class="material-icons">error</span>
                    <p>Error loading outcomes. Please try again later.</p>
                </div>
            `;
        });
});

function displayOutcomes(outcomes) {
    const outcomesList = document.getElementById('outcomes-content');
    
    if (!outcomes || outcomes.length === 0) {
        outcomesList.innerHTML = `
            <div class="empty-state">
                <span class="material-icons">info</span>
                <p>No outcomes found for this program.</p>
            </div>
        `;
        return;
    }

    // Sort outcomes by status: Completed first, then In Progress, then Planned
    const statusOrder = {
        'Closed': 1,
        'On Track': 2,
        'In Progress': 2,
        'Executing': 2,
        'On Hold': 3,
        'Blocked': 4,
        'At Risk': 4
    };

    outcomes.sort((a, b) => {
        return (statusOrder[a.status] || 99) - (statusOrder[b.status] || 99);
    });

    const outcomeCards = outcomes.map(outcome => {
        const statusClass = outcome.status.toLowerCase().replace(/\s+/g, '-');
        return `
            <div class="outcome-card" onclick="window.open('https://jira.autodesk.com/browse/${outcome.id}', '_blank')">
                <div class="outcome-info">
                    <div class="outcome-header">
                        <h3>${outcome.name}</h3>
                    </div>
                </div>
                <div class="outcome-status status-${statusClass}">${outcome.status.toUpperCase()}</div>
            </div>
        `;
    }).join('');

    outcomesList.innerHTML = outcomeCards;
}

function getStatusClass(status) {
    switch (status) {
        case 'Closed':
            return 'completed';
        case 'On Track':
        case 'In Progress':
        case 'Executing':
            return 'in-progress';
        case 'On Hold':
            return 'on-hold';
        case 'Blocked':
        case 'At Risk':
            return 'blocked';
        default:
            return 'planned';
    }
} 