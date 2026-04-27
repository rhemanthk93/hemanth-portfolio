"""
The HSV chromakey in chromakey-avatars.py keyed out the eye sclera (whites)
because they read as low-saturation high-value pixels. This script surgically
restores alpha in a heuristic eye-region bounding box for any pixel whose
original RGB clearly belonged to the eyes (sclera whites + iris/outline AA
edges that lost alpha to the soft-edge band).
"""
from pathlib import Path
import numpy as np
from PIL import Image

PNG = Path(
    "/Users/hemanth/Library/CloudStorage/OneDrive-Personal/Claude Code Projects/Personal Portfolio/public/avatars/hemanth-laptop.png"
)


def fix(png: Path) -> None:
    img = Image.open(png).convert("RGBA")
    arr = np.array(img)

    # Eye sclera was profiled at y=510-545, x=770-1035 (left eye splits at the
    # iris around x=790-820, right eye at x=985-1010). Pad generously to catch
    # AA bleed at the lid line.
    y0, y1, x0, x1 = 495, 560, 750, 1055

    box = arr[y0:y1, x0:x1]
    rgb = box[..., :3].astype(np.int32)
    a = box[..., 3]

    # Sclera + AA edges: anything that's translucent (a < 255) AND the
    # underlying RGB is mid-to-light tone (max channel > 170) — i.e. originally
    # white sclera or a sclera/iris boundary pixel that bled.
    light = rgb.max(axis=-1) > 170
    translucent = a < 255
    sclera_mask = light & translucent

    # For these pixels, restore full opacity. Keep RGB as-is — the chromakey
    # only zeroed alpha, not the underlying color, so sclera pixels are still
    # white in the array.
    a_new = np.where(sclera_mask, 255, a)

    # Also catch dark iris edge AA: pixels in the box where RGB is dark brown /
    # black tones with reduced alpha. Threshold per the user's spec.
    dark = (rgb.max(axis=-1) <= 170) & (rgb[..., 0] < 100) & (rgb[..., 1] < 80)
    a_new = np.where(dark & translucent, 255, a_new)

    box[..., 3] = a_new
    arr[y0:y1, x0:x1] = box

    fixed_count = int(sclera_mask.sum() + (dark & translucent).sum())
    print(
        f"restored {fixed_count} pixels in eye region "
        f"({y0}:{y1}, {x0}:{x1})"
    )

    out = Image.fromarray(arr, mode="RGBA")
    out.save(png, format="PNG", optimize=True)
    print(f"wrote {png}")


if __name__ == "__main__":
    fix(PNG)
