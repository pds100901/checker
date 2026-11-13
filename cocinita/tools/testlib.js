// Banco de pruebas: sirve la página y simula la base de datos del artefacto (compartida entre "dispositivos").
const http=require('http'),fs=require('fs'),path=require('path');
const ROOT=path.join(__dirname,'..');
const store={docs:{},down:false};
function start(port){
  return new Promise(res=>{
    const srv=http.createServer((req,rsp)=>{
      const u=new URL(req.url,'http://x');
      if(u.pathname==='/__db'){
        if(req.method==='GET'){if(store.down){rsp.writeHead(503);return rsp.end()}rsp.writeHead(200,{'content-type':'application/json'});return rsp.end(JSON.stringify(store.docs))}
        let b='';req.on('data',c=>b+=c);req.on('end',()=>{
          if(store.down){rsp.writeHead(503);return rsp.end()}
          const o=JSON.parse(b);if(o.op==='set')store.docs[o.path]=o.data;else delete store.docs[o.path];
          rsp.writeHead(200);rsp.end('{}')});
        return;
      }
      const f=path.join(ROOT,u.pathname==='/'?'index.html':decodeURIComponent(u.pathname));
      if(!f.startsWith(ROOT)||!fs.existsSync(f)){rsp.writeHead(404);return rsp.end()}
      const ext=path.extname(f);rsp.writeHead(200,{'content-type':ext==='.png'?'image/png':'text/html; charset=utf-8'});fs.createReadStream(f).pipe(rsp);
    }).listen(port,()=>res(srv));
  });
}
// Se inyecta en la página: window.claude.use('db') con la misma forma que la capacidad real (doc/collection/set/delete/onSnapshot).
const MOCK=`(()=>{
  const subs=[];let cache=null;
  async function pull(){try{const r=await fetch('/__db');if(!r.ok)throw 0;const d=await r.json();const j=JSON.stringify(d);if(j!==cache){cache=j;subs.forEach(s=>fire(s,d))}}catch(e){}}
  function fire(s,d){const docs=Object.keys(d).filter(p=>p.startsWith(s.col+'/')&&p.split('/').length===2).sort().map(p=>({id:p.split('/')[1],exists:true,data:()=>d[p],metadata:{fromCache:false,hasPendingWrites:false}}));
    s.cb({docs,size:docs.length,empty:!docs.length,docChanges:()=>[],metadata:{fromCache:false,hasPendingWrites:false}})}
  async function send(o){const r=await fetch('/__db',{method:'POST',body:JSON.stringify(o)});if(!r.ok)throw{code:'unavailable',message:'down'};setTimeout(pull,10)}
  const db={doc:p=>({id:p.split('/').pop(),path:p,set:d=>send({op:'set',path:p,data:d}),delete:()=>send({op:'del',path:p})}),
    collection:c=>({path:c,onSnapshot:(cb,err)=>{const s={col:c,cb};subs.push(s);if(cache)fire(s,JSON.parse(cache));else pull();return()=>{}}})};
  setInterval(pull,250);
  window.claude={use:async n=>n==='db'?db:null};
})();`;
module.exports={start,store,MOCK};
