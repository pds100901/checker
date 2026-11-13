const {chromium}=require('playwright');const {start,MOCK}=require('./testlib');
(async()=>{const srv=await start(8792);const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});const c=await b.newContext({viewport:{width:390,height:800},deviceScaleFactor:2});await c.addInitScript(MOCK);const p=await c.newPage();p.on('pageerror',e=>console.log('ERR',e.message));
await p.goto('http://localhost:8792/');await p.waitForTimeout(800);
const act=s=>p.evaluate(s=>document.querySelector(s).dispatchEvent(new MouseEvent('click',{bubbles:true})),s);
await act('nav [data-tab=bano]');await p.fill('#chore-text-clean','Trapear');await p.fill('#chore-days-clean','1');await act('[data-act=choreAdd]');
await p.evaluate(()=>{});await act('[data-act=house]');await act('[data-act=hLaundry][data-l="3"]');await act('[data-act=hMess][data-r=cocina]');await act('[data-act=hMess][data-r=lavanderia]');await act('[data-act=closeSheet]');
await act('nav [data-tab=casa]');await p.waitForTimeout(4500);await p.evaluate(()=>{document.querySelector('#toast').style.display='none';ISO_TEST.go('lavanderia')});await p.waitForTimeout(1400);await p.screenshot({path:process.argv[2]});await b.close();srv.close()})();
