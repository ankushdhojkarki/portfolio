/* ==========================================================================
   SPLIT TEXT
   Wraps text in mask/inner pairs so it can slide up into view.

   Splits by *line* or *word*, never by character: per-character splitting
   multiplies DOM nodes, costs layout, and makes screen readers announce
   text one letter at a time. Word-level keeps the accessible text intact.
   ========================================================================== */

import { $$ } from './utils.js';

function wrap(text, delayIndex) {
    const mask = document.createElement('span');
    mask.className = 'split-mask';

    const inner = document.createElement('span');
    inner.className = 'split';
    inner.style.setProperty('--d', delayIndex);
    inner.textContent = text;

    mask.appendChild(inner);
    return mask;
}

/** Treats the element's whole text as one line. */
function splitLine(el, delayIndex) {
    const text = el.textContent.trim();
    if (!text) return;
    el.textContent = '';
    el.appendChild(wrap(text, delayIndex));
    el.classList.add('is-split');
}

/** Splits into words, each independently masked. */
function splitWords(el) {
    const text = el.textContent.trim();
    if (!text) return;

    // Preserve the readable string for assistive tech; the visual spans are
    // decorative duplicates of text that is already in the accessibility tree.
    const label = text.replace(/\s+/g, ' ');
    el.setAttribute('aria-label', label);

    const frag = document.createDocumentFragment();
    label.split(' ').forEach((word, i) => {
        frag.appendChild(wrap(word, i));
        frag.appendChild(document.createTextNode(' '));
    });

    el.textContent = '';
    el.appendChild(frag);

    // The spans now duplicate the aria-label, so hide them from the tree.
    $$('.split-mask', el).forEach((m) => m.setAttribute('aria-hidden', 'true'));
    el.classList.add('is-split');
}

/**
 * Only splits elements whose content is a single text node. Anything with
 * nested markup is left alone rather than risking a destroyed structure.
 */
function isPlainText(el) {
    return el.childNodes.length === 1 && el.firstChild.nodeType === Node.TEXT_NODE;
}

export function initSplit() {
    $$('[data-split]').forEach((el, i) => {
        if (isPlainText(el)) splitLine(el, i);
    });

    $$('[data-split-words]').forEach((el) => {
        if (isPlainText(el)) splitWords(el);
    });
}
