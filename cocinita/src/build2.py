"""Arma index.html: base (rediseño anterior) + módulos de la casa interactiva."""
import re,sys,os
here=os.path.dirname(os.path.abspath(__file__))
rd=lambda n:open(os.path.join(here,n),encoding='utf-8').read()
def cut(s,start,end,new):
    a=s.index(start);b=s.index(end,a);return s[:a]+new+s[b:]
def rep(s,old,new,count=1):
    if old not in s: sys.exit('MISSING: '+old[:80])
    return s.replace(old,new) if count==0 else s.replace(old,new,count)

s=rd('base2.html')
# --- datos: base de datos + cola
s=rep(s,"const KEY='cocinita-v1';\n",'')
s=cut(s,'function load(){','let tab=',rd('sync.js')+'\n')
s=rep(s,"let tab='cocina',furn='fridge'","let tab='sala',furn='fridge'")
s=rep(s,"min:min||0,expiry:exp||'',level:100}","min:min||0,expiry:exp||'',level:100,unit:'unid.'}")
s=rep(s,"function computeAlerts(){\n  const a=[];","function computeAlerts(){\n  const a=extraAlerts();")
s=rep(s,"  switch(a){\n    case 'tab':tab=d.tab;","  if(casaAct(a,d,el,px,py))return;\n  switch(a){\n    case 'tab':closeSheet();tab=d.tab;")
s=rep(s,"function closeSheet(){const s=$('#sheet');s.classList.remove('on');s.innerHTML=''}","function closeSheet(){const s=$('#sheet');s.classList.remove('on');s.innerHTML='';if(SYNC.dirty){SYNC.dirty=false;setTimeout(render,0)}}")

# --- inventario: unidad, historial, reponer
s=rep(s,"""<label>Fecha de vencimiento</label><input id="f-exp" type="date" value="${it.expiry||''}">`}""","""<label>Fecha de vencimiento (si aplica)</label><input id="f-exp" type="date" value="${it.expiry||''}">${unitSel(it.unit)}<div id="sl-box"></div>`}""")
s=rep(s,"""<label>Fecha de vencimiento</label><input id="f-exp" type="date">`}""","""<label>Fecha de vencimiento (si aplica)</label><input id="f-exp" type="date">${unitSel()}<div id="sl-box"></div>`}""")
s=rep(s,"""${clean?'':`<button class="btn terra" data-act="useOne" data-id="${id}">Usé 1</button>`}
  <button class="btn berry" data-act="delItem" data-id="${id}">Eliminar</button></div>`);""","""${clean?'':`<button class="btn terra" data-act="useOne" data-id="${id}">Usé 1</button><button class="btn ghost" data-act="addOne" data-id="${id}">Repuse 1</button>`}
  <button class="btn berry" data-act="delItem" data-id="${id}">Eliminar</button></div>${histHTML(id)}`);""")
s=rep(s,"it.expiry=v('f-exp').value||''}","it.expiry=v('f-exp').value||'';it.unit=v('f-unit')?v('f-unit').value:(it.unit||'unid.')}")
s=rep(s,"if(!clean)furn=place;if(clean)tab='limpieza';","if(!clean){furn=place;tab='cocina'}if(clean)tab='limpieza';")
s=rep(s,"""<h3>${ic(it.emoji)} ${esc(it.name)}</h3>""","""<h3>${ic(it.emoji)} ${esc(it.name)}${clean?'':` · ${it.qty} ${esc(it.unit||'unid.')}`}</h3>""")

# --- perros del jardín usan el mismo motor
s=rep(s,"function animDog(k,cls,ms,cb){const e=$('#dog-'+k);if(!e)return;","function animDog(k,cls,ms,cb){PETS.react(k,cls,ms);const e=$('#dog-'+k);if(!e)return;")
s=rep(s,"if(el.classList.contains('dog')){el.classList.add('happy');","if(el.classList.contains('dog')){PETS.react(k,'happy',1500);el.classList.add('happy');")
s=rep(s,"const L=$('.laundry');","const L=$('.r-bano');")

# --- avisos
s=rep(s,"""${a.go&&!a.add&&!a.rem?""","""${a.svc||a.tup?`<button class="btn sm ghost" data-act="alertGo" data-svc="${a.svc||''}" data-tup="${a.tup||''}">Ver</button>`:''}
    ${a.go&&!a.add&&!a.rem?""")
s=rep(s,"""<div class="card"><h2>⚙️ Datos</h2><div class="row"><button class="btn ghost" data-act="resetDemo">Datos de ejemplo</button><button class="btn berry" data-act="clearAll">Empezar vacía</button></div></div>""",
"""<div class="card"><h2>⚙️ Datos</h2><p class="sub">Todo se guarda en la base de datos de tu casita.</p><div class="row"><button class="btn ghost" data-act="syncInfo">Estado de sincronización</button><button class="btn berry" data-act="askClear">Vaciar inventario</button></div></div>""")

# --- cocina: piso, grifo, lista y menú
k=rd('kitchen.js')
k=rep(k,'viewBox="0 0 360 304"','viewBox="0 0 360 360"')
k=rep(k,'<rect width="360" height="304" fill="var(--wallp)"/><rect width="360" height="304" fill="url(#wdots)"/>','<rect width="360" height="290" fill="var(--wallp)"/><rect width="360" height="290" fill="url(#wdots)"/>')
k=rep(k,'<rect y="284" width="360" height="20" fill="var(--wood)"/><path d="M0 284H360${planks}" stroke="${OUT}" stroke-width="2.6"/>','${floorS(284,76)}<ellipse cx="200" cy="330" rx="118" ry="19" fill="#FFF6E2" ${S3}/><ellipse cx="200" cy="330" rx="100" ry="13" fill="none" stroke="#E4574B" stroke-width="2.6" stroke-dasharray="6 7"/>')
k=rep(k,'<rect x="226" y="188" width="50" height="9" rx="3" fill="#B9CDB0" ${S2}/>','<g class="tapobj" data-act="tap" data-svc="agua" role="button" aria-label="Grifo: recibo de agua"><rect x="236" y="150" width="48" height="48" fill="transparent"/><rect x="226" y="188" width="50" height="9" rx="3" fill="#B9CDB0" ${S2}/>')
k=rep(k,'<rect x="244" y="182" width="16" height="6" rx="3" fill="#C9CED6" ${S2}/>','<rect x="244" y="182" width="16" height="6" rx="3" fill="#C9CED6" ${S2}/><path class="wstream" d="M270 172V189" stroke="#8FC3E8" stroke-width="4" stroke-linecap="round"/><path class="drip" d="M270 172c-2 3-3 5 0 7c3-2 2-4 0-7Z" fill="#8FC3E8" stroke="${OUT}" stroke-width="1.2"/>${warnS(286,160,"agua")}</g>')
k=rep(k,"${sb(18,172,2.6)}${sb(34,90,1)}","${sb(18,172,2.6)}")
k=rep(k,"${glow(2,62,84,224,19)}${tag(44,293,'Refri')}\n  </g>","${glow(2,62,84,224,19)}${tag(44,293,'Refri')}\n  </g>\n  ${kitchenExtras()}")
k=rep(k,'toca el refri','tocá la refri')
s=cut(s,'function kitchenSVG(sel){','const BANNERS=',k)

# --- lavandería/baño: piso más alto y pila con grifo
s=rep(s,'<svg viewBox="0 0 360 280" role="img" aria-label="Lavandería: toca la lavadora o la secadora">','<svg viewBox="0 0 360 330" role="img" aria-label="Baño y lavandería: tocá la lavadora o la pila">')
s=rep(s,'<rect y="236" width="360" height="44" fill="url(#chk)"/>','<rect y="236" width="360" height="94" fill="url(#chk)"/>')
s=cut(s,'  <g class="sw s2"><ellipse cx="262" cy="206"','  </svg>`;\n}\n\n/* ---------- utilidades UI','  ${banoExtras()}\n')


# --- comida de perros: sin datos inventados cuando aún no se configuró
s=rep(s,"const D=S.dogs,per=D.rosco.g+D.mali.g,dl=Math.floor(D.bag.left/per);\n  if(dl<=7)","const D=S.dogs,per=D.rosco.g+D.mali.g,dogSet=per>0&&D.bag.total>0,dl=dogSet?Math.floor(D.bag.left/per):99;\n  if(dl<=7)")
s=rep(s,"dl=Math.floor(D.bag.left/per),pct=Math.round(D.bag.left/D.bag.total*100);","dogSet=per>0&&D.bag.total>0,dl=dogSet?Math.floor(D.bag.left/per):99,pct=dogSet?Math.round(D.bag.left/D.bag.total*100):0;")
s=rep(s,"<p style=\"margin:0 0 8px\"><b>${(D.bag.left/1000).toFixed(1)} kg</b> de ${(D.bag.total/1000).toFixed(0)} kg · alcanza para <b>${dl} días</b></p>","<p style=\"margin:0 0 8px\">${dogSet?`<b>${(D.bag.left/1000).toFixed(1)} kg</b> de ${(D.bag.total/1000).toFixed(0)} kg · alcanza para <b>${dl} días</b>`:'Todavía no anotaste cuánto comen ni el tamaño de la bolsa. Tocá Ajustar para registrarlo.'}</p>")
s=rep(s,"D.bag.total=Math.max(1,+v('d-total').value||15)*1000;","D.bag.total=Math.max(0,+v('d-total').value||0)*1000;")
s=rep(s,"D.rosco.g=+v('d-g1').value||260;D.mali.g=+v('d-g2').value||180;","D.rosco.g=Math.max(0,+v('d-g1').value||0);D.mali.g=Math.max(0,+v('d-g2').value||0);")
s=rep(s,'type="number" step="0.5" min="1" value="${D.bag.total/1000}"','type="number" step="0.5" min="0" value="${D.bag.total/1000||\'\'}"')

s=rep(s,'<label>Estante</label><select id="f-shelf">${shelfOpts(place,0)}</select>','<label>Estante</label><select id="f-shelf">${shelfOpts(place,place===\'fridge\'?1:0)}</select>')
s=rep(s,'return `<div class="card"><h2>🛒 Lista del súper</h2>','return `<button class="btn block rcbtn" data-act="receipt">📷 Leer factura del súper</button><div class="card"><h2>🛒 Lista del súper</h2>')
s=rep(s,"  if(casaAct(a,d,el,px,py))return;","  if(casaAct(a,d,el,px,py)||receiptAct(a,d)||slAct(a,d)||houseAct(a,d,el,px,py))return;")
s=rep(s,"h+'</div>';s.classList.add('on')}","h+'</div>';s.classList.add('on');slUpdate()}")
# --- voseo
for a,b in [('Arrastra ','Arrastrá '),('Toca para planear','Tocá para planear'),('Ponle un nombre','Ponele un nombre'),('Escribe ','Escribí '),('Tienes ','Tenés '),('No tienes','No tenés'),('ya lo tienes','ya lo tenés'),
            ('Pon la nueva','Poné la nueva'),('puedes','podés'),('Agrégala','Agregala'),('agrégalos aquí','agregalos aquí'),('Qué quieres recordar','Qué querés recordar'),('Toca un producto','Tocá un producto'),
            ('Va al refri','Va a la refri'),("label:'Refri'","label:'Refri'"),('Planea la semana','Planeá la semana'),('Verás los','Vas a ver los')]:
    s=s.replace(a,b)

# --- módulos y arranque
s=rep(s,'/* ---------- inicio ---------- */\nrender();','/* ---------- casa ---------- */\n'+rd('casa.js')+'\n'+rd('pets.js')+'\n'+rd('iso_art.js')+'\n'+rd('iso_engine.js')+'\n'+rd('iso_app.js')+'\n'+rd('receipt.js')+'\n'+rd('shelflife.js')+'\n/* ---------- inicio ---------- */\nrender();initSync();window.PETS_TEST=PETS;window.ISO_TEST=ISO;window.SYNC_TEST=SYNC;\nsetInterval(()=>{if(!document.hidden&&!$("#sheet").classList.contains("on")&&!drag)render()},60000);')
s=rep(s,"toast('¡Bienvenida! Arrastrá los productos y toca a los perritos 🐾')","toast('¡Bienvenida a tu casita! Tocá los objetos para usarlos 🐾')")
s=rep(s,'</style>',rd('casa.css')+rd('iso.css')+'\n</style>')
s=rep(s,'<script>\n(()=>{','<script src="pixi.min.js"></script>\n<script>\n(()=>{')
s=rep(s,"let tab='sala',furn='fridge'","let tab='casa',furn='fridge'")
s=rep(s,"if(!clean){furn=place;tab='cocina'}","if(!clean){furn=place;if(tab!=='casa')tab='cocina'}")
open(os.path.join(here,'..','index.html'),'w',encoding='utf-8').write(s)
print('ok',len(s))
