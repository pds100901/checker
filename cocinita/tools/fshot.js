const {chromium}=require('playwright');const {start,MOCK}=require('./testlib');const OUT=process.argv[2];
(async()=>{const srv=await start(8794);const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});const c=await b.newContext({viewport:{width:390,height:800},deviceScaleFactor:2});await c.addInitScript(MOCK);const p=await c.newPage();p.on('pageerror',e=>console.log('ERR',e.message));
await p.goto('http://localhost:8794/');await p.waitForTimeout(700);
const act=s=>p.evaluate(s=>document.querySelector(s).dispatchEvent(new MouseEvent('click',{bubbles:true})),s);
await act('nav [data-tab=cocina]');
const items=[['Leche','🥛',4],['Jugo','🧃',4],['Huevos','🥚',4],['Mantequilla','🧈',4],['Queso','🧀',1],['Fresas','🍓',1],['Yogurt','🥣',2],['Pollo','🍗',0],['Camarones','🦐',0],['Lechuga','🥬',3],['Tomates','🍅',3],['Zanahorias','🥕',3]];
for(const [n,e,sh] of items){await act('[data-act=newItem]');await p.fill('#f-name',n);await act('[data-act=togglePicker]');await p.evaluate(e=>document.querySelector(`[data-act=pickEmoji][data-e="${e}"]`).click(),e);await p.selectOption('#f-shelf',String(sh));await act('[data-act=saveNew]');await p.waitForTimeout(80)}
await act('[data-act=tupNew]');await p.fill('#t-name','Arroz con pollo');await act('[data-act=tupDate][data-k=hoy]');await act('[data-act=tupDate][data-k="3d"]');await act('[data-act=tupSave]');await p.waitForTimeout(900);
await p.evaluate(()=>{document.querySelector('#toast').style.display='none';document.querySelector('.panel-title').scrollIntoView()});await p.waitForTimeout(200);
await p.screenshot({path:OUT+'/fr2.png',fullPage:true});
await act('nav [data-tab=casa]');await p.waitForTimeout(4500);await p.evaluate(()=>ISO_TEST.go('cocina'));await p.waitForTimeout(1400);await p.screenshot({path:OUT+'/k2.png'});
await b.close();srv.close()})();
