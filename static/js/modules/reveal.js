/* ==========================================================================
   REVEAL
   A single IntersectionObserver for every scroll-triggered entrance.
   Elements are unobserved once shown, so nothing stays subscribed.
   ========================================================================== */

import { $$ } from './utils.js';

const SELECTOR = [
    '[data-reveal]',
    '[data-reveal-stagger]',
    '[data-split]',
    '[data-split-words]',
    '[data-rail-item]',
    '[data-field]',
].join(',');

let observer;

function show(el) {
    el.classList.add('is-in');
    el.dispatchEvent(new CustomEvent('reveal', { bubbles: false }));
}

export function initReveal() {
    const targets = $$(SELECTOR);

    // No IntersectionObserver: show everything immediately rather than
    // leaving the page blank.
    if (!('IntersectionObserver' in window)) {
        targets.forEach(show);
        return;
    }

    observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                show(entry.target);
                observer.unobserve(entry.target);
            });
        },
        { threshold: 0.15, rootMargin: '0px 0px -8% 0px' }
    );

    targets.forEach((el) => {
        // Anything already on screen at load is revealed by the hero handoff
        // rather than waiting for a scroll that may never come.
        observer.observe(el);
    });
}

/** Reveal everything still hidden — used as a safety net. */
export function revealAll() {
    $$(SELECTOR).forEach((el) => {
        if (!el.classList.contains('is-in')) show(el);
    });
}
