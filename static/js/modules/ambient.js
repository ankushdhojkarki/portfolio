/* ==========================================================================
   AMBIENT DETAIL
   Pointer-following glow, hero portrait scroll response, count-up stats,
   local clock, and the footer year. Each piece degrades to nothing if its
   element is absent.
   ========================================================================== */

import { $, $$, clamp, lerp, progress, prefersReducedMotion, isFinePointer } from './utils.js';
import { onScrollFrame } from './scroll.js';

/* ---------- Glow follows the pointer, eased ---------- */
export function initGlow() {
    const glow = $('.backdrop__glow');
    if (!glow || prefersReducedMotion() || !isFinePointer()) return;

    let tx = window.innerWidth / 2;
    let ty = window.innerHeight * 0.3;
    let x = tx;
    let y = ty;
    let raf = 0;

    const loop = () => {
        x = lerp(x, tx, 0.06);
        y = lerp(y, ty, 0.06);
        glow.style.setProperty('--gx', x.toFixed(1) + 'px');
        glow.style.setProperty('--gy', y.toFixed(1) + 'px');
        raf = requestAnimationFrame(loop);
    };

    window.addEventListener('pointermove', (e) => {
        tx = e.clientX;
        ty = e.clientY;
    }, { passive: true });

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) cancelAnimationFrame(raf);
        else raf = requestAnimationFrame(loop);
    });

    raf = requestAnimationFrame(loop);
}

/* ---------- Hero portrait responds to scroll (CSS does the transform) ---------- */
export function initPortrait() {
    const hero = $('.hero');
    const portrait = $('[data-portrait]');
    if (!hero || !portrait || prefersReducedMotion()) return;

    onScrollFrame(({ y, vh }) => {
        // Only compute while the hero is anywhere near the viewport.
        if (y > hero.offsetHeight + vh) return;
        const p = progress(y, 0, hero.offsetHeight || vh);
        portrait.style.setProperty('--pr', p.toFixed(4));
    });
}

/* ---------- Count-up stats ---------- */
export function initCounters() {
    const nodes = $$('[data-count-to]');
    if (!nodes.length) return;

    const run = (el) => {
        const target = Number(el.dataset.countTo) || 0;
        const suffix = el.dataset.countSuffix || '';

        if (prefersReducedMotion() || target === 0) {
            el.textContent = `${target}${suffix}`;
            return;
        }

        const duration = 1100;
        const start = performance.now();

        const step = (now) => {
            const t = clamp((now - start) / duration, 0, 1);
            const eased = 1 - Math.pow(1 - t, 3);
            el.textContent = `${Math.round(target * eased)}${suffix}`;
            if (t < 1) requestAnimationFrame(step);
        };

        requestAnimationFrame(step);
    };

    const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            run(entry.target);
            io.unobserve(entry.target);
        });
    }, { threshold: 0.5 });

    nodes.forEach((n) => io.observe(n));
}

/* ---------- Kathmandu clock ---------- */
export function initClock() {
    const el = $('#localTime');
    if (!el) return;

    const tick = () => {
        try {
            el.textContent = new Intl.DateTimeFormat('en-GB', {
                hour: '2-digit',
                minute: '2-digit',
                timeZone: 'Asia/Kathmandu',
            }).format(new Date()) + ' NPT';
        } catch {
            el.textContent = '';
        }
    };

    tick();
    setInterval(tick, 30000);
}

/* ---------- Footer year ---------- */
export function initYear() {
    const el = $('#year');
    if (el) el.textContent = String(new Date().getFullYear());
}
