/* ==========================================================================
   TOASTS
   Replaces alert(): non-blocking, styled, and announced via the aria-live
   region declared in base.html.
   ========================================================================== */

import { $ } from './utils.js';

const LIFETIME = 5200;

export function toast(message, variant = 'info') {
    const stack = $('#toastStack');
    if (!stack) return;

    const el = document.createElement('div');
    el.className = `toast toast--${variant}`;
    el.textContent = message;
    stack.appendChild(el);

    const remove = () => {
        el.classList.add('is-leaving');
        el.addEventListener('animationend', () => el.remove(), { once: true });
        // Fallback in case the animation never fires (reduced motion).
        setTimeout(() => el.remove(), 400);
    };

    const timer = setTimeout(remove, LIFETIME);
    el.addEventListener('click', () => {
        clearTimeout(timer);
        remove();
    });
}
