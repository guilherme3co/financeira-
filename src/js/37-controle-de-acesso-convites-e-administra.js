/* ---------- controle de acesso: convites e administrador ---------- */
var ACC_NOVO=null,ACC_ULT='',ACC_FN=['salvar_backup','ler_backup','apagar_backup','listar_versoes','ler_versao','limpar_versoes','casal_salvar','casal_ler','avisos_salvar'],admArm='';
function acTok(){return(st&&st.acesso&&st.acesso.tok)||(ACC_NOVO&&ACC_NOVO.tok)||ACC_ULT||''}
function acArgs(fn,args){if(ACC_FN.indexOf(fn)>=0&&args&&typeof args==='object'){var t=acTok();if(t)args.p_acesso=t}return args}
function limpaAcesso(a){if(!a||typeof a!=='object'||!/^[a-f0-9]{64}$/.test(a.tok))return undefined;return{tok:a.tok,uso:/^\d{4}-\d{2}-\d{2}$/.test(a.uso)?a.uso:hoje(),adm:!!a.adm}}
function acNovoTok(){return casHex(crypto.getRandomValues(new Uint8Array(32)))}
function acNome(){return((users.filter(function(u){return u.id===uid})[0])||{nome:''}).nome||''}
function acCodFmt(s){s=String(s||'').toUpperCase().replace(/[^A-Z0-9]/g,'');if(s.length===11&&s.indexOf('FIN')===0)s=s.slice(3);return /^[2-9A-HJ-NP-Z]{8}$/.test(s)?'FIN-'+s.slice(0,4)+'-'+s.slice(4):''}
function acErro(e){var m=String(e&&e.message||e);if(/bloqueado/.test(m))return 'Este acesso está bloqueado. Fale com o administrador.';if(/vencido/.test(m))return 'Este convite venceu. Peça um novo ao administrador.';if(/convite invalido|precisa de convite/.test(m))return 'Código de convite inválido ou já usado.';if(navigator.onLine===false||/fetch|network|Load failed/i.test(m))return 'Sem internet. Para validar o convite, conecte-se.';return 'Não consegui validar agora. Tente de novo.'}
var AC_TXT={bloq:'Seu acesso foi bloqueado pelo administrador.',exp:'Seu acesso venceu: o app ficou mais de 30 dias sem uso. Peça um novo código de convite ao administrador.',rem:'Seu acesso foi removido. Para voltar, peça um novo código de convite ao administrador.',nao:'Esta conta precisa de um código de convite. Peça ao administrador.'};
function acTrava(tipo){if(!AC_TXT[tipo])tipo='nao';try{fechaMais();fechaLanc()}catch(e){}$('acsx').textContent=AC_TXT[tipo];$('acsw').hidden=tipo==='bloq';$('acsc').value='';$('acsm').textContent='';$('acs').hidden=false}
function acEntra(){if(!st)return;$('acs').hidden=true;if(ACC_NOVO){st.acesso={tok:ACC_NOVO.tok,uso:hoje(),adm:false};ACC_NOVO=null;save()}
 var a=st.acesso;if(a)ACC_ULT=a.tok;if(a&&!a.adm&&isoDias(a.uso,hoje())>30){acTrava('exp');return}
 if(a&&a.uso!==hoje()){a.uso=hoje();save()}admUI();setTimeout(acChecar,1200)}
function acChecar(){if(!st)return Promise.resolve();var a=st.acesso,id=uid;
 if(!a){var tok=acNovoTok();return casRpc('acesso_legado',{p_acesso:tok,p_nome:acNome()}).then(function(s){if(!st||uid!==id)return;st.acesso={tok:tok,uso:hoje(),adm:false};save();if(s!=='ok')acTrava(s)},function(e){if(st&&uid===id&&/precisa de convite/.test(String(e&&e.message)))acTrava('nao')})}
 return casRpc('acesso_checar',{p_acesso:a.tok,p_uso:a.uso}).then(function(r){var x=Array.isArray(r)?r[0]:r;if(!x||!st||uid!==id||!st.acesso)return;
  if(x.s==='ok'){if(st.acesso.adm!==!!x.adm){st.acesso.adm=!!x.adm;save()}admUI()}else acTrava(x.s)},function(){})}
$('acsok').onclick=function(){var cod=acCodFmt($('acsc').value),m=$('acsm'),b=this;if(!st)return;if(!cod){m.textContent='Digite o código no formato FIN-XXXX-XXXX.';return}
 var tok=(st.acesso&&st.acesso.tok)||acNovoTok();b.disabled=true;m.textContent='Validando...';
 casRpc('acesso_entrar',{p_acesso:tok,p_nome:acNome(),p_codigo:cod}).then(function(){st.acesso={tok:tok,uso:hoje(),adm:!!(st.acesso&&st.acesso.adm)};save();$('acs').hidden=true},function(e){m.textContent=acErro(e)}).then(function(){b.disabled=false})};
$('acsc').onkeydown=function(e){if(e.key==='Enter'){e.preventDefault();$('acsok').click()}};
$('acssai').onclick=function(){$('acs').hidden=true;sairConta()};
/* painel do administrador */
function admUI(){if(!st)return;var adm=!!(st.acesso&&st.acesso.adm);$('cfgadm').hidden=!adm;$('admatv').hidden=adm}
function admData(s){var t=Date.parse(s);if(!t)return '';var d=new Date(t);return pad(d.getDate())+'/'+pad(d.getMonth()+1)+'/'+String(d.getFullYear()).slice(2)}
function admTexto(cod){return 'Seu convite para o app Minhas Finanças: '+cod+'\nToque no link, digite seu nome e crie uma senha:\n'+location.origin+location.pathname+'?convite='+cod+'\nVale 30 dias. No iPhone: abra no Safari, toque em Compartilhar → Adicionar à Tela de Início, abra pelo ícone e digite o código.'}
function admCopia(cod,b){var t=admTexto(cod),o=b.textContent,ok=function(){b.textContent='Copiado!';setTimeout(function(){b.textContent=o},2000)};if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(t).then(ok,function(){$('admmsg').textContent='Não consegui copiar.'});else $('admmsg').textContent='Não consegui copiar.'}
function admCarrega(){var m=$('admmsg');if(!st||!st.acesso||!st.acesso.adm)return;m.textContent='Carregando...';
 casRpc('admin_lista',{p_acesso:st.acesso.tok}).then(function(r){m.textContent='';admDesenha(r||{})},function(e){m.textContent=/so o administrador/.test(String(e&&e.message))?'Esta conta não é administradora.':'Sem conexão. Tente de novo.'})}
function admDesenha(r){var U=$('admus'),C=$('admcv');U.innerHTML='';C.innerHTML='';var es=Number(r.espaco)||0,li=Number(r.limite)||524288000,pc=Math.min(100,Math.round(es/li*100));$('admesp').textContent=es?'💾 Espaço no servidor: '+(es/1048576).toFixed(1).replace('.',',')+' MB de '+Math.round(li/1048576)+' MB ('+pc+'%)'+(pc>=80?' ⚠️ quase cheio':''):'';var us=Array.isArray(r.usuarios)?r.usuarios:[],cv=Array.isArray(r.convites)?r.convites:[];
 var ST={ok:'✅ Liberado',bloq:'⛔ Bloqueado',exp:'⏰ Venceu (30 dias sem uso)'};
 if(!us.length)U.appendChild(el_('p','msg','Ninguém ainda.'));
 us.forEach(function(u){var d=el_('div','admu'),a=el_('div');a.appendChild(el_('b',null,tx(u.nome,40)||'Sem nome'));a.appendChild(el_('small',null,(u.eu?'Você · administrador':(ST[u.status]||u.status))+' · entrou '+admData(u.criado)+' · último acesso '+admData(u.visto)));d.appendChild(a);
  if(!u.eu&&/^[a-f0-9]{16}$/.test(u.id)){var bx=el_('div','admb');function bt(t,s,cls){var b=el_('button','add '+(cls||''),t);b.type='button';b.onclick=function(){if(s==='rem'&&admArm!==u.id){admArm=u.id;b.textContent='Toque de novo';setTimeout(function(){if(admArm===u.id){admArm='';b.textContent=t}},4000);return}admArm='';admMuda(u.id,s)};bx.appendChild(b)}
   if(u.status==='ok')bt('Bloquear','bloq');else bt('Liberar','ok','pri');bt('Remover','rem','perigo');d.appendChild(bx)}
  U.appendChild(d)});
 if(!cv.length)C.appendChild(el_('p','msg','Nenhum convite em aberto.'));
 cv.forEach(function(c){var d=el_('div','admu'),a=el_('div');a.appendChild(el_('b','admcodp',tx(c.codigo,20)));a.appendChild(el_('small',null,'vence '+admData(c.expira)));d.appendChild(a);var bx=el_('div','admb'),b1=el_('button','add','Copiar'),b2=el_('button','add perigo','Cancelar');b1.type=b2.type='button';b1.onclick=function(){admCopia(c.codigo,b1)};b2.onclick=function(){if(admArm!=='c'+c.codigo){admArm='c'+c.codigo;b2.textContent='Toque de novo';setTimeout(function(){if(admArm==='c'+c.codigo){admArm='';b2.textContent='Cancelar'}},4000);return}admArm='';casRpc('admin_cancela',{p_acesso:st.acesso.tok,p_codigo:c.codigo}).then(admCarrega,function(){$('admmsg').textContent='Não consegui cancelar.'})};bx.appendChild(b1);bx.appendChild(b2);d.appendChild(bx);C.appendChild(d)})}
function admMuda(id,s){var m=$('admmsg');m.textContent='Salvando...';casRpc('admin_status',{p_acesso:st.acesso.tok,p_id:id,p_status:s}).then(function(){m.textContent=s==='ok'?'Acesso liberado.':s==='bloq'?'Acesso bloqueado. Vale na próxima vez que a pessoa abrir o app com internet.':'Pessoa removida. Para voltar, precisa de um código novo.';admCarrega()},function(){m.textContent='Não consegui salvar. Confira a internet.'})}
var ADM_COD='';
$('admgera').onclick=function(){var m=$('admmsg'),b=this;b.disabled=true;m.textContent='Gerando...';casRpc('admin_convite',{p_acesso:st.acesso.tok}).then(function(r){var x=Array.isArray(r)?r[0]:r;if(!x||!x.codigo)throw 0;ADM_COD=tx(x.codigo,20);$('admcod').textContent=ADM_COD;$('admvence').textContent='Vale até '+admData(x.expira)+', para 1 pessoa.';$('admnovo').hidden=false;m.textContent='';admCarrega()},function(e){m.textContent=/muitos/.test(String(e&&e.message))?'Muitos convites em aberto. Cancele alguns antes.':'Não consegui gerar. Confira a internet.'}).then(function(){b.disabled=false})};
$('admcp').onclick=function(){if(ADM_COD)admCopia(ADM_COD,this)};
$('admsh').onclick=function(){if(!ADM_COD)return;if(navigator.share)navigator.share({text:admTexto(ADM_COD)}).catch(function(){});else admCopia(ADM_COD,this)};
$('admatu').onclick=admCarrega;
$('cfgadm').addEventListener('toggle',function(){if(this.open)admCarrega()});
$('admacok').onclick=function(){var m=$('admacm'),c=$('admac').value.trim(),b=this;if(!st||!st.acesso){m.textContent='Conecte-se à internet e abra o app de novo.';return}if(c.length<8){m.textContent='Digite o código de ativação.';return}
 b.disabled=true;m.textContent='Ativando...';casRpc('admin_ativar',{p_acesso:st.acesso.tok,p_codigo:c}).then(function(){st.acesso.adm=true;save();$('admac').value='';m.textContent='';admUI();abreCfg(false,'cfgadm')},function(){m.textContent='Código inválido ou já usado.'}).then(function(){b.disabled=false})};
