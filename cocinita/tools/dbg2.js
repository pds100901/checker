const {chromium}=require('playwright');const {start,store,MOCK}=require('./testlib');
const iso=n=>{const d=new Date();d.setDate(d.getDate()+n);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
(async()=>{const srv=await start(8793);const b=await chromium.launch();const c=await b.newContext({viewport:{width:390,height:800},isMobile:true,hasTouch:true});await c.addInitScript(MOCK);const p=await c.newPage();p.on('pageerror',e=>console.log('ERR',e.message));
await p.goto('http://localhost:8793/');await p.waitForTimeout(900);
const act=s=>p.evaluate(s=>document.querySelector(s).dispatchEvent(new MouseEvent('click',{bubbles:true,clientX:100,clientY:100})),s);
for(let k=0;k<6;k++){await act('nav [data-tab=sala]');await act('.svcrow[data-svc=net]');await p.fill('#b-amount','100');await p.fill('#b-due',iso(-2));await act('[data-act=billAdd]');await act('[data-act=closeSheet]');
await act('nav [data-tab=cocina]');await act('[data-act=newItem]');await p.fill('#f-name','Leche'+k);await act('[data-act=saveNew]');await p.waitForTimeout(700);
console.log(k,Object.values(store.docs).some(d=>d.name==='Leche'+k),JSON.stringify(await p.evaluate(()=>({q:SYNC_TEST.queue.map(x=>x.path),fl:SYNC_TEST.flushing,err:SYNC_TEST.err,st:SYNC_TEST.state}))))}
await b.close();srv.close()})();
