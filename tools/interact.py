"""Interaction checks against the local dev server.

The contact endpoint is intercepted, so submitting the form here never
sends mail and never writes a ContactMessage row.

Dev-only helper, excluded from deploys and kept out of requirements.txt:

    pip install playwright
    env/Scripts/python tools/interact.py [url]
"""

from __future__ import annotations

import sys

from playwright.sync_api import sync_playwright

URL = sys.argv[1] if len(sys.argv) > 1 else "http://127.0.0.1:8009/"

results = []


def check(name, condition, detail=""):
    results.append((name, bool(condition), detail))


def main():
    with sync_playwright() as pw:
        browser = pw.chromium.launch(channel="chrome", headless=True)

        # ---------- Desktop ----------
        ctx = browser.new_context(viewport={"width": 1440, "height": 900}, color_scheme="dark")
        page = ctx.new_page()
        errors = []
        page.on("pageerror", lambda e: errors.append(str(e)))
        page.goto(URL, wait_until="load")
        page.wait_for_function("document.body.classList.contains('is-ready')", timeout=15000)

        # Dark must win on first visit even when the OS asks for light.
        light_ctx = browser.new_context(viewport={"width": 1440, "height": 900}, color_scheme="light")
        lp = light_ctx.new_page()
        lp.goto(URL, wait_until="load")
        lp.wait_for_function("document.body.classList.contains('is-ready')", timeout=15000)
        check("dark default despite OS light", lp.get_attribute("html", "data-theme") == "dark",
              f"data-theme={lp.get_attribute('html', 'data-theme')}")
        light_ctx.close()

        # Theme toggle
        before = page.get_attribute("html", "data-theme")
        page.click("#themeToggle")
        page.wait_for_timeout(250)
        after = page.get_attribute("html", "data-theme")
        stored = page.evaluate("localStorage.getItem('theme')")
        check("theme toggles", before != after, f"{before} -> {after}")
        check("theme persists", stored == after, f"localStorage={stored}")
        page.click("#themeToggle")

        # Active nav link updates on scroll
        page.evaluate("document.getElementById('skills').scrollIntoView()")
        page.wait_for_timeout(900)
        active = page.evaluate(
            "document.querySelector('.nav__link.is-active')?.getAttribute('href')")
        check("nav tracks section", active == "#skills", f"active={active}")

        # Rail pins and translates
        page.evaluate("""() => {
            const r = document.getElementById('projectRail');
            window.scrollTo(0, r.offsetTop + Math.floor((r.offsetHeight - window.innerHeight) * 0.6));
        }""")
        page.wait_for_timeout(700)
        rail_val = page.evaluate(
            "getComputedStyle(document.getElementById('projectTrack')).getPropertyValue('--rail').trim()")
        is_static = page.evaluate(
            "document.getElementById('projectRail').classList.contains('is-static')")
        overflows = page.evaluate(
            "document.getElementById('projectTrack').scrollWidth > window.innerWidth + 40")
        if overflows:
            check("rail translates", (not is_static) and float(rail_val or 0) > 50,
                  f"--rail={rail_val}")
        else:
            # With few enough projects to fit on one screen, falling back to a
            # grid is the intended behaviour, not a failure.
            check("rail falls back to grid (track fits on screen)", is_static,
                  f"static={is_static}")

        # Form: empty submit shows inline errors, no native dialog
        dialogs = []
        page.on("dialog", lambda d: (dialogs.append(d.message), d.dismiss()))
        page.evaluate("document.getElementById('contact').scrollIntoView()")
        page.wait_for_timeout(400)
        page.click("#submitBtn")
        page.wait_for_timeout(400)
        err_visible = page.is_visible("#name-error")
        check("empty submit shows inline error", err_visible)
        check("no alert() used", len(dialogs) == 0, f"dialogs={dialogs}")

        # Form: invalid email
        page.fill("#name", "Test Person")
        page.fill("#email", "not-an-email")
        page.fill("#message", "Hello there")
        page.click("#submitBtn")
        page.wait_for_timeout(300)
        check("invalid email caught", page.is_visible("#email-error"),
              page.inner_text("#email-error") if page.is_visible("#email-error") else "")

        # Form: successful submit (intercepted - no mail, no DB write)
        page.route("**/contact/", lambda route: route.fulfill(
            status=200, content_type="application/json", body='{"success": true}'))
        page.fill("#email", "test@example.com")
        page.click("#submitBtn")
        page.wait_for_timeout(800)
        toast_shown = page.is_visible(".toast--success")
        cleared = page.input_value("#name") == ""
        check("success toast shown", toast_shown)
        check("form resets on success", cleared)

        check("no uncaught page errors", not errors, "; ".join(errors))
        ctx.close()

        # ---------- Mobile menu + focus trap ----------
        ctx2 = browser.new_context(viewport={"width": 390, "height": 844}, color_scheme="dark")
        p2 = ctx2.new_page()
        p2.goto(URL, wait_until="load")
        p2.wait_for_function("document.body.classList.contains('is-ready')", timeout=15000)

        # No horizontal overflow, and the closed sheet must not be tabbable.
        check("no horizontal scroll (mobile)",
              not p2.evaluate("document.documentElement.scrollWidth > document.documentElement.clientWidth"))
        check("closed menu not focusable",
              p2.evaluate("""() => {
                  const panel = document.getElementById('navLinks');
                  return [...panel.querySelectorAll('a')].every(a => a.offsetParent === null
                      || getComputedStyle(panel).visibility === 'hidden');
              }"""))

        p2.click("#menuBtn")
        p2.wait_for_timeout(500)
        expanded = p2.get_attribute("#menuBtn", "aria-expanded")
        locked = p2.evaluate("document.body.classList.contains('is-locked')")
        focus_in = p2.evaluate("document.getElementById('navLinks').contains(document.activeElement)")
        check("menu opens", expanded == "true", f"aria-expanded={expanded}")
        check("body scroll locked", locked)
        check("focus moves into sheet", focus_in)

        # The sheet is position:fixed inside <header>. Any backdrop-filter or
        # transform on the header makes it the containing block, which
        # collapses the panel to header height and hides most of the links.
        panel_box = p2.evaluate("""() => {
            const b = document.getElementById('navLinks').getBoundingClientRect();
            return {h: Math.round(b.height), vh: window.innerHeight};
        }""")
        check("sheet fills viewport", panel_box["h"] >= panel_box["vh"] - 2,
              f"{panel_box['h']}px of {panel_box['vh']}px")

        all_visible = p2.evaluate("""() => {
            const items = [...document.querySelectorAll('#navLinks li')];
            return items.length > 0 && items.every(li => {
                const r = li.getBoundingClientRect();
                return r.top >= 0 && r.bottom <= window.innerHeight;
            });
        }""")
        check("all menu items on screen", all_visible)

        # The panel shares a z-index with the bar, so it can paint over the
        # close button and strand the visitor inside the menu.
        check("close button is tappable", p2.evaluate("""() => {
            const btn = document.getElementById('menuBtn');
            const b = btn.getBoundingClientRect();
            return btn.contains(document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2));
        }"""))

        # Tab past the end should wrap back inside the sheet
        for _ in range(10):
            p2.keyboard.press("Tab")
        still_in = p2.evaluate("document.getElementById('navLinks').contains(document.activeElement)")
        check("focus trapped in sheet", still_in)

        p2.keyboard.press("Escape")
        p2.wait_for_timeout(400)
        check("Escape closes menu", p2.get_attribute("#menuBtn", "aria-expanded") == "false")
        check("scroll lock released", not p2.evaluate("document.body.classList.contains('is-locked')"))
        ctx2.close()

        # ---------- Reduced motion ----------
        ctx3 = browser.new_context(viewport={"width": 1440, "height": 900},
                                   color_scheme="dark", reduced_motion="reduce")
        p3 = ctx3.new_page()
        p3.goto(URL, wait_until="load")
        p3.wait_for_timeout(1500)
        ready = p3.evaluate("document.body.classList.contains('is-ready')")
        hidden = p3.evaluate("""() => [...document.querySelectorAll('[data-reveal]')]
            .filter(el => getComputedStyle(el).opacity === '0').length""")
        rail_static = p3.evaluate(
            "document.getElementById('projectRail').classList.contains('is-static')")
        check("reduced motion: page ready", ready)
        check("reduced motion: nothing left hidden", hidden == 0, f"{hidden} hidden")
        check("reduced motion: rail is a grid", rail_static)
        ctx3.close()

        browser.close()

    width = max(len(n) for n, _, _ in results)
    passed = 0
    print()
    for name, ok, detail in results:
        print(f"  {'PASS' if ok else 'FAIL'}  {name.ljust(width)}  {detail}")
        passed += ok
    print(f"\n  {passed}/{len(results)} checks passed")
    return 0 if passed == len(results) else 1


if __name__ == "__main__":
    sys.exit(main())
