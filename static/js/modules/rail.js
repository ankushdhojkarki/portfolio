/* ==========================================================================
   PROJECT RAIL
   Pins the stage and translates the track horizontally as the page scrolls.

   Falls back to a plain responsive grid when: the viewport is narrow, the
   visitor prefers reduced motion, or the track already fits on screen. The
   fallback is a CSS class, so the markup is identical in both modes.
   ========================================================================== */

import { $, clamp, prefersReducedMotion } from './utils.js';
import { onScrollFrame, onResize, remeasure } from './scroll.js';

const MIN_WIDTH = 900;   // below this the rail is a vertical grid

export function initRail() {
    const rail = $('#projectRail');
    const track = $('#projectTrack');
    if (!rail || !track) return;

    const fill = $('#railFill');
    const current = $('#railCurrent');

    let distance = 0;
    let active = false;
    let cardCount = track.children.length;

    function layout({ vw, vh }) {
        const disabled = vw < MIN_WIDTH || prefersReducedMotion();

        if (disabled) {
            active = false;
            rail.classList.add('is-static');
            rail.style.height = '';
            track.style.removeProperty('--rail');
            return;
        }

        rail.classList.remove('is-static');

        // How far the track must travel for its last card to reach the left edge.
        distance = Math.max(0, track.scrollWidth - vw);

        if (distance < 40) {
            // Everything already fits; pinning would just add dead scroll.
            active = false;
            rail.classList.add('is-static');
            rail.style.height = '';
            return;
        }

        active = true;
        cardCount = track.children.length;
        // Extra scroll length = the horizontal distance, so the mapping is 1:1
        // and the rail never feels faster or slower than the wheel.
        rail.style.height = `${vh + distance}px`;
    }

    function update({ vh }) {
        if (!active) return;

        // Measured from the viewport rather than offsetTop: the rail's
        // offsetParent is `section.projects` (position: relative), so
        // offsetTop is a section-relative number, not a page coordinate.
        const rect = rail.getBoundingClientRect();
        const span = Math.max(1, rail.offsetHeight - vh);
        const p = clamp(-rect.top / span, 0, 1);

        track.style.setProperty('--rail', (p * distance).toFixed(2));

        if (fill) fill.style.setProperty('--rail-pct', (p * 100).toFixed(1) + '%');
        if (current) {
            const idx = Math.min(cardCount, Math.floor(p * cardCount) + 1);
            current.textContent = String(idx).padStart(2, '0');
        }
    }

    onResize(layout);
    onScrollFrame(update);

    // Project images arrive from Cloudinary after first paint and change the
    // track width, so re-measure once they settle.
    window.addEventListener('load', () => remeasure(), { once: true });
}
