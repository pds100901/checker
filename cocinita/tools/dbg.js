const {chromium}=require('playwright');const {start,store,MOCK}=require('./testlib');
(async()=>{const srv=await start(8791);const b=await chromium.launch();const c=await b.newContext({viewport:{width:390,height:800},isMobile:true,hasTouch:true});await c.addInitScript(MOCK);const p=await c.newPage();p.on('pageerror',e=>console.log('ERR',e.message));
await p.goto('http://localhost:8791/');await p.waitForTimeout(800);
const act=s=>p.evaluate(s=>document.querySelector(s).dispatchEvent(new MouseEvent('click',{bubbles:true})),s);
await act('nav [data-tab=bano]');await act('[data-act=bath]');await act('[data-act=bathAdd][data-n=Shampoo]');await p.waitForTimeout(200);
const bb=await p.evaluate(()=>{const r=document.querySelector('.botv').getBoundingClientRect();return{x:r.left+r.width/2,y:r.top+r.height*.24+(r.height*.73)*.8,r:[r.top,r.height]}});
console.log(bb);await p.touchscreen.tap(bb.x,bb.y);await p.waitForTimeout(900);
console.log(Object.values(store.docs).filter(d=>d.name==='Shampoo').map(d=>d.level),await p.evaluate(()=>document.querySelector('.botpct').textContent));
await p.screenshot({path:process.argv[2]});await b.close();srv.close()})();
