/* ==========================================================================
   THEME
   The initial value is resolved by the inline script in base.html before
   first paint. This module only handles the toggle and keeps in sync with
   the OS preference while the user has not made an explicit choice.
   ========================================================================== */

import { $ } from './utils.js';

const KEY = 'theme';
const root = document.documentElement;

function apply(theme, { persist = true } = {}) {
    root.setAttribute('data-theme', theme);
    if (persist) {
        try { localStorage.setItem(KEY, theme); } catch { /* private mode */ }
    }
    const btn = $('#themeToggle');
    if (btn) {
        const next = theme === 'dark' ? 'light' : 'dark';
        btn.setAttribute('aria-label', `Switch to ${next} theme`);
    }
}

export function initTheme() {
    const btn = $('#themeToggle');
    const media = window.matchMedia('(prefers-color-scheme: light)');

    apply(root.getAttribute('data-theme') || 'dark', { persist: false });

    btn?.addEventListener('click', () => {
        const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        apply(next);
    });

    // Follow the OS only while the visitor has not chosen for themselves.
    media.addEventListener('change', (e) => {
        let stored = null;
        try { stored = localStorage.getItem(KEY); } catch { /* ignore */ }
        if (!stored) apply(e.matches ? 'light' : 'dark', { persist: false });
    });
}
