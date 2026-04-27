#!/usr/bin/env python3
"""
One-time logo processor for the Work bento tile.

Reads source PNGs from Company Logos/, removes near-white background,
recolors visible pixels to --color-fg (#F5F1EB), trims to bounding box,
and resizes longest edge to 200px. Outputs to public/logos/.

Idempotent — safe to re-run from anywhere; resolves paths relative to
the repo root.

Usage:
    python3 scripts/process-logos.py
"""

from __future__ import annotations

from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SRC_DIR = ROOT / "Company Logos"
OUT_DIR = ROOT / "public" / "logos"

# Brand foreground (matches --color-fg in app/globals.css)
FG_RGB = (0xF5, 0xF1, 0xEB)

# Map source filename → output basename (filenames in Company Logos/ are
# inconsistent; we normalize on the way out).
SOURCES: dict[str, str] = {
    "J.P.-Morgan-Chase-Logo.png": "jpmorgan",
    "Gic-logo.png": "gic",
    "2025-sph-media-logo.png": "sph-media",
    "Temus logo.png": "temus",
}

# Pixels with min(R,G,B) > WHITE_HARD become fully transparent.
# Pixels with min(R,G,B) <= SOLID_BELOW stay fully opaque.
# Between → linear ramp, so antialiased edges fade smoothly into the dark
# tile background instead of looking jagged.
WHITE_HARD = 240
SOLID_BELOW = 200

# Per-logo override for white_hard if the default is too aggressive
# (e.g. thin strokes blowing out). Add entries here if you find issues
# during visual QA.
THRESHOLD_OVERRIDES: dict[str, int] = {}

LONGEST_EDGE = 200


def process(src: Path, dst: Path, white_hard: int = WHITE_HARD) -> tuple[int, int]:
    img = Image.open(src).convert("RGBA")
    w, h = img.size
    pixels = img.load()
    fg_r, fg_g, fg_b = FG_RGB

    for y in range(h):
        for x in range(w):
            r, g, b, a = pixels[x, y]
            if a == 0:
                continue
            m = min(r, g, b)
            if m > white_hard:
                pixels[x, y] = (0, 0, 0, 0)
            elif m >= SOLID_BELOW:
                # Smooth ramp between SOLID_BELOW and white_hard.
                ramp = (white_hard - m) / (white_hard - SOLID_BELOW)
                pixels[x, y] = (fg_r, fg_g, fg_b, int(a * ramp))
            else:
                pixels[x, y] = (fg_r, fg_g, fg_b, a)

    bbox = img.getbbox()
    if bbox:
        img = img.crop(bbox)

    cw, ch = img.size
    if cw >= ch:
        new_w = LONGEST_EDGE
        new_h = max(1, round(ch * LONGEST_EDGE / cw))
    else:
        new_h = LONGEST_EDGE
        new_w = max(1, round(cw * LONGEST_EDGE / ch))
    img = img.resize((new_w, new_h), Image.LANCZOS)

    dst.parent.mkdir(parents=True, exist_ok=True)
    img.save(dst, format="PNG", optimize=True)
    return img.size


def main() -> None:
    if not SRC_DIR.is_dir():
        raise SystemExit(f"Source folder not found: {SRC_DIR}")

    for src_name, out_name in SOURCES.items():
        src = SRC_DIR / src_name
        if not src.is_file():
            print(f"SKIP {src_name} (not found in {SRC_DIR.name}/)")
            continue
        dst = OUT_DIR / f"{out_name}.png"
        threshold = THRESHOLD_OVERRIDES.get(out_name, WHITE_HARD)
        size = process(src, dst, white_hard=threshold)
        rel = dst.relative_to(ROOT)
        note = f" [threshold={threshold}]" if threshold != WHITE_HARD else ""
        print(f"OK  {src_name:36s} -> {rel} ({size[0]}x{size[1]}){note}")


if __name__ == "__main__":
    main()
