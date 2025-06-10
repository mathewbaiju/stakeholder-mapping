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

    // Get the program name from URL
    let program;
    if (window.location.pathname.includes('/explore/')) {
        // GitHub Pages path: /explore/program-name/role.html
        program = window.location.pathname.split('/')[2];
    } else {
        // Local development path: /explore?program=program-name
        const urlParams = new URLSearchParams(window.location.search);
        program = urlParams.get('program');
    }
    
    // Determine the API endpoint based on environment
    let apiUrl;
    if (window.location.pathname.includes('/explore/')) {
        // GitHub Pages: use static JSON files
        apiUrl = `/api/data/${program}.json`;
    } else {
        // Local development: use Flask API endpoint
        apiUrl = `/api/data?program=${program}`;
    }

    // Fetch program data
    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            if (data.program && data.program.depends_on) {
                displayOutcomes(data.program.depends_on);
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

    // Sort outcomes by status: Respond first, then Open, then On Track, then Closed
    const statusOrder = {
        'Respond': 1,
        'At Risk': 1,
        'Blocked': 1,
        'open': 2,
        'On Hold': 2,
        'On Track': 3,
        'In Progress': 3,
        'Executing': 3,
        'Closed': 4
    };

    outcomes.sort((a, b) => {
        return (statusOrder[a.status] || 99) - (statusOrder[b.status] || 99);
    });

    const outcomeCards = outcomes.map(outcome => {
        // Map 'Executing' to 'On Track' for display
        let displayStatus = outcome.status;
        if (displayStatus === 'Executing') {
            displayStatus = 'ON TRACK';
        } else {
            displayStatus = displayStatus.toUpperCase();
        }

        // Use appropriate CSS class for each status
        let statusClass = outcome.status.toLowerCase().replace(/\s+/g, '-');
        if (statusClass === 'executing') {
            statusClass = 'on-track';
        }
        // Ensure 'on hold' gets its own class
        if (statusClass === 'on-hold') {
            statusClass = 'on-hold';
        }

        return `
            <div class="outcome-card" onclick="window.open('https://jira.autodesk.com/browse/${outcome.id}', '_blank')">
                <div class="outcome-info">
                    <div class="outcome-header">
                        <h3>${outcome.name}</h3>
                    </div>
                </div>
                <div class="outcome-status status-${statusClass}">${displayStatus}</div>
            </div>
        `;
    }).join('');

    outcomesList.innerHTML = outcomeCards;
}

function getStatusClass(status) {
    switch (status.toLowerCase()) {
        case 'closed':
            return 'completed';
        case 'on track':
        case 'in progress':
        case 'executing':
            return 'in-progress';
        case 'open':
        case 'on hold':
            return 'on-hold';
        case 'blocked':
        case 'at risk':
        case 'respond':
            return 'blocked';
        default:
            return 'planned';
    }
} 