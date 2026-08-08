/* ==========================================================================
   SKILLS FIELD
   Chips lean toward the cursor and grow slightly as it approaches.

   Cost control: geometry is cached and only re-read on resize (never per
   frame), the loop runs only while the section is on screen and the pointer
   is fine, and it stops entirely on touch or reduced-motion.
   ========================================================================== */

import { $, $$, prefersReducedMotion, isFinePointer } from './utils.js';
import { onResize } from './scroll.js';

const RADIUS = 190;   // px of influence around the cursor
const PULL = 0.22;    // how far a chip travels toward the cursor
const GROW = 0.09;    // additional scale at zero distance

export function initField() {
    const field = $('#skillField');
    if (!field || prefersReducedMotion() || !isFinePointer()) return;

    const chips = $$('[data-field-item]', field);
    if (!chips.length) return;

    let boxes = [];
    let pointer = { x: -9999, y: -9999 };
    let running = false;
    let visible = false;
    let frame = 0;

    const measure = () => {
        boxes = chips.map((chip) => {
            const r = chip.getBoundingClientRect();
            return {
                el: chip,
                // Store page coordinates so scrolling does not invalidate them.
                cx: r.left + r.width / 2 + window.scrollX,
                cy: r.top + r.height / 2 + window.scrollY,
            };
        });
    };

    const reset = () => {
        chips.forEach((chip) => {
            chip.style.setProperty('--dx', '0px');
            chip.style.setProperty('--dy', '0px');
            chip.style.setProperty('--s', '1');
        });
    };

    const loop = () => {
        if (!running) return;

        boxes.forEach(({ el, cx, cy }) => {
            const dx = pointer.x - cx;
            const dy = pointer.y - cy;
            const dist = Math.hypot(dx, dy);

            if (dist > RADIUS) {
                el.style.setProperty('--dx', '0px');
                el.style.setProperty('--dy', '0px');
                el.style.setProperty('--s', '1');
                return;
            }

            const force = 1 - dist / RADIUS;          // 1 at the cursor, 0 at the edge
            const eased = force * force;              // tighter falloff
            el.style.setProperty('--dx', (dx * PULL * eased).toFixed(2) + 'px');
            el.style.setProperty('--dy', (dy * PULL * eased).toFixed(2) + 'px');
            el.style.setProperty('--s', (1 + GROW * eased).toFixed(3));
        });

        frame = requestAnimationFrame(loop);
    };

    const start = () => {
        if (running) return;
        running = true;
        measure();
        frame = requestAnimationFrame(loop);
    };

    const stop = () => {
        running = false;
        cancelAnimationFrame(frame);
        reset();
    };

    // Page coordinates, so the maths stays valid mid-scroll.
    const onPointerMove = (e) => {
        pointer.x = e.pageX;
        pointer.y = e.pageY;
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    onResize(() => { if (running) measure(); });

    // Only animate while the section is actually in view.
    const io = new IntersectionObserver(
        ([entry]) => {
            visible = entry.isIntersecting;
            if (visible && !document.hidden) start();
            else stop();
        },
        { threshold: 0.05 }
    );
    io.observe(field);

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) stop();
        else if (visible) start();
    });
}
