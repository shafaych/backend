import sys
from PIL import Image, ImageDraw
d, out, start, end, cols = sys.argv[1], sys.argv[2], int(sys.argv[3]), int(sys.argv[4]), int(sys.argv[5])
w, h = 270, 480
idx = list(range(start, end))
rows = (len(idx)+cols-1)//cols
S = Image.new('RGB', (w*cols, h*rows))
for n, i in enumerate(idx):
    try: im = Image.open(f'{d}/element-{i:02d}.jpeg').resize((w, h))
    except Exception: continue
    ImageDraw.Draw(im).text((6, 6), f'{(i*15+150)/30:.1f}s', fill=(255, 255, 0))
    S.paste(im, ((n % cols)*w, (n//cols)*h))
S.save(out)
