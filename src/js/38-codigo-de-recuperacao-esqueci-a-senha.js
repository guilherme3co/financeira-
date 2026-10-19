/* ---------- código de recuperação (esqueci a senha) ---------- */
var REC_IT=100000;
function recNorm(s){s=String(s||'').toUpperCase().replace(/[^A-Z0-9]/g,'');if(s.length===19&&s.indexOf('REC')===0)s=s.slice(3);return /^[2-9A-HJ-NP-Z]{16}$/.test(s)?s:''}
function recNovo(){var b=crypto.getRandomValues(new Uint8Array(16)),s='';for(var i=0;i<16;i++)s+=CAS_AB[b[i]&31];return s}
function recFmt(s){return 'REC-'+s.match(/.{4}/g).join('-')}
function rawBits(pw,salt,it){return crypto.subtle.importKey('raw',new TextEncoder().encode(pw),'PBKDF2',false,['deriveBits']).then(function(k){return crypto.subtle.deriveBits({name:'PBKDF2',salt:salt,iterations:it,hash:'SHA-256'},k,256)})}
/* guarda a chave da senha atual protegida pelo código (e o código protegido pela senha, para refazer quando a senha mudar) */
function recGrava(u,cod,pw,key){var rs=crypto.getRandomValues(new Uint8Array(16)),raw;return rawBits(pw,unb64(u.salt),u.it).then(function(r){raw=r;return derive(cod,rs,REC_IT)}).then(function(rk){return enc(rk,b64(raw))}).then(function(w){return enc(key,cod).then(function(c){u.rec={s:b64(rs),it:REC_IT,w:w,c:c};saveUsers()})})}
function recRefaz(u,oldKey,pw,newKey){if(!u||!u.rec||!u.rec.c)return Promise.resolve();return dec(oldKey,u.rec.c).then(function(cod){return recGrava(u,cod,pw,newKey)}).catch(function(){delete u.rec;saveUsers()})}
function recMostra(c){$('recc').textContent=recFmt(c);$('reccp').textContent='Copiar';$('recs').hidden=false}
$('reccp').onclick=function(){var b=this,t=$('recc').textContent;if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText('Código de recuperação do app Minhas Finanças: '+t).then(function(){b.textContent='Copiado!'},function(){b.textContent='Não consegui copiar'})};
$('recok').onclick=function(){$('recs').hidden=true;try{recUI()}catch(e){}};
function naoAchou(){return 'Não achei essa conta neste app.'+(avIOS()?' No iPhone, o ícone da tela inicial e o navegador guardam contas separadas: abra onde você criou a conta, ou crie uma conta aqui e toque em “Já usava o app? Restaurar da nuvem”.':' Confira o nome ou crie uma conta.')}
function recAbre(){$('uform').hidden=true;$('resw').hidden=false;$('rnome').value=$('un').value;$('rmsg').textContent='';$('rcod').value=$('rpw').value=$('rpw2').value='';try{$('rnome').focus()}catch(e){}}
function recFecha(){$('resw').hidden=true;$('uform').hidden=false}
$('uesq').onclick=recAbre;$('rvolta').onclick=recFecha;
$('rok').onclick=function(){var nome=$('rnome').value.trim(),cod=recNorm($('rcod').value),n=$('rpw').value,n2=$('rpw2').value,m=$('rmsg'),b=this;
 var u=achaUser(nome);if(!u){m.textContent=naoAchou();return}
 if(!u.rec){m.textContent='Esta conta não tem código de recuperação. Se o backup na nuvem estava ligado: crie uma conta nova e toque em “Já usava o app? Restaurar da nuvem”.';return}
 if(!cod){m.textContent='Digite o código de recuperação (REC-XXXX-XXXX-XXXX-XXXX).';return}
 var fr=senhaFraca(n,u.nome);if(fr){m.textContent=fr;return}if(n!==n2){m.textContent='As senhas novas não são iguais.';return}
 var te=tentLer();if(te.ate&&Date.now()<te.ate){m.textContent='Muitas tentativas erradas. Aguarde '+Math.ceil((te.ate-Date.now())/1000)+' segundos.';return}
 b.disabled=true;m.textContent='Conferindo o código...';var oldK;
 derive(cod,unb64(u.rec.s),u.rec.it).then(function(rk){return dec(rk,u.rec.w)}).then(function(r64){return crypto.subtle.importKey('raw',unb64(r64),{name:'AES-GCM'},false,['encrypt','decrypt'])},function(){throw 'cod'})
 .then(function(k){oldK=k;return dec(k,u.chk)}).then(function(){var raw=localStorage.getItem(dkey(u.id));return raw?dec(oldK,JSON.parse(raw)):null})
 .then(function(txt){tentSalva(null);m.textContent='Criando a senha nova...';var salt=crypto.getRandomValues(new Uint8Array(16)),nk,chk;
  return derive(n,salt,KDF_IT).then(function(k){nk=k;return enc(k,'ok')}).then(function(c){chk=c;return txt!==null?enc(nk,txt):null}).then(function(r){
   if(r)localStorage.setItem(dkey(u.id),JSON.stringify(r));u.salt=b64(salt);u.it=KDF_IT;u.chk=chk;saveUsers();return recRefaz(u,oldK,n,nk)})})
 .then(function(){idbDel('sessao');recFecha();authModo('login');$('un').value=u.nome;$('up').value='';$('umsg').textContent='✅ Senha nova criada. Entre com ela. Seu código de recuperação continua o mesmo.'},
  function(e){if(e==='cod'){var t=tentLer(),k=(t.n||0)+1,esp=k>=3?Math.min(900000,5000*Math.pow(2,k-3)):0;tentSalva({n:k,ate:esp?Date.now()+esp:0});m.textContent='Código de recuperação incorreto.'+(esp?' Aguarde '+Math.ceil(esp/1000)+' segundos.':'')}else m.textContent='Não consegui trocar a senha. Nada foi alterado.'})
 .then(function(){b.disabled=false})};
$('rpw2').onkeydown=function(e){if(e.key==='Enter'){e.preventDefault();$('rok').click()}};
function recUI(){var u=users.filter(function(x){return x.id===uid})[0];if(!u||!$('recst'))return;var tem=!!u.rec;$('recst').textContent=tem?'✅':'⚠️';
 $('recx').textContent=tem?'Você já tem um código de recuperação. Gerar um novo faz o antigo parar de valer.':'Sem código de recuperação: se esquecer a senha, não dá para abrir os dados. Gere agora e guarde num lugar seguro.';$('recger').textContent=tem?'Gerar código novo':'Gerar código de recuperação'}
$('recbox').addEventListener('toggle',function(){if(this.open)recUI()});
$('recger').onclick=function(){var pw=$('recpw').value,m=$('recm'),b=this,u=users.filter(function(x){return x.id===uid})[0];if(!u||!st)return;if(!pw){m.textContent='Digite a senha do app.';return}
 b.disabled=true;m.textContent='Conferindo...';var c=recNovo();derive(pw,unb64(u.salt),u.it).then(function(k){return dec(k,u.chk).then(function(){return k})},function(){throw 0}).then(function(k){return recGrava(u,c,pw,k)},function(){throw 'pw'})
 .then(function(){$('recpw').value='';m.textContent='';recUI();recMostra(c)},function(e){m.textContent=e==='pw'?'Senha incorreta.':'Não consegui gerar agora.'}).then(function(){b.disabled=false})};
function avisoRec(){var u=users.filter(function(x){return x.id===uid})[0];if(!st||!u||u.rec||!$('aviso').hidden||(st.recAvAte&&st.recAvAte>=hoje()))return;
 mostraAviso('Crie um código de recuperação: se esquecer a senha, é com ele que você volta sem perder nada.','Criar agora',function(){$('aviso').hidden=true;abreCfg(false,'cfgcon');$('recbox').open=true;recUI();setTimeout(function(){$('recbox').scrollIntoView({block:'center'});try{$('recpw').focus()}catch(e){}},80)},'Depois',function(){st.recAvAte=isoAdd(hoje(),7);save()})}
/* iPhone: avisa para usar pelo ícone da tela inicial */
function iosDica(){var w=$('uios');if(!w)return;var mostra=avIOS()&&!avInstalado();w.hidden=!mostra;if(mostra)$('uiosc').textContent=PARAMS.convite?' Seu código de convite: '+PARAMS.convite+' (anote antes de instalar).':''}
var AV_PUB='BKnxDO9MHRt3lAPbCK1gNz_mc36ngXga3qE8iK-pOgXZDJgftOEWpXmtAY7Hva5uXa_MJYGa-Kw9SYFmJKyzM5Y',avRod=false;
function limpaAvisos(a){if(!a||typeof a!=='object'||!a.on||!/^[a-f0-9]{64}$/.test(a.tok))return{on:false};return{on:true,tok:a.tok,ult:/^\d{4}-\d{2}-\d{2}$/.test(a.ult)?a.ult:'',sig:typeof a.sig==='string'?a.sig.slice(0,6000):''}}
function avPode(){return 'serviceWorker' in navigator&&'PushManager' in window&&'Notification' in window&&location.protocol==='https:'||(location.hostname==='localhost'&&'PushManager' in window)}
function avIOS(){return /iPhone|iPad|iPod/.test(navigator.userAgent)}
function avInstalado(){try{return matchMedia('(display-mode: standalone)').matches||navigator.standalone===true}catch(e){return false}}
function avU8(s){s=s.replace(/-/g,'+').replace(/_/g,'/');while(s.length%4)s+='=';return unb64(s)}
function avDatas(){var hj=hoje(),ym=mesAt(),prox=addMes(ym+'-01',1).slice(0,7),out={};(st.dividas||[]).forEach(function(d){var dia=Number(d.dia)||0;if(!dia||dia>31)return;
 if(dvAtivo(d)&&!dvPago(d)){var a=ym+'-'+pad(Math.min(dia,diasMes(ym)));if(a>=hj)out[a]=(out[a]||0)+1}
 var segue=ehPar(d)?((Number(d.pagas)||0)+(dvPago(d)?0:1))<d.n:true;if(segue){var b=prox+'-'+pad(Math.min(dia,diasMes(prox)));out[b]=(out[b]||0)+1}});
 return Object.keys(out).sort().slice(0,60).map(function(k){return{d:k,n:Math.min(20,out[k])}})}
function avReg(){return navigator.serviceWorker.ready}
function avEnvia(sub,forca){var datas=avDatas(),js=JSON.stringify(sub.toJSON?sub.toJSON():sub),sig=JSON.stringify([js,datas]);
 if(!forca&&st.avisos.sig===sig&&st.avisos.ult===hoje())return Promise.resolve(false);
 return casRpc('avisos_salvar',{p_token:st.avisos.tok,p_sub:js,p_datas:datas}).then(function(){st.avisos.sig=sig;st.avisos.ult=hoje();save();return true})}
function avSync(){if(!st||!st.avisos||!st.avisos.on||avRod||!avPode())return Promise.resolve();avRod=true;
 return avReg().then(function(r){return r.pushManager.getSubscription()}).then(function(sub){if(!sub){if(Notification.permission==='granted')return avReg().then(function(r){return r.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:avU8(AV_PUB)})}).then(function(s){return avEnvia(s,true)});AV_ERR='perm';return}return avEnvia(sub,false)})
 .then(function(){avRod=false;avUI()},function(){avRod=false;avUI()})}
var AV_ERR='';
function avUI(){var c=$('avchk');if(!c||!st)return;var on=!!(st.avisos&&st.avisos.on),m=$('avimsg');c.checked=on;
 if(!avPode()){c.disabled=true;m.textContent=avIOS()&&!avInstalado()?'No iPhone: abra no Safari, toque em Compartilhar → “Adicionar à Tela de Início” e ligue por lá.':'Este navegador não recebe avisos.';return}
 c.disabled=false;if(on&&Notification.permission==='denied'){m.textContent='⚠️ Os avisos estão bloqueados nas permissões do navegador. Libere as notificações deste site.';return}
 var n=avDatas().length;m.textContent=on?'✅ Ligado. '+(n?n+(n===1?' data de vencimento programada.':' datas de vencimento programadas.'):'Coloque o dia do vencimento nas contas (Investir → Planejamento).'):''}
function avLiga(){var m=$('avimsg'),c=$('avchk');if(!avPode())return avUI();m.textContent='Pedindo permissão...';c.disabled=true;
 Notification.requestPermission().then(function(p){if(p!=='granted')throw 'neg';return avReg()}).then(function(r){return r.pushManager.getSubscription().then(function(s){return s||r.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:avU8(AV_PUB)})})})
 .then(function(sub){st.avisos={on:true,tok:(st.avisos&&st.avisos.tok)||casHex(crypto.getRandomValues(new Uint8Array(32))),ult:'',sig:''};save();return avEnvia(sub,true)})
 .then(function(){m.textContent='Mandando um aviso de teste...';return fetch(SB_URL+'/functions/v1/avisos',{method:'POST',headers:{apikey:SB_KEY,'Content-Type':'application/json'},body:JSON.stringify({token:st.avisos.tok}),cache:'no-store',credentials:'omit',referrerPolicy:'no-referrer'}).catch(function(){})})
 .then(function(){c.disabled=false;avUI()},function(e){c.disabled=false;if(st.avisos&&!st.avisos.on)st.avisos={on:false};c.checked=!!(st.avisos&&st.avisos.on);m.textContent=e==='neg'?'Você não permitiu as notificações. Libere nas permissões do navegador e tente de novo.':'Não consegui ligar agora. Confira a internet e tente de novo.'})}
function avDesliga(){var a=st.avisos||{},m=$('avimsg');st.avisos={on:false};save();avUI();m.textContent='Avisos desligados.';
 if(a.tok)casRpc('avisos_salvar',{p_token:a.tok,p_sub:'',p_datas:[]}).catch(function(){});if(avPode())avReg().then(function(r){return r.pushManager.getSubscription()}).then(function(s){if(s)return s.unsubscribe()}).catch(function(){})}
$('avchk').onchange=function(){if(this.checked)avLiga();else avDesliga()};
$('cfgavi').addEventListener('toggle',function(){if(this.open)avUI()});
document.addEventListener('visibilitychange',function(){if(document.hidden&&st&&st.avisos&&st.avisos.on)avSync()});
if(navigator.serviceWorker)navigator.serviceWorker.addEventListener('message',function(e){if(e.data&&e.data.aviso&&st)vaiPagina(4)});
