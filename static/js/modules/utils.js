/* Small shared helpers. No dependencies. */

export const clamp = (v, min, max) => Math.min(Math.max(v, min), max);

export const lerp = (a, b, t) => a + (b - a) * t;

/** Maps `v` from [inMin,inMax] to [0,1], clamped. */
export const progress = (v, inMin, inMax) =>
    inMax === inMin ? 0 : clamp((v - inMin) / (inMax - inMin), 0, 1);

export const prefersReducedMotion = () =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const isFinePointer = () =>
    window.matchMedia('(hover: hover) and (pointer: fine)').matches;

export const $  = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

/** Runs `fn` at most once per animation frame. */
export function rafThrottle(fn) {
    let queued = false;
    let lastArgs;
    return (...args) => {
        lastArgs = args;
        if (queued) return;
        queued = true;
        requestAnimationFrame(() => {
            queued = false;
            fn(...lastArgs);
        });
    };
}

/** Fires `fn` after `wait` ms of quiet. */
export function debounce(fn, wait = 150) {
    let t;
    return (...args) => {
        clearTimeout(t);
        t = setTimeout(() => fn(...args), wait);
    };
}
