/* ---------- leer la factura del súper con una foto ---------- */
let RC={rows:[],busy:false,ctl:null,dates:false};
const RC_PLACES=[['fridge','Refri'],['freezer','Congelador'],['pantry','Alacena'],['spice','Especiero'],['clean','Limpieza'],['skip','No guardar']];
function sheetReceipt(){
  RC.rows=[];
  openSheet(`<h3>${ic('🧾')} Leer factura del súper</h3>
  <p class="sub">Tomá una foto de la factura (o elegí una de tu galería). Claude la lee y te propone dónde va cada cosa; nada se guarda hasta que vos lo revisés.</p>
  <label class="btn block filebtn" for="rc-file">📷 Tomar o elegir foto</label><input type="file" id="rc-file" accept="image/jpeg,image/png,image/webp" class="vh">
  <div id="rc-out"></div>`);
}
const rcMsg=h=>{const o=$('#rc-out');if(o)o.innerHTML=h};
async function readReceipt(file){
  if(RC.busy||!file)return;
  let sample=null;try{sample=window.claude&&window.claude.use?await window.claude.use('sample'):null}catch(e){}
  if(!sample){rcMsg('<div class="alert r"><div class="t">Leer facturas no está disponible en esta vista. Podés agregar los productos a mano.</div></div>');return}
  const lim=await sample.limits().catch(()=>null);
  if(!lim||!lim.images){rcMsg('<div class="alert r"><div class="t">Esta vista no puede enviar fotos a Claude. Probá abrir la casita desde la app de Claude.</div></div>');return}
  RC.busy=true;RC.ctl=new AbortController();
  rcMsg('<div class="alert b"><div class="t"><b>Leyendo la factura…</b><br><small>Puede tardar hasta un minuto.</small></div><div class="acts"><button class="btn sm ghost" data-act="rcStop">Detener</button></div></div>');
  const prompt=`La imagen es la foto de una factura o tiquete de supermercado (probablemente de Costa Rica, en español).
Extraé SOLO los productos comprados que una casa guarda: comida, bebidas, productos de limpieza e higiene y cosas para mascotas.
Ignorá totales, impuestos, descuentos, bolsas, formas de pago y datos del comercio. No inventés productos: si una línea no se lee, omitila.
Respondé únicamente con un arreglo JSON. Cada elemento:
{"name": nombre corto y claro en español, sin marca ni códigos, con mayúscula inicial (ej. "Leche", "Arroz", "Jabón de platos"),
 "qty": número comprado (unidades; si se vendió por peso, el peso),
 "unit": una de ${JSON.stringify(UNITS)},
 "place": "fridge" (refrigerados y frescos), "freezer" (congelados), "pantry" (secos, enlatados, bebidas sin abrir, comida de mascotas), "spice" (especias y condimentos secos) o "clean" (limpieza e higiene),
 "emoji": el más parecido de esta lista: ${FOOD_EM.concat(CLEAN_EM).join(' ')}}
Si la imagen no es una factura o no se puede leer, respondé [].`;
  try{
    const data=await sample.json(prompt,{images:[file],signal:RC.ctl.signal,cache:false});
    const rows=(Array.isArray(data)?data:[]).filter(r=>r&&typeof r.name==='string'&&r.name.trim()).slice(0,60).map(r=>({
      name:String(r.name).trim().slice(0,40),qty:Math.max(0,Number(r.qty)||1),unit:UNITS.includes(r.unit)?r.unit:'unid.',
      place:RC_PLACES.some(p=>p[0]===r.place)?r.place:'pantry',emoji:FOOD_EM.concat(CLEAN_EM).map(icKey).includes(icKey(r.emoji))?r.emoji:(r.place==='clean'?'🧴':'🥫'),on:true}));
    RC.busy=false;
    if(!rows.length){rcMsg('<div class="alert y"><div class="t">No pude leer productos en esa foto. Probá con más luz, la factura estirada y completa en la imagen.</div></div>');return}
    RC.rows=rows;sheetReceiptReview();
  }catch(e){
    RC.busy=false;const c=e&&e.code;
    if(c==='cancelled'){rcMsg('');return}
    rcMsg(`<div class="alert r"><div class="t">${c==='not_granted'?'Para leer facturas hay que permitir que la casita use Claude.':c==='rate_limited'?'Se alcanzó el límite de uso por ahora. Probá más tarde.':c==='image_rejected'?'Esa imagen no sirve (formato o tamaño). Probá con otra foto.':c==='refused'?'Claude no pudo procesar esa imagen. Probá con otra foto.':'No se pudo leer la factura en este momento. Probá de nuevo.'}</div></div>`);
  }
}
function sheetReceiptReview(){
  const rows=RC.rows.map((r,i)=>`<div class="rcrow"><button class="ck ${r.on?'on':''}" data-act="rcTog" data-i="${i}" aria-label="Incluir">${r.on?'✓':''}</button><span class="em">${ic(r.emoji)}</span>
    <input class="rc-n" data-i="${i}" data-f="name" value="${esc(r.name)}" aria-label="Nombre">
    <input class="rc-q" data-i="${i}" data-f="qty" type="number" min="0" step="any" value="${r.qty}" aria-label="Cantidad">
    <select class="rc-u" data-i="${i}" data-f="unit" aria-label="Unidad">${UNITS.map(u=>`<option ${u===r.unit?'selected':''}>${u}</option>`).join('')}</select>
    <select class="rc-p" data-i="${i}" data-f="place" aria-label="Dónde va">${RC_PLACES.map(p=>`<option value="${p[0]}" ${p[0]===r.place?'selected':''}>${p[1]}</option>`).join('')}</select></div>`).join('');
  openSheet(`<h3>${ic('🧾')} Revisá lo que leí</h3><p class="sub">Encontré ${RC.rows.length} producto${RC.rows.length===1?'':'s'}. Corregí nombres, cantidades o lugar, y quitá lo que no querás guardar. La lectura puede tener errores.</p>
  <div class="rclist">${rows}</div>
  <button class="rcdates" data-act="rcDates"><span class="ck ${RC.dates?'on':''}">${RC.dates?'✓':''}</span><span>Poner fecha orientativa a lo que va a la refri o al congelador <small>(guía general, contando desde hoy; la podés cambiar después)</small></span></button>
  <div class="acts-row"><button class="btn" data-act="rcSave">Guardar en la casita</button><button class="btn ghost" data-act="receipt">Otra foto</button></div>`);
}
function receiptSave(){
  let n=0;
  RC.rows.filter(r=>r.on&&r.place!=='skip'&&r.name.trim()).forEach(r=>{
    const place=r.place==='freezer'?'fridge':r.place,shelf=r.place==='freezer'?0:place==='fridge'?1:0,clean=place==='clean',key=r.name.trim().toLowerCase();
    let it=S.items.find(i=>i.name.toLowerCase()===key&&(i.place==='clean')===clean);
    if(it){if(clean)it.level=100;else{it.qty=(+it.qty||0)+r.qty;if(!it.unit||it.qty===r.qty)it.unit=r.unit}}
    else{it=mk(r.name.trim(),r.emoji,place,shelf,clean?1:r.qty);it.unit=r.unit;if(!clean&&METER_RE.test(slNorm(it.name))){it.meter=true;it.cont=contFor(it.name)}S.items.push(it)}
    if(RC.dates&&(r.place==='fridge'||r.place==='freezer')&&!it.expiry){const g=shelfLife(it.name,r.place);if(g&&g.days)it.expiry=addDays(g.days)}
    S.shop=S.shop.filter(x=>x.name.toLowerCase()!==key);n++;
  });
  save();closeSheet();if(tab!=='casa')tab='cocina';render();toast(n?`Guardé ${n} producto${n===1?'':'s'} de la factura 🧾`:'No se guardó nada');
}
function receiptAct(a,d){
  switch(a){
    case 'receipt':sheetReceipt();return true;
    case 'rcStop':RC.ctl&&RC.ctl.abort();return true;
    case 'rcTog':RC.rows[+d.i].on=!RC.rows[+d.i].on;sheetReceiptReview();return true;
    case 'rcSave':receiptSave();return true;
  }
  return false;
}
document.addEventListener('change',e=>{
  const t=e.target;
  if(t.id==='rc-file'){const f=t.files&&t.files[0];t.value='';readReceipt(f);return}
  if(t.dataset&&t.dataset.f&&t.closest('.rcrow')){const r=RC.rows[+t.dataset.i];if(r)r[t.dataset.f]=t.dataset.f==='qty'?Math.max(0,+t.value||0):t.value}
});
