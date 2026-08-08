"""Generate the Open Graph card and apple-touch-icon.

    env/Scripts/python tools/make_social_assets.py

Both outputs are committed static files; regenerate only when the wording,
palette, or portrait changes.
"""

from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
IMAGES = ROOT / "static" / "images"
FONTS = ROOT / "static" / "fonts"

BG = (11, 11, 12)
INK = (237, 235, 232)
DIM = (154, 150, 145)
ACCENT = (216, 147, 74)
ON_ACCENT = (26, 17, 5)


def load_font(name: str, size: int):
    """Prefer the site's own webfont; fall back to a system face.

    Pillow's FreeType build cannot always read .woff2, so this degrades
    rather than failing the whole generation.
    """
    candidates = [
        FONTS / name,
        Path("C:/Windows/Fonts/segoeui.ttf"),
        Path("C:/Windows/Fonts/consola.ttf"),
    ]
    for path in candidates:
        try:
            if path.exists():
                return ImageFont.truetype(str(path), size)
        except OSError:
            continue
    return ImageFont.load_default(size)


def make_og() -> None:
    W, H = 1200, 630
    img = Image.new("RGB", (W, H), BG)
    d = ImageDraw.Draw(img)

    # Engineered grid, matching the site backdrop
    for x in range(0, W, 60):
        d.line([(x, 0), (x, H)], fill=(20, 20, 22), width=1)
    for y in range(0, H, 60):
        d.line([(0, y), (W, y)], fill=(20, 20, 22), width=1)

    # Portrait panel on the right
    portrait_src = None
    for candidate in (IMAGES / "ankush-720.jpg", IMAGES / "ankush-480.jpg"):
        if candidate.exists():
            portrait_src = candidate
            break

    panel_w, panel_h = 380, 470
    px, py = W - panel_w - 70, (H - panel_h) // 2
    if portrait_src and portrait_src.exists():
        with Image.open(portrait_src) as p:
            p = p.convert("RGB")
            scale = max(panel_w / p.width, panel_h / p.height)
            p = p.resize((round(p.width * scale), round(p.height * scale)), Image.LANCZOS)
            left = (p.width - panel_w) // 2
            top = max(0, min((p.height - panel_h) // 2, round(p.height * 0.06)))
            p = p.crop((left, top, left + panel_w, top + panel_h))

            mask = Image.new("L", (panel_w, panel_h), 0)
            ImageDraw.Draw(mask).rounded_rectangle([0, 0, panel_w, panel_h], radius=24, fill=255)
            img.paste(p, (px, py), mask)

    f_label = load_font("jetbrains-mono-latin.woff2", 20)
    f_title = load_font("instrument-sans-latin.woff2", 76)
    f_sub = load_font("instrument-sans-latin.woff2", 30)

    x = 74
    d.rectangle([x, 132, x + 54, 137], fill=ACCENT)
    d.text((x, 168), "ANKUSH DHOJ KARKI", font=f_label, fill=ACCENT)
    d.text((x, 214), "Django", font=f_title, fill=INK)
    d.text((x, 300), "Developer", font=f_title, fill=INK)
    d.text((x, 410), "Scalable web systems &", font=f_sub, fill=DIM)
    d.text((x, 450), "efficient API architectures", font=f_sub, fill=DIM)
    d.text((x, 528), "ankushdhojkarki-portfolio.vercel.app", font=f_label, fill=(106, 102, 97))

    out = IMAGES / "og-image.png"
    img.save(out, "PNG", optimize=True)
    print(f"  {out.name:<26} {out.stat().st_size / 1024:7.1f} KB")


def make_touch_icon() -> None:
    S = 180
    img = Image.new("RGB", (S, S), ACCENT)
    d = ImageDraw.Draw(img)
    f = load_font("instrument-sans-latin.woff2", 104)
    text = "A"
    box = d.textbbox((0, 0), text, font=f)
    d.text(
        ((S - (box[2] - box[0])) / 2 - box[0], (S - (box[3] - box[1])) / 2 - box[1]),
        text, font=f, fill=ON_ACCENT,
    )
    out = IMAGES / "apple-touch-icon.png"
    img.save(out, "PNG", optimize=True)
    print(f"  {out.name:<26} {out.stat().st_size / 1024:7.1f} KB")


if __name__ == "__main__":
    make_og()
    make_touch_icon()
