"""Drive the local dev server in Chrome and capture each section.

Dev-only helper, excluded from deploys by .vercelignore and deliberately
kept out of requirements.txt. Needs Playwright and a local Chrome:

    pip install playwright
    env/Scripts/python tools/shoot.py [outdir] [url]
"""

from __future__ import annotations

import sys
from pathlib import Path

from playwright.sync_api import sync_playwright

OUT = Path(sys.argv[1] if len(sys.argv) > 1 else "D:/tmp_shots")
URL = sys.argv[2] if len(sys.argv) > 2 else "http://127.0.0.1:8009/"

SECTIONS = ["home", "about", "projects", "skills", "blog", "contact"]

VIEWPORTS = {
    "desktop": {"width": 1440, "height": 900},
    "mobile": {"width": 390, "height": 844},
}


def run(pw, label, viewport, scheme, sections):
    browser = pw.chromium.launch(channel="chrome", headless=True)
    ctx = browser.new_context(
        viewport=viewport,
        color_scheme=scheme,
        device_scale_factor=1,
    )
    page = ctx.new_page()

    problems = []
    page.on("console", lambda m: problems.append(f"console.{m.type}: {m.text}")
            if m.type in ("error", "warning") else None)
    page.on("pageerror", lambda e: problems.append(f"pageerror: {e}"))
    page.on("requestfailed", lambda r: problems.append(
        f"requestfailed: {r.url.split('/')[-1]} {r.failure}"))

    page.goto(URL, wait_until="load", timeout=45000)

    # Wait for the preloader to hand off rather than guessing at a delay.
    try:
        page.wait_for_function("document.body.classList.contains('is-ready')", timeout=15000)
    except Exception:
        problems.append("TIMEOUT: body.is-ready never set (preloader stuck)")

    page.wait_for_timeout(900)

    for name in sections:
        page.evaluate(
            """(id) => {
                const el = document.getElementById(id);
                if (el) window.scrollTo({ top: el.offsetTop - 8, behavior: 'instant' });
            }""",
            name,
        )
        page.wait_for_timeout(1100)
        page.screenshot(path=str(OUT / f"{label}-{name}.png"))

    ctx.close()
    browser.close()
    return problems


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    all_problems = {}

    with sync_playwright() as pw:
        all_problems["desktop-dark"] = run(pw, "dt-dark", VIEWPORTS["desktop"], "dark", SECTIONS)
        all_problems["desktop-light"] = run(pw, "dt-light", VIEWPORTS["desktop"], "light", SECTIONS)
        all_problems["mobile-dark"] = run(pw, "mb-dark", VIEWPORTS["mobile"], "dark", SECTIONS)

    print("\n=== console / network problems ===")
    for label, items in all_problems.items():
        if items:
            print(f"\n[{label}]")
            for line in dict.fromkeys(items):
                print("  " + line)
        else:
            print(f"[{label}] clean")


if __name__ == "__main__":
    main()
