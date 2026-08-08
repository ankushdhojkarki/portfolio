"""Generate responsive AVIF/WebP/fallback derivatives for site imagery.

The source files in static/images/source/ are camera/design originals and are
never served directly. Run this after replacing a source image:

    env/Scripts/python tools/optimize_images.py

Output lands in static/images/ and is referenced via <picture> + srcset.
"""

from __future__ import annotations

import shutil
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SOURCE_DIR = ROOT / "static" / "images" / "source"
OUT_DIR = ROOT / "static" / "images"

# (stem, aspect ratio or None to keep, widths, fallback format)
TARGETS = [
    ("ankush", 3 / 4, [480, 720, 1080, 1440], "JPEG"),
    ("blog-illustration", None, [420, 640, 900], "PNG"),
]

QUALITY = {"AVIF": 52, "WEBP": 72, "JPEG": 82}


def cover_resize(im: Image.Image, width: int, ratio: float | None) -> Image.Image:
    """Resize to `width`, cropping to `ratio` from the centre when given."""
    if ratio is None:
        height = round(width * im.height / im.width)
        return im.resize((width, height), Image.LANCZOS)

    height = round(width / ratio)
    src_ratio = im.width / im.height
    if src_ratio > ratio:  # too wide - trim the sides
        new_w = round(im.height * ratio)
        left = (im.width - new_w) // 2
        im = im.crop((left, 0, left + new_w, im.height))
    else:  # too tall - trim top/bottom, biased upward to keep faces in frame
        new_h = round(im.width / ratio)
        top = min((im.height - new_h) // 2, round(im.height * 0.12))
        im = im.crop((0, top, im.width, top + new_h))
    return im.resize((width, height), Image.LANCZOS)


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    SOURCE_DIR.mkdir(parents=True, exist_ok=True)

    for stem, ratio, widths, fallback in TARGETS:
        source = next(SOURCE_DIR.glob(f"{stem}.*"), None)
        if source is None:
            print(f"  ! no source found for {stem}, skipping")
            continue

        with Image.open(source) as im:
            im.load()
            has_alpha = im.mode in ("RGBA", "LA", "P")
            base = im.convert("RGBA" if has_alpha and fallback == "PNG" else "RGB")
            print(f"{source.name}  {im.width}x{im.height}  {source.stat().st_size / 1048576:.2f} MB")

            for width in widths:
                if width > base.width:
                    continue
                resized = cover_resize(base, width, ratio)

                for fmt in ("AVIF", "WEBP", fallback):
                    ext = {"AVIF": "avif", "WEBP": "webp", "JPEG": "jpg", "PNG": "png"}[fmt]
                    out = OUT_DIR / f"{stem}-{width}.{ext}"
                    frame = resized
                    if fmt in ("JPEG",) and frame.mode == "RGBA":
                        frame = frame.convert("RGB")
                    save_kwargs = {"quality": QUALITY.get(fmt, 80)}
                    if fmt == "JPEG":
                        save_kwargs.update(progressive=True, optimize=True, subsampling=1)
                    elif fmt == "PNG":
                        save_kwargs = {"optimize": True}
                    frame.save(out, fmt, **save_kwargs)
                    print(f"    {out.name:<28} {out.stat().st_size / 1024:7.1f} KB")


if __name__ == "__main__":
    main()
