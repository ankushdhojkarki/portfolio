/* ==========================================================================
   CONTACT FORM
   Same backend contract as before: POST /contact/ with a JSON body of
   {name, email, message} and the CSRF token from the cookie Django sets
   via @ensure_csrf_cookie on the home view. Only the UX around it changed.
   ========================================================================== */

import { $ } from './utils.js';
import { toast } from './toast.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getCookie(name) {
    const match = document.cookie.match(new RegExp('(^|;\\s*)' + name + '=([^;]*)'));
    return match ? decodeURIComponent(match[2]) : null;
}

function setError(input, message) {
    const group = input.closest('.field-group');
    const box = $(`#${input.id}-error`);
    group?.classList.toggle('has-error', Boolean(message));
    input.setAttribute('aria-invalid', message ? 'true' : 'false');
    if (box) {
        box.textContent = message || '';
        box.hidden = !message;
    }
    return !message;
}

function validate(fields) {
    const { name, email, message } = fields;
    let ok = true;

    ok = setError(name, name.value.trim() ? '' : 'Please enter your name.') && ok;
    ok = setError(
        email,
        !email.value.trim()
            ? 'Please enter your email.'
            : EMAIL_RE.test(email.value.trim())
                ? ''
                : 'That does not look like a valid email address.'
    ) && ok;
    ok = setError(message, message.value.trim() ? '' : 'Please write a message.') && ok;

    return ok;
}

export function initForm() {
    const form = $('#contactForm');
    if (!form) return;

    const btn = $('#submitBtn');
    const label = btn?.querySelector('.btn__label');
    const fields = {
        name: $('#name'),
        email: $('#email'),
        message: $('#message'),
    };

    // Clear an error as soon as the visitor starts fixing it.
    Object.values(fields).forEach((input) => {
        input.addEventListener('input', () => {
            if (input.closest('.field-group')?.classList.contains('has-error')) {
                setError(input, '');
            }
        });
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!validate(fields)) {
            const firstBad = form.querySelector('.has-error input, .has-error textarea');
            firstBad?.focus();
            return;
        }

        const payload = {
            name: fields.name.value.trim(),
            email: fields.email.value.trim(),
            message: fields.message.value.trim(),
        };

        btn.disabled = true;
        btn.classList.add('is-busy');

        try {
            const res = await fetch('/contact/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken') || '',
                },
                body: JSON.stringify(payload),
            });

            // The view returns JSON on both success and handled errors, but a
            // proxy or 500 page might not — never let that throw unhandled.
            let data = {};
            try { data = await res.json(); } catch { /* non-JSON response */ }

            if (res.ok && data.success) {
                form.reset();
                btn.classList.remove('is-busy');
                btn.classList.add('is-done');
                if (label) label.textContent = 'Message sent';
                toast('Thanks — your message is on its way.', 'success');

                setTimeout(() => {
                    btn.classList.remove('is-done');
                    btn.disabled = false;
                    if (label) label.textContent = 'Send message';
                }, 4000);
            } else {
                throw new Error(data.error || 'Something went wrong.');
            }
        } catch (err) {
            btn.classList.remove('is-busy');
            btn.disabled = false;
            const offline = typeof navigator !== 'undefined' && navigator.onLine === false;
            toast(
                offline
                    ? 'You appear to be offline. Please try again when reconnected.'
                    : err.message || 'Could not send your message. Please try again.',
                'error'
            );
        }
    });
}
