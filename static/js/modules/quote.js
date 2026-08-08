/* ==========================================================================
   QUOTE ROTATOR
   Same endpoint as before (GET /api/quote/), but it no longer runs forever
   in the background: the timer only ticks while the blog section is on
   screen and the tab is visible, which stops the old build's permanent
   request-every-8-seconds against the database.
   ========================================================================== */

import { $, prefersReducedMotion } from './utils.js';

const INTERVAL = 9000;

export function initQuote() {
    const block = $('#quoteBlock');
    const textEl = $('#quote-text');
    const authorEl = $('#quote-author');
    if (!block || !textEl || !authorEl) return;

    let timer = null;
    let visible = false;
    let inflight = false;

    async function rotate() {
        if (inflight) return;
        inflight = true;

        try {
            const res = await fetch('/api/quote/', { headers: { Accept: 'application/json' } });
            if (!res.ok) return;
            const data = await res.json();
            if (!data?.text) return;

            const swap = () => {
                textEl.textContent = `"${data.text}"`;
                authorEl.textContent = `— ${data.author}`;
            };

            if (prefersReducedMotion()) {
                swap();
                return;
            }

            block.classList.add('is-swapping');
            setTimeout(() => {
                swap();
                block.classList.remove('is-swapping');
            }, 420);
        } catch {
            /* A failed rotation just leaves the current quote in place. */
        } finally {
            inflight = false;
        }
    }

    const start = () => {
        if (timer) return;
        timer = setInterval(rotate, INTERVAL);
    };

    const stop = () => {
        clearInterval(timer);
        timer = null;
    };

    const io = new IntersectionObserver(
        ([entry]) => {
            visible = entry.isIntersecting;
            if (visible && !document.hidden) start();
            else stop();
        },
        { threshold: 0.25 }
    );
    io.observe(block);

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) stop();
        else if (visible) start();
    });
}
