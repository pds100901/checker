/* ---------- medir por nivel del envase: líquidos, polvos y salsas ---------- */
const METER_RE=/queso|mantequilla|margarina|leche|aceite|jugo|salsa|vinagre|miel|sirope|jarabe|crema|mayonesa|mostaza|ketchup|soya|soja|harina|azucar|sal\b|cafe|cacao|avena|detergente|jabon|cloro|suavizante|desinfectante|shampoo|champu|acondicionador|lavaplatos|limpiador|agua|refresco|gaseosa|vino|aderezo|caldo|leche en polvo/;
const CONTS=[['botella','Botella'],['tarro','Tarro'],['carton','Cartón'],['pieza','Pieza o bloque']];
const contFor=n=>{n=slNorm(n);return /queso|mantequilla|margarina|jamon|mortadela/.test(n)?'pieza':/leche|jugo|caldo|crema/.test(n)&&!/polvo/.test(n)?'carton':/aceite|salsa|vinagre|soya|soja|ketchup|shampoo|champu|acondicionador|cloro|suavizante|desinfectante|lavaplatos|limpiador|agua|refresco|gaseosa|vino|aderezo|sirope|jarabe/.test(n)?'botella':'tarro'};
const isMeter=it=>it.place==='clean'?!isCount(it):!!it.meter;
const contCol=it=>{const k=icKey(it.emoji),n=slNorm(it.name);if(it.place==='clean')return k==='🧼'?'#F7B6C8':k==='🧴'?'#9ED3C6':'#A9CDE0';
  if(/queso/.test(n))return '#FFC94F';if(/mantequilla|margarina/.test(n))return '#FFE58A';if(/jamon|mortadela/.test(n))return '#F2A39A';
  return /aceite|miel|vinagre/.test(n)?'#F2D15A':/leche|crema|harina|azucar|sal\b|mayonesa/.test(n)?'#EEF4FA':/salsa|ketchup|tomate/.test(n)?'#E8574B':/soya|soja|cafe|cacao/.test(n)?'#8A5330':/mostaza|jugo/.test(n)?'#FFD36B':(PROD3D[k]||[0,'#A9CDE0'])[1]};
function bottleSVG(it){
  const col=contCol(it),lv=Math.max(0,Math.min(100,it.level==null?100:it.level)),y=118-lv*.92,c=it.cont||(it.place==='clean'?(icKey(it.emoji)==='🧺'||/detergente|polvo/.test(slNorm(it.name))?'tarro':'botella'):contFor(it.name));
  if(c==='pieza'){const w=110*lv/100,dk='#C98F2B';
    const block=`<path d="M8 34L26 12H118V34Z" fill="${col}" stroke="${INK}" stroke-width="2.6" stroke-linejoin="round"/><path d="M8 34L26 12H118V34Z" fill="#fff" opacity=".28"/><rect x="8" y="34" width="110" height="44" rx="5" fill="${col}" stroke="${INK}" stroke-width="2.6"/>
      <g fill="${dk}" opacity=".55"><ellipse cx="30" cy="52" rx="7" ry="6"/><ellipse cx="62" cy="64" rx="6" ry="5"/><ellipse cx="88" cy="48" rx="8" ry="6"/><ellipse cx="106" cy="66" rx="4.5" ry="4"/><ellipse cx="46" cy="24" rx="6" ry="3"/><ellipse cx="84" cy="22" rx="7" ry="3.2"/></g>`;
    return `<svg viewBox="0 0 126 88" class="botsvg" aria-hidden="true"><defs><clipPath id="bc-${it.id}"><rect class="botcut" x="0" y="0" width="${8+w}" height="88"/></clipPath></defs>
    <g opacity=".3">${block}</g><path d="M8 34L26 12H118V78H13Q8 78 8 73Z" fill="none" stroke="${INK}" stroke-width="2" stroke-dasharray="5 5" opacity=".5"/>
    <g clip-path="url(#bc-${it.id})">${block}</g><path class="botedge" d="M${8+w} 34V78" stroke="${INK}" stroke-width="2.6" stroke-linecap="round" ${lv<=0||lv>=100?'opacity="0"':''}/></svg>`}
  const body=c==='tarro'?'M9 46Q9 38 17 38H53Q61 38 61 46V112Q61 122 51 122H19Q9 122 9 112Z':c==='carton'?'M13 46H57V117Q57 122 52 122H18Q13 122 13 117Z':'M14 40Q14 30 24 30H46Q56 30 56 40V112Q56 122 46 122H24Q14 122 14 112Z';
  const top=c==='tarro'?`<rect x="11" y="24" width="48" height="15" rx="5" fill="#F29C92" stroke="${INK}" stroke-width="2.6"/><path d="M17 30H53" stroke="#fff" stroke-width="2" opacity=".6"/>`
    :c==='carton'?`<path d="M13 46L24 28H46L57 46Z" fill="#FFF6E2" stroke="${INK}" stroke-width="2.6" stroke-linejoin="round"/><rect x="24" y="20" width="22" height="9" rx="2" fill="#FFF6E2" stroke="${INK}" stroke-width="2.4"/><circle cx="46" cy="38" r="4" fill="#9CCBEA" stroke="${INK}" stroke-width="1.8"/>`
    :`<rect x="27" y="14" width="16" height="17" fill="#FFF6E2" stroke="${INK}" stroke-width="2.6"/><path d="M22 14H50M35 14V6H48" fill="none" stroke="${INK}" stroke-width="2.6" stroke-linecap="round"/>`;
  return `<svg viewBox="0 0 70 126" class="botsvg" aria-hidden="true"><defs><clipPath id="bc-${it.id}"><path d="${body}"/></clipPath></defs>${top}
  <path d="${body}" fill="#FFFDF6"/><g clip-path="url(#bc-${it.id})"><rect class="botfill" x="6" y="${y}" width="58" height="${126-y}" fill="${col}"/><path class="botwave" d="M6 ${y}q6 -4 12 0t12 0t12 0t12 0t12 0" fill="none" stroke="#fff" stroke-width="2" opacity=".7"/></g>
  <path d="${body}" fill="none" stroke="${INK}" stroke-width="2.8"/><path d="M${c==='botella'?21:17} 52V100" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".8"/></svg>`;
}
function meterUI(it){
  const m=it&&it.meter,c=(it&&it.cont)||'botella';
  return `<div class="row"><div><label for="f-meter">Cómo se mide</label><select id="f-meter"><option value="0" ${m?'':'selected'}>Por cantidad</option><option value="1" ${m?'selected':''}>Por nivel del envase</option></select></div>
  <div><label for="f-cont">Envase</label><select id="f-cont">${CONTS.map(x=>`<option value="${x[0]}" ${x[0]===c?'selected':''}>${x[1]}</option>`).join('')}</select></div></div>
  ${m?`<div class="meterbig${c==='pieza'?' wide':''}"><div class="botv${c==='pieza'?' h':''}" data-id="${it.id}" role="slider" tabindex="0" aria-label="Nivel de ${esc(it.name)}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${it.level}">${bottleSVG(it)}</div><div><b class="botpct" id="bp-${it.id}">${it.level}%</b><small>${c==='pieza'?'Deslizá el dedo hacia los lados para marcar cuánto queda de la pieza empezada.':'Deslizá el dedo sobre el envase para marcar por dónde va el que está abierto.'} La cantidad cuenta los que tenés, incluido ese.</small></div></div>`:''}`;
}
/* fijar nivel: si el envase abierto se acaba y hay más, se abre el siguiente */
function setLevel(it,lv){
  it.level=lv;
  if(lv===0&&it.place!=='clean'){if(it.qty>1){it.qty--;it.level=100;toast(`Se acabó ese envase de ${it.name.toLowerCase()}. Te queda${it.qty>1?'n':''} ${it.qty} lleno${it.qty>1?'s':''}`)}else{it.qty=0;toast(`${it.name} se acabó: lo anoté en la lista 🛒`)}}
  else if(lv===0)toast(`${it.name} se acabó: lo anoté en la lista 🛒`);
  save();render();if(lv>0||it.place==='clean'||it.qty>0)reopenLevel(it.id);else closeSheet();
}
let levelFrom='bath';
function reopenLevel(id){if(levelFrom==='bath')sheetBath();else sheetItem(id)}
document.addEventListener('pointerdown',e=>{const el=e.target.closest&&e.target.closest('.botv');if(el)levelFrom=el.closest('.bathgrid')?'bath':'item'},true);
document.addEventListener('change',e=>{
  const t=e.target;if(t.id!=='f-meter'&&t.id!=='f-cont')return;t.dataset.touched='1';if($('#f-meter'))$('#f-meter').dataset.touched='1';
  const btn=$('[data-act=saveItem]');if(!btn)return;const it=itemById(btn.dataset.id);if(!it)return;
  it.meter=$('#f-meter').value==='1';it.cont=$('#f-cont').value;if(it.level==null)it.level=100;save();render();sheetItem(it.id);
});
document.addEventListener('input',e=>{
  if(e.target.id!=='f-name')return;const m=$('#f-meter'),c=$('#f-cont');if(!m||m.dataset.touched||$('[data-act=saveItem]'))return;
  const on=METER_RE.test(slNorm(e.target.value));m.value=on?'1':'0';if(on)c.value=contFor(e.target.value);
});
