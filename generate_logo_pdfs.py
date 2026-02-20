#!/usr/bin/env python3
"""
Carbon Cleanse Logo PDF Generator

Removes the background from the input logo image and produces two high-resolution
PDF files:
  1. Transparent background version
  2. Flat white background version

Dependencies: pip install Pillow rembg reportlab
Usage:        python generate_logo_pdfs.py <input_image>

Outputs are written to an 'output/' directory next to this script.
"""

import os
import sys
from io import BytesIO

from PIL import Image
from rembg import remove
from reportlab.lib.pagesizes import letter
from reportlab.lib.utils import ImageReader
from reportlab.pdfgen import canvas


DPI = 300
OUTPUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "output")


def remove_background(img: Image.Image) -> Image.Image:
    """Strip the background using rembg, returning an RGBA image."""
    buf = BytesIO()
    img.save(buf, format="PNG")
    result = remove(buf.getvalue())
    return Image.open(BytesIO(result)).convert("RGBA")


def create_white_bg(img: Image.Image) -> Image.Image:
    """Composite the RGBA image onto a flat-white background."""
    white = Image.new("RGBA", img.size, (255, 255, 255, 255))
    white.paste(img, mask=img)
    return white.convert("RGB")


def save_pdf(img: Image.Image, path: str, transparent: bool = False) -> None:
    """Write *img* to a high-resolution PDF at *path*.

    For the transparent version the logo is placed on a transparent PDF page.
    For the white version the page background is filled white first.
    """
    img_w, img_h = img.size
    page_w = img_w * 72.0 / DPI
    page_h = img_h * 72.0 / DPI

    c = canvas.Canvas(path, pagesize=(page_w, page_h))

    if not transparent:
        c.setFillColorRGB(1, 1, 1)
        c.rect(0, 0, page_w, page_h, fill=1, stroke=0)

    buf = BytesIO()
    img.save(buf, format="PNG", dpi=(DPI, DPI))
    buf.seek(0)
    c.drawImage(
        ImageReader(buf),
        0,
        0,
        width=page_w,
        height=page_h,
        mask="auto",
    )
    c.save()


def main() -> None:
    if len(sys.argv) < 2:
        sys.exit("Usage: python generate_logo_pdfs.py <input_image>")

    src_path = sys.argv[1]
    if not os.path.isfile(src_path):
        sys.exit(f"File not found: {src_path}")

    os.makedirs(OUTPUT_DIR, exist_ok=True)

    print(f"Loading {src_path} ...")
    img = Image.open(src_path).convert("RGBA")
    print(f"  Original size : {img.size[0]}x{img.size[1]}")

    print("Removing background ...")
    fg = remove_background(img)

    transparent_pdf = os.path.join(OUTPUT_DIR, "CarbonCleanse_Transparent.pdf")
    print(f"Saving transparent-background PDF -> {transparent_pdf}")
    save_pdf(fg, transparent_pdf, transparent=True)

    white_bg = create_white_bg(fg)
    white_pdf = os.path.join(OUTPUT_DIR, "CarbonCleanse_WhiteBackground.pdf")
    print(f"Saving white-background PDF       -> {white_pdf}")
    save_pdf(white_bg, white_pdf, transparent=False)

    print("\nDone! Output files:")
    for f in os.listdir(OUTPUT_DIR):
        full = os.path.join(OUTPUT_DIR, f)
        size_kb = os.path.getsize(full) / 1024
        print(f"  {full}  ({size_kb:.1f} KB)")


if __name__ == "__main__":
    main()
