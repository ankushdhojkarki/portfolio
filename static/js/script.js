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
        const scrollPos = window.pageYOffset + window.innerHeight / 3;
        let current = sections[0]?.getAttribute('id') || '';

        sections.forEach(section => {
            if (scrollPos >= section.offsetTop) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.toggle(
                'active',
                link.getAttribute('href') === `#${current}`
            );
        });
    }

    window.addEventListener('scroll', updateActiveLink, { passive: true });

    // Update immediately on click so the highlight moves before scroll finishes
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            const href = link.getAttribute('href');
            navLinks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === href));
        });
    });

    updateActiveLink(); // run once on load
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
    const cards = document.querySelectorAll('.project-card, .skill-card');
    cards.forEach(card => {
        
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
    console.log('Ankush Portfolio Loaded Successfully');

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

// ============================================================================
// MINIMALIST PRELOADER
// ============================================================================

(function initPreloader() {
    document.body.classList.add('is-loading');

    function start() {
        const preloader = document.getElementById('preloader');
        const fill = document.getElementById('preloaderBarFill');
        const counter = document.getElementById('preloaderCounter');
        if (!preloader || !fill || !counter) {
            document.body.classList.remove('is-loading');
            document.body.classList.add('is-loaded');
            return;
        }

        const duration = 1000; // ms
        const start = performance.now();

        function tick(now) {
            const t = Math.min(1, (now - start) / duration);
            // ease-out cubic
            const eased = 1 - Math.pow(1 - t, 3);
            const pct = Math.round(eased * 100);
            fill.style.width = pct + '%';
            counter.textContent = String(pct).padStart(3, '0');

            if (t < 1) {
                requestAnimationFrame(tick);
            } else {
                // Split the curtains, reveal page
                preloader.classList.add('is-exiting');
                document.body.classList.remove('is-loading');
                document.body.classList.add('is-loaded');
                setTimeout(() => preloader.classList.add('is-hidden'), 950);
            }
        }

        requestAnimationFrame(tick);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', start);
    } else {
        start();
    }
})();

// ============================================================================
// ✨ COOL MINIMAL EFFECTS LAYER — additive, site-wide
// ============================================================================

(function fxEffects() {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ---------- 1. Custom cursor ----------
    function initCursor() {
        if (reduce) return;
        if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

        const dot = document.createElement('div');
        const ring = document.createElement('div');
        dot.className = 'fx-cursor-dot';
        ring.className = 'fx-cursor-ring';
        document.body.appendChild(dot);
        document.body.appendChild(ring);

        let mx = window.innerWidth / 2, my = window.innerHeight / 2;
        let rx = mx, ry = my;

        document.addEventListener('mousemove', (e) => {
            mx = e.clientX; my = e.clientY;
            dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
        });

        function loop() {
            rx += (mx - rx) * 0.18;
            ry += (my - ry) * 0.18;
            ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
            requestAnimationFrame(loop);
        }
        loop();

        const hoverables = 'a, button, input, textarea, .project-card, .skill-card, .project-icon-link, .project-tag';
        document.querySelectorAll(hoverables).forEach(el => {
            el.addEventListener('mouseenter', () => {
                ring.classList.add('is-hover');
                dot.classList.add('is-hover');
            });
            el.addEventListener('mouseleave', () => {
                ring.classList.remove('is-hover');
                dot.classList.remove('is-hover');
            });
        });

        document.addEventListener('mouseleave', () => {
            dot.style.opacity = '0'; ring.style.opacity = '0';
        });
        document.addEventListener('mouseenter', () => {
            dot.style.opacity = ''; ring.style.opacity = '';
        });
    }

    // ---------- 2. Scroll progress bar ----------
    function initScrollProgress() {
        const bar = document.createElement('div');
        bar.className = 'fx-scroll-progress';
        document.body.appendChild(bar);
        const update = () => {
            const h = document.documentElement;
            const pct = (h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100;
            bar.style.setProperty('--fx-scroll', pct + '%');
            bar.style.width = pct + '%';
        };
        window.addEventListener('scroll', update, { passive: true });
        update();
    }

    // ---------- 3. Navbar shrink on scroll ----------
    function initNavbarScroll() {
        const navbar = document.querySelector('.navbar');
        if (!navbar) return;
        const onScroll = () => {
            navbar.classList.toggle('is-scrolled', window.scrollY > 40);
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
    }

    // ---------- 4. Reveal on scroll (sections, cards, headers) ----------
    function initReveal() {
        // Mark targets
        const selectors = [
            '.section-header', '.section-header-left',
            '.cta-section', '.cta-buttons',
            '.hero-content', '.hero-image', '.hero-footer',
            '.blog-content', '.blog-illustration',
            '.contact-header', '.contact-form-container'
        ];
        selectors.forEach(sel => {
            document.querySelectorAll(sel).forEach(el => el.classList.add('fx-reveal'));
        });

        // Stagger groups
        const staggerSelectors = [
            '.projects-grid', '.skills-grid', '.nav-links'
        ];
        staggerSelectors.forEach(sel => {
            document.querySelectorAll(sel).forEach(el => el.classList.add('fx-stagger'));
        });

        // Image masks
        document.querySelectorAll(
            '.hero-image, .project-image, .blog-illustration'
        ).forEach(el => {
            if (el.tagName === 'IMG') {
                const wrap = document.createElement('span');
                wrap.className = 'fx-img-mask';
                wrap.style.display = 'block';
                el.parentNode.insertBefore(wrap, el);
                wrap.appendChild(el);
            } else {
                el.classList.add('fx-img-mask');
            }
        });

        const io = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    io.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

        document.querySelectorAll('.fx-reveal, .fx-stagger, .fx-img-mask').forEach(el => io.observe(el));
    }

    // ---------- 5. Section titles letter rise ----------
    // DOM-walking version: preserves nested elements like <span class="highlight-gold">
    // and <br>, only splits text nodes into per-character spans.
    function initTitleAnim() {
        function wrapTextNode(node) {
            const text = node.nodeValue;
            const frag = document.createDocumentFragment();
            for (const ch of text) {
                const span = document.createElement('span');
                if (ch === ' ') {
                    span.className = 'fx-letter fx-space';
                    span.innerHTML = '&nbsp;';
                } else {
                    span.className = 'fx-letter';
                    span.textContent = ch;
                }
                frag.appendChild(span);
            }
            node.parentNode.replaceChild(frag, node);
        }

        function walk(node) {
            // Snapshot children because we'll mutate during iteration
            const children = Array.from(node.childNodes);
            for (const child of children) {
                if (child.nodeType === Node.TEXT_NODE) {
                    if (child.nodeValue && child.nodeValue.trim() !== '') {
                        wrapTextNode(child);
                    }
                } else if (child.nodeType === Node.ELEMENT_NODE) {
                    // Recurse into elements like <span class="highlight-gold">
                    // but skip <br> (leave intact)
                    if (child.tagName.toLowerCase() !== 'br') {
                        walk(child);
                    }
                }
            }
        }

        document.querySelectorAll('.section-title, .cta-title, .blog-title')
            .forEach(el => {
                if (el.dataset.fxAnimated) return;
                el.dataset.fxAnimated = '1';

                walk(el);

                // Stagger delays per letter
                el.querySelectorAll('.fx-letter').forEach((s, i) => {
                    s.style.transitionDelay = (i * 0.025) + 's';
                });
                el.classList.add('fx-title-anim', 'fx-reveal');
            });
    }

    // ---------- 6. Magnetic buttons ----------
    function initMagnetic() {
        if (reduce) return;
        document.querySelectorAll('.btn').forEach(btn => {
            btn.addEventListener('mousemove', (e) => {
                const r = btn.getBoundingClientRect();
                const x = e.clientX - r.left - r.width / 2;
                const y = e.clientY - r.top - r.height / 2;
                btn.style.transform = `translate(${x * 0.15}px, ${y * 0.25}px)`;
            });
            btn.addEventListener('mouseleave', () => {
                btn.style.transform = '';
            });
        });
    }

    // ---------- 7. Card 3D tilt ----------
    function initTilt() {
        if (reduce) return;
        document.querySelectorAll('.project-card').forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const r = card.getBoundingClientRect();
                const x = (e.clientX - r.left) / r.width - 0.5;
                const y = (e.clientY - r.top) / r.height - 0.5;
                card.style.transform = `perspective(900px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg) translateY(-6px)`;
            });
            card.addEventListener('mouseleave', () => {
                card.style.transform = '';
            });
        });
    }

    // ---------- Init all ----------
    function start() {
        initScrollProgress();
        initNavbarScroll();
        initMagnetic();
        initTilt();
        initCursor();
        lucide.createIcons();
        console.log("Lucide icons initialized");

        // Delay reveal & title animations until after the preloader exits
        // The preloader takes ~1000ms to count + ~950ms exit transition = ~2000ms total
        // We listen for the preloader to become hidden, then trigger reveals
        function triggerRevealAfterPreloader() {
            const preloader = document.getElementById('preloader');
            if (!preloader) {
                // No preloader, run immediately
                initTitleAnim();
                initReveal();
                return;
            }

            // Wait until preloader has the 'is-exiting' class, then init reveals
            // so animations play on the visible page
            const checkExiting = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    if (mutation.target.classList.contains('is-exiting')) {
                        checkExiting.disconnect();
                        // Small extra delay to ensure preloader curtain has started opening
                        setTimeout(() => {
                            initTitleAnim();
                            initReveal();
                        }, 100);
                    }
                });
            });

            checkExiting.observe(preloader, { attributes: true, attributeFilter: ['class'] });
        }

        triggerRevealAfterPreloader();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', start);
    } else {
        start();
    }
})();

document.addEventListener('DOMContentLoaded', () => {
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
});

// Add this to the very end of your script.js
window.addEventListener('load', () => {
    // Re-trigger Lucide for the dynamic project icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    
    // Ensure the IntersectionObserver sees the new cards
    const cards = document.querySelectorAll('.project-card');
    cards.forEach(card => observer.observe(card));
});