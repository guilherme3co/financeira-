/* ---------- contas de usuário e criptografia ---------- */
function loadUsers(){try{var u=JSON.parse(localStorage.getItem('financas-users')||'[]');if(!Array.isArray(u))return[];return u.filter(function(x){return x&&typeof x.id==='string'&&typeof x.nome==='string'&&typeof x.salt==='string'&&typeof x.it==='number'&&x.it>=100000&&x.it<=2000000&&x.chk&&typeof x.chk.iv==='string'&&typeof x.chk.ct==='string'})}catch(e){return[]}}
function saveUsers(){localStorage.setItem('financas-users',JSON.stringify(users))}
function dkey(id){return 'financas-d-'+id}
function b64(buf){var a=new Uint8Array(buf),s='';for(var i=0;i<a.length;i++)s+=String.fromCharCode(a[i]);return btoa(s)}
function unb64(s){var b=atob(s),a=new Uint8Array(b.length);for(var i=0;i<b.length;i++)a[i]=b.charCodeAt(i);return a}
function derive(pw,salt,it){return crypto.subtle.importKey('raw',new TextEncoder().encode(pw),'PBKDF2',false,['deriveKey']).then(function(k){return crypto.subtle.deriveKey({name:'PBKDF2',salt:salt,iterations:it,hash:'SHA-256'},k,{name:'AES-GCM',length:256},false,['encrypt','decrypt'])})}
function enc(key,txt){var iv=crypto.getRandomValues(new Uint8Array(12));return crypto.subtle.encrypt({name:'AES-GCM',iv:iv},key,new TextEncoder().encode(txt)).then(function(ct){return{iv:b64(iv),ct:b64(ct)}})}
function dec(key,rec){return crypto.subtle.decrypt({name:'AES-GCM',iv:unb64(rec.iv)},key,unb64(rec.ct)).then(function(b){return new TextDecoder().decode(b)})}
function save(){if(!uid||!KEYC||!st)return;nvAgenda();var snap=JSON.stringify(st),id=uid,k=KEYC;
wq=wq.then(function(){return enc(k,snap)}).then(function(r){try{localStorage.setItem(dkey(id),JSON.stringify(r))}catch(e){avisaSalvar()}}).catch(function(){})}
var saveWarn=false;function avisaSalvar(){if(saveWarn)return;saveWarn=true;try{mostraAviso('Não consegui salvar neste aparelho (sem espaço ou bloqueado). Faça um backup agora.','Ok',function(){$('aviso').hidden=true},'Fechar')}catch(e){}}
function limpaCampo(el){el.value='';setTimeout(function(){if(el.value&&el.dataset.novo!=='1')el.value=''},90)}
function addItem(it){var a=aplicaMem(it);st.items.push(it);save();return a}
function remove(id){st.items=st.items.filter(function(z){return z.id!==id});st.faturas=(st.faturas||[]).filter(function(f){return f.id!==id});save()}
function r2(x){return Math.round(x*100)/100}
var _nid=0;function nid(){var x=Date.now();if(x<=_nid)x=_nid+1;_nid=x;return x}
function pagCred(i){return !i.ent&&i.cor!=='gua'&&i.pay==='Crédito'}
function somaCred(o){return r2(o.contas.reduce(function(a,c){return a+(Number(c.cred)||0)},0))}
function somaFat(a){return r2((a||[]).reduce(function(x,f){return x+(Number(f.val)||0)},0))}
function guaLiq(){var x=0;st.items.forEach(function(i){if(!i.ent&&i.cor==='gua')x+=i.ret?-i.val:i.val});return r2(x)}
function limAtual(){var x=somaCred(st);st.items.forEach(function(i){if(pagCred(i))x-=i.val});return r2(x+somaFat(st.faturas)-parcFuturo())}
function temLimite(){return st.contas.some(function(c){return Number(c.cred)})||st.items.some(pagCred)||(st.faturas||[]).length>0||(st.parcelas||[]).length>0}
function faturaView(){return(st.faturas||[]).map(function(f){return{id:f.id,d:f.d,t:f.t,desc:'Fatura paga',val:f.val,pay:'Fatura',cor:'fat',ent:false,fat:true}})}
function kor(i){return i.fat?{n:'Fatura',v:'--mute'}:i.ent?COR.rec:(COR[i.cor]||COR.sem)}
function addFatura(v){var f={id:Date.now(),d:hoje(),t:hora(),val:r2(v)};st.faturas.push(f);save();return f.id}
/* lembrar neste aparelho: guarda a chave (não extraível) no IndexedDB */
function idb(){return new Promise(function(ok,no){var r=indexedDB.open('financas',1);r.onupgradeneeded=function(){r.result.createObjectStore('s')};r.onsuccess=function(){ok(r.result)};r.onerror=function(){no()}})}
function idbSet(k,v){return idb().then(function(db){return new Promise(function(ok,no){var t=db.transaction('s','readwrite');t.objectStore('s').put(v,k);t.oncomplete=ok;t.onerror=no})})}
function idbGet(k){return idb().then(function(db){return new Promise(function(ok,no){var q=db.transaction('s').objectStore('s').get(k);q.onsuccess=function(){ok(q.result)};q.onerror=no})})}
function idbDel(k){return idb().then(function(db){return new Promise(function(ok){var t=db.transaction('s','readwrite');t.objectStore('s').delete(k);t.oncomplete=ok;t.onerror=ok})}).catch(function(){})}

