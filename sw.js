var CACHE='financas-v6';
var ARQ=['./','./index.html','./manifest.json','./icon.svg'];
self.addEventListener('install',function(e){e.waitUntil(caches.open(CACHE).then(function(c){return c.addAll(ARQ)}).then(function(){return self.skipWaiting()}))});
self.addEventListener('activate',function(e){e.waitUntil(caches.keys().then(function(ks){return Promise.all(ks.filter(function(k){return k!==CACHE}).map(function(k){return caches.delete(k)}))}).then(function(){return self.clients.claim()}))});
self.addEventListener('fetch',function(e){
var u=new URL(e.request.url);
/* só arquivos do próprio app: nada de fora entra no cache; a busca (?texto=) nunca é guardada */
if(e.request.method!=='GET'||u.origin!==self.location.origin)return;
e.respondWith(fetch(e.request,{cache:'no-cache'}).then(function(r){if(r.ok&&r.type==='basic'){var cp=r.clone();caches.open(CACHE).then(function(c){c.put(new Request(u.origin+u.pathname),cp)}).catch(function(){})}return r}).catch(function(){return caches.match(new Request(u.origin+u.pathname)).then(function(m){return m||caches.match('./index.html')})}));
});
