/* ---------- perros (dibujo propio, según las hojas de personaje) ---------- */
function dogSVG(kind){
  const R=kind==='rosco';
  const c=R?{b:'#F2B868',sh:'#E3A04C',cr:'#FCE6BD',ear:'#EFAF5E',ein:'#F7B9A8',col:'#8E9463',cd:'#6F7548'}
           :{b:'#EDA549',sh:'#D98A34',cr:'#FCE8C4',ear:'#CF7C2E',ein:'#F7B9A8',col:'#B99AD9',cd:'#9478BA'};
  const o='#7A4014';
  const st=`stroke="${o}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"`;
  const mir=s=>s+`<g transform="translate(200,0) scale(-1,1)">${s}</g>`;
  const bone=`<g transform="translate(100,139)"><g fill="#FCE9BE" ${st} stroke-width="2.4"><circle cx="-10" cy="-4" r="4.6"/><circle cx="-10" cy="4" r="4.6"/><circle cx="10" cy="-4" r="4.6"/><circle cx="10" cy="4" r="4.6"/></g>
    <rect x="-10" y="-5" width="20" height="10" fill="#FCE9BE"/><path d="M-7 -5H7M-7 5H7" ${st} stroke-width="2.4"/><path d="M-5 0H5" stroke="${o}" stroke-width="1.6" stroke-linecap="round" opacity=".55"/></g>`;
  const toes=x=>`<path d="M${x-4} 205V210M${x+4} 205V210" stroke="${o}" stroke-width="2" stroke-linecap="round"/>`;
  /* cuerpo: Rosco es esbelto y alto, Mali es redondita */
  const body=R
    ?`<path d="M66 204C58 162 70 118 100 114C130 118 142 162 134 204Z" fill="${c.b}" ${st}/>
      <ellipse cx="66" cy="194" rx="17" ry="21" fill="${c.b}" ${st}/><ellipse cx="134" cy="194" rx="17" ry="21" fill="${c.b}" ${st}/>
      <path d="M86 126C87 160 91 190 100 200C109 190 113 160 114 126Z" fill="${c.cr}"/>`
    :`<path d="M56 204C44 158 62 112 100 110C138 112 156 158 144 204Z" fill="${c.b}" ${st}/>
      <ellipse cx="60" cy="192" rx="22" ry="24" fill="${c.b}" ${st}/><ellipse cx="140" cy="192" rx="22" ry="24" fill="${c.b}" ${st}/>
      <path d="M78 122C80 160 86 192 100 202C114 192 120 160 122 122Z" fill="${c.cr}"/>`;
  const legs=`<rect x="80" y="${R?150:160}" width="18" height="${R?56:46}" rx="9" fill="${R?c.b:c.cr}" ${st}/><rect x="102" y="${R?150:160}" width="18" height="${R?56:46}" rx="9" fill="${R?c.b:c.cr}" ${st}/>
    <ellipse cx="88" cy="207" rx="13.5" ry="8" fill="${c.cr}" ${st}/><ellipse cx="112" cy="207" rx="13.5" ry="8" fill="${c.cr}" ${st}/>${toes(88)}${toes(112)}
    ${mir(`<ellipse cx="${R?60:54}" cy="209" rx="13" ry="7" fill="${c.cr}" ${st}/>`)}`;
  const tail=R
    ?`<path d="M136 200C160 200 176 180 170 152C168 146 160 148 161 154C163 170 152 182 134 184Z" fill="${c.b}" ${st}/>`
    :`<path d="M144 198C172 196 186 170 176 142C173 136 165 139 166 146C168 162 160 176 140 180Z" fill="${c.b}" ${st}/><path d="M176 142C173 136 165 139 166 146C167 152 170 156 174 157C178 153 178 147 176 142Z" fill="${c.cr}" ${st}/>`;
  const head=R
    ?`${mir(`<path d="M74 56C64 42 59 26 57 14C74 20 90 32 96 46Z" fill="${c.ear}" ${st}/><path d="M73 48C68 40 65 31 64 24C73 29 82 36 87 44Z" fill="${c.ein}"/>`)}
      <path d="M100 38C76 38 62 54 62 74C62 96 78 114 100 114C122 114 138 96 138 74C138 54 124 38 100 38Z" fill="${c.b}" ${st}/>
      <path d="M100 76C88 76 80 86 80 96C80 108 89 114 100 114C111 114 120 108 120 96C120 86 112 76 100 76Z" fill="${c.cr}" opacity=".75"/>`
    :`<path d="M100 34C72 34 54 52 54 76C54 98 74 114 100 114C126 114 146 98 146 76C146 52 128 34 100 34Z" fill="${c.b}" ${st}/>
      <path d="M100 44C95 56 94 68 90 76C80 80 76 90 78 98C82 110 92 113 100 113C108 113 118 110 122 98C124 90 120 80 110 76C106 68 105 56 100 44Z" fill="${c.cr}"/>
      ${mir(`<path d="M66 44C44 42 30 62 32 92C33 110 46 118 56 108C64 98 60 76 70 58C72 52 70 46 66 44Z" fill="${c.ear}" ${st}/><path d="M40 84Q42 100 50 104" stroke="${c.sh}" stroke-width="3" fill="none" stroke-linecap="round" opacity=".6"/>`)}
      <path d="M80 44Q90 38 100 44" stroke="${c.sh}" stroke-width="3" fill="none" stroke-linecap="round" opacity=".5"/>`;
  const ey=R?74:78,ex=R?17:20,er=R?[5.6,6.6]:[7,8];
  const face=`${mir(`<ellipse cx="${100-ex-9}" cy="${ey+15}" rx="7.5" ry="4.6" fill="#F7A59B" opacity=".6"/>`)}
    <g class="eyes" style="transform-origin:100px ${ey}px">${mir(`<ellipse cx="${100-ex}" cy="${ey}" rx="${er[0]}" ry="${er[1]}" fill="#3A1E12"/><circle cx="${100-ex+2}" cy="${ey-3}" r="${R?2:2.6}" fill="#fff"/><circle cx="${100-ex-2}" cy="${ey+3}" r="1.1" fill="#fff" opacity=".8"/>`)}</g>
    ${mir(`<path d="M${100-ex-7} ${ey-12}Q${100-ex} ${ey-16} ${100-ex+6} ${ey-13}" stroke="${o}" stroke-width="2.2" fill="none" stroke-linecap="round" opacity=".7"/>`)}
    <path d="M86 ${ey+19}Q100 ${ey+25} 114 ${ey+19}Q113 ${ey+35} 100 ${ey+35}Q87 ${ey+35} 86 ${ey+19}Z" fill="#7C2A22" ${st} stroke-width="2.4"/>
    <path d="M93 ${ey+25}Q100 ${ey+22} 107 ${ey+25}V${ey+33}Q107 ${ey+42} 100 ${ey+42}Q93 ${ey+42} 93 ${ey+33}Z" fill="#F7919B" stroke="#C4566A" stroke-width="2" stroke-linejoin="round"/>
    <path d="M100 ${ey+27}V${ey+36}" stroke="#C4566A" stroke-width="1.6" stroke-linecap="round"/>
    <path d="M100 ${ey+12}V${ey+18}M100 ${ey+18}Q92 ${ey+23} 85 ${ey+18}M100 ${ey+18}Q108 ${ey+23} 115 ${ey+18}" stroke="${o}" stroke-width="2.4" fill="none" stroke-linecap="round"/>
    <path d="M91 ${ey+8}C91 ${ey+4} 109 ${ey+4} 109 ${ey+8}C109 ${ey+13} 104 ${ey+16} 100 ${ey+16}C96 ${ey+16} 91 ${ey+13} 91 ${ey+8}Z" fill="#3A1E12"/><ellipse cx="97" cy="${ey+8}" rx="3" ry="1.4" fill="#fff" opacity=".55"/>`;
  return `<svg viewBox="0 0 200 230" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <ellipse cx="100" cy="218" rx="${R?58:66}" ry="8" fill="#F5A79B" opacity=".45"/>
  <g class="tail">${tail}</g>
  ${body}${legs}
  <g class="head">${head}${face}</g>
  <path d="M${R?76:70} ${R?112:114}Q100 ${R?126:130} ${R?124:130} ${R?112:114}L${R?124:130} ${R?123:125}Q100 ${R?137:141} ${R?76:70} ${R?123:125}Z" fill="${c.col}" stroke="${o}" stroke-width="2.6" stroke-linejoin="round"/>
  <circle cx="100" cy="${R?131:134}" r="3" fill="#D9DDE2" stroke="${o}" stroke-width="1.8"/>
  ${bone}
  <g class="hearts"><path d="M46 56c-6-8-18 0-8 10l8 7 8-7c10-10-2-18-8-10Z" fill="#F0606A" stroke="${o}" stroke-width="2"/><path d="M150 40c-5-7-15 0-7 8l7 6 7-6c8-8-2-15-7-8Z" fill="#FFD36B" stroke="${o}" stroke-width="2"/><path d="M100 14c-4-6-13 0-6 7l6 5 6-5c7-7-2-13-6-7Z" fill="#F0606A" stroke="${o}" stroke-width="2"/></g>
  </svg>`;
}
