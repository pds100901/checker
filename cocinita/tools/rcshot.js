const {chromium}=require('playwright');const {start,MOCK}=require('./testlib');
(async()=>{const srv=await start(8790);const b=await chromium.launch();const c=await b.newContext({viewport:{width:390,height:800}});await c.addInitScript(MOCK);const p=await c.newPage();
await p.goto('http://localhost:8790/');await p.waitForTimeout(800);
const act=s=>p.evaluate(s=>document.querySelector(s).dispatchEvent(new MouseEvent('click',{bubbles:true})),s);
await act('nav [data-tab=cocina]');await act('[data-act=receipt]');await p.setInputFiles('#rc-file','img/mali-beg.png');await p.waitForTimeout(600);
await p.evaluate(()=>document.querySelector('#toast').style.display='none');await p.screenshot({path:process.argv[2]});await b.close();srv.close()})();
