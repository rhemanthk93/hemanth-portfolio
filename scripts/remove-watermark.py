"""
Zero the alpha channel on Genspark's watermark badge in the bottom-right
corner of the hero avatar PNG. Run once after a fresh chromakey to fully
de-watermark the source so OG cards / future renders don't need a CSS overlay.
"""
from pathlib import Path
import numpy as np
from PIL import Image

PNG = Path(
    "/Users/hemanth/Library/CloudStorage/OneDrive-Personal/Claude Code Projects/Personal Portfolio/public/avatars/hemanth-laptop.png"
)


def main() -> None:
    img = Image.open(PNG).convert("RGBA")
    arr = np.array(img)
    h, w = arr.shape[:2]

    # Watermark badge — profiled at ~225x65 in the bottom-right of a 1792x2400.
    # Pad slightly for any soft edge.
    pad_x, pad_y = 240, 72
    arr[h - pad_y : h, w - pad_x : w, 3] = 0
    cleared = pad_x * pad_y
    print(f"zeroed alpha for {cleared} px in bottom-right ({pad_x}x{pad_y})")

    Image.fromarray(arr, mode="RGBA").save(PNG, format="PNG", optimize=True)
    print(f"wrote {PNG}")


if __name__ == "__main__":
    main()
