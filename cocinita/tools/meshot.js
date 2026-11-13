const {chromium}=require('playwright');const {start,MOCK}=require('./testlib');
(async()=>{const srv=await start(8797);const b=await chromium.launch();const c=await b.newContext({viewport:{width:390,height:800},deviceScaleFactor:2});await c.addInitScript(MOCK);const p=await c.newPage();p.on('pageerror',e=>console.log('ERR',e.message));
await p.goto('http://localhost:8797/');await p.waitForTimeout(700);
const act=s=>p.evaluate(s=>document.querySelector(s).dispatchEvent(new MouseEvent('click',{bubbles:true})),s);
await act('nav [data-tab=cocina]');await p.evaluate(()=>document.querySelector('[data-act=furn][data-k=pantry]').dispatchEvent(new MouseEvent('click',{bubbles:true})));
for(const n of ['Aceite','Salsa de tomate','Harina']){await act('[data-act=newItem]');await p.fill('#f-name',n);await act('[data-act=saveNew]');await p.waitForTimeout(100)}
await p.evaluate(()=>[...document.querySelectorAll('.item[data-act=openItem]')].find(e=>e.textContent.includes('Aceite')).click());await p.waitForTimeout(200);
await p.evaluate(()=>{const el=document.querySelector('.meterbig .botv'),r=el.getBoundingClientRect(),y=r.top+r.height*.97-(r.height*.73)*.55,o={bubbles:true,clientX:r.left+r.width/2,clientY:y,pointerId:1};el.dispatchEvent(new PointerEvent('pointerdown',o));document.dispatchEvent(new PointerEvent('pointerup',o))});await p.waitForTimeout(700);
await p.evaluate(()=>{document.querySelector('#toast').style.display='none';document.querySelector('.meterbig').scrollIntoView({block:'center'})});await p.waitForTimeout(200);
await p.screenshot({path:process.argv[2]});await b.close();srv.close()})();
