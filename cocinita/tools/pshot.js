const {chromium}=require('playwright');const {start,MOCK}=require('./testlib');const OUT=process.argv[2];
(async()=>{const srv=await start(8795);const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});const c=await b.newContext({viewport:{width:390,height:800},deviceScaleFactor:2});await c.addInitScript(MOCK);const p=await c.newPage();p.on('pageerror',e=>console.log('ERR',e.message));
await p.goto('http://localhost:8795/');await p.waitForTimeout(700);
const act=s=>p.evaluate(s=>document.querySelector(s).dispatchEvent(new MouseEvent('click',{bubbles:true})),s);
await act('nav [data-tab=cocina]');
for(const [n,e,sh] of [['Leche','🥛',1],['Queso','🧀',1],['Huevos','🥚',1],['Fresas','🍓',2],['Atún','🥫',2],['Pollo','🍗',2],['Jugo','🧃',3],['Tomates','🍅',3]]){await act('[data-act=newItem]');await p.fill('#f-name',n);await act('[data-act=togglePicker]');await p.evaluate(e=>document.querySelector(`[data-act=pickEmoji][data-e="${e}"]`).click(),e);await p.selectOption('#f-shelf',String(sh));await act('[data-act=saveNew]');await p.waitForTimeout(80)}
await act('nav [data-tab=bano]');await act('[data-act=house]');for(let i=0;i<3;i++)await act('[data-act=hPet][data-k=poop][data-d="1"]');for(let i=0;i<2;i++)await act('[data-act=hPet][data-k=pee][data-d="1"]');await act('[data-act=hMess][data-r=cocina]');await act('[data-act=closeSheet]');
await act('nav [data-tab=casa]');await p.waitForTimeout(4500);await p.evaluate(()=>{document.querySelector('#toast').style.display='none'});
await p.screenshot({path:OUT+'/p-home.png'});
await p.evaluate(()=>ISO_TEST.go('cocina'));await p.waitForTimeout(1300);const q=await p.evaluate(()=>ISO_TEST._pos('fbody'));await p.mouse.click(q.x,q.y);await p.waitForTimeout(1800);await p.screenshot({path:OUT+'/p-fr.png'});
await b.close();srv.close()})();
