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
  onObject:act=>{
    if(act==='pantry')openSheet(`<h3>Alacena</h3>${furnitureHTML('pantry')}<button class="btn terra block" data-act="newItem" data-place="pantry">＋ Agregar a la alacena</button>`);
    else if(act==='laundry')openSheet(`<h3>Lavandería y limpieza</h3>${furnitureHTML('clean')}<button class="btn terra block" data-act="newItem" data-place="clean">＋ Agregar producto</button>`);
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
