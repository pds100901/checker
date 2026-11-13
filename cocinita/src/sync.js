/* ---------- datos: base de datos del artefacto + copia local + cola sin conexión ---------- */
const KEY='casa-fresita-v2',KEY_OLD='cocinita-v1';
const COLS=['items','shop','prep','chores','reminders','bills','tuppers','moves','outages'];
function emptyState(){
  return{v:2,stars:0,welcome:false,items:[],shop:[],menu:{},prep:[],chores:[],reminders:[],wasted:[],bills:[],tuppers:[],moves:[],outages:[],
    dogs:{rosco:{name:'Rosco',g:0,fed:{date:'',am:false,pm:false}},mali:{name:'Mali',g:0,fed:{date:'',am:false,pm:false}},bag:{left:0,total:0},treats:0,water:''}};
}
function normalize(s){const e=emptyState();Object.keys(e).forEach(k=>{if(s[k]==null)s[k]=e[k]});COLS.forEach(c=>{if(!Array.isArray(s[c]))s[c]=[]});
  s.items.forEach(i=>{if(!i.unit)i.unit='unid.'});return s}
/* S <-> documentos (ruta -> JSON) */
function flatten(s){
  const f={};
  COLS.forEach(c=>s[c].forEach(x=>{if(x&&x.id)f[c+'/'+x.id]=JSON.stringify(x)}));
  f['home/dogs']=JSON.stringify(s.dogs);
  f['home/menu']=JSON.stringify({menu:s.menu});
  f['home/misc']=JSON.stringify({stars:s.stars,welcome:s.welcome,wasted:s.wasted});
  return f;
}
function applyDoc(path,json){
  const [c,id]=path.split('/');const d=json==null?null:JSON.parse(json);
  if(c==='home'){
    if(!d)return;
    if(id==='dogs')S.dogs=Object.assign(emptyState().dogs,d);
    else if(id==='menu')S.menu=d.menu||{};
    else if(id==='misc'){S.stars=d.stars||0;S.welcome=!!d.welcome;S.wasted=d.wasted||[]}
    return;
  }
  if(!COLS.includes(c))return;
  const i=S[c].findIndex(x=>x.id===id);
  if(!d){if(i>=0)S[c].splice(i,1)}else if(i>=0)S[c][i]=d;else S[c].push(d);
}
const SYNC={db:null,state:'local',queue:[],flat:{},loaded:{},firstLoad:false,fromOld:false,flushing:false,timer:null,err:''};
function loadLocal(){
  try{const r=localStorage.getItem(KEY);if(r){const o=JSON.parse(r);if(o&&o.S){SYNC.queue=o.queue||[];SYNC.firstLoad=!!o.firstLoad;return normalize(o.S)}}}catch(e){}
  try{const r=localStorage.getItem(KEY_OLD);if(r){const s=JSON.parse(r);if(s&&s.items){SYNC.fromOld=true;return normalize(s)}}}catch(e){}
  return emptyState();
}
let S=loadLocal();
SYNC.flat=flatten(S);
/* todo lo que venía de la versión anterior (solo en este aparato) queda en cola para subir si la base está vacía */
function persist(){try{localStorage.setItem(KEY,JSON.stringify({S,queue:SYNC.queue,firstLoad:SYNC.firstLoad}))}catch(e){}}
function enqueue(path,json){
  SYNC.queue=SYNC.queue.filter(q=>q.path!==path);
  SYNC.queue.push({path,json,t:Date.now()});
}
/* consecuencias automáticas de un cambio local: historial y lista de compras */
function localEffects(prev){
  S.items.forEach(it=>{
    const p=prev['items/'+it.id]?JSON.parse(prev['items/'+it.id]):null;
    const clean=it.place==='clean';
    const now=clean?it.level:it.qty,was=p?(clean?p.level:p.qty):null;
    if(was===null){if(now>0)S.moves.push({id:uid(),item:it.id,name:it.name,d:now,q:now,u:clean?'%':it.unit,k:'alta',at:new Date().toISOString()})}
    else if(now!==was){
      S.moves.push({id:uid(),item:it.id,name:it.name,d:now-was,q:now,u:clean?'%':it.unit,k:now<was?'consumo':'reposición',at:new Date().toISOString()});
      if(now<=0&&was>0&&!S.shop.some(x=>!x.checked&&x.name.toLowerCase()===it.name.toLowerCase()))
        S.shop.push({id:uid(),name:it.name,emoji:it.emoji,qty:'1',place:it.place,ref:{type:'item',id:it.id},checked:false,auto:true});
    }
  });
  if(S.moves.length>400)S.moves=S.moves.slice(-400);
}
function save(){
  localEffects(SYNC.flat);
  const f=flatten(S);
  Object.keys(f).forEach(p=>{if(f[p]!==SYNC.flat[p])enqueue(p,f[p])});
  Object.keys(SYNC.flat).forEach(p=>{if(!(p in f))enqueue(p,null)});
  SYNC.flat=f;persist();flush();syncBadge();
}
async function flush(){
  if(!SYNC.db||SYNC.flushing||!SYNC.firstLoad)return;
  SYNC.flushing=true;
  try{
    while(SYNC.queue.length){
      const q=SYNC.queue[0];
      const ref=SYNC.db.doc(q.path);
      if(q.json==null)await ref.delete();else await ref.set(JSON.parse(q.json));
      if(SYNC.queue[0]===q)SYNC.queue.shift();else SYNC.queue=SYNC.queue.filter(x=>x!==q);
      persist();SYNC.err='';
    }
  }catch(e){
    SYNC.err=(e&&e.code)||'unavailable';
    if(SYNC.err==='invalid_argument'||SYNC.err==='quota_exceeded'){SYNC.state='readonly'}
    clearTimeout(SYNC.timer);SYNC.timer=setTimeout(flush,8000);
  }
  SYNC.flushing=false;syncBadge();
}
function onRemote(col,snap){
  if(snap.metadata&&snap.metadata.hasPendingWrites)return;
  const pend=new Set(SYNC.queue.map(q=>q.path));
  const seen=new Set();let ch=false;
  snap.docs.forEach(d=>{
    const path=col+'/'+d.id;seen.add(path);
    if(pend.has(path))return;
    const j=JSON.stringify(d.data());
    if(SYNC.flat[path]!==j){applyDoc(path,j);SYNC.flat[path]=j;ch=true}
  });
  const definitive=!(snap.metadata&&snap.metadata.fromCache);
  if(definitive&&SYNC.firstLoad){
    Object.keys(SYNC.flat).forEach(p=>{if(p.startsWith(col+'/')&&!seen.has(p)&&!pend.has(p)){applyDoc(p,null);delete SYNC.flat[p];ch=true}});
  }
  if(definitive&&!SYNC.loaded[col]){SYNC.loaded[col]={n:snap.docs.length};checkFirstLoad()}
  if(ch){persist();remoteRender()}
}
/* primera vez que este aparato ve la base: si está vacía sube lo local; si ya tiene datos, manda la base */
function checkFirstLoad(){
  const all=COLS.concat(['home']);
  if(!all.every(c=>SYNC.loaded[c]))return;
  if(!SYNC.firstLoad){
    const remoteN=all.reduce((n,c)=>n+SYNC.loaded[c].n,0);
    const pend=new Set(SYNC.queue.map(q=>q.path));
    if(remoteN===0){Object.keys(SYNC.flat).forEach(p=>{if(!pend.has(p))enqueue(p,SYNC.flat[p])})}
    else{
      const remote=SYNC.remoteSeen||{};
      Object.keys(SYNC.flat).forEach(p=>{if(!pend.has(p)&&!(p in remote)&&!p.startsWith('home/')){applyDoc(p,null);delete SYNC.flat[p]}});
    }
    SYNC.firstLoad=true;persist();remoteRender();
  }
  SYNC.state='ok';flush();syncBadge();
}
let rrT=null;
function remoteRender(){clearTimeout(rrT);rrT=setTimeout(()=>{if(typeof drag!=='undefined'&&drag)return remoteRender();if($('#sheet').classList.contains('on')){SYNC.dirty=true;return}render()},120)}
function syncBadge(){
  const el=$('#syncb');if(!el)return;
  const off=typeof navigator!=='undefined'&&navigator.onLine===false,n=SYNC.queue.length;
  let c='ok',t='Guardado y sincronizado';
  if(SYNC.state==='local'){c='loc';t='Guardado en este aparato'}
  else if(SYNC.state==='connecting'){c='wait';t='Conectando con tu base de datos…'}
  else if(SYNC.state==='readonly'){c='err';t='No se pudo guardar en la nube'}
  if(off){c='off';t=n?`Sin conexión · ${n} cambio${n>1?'s':''} por sincronizar`:'Sin conexión · usando datos guardados'}
  else if(n&&SYNC.state==='ok'){c='wait';t=`Sincronizando ${n} cambio${n>1?'s':''}…`}
  el.className='syncb '+c;el.title=t;el.setAttribute('aria-label',t);el.dataset.t=t;
}
async function initSync(){
  if(!window.claude||!window.claude.use){SYNC.state='local';syncBadge();return}
  SYNC.state='connecting';syncBadge();
  let db=null;try{db=await window.claude.use('db')}catch(e){}
  if(!db){SYNC.state='local';syncBadge();return}
  SYNC.db=db;SYNC.remoteSeen={};
  const fail=e=>{SYNC.err=(e&&e.code)||'unavailable';if(SYNC.state!=='ok')SYNC.state='local';syncBadge()};
  const track=(col,snap)=>{snap.docs.forEach(d=>SYNC.remoteSeen[col+'/'+d.id]=1);onRemote(col,snap)};
  try{
    COLS.forEach(c=>db.collection(c).onSnapshot(s=>track(c,s),fail));
    db.collection('home').onSnapshot(s=>track('home',s),fail);
  }catch(e){fail(e)}
  setTimeout(()=>{if(SYNC.state==='connecting'){SYNC.state='local';syncBadge()}},10000);
}
addEventListener('online',()=>{flush();syncBadge()});
addEventListener('offline',syncBadge);
