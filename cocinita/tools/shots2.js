const {chromium}=require('playwright');const {start,MOCK}=require('./testlib');const OUT=process.argv[2];
(async()=>{const srv=await start(8771);const b=await chromium.launch();
const c=await b.newContext({viewport:{width:390,height:800},deviceScaleFactor:1});await c.addInitScript(MOCK);const p=await c.newPage();p.on('pageerror',e=>console.log('ERR',e.message));
await p.goto('http://localhost:8771/');await p.waitForTimeout(1000);
const act=s=>p.evaluate(s=>document.querySelector(s).dispatchEvent(new MouseEvent('click',{bubbles:true})),s);
await act('nav [data-tab=cocina]');
for(const [n,q] of [['Leche',2],['Huevos',12]]){await act('[data-act=newItem]');await p.fill('#f-name',n);await p.fill('#f-qty',String(q));await act('[data-act=saveNew]');await p.waitForTimeout(150)}
await act('[data-act=tupNew]');await p.fill('#t-name','Arroz con pollo');await act('[data-act=tupDate][data-k=hoy]');await act('[data-act=tupDate][data-k="3d"]');await p.fill('#t-total','4');await act('[data-act=tupSave]');await p.waitForTimeout(1200);
await p.evaluate(()=>document.querySelector('#toast').style.display='none');
await p.screenshot({path:OUT+'/f-cocina.png',fullPage:true});
await act('.item.tup');await p.waitForTimeout(300);await p.screenshot({path:OUT+'/f-tup.png'});
await b.close();srv.close()})();
