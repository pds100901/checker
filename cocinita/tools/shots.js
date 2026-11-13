// Capturas de cada habitación con y sin servicios (revisión visual).
const {chromium}=require('playwright');const {start,store,MOCK}=require('./testlib');
const OUT=process.argv[2]||'.';
(async()=>{
  const srv=await start(8765);const b=await chromium.launch();
  const ctx=await b.newContext({viewport:{width:400,height:820},deviceScaleFactor:1});await ctx.addInitScript(MOCK);
  const p=await ctx.newPage();p.on('pageerror',e=>console.log('ERR',e.message));p.on('console',m=>{if(m.type()==='error')console.log('console',m.text())});
  await p.goto('http://localhost:8765/');await p.waitForTimeout(1500);
  for(const t of ['sala','cocina','bano','jardin']){await p.click(`nav [data-tab=${t}]`);await p.waitForTimeout(900);await p.screenshot({path:`${OUT}/room-${t}.png`,fullPage:true})}
  // recibo de luz vencido
  await p.click('nav [data-tab=sala]');
  await p.evaluate(()=>document.querySelector('[data-act=svc][data-svc=luz]').dispatchEvent(new MouseEvent('click',{bubbles:true})));
  await p.fill('#b-amount','18500');await p.fill('#b-due','2026-01-05');await p.click('[data-act=billAdd]');await p.waitForTimeout(400);
  await p.screenshot({path:`${OUT}/sheet-luz.png`});
  await p.click('.sheet-bg',{position:{x:5,y:5}});await p.waitForTimeout(1800);
  await p.screenshot({path:`${OUT}/dark-sala.png`});
  await p.click('nav [data-tab=cocina]');await p.waitForTimeout(1500);await p.screenshot({path:`${OUT}/dark-cocina.png`});
  await b.close();srv.close();
})();
