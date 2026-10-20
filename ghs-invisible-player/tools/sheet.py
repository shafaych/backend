import sys
from PIL import Image
pre=sys.argv[1]; frames=sys.argv[2].split(','); out=sys.argv[3]; w=int(sys.argv[4]) if len(sys.argv)>4 else 270
h=w*16//9
ims=[Image.open(f'out/{pre}_{f}.png').convert('RGB').resize((w,h)) for f in frames]
sh=Image.new('RGB',(w*len(ims),h))
for i,im in enumerate(ims): sh.paste(im,(i*w,0))
sh.save(out)
