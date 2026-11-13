import re,sys,os
here=os.path.dirname(os.path.abspath(__file__))
src=open(os.path.join(here,'original.html'),encoding='utf-8').read()
rd=lambda n:open(os.path.join(here,n),encoding='utf-8').read()

def cut(s,start,end,new):
    a=s.index(start);b=s.index(end,a)
    return s[:a]+new+s[b:]
def rep(s,old,new,count=1):
    if old not in s: sys.exit('MISSING: '+old[:70])
    return s.replace(old,new) if count==0 else s.replace(old,new,count)

s=src
# --- dibujos
s=cut(s,'/* ---------- perros (dibujo propio) ---------- */','/* ---------- ilustración propia ---------- */',rd('icons.js')+'\n'+rd('dog.js')+'\n')
s=cut(s,'function kitchenSVG(sel){','const BANNERS=',rd('kitchen.js'))

# --- iconos en lugar de emoji
s=rep(s,'`<span class="em">${it.emoji}</span>`','`<span class="em">${ic(it.emoji)}</span>`')
s=rep(s,'<div class="jar-b">${it.emoji}</div>','<div class="jar-b">${ic(it.emoji)}</div>')
s=rep(s,'<div class="b-ic">${b[0]}</div>','<div class="b-ic">${ic(b[0])}</div>')
s=rep(s,'<span style="--c:var(${t[3]})">${t[1]}</span>','<span style="--c:var(${t[3]})">${ic(t[1])}</span>')
s=rep(s,'<span>🛒</span><small>Al súper</small>','<span>${ic("🛒")}</span><small>Al súper</small>')
s=rep(s,'<span>😋</span>','<span>${ic("😋")}</span>')
s=rep(s,'<span>🗑️</span>','<span>${ic("🗑️")}</span>')
s=rep(s,'<span class="em">${s[2]}</span>','<span class="em">${ic(s[2])}</span>',0)
s=rep(s,'<span class="em">${x.emoji}</span>','<span class="em">${ic(x.emoji)}</span>')
s=rep(s,'<span class="em">${a.ic}</span>','<span class="em">${ic(a.ic)}</span>',0)
s=rep(s,'${i.emoji} ${esc(i.name)} ·','${ic(i.emoji)} ${esc(i.name)} ·')
s=rep(s,'data-e="${e}">${e}</button>','data-e="${e}">${ic(e)}</button>')
s=rep(s,'<h3>${it.emoji} ${esc(it.name)}</h3>','<h3>${ic(it.emoji)} ${esc(it.name)}</h3>')
s=rep(s,'data-act="togglePicker">${it.emoji}</button>','data-act="togglePicker">${ic(it.emoji)}</button>')
s=rep(s,'data-act="togglePicker">${pendingEmoji}</button>','data-act="togglePicker">${ic(pendingEmoji)}</button>')
s=rep(s,"v('f-eb').textContent=d.e","v('f-eb').innerHTML=ic(d.e)")
s=rep(s,'<span>🥣</span><small>Croquetas</small>','<span>${ic("🥣")}</span><small>Croquetas</small>')
s=rep(s,'<span>🦴</span>','<span>${ic("🦴")}</span>')
s=rep(s,'<span>💧</span>','<span>${ic("💧")}</span>')
s=rep(s,'<div class="pill-xp">⭐ ${S.stars}</div>','<div class="pill-xp">${ic("⭐")} ${S.stars}</div>')
s=rep(s,'aria-label="Avisos">🔔${n','aria-label="Avisos">${ic("🔔")}${n')
s=rep(s,'<h1>${bow(32)}Mi Cocinita</h1>','<h1>${ic("🍓","logo")}Mi Cocinita</h1>')
s=rep(s,'<div class="panel-title"><span>${PLACES[furn].ic}</span><h3>Dentro de ${T[furn]}</h3></div>','<div class="panel-title"><h3>Dentro de ${T[furn]}</h3><i></i></div>')
s=rep(s,'<div class="panel-title"><span>🧺</span><h3>Estantes de limpieza</h3></div>','<div class="panel-title"><h3>Estantes de limpieza</h3><i></i></div>')

# --- refri abierto: estantes de vidrio + puerta con repisas
s=rep(s,"""if(place==='fridge')return `<div class="scene"><div class="fridge">${sh}</div>${door}</div>`;""",
"""if(place==='fridge'){const S_=i=>shelfHTML(place,i);return `<div class="scene"><div class="fridge"><div class="fr-in">${S_(0)}${S_(1)}${S_(2)}${S_(3)}</div><div class="fr-door">${S_(4)}</div></div>${door}</div>`}""")

# --- tipografía
s=rep(s,'family=Fraunces:opsz,wght@9..144,600;9..144,800&family=Nunito:wght@500;700;800','family=Fredoka:wght@500;600;700&family=Nunito:wght@600;700;800')
s=s.replace('Fraunces,Georgia,serif','var(--disp)')
s=rep(s,'h1,h2,h3{font-family:var(--disp);margin:0;letter-spacing:-.01em}','h1,h2,h3{font-family:var(--disp);font-weight:600;margin:0;letter-spacing:.005em}')

# --- paleta (claro)
s=rep(s,'--bg:#FBE4DF;--paper:#FFF6E2;--card:#FFFAEE;--ink:#5A3524;--muted:#9A7260;--line:#EDCFBC;--out:#7A4A30;',
        '--disp:Fredoka,Nunito,system-ui,sans-serif;--bg:#FCEADF;--paper:#FFF6E4;--card:#FFFBF0;--ink:#5E3219;--muted:#A0745E;--line:#EDCFBC;--out:#6B3A1E;')
s=rep(s,'--tile:#FFE08A;--tile2:#FFD36B;--tile-l:#E7B24A;--wallp:#F9CFC9;','--tile:#FFF4DE;--tile2:#FFD98A;--tile-l:#EBCFA8;--wallp:#F8CBC4;')
s=rep(s,'--fridge:#FFF3D6;--fridge-in:#FFFBEF;--freezer:#D7EEF5;--glass:#BFE3EE;','--fridge:#FBE3A8;--fridge-in:#F3ECDD;--freezer:#DDF0F6;--glass:#FFFFFF;')
s=s.replace('--fridge:#4B4036;--fridge-in:#55493D;--freezer:#3E5560;--glass:#5C7F80;','--fridge:#6B5630;--fridge-in:#4A4038;--freezer:#3E5560;--glass:#8E8576;')
s=s.replace('--tile:#6B5424;--tile2:#7A6129;--tile-l:#4D3C18;','--tile:#5E4D3A;--tile2:#7A6129;--tile-l:#46382A;')

s=re.sub(r'box-shadow:0 (\dpx) 0 var\(--out\)',r'box-shadow:0 \1 0 var(--shd)',s)
s=rep(s,'--sh:0 4px 0 var(--out);','')
# --- estilos nuevos
s=rep(s,'</style>',rd('extra.css')+'\n</style>')
open(os.path.join(here,'..','index.html'),'w',encoding='utf-8').write(s)
print('ok',len(s))
