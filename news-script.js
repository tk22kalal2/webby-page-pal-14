
// News page functionality
function toggleCard(button) {
    const card = button.closest('.news-card');
    const content = card.querySelector('.card-content');
    const icon = button.querySelector('i');
    
    // Toggle expanded state
    content.classList.toggle('expanded');
    button.classList.toggle('rotated');
    
    // Add smooth animation effect
    if (content.classList.contains('expanded')) {
        // Scroll to card smoothly
        setTimeout(() => {
            card.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    }
}

// Smooth scrolling for table of contents links
document.addEventListener('DOMContentLoaded', function() {
    const tocLinks = document.querySelectorAll('#tocList a');
    
    tocLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                // Highlight the clicked news card
                document.querySelectorAll('.news-card').forEach(card => {
                    card.classList.remove('highlight');
                });
                
                targetElement.classList.add('highlight');
                
                // Scroll to target
                targetElement.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'start',
                    inline: 'nearest'
                });
                
                // Auto-expand the card if not already expanded
                setTimeout(() => {
                    const content = targetElement.querySelector('.card-content');
                    const button = targetElement.querySelector('.expand-btn');
                    
                    if (!content.classList.contains('expanded')) {
                        toggleCard(button);
                    }
                    
                    // Remove highlight after animation
                    setTimeout(() => {
                        targetElement.classList.remove('highlight');
                    }, 2000);
                }, 500);
            }
        });
    });
    
    // Add intersection observer for automatic TOC highlighting
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.id;
                const correspondingLink = document.querySelector(`#tocList a[href="#${id}"]`);
                
                // Remove active class from all links
                document.querySelectorAll('#tocList a').forEach(link => {
                    link.classList.remove('active');
                });
                
                // Add active class to current link
                if (correspondingLink) {
                    correspondingLink.classList.add('active');
                }
            }
        });
    }, {
        threshold: 0.3,
        rootMargin: '-20% 0px -20% 0px'
    });
    
    // Observe all news cards
    document.querySelectorAll('.news-card').forEach(card => {
        observer.observe(card);
    });
});

// Add CSS for highlight effect
const style = document.createElement('style');
style.textContent = `
    .news-card.highlight {
        transform: perspective(1000px) rotateX(5deg) translateY(-10px) scale(1.02);
        box-shadow: 0 25px 50px rgba(102, 126, 234, 0.3);
        border: 2px solid #667eea;
    }
    
    #tocList a.active {
        background: rgba(255, 255, 255, 0.2);
        transform: translateX(5px);
    }
`;
document.head.appendChild(style);
