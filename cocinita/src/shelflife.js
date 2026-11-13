/* ---------- cuánto dura la comida: guía general orientativa ----------
   [palabras clave, refri [mín,máx] días, congelador [mín,máx] días, alacena [mín,máx] días]
   Valores conservadores de guías comunes de conservación en casa (refri a 4 °C o menos, congelador a -18 °C).
   No reemplazan la fecha del empaque ni revisar olor y aspecto. */
const SHELF=[
  [/molid/,[1,2],[90,120],null],
  [/pollo|pavo|gallina/,[1,2],[270,365],null],
  [/pescado|tilapia|atun fresco|salmon|corvina/,[1,2],[90,180],null],
  [/camaron|marisco/,[1,2],[90,180],null],
  [/salchich|hot ?dog|chorizo/,[7,7],[30,60],null],
  [/jamon|mortadela|embutido|salami/,[3,5],[30,60],null],
  [/tocin/,[7,7],[30,30],null],
  [/res|bistec|carne|cerdo|chuleta|lomo|costilla|posta/,[3,5],[120,365],null],
  [/huevo/,[21,35],null,null],
  [/leche/,[5,7],[90,90],null],
  [/yogur/,[7,14],[30,60],null],
  [/natilla|crema dulce|crema/,[7,10],null,null],
  [/queso (tierno|fresco|turrialba|crema)|requeson|ricotta/,[7,7],[60,60],null],
  [/queso/,[21,28],[180,180],null],
  [/mantequilla|margarina/,[30,90],[180,270],null],
  [/sobras|comida hecha|arroz cocido|frijoles cocidos|sopa/,[3,4],[60,90],null],
  [/lechuga|espinaca|culantro|cilantro|perejil|albahaca/,[5,7],null,null],
  [/fresa|mora|frambuesa|arandano/,[3,5],[240,365],null],
  [/tomate/,[5,7],null,[3,5]],
  [/zanahoria/,[21,28],[300,365],null],
  [/brocoli|coliflor|vainica|ayote|zucchini/,[4,7],[240,365],null],
  [/chile dulce|pepino|apio/,[7,10],null,null],
  [/aguacate/,[3,4],null,[2,4]],
  [/manzana/,[28,42],null,[5,7]],
  [/banano|platano/,null,[60,90],[4,7]],
  [/limon|naranja|mandarina/,[21,28],null,[7,10]],
  [/papaya|pina|melon|sandia|mango/,[5,7],[240,365],[2,5]],
  [/uva/,[7,14],null,null],
  [/cebolla/,null,null,[30,60]],
  [/papa|yuca|camote/,null,null,[21,35]],
  [/ajo/,null,null,[60,90]],
  [/tortilla/,[7,10],[90,90],[3,5]],
  [/pan/,[7,10],[90,90],[4,6]],
  [/jugo/,[7,10],[240,365],null],
  [/arroz|frijol|pasta|fideo|lenteja|garbanzo|avena|harina|azucar|cereal/,null,null,[180,365]],
  [/atun|lata|enlatad|sardina|maiz dulce/,null,null,[365,730]],
  [/cafe/,null,null,[60,120]],
  [/aceite/,null,null,[180,365]],
  [/galleta|snack|papas tostadas/,null,null,[30,90]]
];
const slNorm=s=>String(s||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'');
const slSpan=r=>{const f=d=>d>=60?[Math.round(d/30),'mes','meses']:d>=14&&d%7===0?[d/7,'semana','semanas']:[d,'día','días'];const a=f(r[0]),b=f(r[1]);
  if(a[1]!==b[1])return `${a[0]} ${a[0]===1?a[1]:a[2]} a ${b[0]} ${b[0]===1?b[1]:b[2]}`;return a[0]===b[0]?`${a[0]} ${a[0]===1?a[1]:a[2]}`:`${a[0]}–${b[0]} ${b[2]}`};
/* where: 'fridge' | 'freezer' | 'pantry' */
function shelfLife(name,where){
  const n=slNorm(name);if(n.length<3)return null;
  const row=SHELF.find(r=>r[0].test(n));if(!row)return null;
  const idx={fridge:1,freezer:2,pantry:3}[where],r=row[idx];
  const names={fridge:'en la refri',freezer:'en el congelador',pantry:'en la alacena'};
  if(!r){const alt=[['fridge',1],['freezer',2],['pantry',3]].filter(a=>row[a[1]]).map(a=>`${slSpan(row[a[1]])} ${names[a[0]]}`);
    return{days:null,text:`No tengo una guía para guardarlo ${names[where]}.`+(alt.length?` Suele durar ${alt.join(' o ')}.`:'')}}
  return{days:r[0],text:`Suele durar ${slSpan(r)} ${names[where]}`+(where==='freezer'?' (con buena calidad)':'')+'.'};
}
const slWhere=(place,shelf)=>place==='fridge'?(+shelf===0?'freezer':'fridge'):place==='clean'?null:'pantry';
function slUpdate(){
  const box=$('#sl-box');if(!box)return;const nm=$('#f-name'),pl=$('#f-place'),sh=$('#f-shelf');
  const where=nm&&pl?slWhere(pl.value,sh?sh.value:0):null,s=where?shelfLife(nm.value,where):null;
  box.innerHTML=s?`<div class="slbox"><div><b>Guía:</b> ${esc(s.text)} <small>Contando desde hoy. Es una orientación general: manda la fecha del empaque y revisá olor y aspecto.</small></div>${s.days?`<button type="button" class="btn sm" data-act="slUse" data-d="${s.days}">Usar como fecha</button>`:''}</div>`:'';
}
function slAct(a,d){
  if(a==='slUse'){const e=$('#f-exp');if(e){e.value=addDays(+d.d);toast('Puse la fecha más prudente de la guía. Podés cambiarla.')}return true}
  if(a==='rcDates'){RC.dates=!RC.dates;sheetReceiptReview();return true}
  return false;
}
document.addEventListener('input',e=>{if(e.target.id==='f-name')slUpdate()});
document.addEventListener('change',e=>{if(e.target.id==='f-place'||e.target.id==='f-shelf')setTimeout(slUpdate,0)});
