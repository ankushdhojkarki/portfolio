/* ==========================================================================
   PRELOADER
   Tracks real asset progress instead of running a fixed timer, then hands
   straight into the hero animation so the two read as one continuous move.

   Guarantees: it always finishes. A hard timeout dismisses it even if an
   asset hangs, so a slow CDN can never leave a visitor staring at a bar.
   ========================================================================== */

import { $, prefersReducedMotion } from './utils.js';

const MAX_WAIT = 3500;   // hard ceiling before we give up and show the page
const MIN_SHOW = 450;    // avoid a jarring flash on instant loads

export function initPreloader(onReady) {
    const el = $('#preloader');
    const fill = $('#preloaderFill');
    const count = $('#preloaderCount');

    const finish = () => {
        document.body.classList.remove('is-locked');
        document.body.classList.add('is-ready');
        if (el) el.classList.add('is-done');
        onReady?.();
    };

    if (!el || prefersReducedMotion()) {
        el?.classList.add('is-done');
        finish();
        return;
    }

    document.body.classList.add('is-locked');

    const started = performance.now();

    // Only wait on images that participate in the first paint. Lazy images
    // (project shots, the 18 external skill icons) do not begin loading
    // until they scroll into view, so waiting on them would stall the
    // preloader until the timeout on every single visit.
    const images = Array.from(document.images).filter(
        (img) => img.loading !== 'lazy'
    );
    const total = images.length || 1;
    let loaded = 0;
    let settled = false;

    const render = (pct) => {
        if (fill) fill.style.width = pct + '%';
        if (count) count.textContent = String(Math.round(pct)).padStart(3, '0');
        el.setAttribute('aria-valuenow', String(Math.round(pct)));
    };

    const settle = () => {
        if (settled) return;
        settled = true;
        render(100);
        const elapsed = performance.now() - started;
        setTimeout(finish, Math.max(0, MIN_SHOW - elapsed) + 220);
    };

    const bump = () => {
        loaded += 1;
        render(Math.min(99, (loaded / total) * 100));
        if (loaded >= total) settle();
    };

    render(0);

    images.forEach((img) => {
        if (img.complete) {
            bump();
        } else {
            img.addEventListener('load', bump, { once: true });
            img.addEventListener('error', bump, { once: true });
        }
    });

    if (images.length === 0) settle();

    // Belt and braces: never hold the page hostage to a stalled request.
    setTimeout(settle, MAX_WAIT);
    window.addEventListener('load', settle, { once: true });
}
