/* ---------- puente entre la aplicación (datos) y el motor 2.5D (dibujo) ---------- */
let isoPanel=null;
const isoSvg=e=>{const d=ICONS[icKey(e)]||ICONS['🍯'];return `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="-2 -2 52 52"><g stroke="${INK}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round">${d}</g></svg>`};
const ISO_API={
  power:()=>svcState('luz').on,
  fridgeItems:()=>{
    const rows={1:'top',2:'mid',3:'low',4:'mid'},out=[];
    S.tuppers.filter(t=>t.status==='activo'&&t.place!=='freezer').forEach(t=>out.push({icon:'🥡',svg:isoSvg('🥡'),row:'mid'}));
    S.items.filter(i=>i.place==='fridge'&&i.shelf>0&&i.qty>0).forEach(i=>out.push({icon:icKey(i.emoji),svg:isoSvg(i.emoji),row:rows[i.shelf]||'mid'}));
    return out},
  onFridge:open=>{isoPanel=open?'fridge':null;render()},
  onMailbox:()=>sheetBills(),
  house:()=>({laundry:S.house.laundry||0,mess:S.house.mess||{},dirty:overdueChores().length}),
  onObject:act=>{
    if(act==='pantry')openSheet(`<h3>Alacena</h3>${furnitureHTML('pantry')}<button class="btn terra block" data-act="newItem" data-place="pantry">＋ Agregar a la alacena</button>`);
    else if(act==='laundry')openSheet(`<h3>Lavandería y limpieza</h3>${furnitureHTML('clean')}<button class="btn terra block" data-act="newItem" data-place="clean">＋ Agregar producto</button>`);
    else if(act==='vanity')sheetBath();
    else if(act==='basket'||act==='mess'||act==='dirt'||act==='house')sheetHouse();
    else if(act==='sink'||act==='tub')toast(svcState('agua').on?'El agua corre bien 💧':'No sale agua en la casita: hay un recibo de agua vencido 🚰');
    else if(act==='stove')toast('Mmm… algo rico se está cocinando 🍲');
  },
  onPet:k=>{}
};
function vIso(){
  const n=S.items.filter(i=>i.place==='fridge').length+S.tuppers.filter(t=>t.status==='activo').length;
  const panel=isoPanel==='fridge'?`<div class="isoPanel"><div class="isoPanelH"><h3>Dentro de la refri</h3><button class="btn sm ghost" data-act="isoClose">Cerrar</button></div>
    ${n?'':'<p class="hint" style="margin-top:0">La refri está vacía. Agregá lo que tenés de verdad en tu casa.</p>'}${furnitureHTML('fridge')}
    <button class="btn terra block" data-act="newItem" data-place="fridge">＋ Agregar a la refri</button><button class="btn ghost block rcbtn" data-act="receipt">📷 Leer factura del súper</button></div>`:'';
  return `<div class="isoWrap${isoPanel?' withPanel':''}"><i class="cl c1"></i><i class="cl c2"></i><div class="isoHost" id="isoHost"></div>${panel}</div>
  <p class="hint">Prueba de la casa 2.5D: cocina, baño y lavandería. Las demás habitaciones siguen en las pestañas de abajo.</p>`;
}
function isoAfterRender(){
  const h=$('#isoHost');
  if(tab!=='casa'||!h){ISO.pause();return}
  const wrap=h.parentNode,free=innerHeight-$('#hdr').offsetHeight-$('#nav').offsetHeight-64;
  wrap.style.height=Math.max(380,Math.min(760,free))+'px';
  ISO.mount(h,ISO_API);
}

/* ---------- gabinete del baño: botellas que se llenan con el dedo y rollos de papel ---------- */
const bathItems=()=>S.items.filter(i=>i.place==='clean'&&i.shelf===1);
function bottleSVG(it){
  const k=icKey(it.emoji),col=k==='🧼'?'#F7B6C8':k==='🧴'?'#9ED3C6':'#A9CDE0',lv=Math.max(0,Math.min(100,it.level||0)),y=118-lv*.92;
  return `<svg viewBox="0 0 70 126" class="botsvg" aria-hidden="true"><defs><clipPath id="bc-${it.id}"><path d="M14 40Q14 30 24 30H46Q56 30 56 40V112Q56 122 46 122H24Q14 122 14 112Z"/></clipPath></defs>
  <rect x="27" y="14" width="16" height="17" fill="#FFF6E2" stroke="${INK}" stroke-width="2.6"/><path d="M22 14H50M35 14V6H48" fill="none" stroke="${INK}" stroke-width="2.6" stroke-linecap="round"/>
  <path d="M14 40Q14 30 24 30H46Q56 30 56 40V112Q56 122 46 122H24Q14 122 14 112Z" fill="#FFFDF6"/>
  <g clip-path="url(#bc-${it.id})"><rect class="botfill" x="10" y="${y}" width="50" height="${126-y}" fill="${col}"/><path class="botwave" d="M10 ${y}q6 -4 12 0t12 0t12 0t12 0" fill="none" stroke="#fff" stroke-width="2" opacity=".7"/></g>
  <path d="M14 40Q14 30 24 30H46Q56 30 56 40V112Q56 122 46 122H24Q14 122 14 112Z" fill="none" stroke="${INK}" stroke-width="2.8"/><path d="M21 44V100" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".8"/></svg>`;
}
function bathItemHTML(it){
  if(isCount(it)){const n=Math.max(0,Math.round(it.qty||0));
    return `<div class="bathit"><div class="rolls">${n?Array.from({length:Math.min(n,12)},()=>`<span>${ic('🧻')}</span>`).join(''):'<em>Sin rollos</em>'}${n>12?`<b>+${n-12}</b>`:''}</div>
    <div class="step"><button data-act="rollStep" data-id="${it.id}" data-d="-1" aria-label="Quitar un rollo">−</button><b class="rolln">${n}</b><button data-act="rollStep" data-id="${it.id}" data-d="1" aria-label="Agregar un rollo">＋</button></div>
    <button class="bathnm" data-act="openItem" data-id="${it.id}">${esc(it.name)}</button></div>`}
  return `<div class="bathit"><div class="botv" data-id="${it.id}" role="slider" tabindex="0" aria-label="Nivel de ${esc(it.name)}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${it.level}">${bottleSVG(it)}</div>
    <b class="botpct" id="bp-${it.id}">${it.level}%</b><button class="bathnm" data-act="openItem" data-id="${it.id}">${esc(it.name)}</button></div>`;
}
function sheetBath(){
  const its=bathItems(),has=n=>its.some(i=>slNorm(i.name).includes(n));
  const quick=[['Shampoo','🧴','shampoo'],['Jabón','🧼','jabon'],['Papel higiénico','🧻','papel']].filter(q=>!has(q[2]));
  openSheet(`<h3>${ic('🚿')} Debajo del lavamanos</h3>
  <p class="sub">Deslizá el dedo sobre cada botella para marcar por dónde va. El papel se cuenta por rollos.</p>
  <div class="bathgrid">${its.map(bathItemHTML).join('')||'<p class="sub">El gabinete está vacío. Agregá lo que tenés.</p>'}</div>
  <div class="chips" style="margin-top:10px">${quick.map(q=>`<button class="chip" data-act="bathAdd" data-n="${q[0]}" data-e="${q[1]}">＋ ${q[0]}</button>`).join('')}<button class="chip" data-act="newItem" data-place="clean">＋ Otro producto</button></div>`);
}
/* ---------- estado de la casa: ropa sucia, orden y limpieza ---------- */
function overdueChores(){return S.chores.filter(c=>c.area==='clean'&&c.last&&daysUntil(c.last)+c.every<0)}
const HROOMS=[['cocina','Cocina'],['bano','Baño'],['lavanderia','Lavandería']];
function sheetHouse(){
  const h=S.house,od=overdueChores(),L=['Nada','Poca','Bastante','Una montaña'];
  openSheet(`<h3>🧹 Estado de la casa</h3><p class="sub">Lo que marqués aquí se ve dentro de la casita.</p>
  <h4>🧺 Ropa sucia</h4><div class="seg">${L.map((t,i)=>`<button class="${(h.laundry||0)===i?'on':''}" data-act="hLaundry" data-l="${i}">${t}</button>`).join('')}</div>
  ${h.laundry?'<button class="btn block" style="margin-top:8px" data-act="hLaundry" data-l="0" data-done="1">Ya lavé todo ✨</button>':''}
  <h4>🧸 Orden</h4>${HROOMS.map(r=>`<div class="li"><div class="t"><b>${r[1]}</b><small>${h.mess[r[0]]?'Desordenada':'Ordenada'}</small></div><button class="btn sm ${h.mess[r[0]]?'':'ghost'}" data-act="hMess" data-r="${r[0]}">${h.mess[r[0]]?'Ya ordené':'Está desordenada'}</button></div>`).join('')}
  <h4>🧽 Limpieza pendiente</h4>${od.length?od.map(c=>`<div class="li"><div class="t"><b>${esc(c.text)}</b><small>Tocaba hace ${-(daysUntil(c.last)+c.every)} día${-(daysUntil(c.last)+c.every)===1?'':'s'}</small></div><button class="btn sm" data-act="hChore" data-id="${c.id}">Hecho</button></div>`).join(''):`<p class="sub">${S.chores.some(c=>c.area==='clean')?'Nada atrasado: la casa se ve limpia ✨':'No tenés tareas de limpieza registradas. Agregalas en Baño → Rutina de limpieza y cuando se atrasen la casa se verá sucia.'}</p>`}`);
}
function houseAct(a,d,el,px,py){
  switch(a){
    case 'hLaundry':{const was=S.house.laundry||0;S.house.laundry=+d.l;if(d.done&&was)award(3,px,py);save();render();sheetHouse();if(d.done)toast('¡Ropa limpia! 🧺')}return true;
    case 'hMess':{const m=S.house.mess;m[d.r]=!m[d.r];if(!m[d.r])award(2,px,py);save();render();sheetHouse()}return true;
    case 'hChore':{const c=S.chores.find(x=>x.id===d.id);if(c){c.last=today();award(3,px,py);save();render();sheetHouse()}}return true;
    case 'bathAdd':{const it=mk(d.n,d.e,'clean',1,icKey(d.e)==='🧻'?0:1);it.level=50;if(isCount(it))it.unit='rollos';S.items.push(it);save();render();sheetBath();toast(isCount(it)?'Poné cuántos rollos hay':'Marcá en la botella por dónde va')}return true;
    case 'rollStep':{const it=itemById(d.id);if(it){it.qty=Math.max(0,Math.round(it.qty||0)+(+d.d));save();render();sheetBath();if(it.qty===0)toast('Se acabó el papel: lo anoté en la lista 🛒')}}return true;
    case 'bath':sheetBath();return true;
    case 'house':sheetHouse();return true;
  }
  return false;
}
/* arrastrar sobre la botella para fijar el nivel */
let botDrag=null;
function botSet(e){const r=botDrag.el.getBoundingClientRect(),top=r.top+r.height*.24,bot=r.top+r.height*.97;
  const lv=Math.max(0,Math.min(100,Math.round((bot-e.clientY)/(bot-top)*20)*5));botDrag.lv=lv;
  const y=118-lv*.92,f=botDrag.el.querySelector('.botfill'),w=botDrag.el.querySelector('.botwave');f.setAttribute('y',y);f.setAttribute('height',126-y);w.setAttribute('d',`M10 ${y}q6 -4 12 0t12 0t12 0t12 0`);
  const p=document.getElementById('bp-'+botDrag.id);if(p)p.textContent=lv+'%'}
document.addEventListener('pointerdown',e=>{const el=e.target.closest&&e.target.closest('.botv');if(!el)return;botDrag={el,id:el.dataset.id,lv:null};botSet(e);e.preventDefault()});
document.addEventListener('pointermove',e=>{if(botDrag){botSet(e);e.preventDefault()}},{passive:false});
const botEnd=()=>{if(!botDrag)return;const b=botDrag;botDrag=null;const it=itemById(b.id);if(it&&b.lv!==null&&b.lv!==it.level){it.level=b.lv;save();render();sheetBath();if(b.lv===0)toast(`${it.name} se acabó: lo anoté en la lista 🛒`)}};
document.addEventListener('pointerup',botEnd);document.addEventListener('pointercancel',botEnd);
document.addEventListener('keydown',e=>{const el=e.target.closest&&e.target.closest('.botv');if(!el||!['ArrowUp','ArrowDown'].includes(e.key))return;const it=itemById(el.dataset.id);if(!it)return;it.level=Math.max(0,Math.min(100,it.level+(e.key==='ArrowUp'?5:-5)));save();render();sheetBath();const n=document.querySelector(`.botv[data-id="${it.id}"]`);n&&n.focus();e.preventDefault()});
