/* ---------- puente entre la aplicación (datos) y el motor 2.5D (dibujo) ---------- */
let isoPanel=null;
const isoSvg=e=>{const d=ICONS[icKey(e)]||ICONS['🍯'];return `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="-2 -2 52 52"><g stroke="${INK}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round">${d}</g></svg>`};
const PROD3D={'🥛':['carton','#9CCBEA'],'🧃':['carton','#FFD36B'],'🥤':['bottle','#F29A8E'],'🥚':['eggs','#F2C99B'],'🧀':['wedge','#FFC94F'],'🧈':['tray','#FFE07A'],
  '🍗':['tray','#E9A56A'],'🥩':['tray','#E66A63'],'🐟':['tray','#9CCBEA'],'🦐':['tray','#FFA487'],'🌭':['tray','#C4633F'],'🥫':['can','#E8574B'],'🍯':['jar','#F7B531'],'🫒':['bottle','#C9D76B'],
  '🥣':['tub','#8FC3E8'],'🍞':['box','#E0A458'],'🍫':['box','#8A5330'],'🍪':['box','#E0A458'],'🧁':['box','#F7B6C8'],'🍕':['box','#FFD56B'],'🥞':['tub','#F0C078'],'☕':['jar','#8A5330'],
  '🍓':['round','#E8574B'],'🍅':['round','#EE5B46'],'🍎':['round','#EE5B46'],'🍑':['round','#FFB38A'],'🍋':['round','#FFE04D'],'🍇':['round','#A77AD0'],'🥑':['round','#7FB04F'],'🥬':['round','#A6D46E'],
  '🥕':['round','#F5923E'],'🥒':['round','#7FB04F'],'🌽':['round','#FFD24A'],'🍄':['round','#E8574B'],'🧅':['round','#C98BC0'],'🥔':['round','#D6A66A'],'🍌':['round','#FFD84D'],'🌶':['round','#E8483C'],'🧄':['round','#FBF3E4']};
const ISO_API={
  power:()=>svcState('luz').on,
  fridgeItems:()=>{
    const rows={1:'top',2:'mid',3:'low',4:'mid'},out=[];
    S.tuppers.filter(t=>t.status==='activo'&&t.place!=='freezer').forEach(t=>out.push({kind:'tub',col:'#F29C92',row:'mid'}));
    S.items.filter(i=>i.place==='fridge'&&i.shelf>0&&i.qty>0).forEach(i=>{const m=PROD3D[icKey(i.emoji)]||['jar','#F7B3A9'];out.push({kind:m[0],col:m[1],row:rows[i.shelf]||'mid'})});
    return out},
  onFridge:open=>{isoPanel=open?'fridge':null;render()},
  onMailbox:()=>sheetBills(),
  house:()=>({laundry:S.house.laundry||0,mess:S.house.mess||{},dirty:overdueChores().length,poop:S.house.poop||0,pee:S.house.pee||0,trash:S.house.trash||0,carBad:svcState('carro').cut}),
  onObject:act=>{
    if(act==='pantry')openSheet(`<h3>Alacena</h3>${furnitureHTML('pantry')}<button class="btn terra block" data-act="newItem" data-place="pantry">＋ Agregar a la alacena</button>`);
    else if(act==='laundry')openSheet(`<h3>Lavandería y limpieza</h3>${furnitureHTML('clean')}<button class="btn terra block" data-act="newItem" data-place="clean">＋ Agregar producto</button>`);
    else if(act==='poop'||act==='pee'){if(S.house[act]>0){S.house[act]--;award(1);save();render();toast(act==='poop'?'¡Caca recogida! 🐾':'¡Orín limpio! 🐾')}}
    else if(act==='car')sheetSvc('carro');
    else if(act==='trash')sheetHouse();
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
  <h4>🗑️ Basura</h4><div class="seg s3">${['Vacío','A medias','Lleno'].map((t,i)=>`<button class="${(h.trash||0)===i?'on':''}" data-act="hTrash" data-l="${i}">${t}</button>`).join('')}</div>
  ${h.trash?'<button class="btn block" style="margin-top:8px" data-act="hTrash" data-l="0" data-done="1">Ya saqué la basura ✨</button>':''}
  <label>Días que pasa el camión</label><div class="chips">${DAYS.map((d,i)=>`<button class="chip ${(h.trashDays||[]).includes(i)?'ok':''}" data-act="hTrashDay" data-i="${i}">${d}</button>`).join('')}</div>
  <h4>🐾 Rosco y Mali</h4>${[['poop','Cacas por recoger',5],['pee','Orines por limpiar',4]].map(q=>`<div class="li"><div class="t"><b>${q[1]}</b><small>${(h[q[0]]||0)?'Se ven en el jardín: tocalas ahí para limpiarlas':'Nada por ahora'}</small></div><div class="step"><button data-act="hPet" data-k="${q[0]}" data-d="-1" aria-label="Quitar">−</button><b class="rolln">${h[q[0]]||0}</b><button data-act="hPet" data-k="${q[0]}" data-d="1" data-max="${q[2]}" aria-label="Agregar">＋</button></div></div>`).join('')}
  ${(h.poop||0)+(h.pee||0)?'<button class="btn block" style="margin-top:8px" data-act="hPetClean">Ya limpié todo ✨</button>':''}
  <h4>🧽 Limpieza pendiente</h4>${od.length?od.map(c=>`<div class="li"><div class="t"><b>${esc(c.text)}</b><small>Tocaba hace ${-(daysUntil(c.last)+c.every)} día${-(daysUntil(c.last)+c.every)===1?'':'s'}</small></div><button class="btn sm" data-act="hChore" data-id="${c.id}">Hecho</button></div>`).join(''):`<p class="sub">${S.chores.some(c=>c.area==='clean')?'Nada atrasado: la casa se ve limpia ✨':'No tenés tareas de limpieza registradas. Agregalas en Baño → Rutina de limpieza y cuando se atrasen la casa se verá sucia.'}</p>`}`);
}
function houseAct(a,d,el,px,py){
  switch(a){
    case 'hLaundry':{const was=S.house.laundry||0;S.house.laundry=+d.l;if(d.done&&was)award(3,px,py);save();render();sheetHouse();if(d.done)toast('¡Ropa limpia! 🧺')}return true;
    case 'hMess':{const m=S.house.mess;m[d.r]=!m[d.r];if(!m[d.r])award(2,px,py);save();render();sheetHouse()}return true;
    case 'hChore':{const c=S.chores.find(x=>x.id===d.id);if(c){c.last=today();award(3,px,py);save();render();sheetHouse()}}return true;
    case 'hTrash':{const was=S.house.trash||0;S.house.trash=+d.l;if(d.done&&was)award(2,px,py);save();render();sheetHouse();if(d.done)toast('¡Basura afuera! 🗑️')}return true;
    case 'hTrashDay':{const a=S.house.trashDays||(S.house.trashDays=[]),i=+d.i,k=a.indexOf(i);if(k>=0)a.splice(k,1);else a.push(i);save();render();sheetHouse()}return true;
    case 'hPet':{const k=d.k,was=S.house[k]||0,n=Math.max(0,Math.min(k==='poop'?5:4,was+(+d.d)));S.house[k]=n;if(n<was)award(1,px,py);save();render();sheetHouse()}return true;
    case 'hPetClean':{award(2,px,py);S.house.poop=0;S.house.pee=0;save();render();sheetHouse();toast('¡Jardín limpio! 🐾')}return true;
    case 'bathAdd':{const it=mk(d.n,d.e,'clean',1,icKey(d.e)==='🧻'?0:1);it.level=50;if(isCount(it))it.unit='rollos';S.items.push(it);save();render();sheetBath();toast(isCount(it)?'Poné cuántos rollos hay':'Marcá en la botella por dónde va')}return true;
    case 'rollStep':{const it=itemById(d.id);if(it){it.qty=Math.max(0,Math.round(it.qty||0)+(+d.d));save();render();sheetBath();if(it.qty===0)toast('Se acabó el papel: lo anoté en la lista 🛒')}}return true;
    case 'bath':sheetBath();return true;
    case 'house':sheetHouse();return true;
  }
  return false;
}
/* arrastrar sobre la botella para fijar el nivel */
let botDrag=null;
function botSet(e){const r=botDrag.el.getBoundingClientRect();
  if(botDrag.el.classList.contains('h')){const l=r.left+r.width*(8/126),w=r.width*(110/126),lv=Math.max(0,Math.min(100,Math.round((e.clientX-l)/w*20)*5));botDrag.lv=lv;
    const c=botDrag.el.querySelector('.botcut'),ed=botDrag.el.querySelector('.botedge'),x=8+110*lv/100;c.setAttribute('width',x);ed.setAttribute('d',`M${x} 34V78`);ed.setAttribute('opacity',lv<=0||lv>=100?0:1);
    const p=document.getElementById('bp-'+botDrag.id);if(p)p.textContent=lv+'%';return}
  const top=r.top+r.height*.24,bot=r.top+r.height*.97;
  const lv=Math.max(0,Math.min(100,Math.round((bot-e.clientY)/(bot-top)*20)*5));botDrag.lv=lv;
  const y=118-lv*.92,w=botDrag.el.querySelector('.botwave');botDrag.el.querySelectorAll('.botfill').forEach(f=>{f.setAttribute('y',y);f.setAttribute('height',126-y)});w.setAttribute('d',`M6 ${y}q6 -4 12 0t12 0t12 0t12 0t12 0`);
  const p=document.getElementById('bp-'+botDrag.id);if(p)p.textContent=lv+'%'}
document.addEventListener('pointerdown',e=>{const el=e.target.closest&&e.target.closest('.botv');if(!el)return;botDrag={el,id:el.dataset.id,lv:null};botSet(e);e.preventDefault()});
document.addEventListener('pointermove',e=>{if(botDrag){botSet(e);e.preventDefault()}},{passive:false});
const botEnd=()=>{if(!botDrag)return;const b=botDrag;botDrag=null;const it=itemById(b.id);if(it&&b.lv!==null&&b.lv!==it.level)setLevel(it,b.lv)};
document.addEventListener('pointerup',botEnd);document.addEventListener('pointercancel',botEnd);
document.addEventListener('keydown',e=>{const el=e.target.closest&&e.target.closest('.botv');if(!el||!['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key))return;const it=itemById(el.dataset.id);if(!it)return;levelFrom=el.closest('.bathgrid')?'bath':'item';e.preventDefault();setLevel(it,Math.max(0,Math.min(100,(it.level||0)+(e.key==='ArrowUp'||e.key==='ArrowRight'?5:-5))));const n=document.querySelector(`.botv[data-id="${it.id}"]`);n&&n.focus()});
