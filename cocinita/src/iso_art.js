/* =====================================================================
   ARTE ISOMÉTRICO: cada mueble es una ilustración vectorial propia
   (caras con luz y sombra, texturas, contorno) que se convierte en un
   sprite independiente. Este archivo no sabe nada del inventario.
   ===================================================================== */
const ISO_ART=(()=>{
  const U=64,A=U*.9,B=U*.45,INKC='#6B3A1E';
  const pr=(x,y,z)=>[(x-y)*A,(x+y)*B-(z||0)*U];
  function shade(hex,k){const n=parseInt(hex.slice(1),16),f=c=>Math.max(0,Math.min(255,Math.round(k>0?c+(255-c)*k:c*(1+k))));
    return '#'+[n>>16,n>>8&255,n&255].map(c=>f(c).toString(16).padStart(2,'0')).join('')}
  const r1=n=>Math.round(n*10)/10;
  class G{
    constructor(){this.s=[];this.bb=[1e9,1e9,-1e9,-1e9]}
    _d(pts,close){return pts.map((p,i)=>{const q=pr(p[0],p[1],p[2]);if(q[0]<this.bb[0])this.bb[0]=q[0];if(q[1]<this.bb[1])this.bb[1]=q[1];if(q[0]>this.bb[2])this.bb[2]=q[0];if(q[1]>this.bb[3])this.bb[3]=q[1];return(i?'L':'M')+r1(q[0])+' '+r1(q[1])}).join('')+(close===false?'':'Z')}
    /* polígono en coordenadas de mundo. o: {stroke,sw,op,lit,dash,nofill,filter} */
    poly(pts,fill,o){o=o||{};const d=this._d(pts,o.open?false:true);
      const st=o.stroke==='none'?'':` stroke="${o.stroke||INKC}" stroke-width="${o.sw||2.4}" stroke-linejoin="round" stroke-linecap="round"${o.dash?` stroke-dasharray="${o.dash}"`:''}`;
      this.s.push(`<path d="${d}" fill="${o.open?'none':fill}"${st}${o.op!=null?` opacity="${o.op}"`:''}${o.filter?` filter="url(#${o.filter})"`:''}/>`);
      if(o.lit)this.s.push(`<path d="${d}" fill="url(#${o.lit===true?'lv':o.lit})"/>`);return this}
    /* superficie paramétrica: punto(u,v)=o+a*u+b*v */
    P(S,u,v){return[S.o[0]+S.a[0]*u+S.b[0]*v,S.o[1]+S.a[1]*u+S.b[1]*v,S.o[2]+S.a[2]*u+S.b[2]*v]}
    rect(S,u0,v0,u1,v1,fill,o){return this.poly([this.P(S,u0,v0),this.P(S,u1,v0),this.P(S,u1,v1),this.P(S,u0,v1)],fill,o)}
    pts(S,arr,fill,o){return this.poly(arr.map(p=>this.P(S,p[0],p[1])),fill,o)}
    disc(S,u,v,ru,rv,fill,o){const a=[];for(let i=0;i<28;i++){const t=i/28*Math.PI*2;a.push([u+Math.cos(t)*ru,v+Math.sin(t)*rv])}return this.pts(S,a,fill,o)}
    line(S,arr,stroke,sw,o){return this.poly(arr.map(p=>this.P(S,p[0],p[1])),'none',Object.assign({open:true,stroke:stroke||INKC,sw:sw||2},o||{}))}
    berry(S,u,v,ru,rv,o){const m=(a,k)=>a.map(p=>[u+p[0]*ru*(k||1),v+p[1]*rv*(k||1)]);
      this.pts(S,m([[0,-1],[-.5,-.8],[-.9,-.25],[-.95,.2],[-.7,.52],[-.3,.62],[0,.5],[.3,.62],[.7,.52],[.95,.2],[.9,-.25],[.5,-.8]]),'#E4574B',Object.assign({sw:2},o||{}));
      this.pts(S,m([[-.55,.5],[-.25,.95],[0,.66],[.25,.95],[.55,.5],[0,.34]]),'#8DB05A',{sw:1.6,stroke:'#4F6B2E'});
      [[-.4,.05],[.1,.12],[.45,-.1],[-.1,-.38],[.3,-.5],[-.45,-.42]].forEach(q=>this.disc(S,u+q[0]*ru,v+q[1]*rv,ru*.07,rv*.09,'#FFE3C0',{stroke:'none'}));
      this.line(S,m([[-.62,.3],[-.5,.42],[-.3,.46]]),'#fff',1.8,{op:.7});return this}
    /* prisma recto sobre una huella de 4 puntos: dibuja solo las caras que mira la cámara */
    prism(foot,z0,z1,col,o){o=o||{};const cx=foot.reduce((s,p)=>s+p[0],0)/4,cy=foot.reduce((s,p)=>s+p[1],0)/4,sides=[];
      for(let i=0;i<4;i++){const a=foot[i],b=foot[(i+1)%4];let nx=b[1]-a[1],ny=-(b[0]-a[0]);const mx=(a[0]+b[0])/2,my=(a[1]+b[1])/2;
        if(nx*(mx-cx)+ny*(my-cy)<0){nx=-nx;ny=-ny}const l=Math.hypot(nx,ny)||1;nx/=l;ny/=l;
        if(nx+ny>0.02){const lr=(a[0]-a[1])<(b[0]-b[1]);sides.push({p0:lr?a:b,p1:lr?b:a,nx,ny,dep:mx+my})}}
      sides.sort((s,t)=>s.dep-t.dep);
      const out={sides:[],top:{o:[foot[0][0],foot[0][1],z1],a:[foot[1][0]-foot[0][0],foot[1][1]-foot[0][1],0],b:[foot[3][0]-foot[0][0],foot[3][1]-foot[0][1],0]}};
      const rad=o.r==null?13:o.r;let hull=null;
      if(rad>0){const P=[];foot.forEach(p=>{P.push(pr(p[0],p[1],z0));P.push(pr(p[0],p[1],z1))});hull=this._hull(P);
        const id='c'+(this.n=(this.n||0)+1);this.s.push(`<clipPath id="${id}"><path d="${this._round(hull,rad)}"/></clipPath><g clip-path="url(#${id})">`)}
      const isw=rad>0?1.5:o.sw,ist=rad>0?shade(col,-.3):o.stroke;
      sides.forEach(s=>{const c=o.flat?col:shade(col,-.15*Math.max(0,s.nx)+.03*Math.max(0,s.ny));
        const S={o:[s.p0[0],s.p0[1],z0],a:[s.p1[0]-s.p0[0],s.p1[1]-s.p0[1],0],b:[0,0,z1-z0],nx:s.nx,ny:s.ny};
        this.rect(S,0,0,1,1,o.side||c,{lit:o.lit===false?null:'lv',sw:isw,stroke:ist});out.sides.push(S)});
      if(!o.notop)this.poly(foot.map(p=>[p[0],p[1],z1]),o.top||shade(col,.16),{sw:isw,stroke:ist,lit:o.lit===false?null:'lt'});
      if(rad>0){this.s.push('</g>');this.s.push(`<path d="${this._round(hull,rad)}" fill="none" stroke="${o.stroke||INKC}" stroke-width="${o.sw||3}" stroke-linejoin="round"/>`)}
      return out}
    clipBegin(P3,r){const hull=this._hull(P3.map(p=>pr(p[0],p[1],p[2]))),id='c'+(this.n=(this.n||0)+1);this.s.push(`<clipPath id="${id}"><path d="${this._round(hull,r)}"/></clipPath><g clip-path="url(#${id})">`);return hull}
    clipEnd(hull,r){this.s.push('</g>');this.s.push(`<path d="${this._round(hull,r)}" fill="none" stroke="${INKC}" stroke-width="3" stroke-linejoin="round"/>`)}
    _hull(P){const p=P.slice().sort((a,b)=>a[0]-b[0]||a[1]-b[1]),cr=(o,a,b)=>(a[0]-o[0])*(b[1]-o[1])-(a[1]-o[1])*(b[0]-o[0]),lo=[],up=[];
      p.forEach(q=>{while(lo.length>1&&cr(lo[lo.length-2],lo[lo.length-1],q)<=0)lo.pop();lo.push(q)});
      p.slice().reverse().forEach(q=>{while(up.length>1&&cr(up[up.length-2],up[up.length-1],q)<=0)up.pop();up.push(q)});
      return lo.slice(0,-1).concat(up.slice(0,-1))}
    _round(h,r){const n=h.length;let d='';for(let i=0;i<n;i++){const V=h[i],Pp=h[(i+n-1)%n],N=h[(i+1)%n],l1=Math.hypot(Pp[0]-V[0],Pp[1]-V[1]),l2=Math.hypot(N[0]-V[0],N[1]-V[1]);
      const t1=Math.min(r/l1,.5),t2=Math.min(r/l2,.5),a=[V[0]+(Pp[0]-V[0])*t1,V[1]+(Pp[1]-V[1])*t1],b=[V[0]+(N[0]-V[0])*t2,V[1]+(N[1]-V[1])*t2];
      d+=(i?'L':'M')+r1(a[0])+' '+r1(a[1])+'Q'+r1(V[0])+' '+r1(V[1])+' '+r1(b[0])+' '+r1(b[1])}return d+'Z'}
    box(x,y,z,w,d,h,col,o){const f=this.prism([[x,y],[x+w,y],[x+w,y+d],[x,y+d]],z,z+h,col,o);
      const L=f.sides.find(s=>s.ny>.9),R=f.sides.find(s=>s.nx>.9);return{L,R,T:f.top}}
    /* cilindro vertical */
    cyl(cx,cy,z0,z1,r,col,o){o=o||{};const arc=(t0,t1,z)=>{const a=[];for(let i=0;i<=16;i++){const t=t0+(t1-t0)*i/16;a.push([cx+Math.cos(t)*r,cy+Math.sin(t)*r,z])}return a};
      const q=Math.PI/4;this.poly(arc(-q,3*q,z0).concat(arc(3*q,-q,z1)),col,{lit:'lh',sw:o.sw});
      const top=[];for(let i=0;i<28;i++){const t=i/28*Math.PI*2;top.push([cx+Math.cos(t)*r,cy+Math.sin(t)*r,z1])}
      this.poly(top,o.top||shade(col,.18),{sw:o.sw});return{T:{o:[cx-r,cy-r,z1],a:[2*r,0,0],b:[0,2*r,0]}}}
    shadow(x,y,w,d,op){return this.poly([[x-.05,y+d*.25,0],[x+w+.3,y-.05,0],[x+w+.42,y+d+.2,0],[x+.2,y+d+.42,0]],'#4A2410',{stroke:'none',op:op||.2,filter:'blur'})}
    svg(k){const b=this.bb,p=8,x=b[0]-p,y=b[1]-p,w=b[2]-b[0]+2*p,h=b[3]-b[1]+2*p;
      const defs=`<defs><linearGradient id="lv" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".2"/><stop offset=".55" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#3a1a08" stop-opacity=".13"/></linearGradient>
      <linearGradient id="lt" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".22"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
      <linearGradient id="lh" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity=".28"/><stop offset=".45" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#3a1a08" stop-opacity=".2"/></linearGradient>
      <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#BDE6F5"/><stop offset="1" stop-color="#EAF7EF"/></linearGradient>
      <linearGradient id="sunset" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#CDE9F5"/><stop offset=".55" stop-color="#FDE6C8"/><stop offset="1" stop-color="#F9C9C9"/></linearGradient><linearGradient id="glass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".75"/><stop offset=".5" stop-color="#fff" stop-opacity=".1"/><stop offset="1" stop-color="#fff" stop-opacity=".35"/></linearGradient>
      <linearGradient id="cold" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#DCEFF5"/></linearGradient>
      <radialGradient id="warm"><stop offset="0" stop-color="#FFF3C4" stop-opacity=".95"/><stop offset="1" stop-color="#FFE9A8" stop-opacity="0"/></radialGradient>
      <filter id="blur" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="7"/></filter>
      <filter id="soft" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="14"/></filter></defs>`;
      return{svg:`<svg xmlns="http://www.w3.org/2000/svg" width="${Math.ceil(w*k)}" height="${Math.ceil(h*k)}" viewBox="${r1(x)} ${r1(y)} ${r1(w)} ${r1(h)}">${defs}${this.s.join('')}</svg>`,x,y,w,h}}
  }
  const C={wall:'#F9CEC6',wall2:'#FBE2D2',cream:'#FFF3D9',wood:'#D7A06C',woodD:'#B97E4E',red:'#E4574B',pink:'#F7B3A9',sage:'#A9C58B',mint:'#CDE8D8',sky:'#C8E6F0',butter:'#FFD979',steel:'#D5DCE2',lilac:'#D9C7EF'};
  const H=4.1,WT=.42,SHELL='#A77474',SHELLD='#8C5C5E';
  const wallS=(axis,x,y,len)=>axis==='x'?{o:[x,y,0],a:[len,0,0],b:[0,0,H]}:{o:[x,y+len,0],a:[0,-len,0],b:[0,0,H]};   // 'x': pared a lo largo de x (cara +y); 'y': a lo largo de y (cara +x)
  function tiles(g,S,nu,nv,c1,c2,grout){for(let i=0;i<nu;i++)for(let j=0;j<nv;j++)g.rect(S,i/nu,j/nv,(i+1)/nu,(j+1)/nv,(i+j)%2?c1:c2,{stroke:grout||'#E9C9B6',sw:1.2})}
  function planks(g,S,n,col){for(let i=0;i<n;i++){g.rect(S,0,i/n,1,(i+1)/n,i%2?col:shade(col,.06),{stroke:shade(col,-.22),sw:1.1});const o=(i%2)*.22;[.18+o,.52+o,.84-o].forEach(u=>g.line(S,[[u,i/n],[u,(i+1)/n]],shade(col,-.22),1.1))}}
  function windowOn(g,S,u0,v0,u1,v1,o){o=o||{};const w=u1-u0,hh=v1-v0,arc=(m)=>{const a=[[u0-m*w,v0-m*hh*.4]];for(let i=0;i<=12;i++){const t=Math.PI-(Math.PI*i/12);a.push([u0+w/2+Math.cos(t)*(w/2+m*w),v0+hh*.62+Math.sin(t)*(hh*.38+m*hh*.5)])}a.push([u1+m*w,v0-m*hh*.4]);return a};
    g.disc(S,u0+w/2,v0+hh*.5,w*1.15,hh*.95,'url(#warm)',{stroke:'none',op:.75});
    g.pts(S,arc(.09),'#FFF6E2',{});g.pts(S,arc(0),'url(#sunset)',{});
    g.pts(S,[[u0,v0],[u0+w*.25,v0+hh*.34],[u0+w*.5,v0+hh*.16],[u0+w*.78,v0+hh*.4],[u1,v0]],'#B9DE96',{stroke:'none',op:.9});
    g.pts(S,arc(0),'url(#glass)',{stroke:'none',op:.55});
    g.line(S,[[u0+w/2,v0],[u0+w/2,v1]],INKC,2.2);g.line(S,[[u0,v0+hh*.45],[u1,v0+hh*.45]],INKC,2.2);
    g.line(S,[[u0-w*.2,v1+hh*.1],[u1+w*.2,v1+hh*.1]],'#C98A54',4.5);
    [[u0-w*.2,1],[u1+w*.2,-1]].forEach(q=>g.pts(S,[[q[0],v1+hh*.1],[q[0]+q[1]*w*.34,v1+hh*.1],[q[0]+q[1]*w*.2,v0+hh*.35],[q[0]+q[1]*w*.3,v0-hh*.1],[q[0],v0-hh*.1]],o.curt||'#FFF6E2',{op:.96}));
    g.rect(S,u0-w*.1,v0-hh*.1,u1+w*.1,v0-hh*.03,'#FFF6E2',{})}
  function sconce(g,S,u,v,k){k=k||1;g.disc(S,u,v+.03,.07*k,.13,'url(#warm)',{stroke:'none'});g.rect(S,u-.006*k,v-.04,u+.006*k,v+.02,'#FFFDF6',{sw:1.4});g.rect(S,u-.014*k,v-.055,u+.014*k,v-.04,'#E9B98F',{sw:1.4});
    g.pts(S,[[u,v+.02],[u-.005*k,v+.04],[u,v+.065],[u+.005*k,v+.04]],'#FFD979',{sw:1});
    [[-.035,.09],[.04,.0]].forEach(q=>{const x=u+q[0]*k,y=v+q[1],a=.012*k,b=.03;g.pts(S,[[x,y+b],[x+a*.25,y+b*.25],[x+a,y],[x+a*.25,y-b*.25],[x,y-b],[x-a*.25,y-b*.25],[x-a,y],[x-a*.25,y+b*.25]],'#FFE08A',{stroke:'#E2A82E',sw:1})})}
  function wallpaper(g,S,len,col){g.rect(S,0,0,1,1,col,{lit:'lv'});
    const n=Math.round(len*1.6);for(let i=0;i<n;i++)for(let j=0;j<4;j++){const u=(i+.5+(j%2)*.5)/n,v=.34+j*.16;if(u<.98)g.disc(S,u,v,.012*6/len,.014,'#fff',{stroke:'none',op:.45})}
    g.rect(S,0,0,1,.07,'#FFF6E2',{sw:1.8})}
  const A_={};
  /* ---------- terreno ---------- */
  A_.ground=()=>{const g=new G();g.shadow(-.4,-.4,12.4,12.4,.22);
    g.box(-.15,-.15,-1.5,11.9,11.9,.5,SHELLD,{r:16});g.box(-.45,-.45,-1.02,12.2,12.2,.72,SHELL,{r:16,top:shade(SHELL,.1)});
    const lawn=g.box(5.1,5.1,-.3,6.5,6.5,.3,'#9CC878',{top:'#B9DE96',r:0});
    const f={T:{o:[-.45,-.45,0],a:[12.2,0,0],b:[0,12.2,0]}};
    for(let i=0;i<46;i++){const u=.5+((i*37)%44)/100,v=.5+((i*53)%44)/100;if(u>.95||v>.95)continue;g.line(f.T,[[u,v],[u+.004,v-.012]],'#7FAE5C',2);g.line(f.T,[[u+.008,v],[u+.01,v-.01]],'#7FAE5C',2)}
    [[.6,.62,'#F7B3A9'],[.72,.55,'#FFD979'],[.56,.8,'#fff'],[.83,.7,'#F7B3A9'],[.66,.9,'#FFD979'],[.9,.58,'#fff'],[.78,.84,'#D9C7EF']].forEach(q=>{[[0,0],[.011,0],[-.011,0],[0,.011],[0,-.011]].forEach((d,i)=>g.disc(f.T,q[0]+d[0],q[1]+d[1],.007,.007,i?q[2]:'#F2A93B',{sw:1.2}))});
    [[.52,.6],[.6,.68],[.68,.76],[.76,.84],[.84,.92]].forEach(q=>g.disc(f.T,q[0],q[1],.03,.03,'#F4E3C6',{sw:1.8}));
    return g};
  /* ---------- pisos ---------- */
  A_.floor=(x,y,w,d,c1,c2,kind)=>()=>{const g=new G();const f=g.box(x,y,-.3,w,d,.3,SHELL,{top:c1,lit:false,r:0});
    if(kind==='wood')planks(g,{o:[x,y,0],a:[0,d,0],b:[w,0,0]},Math.round(w*1.6),c1);else tiles(g,f.T,Math.round(w),Math.round(d),c1,c2);
    g.rect(f.T,0,0,1,1,'url(#lt)',{stroke:INKC});return g};
  A_.curb=(x,y,w,d)=>()=>{const g=new G();g.box(x,y,0,w,d,.5,SHELL,{top:shade(SHELL,.12),r:7});return g};
  /* ---------- paredes ---------- */
  A_.wallY=(y0,len,col,deco)=>()=>{const g=new G();const f=g.prism([[-WT,y0-WT],[0,y0-WT],[0,y0+len],[-WT,y0+len]],-.3,H,SHELL,{r:0,top:shade(SHELL,.12)});
    const S=wallS('y',0,y0,len);wallpaper(g,S,len,col);deco&&deco(g,S);g.rect(S,0,0,1,1,'none',{open:false,stroke:INKC});g.poly([g.P(S,0,0),g.P(S,1,0),g.P(S,1,1),g.P(S,0,1)],'none',{});return g};
  A_.wallX=(x0,len,col,deco)=>()=>{const g=new G();g.prism([[x0-WT,-WT],[x0+len,-WT],[x0+len,0],[x0-WT,0]],-.3,H,SHELL,{r:0,top:shade(SHELL,.12)});
    const S=wallS('x',x0,0,len);wallpaper(g,S,len,col);deco&&deco(g,S);g.poly([g.P(S,0,0),g.P(S,1,0),g.P(S,1,1),g.P(S,0,1)],'none',{});return g};
  const garland=(g,S,n)=>{const a=[];for(let i=0;i<=n*4;i++){const u=.02+.96*i/(n*4);a.push([u,.93+Math.sin(i/4*Math.PI*2)*.012])}g.line(S,a,'#8DB05A',2.4);for(let i=0;i<n;i++)g.berry(S,.02+.96*(i+.5)/n,.895,.016*6/n*1.2,.028)};
  /* ---------- cocina ---------- */
  A_.rug=(cx,cy,rx,ry,c1,c2)=>()=>{const g=new G(),S={o:[cx-rx,cy-ry,.01],a:[2*rx,0,0],b:[0,2*ry,0]};
    g.disc(S,.5,.5,.5,.5,c1,{});g.disc(S,.5,.5,.4,.4,'none',{open:false,stroke:c2,sw:3,dash:'7 8'});g.disc(S,.5,.5,.5,.5,'url(#lt)',{stroke:'none'});return g};
  function cabinetDoors(g,S,n,knob){for(let i=0;i<n;i++){const u0=.06+i*(.88/n)+.01,u1=.06+(i+1)*(.88/n)-.01;g.rect(S,u0,.12,u1,.86,'#FFF9EA',{sw:2});g.rect(S,u0+.035,.2,u1-.035,.78,'none',{open:false,stroke:'#E6CFA8',sw:1.6});
      g.disc(S,i%2?u0+.05:u1-.05,.5,.022,.035,knob||'#E4574B',{sw:1.6})}}
  A_.pantry=(x,y)=>()=>{const g=new G();g.shadow(x,y,1.5,1.05);const b=g.box(x,y,0,1.5,1.05,3.35,'#FBE3B8');
    g.rect(b.L,.05,.04,.95,.97,'#FFF3D9',{sw:2});g.rect(b.L,.08,.5,.49,.95,'#FFF9EA',{sw:2});g.rect(b.L,.51,.5,.92,.95,'#FFF9EA',{sw:2});g.rect(b.L,.08,.07,.49,.47,'#FFF9EA',{sw:2});g.rect(b.L,.51,.07,.92,.47,'#FFF9EA',{sw:2});
    [[.12,.54,.45,.91],[.55,.54,.88,.91]].forEach(q=>{g.rect(b.L,q[0],q[1],q[2],q[3],'#CFEAF2',{sw:1.6});g.rect(b.L,q[0],q[1],q[2],q[3],'url(#glass)',{stroke:'none'});
      g.line(b.L,[[q[0],(q[1]+q[3])/2-.02],[q[2],(q[1]+q[3])/2-.02]],'#C99A6B',2.2);
      [[.07,'#F7B3A9'],[.17,'#FFD979'],[.26,'#A9C58B']].forEach(j=>{g.rect(b.L,q[0]+j[0]-.035,(q[1]+q[3])/2-.015,q[0]+j[0]+.035,(q[1]+q[3])/2+.1,j[1],{sw:1.4});g.rect(b.L,q[0]+j[0]-.035,q[1]+.02,q[0]+j[0]+.035,q[1]+.12,j[1],{sw:1.4})})});
    g.disc(b.L,.45,.27,.02,.014,'#E4574B',{sw:1.6});g.disc(b.L,.55,.27,.02,.014,'#E4574B',{sw:1.6});
    g.berry(b.L,.28,.27,.07,.05);g.berry(b.L,.72,.27,.07,.05);
    const t=g.box(x-.06,y-.02,3.35,1.62,1.13,.14,'#A9C58B');return g};
  A_.stove=(x,y)=>()=>{const g=new G();g.shadow(x,y,1.45,1.1);const b=g.box(x,y,0,1.45,1.1,1.5,'#FFF3D9');
    g.rect(b.L,0,.82,1,1,'#F7B3A9',{sw:2});[.14,.32,.5,.68,.86].forEach(u=>g.disc(b.L,u,.91,.045,.05,'#E4574B',{sw:1.6}));
    g.rect(b.L,.1,.2,.9,.7,'#DCE5C2',{sw:2.2});g.rect(b.L,.1,.2,.9,.7,'url(#glass)',{stroke:'none'});g.berry(b.L,.5,.44,.13,.15);
    g.rect(b.L,.08,.73,.92,.78,'#E9B98F',{sw:1.8});g.rect(b.L,0,0,1,.12,'#F7B3A9',{sw:2});
    g.rect(b.T,.04,.06,.96,.94,'#F3E7D3',{sw:1.8});[[.28,.3],[.72,.3],[.28,.72],[.72,.72]].forEach(q=>{g.disc(b.T,q[0],q[1],.15,.19,'#6E625C',{sw:1.6});g.disc(b.T,q[0],q[1],.08,.1,'#9A8D86',{stroke:'none'})});
    return g};
  A_.pot=(cx,cy,z)=>()=>{const g=new G();g.box(cx-.36,cy-.05,z+.2,.12,.1,.05,'#E4574B',{sw:1.6});const c=g.cyl(cx,cy,z,z+.3,.27,'#E4574B',{top:'#F2766A'});
    g.box(cx+.24,cy-.05,z+.2,.12,.1,.05,'#E4574B',{sw:1.6});g.disc(c.T,.5,.5,.12,.12,'#FFD979',{sw:1.6});
    [[-.1,.1],[.06,.18],[.16,.08]].forEach(q=>g.poly([[cx+q[0]+.17,cy+.2-q[0],z+q[1]],[cx+q[0]+.2,cy+.2-q[0],z+q[1]+.03],[cx+q[0]+.17,cy+.2-q[0],z+q[1]+.06],[cx+q[0]+.14,cy+.2-q[0],z+q[1]+.03]],'#FFE3D0',{stroke:'none'}));return g};
  A_.kettle=(cx,cy,z)=>()=>{const g=new G();g.poly([[cx,cy+.3,z+.12],[cx,cy+.42,z+.26],[cx,cy+.38,z+.3],[cx,cy+.26,z+.2]],'#F2766A',{sw:1.8});
    const c=g.cyl(cx,cy,z,z+.24,.2,'#F2766A',{top:'#F7958A'});g.disc(c.T,.5,.5,.2,.2,'#FFD979',{sw:1.6});
    g.poly([[cx-.2,cy,z+.26],[cx-.1,cy,z+.42],[cx+.1,cy,z+.42],[cx+.2,cy,z+.26]],'none',{open:true,sw:3.2});return g};
  A_.hood=(x,y)=>()=>{const g=new G();const z=2.75;
    g.box(x+.45,y,z+.55,.55,.5,H-z-.55,'#F29C92');
    const b0=[[x,y],[x+1.45,y],[x+1.45,y+.95],[x,y+.95]],t0=[[x+.4,y],[x+1.05,y],[x+1.05,y+.55],[x+.4,y+.55]];
    g.poly([[b0[3][0],b0[3][1],z+.14],[b0[2][0],b0[2][1],z+.14],[t0[2][0],t0[2][1],z+.6],[t0[3][0],t0[3][1],z+.6]],'#F7B3A9',{lit:'lv'});
    g.poly([[b0[2][0],b0[2][1],z+.14],[b0[1][0],b0[1][1],z+.14],[t0[1][0],t0[1][1],z+.6],[t0[2][0],t0[2][1],z+.6]],shade('#F7B3A9',-.14),{lit:'lv'});
    const lip=g.box(x-.04,y,z,1.53,1,.16,'#F29C92');
    g.berry({o:[x+.38,y+.95,z+.2],a:[.7,-.26,0],b:[0,-.1,.34]},.5,.5,.26,.5);return g};
  A_.sink=(x,y)=>()=>{const g=new G();g.shadow(x,y,1.9,1.1);const b=g.box(x,y,0,1.9,1.1,1.36,'#FBE3B8');cabinetDoors(g,b.L,2);g.rect(b.L,0,0,1,.09,'#E9CFA6',{sw:1.8});
    const t=g.box(x-.05,y,1.36,1.98,1.16,.14,C.wood);
    g.rect(t.T,.2,.28,.68,.82,'#B9CDB0',{sw:2});g.rect(t.T,.24,.34,.64,.76,'#9DB596',{sw:1.4});
    const fx=x+.9,fy=y+.2;g.poly([[fx,fy,1.5],[fx,fy,1.95],[fx,fy+.2,2.05],[fx,fy+.38,1.9]],'none',{open:true,sw:7});g.poly([[fx,fy,1.5],[fx,fy,1.95],[fx,fy+.2,2.05],[fx,fy+.38,1.9]],'none',{open:true,stroke:'#D5DCE2',sw:3.4});
    g.cyl(fx,fy,1.5,1.56,.1,'#D5DCE2',{sw:1.6});
    const p=g.cyl(x+1.6,y+.42,1.5,1.78,.16,'#D9A066',{top:'#8A5A3A'});
    [[-.1,.3,-.06],[.02,.42,.05],[.12,.28,.1]].forEach(q=>{g.poly([[x+1.6,y+.42,1.78],[x+1.6+q[2],y+.42-q[0],1.78+q[1]]],'none',{open:true,stroke:'#5E8A3A',sw:2.4});g.disc({o:[x+1.6+q[2]-.09,y+.42-q[0],1.78+q[1]-.06],a:[.18,-.08,0],b:[0,0,.14]},.5,.5,.5,.5,'#8DB05A',{sw:1.6})});
    g.berry({o:[x+1.5,y+.62,1.86],a:[.16,-.06,0],b:[0,0,.16]},.5,.5,.5,.5);return g};
  /* refri: cuerpo con cavidad interior + puerta en cualquier ángulo (un sprite por cuadro) */
  const FR={w:1.45,d:1.15,h:3.25,fz:2.4};
  A_.fridgeBody=(x,y)=>()=>{const g=new G(),w=FR.w,d=FR.d,h=FR.h;g.shadow(x,y,w,d,.24);
    g.box(x+.08,y+.1,0,w-.16,d-.2,.1,'#C9B58F',{sw:1.6});
    const HUL=g.clipBegin([[x,y,0.03*h],[x+w,y,.03*h],[x+w,y+d,.03*h],[x,y+d,.03*h],[x,y,h],[x+w,y,h],[x+w,y+d,h],[x,y+d,h]],20),FC='#F7C6BF';
    const back={o:[x+.08,y+.12,.16],a:[w-.16,0,0],b:[0,0,FR.fz-.22]},side={o:[x+.08,y+d,.16],a:[0,-(d-.12),0],b:[0,0,FR.fz-.22]};
    g.rect(back,0,0,1,1,'url(#cold)',{sw:1.6});g.rect(side,0,0,1,1,'#E3F0F4',{sw:1.6});
    g.poly([[x+.08,y+.12,.16],[x+w-.08,y+.12,.16],[x+w-.08,y+d,.16],[x+.08,y+d,.16]],'#EEF6F8',{sw:1.6});
    [.86,1.56].forEach(z=>{g.poly([[x+.08,y+.14,z],[x+w-.08,y+.14,z],[x+w-.08,y+d-.06,z],[x+.08,y+d-.06,z]],'#FFFFFF',{sw:1.4,op:.92});g.poly([[x+.08,y+d-.06,z],[x+w-.08,y+d-.06,z],[x+w-.08,y+d-.06,z-.05],[x+.08,y+d-.06,z-.05]],'#CFE3EA',{sw:1.4})});
    g.poly([[x+.12,y+d-.08,.2],[x+w-.12,y+d-.08,.2],[x+w-.12,y+d-.08,.62],[x+.12,y+d-.08,.62]],'#FFFFFF',{sw:1.6,op:.55});
    /* marco: caras exteriores */
    const R={o:[x+w,y+d,0],a:[0,-d,0],b:[0,0,h]};g.rect(R,0,.03,1,1,shade(FC,-.13),{lit:'lv',sw:1.6});
    g.poly([[x,y,h],[x+w,y,h],[x+w,y+d,h],[x,y+d,h]],shade(FC,.18),{lit:'lt',sw:1.6});
    const Fr={o:[x,y+d,0],a:[w,0,0],b:[0,0,h]};
    g.pts(Fr,[[0,.03],[1,.03],[1,1],[0,1],[0,.03],[.055,.05],[.055,FR.fz/h-.012],[.945,FR.fz/h-.012],[.945,.05],[.055,.05]],FC,{stroke:'none'});
    g.rect(Fr,0,.03,1,1,'none',{open:false,sw:1.6});g.rect(Fr,.055,.05,.945,FR.fz/h-.012,'none',{open:false,sw:1.8});
    /* puerta del congelador (cerrada) */
    g.rect(Fr,.02,FR.fz/h+.008,.98,.985,shade(FC,.1),{sw:2.2,lit:'lv'});g.rect(Fr,.66,FR.fz/h+.05,.9,FR.fz/h+.085,'#F2C45A',{sw:1.6});g.berry(Fr,.3,(FR.fz/h+1)/2,.1,.05);
    g.clipEnd(HUL,20);
    return g};
  A_.fridgeGlow=(x,y)=>()=>{const g=new G();g.disc({o:[x-.3,y+FR.d,-.1],a:[FR.w+.6,0,0],b:[0,0,FR.fz+.5]},.5,.5,.5,.5,'url(#warm)',{stroke:'none'});return g};
  A_.fridgeDoor=(x,y,ang)=>()=>{const g=new G(),w=FR.w,d=FR.d,t=.13,a=ang*Math.PI/180;
    const hx=x+.02,hy=y+d,ux=Math.cos(a),uy=Math.sin(a),nx=-uy,ny=ux;          // u: a lo largo de la puerta; n: hacia afuera (cara exterior)
    const p=(s,q)=>[hx+ux*s+nx*q,hy+uy*s+ny*q];
    const foot=[p(0,0),p(w-.04,0),p(w-.04,t),p(0,t)];
    const f=g.prism(foot,.1,FR.fz-.02,'#FBD3CC',{r:16});
    f.sides.forEach(S=>{const dot=S.nx*nx+S.ny*ny,len=Math.hypot(S.a[0],S.a[1]);if(len<.5)return;
      const flip=(S.a[0]*ux+S.a[1]*uy)<0,U_=u=>flip?1-u:u;
      if(dot>.5){g.rect(S,U_(.06),.05,U_(.94),.95,'none',{open:false,stroke:'#E9D2AC',sw:1.8});g.rect(S,Math.min(U_(.64),U_(.9)),.86,Math.max(U_(.64),U_(.9)),.9,'#F2C45A',{sw:1.6});g.berry(S,U_(.42),.42,.2*(.9),.15)}
      else if(dot<-.5){g.rect(S,.05,.04,.95,.96,'#EEF6F8',{sw:1.6});[.16,.44,.72].forEach((v,i)=>{g.rect(S,.1,v,.9,v+.13,'#FFFFFF',{sw:1.5,op:.85});
        [[.22,'#F7B3A9'],[.4,'#FFD979'],[.58,'#A9C58B'],[.76,'#C8E6F0']].slice(i,i+3).forEach(j=>g.rect(S,U_(j[0])-.05,v+.03,U_(j[0])+.05,v+.2+(i%2)*.03,j[1],{sw:1.4}))})}});
    return g};
  A_.shelfWall=(S,u0,u1,v,items)=>()=>{const g=new G(),p0=g.P(S,u0,v),p1=g.P(S,u1,v),dx=S.nx,dy=S.ny,dep=.34;
    const foot=[[p0[0],p0[1]],[p1[0],p1[1]],[p1[0]+dx*dep,p1[1]+dy*dep],[p0[0]+dx*dep,p0[1]+dy*dep]];
    g.prism(foot,p0[2]-.07,p0[2],C.wood,{});
    items.forEach(it=>{const q=g.P(S,u0+(u1-u0)*it[0],v);g.cyl(q[0]+dx*.17,q[1]+dy*.17,q[2],q[2]+it[1],it[3]||.1,it[2],{sw:1.6});g.cyl(q[0]+dx*.17,q[1]+dy*.17,q[2]+it[1],q[2]+it[1]+.05,(it[3]||.1)*.85,it[4]||'#E4574B',{sw:1.4})});return g};
  A_.table=(x,y)=>()=>{const g=new G();g.shadow(x,y,1.3,1.3,.16);[[.08,.08],[1.1,.08],[1.1,1.1],[.08,1.1]].forEach(q=>g.box(x+q[0],y+q[1],0,.12,.12,.95,C.woodD,{sw:1.6}));
    const t=g.box(x,y,.95,1.3,1.3,.1,C.wood);g.disc(t.T,.5,.5,.42,.42,'#FFF6E2',{sw:1.8});g.disc(t.T,.5,.5,.3,.3,'none',{open:false,stroke:'#E4574B',sw:2,dash:'5 6'});
    const c=g.cyl(x+.65,y+.65,1.05,1.3,.2,'#F7B3A9',{top:'#8A5A3A'});
    [[-.1,.3],[.05,.42],[.14,.3],[-.02,.2]].forEach((q,i)=>{g.poly([[x+.65,y+.65,1.3],[x+.65+q[0],y+.65-q[0]*.5,1.3+q[1]]],'none',{open:true,stroke:'#5E8A3A',sw:2.2});g.disc({o:[x+.65+q[0]-.07,y+.65-q[0]*.5,1.3+q[1]-.02],a:[.14,-.05,0],b:[0,0,.13]},.5,.5,.5,.5,i%2?'#F58FA6':'#FFD979',{sw:1.5})});return g};
  /* ---------- baño ---------- */
  A_.vanity=(x,y)=>()=>{const g=new G();g.shadow(x,y,1.5,.95);const b=g.box(x,y,0,1.5,.95,1.25,'#CDE8D8');cabinetDoors(g,b.L,2,'#F7B3A9');
    const t=g.box(x-.05,y,1.25,1.6,1.02,.12,'#FFFDF6');g.disc(t.T,.5,.56,.26,.3,'#E7F3F6',{sw:1.8});g.disc(t.T,.5,.56,.18,.2,'#D3E9EE',{sw:1.2});
    g.poly([[x+.75,y+.14,1.37],[x+.75,y+.14,1.72],[x+.75,y+.38,1.72]],'none',{open:true,sw:6.5});g.poly([[x+.75,y+.14,1.37],[x+.75,y+.14,1.72],[x+.75,y+.38,1.72]],'none',{open:true,stroke:'#D5DCE2',sw:3});
    g.cyl(x+1.25,y+.3,1.37,1.62,.09,'#F7B3A9',{sw:1.5});return g};
  A_.mirror=(S,u,v)=>()=>{const g=new G();g.disc(S,u,v,.085,.2,'#E9B98F',{});g.disc(S,u,v,.07,.17,'#D6EEF5',{sw:1.8});g.disc(S,u,v,.07,.17,'url(#glass)',{stroke:'none'});g.berry(S,u,v+.215,.022,.045);return g};
  A_.tub=(x,y)=>()=>{const g=new G();g.shadow(x,y,2.3,1.15);[[.12,.12],[2.05,.12],[2.05,.9],[.12,.9]].forEach(q=>g.cyl(x+q[0]+.06,y+q[1]+.06,0,.2,.08,'#E9B98F',{sw:1.5}));
    const b=g.box(x,y,.2,2.3,1.15,.85,'#FFFDF6');g.rect(b.T,.05,.1,.95,.9,'#BFE3EE',{sw:2});g.rect(b.T,.05,.1,.95,.9,'url(#glass)',{stroke:'none'});
    [[.2,.4,.07],[.32,.6,.09],[.5,.35,.08],[.62,.62,.1],[.78,.45,.07],[.44,.7,.06]].forEach(q=>g.disc(b.T,q[0],q[1],q[2],q[2]*1.9,'#fff',{sw:1.4,op:.95}));
    g.rect(b.L,.04,.62,.96,.78,'#F7B3A9',{sw:1.6});g.berry(b.L,.5,.34,.07,.2);
    g.poly([[x+2.12,y+.5,1.05],[x+2.12,y+.5,1.5],[x+1.9,y+.5,1.5]],'none',{open:true,sw:6.5});g.poly([[x+2.12,y+.5,1.05],[x+2.12,y+.5,1.5],[x+1.9,y+.5,1.5]],'none',{open:true,stroke:'#D5DCE2',sw:3});return g};
  A_.mat=(x,y)=>()=>{const g=new G(),S={o:[x,y,.01],a:[1.3,0,0],b:[0,.8,0]};g.rect(S,0,0,1,1,'#F7B3A9',{});g.rect(S,.08,.12,.92,.88,'none',{open:false,stroke:'#FFF6E2',sw:2.4,dash:'6 6'});return g};
  A_.plant=(x,y,h)=>()=>{const g=new G();g.shadow(x-.3,y-.3,.6,.6,.16);g.cyl(x,y,0,.42,.26,'#F2A39A',{top:'#8A5A3A'});
    for(let i=0;i<7;i++){const a=i/7*Math.PI*2,r=.3+((i*7)%3)*.08,z=.42+h*(.55+((i*5)%4)*.14);g.poly([[x,y,.42],[x+Math.cos(a)*r*.5,y+Math.sin(a)*r*.5,z*.7],[x+Math.cos(a)*r,y+Math.sin(a)*r,z]],'none',{open:true,stroke:'#5E8A3A',sw:2.4});
      g.disc({o:[x+Math.cos(a)*r-.13,y+Math.sin(a)*r+.05,z-.1],a:[.26,-.1,0],b:[0,0,.24]},.5,.5,.5,.5,i%2?'#8DB05A':'#A6D46E',{sw:1.6})}return g};
  /* ---------- lavandería ---------- */
  A_.washer=(x,y,col,drumC)=>()=>{const g=new G();g.shadow(x,y,1.1,1.3);const b=g.box(x,y,0,1.1,1.3,1.5,col);
    g.rect(b.R,0,.82,1,1,shade(col,-.06),{sw:2});g.disc(b.R,.14,.91,.05,.045,'#E4574B',{sw:1.5});g.disc(b.R,.28,.91,.05,.045,'#FFD979',{sw:1.5});g.rect(b.R,.6,.87,.9,.95,'#CDE8D8',{sw:1.5});
    g.disc(b.R,.5,.43,.34,.3,'#F6E3C0',{sw:2.2});g.disc(b.R,.5,.43,.25,.22,'#BFE3EE',{sw:2});
    [[.42,.38,'#F58FA6'],[.58,.46,'#FFD979'],[.5,.52,'#fff'],[.47,.32,'#C9B0E8']].forEach(q=>g.disc(b.R,q[0],q[1],.085,.075,q[2],{stroke:'none'}));
    g.disc(b.R,.5,.43,.25,.22,'url(#glass)',{sw:2});g.rect(b.R,0,0,1,.08,shade(col,-.1),{sw:1.6});return g};
  A_.basket=(x,y)=>()=>{const g=new G();g.shadow(x-.4,y-.4,.8,.8,.16);const c=g.cyl(x,y,0,.62,.38,'#E0B07A',{top:'#F58FA6'});
    g.disc(c.T,.42,.5,.2,.2,'#8EB8D0',{sw:1.5});g.disc(c.T,.62,.42,.16,.16,'#FFF6E2',{sw:1.5});return g};
  A_.basketL=(x,y,l)=>()=>{const g=new G(),R=.5,Hh=.62;g.shadow(x-R,y-R,2*R,2*R,.18);const c=g.cyl(x,y,0,Hh,R,'#E3B477',{top:l?'#C98A54':'#8A5A3A',sw:2.6});
    for(let k=0;k<4;k++){const z=.1+k*.13,a=[];for(let i=0;i<=14;i++){const t=-Math.PI/4+Math.PI*i/14;a.push([x+Math.cos(t)*(R+.004),y+Math.sin(t)*(R+.004),z+(i%2?.035:-.035)])}g.poly(a,'none',{open:true,stroke:'#B98552',sw:1.7})}
    for(let i=1;i<14;i+=2){const t=-Math.PI/4+Math.PI*i/14;g.poly([[x+Math.cos(t)*(R+.004),y+Math.sin(t)*(R+.004),.04],[x+Math.cos(t)*(R+.004),y+Math.sin(t)*(R+.004),Hh-.04]],'none',{open:true,stroke:'#C99556',sw:1.4})}
    g.cyl(x,y,Hh,Hh+.07,R+.04,'#EEC386',{top:l?'#C98A54':'#8A5A3A',sw:2.2});
    const blob=(dx,dy,z,r,col)=>g.disc({o:[x+dx-r*.55,y+dy+r*.55,z],a:[r*1.1,-r*1.1,0],b:[0,0,r*1.5]},.5,.5,.5,.5,col,{sw:1.8,lit:'lv'});
    if(l>=1){blob(-.14,0,Hh-.1,.3,'#8EB8D0');blob(.16,.04,Hh-.08,.26,'#FFF6E2')}
    if(l>=2){blob(-.16,0,Hh+.12,.34,'#F58FA6');blob(.18,.02,Hh+.16,.3,'#FFD979');blob(0,.1,Hh+.36,.28,'#C9B0E8')}
    if(l>=3){blob(-.06,.02,Hh+.62,.26,'#8EB8D0');blob(.1,.06,Hh+.8,.2,'#FFF6E2');
      const T={o:[x+.2,y+.46,Hh+.2],a:[.3,.12,0],b:[0,0,-.62]};g.rect(T,0,0,1,1,'#F7B3A9',{sw:1.8});[.2,.45,.7].forEach(v=>g.rect(T,0,v,1,v+.1,'#FFF6E2',{stroke:'none'}))}return g};
  A_.pile=(x,y)=>()=>{const g=new G();g.shadow(x-.5,y-.3,1.2,.8,.14);
    g.box(x-.42,y-.2,0,.2,.62,.12,'#6F9BC8',{r:8,sw:2});g.box(x-.16,y-.14,0,.2,.6,.12,'#6F9BC8',{r:8,sw:2});g.box(x-.46,y-.3,0,.56,.22,.16,'#5B86B5',{r:8,sw:2});
    g.box(x+.3,y+.1,0,.3,.12,.1,'#FFFDF6',{r:6,sw:1.8});g.box(x+.5,y+.1,0,.12,.26,.1,'#FFFDF6',{r:6,sw:1.8});g.box(x+.28,y+.095,0,.09,.13,.11,'#F58FA6',{r:4,sw:1.5});return g};
  A_.paws=(pts)=>()=>{const g=new G();pts.forEach((p,i)=>{const dx=p[2],dy=p[3],l=Math.hypot(dx,dy)||1,ux=dx/l,uy=dy/l,px=-uy,py=ux,o=(i%2?1:-1)*.1,cx=p[0]+px*o,cy=p[1]+py*o,op=.5-i*.02;
      const S={o:[cx,cy,.012],a:[ux,uy,0],b:[px,py,0]};g.disc(S,0,0,.085,.075,'#8A5A3A',{stroke:'none',op});[[.1,-.075],[.135,-.025],[.135,.025],[.1,.075]].forEach(t=>g.disc(S,t[0],t[1],.032,.03,'#8A5A3A',{stroke:'none',op}))});return g};
  A_.puddle=(x,y,rx,ry)=>()=>{const g=new G(),S={o:[x-rx,y-ry,.012],a:[2*rx,0,0],b:[0,2*ry,0]};
    g.pts(S,[[.05,.5],[.14,.2],[.4,.06],[.66,.12],[.9,.3],[.98,.6],[.8,.9],[.5,.97],[.2,.86]],'#BFE3F2',{sw:2,stroke:'#8FC3E8',op:.85});g.pts(S,[[.18,.48],[.28,.28],[.48,.2],[.64,.28]],'none',{open:true,stroke:'#fff',sw:2.6,op:.85});
    g.disc(S,1.06,.2,.06,.07,'#BFE3F2',{sw:1.5,stroke:'#8FC3E8'});g.disc(S,-.04,.86,.05,.06,'#BFE3F2',{sw:1.5,stroke:'#8FC3E8'});return g};
  A_.sinkDishes=(x,y,z)=>()=>{const g=new G();[0,.045,.09].forEach(k=>g.cyl(x,y,z+k,z+k+.035,.2-k*.3,'#FFFDF6',{sw:1.6}));g.cyl(x+.3,y+.1,z,z+.16,.1,'#F7B3A9',{sw:1.6,top:'#8A5A3A'});
    g.poly([[x+.05,y-.05,z+.14],[x+.34,y-.3,z+.5]],'none',{open:true,stroke:INKC,sw:5});g.poly([[x+.05,y-.05,z+.14],[x+.34,y-.3,z+.5]],'none',{open:true,stroke:'#C98A54',sw:2.4});
    g.disc({o:[x-.08,y+.08,z+.1],a:[.1,-.1,0],b:[0,0,.1]},.5,.5,.5,.5,'#B9A07A',{stroke:'none',op:.7});return g};
  A_.clutter=(x,y,kind)=>()=>{const g=new G();g.shadow(x-.2,y-.2,.4,.4,.14);
    if(kind==='sock'){g.box(x-.2,y-.07,0,.3,.14,.1,'#FFF6E2',{r:6,sw:1.8});g.box(x+.04,y-.07,0,.14,.3,.1,'#FFF6E2',{r:6,sw:1.8});g.box(x-.22,y-.075,0,.1,.15,.11,'#F58FA6',{r:5,sw:1.6})}
    else if(kind==='ball'){const S={o:[x-.13,y+.13,0],a:[.26,-.26,0],b:[0,0,.42]};g.disc(S,.5,.5,.5,.5,'#C7E26A',{sw:2,lit:'lv'});g.line(S,[[.12,.4],[.5,.56],[.88,.4]],'#fff',2)}
    else if(kind==='paper'){const S={o:[x-.12,y+.12,0],a:[.24,-.24,0],b:[0,0,.32]};g.pts(S,[[.1,.2],[.3,0],[.62,.1],[.95,.3],[.86,.7],[.6,1],[.3,.86],[0,.6]],'#FFFDF6',{sw:1.8});g.line(S,[[.3,.3],[.5,.55],[.7,.35]],'#C9B8A0',1.4)}
    else if(kind==='bone'){[[-.2,-.05],[-.2,.05],[.2,-.05],[.2,.05]].forEach(q=>g.cyl(x+q[0],y+q[1],0,.09,.06,'#FFF6E2',{sw:1.6}));g.box(x-.2,y-.035,.01,.4,.07,.07,'#FFF6E2',{r:4,sw:1.6})}
    else{g.cyl(x,y,0,.26,.12,'#C9B0E8',{sw:1.8,top:'#8A5A3A'})}return g};
  A_.stain=(x,y,r)=>()=>{const g=new G(),S={o:[x-r,y-r,.015],a:[2*r,0,0],b:[0,2*r,0]};
    g.pts(S,[[.1,.4],[.3,.1],[.6,.05],[.9,.3],[1,.6],[.75,.92],[.45,1],[.15,.8]],'#9A7B5B',{stroke:'none',op:.38});g.disc(S,.42,.5,.2,.2,'#7A5C40',{stroke:'none',op:.3});
    [[.15,.1],[.9,.85],[.95,.12]].forEach(q=>g.disc(S,q[0],q[1],.06,.06,'#9A7B5B',{stroke:'none',op:.4}));
    [[.2,.9],[.8,.2]].forEach(q=>{const P=g.P(S,q[0],q[1]);g.poly([[P[0],P[1],.1],[P[0],P[1],.3]],'none',{open:true,stroke:'#B9A48C',sw:2,dash:'3 4'})});return g};
  A_.poop=(x,y)=>()=>{const g=new G();g.shadow(x-.22,y-.22,.44,.44,.2);g.cyl(x,y,-.3,-.19,.2,'#8A5A3A',{top:'#9C6A45',sw:2});g.cyl(x+.01,y,-.19,-.08,.15,'#8A5A3A',{top:'#9C6A45',sw:2});g.cyl(x,y+.01,-.08,.02,.1,'#8A5A3A',{top:'#A87650',sw:2});
    g.disc({o:[x-.04,y+.04,.02],a:[.08,-.08,0],b:[0,0,.12]},.5,.5,.5,.5,'#9C6A45',{sw:1.8});
    [[-.26,.3],[.24,.36]].forEach(q=>g.poly([[x+q[0],y-q[0],q[1]-.2],[x+q[0]+.04,y-q[0]-.04,q[1]-.1],[x+q[0],y-q[0],q[1]],[x+q[0]+.04,y-q[0]-.04,q[1]+.1]],'none',{open:true,stroke:'#9DB07A',sw:2}));return g};
  A_.pee=(x,y)=>()=>{const g=new G(),S={o:[x-.42,y-.34,-.295],a:[.84,0,0],b:[0,.68,0]};
    g.pts(S,[[.08,.5],[.2,.18],[.5,.06],[.82,.2],[.96,.52],[.8,.86],[.5,.96],[.2,.84]],'#F6DE6B',{sw:2,stroke:'#C9A93A',op:.92});g.pts(S,[[.2,.5],[.3,.28],[.52,.22],[.7,.34]],'none',{open:true,stroke:'#fff',sw:2.4,op:.8});
    g.disc(S,1.02,.1,.07,.09,'#F6DE6B',{sw:1.6,stroke:'#C9A93A'});g.disc(S,-.02,.9,.05,.065,'#F6DE6B',{sw:1.6,stroke:'#C9A93A'});return g};
  /* productos con volumen para los estantes */
  A_.prod=(kind,c)=>()=>{const g=new G(),W='#FFFDF6';
    if(kind==='carton'){const b=g.box(-.1,-.08,0,.2,.16,.32,c,{r:5,sw:2});g.rect(b.L,.12,.2,.88,.62,W,{sw:1.3});g.poly([[-.1,.08,.32],[.1,.08,.32],[.1,0,.41],[-.1,0,.41]],shade(c,.12),{sw:1.8});g.poly([[.1,.08,.32],[.1,-.08,.32],[.1,0,.41]],shade(c,-.14),{sw:1.8});g.poly([[-.1,0,.41],[.1,0,.41],[.1,0,.45],[-.1,0,.45]],W,{sw:1.6})}
    else if(kind==='bottle'){g.cyl(0,0,0,.28,.085,c,{sw:2});g.cyl(0,0,.28,.37,.04,c,{sw:1.6});g.cyl(0,0,.37,.41,.05,W,{sw:1.5})}
    else if(kind==='can'){const k=g.cyl(0,0,0,.24,.1,c,{sw:2,top:'#D8DDE3'});const a=[];for(let i=0;i<=10;i++){const t=-Math.PI/4+Math.PI*i/10;a.push([Math.cos(t)*.102,Math.sin(t)*.102,.1])}g.poly(a,'none',{open:true,stroke:W,sw:6})}
    else if(kind==='box'){const b=g.box(-.12,-.05,0,.24,.1,.34,c,{r:5,sw:2});g.rect(b.L,.14,.14,.86,.5,'#FFD36B',{sw:1.3});g.disc(b.L,.5,.72,.2,.12,W,{sw:1.3})}
    else if(kind==='wedge'){g.poly([[-.14,.1,0],[.14,.1,0],[.14,.1,.15],[-.14,.1,.15]],c,{sw:2,lit:'lv'});g.poly([[.14,.1,0],[.14,-.1,0],[.14,-.1,.15],[.14,.1,.15]],shade(c,-.14),{sw:2});g.poly([[-.14,.1,.15],[.14,.1,.15],[.14,-.1,.15]],shade(c,.18),{sw:2});g.disc({o:[-.14,.1,0],a:[.28,0,0],b:[0,0,.15]},.35,.5,.07,.16,shade(c,-.16),{stroke:'none'});g.disc({o:[-.14,.1,0],a:[.28,0,0],b:[0,0,.15]},.7,.4,.05,.12,shade(c,-.16),{stroke:'none'})}
    else if(kind==='eggs'){g.box(-.17,-.09,0,.34,.18,.07,'#B9D49A',{r:5,sw:2});[-.1,0,.1].forEach(dx=>g.disc({o:[dx-.045,.045+.02,.05],a:[.09,-.09,0],b:[0,0,.15]},.5,.5,.5,.5,c,{sw:1.6,lit:'lh'}))}
    else if(kind==='tray'){g.box(-.16,-.11,0,.32,.22,.06,W,{r:5,sw:2});g.box(-.12,-.08,.06,.24,.16,.07,c,{r:7,sw:1.8})}
    else if(kind==='tub'){g.box(-.14,-.1,0,.28,.2,.15,'#E3F3FA',{r:6,sw:2});g.box(-.155,-.115,.15,.31,.23,.045,c,{r:5,sw:1.8})}
    else if(kind==='jar'){g.cyl(0,0,0,.22,.105,c,{sw:2});g.cyl(0,0,.22,.27,.115,W,{sw:1.6})}
    else{const S={o:[-.085,.085,0],a:[.17,-.17,0],b:[0,0,.3]};g.disc(S,.5,.5,.5,.5,c,{sw:2,lit:'lh'});g.disc(S,.36,.66,.12,.1,'#fff',{stroke:'none',op:.55});g.pts(S,[[.5,.96],[.36,1.12],[.5,1.06],[.64,1.12]],'#7FB04F',{sw:1.4,stroke:'#4F6B2E'})}
    return g};
  A_.rack=(S)=>()=>{const g=new G();g.line(S,[[.08,.62],[.92,.62]],'#8A5330',3);
    [[.2,'#F58FA6'],[.42,'#FFD979'],[.64,'#8EB8D0'],[.84,'#FFF6E2']].forEach(q=>{g.rect(S,q[0]-.07,.42,q[0]+.07,.62,q[1],{sw:1.8});g.rect(S,q[0]-.012,.6,q[0]+.012,.66,'#E9C48F',{sw:1.2})});return g};
  /* ---------- exterior ---------- */
  A_.mailbox=(x,y)=>()=>{const g=new G();g.shadow(x-.25,y-.25,.6,.6,.2);g.box(x-.06,y-.06,-.3,.12,.12,1.25,C.woodD,{sw:1.6});
    const b=g.box(x-.3,y-.22,.95,.6,.44,.4,'#E4574B');g.poly([[x-.3,y+.22,1.35],[x+.3,y+.22,1.35],[x+.3,y+.22,1.5],[x,y+.22,1.58],[x-.3,y+.22,1.5]],'#E4574B',{lit:'lv'});
    g.poly([[x+.3,y-.22,1.35],[x+.3,y+.22,1.35],[x+.3,y+.22,1.5],[x+.3,y-.22,1.5]],shade('#E4574B',-.16),{});
    g.poly([[x+.3,y-.22,1.5],[x+.3,y+.22,1.5],[x,y+.22,1.58],[x,y-.22,1.58]],shade('#E4574B',.1),{});g.poly([[x,y-.22,1.58],[x,y+.22,1.58],[x-.3,y+.22,1.5],[x-.3,y-.22,1.5]],shade('#E4574B',.2),{});
    g.rect(b.L,.2,.42,.8,.58,'#7A2A22',{sw:1.4});g.berry(b.L,.5,.2,.1,.12);
    g.poly([[x+.3,y,1.3],[x+.3,y,1.75]],'none',{open:true,sw:3});g.poly([[x+.3,y,1.75],[x+.3,y-.22,1.75],[x+.3,y-.22,1.6],[x+.3,y,1.6]],'#FFD979',{sw:1.6});return g};
  A_.letter=(x,y)=>()=>{const g=new G(),S={o:[x-.2,y+.24,1.38],a:[.4,0,0],b:[0,0,.26]};g.rect(S,0,0,1,1,'#FFFDF6',{sw:1.6});g.line(S,[[0,1],[.5,.45],[1,1]],INKC,1.4);return g};
  A_.bush=(x,y,r)=>()=>{const g=new G();g.shadow(x-r,y-r,r*2,r*2,.18);[[0,0,1],[-.5,.3,.7],[.45,.35,.75],[.05,.55,.6]].forEach((q,i)=>{const rr=r*q[2]*.55,S={o:[x+q[0]*r-rr,y+q[1]*r+rr,-.3],a:[2*rr,-2*rr,0],b:[0,0,2.1*r*q[2]]};g.disc(S,.5,.5,.5,.5,i%2?'#8FBF6F':'#A6D46E',{lit:'lv'})});
    [[-.2,.5,.9],[.35,.6,.6],[.05,.56,1.25]].forEach(q=>g.berry({o:[x+q[0]*r-.08,y+q[1]*r+.2,-.3+q[2]*r],a:[.12,-.12,0],b:[0,0,.22]},.5,.5,.5,.5));return g};
  A_.vine=(x,y,z,dx,dy,n)=>()=>{const g=new G();for(let i=0;i<n;i++){const px=x+dx*i,py=y+dy*i,r=.26+((i*7)%4)*.06,zz=z-.1+((i*5)%3)*.07;
      g.disc({o:[px-r*.5,py+r*.5,zz-r*.3],a:[r,-r,0],b:[0,0,r*1.7]},.5,.5,.5,.5,i%2?'#93B878':'#A9CB8B',{sw:1.8,lit:'lv'});}
    for(let i=0;i<n;i++){const px=x+dx*i,py=y+dy*i,zz=z+.12+((i*3)%3)*.1,c=['#F29CA6','#F7B9C0','#FFD9DE'][i%3],S={o:[px-.075,py+.075,zz],a:[.15,-.15,0],b:[0,0,.27]};
      g.disc(S,.5,.5,.5,.5,c,{sw:1.5});g.disc(S,.5,.52,.28,.28,shade(c,-.12),{stroke:'none'});g.line(S,[[.34,.5],[.5,.68],[.66,.5],[.5,.38]],shade(c,-.32),1.2)}return g};
  A_.roses=(x,y,z,c0)=>()=>{const g=new G();if(!z)g.shadow(x-.25,y-.25,.5,.5,.16);g.cyl(x,y,z||0,(z||0)+.34,.2,c0||'#FFF6E2',{top:'#8A5A3A',sw:2});
    [[-.16,.2,.5],[.14,.24,.56],[0,.1,.78],[-.05,.32,.7],[.2,.05,.72]].forEach((q,i)=>{const zz=(z||0)+q[2],S={o:[x+q[0]-.085,y+q[1]*.2+.085,zz],a:[.17,-.17,0],b:[0,0,.3]};
      if(i<3)g.disc({o:[x+q[0]-.13,y+.13,zz-.22],a:[.26,-.26,0],b:[0,0,.4]},.5,.5,.5,.5,'#A9CB8B',{sw:1.5});
      const c=['#F29CA6','#F7B9C0','#F58FA6','#FFD9DE','#F29CA6'][i];g.disc(S,.5,.5,.5,.5,c,{sw:1.5});g.disc(S,.5,.52,.28,.28,shade(c,-.12),{stroke:'none'});g.line(S,[[.34,.5],[.5,.68],[.66,.5],[.5,.38]],shade(c,-.32),1.2)});return g};
  A_.stool=(x,y,c)=>()=>{const g=new G();g.shadow(x-.3,y-.3,.6,.6,.16);[[-.16,-.16],[.16,-.16],[.16,.16],[-.16,.16]].forEach(q=>g.cyl(x+q[0],y+q[1],0,.42,.06,C.woodD,{sw:1.4}));
    g.cyl(x,y,.42,.56,.3,C.wood,{sw:2.2});g.cyl(x,y,.56,.64,.27,c||'#F7B3A9',{sw:2});return g};
  A_.jars=(x,y,z)=>()=>{const g=new G();[[0,0,.32,'#F7B3A9'],[.3,.06,.26,'#C9B0E8'],[.58,0,.3,'#A9CDE0']].forEach(q=>{g.cyl(x+q[0],y+q[1],z,z+q[2],.12,q[3],{sw:1.8});g.cyl(x+q[0],y+q[1],z+q[2],z+q[2]+.06,.13,shade(q[3],-.12),{sw:1.6});g.cyl(x+q[0],y+q[1],z+q[2]+.06,z+q[2]+.11,.045,'#FFF6E2',{sw:1.2})});return g};
  A_.hang=(S,u0,u1,v)=>()=>{const g=new G();for(let i=0;i<5;i++){const u=u0+(u1-u0)*(i+.5)/5,l=.1+((i*3)%3)*.045;g.line(S,[[u,v],[u+.004,v-l*.5],[u-.003,v-l]],'#6E9A4B',2.2);
      for(let j=0;j<4;j++)g.disc(S,u+(j%2?-.012:.012),v-l*(j+.6)/4,.012,.022,j%2?'#93B878':'#A9CB8B',{sw:1.2})}return g};
  A_.frame=(S,u,v)=>()=>{const g=new G();g.rect(S,u-.06,v-.11,u+.06,v+.11,'#FFF6E2',{sw:2.2});g.rect(S,u-.045,v-.085,u+.045,v+.085,'url(#sunset)',{sw:1.4});g.berry(S,u,v-.01,.03,.055);return g};
  A_.fridgeTop=(x,y,z)=>()=>{const g=new G();g.cyl(x+.42,y+.6,z,z+.2,.26,'#8E7BD6',{top:'#A898E6',sw:2});
    const b=g.box(x+.85,y+.35,z,.42,.2,.62,'#5DB1EE',{r:5});g.rect(b.L,0,0,1,.36,'#FFD36B',{sw:1.4});g.disc(b.L,.5,.66,.24,.17,'#F2A93B',{sw:1.4});return g};
  A_.toaster=(x,y,z)=>()=>{const g=new G();const b=g.box(x,y,z,.5,.3,.3,'#FFD36B',{r:11});g.rect(b.T,.12,.25,.88,.45,'#8A5A3A',{sw:1.3});g.rect(b.T,.12,.58,.88,.78,'#8A5A3A',{sw:1.3});
    g.rect(b.L,.78,.3,.9,.72,'#FFF6E2',{sw:1.3});g.poly([[x+.1,y+.11,z+.3],[x+.1,y+.11,z+.42],[x+.4,y+.11,z+.42],[x+.4,y+.11,z+.3]],'#E9B46A',{sw:1.5});return g};
  A_.dishes=(x,y,z)=>()=>{const g=new G();g.box(x,y,z,.62,.34,.06,C.wood,{r:4,sw:2});[0,.14,.28,.42].forEach(o=>g.disc({o:[x+.08+o,y+.3,z+.05],a:[0,-.26,0],b:[0,0,.34]},.5,.5,.5,.5,'#FFFDF6',{sw:1.7}));return g};
  A_.shaft=(y0,y1,z0,z1,len)=>()=>{const g=new G();g.poly([[0,y1,z0],[0,y0,z0],[0,y0,z1],[0,y1,z1]],'#FFF4C8',{stroke:'none',op:0});
    g.poly([[0,y0,z1],[0,y1,z1],[len,y1+len*.35,0],[len+.2,y0+len*.35,0]],'#FFF1B8',{stroke:'none',op:.5,filter:'soft'});
    g.poly([[.3,y0+.4,0],[.3,y1+.4,0],[len,y1+len*.35+.3,0],[len,y0+len*.35+.3,0]],'#FFF6D8',{stroke:'none',op:.55,filter:'soft'});return g};
  A_.pin=()=>{const g=new G(),S={o:[0,0,0],a:[.5,-.5,0],b:[0,0,.62]};g.berry(S,.5,.5,.42,.42);return g};
  A_.heart=()=>{const g=new G(),S={o:[0,0,0],a:[.4,-.4,0],b:[0,0,.5]};g.pts(S,[[.5,.05],[.08,.5],[.1,.78],[.3,.92],[.5,.74],[.7,.92],[.9,.78],[.92,.5]],'#F0606A',{sw:2});return g};
  return{U,A,B,H,WT,pr,G,A:A_,C,wallS,garland,windowOn,sconce,FR};
})();
