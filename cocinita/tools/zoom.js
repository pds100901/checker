const {chromium}=require('playwright');const {start,MOCK}=require('./testlib');const OUT=process.argv[2];
(async()=>{const srv=await start(8767);const b=await chromium.launch();
const ctx=await b.newContext({viewport:{width:420,height:900},deviceScaleFactor:3});await ctx.addInitScript(MOCK);
const p=await ctx.newPage();await p.goto('http://localhost:8767/');await p.waitForTimeout(1200);
await p.evaluate(()=>{document.querySelector('#toast').style.display='none';const D=PETS_TEST.D;D.rosco.room=D.mali.room='sala';[['mali',40],['rosco',180]].forEach(([k,x])=>{const d=D[k];d.x=x;d.dir=1;d.tx=900;d.st='walk';d.dur=99;d.goRoom=null})});
for(let i=0;i<4;i++){await p.waitForTimeout(110);const r=await p.evaluate(()=>{const e=document.querySelector('.room').getBoundingClientRect();return{x:e.left,y:e.top+e.height*.7,width:e.width,height:e.height*.3}});await p.screenshot({path:`${OUT}/z${i}.png`,clip:r})}
await b.close();srv.close()})();
