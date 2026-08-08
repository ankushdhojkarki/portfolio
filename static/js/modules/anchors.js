/* ==========================================================================
   ANCHOR SCROLLING
   A plain `#id` jump lands on the section's top *edge*, which sits above
   its vertical padding — so the content itself ends up pushed low with a
   band of empty space above it.

   This centres the section's content box (padding excluded) in the space
   below the fixed nav. Sections taller than that space cannot be centred,
   so they align to the top with a small breathing gap instead.
   ========================================================================== */

import { $, clamp, prefersReducedMotion } from './utils.js';

function navHeight() {
    const nav = $('#nav');
    return nav ? nav.offsetHeight : 0;
}

/** Absolute scroll position that best presents `section`. */
export function targetFor(section) {
    if (!section) return 0;

    // The hero already starts at the top of the document.
    if (section.id === 'home') return 0;

    const rect = section.getBoundingClientRect();
    const cs = getComputedStyle(section);
    const padTop = parseFloat(cs.paddingTop) || 0;
    const padBottom = parseFloat(cs.paddingBottom) || 0;

    const contentTop = rect.top + window.scrollY + padTop;
    const contentHeight = rect.height - padTop - padBottom;

    const navH = navHeight();
    const available = window.innerHeight - navH;

    // When it fits, split the leftover space evenly above and below. When it
    // does not, park the top flush under the nav: any offset there simply
    // moves more of the content off the bottom of the screen.
    const slack = Math.max(0, available - contentHeight);
    const y = contentTop - navH - slack / 2;

    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    return clamp(Math.round(y), 0, Math.max(0, maxScroll));
}

let holdTimer;

/**
 * Keeps the nav bar on screen for the duration of a jump. Without this the
 * downward scroll triggers the auto-tuck and the bar slides away mid-click,
 * leaving the visitor with no navigation where they landed.
 */
function holdNav() {
    const nav = $('#nav');
    if (!nav) return;

    nav.dataset.hold = '1';
    nav.classList.remove('is-tucked');
    clearTimeout(holdTimer);

    const release = () => {
        clearTimeout(holdTimer);
        delete nav.dataset.hold;
    };

    // `scrollend` fires when the smooth scroll settles; the timeout covers
    // engines without it and jumps that finish instantly.
    if ('onscrollend' in window) {
        window.addEventListener('scrollend', release, { once: true });
    }
    holdTimer = setTimeout(release, 1200);
}

function scrollToSection(section, { smooth = true } = {}) {
    holdNav();
    window.scrollTo({
        top: targetFor(section),
        behavior: smooth && !prefersReducedMotion() ? 'smooth' : 'auto',
    });
}

/** Moves focus to the section without the browser scrolling it again. */
function focusSection(section) {
    if (!section.hasAttribute('tabindex')) section.setAttribute('tabindex', '-1');
    section.focus({ preventScroll: true });
}

export function initAnchors() {
    document.addEventListener('click', (e) => {
        const link = e.target.closest('a[href^="#"]');
        if (!link) return;

        const href = link.getAttribute('href');
        // "#" alone is a placeholder (the blog CTA), not a destination.
        if (!href || href === '#') return;
        if (link.target === '_blank' || e.metaKey || e.ctrlKey || e.shiftKey) return;

        const section = document.getElementById(href.slice(1));
        if (!section) return;

        e.preventDefault();

        // The mobile sheet unlocks body scroll on the same click; wait a
        // frame so the document is scrollable before we move it.
        requestAnimationFrame(() => {
            scrollToSection(section);
            focusSection(section);
            if (window.location.hash !== href) {
                history.pushState(null, '', href);
            }
        });
    });

    // Back/forward through hash history.
    window.addEventListener('popstate', () => {
        const id = window.location.hash.slice(1);
        if (!id) return;
        const section = document.getElementById(id);
        if (section) scrollToSection(section);
    });

    // A URL opened directly at #contact should land in the same place the
    // in-page links would put it, not on the raw anchor offset.
    const initial = window.location.hash.slice(1);
    if (initial) {
        const section = document.getElementById(initial);
        if (section) {
            requestAnimationFrame(() => scrollToSection(section, { smooth: false }));
        }
    }
}

/** Re-applies positioning after layout shifts (images, resize). */
export function repositionToHash() {
    const id = window.location.hash.slice(1);
    if (!id) return;
    const section = document.getElementById(id);
    if (section) scrollToSection(section, { smooth: false });
}
