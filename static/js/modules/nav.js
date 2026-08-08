/* ==========================================================================
   NAVIGATION
   Active-section tracking, scroll progress, auto-tuck, and an accessible
   mobile sheet with focus trapping and inert background content.
   ========================================================================== */

import { $, $$ } from './utils.js';
import { onScrollFrame } from './scroll.js';

const FOCUSABLE = 'a[href], button:not([disabled]), input, textarea, select, [tabindex]:not([tabindex="-1"])';

function initActiveSection() {
    const links = $$('[data-nav]');
    if (!links.length) return;

    const byId = new Map(links.map((l) => [l.getAttribute('href').slice(1), l]));
    const sections = $$('section[id]').filter((s) => byId.has(s.id));
    if (!sections.length) return;

    let current = null;

    const setActive = (id) => {
        if (id === current) return;
        current = id;
        links.forEach((l) => {
            const active = l.getAttribute('href') === `#${id}`;
            l.classList.toggle('is-active', active);
            if (active) l.setAttribute('aria-current', 'true');
            else l.removeAttribute('aria-current');
        });
    };

    // Observe with a band across the upper third of the viewport, so the
    // active link changes when a section actually occupies the reading area.
    const observer = new IntersectionObserver(
        (entries) => {
            const visible = entries
                .filter((e) => e.isIntersecting)
                .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
            if (visible[0]) setActive(visible[0].target.id);
        },
        { rootMargin: '-20% 0px -60% 0px', threshold: [0, 0.25, 0.5, 1] }
    );

    sections.forEach((s) => observer.observe(s));
}

function initBarBehaviour() {
    const nav = $('#nav');
    const progress = $('#navProgress');
    if (!nav) return;

    onScrollFrame(({ y, dir, progress: p }) => {
        nav.classList.toggle('is-scrolled', y > 24);
        // Tuck away when scrolling down past the hero, restore on scroll up.
        nav.classList.toggle('is-tucked', dir === 1 && y > 420 && !nav.dataset.locked);
        if (progress) progress.style.setProperty('--progress', (p * 100).toFixed(2) + '%');
    });
}

function initMobileSheet() {
    const btn = $('#menuBtn');
    const panel = $('#navLinks');
    const scrim = $('#navScrim');
    const nav = $('#nav');
    if (!btn || !panel) return;

    let lastFocused = null;

    const isOpen = () => panel.classList.contains('is-open');

    const open = () => {
        lastFocused = document.activeElement;
        panel.classList.add('is-open');
        btn.classList.add('is-open');
        btn.setAttribute('aria-expanded', 'true');
        btn.setAttribute('aria-label', 'Close menu');
        document.body.classList.add('is-locked');
        if (nav) nav.dataset.locked = 'true';
        if (scrim) {
            scrim.hidden = false;
            requestAnimationFrame(() => scrim.classList.add('is-visible'));
        }
        $(FOCUSABLE, panel)?.focus();
    };

    const close = ({ restoreFocus = true } = {}) => {
        if (!isOpen()) return;
        panel.classList.remove('is-open');
        btn.classList.remove('is-open');
        btn.setAttribute('aria-expanded', 'false');
        btn.setAttribute('aria-label', 'Open menu');
        document.body.classList.remove('is-locked');
        if (nav) delete nav.dataset.locked;
        if (scrim) {
            scrim.classList.remove('is-visible');
            setTimeout(() => { scrim.hidden = true; }, 300);
        }
        if (restoreFocus) (lastFocused || btn).focus?.();
    };

    btn.addEventListener('click', () => (isOpen() ? close() : open()));
    scrim?.addEventListener('click', () => close());

    // Navigating closes the sheet, but focus should follow the target
    // section rather than snapping back to the hamburger.
    panel.addEventListener('click', (e) => {
        if (e.target.closest('[data-nav]')) close({ restoreFocus: false });
    });

    document.addEventListener('keydown', (e) => {
        if (!isOpen()) return;

        if (e.key === 'Escape') {
            e.preventDefault();
            close();
            return;
        }

        if (e.key !== 'Tab') return;

        // Focus trap
        const items = $$(FOCUSABLE, panel).filter((el) => el.offsetParent !== null);
        if (!items.length) return;
        const first = items[0];
        const last = items[items.length - 1];

        if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
        }
    });

    // Leaving the mobile breakpoint while open would strand the lock.
    window.matchMedia('(min-width: 941px)').addEventListener('change', (e) => {
        if (e.matches) close({ restoreFocus: false });
    });
}

export function initNav() {
    initActiveSection();
    initBarBehaviour();
    initMobileSheet();
}
