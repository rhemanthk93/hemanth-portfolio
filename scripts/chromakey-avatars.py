"""
Genspark exports "transparent PNG" assets but if downloaded as JPG, the checker
pattern gets baked in. This script HSV-chromakeys low-saturation light pixels
back to transparency and writes a real PNG with alpha.

Run: python3 scripts/chromakey-avatars.py public/avatars/hemanth-laptop.jpg
"""
import sys
from pathlib import Path
import numpy as np
from PIL import Image


def chromakey(jpg_path: Path, out_path: Path) -> None:
    img = Image.open(jpg_path).convert("RGB")
    arr = np.asarray(img).astype(np.float32) / 255.0

    r, g, b = arr[..., 0], arr[..., 1], arr[..., 2]
    cmax = np.max(arr, axis=-1)
    cmin = np.min(arr, axis=-1)
    delta = cmax - cmin

    saturation = np.where(cmax > 0, delta / np.where(cmax > 0, cmax, 1.0), 0.0)
    value = cmax

    # Checker squares: low-saturation, high-value pixels (white + light grey).
    # Skin has S>0.18, shirt blue has S>0.18, hair black has V<0.2.
    is_bg = (saturation < 0.08) & (value > 0.7)

    # Soft alpha edge: pixels right at the boundary fade rather than hard-cut,
    # which keeps anti-aliased outlines on the figure clean.
    edge_band = (saturation >= 0.08) & (saturation < 0.16) & (value > 0.7)
    alpha = np.where(is_bg, 0.0, 1.0)
    alpha = np.where(edge_band, (saturation - 0.08) / 0.08, alpha)

    rgba = np.concatenate(
        [arr, alpha[..., None]], axis=-1
    )
    rgba8 = (rgba * 255).clip(0, 255).astype(np.uint8)
    out = Image.fromarray(rgba8, mode="RGBA")
    out.save(out_path, format="PNG", optimize=True)
    print(f"wrote {out_path} ({out.size[0]}x{out.size[1]})")


def main() -> int:
    if len(sys.argv) < 2:
        print("usage: chromakey-avatars.py <input.jpg> [<output.png>]", file=sys.stderr)
        return 2
    src = Path(sys.argv[1])
    if len(sys.argv) >= 3:
        dst = Path(sys.argv[2])
    else:
        dst = src.with_suffix(".png")
    chromakey(src, dst)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
