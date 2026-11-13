"""Recorta las poses originales de Rosco y Mali de sus hojas de personaje y les quita el fondo.
Uso: python3 extract_dogs.py <mali.png> <rosco.png> <carpeta_salida>
No redibuja nada: solo recorta, vuelve transparente el fondo crema/sombra rosada y limpia el borde."""
import sys, json
from collections import deque
from PIL import Image
import numpy as np

BOXES = {
 'mali': {
  'hero':  (15, 225, 365, 680),
  'front': (380, 70, 550, 305),
  'bow':   (15, 705, 275, 925),
  'move':  (285, 710, 540, 915),
  'lie':   (520, 770, 775, 915),
  'sleep': (770, 745, 1000, 915),
  'beg':   (995, 692, 1165, 915),
 },
 'rosco': {
  'hero':  (20, 150, 360, 700),
  'front': (385, 25, 550, 310),
  'bow':   (10, 710, 262, 925),
  'move':  (272, 705, 530, 912),
  'lie':   (535, 775, 775, 922),
  'sleep': (780, 745, 1015, 918),
  'beg':   (1010, 664, 1175, 918),
 },
}

ERASE = {'rosco-beg': [(1010,680,1076,694),(1108,680,1175,694)]}

def bglike(a):
    r, g, b = a[..., 0].astype(int), a[..., 1].astype(int), a[..., 2].astype(int)
    mn = np.minimum(np.minimum(r, g), b)
    return ((mn > 168) & (r > 225)) | ((r > 222) & (g > 150) & (b > 138))

def components(mask):
    h, w = mask.shape
    lab = np.zeros((h, w), np.int32); sizes = [0]; n = 0
    for y in range(h):
        for x in range(w):
            if mask[y, x] and not lab[y, x]:
                n += 1; c = 0; q = deque([(y, x)]); lab[y, x] = n
                while q:
                    cy, cx = q.popleft(); c += 1
                    for dy, dx in ((1,0),(-1,0),(0,1),(0,-1),(1,1),(1,-1),(-1,1),(-1,-1)):
                        ny, nx = cy+dy, cx+dx
                        if 0 <= ny < h and 0 <= nx < w and mask[ny, nx] and not lab[ny, nx]:
                            lab[ny, nx] = n; q.append((ny, nx))
                sizes.append(c)
    return lab, sizes

def cut(im, box, erase=()):
    a = np.asarray(im.crop(box).convert('RGB')).copy()
    for (ex0,ey0,ex1,ey1) in erase: a[max(ey0-box[1],0):max(ey1-box[1],0), max(ex0-box[0],0):max(ex1-box[0],0)] = (251,239,227)
    h, w, _ = a.shape
    bl = bglike(a)
    # fondo = lo que se alcanza desde el borde pasando por pixeles claros
    out = np.zeros((h, w), bool); q = deque()
    for x in range(w):
        for y in (0, h-1):
            if bl[y, x] and not out[y, x]: out[y, x] = True; q.append((y, x))
    for y in range(h):
        for x in (0, w-1):
            if bl[y, x] and not out[y, x]: out[y, x] = True; q.append((y, x))
    while q:
        cy, cx = q.popleft()
        for dy, dx in ((1,0),(-1,0),(0,1),(0,-1)):
            ny, nx = cy+dy, cx+dx
            if 0 <= ny < h and 0 <= nx < w and bl[ny, nx] and not out[ny, nx]:
                out[ny, nx] = True; q.append((ny, nx))
    fg = ~out
    lab, sizes = components(fg)
    keep = int(np.argmax(sizes))
    fg = lab == keep
    alpha = np.where(fg, 255, 0).astype(np.float32)
    # borde: el contorno siempre es marrón; los pixeles de transición se vuelven marrón semitransparente
    lum = a.astype(np.float32).mean(axis=2)
    pad = np.pad(fg, 1)
    edge = np.zeros((h, w), bool)
    for dy in (-1, 0, 1):
        for dx in (-1, 0, 1):
            edge |= ~pad[1+dy:1+dy+h, 1+dx:1+dx+w]
    edge &= fg
    Lbg, Lout = 236.0, 95.0
    aa = np.clip((Lbg - lum) / (Lbg - Lout), 0, 1) * 255
    rgb = a.astype(np.float32)
    light = edge & (lum > Lout + 12)
    alpha[light] = aa[light]
    rgb[light] = (122, 66, 26)
    # restos de la sombra rosada del piso en las filas de abajo
    r_, g_, b_ = a[..., 0].astype(int), a[..., 1].astype(int), a[..., 2].astype(int)
    pink = (r_ > 222) & (g_ > 135) & (g_ < 208) & (b_ > 118) & (b_ < 195) & (r_ - g_ > 34)
    pink[: int(h * .9)] = False
    alpha[pink] = 0
    rgba = np.dstack([rgb, alpha]).astype(np.uint8)
    ys, xs = np.where(alpha > 8)
    y0, y1, x0, x1 = ys.min(), ys.max()+1, xs.min(), xs.max()+1
    return Image.fromarray(rgba, 'RGBA').crop((x0, y0, x1, y1))

def main():
    src = {'mali': sys.argv[1], 'rosco': sys.argv[2]}; outdir = sys.argv[3]
    meta = {}
    for dog, path in src.items():
        im = Image.open(path)
        for pose, box in BOXES[dog].items():
            sp = cut(im, box, ERASE.get(dog+'-'+pose, ()))
            if pose == 'hero':
                sp = sp.resize((round(sp.width*.62), round(sp.height*.62)), Image.LANCZOS)
            sp.save(f'{outdir}/{dog}-{pose}.png', optimize=True)
            meta[f'{dog}-{pose}'] = [sp.width, sp.height]
    json.dump(meta, open(f'{outdir}/meta.json', 'w'))
    # hoja de contacto sobre fondo de color para revisar halos
    names = sorted(meta)
    W = sum(meta[n][0] + 12 for n in names[:7]); H = 2 * 300
    sheet = Image.new('RGB', (max(W, sum(meta[n][0]+12 for n in names[7:])), H), (120, 170, 150))
    for row in range(2):
        x = 6
        for n in names[row*7:(row+1)*7]:
            sp = Image.open(f'{outdir}/{n}.png'); sheet.paste(sp, (x, row*300 + 290 - sp.height), sp); x += sp.width + 12
    sheet.save(f'{outdir}/_contact.png')
    print(meta)

main()
