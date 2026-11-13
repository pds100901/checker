// Tira de fotogramas de Rosco y Mali para revisar la animación (caminar, parpadeo, poses).
const {chromium}=require('playwright');const {start,MOCK}=require('./testlib');
const OUT=process.argv[2]||'.';
(async()=>{
  const srv=await start(8766);const b=await chromium.launch();
  const ctx=await b.newContext({viewport:{width:420,height:520},deviceScaleFactor:2});await ctx.addInitScript(MOCK);
  const p=await ctx.newPage();p.on('pageerror',e=>console.log('ERR',e.message));
  await p.goto('http://localhost:8766/');await p.waitForTimeout(1200);
  await p.evaluate(()=>{document.querySelector('#toast').style.display='none'});
  const clip=async n=>{const r=await p.evaluate(()=>{const e=document.querySelector('.room').getBoundingClientRect();return{x:e.left,y:e.top+e.height*.62,width:e.width,height:e.height*.38}});await p.screenshot({path:`${OUT}/${n}.png`,clip:r})};
  const set=(fn)=>p.evaluate(fn);
  // caminar: 6 fotogramas
  await set(()=>{const D=PETS_TEST.D;D.rosco.room=D.mali.room='sala';D.mali.x=60;D.mali.dir=1;D.mali.tx=900;D.mali.st='walk';D.mali.dur=99;D.mali.goRoom=null;D.rosco.x=200;D.rosco.dir=1;D.rosco.tx=900;D.rosco.st='walk';D.rosco.dur=99;D.rosco.goRoom=null});
  for(let i=0;i<6;i++){await p.waitForTimeout(70);await clip('walk'+i)}
  const pose=async(st,n,extra)=>{await p.evaluate(([st,extra])=>{const D=PETS_TEST.D;D.mali.x=90;D.rosco.x=250;D.mali.dir=1;D.rosco.dir=-1;[D.mali,D.rosco].forEach(d=>{d.st=st;d.t=0;d.dur=99;d.pop=1;d.bl=extra==='blink'?5:0;d.blink=99})},[st,extra]);await p.waitForTimeout(350);await clip(n)};
  await pose('sit','sit');await pose('sit','blink','blink');await pose('lie','lie');await pose('sleep','sleep');await pose('bow','bow');await pose('beg','beg');
  await b.close();srv.close();
})();
