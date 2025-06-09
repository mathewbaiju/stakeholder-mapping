// Initialize GSAP animations
document.addEventListener('DOMContentLoaded', function() {
    // Animate shapes
    gsap.to('.shape-1', {
        x: 100,
        y: -50,
        rotation: 360,
        duration: 20,
        repeat: -1,
        ease: "none"
    });

    gsap.to('.shape-2', {
        x: -150,
        y: 100,
        rotation: -360,
        duration: 25,
        repeat: -1,
        ease: "none"
    });

    gsap.to('.shape-3', {
        x: 50,
        y: 150,
        rotation: 720,
        duration: 30,
        repeat: -1,
        ease: "none"
    });

    // Entrance animations
    const timeline = gsap.timeline({ defaults: { ease: "power2.out" } });
    
    timeline
        .from('.autodesk-logo', { y: -50, opacity: 0, duration: 1 })
        .from('.welcome-title', { y: 30, opacity: 0, duration: 0.8 }, "-=0.5")
        .from('.program-card', { 
            y: 30, 
            opacity: 0, 
            duration: 0.5, 
            stagger: 0.1 
        }, "-=0.3")
        .from('.role-card', { 
            y: 30, 
            opacity: 0, 
            duration: 0.5, 
            stagger: 0.1 
        }, "-=0.3")
        .from('.proceed-button', { 
            y: 30, 
            opacity: 0, 
            duration: 0.5 
        }, "-=0.2");

    // Handle program selection
    const programCards = document.querySelectorAll('.program-card');
    let selectedProgram = null;

    programCards.forEach(card => {
        card.addEventListener('click', () => {
            programCards.forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            selectedProgram = card.dataset.program;
            checkProceedButton();
        });
    });

    // Handle role selection
    const roleCards = document.querySelectorAll('.role-card');
    let selectedRole = null;

    roleCards.forEach(card => {
        card.addEventListener('click', () => {
            roleCards.forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            selectedRole = card.dataset.role;
            checkProceedButton();
        });
    });

    // Handle proceed button
    const proceedButton = document.querySelector('.proceed-button');

    function checkProceedButton() {
        if (selectedProgram && selectedRole) {
            proceedButton.removeAttribute('disabled');
            gsap.to(proceedButton, {
                scale: 1.05,
                duration: 0.2,
                yoyo: true,
                repeat: 1
            });
        } else {
            proceedButton.setAttribute('disabled', '');
        }
    }

    proceedButton.addEventListener('click', () => {
        if (selectedProgram && selectedRole) {
            // Add transition animation
            gsap.to('.welcome-container', {
                opacity: 0,
                y: -30,
                duration: 0.5,
                onComplete: () => {
                    // Navigate to the next page
                    window.location.href = `/explore?program=${selectedProgram}&role=${selectedRole}`;
                }
            });
        }
    });
});

document.getElementById('program-search').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        document.getElementById('proceed-btn').click();
    }
}); 