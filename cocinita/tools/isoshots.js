const {chromium}=require('playwright');const {start,MOCK}=require('./testlib');const OUT=process.argv[2];
(async()=>{const srv=await start(8780);const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
const c=await b.newContext({viewport:{width:390,height:800},deviceScaleFactor:2});await c.addInitScript(MOCK);const p=await c.newPage();
p.on('pageerror',e=>console.log('ERR',e.message));p.on('console',m=>{if(m.type()==='error')console.log('console',m.text().slice(0,300))});
await p.goto('http://localhost:8780/');await p.waitForTimeout(600);
const act=s=>p.evaluate(s=>document.querySelector(s).dispatchEvent(new MouseEvent('click',{bubbles:true})),s);
// algunos productos reales de prueba para ver los estantes
await act('nav [data-tab=cocina]');
for(const [n,e] of [['Leche','🥛'],['Queso','🧀'],['Fresas','🍓'],['Tomates','🍅']]){await act('[data-act=newItem]');await p.fill('#f-name',n);await act('[data-act=togglePicker]');await p.evaluate(e=>document.querySelector(`[data-act=pickEmoji][data-e="${e}"]`).click(),e);await act('[data-act=saveNew]');await p.waitForTimeout(120)}
await act('nav [data-tab=casa]');await p.waitForTimeout(4500);
await p.evaluate(()=>document.querySelector('#toast').style.display='none');
console.log(JSON.stringify(await p.evaluate(()=>window.ISO_TEST&&ISO_TEST._dbg())));
await p.screenshot({path:OUT+'/iso-home.png'});
await p.evaluate(()=>ISO_TEST.go('cocina'));await p.waitForTimeout(1400);await p.screenshot({path:OUT+'/iso-cocina.png'});
// tocar la refri de verdad (clic en el lienzo)
const pos=await p.evaluate(()=>ISO_TEST._pos('fbody'));await p.mouse.click(pos.x,pos.y);await p.waitForTimeout(1800);await p.screenshot({path:OUT+'/iso-fridge.png'});
console.log(JSON.stringify(await p.evaluate(()=>ISO_TEST._dbg())),await p.evaluate(()=>!!document.querySelector('.isoPanel')));
await act('.isoBack');await p.waitForTimeout(1200);await p.evaluate(()=>ISO_TEST.go('bano'));await p.waitForTimeout(1300);await p.screenshot({path:OUT+'/iso-bano.png'});
await p.evaluate(()=>ISO_TEST.go('lavanderia'));await p.waitForTimeout(1300);await p.screenshot({path:OUT+'/iso-lav.png'});
await b.close();srv.close()})();
