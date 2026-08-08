/* ==========================================================================
   THEME
   Dark is the site default on every device. The OS `prefers-color-scheme`
   setting is deliberately not consulted — light mode is opt-in through the
   nav toggle, and that choice is what persists.

   The initial value is applied by the inline script in base.html before
   first paint, so there is no flash. This module owns the toggle only.
   ========================================================================== */

import { $ } from './utils.js';

const KEY = 'theme';
const DEFAULT = 'dark';
const BAR_COLOR = { dark: '#0b0b0c', light: '#faf9f7' };

const root = document.documentElement;

function readStored() {
    try {
        return localStorage.getItem(KEY);
    } catch {
        return null; // private mode
    }
}

function apply(theme, { persist = true } = {}) {
    root.setAttribute('data-theme', theme);

    if (persist) {
        try {
            // Only the non-default needs storing; clearing on dark means a
            // visitor who toggles back gets the default again on any device.
            if (theme === DEFAULT) localStorage.removeItem(KEY);
            else localStorage.setItem(KEY, theme);
        } catch { /* private mode - the choice just will not survive reload */ }
    }

    const btn = $('#themeToggle');
    if (btn) {
        const next = theme === 'dark' ? 'light' : 'dark';
        btn.setAttribute('aria-label', `Switch to ${next} theme`);
    }

    // Keeps the mobile browser chrome matching the page.
    const meta = $('#themeColor');
    if (meta) meta.setAttribute('content', BAR_COLOR[theme] || BAR_COLOR.dark);
}

export function initTheme() {
    const current = readStored() === 'light' ? 'light' : DEFAULT;
    apply(current, { persist: false });

    $('#themeToggle')?.addEventListener('click', () => {
        const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        apply(next);
    });
}
