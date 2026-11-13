/* =====================================================================
   MOTOR VISUAL 2.5D (PixiJS). Solo dibuja, anima y avisa qué se tocó.
   No conoce el inventario: recibe un "api" con datos ya resumidos
   y funciones para avisar a la aplicación (abrir refri, buzón, etc.).
   ===================================================================== */
const ISO=(()=>{
  const AR=ISO_ART,U=AR.U,K=2,pr=AR.pr,H=AR.H,A=AR.A;
  let app=null,world=null,ui=null,host=null,api=null,ready=false,failed=false,loading=false;
  let view='home',cam={x:0,y:0,s:.3},tw=null,objs={},pins=[],labels=[],dogs={},fridge=null,parts=[],shaft=null,dark=false,userMoved=false,bottomPad=0;
  const ROOMSB={cocina:[0,6.5,0,6],bano:[6.5,11,0,5],lavanderia:[0,5,6,10.5]};
  const NAMES={cocina:'Cocina',bano:'Baño',lavanderia:'Lavandería'};
  const FX=5.0,FY=.05;                                   // posición de la refri
  const wY1=Object.assign(AR.wallS('y',0,0,6),{nx:1,ny:0}),wY2=Object.assign(AR.wallS('y',0,6,4.5),{nx:1,ny:0}),wX1=Object.assign(AR.wallS('x',0,0,6.5),{nx:0,ny:1}),wX2=Object.assign(AR.wallS('x',6.5,0,4.5),{nx:0,ny:1});
  /* lista de objetos de la escena: [id, fábrica, profundidad, habitación, acción] */
  function sceneList(){
    const a=AR.A,L=[];
    const add=(id,f,dep,room,act,label)=>L.push({id,f,dep,room,act,label});
    add('ground',a.ground,-1e3);
    add('kfloor',a.floor(0,0,6.5,6,'#FFF7EA','#FBE3DC'),-900,'cocina');
    add('bfloor',a.floor(6.5,0,4.5,5,'#FFFDF6','#E6F3EC'),-900,'bano');
    add('lfloor',a.floor(0,6,5,4.5,'#EFC9A0','#EFC9A0','wood'),-900,'lavanderia');
    add('wallY1',a.wallY(0,6,'#F9CEC6',(g,S)=>{AR.windowOn(g,S,.36,.4,.58,.8);AR.sconce(g,S,.2,.62,1.1);AR.sconce(g,S,.74,.62,1.1);AR.garland(g,S,7)}),-800,'cocina');
    add('wallY2',a.wallY(6,4.5,'#F7D9D2',(g,S)=>{AR.windowOn(g,S,.1,.42,.32,.8)}),-800,'lavanderia');
    add('wallX1',a.wallX(0,6.5,'#F9CEC6',(g,S)=>{for(let i=0;i<11;i++)for(let j=0;j<3;j++)g.rect(S,.28+i*.048,.365+j*.085,.28+(i+1)*.048,.365+(j+1)*.085,(i+j)%2?'#FFF6E2':'#FFEFD2',{stroke:'#EBCFA8',sw:1.2});AR.sconce(g,S,.93,.62,1);AR.garland(g,S,8)}),-800,'cocina');
    add('wallX2',a.wallX(6.5,4.5,'#F9D7D0',(g,S)=>{for(let i=0;i<9;i++)for(let j=0;j<4;j++)g.rect(S,i/9,.07+j*.1,(i+1)/9,.07+(j+1)*.1,(i+j)%2?'#FFFDF6':'#EAF6F0',{stroke:'#C9E0D4',sw:1.2});g.rect(S,0,.47,1,.5,'#F7B3A9',{sw:1.6});AR.windowOn(g,S,.62,.58,.84,.88);AR.sconce(g,S,.08,.7,1.4);AR.sconce(g,S,.46,.7,1.4)}),-800,'bano');
    add('shaft',a.shaft(2.3,4.2,1.75,3.25,3.4),-700,'cocina');
    add('curb1',a.curb(6.4,0,.2,5),6.5+2.5,'bano');
    add('curb2',a.curb(0,5.9,5,.2),2.5+6,'lavanderia');
    add('krug',a.rug(3.5,3.6,1.6,1.25,'#FFF6E2','#E4574B'),-690,'cocina');
    add('pantry',a.pantry(.25,FY),.25+1.5+FY+1.05,'cocina','pantry','Alacena');
    add('stove',a.stove(1.85,FY),1.85+1.45+FY+1.1,'cocina','stove');
    add('pot',a.pot(2.25,.45,1.5),1.85+1.45+FY+1.1+.01,'cocina','stove');
    add('kettle',a.kettle(2.95,.75,1.5),1.85+1.45+FY+1.1+.02,'cocina','stove');
    add('hood',a.hood(1.85,FY),1.85+1.45+FY+1.1+.03,'cocina');
    add('sink',a.sink(3.35,FY),3.35+1.9+FY+1.1,'cocina','sink');
    add('kshelf',a.shelfWall(wX1,.56,.74,.66,[[.15,.3,'#F7B3A9',.11],[.42,.24,'#FFD979',.1,'#8E6BC0'],[.68,.34,'#CDE8D8',.11,'#7FA050'],[.9,.22,'#FFF6E2',.09]]),3.35+1.9+FY+1.1+.01,'cocina');
    add('table',a.table(.3,2.7),.3+1.3+2.7+1.3,'cocina');
    add('fbody',a.fridgeBody(FX,FY),FX+1.45+FY+1.15-.3,'cocina','fridge','Refri');
    add('vanity',a.vanity(6.95,FY),6.95+1.5+FY+.95,'bano','vanity','Gabinete');
    add('mirror',a.mirror(wX2,.27,.66),6.95+1.5+FY+.95+.01,'bano');
    add('tub',a.tub(8.55,.1),8.55+2.3+.1+1.15,'bano','tub');
    add('mat',a.mat(8.9,1.7),-690,'bano');
    add('bplant',a.plant(7.3,4.2,1),7.3+4.2+.6,'bano');
    add('washer',a.washer(.05,6.55,'#FFF6E2'),.05+1.1+6.55+1.3,'lavanderia','laundry','Lavadora');
    add('dryer',a.washer(.05,8,'#FFD8D3'),.05+1.1+8+1.3,'lavanderia','laundry');
    add('lshelf',a.shelfWall(wY2,.42,.92,.66,[[.12,.36,'#8EB8D0',.12],[.34,.28,'#F6B5AE',.11,'#8E6BC0'],[.56,.38,'#FFFDF6',.12,'#4A8BB0'],[.8,.26,'#CDE8D8',.1,'#7FA050']]),.05+1.1+8+1.3+.01,'lavanderia');
    add('lrug',a.rug(2.9,8.4,1.3,1.1,'#CFE6EE','#FFFDF6'),-690,'lavanderia');
    for(let l=0;l<4;l++)add('basket'+l,a.basketL(.6,9.95,l),.6+9.95+.5,'lavanderia','basket');
    add('pile',a.pile(1.7,10.0),-680,'lavanderia','basket');
    [['cocina',2.6,4.9,'sock'],['cocina',4.9,2.7,'ball'],['cocina',1.7,1.9,'paper'],['cocina',5.5,4.7,'cup'],['cocina',3.1,2.2,'bone'],
     ['bano',8.0,3.3,'sock'],['bano',9.9,3.0,'paper'],['bano',7.6,1.7,'cup'],['lavanderia',2.0,7.2,'sock'],['lavanderia',3.7,9.0,'paper'],['lavanderia',4.4,7.9,'ball']]
      .forEach((c,i)=>{add('mess'+i,a.clutter(c[1],c[2],c[3]),c[1]+c[2]+.1,c[0],'mess');L[L.length-1].grp='mess:'+c[0]});
    [['cocina',4.4,4.9,.5],['cocina',2.2,3.9,.4],['cocina',5.6,2.1,.45],['bano',8.4,3.9,.5],['bano',10,1.9,.4],['lavanderia',2.6,7.5,.45],['lavanderia',3.9,9.9,.5]]
      .forEach((c,i)=>{add('dirt'+i,a.stain(c[1],c[2],c[3]),-685+i*.01,c[0],'dirt');L[L.length-1].grp='dirt';L[L.length-1].n=i});
    add('vine1',a.vine(-.2,.2,H,0,.62,5),-750);add('vine2',a.vine(.5,-.2,H,.62,0,4),-749);add('vine3',a.vine(-.2,8.6,H,0,.6,4),-748);add('vine4',a.vine(9.2,-.2,H,.6,0,4),-747);
    add('stool1',a.stool(2.0,3.3),2.0+3.3+.3,'cocina');add('stool2',a.stool(1.1,4.5,'#FFD979'),1.1+4.5+.3,'cocina');
    add('ftop',a.fridgeTop(FX,FY,3.25),FX+1.45+FY+1.15-.28,'cocina','fridge');
    add('toaster',a.toaster(3.42,.2,1.5),3.35+1.9+FY+1.1+.012,'cocina');
    add('dishes',a.dishes(4.05,.72,1.5),3.35+1.9+FY+1.1+.03,'cocina');
    add('jars',a.jars(4.55,.22,1.5),3.35+1.9+FY+1.1+.02,'cocina');
    add('khang',a.hang(wX1,.56,.74,.645),3.35+1.9+FY+1.1+.015,'cocina');
    add('kframe',a.frame(wY1,.9,.6),-799,'cocina');
    add('kroses',a.roses(.75,5.3,0,'#F7B3A9'),.75+5.3+.3,'cocina');
    add('proses',a.roses(1.0,.55,3.49),.25+1.5+FY+1.05+.01,'cocina');
    add('broses',a.roses(10.5,4.3,0,'#C9B0E8'),10.5+4.3+.3,'bano');
    add('lroses',a.roses(4.3,6.7,0,'#FFD979'),4.3+6.7+.3,'lavanderia');
    add('lstool',a.stool(4.2,9.8,'#C9B0E8'),4.2+9.8+.3,'lavanderia');
    add('groses',a.roses(6.0,7.2,-.02),6.0+7.2+.3);add('groses2',a.roses(10.6,10.4,-.02,'#F7B3A9'),10.6+10.4+.3);
    add('bush1',a.bush(6.4,10.6,.7),6.4+10.6+.9);
    add('bush2',a.bush(10.8,6.3,.6),10.8+6.3+.8);
    add('mailbox',a.mailbox(8.3,7.8),8.3+7.8+.5,null,'mailbox','Buzón');
    add('letter',a.letter(8.3,7.8),8.3+7.8+.52,null,'mailbox');
    add('fglow',a.fridgeGlow(FX,FY),FX+1.45+FY+1.15-.25,'cocina');
    return L;
  }
  const DOOR_A=[0,16,34,52,70,88,104];
  function svgTex(o){return new Promise((res,rej)=>{const im=new Image();im.onload=()=>{const t=PIXI.Texture.from(im);t.baseTexture.mipmap=PIXI.MIPMAP_MODES.ON;res(t)};im.onerror=()=>rej(new Error('svg'));im.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(o.svg)})}
  function imgTex(src){return new Promise((res,rej)=>{const im=new Image();im.onload=()=>{const t=PIXI.Texture.from(im);t.baseTexture.mipmap=PIXI.MIPMAP_MODES.ON;res(t)};im.onerror=()=>rej(new Error(src));im.src=src})}
  async function mk(def){const o=def.f().svg(K),t=await svgTex(o),s=new PIXI.Sprite(t);s.scale.set(1/K);s.position.set(o.x,o.y);s.zIndex=def.dep;s._b={x:o.x,y:o.y,w:o.w,h:o.h};return s}

  async function build(){
    app=new PIXI.Application({backgroundAlpha:0,antialias:true,resolution:Math.min(window.devicePixelRatio||1,2.5),autoDensity:true,width:300,height:300});
    world=new PIXI.Container();world.sortableChildren=true;app.stage.addChild(world);
    app.stage.eventMode='static';app.stage.hitArea={contains:()=>true};
    const list=sceneList();
    const sprites=await Promise.all(list.map(mk));
    list.forEach((d,i)=>{const s=sprites[i];s.name=d.id;world.addChild(s);objs[d.id]={s,def:d};
      if(d.id==='shaft'){s.blendMode=PIXI.BLEND_MODES.SCREEN;s.alpha=.85;shaft=s;return}
      if(d.id==='fglow'){s.blendMode=PIXI.BLEND_MODES.SCREEN;s.alpha=0;s.eventMode='none';return}
      if(d.room||d.act){s.eventMode='static';s.cursor='pointer';s.on('pointertap',e=>tapObj(d,s,e))}});
    /* refri: puerta (un sprite por ángulo) y productos sobre los estantes */
    const dt=await Promise.all(DOOR_A.map(a=>{const o=AR.A.fridgeDoor(FX,FY,a)().svg(K);return svgTex(o).then(t=>({t,o}))}));
    const door=new PIXI.Sprite(dt[0].t);door.scale.set(1/K);door.position.set(dt[0].o.x,dt[0].o.y);door.zIndex=FX+1.45+FY+1.15+.4;door.eventMode='static';door.cursor='pointer';
    door.on('pointertap',e=>tapObj(objs.fbody.def,objs.fbody.s,e));world.addChild(door);
    const itemsC=new PIXI.Container();itemsC.zIndex=FX+1.45+FY+1.15-.2;itemsC.alpha=0;world.addChild(itemsC);
    fridge={door,frames:dt,itemsC,open:0,target:0,glow:objs.fglow.s,texCache:{}};
    /* marcadores de objetos tocables */
    const pinT=await svgTex(AR.A.pin().svg(K)),heartT=await svgTex(AR.A.heart().svg(K));
    [['fbody',FX+.7,FY+.6,4.15],['pantry',1,.6,3.75],['washer',.6,7.2,1.85],['mailbox',8.3,7.8,2.0],['vanity',7.7,.5,2.0]].forEach(p=>{const s=new PIXI.Sprite(pinT);s.anchor.set(.5,1);s.scale.set(.5/K*1.6);const q=pr(p[1],p[2],p[3]);s.position.set(q[0],q[1]);s._y=q[1];s.zIndex=900;s.eventMode='none';s._for=p[0];world.addChild(s);pins.push(s)});
    /* Rosco y Mali: ilustraciones originales sobre una malla que respira y mueve la cola */
    const DG={mali:{x:3.9,y:3.9,room:'cocina',tail:{x0:0,x1:46,base:246,top:158},sc:.36},rosco:{x:2.9,y:8.5,room:'lavanderia',tail:{x0:0,x1:42,base:306,top:212},sc:.36}};
    for(const k of Object.keys(DG)){
      const [th,tb]=await Promise.all([imgTex(`img/${k}-hero.png`),imgTex(`img/${k}-beg.png`)]),c=DG[k];
      const cont=new PIXI.Container(),q=pr(c.x,c.y,0);cont.position.set(q[0],q[1]);cont.zIndex=c.x+c.y+.4;
      const sh=new PIXI.Graphics();sh.beginFill(0x4A2410,.2).drawEllipse(0,-2,th.width*c.sc*.4,9).endFill();cont.addChild(sh);
      const mesh=new PIXI.SimplePlane(th,7,9);mesh.scale.set(c.sc);mesh.pivot.set(th.width/2,th.height);cont.addChild(mesh);
      const beg=new PIXI.Sprite(tb);beg.anchor.set(.5,1);beg.scale.set(c.sc);beg.visible=false;cont.addChild(beg);
      const buf=mesh.geometry.getBuffer('aVertexPosition');
      cont.eventMode='static';cont.cursor='pointer';cont.hitArea=new PIXI.Rectangle(-th.width*c.sc/2,-th.height*c.sc,th.width*c.sc,th.height*c.sc);
      const d={k,cont,mesh,beg,buf,base:Float32Array.from(buf.data),w:th.width,h:th.height,tail:c.tail,t:Math.random()*5,react:0,room:c.room,hearts:[],heartT};
      cont.on('pointertap',e=>{if(moved(e))return;if(view==='home'){go(c.room);return}petTap(d)});
      world.addChild(cont);dogs[k]=d;
    }
    /* partículas: motas de luz y vapor */
    for(let i=0;i<16;i++){const g=new PIXI.Graphics();g.beginFill(0xFFF6D8,.9).drawCircle(0,0,2.2).endFill();g.zIndex=950;g.eventMode='none';g._k=i<10?'dust':'steam';g._t=Math.random();world.addChild(g);parts.push(g)}
    bindCamera();
    app.ticker.add(tick);
    ready=true;
  }
  /* ---------- cámara ---------- */
  function boundsOf(b,z0,z1){const P=[];[b[0],b[1]].forEach(x=>[b[2],b[3]].forEach(y=>[z0,z1].forEach(z=>P.push(pr(x,y,z)))));
    const xs=P.map(p=>p[0]),ys=P.map(p=>p[1]);return{x0:Math.min(...xs),x1:Math.max(...xs),y0:Math.min(...ys),y1:Math.max(...ys)}}
  function targetFor(v){
    const W=app.renderer.width/app.renderer.resolution,Hh=app.renderer.height/app.renderer.resolution;
    let b,top=46,bot=16+bottomPad,side=10;
    if(v==='home')b=boundsOf([-.5,11.8,-.5,11.8],-1.5,H+.7);
    else if(v==='fridge'){b=boundsOf([FX-1.5,FX+1.6,FY,FY+2.7],0,3.6);top=54}
    else{b=boundsOf(ROOMSB[v],-.3,H+.2);top=50}
    const s=Math.min((W-2*side)/(b.x1-b.x0),(Hh-top-bot)/(b.y1-b.y0));
    return{s,x:W/2-(b.x0+b.x1)/2*s,y:top+(Hh-top-bot)/2-(b.y0+b.y1)/2*s};
  }
  function flyTo(v,ms){const t=targetFor(v);tw={from:{...cam},to:t,t:0,ms:ms||750};userMoved=false}
  function applyCam(){world.scale.set(cam.s);world.position.set(cam.x,cam.y)}
  let ptrs=new Map(),dragD=0,pinch0=null;
  const moved=()=>dragD>8;
  function bindCamera(){
    const st=app.stage;
    st.on('pointerdown',e=>{ptrs.set(e.pointerId,{x:e.global.x,y:e.global.y});if(ptrs.size===1)dragD=0;if(ptrs.size===2){const p=[...ptrs.values()];pinch0={d:Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y),s:cam.s,cx:(p[0].x+p[1].x)/2,cy:(p[0].y+p[1].y)/2,x:cam.x,y:cam.y}}});
    st.on('pointermove',e=>{const p=ptrs.get(e.pointerId);if(!p)return;const dx=e.global.x-p.x,dy=e.global.y-p.y;
      if(ptrs.size===1){dragD+=Math.abs(dx)+Math.abs(dy);if(dragD>8){tw=null;cam.x+=dx;cam.y+=dy;userMoved=true;applyCam()}}
      p.x=e.global.x;p.y=e.global.y;
      if(ptrs.size===2&&pinch0){const q=[...ptrs.values()],d=Math.hypot(q[0].x-q[1].x,q[0].y-q[1].y);zoomAt(pinch0.cx,pinch0.cy,pinch0.s*d/pinch0.d,pinch0);dragD=99}});
    const up=e=>{ptrs.delete(e.pointerId);if(ptrs.size<2)pinch0=null};
    st.on('pointerup',up);st.on('pointerupoutside',up);st.on('pointercancel',up);
    app.view.addEventListener('wheel',e=>{e.preventDefault();const r=app.view.getBoundingClientRect();zoomAt(e.clientX-r.left,e.clientY-r.top,cam.s*(e.deltaY<0?1.12:.89))},{passive:false});
  }
  function zoomAt(cx,cy,s,base){const min=targetFor('home').s*.8,max=2.4;s=Math.max(min,Math.min(max,s));const b=base||cam;const wx=(cx-b.x)/b.s,wy=(cy-b.y)/b.s;tw=null;cam.s=s;cam.x=cx-wx*s;cam.y=cy-wy*s;userMoved=true;applyCam()}
  /* ---------- interacción ---------- */
  function bounce(s){s._bn=1}
  function tapObj(d,s,e){
    if(moved())return;
    if(view==='home'){if(d.act==='mailbox'){bounce(objs.mailbox.s);api.onMailbox&&api.onMailbox();return}if(d.room)go(d.room);return}
    if(view==='fridge'){if(d.act==='fridge')closeFridge();return}
    if(d.room&&d.room!==view){go(d.room);return}
    if(!d.act)return;
    bounce(d.id==='pot'||d.id==='kettle'?objs.stove.s:s);
    if(d.act==='fridge')openFridge();
    else if(d.act==='mailbox')api.onMailbox&&api.onMailbox();
    else api.onObject&&api.onObject(d.act,d.id,d.room);
  }
  function go(v){if(view==='fridge'&&v!=='fridge'){fridge.target=0;api.onFridge&&api.onFridge(false)}view=v;bottomPad=0;flyTo(v);syncUi()}
  function openFridge(){view='fridge';fridge.target=1;refreshItems();bottomPad=(app.renderer.height/app.renderer.resolution)*.5;flyTo('fridge',800);syncUi();api.onFridge&&api.onFridge(true)}
  function closeFridge(){fridge.target=0;view='cocina';bottomPad=0;flyTo('cocina',700);syncUi();api.onFridge&&api.onFridge(false)}
  function petTap(d){d.react=1.7;d.t0=performance.now();for(let i=0;i<3;i++){const h=new PIXI.Sprite(d.heartT);h.anchor.set(.5);h.scale.set(.42);h.zIndex=960;h._t=-i*.2;h._x=(i-1)*18;world.addChild(h);d.hearts.push(h)}api.onPet&&api.onPet(d.k)}
  /* productos reales dentro de la refri */
  async function refreshItems(){
    if(!fridge||!api)return;const list=api.fridgeItems()||[];const c=fridge.itemsC;c.removeChildren();
    const rows={top:1.61,mid:.91,low:.22},cnt={top:0,mid:0,low:0};
    for(const it of list){const r=it.row||'mid';if(cnt[r]>=4)continue;const i=cnt[r]++;
      let t=fridge.texCache[it.icon];if(!t){try{t=await svgTex({svg:it.svg});fridge.texCache[it.icon]=t}catch(e){continue}}
      const s=new PIXI.Sprite(t);s.anchor.set(.5,1);const q=pr(FX+.24+i*.27,FY+.98-(i%2)*.2,rows[r]);s.position.set(q[0],q[1]);s.width=s.height=U*.56;c.addChild(s)}
  }
  /* ---------- cuadro a cuadro ---------- */
  function tick(){
    const dt=Math.min(.05,app.ticker.deltaMS/1000),now=performance.now()/1000;
    if(tw){tw.t+=dt*1000;const k=Math.min(1,tw.t/tw.ms),e=k<.5?4*k*k*k:1-Math.pow(-2*k+2,3)/2;cam.s=tw.from.s+(tw.to.s-tw.from.s)*e;cam.x=tw.from.x+(tw.to.x-tw.from.x)*e;cam.y=tw.from.y+(tw.to.y-tw.from.y)*e;applyCam();if(k>=1)tw=null}
    /* puerta */
    if(fridge){const sp=dt/.5;fridge.open+=Math.max(-sp,Math.min(sp,fridge.target-fridge.open));const e=fridge.open*fridge.open*(3-2*fridge.open);
      const i=Math.round(e*(DOOR_A.length-1)),f=fridge.frames[i];if(fridge.door.texture!==f.t){fridge.door.texture=f.t;fridge.door.position.set(f.o.x,f.o.y)}
      fridge.itemsC.alpha=Math.min(1,e*3);fridge.glow.alpha=dark?0:e*.4}
    /* marcadores */
    pins.forEach((p,i)=>{const vis=(view==='home'&&p._for==='mailbox')||(view==='cocina'&&(p._for==='fbody'||p._for==='pantry'))||(view==='lavanderia'&&p._for==='washer')||(view==='bano'&&p._for==='vanity');
      p.alpha+=((vis?1:0)-p.alpha)*.15;p.y=p._y+Math.sin(now*2.4+i)*5});
    /* rebote al tocar */
    Object.values(objs).forEach(o=>{const s=o.s;if(s._bn>0){s._bn-=dt*2.6;const k=Math.max(0,s._bn),a=Math.sin((1-k)*Math.PI*3)*k*.045;s.scale.set((1+a)/K,(1-a)/K);s.position.set(s._b.x-s._b.w*a/2,s._b.y+s._b.h*a);if(k<=0){s.scale.set(1/K);s.position.set(s._b.x,s._b.y)}}});
    /* perros */
    Object.values(dogs).forEach(d=>{d.t+=dt;const b=d.base,v=d.buf.data,br=Math.sin(d.t*2.3)*2.2,wag=Math.sin(d.t*(d.react>0?15:5.5))*(d.react>0?9:6),T=d.tail;
      for(let i=0;i<b.length;i+=2){const x=b[i],y=b[i+1];let nx=x,ny=y;const u=1-y/d.h;ny=y-br*Math.max(0,Math.min(1,(u-.15)/.6));
        if(x<T.x1+12&&y<T.base&&y>T.top-30){const f=Math.pow(Math.min(1,(T.base-y)/(T.base-T.top)),1.3)*Math.max(0,Math.min(1,(T.x1+12-x)/30));nx=x+wag*f}
        v[i]=nx;v[i+1]=ny}
      d.buf.update();
      if(d.react>0){d.react-=dt;const k=1.7-d.react;d.mesh.visible=false;d.beg.visible=true;d.beg.y=-Math.abs(Math.sin(k*7))*10*Math.max(0,1-k/1.4);if(d.react<=0){d.mesh.visible=true;d.beg.visible=false}}
      d.hearts=d.hearts.filter(h=>{h._t+=dt;if(h._t<0){h.alpha=0;return true}const p=h._t/1.3;h.alpha=1-p*p;h.position.set(d.cont.x+h._x+Math.sin(p*7+h._x)*5,d.cont.y-d.h*.36*.9-p*46);if(p>=1){h.destroy();return false}return true})});
    /* partículas */
    parts.forEach((g,i)=>{g._t+=dt*(g._k==='dust'?.09:.5);if(g._t>1)g._t-=1;const t=g._t;
      if(g._k==='dust'){const q=pr(.6+((i*37)%20)/10,2.4+((i*53)%18)/10,.4+t*2.6);g.position.set(q[0]+Math.sin(t*9+i)*6,q[1]);g.alpha=dark?0:Math.sin(t*Math.PI)*.75;g.scale.set(.8+((i*7)%5)/6)}
      else{const q=pr(2.25+(i%3)*.08,.45,1.9+t*.9);g.position.set(q[0]+Math.sin(t*6+i)*5,q[1]);g.alpha=dark?0:Math.sin(t*Math.PI)*.6;g.scale.set(1.6+t*2.4)}});
    /* etiquetas de habitaciones */
    labels.forEach(l=>{const q=pr(l.p[0],l.p[1],l.p[2]);l.el.style.transform=`translate(-50%,-50%) translate(${(q[0]*cam.s+cam.x).toFixed(1)}px,${(q[1]*cam.s+cam.y).toFixed(1)}px)`});
  }
  function setHouse(){if(!ready||!api.house)return;const h=api.house();
    for(let l=0;l<4;l++)objs['basket'+l].s.visible=l===Math.min(3,h.laundry);objs.pile.s.visible=h.laundry>=3;
    Object.values(objs).forEach(o=>{const g=o.def.grp;if(!g)return;if(g==='dirt')o.s.visible=h.dirty>0&&o.def.n<(h.dirty>=3?7:h.dirty===2?5:3);else o.s.visible=!!h.mess[g.slice(5)]})}
  function setDark(v){if(v===dark&&setDark._done)return;dark=v;setDark._done=true;const t=v?0x7F7AAE:0xFFFFFF;
    Object.values(objs).forEach(o=>{if(o.def.id!=='shaft'&&o.def.id!=='fglow')o.s.tint=t});if(fridge)fridge.door.tint=t;Object.values(dogs).forEach(d=>{d.mesh.tint=t;d.beg.tint=t});if(shaft)shaft.visible=!v}
  /* ---------- interfaz mínima sobre el lienzo ---------- */
  function syncUi(){
    if(!ui)return;ui.dataset.view=view;
    ui.querySelector('.isoBack').hidden=view==='home';
    ui.querySelector('.isoBack').textContent=view==='fridge'?'‹ Cerrar la refri':'‹ Ver toda la casa';
    ui.querySelector('.isoTitle').textContent=view==='home'?'Mi casita':view==='fridge'?'Refrigeradora':NAMES[view];
    ui.querySelector('.isoHint').textContent=view==='home'?'Tocá una habitación para entrar · arrastrá para moverte · pellizcá para acercar':view==='cocina'?'Tocá la refri o la alacena':view==='fridge'?'':view==='lavanderia'?'Tocá la lavadora o la canasta de ropa':view==='bano'?'Tocá el gabinete del lavamanos':'';
    labels.forEach(l=>l.el.hidden=view!=='home');
  }
  function makeUi(){
    ui=document.createElement('div');ui.className='isoUi';
    ui.innerHTML=`<button class="isoBack" hidden></button><div class="isoTitle"></div><div class="isoHint"></div><button class="isoState">🧹 Estado de la casa</button>`;
    ui.querySelector('.isoState').addEventListener('click',()=>api.onObject('house'));
    ui.querySelector('.isoBack').addEventListener('click',()=>{if(view==='fridge')closeFridge();else go('home')});
    [['cocina',[2.6,2.6,H+1.3]],['bano',[9.2,1.6,H+1.1]],['lavanderia',[1.2,8.6,H+1.1]]].forEach(r=>{const el=document.createElement('button');el.className='isoLabel';el.textContent=NAMES[r[0]];el.addEventListener('click',()=>go(r[0]));ui.appendChild(el);labels.push({el,p:r[1]})});
  }
  function resize(){if(!app||!host)return;const r=host.getBoundingClientRect();if(!r.width||!r.height)return;const W=Math.round(r.width),Hh=Math.round(r.height);
    if(app.renderer.width/app.renderer.resolution!==W||app.renderer.height/app.renderer.resolution!==Hh){app.renderer.resize(W,Hh);if(!userMoved){const t=targetFor(view);cam=t;tw=null;applyCam()}}}
  /* ---------- API pública ---------- */
  function mount(h,a){
    host=h;api=a;
    if(failed){h.innerHTML='<p class="isoFail">No se pudo cargar el motor gráfico en este dispositivo.</p>';return}
    if(!ready){if(loading)return;loading=true;h.classList.add('loading');
      if(typeof PIXI==='undefined'){failed=true;loading=false;h.classList.remove('loading');mount(h,a);return}
      build().then(()=>{loading=false;makeUi();if(host&&host.isConnected)mount(host,api)}).catch(e=>{console.error(e);failed=true;loading=false;if(host&&host.isConnected)mount(host,api)});return}
    h.classList.remove('loading');
    if(app.view.parentNode!==h){h.appendChild(app.view);h.appendChild(ui)}
    app.ticker.start();resize();
    if(!mount._first){mount._first=true;cam=targetFor('home');cam.s*=.86;cam.y+=30;applyCam();flyTo('home',1100)}
    setDark(!api.power());setHouse();syncUi();if(view==='fridge')refreshItems();
  }
  function pause(){if(app)app.ticker.stop()}
  addEventListener('resize',()=>{if(host&&host.isConnected)resize()});
  function _pos(id){const o=objs[id].s,r=app.view.getBoundingClientRect();return{x:r.left+(o._b.x+o._b.w/2)*cam.s+cam.x,y:r.top+(o._b.y+o._b.h*.6)*cam.s+cam.y}}
  return{_vis:()=>({basket3:objs.basket3.s.visible,pile:objs.pile.s.visible,messCocina:objs.mess0.s.visible,messBano:objs.mess5.s.visible,dirt:objs.dirt0.s.visible}),_items:()=>fridge?fridge.itemsC.children.length:0,_pos,mount,pause,go,closeFridge,get view(){return view},get ready(){return ready},_dbg:()=>({cam,view,open:fridge&&fridge.open,objs:Object.keys(objs).length})};
})();
