function kitchenSVG(sel){
  const c=k=>sel===k?' sel':'';
  const S3=`stroke="${OUT}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"`;
  const S2=`stroke="${OUT}" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"`;
  const sb=(x,y,s)=>`<use href="#sbk" transform="translate(${x},${y}) scale(${s})"/>`;
  let berries='';for(let i=0;i<9;i++)berries+=sb(8+i*40,i%2?13:8,.85)+`<path d="M${30+i*40} ${i%2?16:21}q5 -6 10 -1q-5 5 -10 1Z" fill="#8DB05A" stroke="#4F6B2E" stroke-width="1.2"/>`;
  const dots=(xs,y1,y2)=>xs.map((x,i)=>`<circle cx="${x}" cy="${i%2?y1:y2}" r="1.7" fill="#E4574B"/>`).join('');
  let planks='';for(let i=1;i<9;i++)planks+=`M${i*40+(i%2?6:-8)} 286V304`;
  const tag=(cx,cy,t)=>`<g class="ktag"><rect x="${cx-30}" y="${cy-9}" width="60" height="18" rx="9" stroke="${OUT}" stroke-width="2.2"/><text x="${cx}" y="${cy+4}" text-anchor="middle">${t}</text></g>`;
  const glow=(x,y,w,h,r)=>`<rect class="glow" x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="none" stroke="var(--terra)" stroke-width="3.5" stroke-dasharray="7 6"/>`;
  const door=(x)=>`<rect x="${x}" y="210" width="72" height="68" rx="7" fill="#FFF3D6" ${S3}/><rect x="${x+9}" y="219" width="54" height="50" rx="6" fill="none" stroke="${OUT}" stroke-width="2" opacity=".55"/>`;
  const spice=(x,w,h,f,lid)=>`<rect x="${x+2}" y="${121-h-5}" width="${w-4}" height="7" rx="2.5" fill="${lid}" ${S2}/><rect x="${x}" y="${121-h}" width="${w}" height="${h}" rx="4.5" fill="${f}" ${S2}/><rect x="${x+3}" y="${121-h+4}" width="2.6" height="${h-9}" rx="1.3" fill="#fff" opacity=".75"/>`;
  return `<svg viewBox="0 0 360 304" class="kscene" role="img" aria-label="Tu cocina: toca el refri, el especiero o la alacena">
  <defs>
    <g id="sbk"><path d="M10 21C3 18 0 10 4 6C8 4 12 4 16 6C20 10 17 18 10 21Z" fill="#E4574B" stroke="#7A3A2A" stroke-width="1.7" stroke-linejoin="round"/><path d="M4 6L10 2L16 6L10 8.5Z" fill="#8DB05A" stroke="#4F6B2E" stroke-width="1.3" stroke-linejoin="round"/><circle cx="7" cy="12" r="1" fill="#FFE3C0"/><circle cx="12.5" cy="11" r="1" fill="#FFE3C0"/><circle cx="10" cy="16" r="1" fill="#FFE3C0"/><path d="M6 8.5Q8 7 9 8" stroke="#fff" stroke-width="1" fill="none" opacity=".7"/></g>
    <pattern id="tiles" width="22" height="22" patternUnits="userSpaceOnUse"><rect width="22" height="22" fill="var(--tile)"/><path d="M0 0H22M0 0V22" stroke="var(--tile-l)" stroke-width="2"/></pattern>
    <pattern id="wdots" width="26" height="26" patternUnits="userSpaceOnUse"><circle cx="6" cy="7" r="1.6" fill="#fff" opacity=".45"/><circle cx="19" cy="20" r="1.6" fill="#fff" opacity=".45"/></pattern>
  </defs>
  <rect width="360" height="304" fill="var(--wallp)"/><rect width="360" height="304" fill="url(#wdots)"/>
  <rect x="84" y="118" width="276" height="76" fill="url(#tiles)"/><path d="M84 118H360" stroke="${OUT}" stroke-width="2.4"/>
  <path d="M0 24Q20 16 40 24T80 24T120 24T160 24T200 24T240 24T280 24T320 24T360 24" stroke="#8DB05A" stroke-width="2.4" fill="none"/>
  ${berries}
  <rect y="284" width="360" height="20" fill="var(--wood)"/><path d="M0 284H360${planks}" stroke="${OUT}" stroke-width="2.6"/>

  <!-- campana -->
  <rect x="120" y="30" width="38" height="26" fill="#F2A096" ${S3}/>
  <path d="M112 54H166L190 96H88Z" fill="#F7B3A9" ${S3}/>
  <path d="M86 96H192V104${scal(86,106,104,9,7)}Z" fill="#F29C92" ${S3}/>
  ${sb(126,60,1.35)}
  <path d="M98 90L116 60" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".45"/>

  <!-- ventana -->
  <rect x="204" y="44" width="74" height="82" rx="5" fill="#CFEAF2" ${S3}/>
  <path d="M207 122C212 100 228 98 236 110C244 92 266 96 275 122Z" fill="#A9CF86"/><circle cx="222" cy="62" r="7" fill="#fff" opacity=".7"/><circle cx="232" cy="66" r="5" fill="#fff" opacity=".7"/>
  <path d="M241 44V126M204 84H278" stroke="${OUT}" stroke-width="3"/>
  <path d="M207 92H275V112${scal(207,68,112,8,6)}Z" fill="#FFF6E2" ${S2}/>${dots([216,228,240,252,264],100,106)}
  <g class="curt"><path d="M198 36H284V50${scal(198,86,50,9,9)}Z" fill="#FFF6E2" ${S3}/><path d="M198 44H284" stroke="#F29C92" stroke-width="2"/>${dots([208,224,241,258,274],51,48)}</g>
  <rect x="198" y="124" width="86" height="8" rx="3.5" fill="#FFF6E2" ${S3}/>

  <!-- encimera, estufa y horno -->
  <rect x="190" y="190" width="170" height="13" rx="3" fill="var(--wood)" ${S3}/>
  <rect x="90" y="200" width="100" height="84" rx="8" fill="#FFF3D6" ${S3}/>
  <rect x="86" y="188" width="108" height="13" rx="4" fill="#FFF6E2" ${S3}/>
  <path d="M100 189H134M146 189H180" stroke="${OUT}" stroke-width="4.5" stroke-linecap="round"/>
  <rect x="90" y="201" width="100" height="18" fill="#F7B3A9" ${S3}/>
  ${[104,121,140,159,176].map(x=>`<circle cx="${x}" cy="210" r="5" fill="#E4574B" ${S2}/><path d="M${x} 207V210" stroke="#FFE3D0" stroke-width="1.6" stroke-linecap="round"/>`).join('')}
  <rect x="100" y="230" width="80" height="36" rx="7" fill="#DCE5C2" ${S3}/>${sb(128,235,1.25)}
  <path d="M106 236L116 246" stroke="#fff" stroke-width="2.6" stroke-linecap="round" opacity=".7"/>
  <rect x="98" y="223" width="84" height="6" rx="3" fill="#E9B98F" ${S2}/>
  <path d="M90 271H190" stroke="${OUT}" stroke-width="2.6"/><rect x="90" y="272" width="100" height="12" rx="4" fill="#F7B3A9" ${S3}/>

  <!-- olla y tetera -->
  <g><path class="stm" d="M112 148Q107 142 112 136" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round"/><path class="stm stm2" d="M126 148Q121 142 126 136" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round"/>
  <circle cx="119" cy="153" r="4.5" fill="#FFD36B" ${S2}/><rect x="94" y="157" width="50" height="9" rx="4.5" fill="#F2766A" ${S3}/>
  <rect x="97" y="165" width="44" height="23" rx="7" fill="#E4574B" ${S3}/>${dots([106,116,126,134],181,173)}
  <rect x="89" y="170" width="9" height="7" rx="3" fill="#E4574B" ${S2}/><rect x="140" y="170" width="9" height="7" rx="3" fill="#E4574B" ${S2}/></g>
  <g><path d="M155 176Q147 174 147 165" stroke="${OUT}" stroke-width="7.5" fill="none" stroke-linecap="round"/><path d="M155 176Q147 174 147 165" stroke="#F2766A" stroke-width="3" fill="none" stroke-linecap="round"/>
  <path d="M180 170Q191 170 189 179Q187 185 180 183" fill="none" ${S3}/>
  <ellipse cx="168" cy="176" rx="14.5" ry="12" fill="#E4574B" ${S3}/><rect x="161" y="161" width="14" height="6" rx="3" fill="#F2766A" ${S2}/><circle cx="168" cy="159" r="2.6" fill="#FFD36B" ${S2}/>
  ${dots([162,170,175],172,180)}</g>

  <!-- fregadero y maceta -->
  <rect x="226" y="188" width="50" height="9" rx="3" fill="#B9CDB0" ${S2}/>
  <path d="M252 189V170Q252 160 262 160Q270 160 270 168" fill="none" stroke="${OUT}" stroke-width="7" stroke-linecap="round"/><path d="M252 189V170Q252 160 262 160Q270 160 270 168" fill="none" stroke="#C9CED6" stroke-width="3" stroke-linecap="round"/>
  <rect x="244" y="182" width="16" height="6" rx="3" fill="#C9CED6" ${S2}/>
  <g><path d="M210 168Q206 150 214 144M214 168Q216 152 224 148M212 168Q208 158 202 156" stroke="#5E8A3A" stroke-width="2.4" fill="none" stroke-linecap="round"/>
  <ellipse cx="214" cy="144" rx="6" ry="4" fill="#8DB05A" ${S2}/><ellipse cx="225" cy="149" rx="5.5" ry="3.6" fill="#8DB05A" ${S2}/><ellipse cx="202" cy="156" rx="5" ry="3.4" fill="#8DB05A" ${S2}/>
  ${sb(214,152,.6)}${sb(200,160,.5)}
  <path d="M202 168H224L221 189H205Z" fill="#D9A066" ${S3}/><rect x="200" y="165" width="26" height="6" rx="3" fill="#E7B47A" ${S2}/></g>
  <g><ellipse cx="338" cy="180" rx="13" ry="10.5" fill="#E4574B" ${S3}/><path d="M330 171L338 166L346 171L338 174Z" fill="#8DB05A" ${S2}/></g>

  <g class="piece${c('fridge')}" data-act="furn" data-k="fridge" role="button" aria-label="Refri">
    <rect x="12" y="278" width="10" height="8" rx="2" fill="#E9B98F" ${S2}/><rect x="62" y="278" width="10" height="8" rx="2" fill="#E9B98F" ${S2}/>
    <rect x="6" y="66" width="76" height="216" rx="17" fill="#FFF3D6" ${S3}/>
    <path d="M6 130H82" stroke="${OUT}" stroke-width="3"/>
    <rect x="67" y="84" width="7" height="30" rx="3.5" fill="#C9CED6" ${S2}/><rect x="67" y="144" width="7" height="46" rx="3.5" fill="#C9CED6" ${S2}/>
    <rect x="13" y="76" width="5" height="42" rx="2.5" fill="#fff" opacity=".85"/><rect x="13" y="140" width="5" height="70" rx="2.5" fill="#fff" opacity=".85"/>
    ${sb(18,172,2.6)}${sb(34,90,1)}
    ${glow(2,62,84,224,19)}${tag(44,293,'Refri')}
  </g>

  <g class="piece${c('spice')}" data-act="furn" data-k="spice" role="button" aria-label="Especiero">
    <rect x="286" y="34" width="74" height="126" rx="10" fill="transparent"/>
    <path d="M296 62H324Q324 76 310 76Q296 76 296 62Z" fill="#FFF6E2" ${S2}/><path d="M298 50H322Q322 62 310 62Q298 62 298 50Z" fill="#FFF6E2" ${S2}/>
    <path d="M302 55q4 3 8 0q4 3 8 0" stroke="#E4574B" stroke-width="1.8" fill="none" stroke-linecap="round"/><path d="M301 68q4 3 9 0q5 3 9 0" stroke="#E4574B" stroke-width="1.8" fill="none" stroke-linecap="round"/>
    <rect x="331" y="46" width="20" height="7" rx="3" fill="#F3D27A" ${S2}/><rect x="329" y="52" width="24" height="24" rx="5" fill="#FBE7A6" ${S2}/>${sb(334,56,.7)}
    <rect x="290" y="76" width="68" height="8" rx="3.5" fill="var(--wood)" ${S3}/>
    <path d="M298 84V94L307 84M350 84V94L341 84" fill="var(--wood)" ${S2}/>
    ${spice(294,13,22,'#F6B5AE','#E4574B')}${spice(310,13,18,'#CBE9D6','#7FA050')}${spice(326,13,24,'#FFE3A0','#8E6BC0')}${spice(342,12,19,'#E8DCF4','#E4574B')}
    <rect x="290" y="121" width="68" height="8" rx="3.5" fill="var(--wood)" ${S3}/>
    ${glow(286,36,72,100,12)}${tag(322,146,'Especiero')}
  </g>

  <g class="piece${c('pantry')}" data-act="furn" data-k="pantry" role="button" aria-label="Alacena">
    <rect x="196" y="203" width="160" height="81" rx="6" fill="#FBE3B8" ${S3}/>
    ${door(201)}${door(279)}
    ${sb(260,236,.62)}${sb(282,236,.62)}
    ${glow(192,198,168,90,12)}${tag(276,293,'Alacena')}
  </g>
  </svg>`;
}
