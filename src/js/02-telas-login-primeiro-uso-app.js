/* ---------- telas: login, primeiro uso, app ---------- */
var cur=0,voltaK=0,PGS=['pg1','pgi','pgk','pg4','pgx','pgy'],TITS=['Principal','Investir','Mentor','Histórico','Inteligência','Casal'],TBS=['t1','tp','tk','t2'],ALLP=['pg1','pg3','pg4','pgp','pgk','pgi','pgx','pga','pgs','pgc','pgr','pgy'];
function marcaNav(k){TBS.forEach(function(id,i){$(id).setAttribute('aria-selected',i===k?'true':'false')});$('ptit').textContent=k>=0?TITS[k]:''}
function tela(qual){if(qual==='pga'||qual==='pgs'){$('bio').hidden=true;bioAberto=false;bioOk=bioNao=null;$('aviso').hidden=true;$('lanc').hidden=true;$('nov').hidden=true;$('men').hidden=true;MEN.esp=null}ALLP.forEach(function(i){$(i).className='pg'});$(qual).className='pg on';$('top').hidden=(qual==='pga'||qual==='pgs');window.scrollTo(0,0);fabUpd()}
function fabUpd(){var on=!!st&&['pg1','pgi','pgk','pg4','pgc','pgx','pgy'].some(function(i){return $(i).className.indexOf('on')>=0});$('fab').hidden=!on;try{micfUpd()}catch(e){}}
function vaiPagina(k,sub){if(!st)return;k=Math.max(0,Math.min(5,k));fechaMais();telaHist(k!==0);ALLP.forEach(function(i){$(i).className='pg'});$(PGS[k]).className='pg on';$('top').hidden=false;eng.setAttribute('aria-expanded','false');marcaNav(k);cur=k;$('topvolta').hidden=k===0;window.scrollTo(0,0);fabUpd();if(k===1){itTab(sub||IT.cur);return}if(k===2){mDot()}if(k===3)renderHistorico();if(k===4){renderIntel();renderConsultor();resNota()}if(k===5){CAS.todos=false;renderCasal();casSync(false)}setTimeout(function(){tour(k===0?'pg1':PGS[k])},380)}
/* botão voltar do Android: dentro de uma tela, volta para a principal */
function telaHist(dentro){try{if(dentro&&!(history.state&&history.state.tela))history.pushState({tela:1},'')}catch(e){}}
function voltaInicio(){if(history.state&&history.state.tela){try{history.back();return}catch(e){}}vaiPagina(0)}
window.addEventListener('popstate',function(){if(!st)return;fechaMais();['lanc','nov','men','edit','fat','lan'].forEach(function(id){var e=$(id);if(e&&!e.hidden){if(id==='men')fechaMentor();else if(id==='edit')fechaEdicao();else e.hidden=true}});if($('pg1').className.indexOf('on')<0&&!$('top').hidden)vaiPagina(0)});
$('topvolta').onclick=voltaInicio;
function irPara(n,direto){vaiPagina(0)}
function abreHistorico(){vaiPagina(3)}
function histMatch(i,q){var t=normT([i.desc,i.pay,i.ent?'entrada':'',i.cat&&catOk(i.cat)?catNomeP(i.cat):'',i.lug||'',kor(i).n].join(' '));return q.split(/\s+/).every(function(w){return t.indexOf(w)>=0})}
function renderHistorico(){var L=$('listaHist');if(!L||!st)return;L.innerHTML='';var q=normT(($('hbusca')||{}).value||'').trim(),R=$('hbres');$('cal').hidden=!!q;if(!q){R.hidden=true;renderCal()}desenhaHistCats();var arr=(q?itemsTodos().concat(faturaView()).filter(function(i){return histMatch(i,q)}):st.items.concat(faturaView())).sort(function(a,b){return (b.d||'').localeCompare(a.d||'')||(Number(b.id)||0)-(Number(a.id)||0)});if(histCat)arr=arr.filter(function(i){return !i.ent&&i.cor!=='gua'&&!i.fat&&(histCat==='_'?!(i.cat&&catOk(i.cat)):i.cat===histCat)});if(q){var tg=0,te=0;arr.forEach(function(i){if(i.ent)te+=i.val;else if(i.cor!=='gua'&&!i.fat)tg+=i.val});R.hidden=false;R.textContent='';R.appendChild(document.createTextNode(arr.length+(arr.length===1?' lançamento':' lançamentos')+' com “'+$('hbusca').value.trim()+'”'));if(tg>0){R.appendChild(document.createTextNode(' · gastos '));R.appendChild(el_('b',null,brl(r2(tg))))}if(te>0){R.appendChild(document.createTextNode(' · entradas '));R.appendChild(el_('b',null,brl(r2(te))))}}
if(!arr.length){L.innerHTML='<p class="vazio">'+(q?'Nada encontrado. Tente outra palavra.':'Nenhum lançamento neste mês.')+'</p>';if(!q)arquivoHist(L);return}var tot_=arr.length;if(histQ!==q+'|'+histCat){histQ=q+'|'+histCat;histLim=60}arr=arr.slice(0,histLim);arr.forEach(function(i){var r=document.createElement('div');r.className='it';var c=document.createElement('span');c.className='c';c.style.display='inline-block';c.style.background='var('+kor(i).v+')';var t=document.createElement('div');t.className='t';t.innerHTML='<b></b><small></small>';t.firstChild.textContent=i.desc;t.lastChild.textContent=(q&&i.d.slice(0,4)!==hoje().slice(0,4)?dm(i.d)+'/'+i.d.slice(0,4):dm(i.d))+(i.t?' · '+i.t:'')+' · '+i.pay+' · '+(i.ent?'Entrada':kor(i).n)+(i.cat&&catOk(i.cat)?' · '+catNome(i.cat):'')+(i.lug?' · '+i.lug:'');var v=document.createElement('div');v.className='v'+(i.ent?' pos':'');v.style.color='var('+(i.ent?'--pos':(i.cor==='gua'?'--gua':'--ink'))+')';v.textContent=(i.ent?'+ ':'− ')+brl(i.val);if(!i.fat&&acha(i.id)){t.title='Toque para editar';t.onclick=function(){abreEdicao(i.id)}}r.appendChild(c);r.appendChild(t);r.appendChild(v);L.appendChild(r)});if(tot_>arr.length){var mb=el_('button','add','Ver mais ('+(tot_-arr.length)+')');mb.type='button';mb.onclick=function(){histLim+=60;renderHistorico()};L.appendChild(mb)}if(!q)arquivoHist(L)}
var histLim=60,histQ='';
(function(){var tb=null;$('hbusca').addEventListener('input',function(){clearTimeout(tb);tb=setTimeout(renderHistorico,180)});$('hbusca').addEventListener('keydown',function(e){if(e.key==='Enter'){e.preventDefault();this.blur()}})})();
/* conectado sem digital: qualquer pessoa com o celular desbloqueado abre o app */
function avisoBio(){if(!st||!lembrado||bioId(uid)||!$('aviso').hidden||st.avBioAte>=hoje())return;bioPode().then(function(p){if(!p||!$('aviso').hidden)return;mostraAviso('Você está conectado sem digital: quem pegar seu celular desbloqueado abre o app. Ligue a digital para proteger.','Ligar digital',function(){$('aviso').hidden=true;abreCfg(false,'cfgseg')},'Depois',function(){st.avBioAte=isoAdd(hoje(),7);save()})})}
function entra(){var fx=null,vinda=!!(PARAMS.share||PARAMS.txt);try{fx=fechaAuto()}catch(e){}cur=-1;irPara(0,true);gaveta();render();setTimeout(function(){buscaCdi(false);buscaTaxas(false)},1600);avisoAtualizado();nvDiario();setTimeout(function(){checaVersao();if(fx)avisoFechou(fx);else if(!vinda){lembreteBackup();avisoRec()}if(!vinda)avisoBio();if(!vinda&&!novidades())tour('pg1')},1200);setTimeout(aposEntrada,vinda?0:900);acEntra();setTimeout(function(){casSync(true)},2500);setTimeout(avSync,3500);if(PARAMS.aviso){PARAMS.aviso=false;setTimeout(function(){vaiPagina(4)},400)}$('quem').textContent='Conta: '+(users.filter(function(u){return u.id===uid})[0]||{nome:''}).nome}
var modo='login';
function authModo(m){modo=m;var novo=(m==='criar');$('atit').textContent=novo?'Criar conta':'Entrar';$('ucw').hidden=!novo;$('uok').textContent=novo?'Criar conta':'Entrar';$('usw').textContent=novo?'Já tenho conta':'Criar conta';
$('up').autocomplete=novo?'new-password':'current-password';$('umsg').textContent='';$('uesq').hidden=novo;
var velho=false;try{velho=!!localStorage.getItem('financas-v1')}catch(e){}
$('unote').textContent=novo?(velho&&!users.length?'Seus lançamentos deste aparelho vão para esta conta. Senha forte: 8+ caracteres, letras e números.':'Uma conta por pessoa. Senha forte: 8+ caracteres, letras e números. Sem a senha não há recuperação: use o backup (⚙).'):'Esqueceu a senha? Não dá para recuperar. Crie uma nova conta e importe o seu backup.';
$('usw').hidden=false}
function mostraAuth(){var ao=$('acs');if(ao)ao.hidden=true;ACC_NOVO=null;ACC_ULT='';try{fechaLan(true)}catch(e){}if(tutAt){tutAt=null;$('tut').hidden=true}st=null;uid=null;KEYC=null;users=loadUsers();var ult='';try{ult=localStorage.getItem('financas-ultimo')||''}catch(e){}
authModo(PARAMS.convite?'criar':(users.length?'login':'criar'));$('un').value=PARAMS.convite?'':ult;$('up').value='';$('up2').value='';if(PARAMS.convite)$('ucod').value=PARAMS.convite;try{recFecha()}catch(e){}tela('pga');iosDica();if(PARAMS.convite){$('umsg').textContent='Convite recebido ✅ Digite seu nome e crie uma senha.';setTimeout(function(){try{$('un').focus()}catch(e){}},200)}}
function semCripto(msg){$('atit').textContent='Não dá para abrir aqui';$('umsg').textContent=msg||'Navegador sem proteção por senha. Abra pelo https no Chrome.';$('uok').disabled=true;$('usw').hidden=true;$('un').disabled=true;$('up').disabled=true;tela('pga')}
function achaUser(nome){nome=nome.trim().toLowerCase();return users.filter(function(u){return u.nome.toLowerCase()===nome})[0]}
function carrega(){var raw=localStorage.getItem(dkey(uid));if(!raw){st=null;mostraSetup();return Promise.resolve()}
return dec(KEYC,JSON.parse(raw)).then(function(t){st=migra(JSON.parse(t));entra()})}
var lembrado=false,lastAct=Date.now();
function lembrar(){lembrado=!!$('ulem').checked;if(lembrado)return idbSet('sessao',{uid:uid,key:KEYC}).catch(function(){});return idbDel('sessao')}
/* tentativas erradas: espera cresce a cada erro */
function tentLer(){try{return JSON.parse(localStorage.getItem('financas-tent')||'{}')||{}}catch(e){return{}}}
function tentSalva(o){try{if(o)localStorage.setItem('financas-tent',JSON.stringify(o));else localStorage.removeItem('financas-tent')}catch(e){}}
function senhaFraca(pw,nome){var l=pw.toLowerCase();if(pw.length<8)return 'Use uma senha com pelo menos 8 caracteres.';if(/^\d+$/.test(pw))return 'Só números é fraco. Misture letras e números.';if(l===nome.trim().toLowerCase())return 'A senha não pode ser igual ao nome.';if(/^(.)\1+$/.test(pw))return 'Evite repetir o mesmo caractere.';
if(['12345678','123456789','1234567890','senha123','senha1234','password','password1','qwertyui','qwerty123','abc12345','11111111','00000000','12341234','minhasenha','mudar123','brasil123'].indexOf(l)>=0)return 'Essa senha é muito comum. Escolha outra.';
if(pw.length<12&&!(/[a-zA-Z]/.test(pw)&&/\d|[^a-zA-Z0-9]/.test(pw)))return 'Misture letras e números, ou use 12 caracteres ou mais.';return ''}
/* atualiza contas antigas para a derivação de senha mais forte, sem perder dados */
function atualizaKdf(u,pw){if(u.it>=KDF_IT||!st)return Promise.resolve();var salt=crypto.getRandomValues(new Uint8Array(16)),nk,ok0=KEYC;
return derive(pw,salt,KDF_IT).then(function(k){nk=k;return enc(k,'ok')}).then(function(chk){var id=uid;KEYC=nk;
 wq=wq.then(function(){if(!st||uid!==id)return;return enc(nk,JSON.stringify(st)).then(function(r){try{localStorage.setItem(dkey(id),JSON.stringify(r));u.salt=b64(salt);u.it=KDF_IT;u.chk=chk;saveUsers()}catch(e){}return recRefaz(u,ok0,pw,nk)})}).catch(function(){});
 return wq}).then(function(){if(lembrado)return idbSet('sessao',{uid:uid,key:KEYC}).catch(function(){})}).catch(function(){})}
$('uok').onclick=function(){var nome=$('un').value.trim(),pw=$('up').value,m=$('umsg'),b=this;
if(nome.length<2){m.textContent='Digite seu nome.';return}
if(!pw){m.textContent='Digite a senha.';return}
var te=tentLer();if(modo!=='criar'&&te.ate&&Date.now()<te.ate){m.textContent='Muitas tentativas erradas. Aguarde '+Math.ceil((te.ate-Date.now())/1000)+' segundos.';return}
if(modo==='criar'){var fr=senhaFraca(pw,nome);if(fr){m.textContent=fr;return}var ccod=acCodFmt($('ucod').value);if(!ccod){m.textContent='Digite o código de convite (FIN-XXXX-XXXX). Peça ao administrador.';return}}
b.disabled=true;m.textContent=modo==='criar'?'Criando conta...':'Entrando...';
var p;
if(modo==='criar'){
 if($('up2').value!==pw){m.textContent='As senhas não são iguais.';b.disabled=false;return}
 if(achaUser(nome)){m.textContent='Já existe uma conta com esse nome neste aparelho.';b.disabled=false;return}
 var salt=crypto.getRandomValues(new Uint8Array(16)),it=KDF_IT,k,atok=acNovoTok();m.textContent='Validando o convite...';
 p=casRpc('acesso_entrar',{p_acesso:atok,p_nome:nome,p_codigo:ccod}).then(function(){ACC_NOVO={tok:atok};m.textContent='Criando conta...'},function(e){m.textContent=acErro(e);throw 'conv'}).then(function(){return derive(pw,salt,it)}).then(function(key){k=key;return enc(key,'ok')}).then(function(chk){
  var u={id:'u'+Date.now(),nome:nome,salt:b64(salt),it:it,chk:chk};users.push(u);saveUsers();uid=u.id;KEYC=k;
  var velho=null;if(users.length===1){try{velho=JSON.parse(localStorage.getItem('financas-v1')||'null')}catch(e){}}
  if(velho&&typeof velho.start==='number'&&Array.isArray(velho.items)){st=migra(velho);save();return wq.then(function(){return dec(KEYC,JSON.parse(localStorage.getItem(dkey(uid))))}).then(function(t){if(JSON.parse(t).items.length===st.items.length){try{localStorage.removeItem('financas-v1')}catch(e){}}})}
  st=null}).then(function(){try{localStorage.setItem('financas-ultimo',nome)}catch(e){}return lembrar()}).then(function(){if(st)entra();else mostraSetup();PARAMS.convite='';var uu=users.filter(function(x){return x.id===uid})[0],rc=recNovo();return recGrava(uu,rc,pw,KEYC).then(function(){recMostra(rc)}).catch(function(){})})
}else{
 var u=achaUser(nome);if(!u){m.textContent=naoAchou();b.disabled=false;return}
 p=derive(pw,unb64(u.salt),u.it).then(function(key){return dec(key,u.chk).then(function(){return key},function(){return null})}).then(function(key){if(!key){var t=tentLer(),n=(t.n||0)+1,esp=n>=3?Math.min(900000,5000*Math.pow(2,n-3)):0;tentSalva({n:n,ate:esp?Date.now()+esp:0});m.textContent='Senha incorreta.'+(esp?' Aguarde '+Math.ceil(esp/1000)+' segundos para tentar de novo.':'');return}
tentSalva(null);uid=u.id;KEYC=key;try{localStorage.setItem('financas-ultimo',u.nome)}catch(e){}return lembrar().then(carrega).then(function(){return atualizaKdf(u,pw)})})
}
p.catch(function(e){if(e!=='conv')m.textContent='Algo deu errado. Tente de novo.'}).then(function(){b.disabled=false})};
$('usw').onclick=function(){authModo(modo==='login'?'criar':'login')};
$('up').onkeydown=$('up2').onkeydown=$('un').onkeydown=function(e){if(e.key==='Enter'){e.preventDefault();$('uok').click()}};
function sairConta(){idbDel('sessao');mostraAuth()}
$('sair').onclick=sairConta;
var dArm=false,dTm=null;
$('delc').onclick=function(){var b=this;if(!dArm){dArm=true;b.textContent='Toque de novo: apaga a conta e os dados';dTm=setTimeout(function(){dArm=false;b.textContent='Excluir minha conta'},4000);return}
clearTimeout(dTm);dArm=false;b.textContent='Excluir minha conta';try{localStorage.removeItem(dkey(uid))}catch(e){}bioGrava(uid,'');users=users.filter(function(u){return u.id!==uid});saveUsers();idbDel('sessao');mostraAuth()};

