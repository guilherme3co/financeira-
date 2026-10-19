/* ---------- entrar com a digital / Face ID (WebAuthn no próprio aparelho) ---------- */
var BIO_MS=60000,bioEsc=0,bioAberto=false;
function bioLe(){try{var o=JSON.parse(localStorage.getItem('financas-bio')||'{}');return(o&&typeof o==='object')?o:{}}catch(e){return{}}}
function bioId(u){var o=bioLe(),x=o[u];return(x&&typeof x.id==='string'&&/^[A-Za-z0-9+\/=_-]{16,700}$/.test(x.id))?x.id:''}
function bioGrava(u,id){var o=bioLe();if(id)o[u]={id:id};else delete o[u];try{localStorage.setItem('financas-bio',JSON.stringify(o))}catch(e){}}
function bioPode(){if(!(window.PublicKeyCredential&&navigator.credentials&&navigator.credentials.create&&window.isSecureContext))return Promise.resolve(false);
 try{return PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable().then(function(v){return !!v},function(){return false})}catch(e){return Promise.resolve(false)}}
function bioRnd(n){return crypto.getRandomValues(new Uint8Array(n))}
function bioCria(u,nome){return navigator.credentials.create({publicKey:{rp:{name:'Minhas Finanças',id:location.hostname},user:{id:new TextEncoder().encode(u).slice(0,64),name:String(nome||'Minhas Finanças').slice(0,60),displayName:String(nome||'Minhas Finanças').slice(0,60)},challenge:bioRnd(32),
 pubKeyCredParams:[{type:'public-key',alg:-7},{type:'public-key',alg:-257}],authenticatorSelection:{authenticatorAttachment:'platform',userVerification:'required',residentKey:'preferred'},timeout:60000,attestation:'none'}}).then(function(c){if(!c||!c.rawId)throw new Error('bio');return b64(new Uint8Array(c.rawId))})}
function bioConfere(u){var id=bioId(u);if(!id)return Promise.reject(new Error('sem'));
 return navigator.credentials.get({publicKey:{challenge:bioRnd(32),rpId:location.hostname,allowCredentials:[{type:'public-key',id:unb64(id)}],userVerification:'required',timeout:60000}}).then(function(a){if(!a||!a.response)throw new Error('bio');return true})}
/* tela de bloqueio: nada do app aparece até confirmar */
function bioTela(mostra,msg){var b=$('bio');b.hidden=!mostra;bioAberto=mostra;$('biomsg').textContent=msg||'';if(mostra){try{document.activeElement&&document.activeElement.blur()}catch(e){}}}
var bioOk=null,bioNao=null;
function bioPede(){$('biomsg').textContent='';$('biobtn').disabled=true;bioConfere(uid).then(function(){$('biobtn').disabled=false;bioTela(false);bioEsc=0;var f=bioOk;bioOk=bioNao=null;if(f)f()},function(){$('biobtn').disabled=false;$('biomsg').textContent='Não confirmou. Toque para tentar de novo ou use a senha.'})}
function bioPortao(u){if(!bioId(u))return Promise.resolve();return new Promise(function(ok,nao){bioOk=ok;bioNao=nao;bioTela(true);setTimeout(bioPede,250)})}
$('biobtn').onclick=bioPede;
$('biosenha').onclick=function(){var n=bioNao;bioOk=bioNao=null;bioTela(false);if(n)n(new Error('senha'));else mostraAuth()};
document.addEventListener('visibilitychange',function(){if(!st||!uid||!bioId(uid))return;
 if(document.hidden){bioEsc=Date.now();if(!bioAberto)bioTela(true)}
 else if(bioAberto&&!bioOk){if(bioEsc&&Date.now()-bioEsc<BIO_MS){bioTela(false);bioEsc=0}else{bioOk=function(){};setTimeout(bioPede,250)}}});
function desenhaBio(){var c=$('biochk'),m=$('biocfg');c.checked=!!(uid&&bioId(uid));m.textContent='';
 bioPode().then(function(p){c.disabled=!p&&!c.checked;if(!p&&!c.checked)m.textContent='Este aparelho ou navegador não tem digital/Face ID disponível para sites. Use o app instalado pelo Chrome (Android) ou Safari (iPhone).'})}
$('biochk').onchange=function(){var c=this,m=$('biocfg');if(!uid)return;
 if(!c.checked){bioGrava(uid,'');m.textContent='Digital desligada. O app volta a abrir como antes.';return}
 c.disabled=true;m.textContent='Confirme com a digital ou o Face ID...';var nome=(users.filter(function(u){return u.id===uid})[0]||{}).nome;
 bioCria(uid,nome).then(function(id){bioGrava(uid,id);lembrado=true;try{$('ulem').checked=true}catch(e){}return idbSet('sessao',{uid:uid,key:KEYC}).catch(function(){})}).then(function(){c.disabled=false;c.checked=true;m.textContent='Pronto. O app pede a digital ao abrir e quando você volta depois de 1 minuto fora. A senha continua valendo.'},
  function(){c.disabled=false;c.checked=false;m.textContent='Não deu para ativar. Tente de novo e confirme com a digital ou o Face ID.'})};
