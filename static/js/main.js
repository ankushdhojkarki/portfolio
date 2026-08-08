/* ==========================================================================
   ENTRY POINT
   Boots every module in dependency order. Each init is defensive — a
   missing element or a thrown module must never take the page down with
   it, which is what the old build's unguarded lucide.createIcons() did.
   ========================================================================== */

import { initScroll, remeasure } from './modules/scroll.js';
import { initTheme } from './modules/theme.js';
import { initNav } from './modules/nav.js';
import { initSplit } from './modules/split.js';
import { initReveal, revealAll } from './modules/reveal.js';
import { initPreloader } from './modules/preloader.js';
import { initRail } from './modules/rail.js';
import { initField } from './modules/field.js';
import { initForm } from './modules/form.js';
import { initQuote } from './modules/quote.js';
import { initGlow, initPortrait, initCounters, initClock, initYear } from './modules/ambient.js';

/** Runs `fn`, logging but never propagating a failure. */
function safe(name, fn) {
    try {
        fn();
    } catch (err) {
        console.error(`[init] ${name} failed:`, err);
    }
}

function boot() {
    // Text must be split before the reveal observer measures anything.
    safe('split', initSplit);

    safe('scroll', initScroll);
    safe('theme', initTheme);
    safe('nav', initNav);
    safe('reveal', initReveal);
    safe('rail', initRail);
    safe('field', initField);
    safe('form', initForm);
    safe('quote', initQuote);
    safe('glow', initGlow);
    safe('portrait', initPortrait);
    safe('counters', initCounters);
    safe('clock', initClock);
    safe('year', initYear);

    // Splitting and reveals change layout; re-measure once settled.
    requestAnimationFrame(() => safe('remeasure', remeasure));

    safe('preloader', () =>
        initPreloader(() => {
            // Hand the hero its entrance the moment the curtain lifts.
            document.querySelectorAll('.hero [data-reveal], .hero [data-split], .hero [data-reveal-stagger]')
                .forEach((el) => el.classList.add('is-in'));
            remeasure();
        })
    );

    // Last-resort safety net: if anything above failed badly enough that
    // content is still hidden a few seconds in, show all of it.
    setTimeout(() => {
        if (!document.body.classList.contains('is-ready')) {
            document.body.classList.add('is-ready');
            document.body.classList.remove('is-locked');
            document.getElementById('preloader')?.classList.add('is-done');
            revealAll();
        }
    }, 6000);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
    boot();
}
