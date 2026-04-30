// ============================================================================
// SMOOTH SCROLLING & NAVIGATION
// ============================================================================

function scrollToSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
    }
}

// Update active nav link based on scroll position
document.addEventListener('DOMContentLoaded', function() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    function updateActiveLink() {
        let current = '';

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (window.pageYOffset >= sectionTop - 150) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    }

    window.addEventListener('scroll', updateActiveLink);
});

// ============================================================================
// INTERSECTION OBSERVER FOR FADE-IN ANIMATIONS
// ============================================================================

const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.animation = 'fadeInUp 0.6s ease-out forwards';
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe all cards and elements for fade-in animation
document.addEventListener('DOMContentLoaded', function() {
    const cards = document.querySelectorAll(
        '.project-card, .skill-card, .achievement-card, .achievement-milestone'
    );
    cards.forEach(card => {
        card.style.opacity = '0';
        observer.observe(card);
    });
});

// ============================================================================
// FORM HANDLING
// ============================================================================

const contactForm = document.getElementById('contactForm');

if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const message = document.getElementById('message').value.trim();

        // Simple validation
        if (!name || !email || !message) {
            alert('Please fill in all fields');
            return;
        }

        // Email validation regex
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert('Please enter a valid email address');
            return;
        }

        // Here you would typically send the form data to a server
        // For now, we'll just show a success message
        console.log('Form submitted:', { name, email, message });

        // Show success message
        alert('Thank you for your message! I will get back to you soon.');

        // Reset form
        contactForm.reset();
    });
}

// ============================================================================
// MOBILE MENU TOGGLE (for smaller screens)
// ============================================================================

function initMobileMenu() {
    const navbar = document.querySelector('.navbar');
    const navLinks = document.querySelector('.nav-links');
    const logo = document.querySelector('.logo');

    // Create mobile menu button if screen is small
    if (window.innerWidth <= 768) {
        if (!document.querySelector('.mobile-menu-btn')) {
            const menuBtn = document.createElement('button');
            menuBtn.className = 'mobile-menu-btn';
            menuBtn.innerHTML = '☰';
            navbar.querySelector('.navbar-container').appendChild(menuBtn);

            menuBtn.addEventListener('click', function() {
                navLinks.classList.toggle('active');
            });

            // Close menu when a link is clicked
            document.querySelectorAll('.nav-link').forEach(link => {
                link.addEventListener('click', function() {
                    navLinks.classList.remove('active');
                });
            });
        }
    }
}

document.addEventListener('DOMContentLoaded', initMobileMenu);
window.addEventListener('resize', initMobileMenu);

// ============================================================================
// BUTTON HOVER EFFECTS
// ============================================================================

const buttons = document.querySelectorAll('.btn');

buttons.forEach(button => {
    button.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-2px)';
    });

    button.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
    });
});

// ============================================================================
// SCROLL PROGRESS INDICATOR (Optional)
// ============================================================================

window.addEventListener('scroll', function() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrollPercent = (scrollTop / docHeight) * 100;

    // You can use this to create a progress bar if needed
    // document.body.style.setProperty('--scroll-percent', scrollPercent + '%');
});

// ============================================================================
// LAZY LOADING FOR IMAGES (Performance)
// ============================================================================

if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src || img.src;
                img.classList.add('loaded');
                imageObserver.unobserve(img);
            }
        });
    });

    // Apply lazy loading to all images with data-src attribute
    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}

// ============================================================================
// SMOOTH ANCHOR LINK HANDLING
// ============================================================================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ============================================================================
// PARALLAX EFFECT - Hero image moves upward as user scrolls
// ============================================================================

function initParallax() {
    const heroImage = document.querySelector('.hero-image');
    const heroSection = document.querySelector('.hero');
    
    if (heroImage && heroSection) {
        const handleParallax = throttle(function() {
            const scrollPosition = window.pageYOffset;
            const heroTop = heroSection.offsetTop;
            
            // Calculate parallax movement - negative value to move image UP as you scroll down
            const offset = scrollPosition - heroTop;
            const moveDistance = offset * -0.35; // Negative for upward movement
            
            // Only apply transform when in view or shortly after
            if (offset > -300 && offset < 600) {
                heroImage.style.transform = `translateY(${moveDistance}px)`;
            }
        }, 16); // ~60fps throttling
        
        window.addEventListener('scroll', handleParallax, { passive: true });
        
        // Initial call
        handleParallax();
    }
}

document.addEventListener('DOMContentLoaded', initParallax);

// ============================================================================
// DARK MODE TOGGLE (Optional - for future enhancement)
// ============================================================================

function initDarkMode() {
    // Check for saved theme preference or default to 'light'
    const currentTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', currentTheme);

    // You can add a toggle button in the navbar if needed
    // const toggleBtn = document.createElement('button');
    // toggleBtn.className = 'theme-toggle';
    // toggleBtn.innerHTML = currentTheme === 'light' ? '🌙' : '☀️';
    // toggleBtn.addEventListener('click', toggleTheme);
    // navbar.appendChild(toggleBtn);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
}

// ============================================================================
// KEYBOARD NAVIGATION
// ============================================================================

document.addEventListener('keydown', function(event) {
    // Skip if key is not ESC or if focused on form input
    if (event.key !== 'Escape') return;

    const mobileMenu = document.querySelector('.nav-links.active');
    if (mobileMenu) {
        mobileMenu.classList.remove('active');
    }
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// ============================================================================
// INITIALIZATION
// ============================================================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('Vaibhav Portfolio Loaded Successfully');

    // Initialize all features
    initDarkMode();

    // Add scroll behavior hints
    const html = document.documentElement;
    html.style.scrollBehavior = 'smooth';
});

// ============================================================================
// ERROR HANDLING
// ============================================================================

window.addEventListener('error', function(event) {
    console.error('An error occurred:', event.error);
});

// ============================================================================
// PERFORMANCE MONITORING (Optional)
// ============================================================================

if (window.performance && window.performance.timing) {
    window.addEventListener('load', function() {
        setTimeout(function() {
            const perfData = window.performance.timing;
            const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
            console.log('Page Load Time:', pageLoadTime + 'ms');
        }, 0);
    });
}
