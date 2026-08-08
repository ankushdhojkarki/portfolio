/* ==========================================================================
   SCROLL DRIVER
   One passive scroll listener and one rAF loop for the whole site. Every
   scroll-linked effect subscribes here instead of adding its own listener,
   which is what kept the old build thrashing layout on every scroll event.
   ========================================================================== */

import { rafThrottle, debounce } from './utils.js';

const readers = new Set();   // called with a shared state object each frame
const resizers = new Set();  // called on resize / orientation change

const state = {
    y: 0,
    prevY: 0,
    dir: 1,             // 1 = down, -1 = up
    vh: window.innerHeight,
    vw: window.innerWidth,
    max: 0,
    progress: 0,        // 0..1 document scroll progress
};

function measure() {
    state.vh = window.innerHeight;
    state.vw = window.innerWidth;
    state.max = Math.max(1, document.documentElement.scrollHeight - state.vh);
    resizers.forEach((fn) => fn(state));
    tick();
}

function tick() {
    const y = window.scrollY || document.documentElement.scrollTop;
    state.dir = y > state.prevY ? 1 : y < state.prevY ? -1 : state.dir;
    state.prevY = state.y;
    state.y = y;
    state.progress = y / state.max;
    readers.forEach((fn) => fn(state));
}

const onScroll = rafThrottle(tick);

/** Subscribe to per-frame scroll state. Returns an unsubscribe function. */
export function onScrollFrame(fn) {
    readers.add(fn);
    return () => readers.delete(fn);
}

/** Subscribe to resize (debounced). Returns an unsubscribe function. */
export function onResize(fn) {
    resizers.add(fn);
    return () => resizers.delete(fn);
}

export function getScrollState() {
    return state;
}

/** Force a re-measure — call after layout-changing work such as text splitting. */
export function remeasure() {
    measure();
}

export function initScroll() {
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', debounce(measure, 120), { passive: true });
    window.addEventListener('orientationchange', debounce(measure, 200));

    // Late-loading images change document height; re-measure when they land.
    window.addEventListener('load', measure);

    measure();
}
