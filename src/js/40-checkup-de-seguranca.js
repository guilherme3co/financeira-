/* ---------- checkup de segurança ---------- */
function checkup(){var B=$('chkl');if(!B||!st)return;B.innerHTML='';var L=[],ok=0;
 function it(est,txt,bot,fn){L.push(1);if(est==='ok')ok++;var r=el_('div','chki '+est);r.appendChild(el_('span','chkic',est==='ok'?'✅':est==='al'?'⚠️':'💡'));var s=el_('span',null,txt);r.appendChild(s);if(bot){var b=el_('button','linkb',bot+' ›');b.type='button';b.onclick=fn;r.appendChild(b)}B.appendChild(r)}
 it('ok','Dados criptografados no celular (AES-256), só abrem com a sua senha.');
 it('ok','Bloqueia sozinho depois de 5 minutos sem uso.');
 var bio=!!bioId(uid);it(bio?'ok':'al',bio?'Digital / Face ID ligada.':'Digital / Face ID desligada.',bio?null:'Ligar',function(){var c=$('biochk');c.scrollIntoView({block:'center'});c.focus()});
 var N=st.nuvem||{},dd=N.ult?Math.floor((Date.now()-Date.parse(N.ult))/864e5):99;
 if(!N.on)it('al','Backup na nuvem desligado. Se perder o celular, perde os dados.','Ligar',function(){var c=$('nvpw');c.scrollIntoView({block:'center'});c.focus()});
 else it(dd<=2?'ok':'al',dd<=2?'Backup na nuvem em dia.':'Último backup na nuvem há '+dd+' dias.',dd<=2?null:'Enviar agora',function(){$('nvagora').click();setTimeout(checkup,2500)});
 var inst=avInstalado();it(inst?'ok':'dica',inst?'App instalado na tela inicial.':'Instale o app na tela inicial: abre mais rápido e fica separado do navegador.');
 var av=!!(st.avisos&&st.avisos.on);it(av?'ok':'dica',av?'Avisos de contas ligados.':'Avisos de contas desligados.',av?null:'Ligar',function(){abreCfg(false,'cfgavi');setTimeout(function(){$('cfgavi').scrollIntoView({block:'start'})},50)});
 if(st.casal)it('ok','Casal: você mostra '+({det:'os gastos detalhados',tot:'só os totais',pau:'nada (pausado)'})[st.casal.niv]+'. Criptografado de ponta a ponta.');
 var ur=users.filter(function(x){return x.id===uid})[0];it(ur&&ur.rec?'ok':'al',ur&&ur.rec?'Código de recuperação criado.':'Sem código de recuperação: se esquecer a senha, perde o acesso.',ur&&ur.rec?null:'Criar',function(){abreCfg(false,'cfgcon');$('recbox').open=true;recUI();setTimeout(function(){$('recbox').scrollIntoView({block:'center'})},50)});
 it(ERROS.length?'al':'ok',ERROS.length?ERROS.length+(ERROS.length===1?' erro registrado no app.':' erros registrados no app.'):'Nenhum erro registrado no app.',ERROS.length?'Ver':null,function(){abreCfg(false,'cfgcon');$('errbox').open=true;setTimeout(function(){$('errbox').scrollIntoView({block:'center'})},50)});
 $('chkres').textContent=ok+' de '+L.length+' em dia'}
$('cfgseg').addEventListener('toggle',function(){if(this.open)checkup()});
var SB_URL='https://ezivqczibtsqqqzpzcdh.supabase.co',SB_KEY='sb_publishable_YhQFxwQmRruAh7aDATquFQ_sR81kg-Z',NV_IT=310000;
var nvTm=null,nvRodando=false,nvMudo=false;
function limpaNuvem(n){if(!n||typeof n!=='object'||!n.on)return{on:false};var ok=/^[a-f0-9]{64}$/.test(n.id)&&typeof n.salt==='string'&&typeof n.k==='string'&&n.k.length>=40&&n.k.length<=64;
 return ok?{on:true,id:n.id,salt:n.salt,it:Math.max(100000,Math.min(2000000,parseInt(n.it,10)||NV_IT)),k:n.k,ult:typeof n.ult==='string'?n.ult.slice(0,30):'',pend:!!n.pend,err:typeof n.err==='string'?n.err.slice(0,120):''}:{on:false}}
function hex(buf){return Array.prototype.map.call(new Uint8Array(buf),function(b){return('0'+b.toString(16)).slice(-2)}).join('')}
function nvEndereco(nome,senha){return crypto.subtle.importKey('raw',new TextEncoder().encode(senha),'PBKDF2',false,['deriveBits']).then(function(k){return crypto.subtle.deriveBits({name:'PBKDF2',salt:new TextEncoder().encode('financas-nuvem|'+normT(nome)),iterations:NV_IT,hash:'SHA-256'},k,256)}).then(hex)}
function nvChave(senha,salt,it){return crypto.subtle.importKey('raw',new TextEncoder().encode(senha),'PBKDF2',false,['deriveKey']).then(function(k){return crypto.subtle.deriveKey({name:'PBKDF2',salt:salt,iterations:it,hash:'SHA-256'},k,{name:'AES-GCM',length:256},true,['encrypt','decrypt'])})}
function sbRpc(fn,args){return fetch(SB_URL+'/rest/v1/rpc/'+fn,{method:'POST',headers:{apikey:SB_KEY,'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify(acArgs(fn,args)),cache:'no-store',credentials:'omit',referrerPolicy:'no-referrer'}).then(function(r){return r.text().then(function(t){if(!r.ok)throw new Error('http'+r.status);try{return JSON.parse(t)}catch(e){return t}})})}
function nomeConta(){return(users.filter(function(u){return u.id===uid})[0]||{}).nome||''}
/* envia a cópia criptografada (chamado sozinho depois de cada mudança e uma vez por dia) */
/* backup compactado (gzip) antes de criptografar: ocupa bem menos espaço na nuvem */
function gzB64(txt){if(!window.CompressionStream)return Promise.resolve(null);try{var cs=new CompressionStream('gzip'),w=cs.writable.getWriter();w.write(new TextEncoder().encode(txt));w.close();return new Response(cs.readable).arrayBuffer().then(function(b){return b64(b)},function(){return null})}catch(e){return Promise.resolve(null)}}
function gunzB64(s){var ds=new DecompressionStream('gzip'),w=ds.writable.getWriter();w.write(unb64(s));w.close();return new Response(ds.readable).text()}
function nvEnvia(){var N=st&&st.nuvem;if(!N||!N.on||nvRodando)return Promise.resolve(false);if(!navigator.onLine){nvMarca(true,'Sem internet: envio quando a conexão voltar.');return Promise.resolve(false)}
 nvRodando=true;var txt;try{txt=JSON.stringify(snapshot())}catch(e){nvRodando=false;return Promise.resolve(false)}
 var z=0;return gzB64(txt).then(function(g){if(g&&g.length<txt.length){txt=g;z=1}return crypto.subtle.importKey('raw',unb64(N.k),{name:'AES-GCM'},false,['encrypt'])}).then(function(k){return enc(k,txt)}).then(function(r){
  var o={app:'financas',cripto:1,it:N.it,salt:N.salt,iv:r.iv,ct:r.ct};if(z)o.z=1;var env=JSON.stringify(o);return sbRpc('salvar_backup',{p_id:N.id,p_dados:env})}).then(function(){nvRodando=false;st.nuvem.ult=new Date().toISOString();nvMarca(false,'');return true},
  function(){nvRodando=false;nvMarca(true,'Não consegui enviar agora. Tento de novo sozinho.');return false})}
function nvMarca(pend,err){if(!st||!st.nuvem||!st.nuvem.on)return;st.nuvem.pend=pend;st.nuvem.err=err||'';nvMudo=true;save();nvMudo=false;try{if(!$('cfg').hidden)desenhaNuvem()}catch(e){}}
function nvAgenda(){if(nvMudo||!st||!st.nuvem||!st.nuvem.on)return;clearTimeout(nvTm);if(!st.nuvem.pend){st.nuvem.pend=true}nvTm=setTimeout(nvEnvia,20000)}
function nvDiario(){var N=st&&st.nuvem;if(!N||!N.on)return;var ult=Date.parse(N.ult||'')||0;if(N.pend||Date.now()-ult>20*3600000)setTimeout(nvEnvia,4000)}
window.addEventListener('online',function(){if(st&&st.nuvem&&st.nuvem.on&&st.nuvem.pend)setTimeout(nvEnvia,2000)});
document.addEventListener('visibilitychange',function(){if(document.hidden&&st&&st.nuvem&&st.nuvem.on&&st.nuvem.pend&&nvTm){clearTimeout(nvTm);nvEnvia()}});
/* ⚙ */
function desenhaNuvem(){var N=st&&st.nuvem,on=!!(N&&N.on);$('nvoff').hidden=on;$('nvon').hidden=!on;$('nvmsg').textContent='';
 if(on){var d=N.ult?new Date(N.ult):null;$('nvst').textContent=(d?'Último envio: '+pad(d.getDate())+'/'+pad(d.getMonth()+1)+' às '+pad(d.getHours())+':'+pad(d.getMinutes())+'.':'Ainda não enviado.')+(N.pend?' '+(N.err||'Envio pendente.'):' Tudo em dia.')}}
function nvAtiva(pw){var salt=crypto.getRandomValues(new Uint8Array(16)),nome=nomeConta(),id;
 return nvEndereco(nome,pw).then(function(x){id=x;return nvChave(pw,salt,NV_IT)}).then(function(k){return crypto.subtle.exportKey('raw',k)}).then(function(raw){
  st.nuvem={on:true,id:id,salt:b64(salt),it:NV_IT,k:b64(raw),ult:'',pend:true,err:''};nvMudo=true;save();nvMudo=false;return nvEnvia()})}
$('nvliga').onclick=function(){var pw=$('nvpw').value,pw2=$('nvpw2').value,m=$('nvmsg'),b=this;
 if(pw.length<8){m.textContent='A senha do backup precisa de 8 ou mais caracteres.';return}if(pw!==pw2){m.textContent='As senhas não são iguais.';return}
 b.disabled=true;m.textContent='Preparando... leva alguns segundos.';
 nvAtiva(pw).then(function(ok){$('nvpw').value=$('nvpw2').value='';b.disabled=false;desenhaNuvem();
  m.textContent=ok?'Backup na nuvem ligado. A partir de agora ele é enviado sozinho. Anote a senha: sem ela não dá para restaurar.':'Ligado, mas o primeiro envio falhou. O app tenta de novo sozinho.'},function(){b.disabled=false;m.textContent='Não consegui ligar agora. Tente de novo.'})};
$('nvagora').onclick=function(){var m=$('nvmsg');m.textContent='Enviando...';nvEnvia().then(function(ok){desenhaNuvem();m.textContent=ok?'Enviado.':'Não consegui enviar agora. Tento de novo sozinho.'})};
var nvArm=false,nvArmT=null;
$('nvdesl').onclick=function(){var b=this,m=$('nvmsg');if(!nvArm){nvArm=true;b.textContent='Toque de novo: desliga e apaga a cópia da nuvem';nvArmT=setTimeout(function(){nvArm=false;b.textContent='Desligar e apagar da nuvem'},4000);return}
 clearTimeout(nvArmT);nvArm=false;b.textContent='Desligar e apagar da nuvem';var id=st.nuvem&&st.nuvem.id;m.textContent='Apagando da nuvem...';
 (id?sbRpc('apagar_backup',{p_id:id}).then(function(x){return sbRpc('limpar_versoes',{p_id:id}).catch(function(){return x})}):Promise.resolve(true)).then(function(){clearTimeout(nvTm);st.nuvem={on:false};nvMudo=true;save();nvMudo=false;desenhaNuvem();$('nvmsg').textContent='Backup na nuvem desligado e apagado.'},function(){m.textContent='Não consegui apagar agora (sem internet?). Tente de novo.'})};
/* restaurar: com nome da conta + senha do backup */
function nvRestaura(nome,senha,m,depois,slot){m.textContent='Buscando na nuvem... leva alguns segundos.';
 nvEndereco(nome,senha).then(function(id){return slot!=null?sbRpc('ler_versao',{p_id:id,p_slot:slot}):sbRpc('ler_backup',{p_id:id})}).then(function(r){var row=Array.isArray(r)?r[0]:null;if(!row||!row.dados)throw 'nada';var env=JSON.parse(row.dados);
  if(env.cripto!==1||typeof env.salt!=='string'||typeof env.iv!=='string'||typeof env.ct!=='string'||!(env.it>=100000&&env.it<=2000000))throw 'formato';
  return derive(senha,unb64(env.salt),env.it).then(function(k){return dec(k,{iv:env.iv,ct:env.ct})}).then(function(t){return env.z===1?gunzB64(t):t},function(){throw 'senha'}).then(function(t){return{o:JSON.parse(t),quando:row.atualizado}})}).then(function(x){var v=validaBackup(x.o),d=new Date(x.quando);
  if(!confirm('Achei um backup de '+pad(d.getDate())+'/'+pad(d.getMonth()+1)+' às '+pad(d.getHours())+':'+pad(d.getMinutes())+' com '+v.items.length+' lançamentos. Substituir os dados deste aparelho por ele?')){m.textContent='Nada foi alterado.';return}
  var novo=migra(v);novo.nuvem={on:false};st=novo;save();m.textContent='Backup restaurado: '+st.items.length+' lançamentos. O backup na nuvem continua ligado.';return nvAtiva(senha).catch(function(){}).then(function(){if(depois)depois()})})
 .catch(function(e){m.textContent=e==='nada'?'Não achei backup com esse nome e senha. Confira o nome da conta (igual ao do outro celular) e a senha do backup.':e==='senha'?'Senha do backup incorreta.':'Não consegui buscar agora (sem internet?). Tente de novo.'})}
$('nvvers').onclick=function(){var pw=$('nvrpw').value,m=$('nvmsg'),L=$('nvvl');L.innerHTML='';if(pw.length<8){m.textContent='Digite a senha do backup acima.';return}m.textContent='Buscando as versões...';
 nvEndereco(nomeConta(),pw).then(function(id){return sbRpc('listar_versoes',{p_id:id})}).then(function(r){var a=Array.isArray(r)?r:[];m.textContent=a.length?'Escolha o dia para restaurar:':'Nenhuma versão encontrada com essa senha.';
  a.forEach(function(v){var d=new Date(v.atualizado),b=el_('button','add',['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'][d.getDay()]+', '+pad(d.getDate())+'/'+pad(d.getMonth()+1)+' às '+pad(d.getHours())+':'+pad(d.getMinutes()));b.type='button';b.onclick=function(){nvRestaura(nomeConta(),pw,m,function(){$('nvrpw').value='';L.innerHTML='';render();desenhaCfg()},v.slot)};L.appendChild(b)})}).catch(function(){m.textContent='Não consegui buscar agora (sem internet?). Tente de novo.'})};
$('nvrest').onclick=function(){var pw=$('nvrpw').value,m=$('nvmsg');if(pw.length<8){m.textContent='Digite a senha do backup.';return}nvRestaura(nomeConta(),pw,m,function(){$('nvrpw').value='';render();desenhaCfg()})};
$('ininv').onclick=function(){$('ininvw').hidden=!$('ininvw').hidden};
$('ininvok').onclick=function(){var pw=$('ininvpw').value,m=$('ininvmsg');if(pw.length<8){m.textContent='Digite a senha do backup.';return}nvRestaura(nomeConta(),pw,m,function(){$('ininvpw').value='';entra()})};
