from PIL import Image, ImageDraw, ImageFont
import os

def text_to_image(text_path, output_path):
    with open(text_path, 'r') as f:
        lines = f.readlines()
    
    # تصفية السطور للحصول على الـ QR فقط
    qr_lines = [line for line in lines if '█' in line or '▄' in line]
    
    if not qr_lines:
        print("No QR found")
        return

    # إعدادات الخط والصورة
    font_size = 20
    # استخدام خط أحادي المسافة لضمان محاذاة الـ QR
    try:
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf", font_size)
    except:
        font = ImageFont.load_default()

    # حساب أبعاد الصورة
    max_width = max(len(line) for line in qr_lines) * (font_size * 0.6)
    max_height = len(qr_lines) * (font_size * 1.2)
    
    img = Image.new('RGB', (int(max_width) + 40, int(max_height) + 40), color='white')
    d = ImageDraw.Draw(img)
    
    y = 20
    for line in qr_lines:
        d.text((20, y), line, fill='black', font=font)
        y += font_size * 1.1
        
    img.save(output_path)
    print(f"Image saved to {output_path}")

if __name__ == "__main__":
    text_to_image('/home/ubuntu/deep-inspire-robots/qr_fresh.txt', '/home/ubuntu/deep-inspire-robots/whatsapp_qr.png')
