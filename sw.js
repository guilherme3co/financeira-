var CACHE='financas-v7';
var ARQ=['./','./index.html','./manifest.json','./icon.svg'];
self.addEventListener('install',function(e){e.waitUntil(caches.open(CACHE).then(function(c){return c.addAll(ARQ)}).then(function(){return self.skipWaiting()}))});
self.addEventListener('activate',function(e){e.waitUntil(caches.keys().then(function(ks){return Promise.all(ks.filter(function(k){return k!==CACHE&&k!=='financas-share'}).map(function(k){return caches.delete(k)}))}).then(function(){return self.clients.claim()}))});
/* receber comprovante pelo Compartilhar do Android: guarda o arquivo (só neste aparelho) e abre o app */
function guardaShare(req){return req.formData().then(function(fd){return caches.open('financas-share').then(function(c){var meta={t:Date.now(),title:String(fd.get('title')||'').slice(0,500),text:String(fd.get('text')||'').slice(0,3000),url:String(fd.get('url')||'').slice(0,500)};var f=fd.get('arq'),p=Promise.resolve();if(f&&typeof f==='object'&&f.size>0&&f.size<=8388608)p=c.put('/__share/arq',new Response(f,{headers:{'content-type':f.type||'application/octet-stream'}}));return p.then(function(){return c.put('/__share/meta',new Response(JSON.stringify(meta)))})})}).catch(function(){}).then(function(){return Response.redirect(new URL('./index.html?share=1',self.registration.scope).href,303)})}
self.addEventListener('fetch',function(e){
var u=new URL(e.request.url);
if(e.request.method==='POST'&&u.origin===self.location.origin&&/\/(index\.html)?$/.test(u.pathname)){e.respondWith(guardaShare(e.request));return}
/* só arquivos do próprio app: nada de fora entra no cache; a busca (?texto=) nunca é guardada */
if(e.request.method!=='GET'||u.origin!==self.location.origin)return;
e.respondWith(fetch(e.request,{cache:'no-cache'}).then(function(r){if(r.ok&&r.type==='basic'){var cp=r.clone();caches.open(CACHE).then(function(c){c.put(new Request(u.origin+u.pathname),cp)}).catch(function(){})}return r}).catch(function(){return caches.match(new Request(u.origin+u.pathname)).then(function(m){return m||caches.match('./index.html')})}));
});
