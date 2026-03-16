'''avatar.py'''
from PIL import Image, ImageDraw, ImageFont
import io

AVATAR_COLORS = [
    "#C9FA30", "#30FAC9", "#FA3060", "#3060FA",
    "#FA9030", "#9030FA", "#30FA60", "#FA3090",
]

def get_initials(full_name: str) -> str:
    parts = full_name.strip().split()
    if len(parts) >= 2:
        return (parts[0][0] + parts[-1][0]).upper()
    return full_name[0].upper()

def get_color_for_email(email: str) -> str:
    index = sum(ord(c) for c in email) % len(AVATAR_COLORS)
    return AVATAR_COLORS[index]

def generate_default_avatar(full_name: str, email: str, size: int = 256) -> bytes:
    bg_color = get_color_for_email(email)
    initials = get_initials(full_name)

    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Circle background
    draw.ellipse([0, 0, size, size], fill=bg_color)

    # Initials — try multiple font paths, fall back gracefully
    font = None
    font_paths = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
        "/usr/share/fonts/truetype/freefont/FreeSansBold.ttf",
    ]
    for path in font_paths:
        try:
            font = ImageFont.truetype(path, size // 3)
            break
        except:
            continue
    if font is None:
        font = ImageFont.load_default(size=size // 3)

    # Draw text perfectly centered using the "mm" (middle-middle) anchor
    center = (size / 2, size / 2)
    draw.text(center, initials, fill="#0C0C17", font=font, anchor="mm")

    buffer = io.BytesIO()
    img.save(buffer, format='PNG')
    buffer.seek(0)
    return buffer.read()