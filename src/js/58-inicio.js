/* ---------- início ---------- */
$('ver2').textContent='Minhas Finanças '+VERSAO;
initGaugeCarousel();
(function boot(){
if(EMQUADRO)return;
var okStore=false;try{localStorage.setItem('_t','1');localStorage.removeItem('_t');okStore=true}catch(e){}
if(!okStore){semCripto('Esta tela de visualização bloqueia o armazenamento, então o app não funciona aqui. Abra pelo endereço do site, no Chrome: guilherme3co.github.io/financeiro');return}
if(!(window.crypto&&crypto.subtle&&window.TextEncoder)){semCripto();return}
users=loadUsers();gaveta();if(PARAMS.share){SHP=preShare();SHP.catch(function(){})}
idbGet('sessao').then(function(s){var u=s&&users.filter(function(x){return x.id===s.uid})[0];
 if(!u)throw 0;return dec(s.key,u.chk).then(function(){uid=u.id;KEYC=s.key;lembrado=true;return bioPortao(u.id).then(carrega)})}).catch(function(){mostraAuth()})})();
['pointerdown','keydown','touchstart','scroll','input'].forEach(function(ev){document.addEventListener(ev,function(){lastAct=Date.now()},{passive:true,capture:true})});
function checaBloqueio(){if(st&&uid&&!lembrado&&Date.now()-lastAct>LOCK_MS)mostraAuth()}
setInterval(checaBloqueio,20000);document.addEventListener('visibilitychange',function(){if(!document.hidden){checaBloqueio();}});
if('serviceWorker' in navigator&&location.protocol.indexOf('http')===0){window.addEventListener('load',function(){navigator.serviceWorker.register('sw.js').catch(function(){})})}
