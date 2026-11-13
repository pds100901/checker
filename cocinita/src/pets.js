/* =====================================================================
   ROSCO Y MALI: sprites recortados de las ilustraciones originales.
   No se redibuja ningún rasgo: cada pose es el dibujo original, y el
   movimiento (patas, cola, respiración, parpadeo) se logra deformando
   suavemente zonas de esa misma imagen, sin cortes visibles.
   ===================================================================== */
const PETS=(()=>{
  const SC=.27;                       // unidades de escena por pixel del sprite
  const POSES=['hero','move','lie','sleep','beg','bow'];
  const RIG={
    mali:{speed:30,cycle:.52,lane:.82,
      hero:{tail:{x0:0,x1:46,base:246,top:158,amp:7},eyes:[[119,57,12.5,12.5],[176,46,9.5,10.5]],lid:'#E79F49'},
      move:{legs:[{x0:0,x1:62,top:112,bot:183,ph:0},{x0:62,x1:112,top:126,bot:183,ph:.5},{x0:118,x1:170,top:122,bot:183,ph:.75},{x0:170,x1:212,top:106,bot:170,ph:.25}],tail:{x0:0,x1:60,base:100,top:18,amp:5},amp:7,lift:5,bob:2.2},
      bow:{tail:{x0:0,x1:74,base:80,top:0,amp:9}},lie:{},sleep:{},beg:{}},
    rosco:{speed:64,cycle:.44,lane:.3,
      hero:{tail:{x0:0,x1:42,base:306,top:212,amp:7},eyes:[[141,84,9.5,10],[177,78,7.5,9]],lid:'#EDB25E'},
      move:{gallop:{hind:{x0:0,x1:100,top:112,bot:180,amp:9},front:{x0:150,x1:239,top:104,bot:164,amp:6}},tail:{x0:0,x1:62,base:106,top:52,amp:4},bob:5},
      bow:{tail:{x0:0,x1:78,base:72,top:0,amp:9}},lie:{},sleep:{},beg:{}}
  };
  const IMG={};let loaded=0,total=0;
  ['mali','rosco'].forEach(k=>POSES.forEach(p=>{total++;const im=new Image();im.onload=()=>{loaded++};im.src=`img/${k}-${p}.png`;IMG[k+'-'+p]=im}));
  const reduce=typeof matchMedia!=='undefined'&&matchMedia('(prefers-reduced-motion:reduce)').matches;
  const rnd=(a,b)=>a+Math.random()*(b-a);
  const ORDER=['sala','cocina','bano'];
  const D={
    rosco:{k:'rosco',room:'sala',x:120,dir:1,st:'sit',t:0,dur:rnd(3,6),tx:0,ph:0,blink:rnd(2,5),bl:0,pop:1,goRoom:null,wag:1,fx:[]},
    mali:{k:'mali',room:'cocina',x:230,dir:-1,st:'sit',t:0,dur:rnd(4,8),tx:0,ph:0,blink:rnd(2,5),bl:0,pop:1,goRoom:null,wag:1,fx:[]}
  };
  let cv=null,ctx=null,host=null,mode=null,room=null,hits=null,last=0,raf=0,dark=false;

  function setState(d,st,dur){d.st=st;d.t=0;d.dur=dur;d.pop=0}
  function next(d){
    const r=Math.random(),sleepy=dark?.5:.0;
    if(d.st==='sit'){
      if(r<.14+sleepy*.4)setState(d,'lie',rnd(4,8));
      else if(r<.24)setState(d,'bow',2.6);
      else if(r<.42){const i=ORDER.indexOf(d.room),opts=[i-1,i+1].filter(j=>j>=0&&j<ORDER.length),j=opts[Math.floor(Math.random()*opts.length)];
        d.goRoom=ORDER[j];d.tx=j>i?400:-40;d.dir=j>i?1:-1;setState(d,'walk',99)}
      else{d.tx=rnd(40,320);if(Math.abs(d.tx-d.x)<40)d.tx=d.x<180?d.x+90:d.x-90;d.dir=d.tx>d.x?1:-1;d.goRoom=null;setState(d,'walk',99)}
    }else if(d.st==='lie'){if(r<.55+sleepy)setState(d,'sleep',rnd(12,28));else setState(d,'sit',rnd(3,7))}
    else if(d.st==='bow'){d.tx=rnd(40,320);d.dir=d.tx>d.x?1:-1;d.goRoom=null;setState(d,'walk',99)}
    else setState(d,'sit',rnd(3,8));
  }
  function step(d,dt){
    const R=RIG[d.k];d.t+=dt;d.pop=Math.min(1,d.pop+dt/.18);
    d.blink-=dt;if(d.blink<=0){d.bl=.13;d.blink=rnd(2.2,6)}if(d.bl>0)d.bl-=dt;
    d.fx=d.fx.filter(f=>(f.t+=dt)<f.life);
    if(d.st==='walk'){
      d.ph+=dt/R.cycle;d.x+=d.dir*R.speed*dt;
      if((d.dir>0&&d.x>=d.tx)||(d.dir<0&&d.x<=d.tx)){
        if(d.goRoom){d.room=d.goRoom;d.x=d.dir>0?-40:400;d.tx=d.dir>0?rnd(60,200):rnd(160,300);d.goRoom=null}
        else setState(d,'sit',rnd(3,8));
      }
    }else if(d.t>=d.dur)next(d);
  }
  /* ---- dibujo con deformación por franjas (continuo: desplazamiento 0 en la raíz) ---- */
  function rows(im,x0,x1,y0,y1,fx,fy){           // franjas horizontales: fx(u)->dx, fy(u)->y destino, u=0 raíz..1 punta
    const h=y1-y0,stp=2;
    for(let y=y0;y<y1;y+=stp){const u=(y-y0-(fy?2:0))/h,sh=Math.min(stp+1,im.height-y);if(sh<=0)break;
      ctx.drawImage(im,x0,y,x1-x0,sh,x0+fx(u),fy?fy(y,u):y,x1-x0,sh)}
  }
  function drawTail(im,T,ang){                   // la cola sube desde su base; se mece más cuanto más lejos de la base
    const h=T.base-T.top,w=T.x1-T.x0,bands=3,bw=w/bands;
    for(let b=0;b<bands;b++){const k=1-b/bands*.75;
      for(let y=T.top;y<T.base;y+=2){const u=(T.base-y)/h;ctx.drawImage(im,T.x0+b*bw,y,bw+.6,3,T.x0+b*bw+ang*T.amp*k*Math.pow(u,1.4),y,bw+.6,3)}}
  }
  function clipOut(im,rects){ctx.beginPath();ctx.rect(0,0,im.width,im.height);rects.forEach(r=>ctx.rect(r[0],r[1],r[2],r[3]));ctx.clip('evenodd')}
  function drawPose(d,pose,time){
    const im=IMG[d.k+'-'+pose];if(!im||!im.complete||!im.naturalWidth)return null;
    const R=RIG[d.k],P=R[pose]||{},w=im.width,h=im.height;
    const wag=Math.sin(time*(pose==='bow'?13:d.st==='beg'?15:5.2)+(d.k==='mali'?1:0))*(d.wagBoost>time?1.6:1);
    ctx.save();
    const pop=reduce?1:.9+.1*d.pop;
    ctx.scale((pose==='hero'?1:d.dir)*SC,SC*pop);ctx.translate(-w/2,-h);
    if(reduce){ctx.drawImage(im,0,0);ctx.restore();return{w,h}}
    if(pose==='move'&&P.legs){
      const bob=Math.sin(d.ph*Math.PI*4)*P.bob;
      const ex=P.legs.map(l=>[l.x0,l.top+1,l.x1-l.x0,h-l.top]);if(P.tail)ex.push([P.tail.x0,-4,P.tail.x1-P.tail.x0,P.tail.base+3]);
      ctx.save();ctx.translate(0,bob);clipOut(im,ex);ctx.drawImage(im,0,0);ctx.restore();
      P.legs.forEach(l=>{const th=(d.ph+l.ph)*Math.PI*2,sw=Math.sin(th)*P.amp,lift=Math.max(0,Math.cos(th))*P.lift,H=l.bot-l.top;
        ctx.save();ctx.beginPath();ctx.rect(l.x0-12,l.top+bob-2,l.x1-l.x0+24,h-l.top+6);ctx.clip();
        rows(im,l.x0,l.x1,l.top-2,Math.min(h,l.bot),u=>sw*Math.pow(Math.max(0,u),1.5),(y,u)=>l.top+bob+(y-l.top)*(u<0?1:(H-bob-lift)/H));ctx.restore()});
      if(P.tail){ctx.save();ctx.translate(0,bob);drawTail(im,P.tail,wag);ctx.restore()}
    }else if(pose==='move'&&P.gallop){
      const g=P.gallop,th=d.ph*Math.PI*2,s=Math.sin(th);
      ctx.translate(w/2,h*.6);ctx.rotate(s*.07);ctx.translate(-w/2,-h*.6-Math.abs(Math.cos(th))*P.bob);
      const ex=[[g.hind.x0,g.hind.top+1,g.hind.x1-g.hind.x0,h-g.hind.top],[g.front.x0+1,g.front.top,w-g.front.x0,h-g.front.top],[P.tail.x0,-4,P.tail.x1-P.tail.x0,P.tail.base+3]];
      ctx.save();clipOut(im,ex);ctx.drawImage(im,0,0);ctx.restore();
      rows(im,g.hind.x0,g.hind.x1,g.hind.top-2,h,u=>s*g.hind.amp*Math.pow(Math.max(0,u),1.4));
      const fw=w-g.front.x0;                                    // patas delanteras: franjas verticales que suben y bajan
      for(let x=g.front.x0-2;x<w;x+=2){const u=Math.max(0,(x-g.front.x0)/fw);ctx.drawImage(im,x,g.front.top,3,h-g.front.top,x,g.front.top-s*g.front.amp*Math.pow(u,1.4),3,h-g.front.top)}
      drawTail(im,P.tail,wag);
    }else{
      const br=Math.sin(time*(pose==='sleep'?1.5:2.4))*(pose==='sleep'?1.6:1);   // respiración: el lomo sube, las patas quedan plantadas
      if(P.tail){ctx.save();clipOut(im,[[P.tail.x0,P.tail.top-4,P.tail.x1-P.tail.x0-1,P.tail.base-P.tail.top+3]]);breath(im,br);ctx.restore();drawTail(im,P.tail,wag*d.wag)}
      else breath(im,br);
      if(P.eyes&&d.bl>0){P.eyes.forEach(e=>{ctx.fillStyle=P.lid;ctx.beginPath();ctx.ellipse(e[0],e[1]-.5,e[2],e[3],0,0,7);ctx.fill();
        ctx.strokeStyle='#4A260F';ctx.lineWidth=3;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(e[0]-e[2]*.8,e[1]+1);ctx.quadraticCurveTo(e[0],e[1]+e[3]*.75,e[0]+e[2]*.8,e[1]+1);ctx.stroke()})}
    }
    ctx.restore();return{w,h};
  }
  function breath(im,br){const h=im.height,top=Math.round(h*.18),mid=Math.round(h*.62);
    ctx.drawImage(im,0,0,im.width,top,0,-br,im.width,top);
    for(let y=top;y<mid;y+=2){const u=1-(y-top)/(mid-top);ctx.drawImage(im,0,y,im.width,3,0,y-br*u,im.width,3)}
    ctx.drawImage(im,0,mid,im.width,h-mid,0,mid,im.width,h-mid)}
  function heart(x,y,s,c){ctx.save();ctx.translate(x,y);ctx.scale(s,s);ctx.fillStyle=c;ctx.strokeStyle='#6B3A1E';ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(0,4);ctx.bezierCurveTo(-9,-3,-4,-10,0,-4);ctx.bezierCurveTo(4,-10,9,-3,0,4);ctx.fill();ctx.stroke();ctx.restore()}
  function poseOf(d){return d.st==='walk'?'move':d.st==='sit'?'hero':d.st}
  function draw(time){
    const W=cv.width,H=cv.height,u=W/360;
    ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,W,H);
    const list=[];
    if(mode==='room'){const f=ROOMS[room].f;Object.values(D).forEach(d=>{if(d.room===room)list.push({d,x:d.x,y:f[0]+(f[1]-f[0])*RIG[d.k].lane,pose:poseOf(d)})})}
    else{const hr=host.getBoundingClientRect();Object.values(D).forEach(d=>{const el=host.querySelector('#dog-'+d.k);if(!el)return;const r=el.getBoundingClientRect();
      list.push({d,x:(r.left+r.width/2-hr.left)/hr.width*360,y:(r.bottom-hr.top)/hr.width*360-4,pose:d.gp&&d.gpT>time?d.gp:'hero',pin:true})})}
    list.sort((a,b)=>a.y-b.y);
    list.forEach(o=>{const d=o.d;
      if(o.pin){d._dir=d.dir;d.dir=1}
      ctx.setTransform(u,0,0,u,o.x*u,o.y*u);
      const im=IMG[d.k+'-'+o.pose];
      if(im&&im.naturalWidth){ctx.save();ctx.fillStyle='rgba(120,60,40,.18)';ctx.beginPath();ctx.ellipse(0,-1,im.width*SC*.42,5,0,0,7);ctx.fill();ctx.restore()}
      const sz=drawPose(d,o.pose,time)||{w:200,h:200};
      const top=-sz.h*SC;
      if(o.pose==='sleep'&&!reduce){ctx.fillStyle='#6B3A1E';ctx.font='700 13px Fredoka,Nunito,sans-serif';for(let i=0;i<3;i++){const p=((time*.5+i*.33)%1);ctx.globalAlpha=1-p;ctx.fillText('z',d.dir*(10+p*16)+i*3,top-4-p*22)}ctx.globalAlpha=1}
      d.fx.forEach(f=>{const p=f.t/f.life;ctx.globalAlpha=1-p*p;heart(f.x+Math.sin(p*6+f.x)*4,top+6-p*34,.9+p*.3,f.c)});ctx.globalAlpha=1;
      if(o.pin)d.dir=d._dir;
      const hb=hits&&hits.querySelector(`[data-dog="${d.k}"]`);
      if(hb&&mode==='room'){const hw=sz.w*SC,hh=sz.h*SC;hb.style.cssText=`left:${(o.x-hw/2)/3.6}%;top:${(o.y-hh)/ROOMS[room].h*100}%;width:${hw/3.6}%;height:${hh/ROOMS[room].h*100}%`}
    });
  }
  function frame(ts){
    raf=requestAnimationFrame(frame);
    const dt=Math.min(.05,(ts-last)/1000||0);last=ts;
    if(document.hidden)return;
    if(!reduce)Object.values(D).forEach(d=>step(d,dt));else Object.values(D).forEach(d=>{d.fx=d.fx.filter(f=>(f.t+=dt)<f.life)});
    if(!cv||!cv.isConnected)return;
    const r=cv.getBoundingClientRect(),dpr=Math.min(3,window.devicePixelRatio||1),W=Math.round(r.width*dpr),H=Math.round(r.height*dpr);
    if(!W)return;if(cv.width!==W||cv.height!==H){cv.width=W;cv.height=H}
    draw(ts/1000);
  }
  function mount(){
    const app=document.getElementById('app');
    host=app.querySelector('.room')||app.querySelector('.garden');cv=null;hits=null;
    dark=app.classList.contains('no-luz');
    if(!host)return;
    if(host.classList.contains('garden')){mode='garden';cv=document.createElement('canvas');cv.className='pets';host.appendChild(cv)}
    else{mode='room';room=host.dataset.room;cv=host.querySelector('canvas.pets');hits=host.querySelector('.pethits');
      hits.innerHTML=Object.keys(D).map(k=>`<button class="pethit" data-act="petTap" data-dog="${k}" aria-label="${k==='rosco'?'Rosco':'Mali'}"></button>`).join('');
      Object.values(D).forEach(d=>{const b=hits.querySelector(`[data-dog="${d.k}"]`);b.style.display=d.room===room?'':'none'})}
    ctx=cv.getContext('2d');
    if(!raf)raf=requestAnimationFrame(frame);
  }
  function hearts(d,n){for(let i=0;i<(n||3);i++)d.fx.push({t:-i*.18,life:1.3,x:rnd(-16,16),c:i%2?'#FFD36B':'#F0606A'})}
  function tap(k,el){
    const d=D[k];
    if(d.st==='sleep'){setState(d,'lie',2.5);say(el,'Zzz… ¿eh?');return}
    if(d.st==='beg'&&d.t<.5)return;
    setState(d,'beg',2.1);hearts(d,3);d.goRoom=null;
    say(el,['¡Guau!','¡Guau guau!','¿Hay premio?','¡Quiero paseo!','¡Mimos!'][Math.floor(Math.random()*5)]);
  }
  function say(el,t){if(!el)return;const o=el.querySelector('.bubble');o&&o.remove();el.insertAdjacentHTML('beforeend',`<div class="bubble">${t}</div>`);setTimeout(()=>{const b=el.querySelector('.bubble');b&&b.remove()},1300)}
  function react(k,kind,ms){const d=D[k];const now=performance.now()/1000;
    if(kind==='happy'){d.gp='beg';d.gpT=now+(ms||1500)/1000;hearts(d,4)}
    else if(kind==='eating'){d.gp='bow';d.gpT=now+(ms||900)/1000}
    else if(kind==='nope'){d.gp='lie';d.gpT=now+.9}
    d.wagBoost=now+2}
  function cheer(){Object.values(D).forEach(d=>{if(d.st!=='walk')setState(d,'beg',2.2);hearts(d,4)})}
  addEventListener('visibilitychange',()=>{last=performance.now()});
  return{mount,tap,react,cheer,D,RIG,IMG,ready:()=>loaded===total,_step:step,_setState:setState};
})();
