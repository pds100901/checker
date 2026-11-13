/* =====================================================================
   CASA: habitaciones, servicios (recibos), tuppers e historial
   ===================================================================== */
ICONS['🛋']='<path d="M6 22C6 14 12 12 16 12H32C36 12 42 14 42 22V30H6Z" fill="#F7B3A9"/><rect x="3" y="22" width="9" height="16" rx="4" fill="#F29C92"/><rect x="36" y="22" width="9" height="16" rx="4" fill="#F29C92"/><rect x="10" y="27" width="28" height="10" rx="3" fill="#FFF6E2"/><path d="M10 38V42M38 38V42"/>';
ICONS['🚿']='<path d="M10 22H38V30C38 38 32 42 24 42C16 42 10 38 10 30Z" fill="#DDF1FA"/><rect x="6" y="18" width="36" height="6" rx="3" fill="#FFF6E2"/><path d="M30 18V10C30 6 36 6 36 10" fill="none"/><circle cx="18" cy="11" r="3" fill="#DDF1FA"/><circle cx="24" cy="7" r="2" fill="#DDF1FA"/>';
ICONS['🌼2']='';
ICONS['⚡']='<path d="M27 4L10 27H22L19 44L38 19H26Z" fill="#FFD36B"/>';
ICONS['📶']='<path d="M6 20C16 10 32 10 42 20" fill="none" stroke-width="4"/><path d="M13 28C19 22 29 22 35 28" fill="none" stroke-width="4"/><circle cx="24" cy="37" r="4" fill="#9DC27A"/>';
ICONS['🧾']='<path d="M11 5H37V43L32 39L28 43L24 39L20 43L16 39L11 43Z" fill="#FFFDF6"/><path d="M17 14H31M17 21H31M17 28H26" fill="none" stroke-width="2"/>';
ICONS['🥡']='<path d="M8 20H40L37 40C37 42 35 43 33 43H15C13 43 11 42 11 40Z" fill="#DDF1FA"/><rect x="5" y="13" width="38" height="8" rx="3" fill="#F29C92"/><rect x="18" y="9" width="12" height="5" rx="2" fill="#F29C92"/><path d="M15 28Q24 24 33 28" fill="none" stroke="#fff" stroke-width="2.2"/>';

const SVC={luz:{n:'Electricidad',art:'la luz',ic:'⚡',c:'#FFD36B'},net:{n:'Internet',art:'el internet',ic:'📶',c:'#9DC27A'},agua:{n:'Agua',art:'el agua',ic:'💧',c:'#8FC3E8'}};
const ROOMS={sala:{n:'Sala',ic:'🛋',h:360,f:[308,346]},cocina:{n:'Cocina',ic:'🍲',h:360,f:[306,346]},bano:{n:'Baño',ic:'🚿',h:330,f:[262,318]},jardin:{n:'Jardín',ic:'🐶'}};
const UNITS=['unid.','g','kg','ml','L','paq.','latas','botellas','cajas','bolsas','docenas'];
let FX=null;
const money=n=>'₡'+Number(n||0).toLocaleString('es-CR');
const dLong=iso=>{if(!iso)return '';const [y,m,d]=iso.split('-').map(Number);return d+' '+['ene','feb','mar','abr','may','jun','jul','ago','set','oct','nov','dic'][m-1]+(y!==new Date().getFullYear()?' '+y:'')};
const inDays=d=>d===0?'hoy':d===1?'mañana':d>1?`en ${d} días`:d===-1?'ayer':`hace ${-d} días`;

/* ---------- estado de cada servicio ---------- */
function svcState(svc){
  const un=S.bills.filter(b=>b.svc===svc&&!b.paid).sort((a,b)=>a.due.localeCompare(b.due));
  const over=un.filter(b=>daysUntil(b.due)<0);
  const out=S.outages.find(o=>o.svc===svc&&!o.end)||null;
  const next=un[0]||null;
  return{svc,un,over,out,next,has:S.bills.some(b=>b.svc===svc),cut:over.length>0,on:!over.length&&!out,d:next?daysUntil(next.due):null};
}
function svcAll(){return{luz:svcState('luz'),net:svcState('net'),agua:svcState('agua')}}
function extraAlerts(){
  const a=[];
  Object.keys(SVC).forEach(k=>{
    const s=svcState(k),m=SVC[k];
    s.un.forEach(b=>{
      const d=daysUntil(b.due);
      if(d<0)a.push({lv:'r',ic:m.ic,t:`Recibo de ${m.n.toLowerCase()} vencido (${money(b.amount)}, vencía el ${dLong(b.due)}). En tu casita virtual se cortó ${m.art}.`,svc:k});
      else if(d<=5)a.push({lv:d<=1?'r':'y',ic:m.ic,t:`Recibo de ${m.n.toLowerCase()} vence ${inDays(d)} (${money(b.amount)}).`,svc:k});
    });
    if(s.out)a.push({lv:'r',ic:m.ic,t:`Corte real de ${m.n.toLowerCase()} registrado desde el ${dLong(s.out.start)}.`+(k==='luz'?' Mantené la refri cerrada y revisá los alimentos antes de consumirlos.':''),svc:k});
    if(!s.has)a.push({lv:'b',ic:m.ic,t:`Todavía no registraste ningún recibo de ${m.n.toLowerCase()}.`,svc:k});
  });
  S.tuppers.filter(t=>t.status==='activo').forEach(t=>{
    const d=daysUntil(t.safe);
    if(d<0)a.push({lv:'r',ic:'🥡',t:`Tupper de ${t.name}: pasó la fecha que anotaste para consumirlo (${dLong(t.safe)}). Revisalo antes de comer.`,tup:t.id});
    else if(d<=1)a.push({lv:'y',ic:'🥡',t:`Tupper de ${t.name}: consumilo ${inDays(d)}.`,tup:t.id});
  });
  return a;
}

/* ---------- encabezado y navegación entre habitaciones ---------- */
function renderHeader(){
  const l=level();const n=ALERTS.filter(a=>a.lv!=='b').length;
  $('#hdr').innerHTML=`<div class="brand"><h1>${ic("🍓","logo")}Mi Casita</h1><small>${DAYSL[dayIdx()]} ${new Date().getDate()} · ${esc(l.name)}</small></div>
  <button class="syncb" id="syncb" data-act="syncInfo"><i></i></button>
  <div class="pill-xp">${ic("⭐")} ${S.stars}</div>
  <button class="bell" data-act="tab" data-tab="avisos" aria-label="Avisos">${ic("🔔")}${n?`<b>${n}</b>`:''}</button>`;
  syncBadge();
}
function renderNav(){
  const sv=svcAll();
  const warn={sala:!sv.luz.on||!sv.net.on,cocina:false,bano:!sv.agua.on,jardin:false};
  const col={sala:'--peach',cocina:'--rose',bano:'--sky',jardin:'--mint'};
  $('#nav').innerHTML=`<button class="${tab==='casa'?'on':''}" data-act="tab" data-tab="casa"><span style="--c:var(--butter)">${ic('🏡')}</span>Casa</button>`+Object.keys(ROOMS).map(k=>`<button class="${tab===k?'on':''}" data-act="tab" data-tab="${k}"><span style="--c:var(${col[k]})">${ic(ROOMS[k].ic)}${warn[k]?'<em>!</em>':''}</span>${ROOMS[k].n}</button>`).join('');
}
function backBar(){return `<button class="backbar" data-act="tab" data-tab="${lastRoom}">‹ Volver a la casa</button>`}
let lastRoom='casa';

/* ---------- escena: contenedor común con perros, oscuridad y mensajes ---------- */
function svcNotes(room,sv){
  let h='';
  if(!sv.luz.on)h+=`<button class="svcmsg" data-act="svc" data-svc="luz"><b>${sv.luz.cut?'¡Tenés que pagar la luz para devolverle la energía a tu casita!':'Registraste un corte real de luz: tu casita también está a oscuras.'}</b><small>${sv.luz.cut?'Simulación de tu casita · no indica el estado del servicio real. Tocá para registrar el pago.':'Tocá cuando vuelva la luz.'}</small></button>`;
  let chips='';
  if(!sv.net.on)chips+=`<button class="svcchip" data-act="svc" data-svc="net">📡 Internet virtual desconectado</button>`;
  if(!sv.agua.on)chips+=`<button class="svcchip" data-act="svc" data-svc="agua">🚰 Sin agua en la casita</button>`;
  return h+(chips?`<div class="svcchips">${chips}</div>`:'');
}
function sceneWrap(room,svg,extra){
  const sv=svcAll();const fx=FX&&Date.now()-FX.t<2600?' fx-'+FX.svc:'';
  return `<div class="room r-${room}${fx}" data-room="${room}" style="aspect-ratio:360/${ROOMS[room].h}">${svg}<canvas class="pets"></canvas><div class="pethits"></div><div class="dark"></div><div class="sparks">${'<i></i>'.repeat(9)}</div>${svcNotes(room,sv)}${extra||''}</div>`;
}
const tagS=(cx,cy,t,w)=>`<g class="ktag"><rect x="${cx-(w||30)}" y="${cy-9}" width="${(w||30)*2}" height="18" rx="9" stroke="${OUT}" stroke-width="2.2"/><text x="${cx}" y="${cy+4}" text-anchor="middle">${t}</text></g>`;
const warnS=(x,y,svc)=>`<g class="warn warn-${svc}" transform="translate(${x},${y})"><path d="M0 -13L13 10H-13Z" fill="#FFD36B" stroke="${OUT}" stroke-width="2.6" stroke-linejoin="round"/><path d="M0 -5V3" stroke="${OUT}" stroke-width="3" stroke-linecap="round"/><circle cy="7" r="1.6" fill="${OUT}"/></g>`;
function floorS(y,h){let p='';for(let r=0;r*26<h;r++){p+=`M0 ${y+r*26}H360`;for(let i=0;i<5;i++)p+=`M${i*80+(r%2?40:0)+10} ${y+r*26}V${Math.min(y+h,y+r*26+26)}`}
  return `<rect y="${y}" width="360" height="${h}" fill="var(--wood)"/><path d="${p}" stroke="${OUT}" stroke-width="2.2" opacity=".55"/><path d="M0 ${y}H360" stroke="${OUT}" stroke-width="3"/>`}

/* ---------- SALA ---------- */
function salaSVG(){
  const S3=`stroke="${OUT}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"`,S2=`stroke="${OUT}" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"`;
  const sv=svcAll();
  const paper=(x,k,rot)=>{const s=sv[k];const st=!s.has?'none':s.cut?'over':s.d!==null&&s.d<=5?'soon':s.un.length?'pend':'ok';
    const col={none:'#EFE6D6',over:'#F29C92',soon:'#FFD36B',pend:'#FFF6E2',ok:'#CBE9D6'}[st];
    const mark={none:'＋',over:'!',soon:s.d===0?'hoy':s.d+'d',pend:s.d+'d',ok:'✓'}[st];
    const glyph=k==='luz'?`<path d="M2 -9L-5 2H0L-2 9L6 -2H1Z" fill="#F2A93B" ${S2} stroke-width="1.6"/>`:k==='net'?`<path d="M-7 -2Q0 -9 7 -2M-4 2Q0 -2 4 2" fill="none" ${S2} stroke-width="2"/><circle cy="6" r="1.8" fill="${OUT}"/>`:`<path d="M0 -9C-4 -3 -6 0 -6 3A6 6 0 0 0 6 3C6 0 4 -3 0 -9Z" fill="#8FC3E8" ${S2} stroke-width="1.6"/>`;
    return `<g transform="translate(${x},70) rotate(${rot})" data-act="svc" data-svc="${k}" role="button" aria-label="Recibo de ${SVC[k].n}"><rect x="-15" y="-21" width="30" height="42" rx="3" fill="${col}" ${S2}/><circle cy="-21" r="3" fill="#E4574B" ${S2} stroke-width="1.6"/><g transform="translate(0,-5)">${glyph}</g><text y="16" text-anchor="middle" class="ptxt">${mark}</text></g>`};
  return `<svg viewBox="0 0 360 360" class="kscene" role="img" aria-label="Sala: tocá la lámpara, el router o los recibos">
  <defs><pattern id="wstr" width="28" height="28" patternUnits="userSpaceOnUse"><rect width="28" height="28" fill="var(--wall2)"/><rect width="14" height="28" fill="#fff" opacity=".22"/></pattern>
  <radialGradient id="glow"><stop offset="0" stop-color="#FFE9A8" stop-opacity=".95"/><stop offset="1" stop-color="#FFE9A8" stop-opacity="0"/></radialGradient>
  <g id="sb2"><path d="M10 21C3 18 0 10 4 6C8 4 12 4 16 6C20 10 17 18 10 21Z" fill="#E4574B" stroke="#7A3A2A" stroke-width="1.7" stroke-linejoin="round"/><path d="M4 6L10 2L16 6L10 8.5Z" fill="#8DB05A" stroke="#4F6B2E" stroke-width="1.3" stroke-linejoin="round"/><circle cx="7" cy="12" r="1" fill="#FFE3C0"/><circle cx="12.5" cy="11" r="1" fill="#FFE3C0"/><circle cx="10" cy="16" r="1" fill="#FFE3C0"/></g></defs>
  <rect width="360" height="286" fill="url(#wstr)"/>
  ${floorS(284,76)}
  <ellipse cx="170" cy="330" rx="128" ry="21" fill="#F7B3A9" ${S3}/><ellipse cx="170" cy="330" rx="108" ry="15" fill="none" stroke="#FFF6E2" stroke-width="3" stroke-dasharray="7 7"/>

  <!-- ventana -->
  <rect x="18" y="52" width="80" height="88" rx="5" fill="#CFEAF2" ${S3}/><path d="M21 136C28 112 44 110 52 124C62 104 84 110 95 136Z" fill="#A9CF86"/><circle cx="76" cy="72" r="9" fill="#FFE08A" class="sun"/>
  <path d="M58 52V140M18 96H98" stroke="${OUT}" stroke-width="3"/>
  <g class="curt"><path d="M12 44H104V58${scal(12,92,58,9,9)}Z" fill="#FFF6E2" ${S3}/><path d="M12 52H104" stroke="#F29C92" stroke-width="2"/></g>
  <rect x="12" y="138" width="92" height="8" rx="3.5" fill="#FFF6E2" ${S3}/>

  <!-- tablero de recibos -->
  <g data-act="bills" role="button" aria-label="Tablero de recibos">
    <rect x="118" y="30" width="124" height="80" rx="7" fill="#C98A54" ${S3}/><rect x="125" y="37" width="110" height="66" rx="4" fill="#E8BE8E" ${S2}/>
    ${tagS(180,118,'Recibos',32)}
  </g>
  ${paper(146,'luz',-4)}${paper(180,'net',3)}${paper(214,'agua',-2)}

  <!-- sofá -->
  <rect x="26" y="196" width="170" height="60" rx="18" fill="#F7B3A9" ${S3}/>
  <rect x="16" y="222" width="30" height="56" rx="13" fill="#F29C92" ${S3}/><rect x="176" y="222" width="30" height="56" rx="13" fill="#F29C92" ${S3}/>
  <rect x="42" y="240" width="138" height="34" rx="10" fill="#FBC9C1" ${S3}/><path d="M111 242V272" stroke="${OUT}" stroke-width="2.4"/>
  <rect x="56" y="210" width="38" height="32" rx="9" fill="#FFF6E2" ${S3}/><use href="#sb2" transform="translate(65,215) scale(1.05)"/>
  <rect x="128" y="212" width="36" height="30" rx="9" fill="#CBE9D6" ${S3}/>
  <g class="tablet"><rect x="96" y="228" width="30" height="20" rx="4" fill="#5E3219" ${S2}/><rect x="99" y="231" width="24" height="14" rx="2" class="tscreen"/><path class="t-on" d="M105 241Q111 234 117 241" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round"/><path class="t-off" d="M106 234L116 243M116 234L106 243" stroke="#fff" stroke-width="2" stroke-linecap="round"/></g>
  <path d="M34 278V286M188 278V286" stroke="${OUT}" stroke-width="5" stroke-linecap="round"/>

  <!-- lámpara = electricidad -->
  <g class="piece" data-act="svc" data-svc="luz" role="button" aria-label="Lámpara: recibo de electricidad">
    <circle class="lampglow" cx="226" cy="150" r="62" fill="url(#glow)"/>
    <path d="M226 164V280" stroke="${OUT}" stroke-width="7" stroke-linecap="round"/><path d="M226 164V280" stroke="#E9B98F" stroke-width="3" stroke-linecap="round"/>
    <ellipse cx="226" cy="283" rx="17" ry="5" fill="#E9B98F" ${S3}/>
    <path class="lampshade" d="M210 126H242L252 166H200Z" ${S3}/><path d="M200 166${scal(200,52,166,6,6).replace(/^ /,'')}" fill="none"/>
    <path d="M238 172V186" stroke="${OUT}" stroke-width="2"/><circle cx="238" cy="188" r="2.6" fill="#E4574B" ${S2} stroke-width="1.6"/>
    ${warnS(226,106,'luz')}${tagS(226,200,'Luz',20)}
  </g>

  <!-- mueble, tele y router = internet -->
  <rect x="256" y="238" width="96" height="46" rx="7" fill="#FBE3B8" ${S3}/><rect x="263" y="246" width="38" height="30" rx="5" fill="#FFF3D6" ${S2}/><rect x="307" y="246" width="38" height="30" rx="5" fill="#FFF3D6" ${S2}/><circle cx="296" cy="261" r="2.6" fill="#E4574B"/><circle cx="312" cy="261" r="2.6" fill="#E4574B"/>
  <g class="tv"><rect x="262" y="182" width="84" height="52" rx="8" fill="#5E3219" ${S3}/><rect x="268" y="188" width="72" height="40" rx="4" class="tvscreen"/>
    <g class="tv-on"><use href="#sb2" transform="translate(292,195) scale(1.2)"/><path class="tvh" d="M322 200c-2-3-7 0-3 4l3 3 3-3c4-4-1-7-3-4Z" fill="#fff"/><path class="tvh h2" d="M280 212c-2-3-6 0-3 3l3 3 3-3c3-3-1-6-3-3Z" fill="#fff"/></g>
    <g class="tv-off"><path d="M290 214Q304 198 318 214M296 219Q304 210 312 219" stroke="#fff" stroke-width="2.6" fill="none" stroke-linecap="round"/><path d="M290 198L318 224" stroke="#F29C92" stroke-width="3.4" stroke-linecap="round"/></g>
    <path d="M296 234V238M312 234V238" stroke="${OUT}" stroke-width="4"/></g>
  <g class="piece" data-act="svc" data-svc="net" role="button" aria-label="Router: recibo de internet">
    <rect x="266" y="146" width="80" height="7" rx="3" fill="var(--wood)" ${S3}/>
    <g class="wifi"><path d="M292 112Q306 98 320 112" stroke="#9DC27A" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M298 119Q306 111 314 119" stroke="#9DC27A" stroke-width="3" fill="none" stroke-linecap="round"/></g>
    <path d="M290 132L284 114M322 132L328 114" stroke="${OUT}" stroke-width="3.4" stroke-linecap="round"/>
    <rect x="282" y="130" width="48" height="16" rx="6" fill="#FFF6E2" ${S3}/>
    <circle class="led" cx="294" cy="138" r="2.8"/><circle class="led l2" cx="304" cy="138" r="2.8"/><circle class="led l3" cx="314" cy="138" r="2.8"/>
    ${warnS(338,120,'net')}${tagS(306,166,'Internet',30)}
  </g>
  <!-- camita -->
  <ellipse cx="62" cy="300" rx="44" ry="13" fill="#C9B0E8" ${S3}/><ellipse cx="62" cy="298" rx="32" ry="8" fill="#E8DCF4" ${S2}/>
  </svg>`;
}
function vSala(){
  const sv=svcAll();
  const row=k=>{const s=sv[k],m=SVC[k];
    const st=!s.has?['Sin recibo registrado','b']:s.out?['Corte real registrado','r']:s.cut?['Cortado en la casita','r']:s.next?[`Vence ${inDays(s.d)}`,s.d<=5?'y':'g']:['Al día','g'];
    return `<button class="svcrow" data-act="svc" data-svc="${k}"><span class="em">${ic(m.ic)}</span><div class="t"><b>${m.n}</b><small>${s.next?money(s.next.amount)+' · vence el '+dLong(s.next.due):s.has?'Sin recibos pendientes':'Tocá para registrar el recibo y su vencimiento'}</small></div><span class="tag ${st[1]}">${st[0]}</span></button>`};
  return sceneWrap('sala',salaSVG())+`<p class="hint">Tocá la lámpara, el router o los recibos del tablero. Rosco y Mali andan por la casa: tocalos para saludarlos.</p>
  <div class="panel-title"><h3>Servicios de la casa</h3><i></i></div>${row('luz')}${row('net')}${row('agua')}
  <p class="sub" style="text-align:center;margin-top:10px">Los cortes son parte de la simulación de tu casita: no indican que el servicio real esté suspendido.</p>`;
}

/* ---------- COCINA ---------- */
function kitchenExtras(){
  const S2=`stroke="${OUT}" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"`;
  const n=S.shop.filter(x=>!x.checked).length;
  const today_=Object.keys(S.menu).filter(k=>k.startsWith(dayIdx()+'-')).length;
  return `<g data-act="tab" data-tab="super" role="button" aria-label="Lista de compras">
    <rect x="22" y="78" width="36" height="44" rx="3" fill="#FFFDF6" ${S2}/><circle cx="40" cy="78" r="3.2" fill="#E4574B" ${S2} stroke-width="1.6"/>
    <path d="M28 90H52M28 98H52M28 106H44" stroke="#C9A58A" stroke-width="2" stroke-linecap="round"/>
    ${n?`<circle cx="56" cy="80" r="8.5" fill="#E4574B" ${S2}/><text x="56" y="83.5" text-anchor="middle" class="ptxt w">${n}</text>`:''}
    <text x="40" y="118" text-anchor="middle" class="ptxt s">Lista</text></g>
  <g data-act="tab" data-tab="menu" role="button" aria-label="Menú de la semana">
    <path d="M30 30L44 40L58 30" fill="none" stroke="${OUT}" stroke-width="2"/><rect x="16" y="38" width="56" height="24" rx="4" fill="#5E7F52" ${S2}/><rect x="16" y="38" width="56" height="24" rx="4" fill="none" stroke="#C98A54" stroke-width="4"/><rect x="14" y="36" width="60" height="28" rx="5" fill="none" ${S2}/>
    <text x="44" y="54.5" text-anchor="middle" class="ptxt w">Menú${today_?' ·'+today_:''}</text></g>
  ${warnS(44,150,'luz')}`;
}
function tupperSVG(t){
  const cols=['#F29C92','#8FC3E8','#9DC27A','#FFD36B','#C9B0E8'];let h=0;for(const ch of t.id)h=(h*31+ch.charCodeAt(0))%97;const c=cols[h%cols.length];
  const food=['#E9B46A','#D98A4A','#A6D46E','#F5C24F','#E8574B'][h%5];
  let dots='';const n=Math.min(t.left,6);for(let i=0;i<n;i++)dots+=`<circle cx="${24-(n-1)*3.2+i*6.4}" cy="33" r="2.3" fill="${INK}"/>`;
  return `<svg viewBox="0 0 48 48" class="tupsvg" aria-hidden="true"><g stroke="${INK}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round">
  <path d="M7 18H41L38 40C38 42 36 43 34 43H14C12 43 10 42 10 40Z" fill="#EAF6FB"/><path d="M10.5 26H37.5L36.3 39.5C36.2 41 35 41.6 34 41.6H14C13 41.6 11.8 41 11.7 39.5Z" fill="${food}" stroke="none" opacity=".85"/>
  <rect x="4" y="11" width="40" height="8" rx="3" fill="${c}"/><rect x="18" y="7" width="12" height="5" rx="2" fill="${c}"/>
  <path d="M13 22V30" stroke="#fff" stroke-width="2.4" opacity=".8"/></g>${dots}</svg>`;
}
function tupperHTML(t){
  const d=daysUntil(t.safe);const fl=d<0?'<span class="exb r">Revisar</span>':d<=1?`<span class="exb y">${d===0?'Hoy':'1d'}</span>`:'';
  return `<button class="item tup" data-act="tupOpen" data-id="${t.id}">${tupperSVG(t)}<div class="nm">${esc(t.name)}</div><span class="badge">${t.left}</span>${fl}${t.place==='freezer'?'<span class="frz">❄</span>':''}</button>`;
}
function tupShelf(){
  const ts=S.tuppers.filter(t=>t.status==='activo');
  return `<div class="shelf tupshelf"><span class="s-label">Tuppers y sobras</span>${ts.map(tupperHTML).join('')}<button class="tupadd" data-act="tupNew" aria-label="Guardar un tupper">＋<small>Tupper</small></button></div>`;
}
function furnitureHTML(place){
  const sh=PLACES[place].shelves.map((_,i)=>shelfHTML(place,i)).join('');
  const door=doorAnim?`<div class="door ${place==='pantry'?'pd':place==='spice'?'sd':''}"></div>`:'';
  if(place==='fridge'){
    const S_=i=>shelfHTML(place,i),sv=svcState('luz');
    const note=sv.out?`<div class="frnote r">⚠️ Corte real de luz desde el ${dLong(sv.out.start)}. Mantené la refri cerrada el mayor tiempo posible y revisá cada alimento antes de consumirlo; no des por hecho que se dañó ni que sigue bien.</div>`
      :sv.cut?`<div class="frnote">⚠️ La refri de tu casita está sin energía (simulación). Tus alimentos reales no se ven afectados por esto.</div>`:'';
    const inS=i=>S.items.filter(x=>x.place==='fridge'&&x.shelf===i),d4=inS(4),c3=inS(3);
    const rack=it=>`<div class="drack">${it?itemHTML(it):''}</div>`;
    const fdoor=(side,its)=>{const a=its.slice();while(a.length<2)a.push(null);return `<div class="fdoor ${side}" data-drop="shelf" data-place="fridge" data-shelf="4">${side==='l'?'<span class="s-label">Puerta</span>':''}${a.map(rack).join('')}</div>`};
    const drawer=its=>`<div class="drawer" data-drop="shelf" data-place="fridge" data-shelf="3">${its.map(itemHTML).join('')}</div>`;
    return `${note}<div class="scene"><div class="fridge fr2${sv.on?'':' off'}">
      <div class="fr2top"><i class="tin"></i><i class="box"></i></div>
      <div class="fr2row">${fdoor('l',d4.filter((_,i)=>i%2===0))}
        <div class="fr2cav">${S_(1)}${tupShelf()}${S_(2)}<div class="crisp"><span class="s-label">Cajones de verduras</span>${drawer(c3.filter((_,i)=>i%2===0))}${drawer(c3.filter((_,i)=>i%2===1))}</div></div>
        ${fdoor('r',d4.filter((_,i)=>i%2===1))}</div>
      <div class="fzr">${S_(0)}<div class="fzfront"><i></i></div></div></div>${door}</div>`;
  }
  if(place==='spice')return `<div class="scene"><div class="rack">${sh}</div>${door}</div>`;
  if(place==='pantry')return `<div class="scene"><div class="pantry"><div class="valance"></div>${sh}</div>${door}</div>`;
  return `<div class="scene"><div class="cabinet">${sh}</div>${door}</div>`;
}
function vCocina(){
  const food=S.items.filter(i=>i.place!=='clean');
  const T={fridge:'la refri',spice:'el especiero',pantry:'la alacena'};
  const empty=!S.items.some(i=>i.place===furn)&&!(furn==='fridge'&&S.tuppers.some(t=>t.status==='activo'));
  return sceneWrap('cocina',kitchenSVG(furn))+`
  <div class="panel-title"><h3>Dentro de ${T[furn]}</h3><i></i></div>
  ${furnitureHTML(furn)}
  ${empty?`<p class="hint">${furn==='fridge'?'La refri está vacía':'Aquí no hay nada todavía'}. Agregá lo que tenés de verdad en tu casa.</p>`:''}
  ${binsHTML()}
  <button class="btn terra block" data-act="newItem" data-place="${furn}">＋ Agregar a ${PLACES[furn].label.toLowerCase()}</button>
  <button class="btn ghost block rcbtn" data-act="receipt">📷 Leer factura del súper</button>
  <p class="hint">Tocá la refri, el especiero o la alacena para abrirlos; la lista de compras está pegada en la refri y el menú en la pizarra. Arrastrá productos entre estantes o a las cestas.</p>`;
}

/* ---------- BAÑO Y LAVANDERÍA ---------- */
function banoExtras(){
  const S3=`stroke="${OUT}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"`,S2=`stroke="${OUT}" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"`;
  return `<g class="piece tapobj" data-act="tap" data-svc="agua" role="button" aria-label="Pila: recibo de agua">
    <rect x="262" y="218" width="66" height="20" rx="4" fill="#FBE3B8" ${S3}/>
    <path d="M244 200H346V210Q346 222 334 222H256Q244 222 244 210Z" fill="#FFFDF6" ${S3}/>
    <path d="M276 201V190Q276 181 286 181Q295 181 295 189" fill="none" stroke="${OUT}" stroke-width="7.5" stroke-linecap="round"/><path d="M276 201V190Q276 181 286 181Q295 181 295 189" fill="none" stroke="#C9CED6" stroke-width="3.2" stroke-linecap="round"/>
    <rect x="266" y="195" width="20" height="6" rx="3" fill="#C9CED6" ${S2}/>
    <path class="wstream" d="M295 192V206" stroke="#8FC3E8" stroke-width="4" stroke-linecap="round"/>
    <path class="drip" d="M295 193c-2 3-3 5 0 7c3-2 2-4 0-7Z" fill="#8FC3E8" stroke="${OUT}" stroke-width="1.2"/>
    ${warnS(318,186,'agua')}${tagS(296,246,'Agua',22)}
  </g>`;
}
function vBano(){
  return sceneWrap('bano',laundrySVG())+`
  <p class="hint">Tocá la pila para ver el recibo del agua, o la lavadora para ponerla a lavar.</p>
  <div class="row" style="margin-bottom:14px"><button class="btn ghost" data-act="bath">🚿 Gabinete del baño</button><button class="btn ghost" data-act="house">🧹 Estado de la casa</button></div>
  <div class="panel-title"><h3>Gabinete de limpieza</h3><i></i></div>
  ${furnitureHTML('clean')}${binsHTML()}
  <button class="btn terra block" data-act="newItem" data-place="clean">＋ Agregar producto</button>
  <div class="card" style="margin-top:18px"><h2>🧹 Rutina de limpieza</h2>${choreHTML('clean')}</div>`;
}
function vJardin(){return vPerros()}
function dogSVG(k){return `<span class="dogslot" data-k="${k}"></span>`}

/* ---------- render principal ---------- */
function render(){
  dailyReset();ALERTS=computeAlerts();
  if(tab==='perros')tab='jardin';if(tab==='limpieza')tab='bano';
  if(ROOMS[tab]||tab==='casa')lastRoom=tab;
  const sv=svcAll();
  const V={casa:vIso,sala:vSala,cocina:vCocina,bano:vBano,jardin:vJardin,menu:vMenu,super:vSuper,avisos:vAvisos};
  if(tab!=='casa')isoPanel=null;
  const y=scrollY,app=$('#app');
  app.className=(sv.luz.on?'':'no-luz ')+(sv.net.on?'':'no-net ')+(sv.agua.on?'':'no-agua ')+'t-'+tab;
  document.body.classList.toggle('dark-house',!sv.luz.on&&!!ROOMS[tab]);
  app.innerHTML=(ROOMS[tab]||tab==='casa'?'':backBar()+banner(tab))+V[tab]();
  renderHeader();renderNav();doorAnim=false;scrollTo(0,y);
  PETS.mount();isoAfterRender();
}

/* ---------- hojas: servicios ---------- */
function billRow(b){
  const d=daysUntil(b.due);
  return `<div class="li"><span class="em">${ic('🧾')}</span><div class="t"><b>${money(b.amount)}</b><small>Vence el ${dLong(b.due)} · ${d<0?'venció '+inDays(d):inDays(d)}${b.note?' · '+esc(b.note):''}</small></div>
  <button class="btn sm" data-act="payAsk" data-id="${b.id}">Registrar pago</button><button class="x" data-act="billDel" data-id="${b.id}" aria-label="Eliminar recibo">✕</button></div>`;
}
function sheetSvc(k){
  const s=svcState(k),m=SVC[k];
  const paid=S.bills.filter(b=>b.svc===k&&b.paid).sort((a,b)=>b.paid.at.localeCompare(a.paid.at));
  const status=s.out?`<div class="alert r"><span class="em">${ic(m.ic)}</span><div class="t">Registraste un <b>corte real</b> desde el ${dLong(s.out.start)}.</div><div class="acts"><button class="btn sm" data-act="outEnd" data-id="${s.out.id}">Ya volvió</button></div></div>`
    :s.cut?`<div class="alert r"><span class="em">${ic(m.ic)}</span><div class="t"><b>${k==='luz'?'¡Tenés que pagar la luz para devolverle la energía a tu casita!':k==='net'?'El internet de tu casita está desconectado hasta que registrés el pago.':'Los grifos de tu casita no tienen agua hasta que registrés el pago.'}</b><br><small>Es parte de la simulación: no significa que el servicio real esté suspendido.</small></div></div>`
    :!s.has?`<div class="alert b"><span class="em">${ic(m.ic)}</span><div class="t">Aún no hay recibos de ${m.n.toLowerCase()}. Registrá el monto y la fecha de vencimiento del tuyo.</div></div>`
    :s.next?`<div class="alert ${s.d<=5?'y':''}"><span class="em">${ic(m.ic)}</span><div class="t">Próximo recibo: <b>${money(s.next.amount)}</b>, vence ${inDays(s.d)} (${dLong(s.next.due)}).</div></div>`
    :`<div class="alert"><span class="em">${ic(m.ic)}</span><div class="t">Al día. No hay recibos pendientes.</div></div>`;
  openSheet(`<h3>${ic(m.ic)} ${m.n}</h3>${status}
  ${s.un.length?`<h4>Pendientes</h4>${s.un.map(billRow).join('')}`:''}
  <h4>Nuevo recibo</h4>
  <div class="row"><div><label for="b-amount">Monto (₡)</label><input id="b-amount" type="number" inputmode="decimal" min="0" step="any" placeholder="Monto del recibo"></div>
  <div><label for="b-due">Fecha de vencimiento</label><input id="b-due" type="date"></div></div>
  <label for="b-note">Nota (opcional)</label><input id="b-note" placeholder="Ej. periodo de marzo">
  <div class="acts-row"><button class="btn" data-act="billAdd" data-svc="${k}">Guardar recibo</button></div>
  <h4>Historial de pagos</h4>${paid.length?paid.slice(0,12).map(b=>`<div class="li"><span class="em">✅</span><div class="t"><b>${money(b.paid.amount)}</b><small>Pagado el ${dLong(b.paid.at)} · vencía el ${dLong(b.due)}${b.note?' · '+esc(b.note):''}</small></div><button class="x" data-act="payUndo" data-id="${b.id}" title="Deshacer pago" aria-label="Deshacer pago">↺</button></div>`).join(''):'<p class="sub">Todavía no hay pagos registrados.</p>'}
  <h4>Corte real del servicio</h4>
  <p class="sub">Si de verdad se fue ${m.art} en tu casa (avería, mantenimiento u otra causa), anotalo aquí. Es independiente de los recibos.</p>
  ${s.out?'':`<div class="row"><div><label for="o-start">¿Desde cuándo?</label><input id="o-start" type="date" value="${today()}"></div><button class="btn ghost" style="flex:none" data-act="outStart" data-svc="${k}">Registrar corte real</button></div>`}
  ${S.outages.filter(o=>o.svc===k&&o.end).slice(-4).reverse().map(o=>`<div class="li"><span class="em">${ic(m.ic)}</span><div class="t"><b>Corte real</b><small>Del ${dLong(o.start)} al ${dLong(o.end)}</small></div></div>`).join('')}`);
}
function sheetBills(){
  const sv=svcAll();
  openSheet(`<h3>${ic('🧾')} Recibos de la casa</h3><p class="sub">Tocá un servicio para registrar su recibo, el vencimiento o el pago.</p>
  ${Object.keys(SVC).map(k=>{const s=sv[k],m=SVC[k];return `<button class="svcrow" data-act="svc" data-svc="${k}"><span class="em">${ic(m.ic)}</span><div class="t"><b>${m.n}</b><small>${s.next?money(s.next.amount)+' · vence el '+dLong(s.next.due):s.has?'Sin recibos pendientes':'Sin recibo registrado'}</small></div><span class="tag ${s.cut||s.out?'r':s.next&&s.d<=5?'y':s.has?'g':'b'}">${s.out?'Corte real':s.cut?'Cortado':s.next?inDays(s.d):s.has?'Al día':'Registrar'}</span></button>`}).join('')}
  <p class="sub" style="margin-top:10px">Si un recibo llega a su fecha límite sin pago registrado, al día siguiente la casita virtual pierde ese servicio. Es solo la simulación.</p>`);
}
function sheetPay(id){
  const b=S.bills.find(x=>x.id===id);if(!b)return;const m=SVC[b.svc];
  openSheet(`<h3>${ic(m.ic)} Registrar pago de ${m.n.toLowerCase()}</h3>
  <p class="sub">Recibo de ${money(b.amount)} que vence el ${dLong(b.due)}. Confirmá solo si ya lo pagaste de verdad.</p>
  <div class="row"><div><label for="p-at">Fecha en que pagaste</label><input id="p-at" type="date" value="${today()}" max="${today()}"></div>
  <div><label for="p-amount">Monto pagado (₡)</label><input id="p-amount" type="number" inputmode="decimal" min="0" step="any" value="${b.amount}"></div></div>
  <div class="acts-row"><button class="btn" data-act="payOk" data-id="${id}">Sí, ya lo pagué</button><button class="btn ghost" data-act="svc" data-svc="${b.svc}">Volver</button></div>`);
}

/* ---------- hojas: tuppers ---------- */
function sheetTupper(id){
  const t=id?S.tuppers.find(x=>x.id===id):null;
  if(t){
    const d=daysUntil(t.safe);
    const cut=S.outages.some(o=>o.svc==='luz'&&(o.end||'9999')>=t.prep&&o.start<=today()&&(o.end||today())>=t.prep);
    openSheet(`<h3>${ic('🥡')} ${esc(t.name)}</h3>
    <div class="chips" style="margin:6px 0 4px"><span class="chip">Preparado el ${dLong(t.prep)}</span><span class="chip ${d<0?'no':d<=1?'':'ok'}">Consumir antes del ${dLong(t.safe)}</span><span class="chip">${t.place==='freezer'?'❄ Congelador':'Refri'}</span></div>
    ${d<0?'<div class="alert r"><div class="t">Ya pasó la fecha que anotaste para consumirlo. Revisalo bien (olor, aspecto) antes de comer y, ante la duda, desechalo.</div></div>':d<=1?`<div class="alert y"><div class="t">Consumilo ${inDays(d)}.</div></div>`:''}
    ${cut?'<div class="alert y"><div class="t">Hubo un corte real de luz mientras estaba guardado. Revisá su conservación antes de consumirlo; no significa que esté dañado.</div></div>':''}
    <div class="portions"><b>${t.left}</b> de ${t.total} porci${t.total===1?'ón':'ones'}<div class="pdots">${Array.from({length:t.total},(_,i)=>`<i class="${i<t.left?'on':''}"></i>`).join('')}</div></div>
    <div class="acts-row"><button class="btn" data-act="tupEat" data-id="${t.id}">Comí 1 porción</button><button class="btn ghost" data-act="tupEdit" data-id="${t.id}">Editar</button></div>
    <div class="acts-row"><button class="btn ghost" data-act="tupEnd" data-id="${t.id}" data-st="terminado">Se terminó</button><button class="btn berry" data-act="tupEnd" data-id="${t.id}" data-st="desechado">Lo deseché</button></div>
    <h4>Historial</h4>${(t.log||[]).slice().reverse().map(l=>`<div class="li"><div class="t"><b>${esc(l.a)}</b><small>${fmtAt(l.at)}</small></div></div>`).join('')}`);
  }else sheetTupperForm(null);
}
function sheetTupperForm(id){
  const t=id?S.tuppers.find(x=>x.id===id):null;
  openSheet(`<h3>${ic('🥡')} ${t?'Editar tupper':'Guardar un tupper'}</h3>
  <label for="t-name">¿Qué comida tiene?</label><input id="t-name" value="${t?esc(t.name):''}" placeholder="Ej. Arroz con pollo">
  <div class="row"><div><label for="t-prep">Fecha de preparación</label><input id="t-prep" type="date" value="${t?t.prep:''}" max="${today()}"></div>
  <div><label for="t-safe">Consumir antes de</label><input id="t-safe" type="date" value="${t?t.safe:''}"></div></div>
  <div class="chips" style="margin:8px 0"><button class="chip" data-act="tupDate" data-k="hoy">Lo preparé hoy</button><button class="chip" data-act="tupDate" data-k="ayer">Ayer</button><button class="chip" data-act="tupDate" data-k="3d">Sugerir +3 días</button></div>
  <p class="sub">La sugerencia de 3 días es una orientación general para comida cocinada en refri; ajustala según el alimento. No es una garantía.</p>
  <div class="row"><div><label>Porciones</label><div class="step"><button data-act="step" data-t="t-total" data-d="-1">−</button><input id="t-total" type="number" min="1" value="${t?t.total:1}"><button data-act="step" data-t="t-total" data-d="1">＋</button></div></div>
  <div><label for="t-place">¿Dónde lo guardás?</label><select id="t-place"><option value="fridge" ${!t||t.place==='fridge'?'selected':''}>Refri</option><option value="freezer" ${t&&t.place==='freezer'?'selected':''}>Congelador</option></select></div></div>
  <div class="acts-row"><button class="btn" data-act="tupSave" data-id="${id||''}">Guardar tupper</button></div>`);
  if(!t)setTimeout(()=>$('#t-name')&&$('#t-name').focus(),50);
}
function unitSel(u){return `<label for="f-unit">Unidad de medida</label><select id="f-unit">${UNITS.map(x=>`<option ${x===(u||'unid.')?'selected':''}>${x}</option>`).join('')}</select>`}
function histHTML(id){
  const mv=S.moves.filter(m=>m.item===id).slice(-8).reverse();
  return `<h4>Historial de consumo y reposición</h4>${mv.length?mv.map(m=>`<div class="li"><span class="tag ${m.d<0?'r':'g'}">${m.d>0?'+':''}${m.d} ${esc(m.u||'')}</span><div class="t"><b>${m.k==='alta'?'Agregado':m.k==='consumo'?'Consumo':'Reposición'}</b><small>${fmtAt(m.at)} · quedó en ${m.q}</small></div></div>`).join(''):'<p class="sub">Aún no hay movimientos.</p>'}`;
}
function sheetSync(){
  const n=SYNC.queue.length,off=navigator.onLine===false;
  const txt=SYNC.state==='ok'?'Tus datos se guardan en la base de datos de esta casita y se sincronizan entre tus dispositivos.':SYNC.state==='connecting'?'Conectando con la base de datos…':'En este momento los datos solo se están guardando en este aparato. Cuando la base de datos esté disponible se suben solos.';
  openSheet(`<h3>☁️ Guardado y sincronización</h3><p>${txt}</p>
  <div class="chips"><span class="chip ${off?'no':'ok'}">${off?'Sin conexión':'Con conexión'}</span><span class="chip">${n?n+' cambio'+(n>1?'s':'')+' por sincronizar':'Nada pendiente'}</span></div>
  <p class="sub" style="margin-top:10px">El internet de la casita virtual es solo un dibujo: aunque esté "cortado", la aplicación sigue guardando y sincronizando normalmente.</p>
  <div class="acts-row"><button class="btn ghost" data-act="syncNow">Sincronizar ahora</button></div>`);
}

/* ---------- acciones nuevas ---------- */
function restoreFx(k,was){
  const now=svcState(k).on;
  if(!was&&now){FX={svc:k,t:Date.now()};setTimeout(()=>{const r=$('.room');r&&r.classList.remove('fx-'+k)},2700);
    toast(k==='luz'?'¡Volvió la luz a tu casita! ✨':k==='net'?'¡Internet reconectado en tu casita! 📶':'¡Volvió el agua a tu casita! 💧');PETS.cheer()}
}
function casaAct(a,d,el,px,py){
  const v=id=>$('#'+id);
  switch(a){
    case 'isoClose':ISO.closeFridge();return true;
    case 'bills':sheetBills();return true;
    case 'svc':sheetSvc(d.svc);return true;
    case 'tap':{const s=svcState('agua');if(!s.on){toast('No sale agua en la casita: hay un recibo de agua vencido 🚰');sheetSvc('agua')}else{const r=el.closest('.room');r.classList.add('run-tap');clearTimeout(r._tp);r._tp=setTimeout(()=>r.classList.remove('run-tap'),2400);if(!s.has)setTimeout(()=>sheetSvc('agua'),700);else if(s.next)toast(`Agua al día · próximo recibo vence ${inDays(s.d)}`);else toast('El agua corre bien 💧')}}return true;
    case 'billAdd':{
      const amt=parseFloat(v('b-amount').value),due=v('b-due').value;
      if(!(amt>0)){toast('Escribí el monto del recibo');v('b-amount').focus();return true}
      if(!due){toast('Falta la fecha de vencimiento: registrala para poder avisarte');v('b-due').focus();return true}
      const was=svcState(d.svc).on;
      S.bills.push({id:uid(),svc:d.svc,amount:amt,due,note:v('b-note').value.trim(),paid:null,created:today()});save();render();sheetSvc(d.svc);
      toast(was&&!svcState(d.svc).on?'Recibo guardado. Ya estaba vencido: se cortó en la casita':'Recibo guardado 🧾');
    }return true;
    case 'billDel':{const b=S.bills.find(x=>x.id===d.id);if(!b)return true;const was=svcState(b.svc).on;S.bills=S.bills.filter(x=>x.id!==d.id);save();restoreFx(b.svc,was);render();sheetSvc(b.svc)}return true;
    case 'payAsk':sheetPay(d.id);return true;
    case 'payOk':{
      const b=S.bills.find(x=>x.id===d.id);if(!b)return true;
      const at=v('p-at').value,amt=parseFloat(v('p-amount').value);
      if(!at){toast('Poné la fecha en que pagaste');return true}
      if(!(amt>=0)){toast('Poné el monto pagado');return true}
      const was=svcState(b.svc).on;
      b.paid={at,amount:amt};award(5,px,py);save();closeSheet();if(b.svc==='agua')tab='bano';else if(b.svc==='net'||!ROOMS[tab]||tab==='jardin')tab='sala';
      restoreFx(b.svc,was);render();if(was)toast('Pago registrado ✅');
    }return true;
    case 'payUndo':{const b=S.bills.find(x=>x.id===d.id);if(b){b.paid=null;save();render();sheetSvc(b.svc);toast('Pago deshecho')}}return true;
    case 'outStart':{const st=v('o-start').value;if(!st){toast('Poné desde cuándo');return true}S.outages.push({id:uid(),svc:d.svc,start:st,end:null});save();render();sheetSvc(d.svc);toast(d.svc==='luz'?'Corte real anotado. Mantené la refri cerrada':'Corte real anotado')}return true;
    case 'outEnd':{const o=S.outages.find(x=>x.id===d.id);if(o){const was=svcState(o.svc).on;o.end=today();save();closeSheet();restoreFx(o.svc,was);render();if(o.svc==='luz')toast('Anotado. Revisá los alimentos de la refri antes de consumirlos')}}return true;
    case 'tupNew':sheetTupperForm(null);return true;
    case 'tupOpen':sheetTupper(d.id);return true;
    case 'tupEdit':sheetTupperForm(d.id);return true;
    case 'tupDate':{const p=v('t-prep'),s=v('t-safe');if(d.k==='hoy')p.value=today();else if(d.k==='ayer')p.value=addDays(-1);else{if(!p.value){toast('Primero poné la fecha de preparación');return true}const [y,m,dd]=p.value.split('-').map(Number);const t=new Date(y,m-1,dd+3);s.value=fmt(t)}}return true;
    case 'tupSave':{
      const name=v('t-name').value.trim(),prep=v('t-prep').value,safe=v('t-safe').value,total=Math.max(1,Math.round(+v('t-total').value||1));
      if(!name){toast('Escribí qué comida tiene');return true}
      if(!prep){toast('Falta la fecha de preparación');v('t-prep').focus();return true}
      if(!safe){toast('Falta la fecha para consumirlo');v('t-safe').focus();return true}
      if(safe<prep){toast('La fecha para consumirlo no puede ser antes de prepararlo');return true}
      let t=d.id?S.tuppers.find(x=>x.id===d.id):null;const at=new Date().toISOString();
      if(t){const used=t.total-t.left;t.name=name;t.prep=prep;t.safe=safe;t.total=Math.max(total,1);t.left=Math.max(0,t.total-used);t.place=v('t-place').value;t.log.push({a:'Editado',at})}
      else S.tuppers.push({id:uid(),name,prep,safe,total,left:total,place:v('t-place').value,status:'activo',log:[{a:`Guardado con ${total} porci${total===1?'ón':'ones'}`,at}]});
      save();closeSheet();if(tab!=='casa')tab='cocina';furn='fridge';render();toast('Tupper guardado en la refri 🥡');
    }return true;
    case 'tupEat':{const t=S.tuppers.find(x=>x.id===d.id);if(!t||t.left<=0)return true;t.left--;t.log.push({a:'Se comió 1 porción',at:new Date().toISOString()});
      if(t.left===0){t.status='terminado';t.log.push({a:'Se terminó',at:new Date().toISOString()})}award(1,px,py);save();render();if(t.left===0){closeSheet();toast(`Se terminó el tupper de ${t.name}`)}else sheetTupper(t.id)}return true;
    case 'tupEnd':{const t=S.tuppers.find(x=>x.id===d.id);if(!t)return true;t.status=d.st;t.log.push({a:d.st==='terminado'?'Se terminó':'Se desechó',at:new Date().toISOString()});save();closeSheet();render();toast(d.st==='terminado'?'Tupper terminado':'Tupper desechado')}return true;
    case 'addOne':{const it=itemById(d.id);if(it){it.qty=(+it.qty||0)+1;save();closeSheet();render();toast(`Repusiste 1 ${it.name.toLowerCase()}`)}}return true;
    case 'petTap':PETS.tap(d.dog,el);return true;
    case 'syncInfo':sheetSync();return true;
    case 'syncNow':flush();syncBadge();closeSheet();toast(SYNC.db?'Sincronizando…':'La base de datos no está disponible en este momento');return true;
    case 'askClear':openSheet(`<h3>¿Vaciar el inventario?</h3><p class="sub">Se borran todos los productos, los tuppers y la lista de compras de todos tus dispositivos. Los recibos y pagos se conservan. No se puede deshacer.</p><div class="acts-row"><button class="btn berry" data-act="clearOk">Sí, vaciar</button><button class="btn ghost" data-act="closeSheet">Cancelar</button></div>`);return true;
    case 'clearOk':S.items=[];S.shop=[];S.tuppers=[];save();closeSheet();render();toast('Inventario vacío');return true;
    case 'laundry':{const sv=svcAll();if(!sv.luz.on){toast('Sin luz la lavadora no arranca ⚡');return true}if(!sv.agua.on){toast('Sin agua la lavadora no puede lavar 🚰');return true}return false}
    case 'alertGo':if(d.svc)sheetSvc(d.svc);else if(d.tup){sheetTupper(d.tup)}return true;
  }
  return false;
}
