/* ---------- configurações, backup ---------- */
function lerReais(s){var m=String(s).match(NUM);if(!m)return NaN;return toVal(m[0])}
var cfg=$('cfg'),eng=$('eng');
function linhaConta(nome,saldo,cred){var w=$('contas'),r=document.createElement('div');r.className='crow cont';
r.innerHTML='<input class="cn" aria-label="Nome da conta" placeholder="Nome da conta" autocomplete="off"><button type="button" class="x" aria-label="Remover conta" title="Remover conta">×</button><label>Débito (R$)<input class="cs" aria-label="Saldo no débito" inputmode="decimal" placeholder="0,00" autocomplete="off"></label><label>Limite do crédito (R$)<input class="cc" aria-label="Limite do crédito" inputmode="decimal" placeholder="0,00" autocomplete="off"></label>';
var cn=r.querySelector('.cn'),cs=r.querySelector('.cs'),cc=r.querySelector('.cc');cn.value=nome;cs.value=saldo;cc.value=cred||'';
r.querySelector('.x').onclick=function(){if(w.children.length<2){$('inimsg').textContent='Deixe pelo menos uma conta.';return}r.remove()};
cs.onblur=cc.onblur=function(){var v=lerReais(this.value);if(v>=0&&this.value.trim())this.value=fmt2(v)};
w.appendChild(r)}
function desenhaCfg(){$('disp').value=fmt2(saldoAtual());$('dispmsg').textContent='';$('limv').value=fmt2(limAtual());$('limmsg').textContent='';$('contas').innerHTML='';st.contas.forEach(function(c){linhaConta(c.nome,fmt2(c.saldo),c.cred?fmt2(c.cred):'')});
desenhaParc();desenhaOpc();$('inimsg').textContent='';$('reabre').hidden=!(st.arquivo&&st.arquivo.length);$('fecha').hidden=!mesesPend().length;desenhaTema();desenhaDiv();$('fmsg').textContent='';$('ver').textContent='Minhas Finanças '+VERSAO}
$('addc').onclick=function(){linhaConta('','','')};
function abreCfg(foco,sec){if(!st)return;telaHist(true);$('topvolta').hidden=false;if(foco)sec='cfgdin';if(sec&&$(sec)){$(sec).open=true}if($('pgc').className.indexOf('on')<0)voltaK=Math.max(0,cur);ALLP.forEach(function(id){$(id).className='pg'});$('pgc').className='pg on';$('top').hidden=false;marcaNav(-1);$('ptit').textContent='Configurações';eng.setAttribute('aria-expanded','true');desenhaCfg();window.scrollTo(0,0);fabUpd();if(sec&&!foco)setTimeout(function(){try{$(sec).scrollIntoView({block:'start'})}catch(e){}},60);setTimeout(function(){if(!foco)tour('pgc')},420);if(foco)setTimeout(function(){$('disp').focus();$('disp').select()},120)}
eng.onclick=function(){if(!st)return;if($('pgc').className.indexOf('on')>=0)vaiPagina(voltaK);else abreCfg()};
/* tema: automático, claro ou escuro (vale para este aparelho) */
function temaLe(){try{var t=localStorage.getItem('financas-tema');return(t==='light'||t==='dark')?t:'auto'}catch(e){return'auto'}}
function temaAplica(){var t=temaLe(),R=document.documentElement;if(t==='auto')R.removeAttribute('data-theme');else R.setAttribute('data-theme',t);
 var esc=t==='dark'||(t==='auto'&&window.matchMedia&&matchMedia('(prefers-color-scheme: dark)').matches),m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute('content',esc?'#0F1814':'#1F8A55')}
function desenhaTema(){var t=temaLe();Array.prototype.forEach.call($('temas').children,function(b){b.setAttribute('aria-checked',b.getAttribute('data-t')===t?'true':'false')})}
Array.prototype.forEach.call($('temas').children,function(b){b.onclick=function(){try{var t=b.getAttribute('data-t');if(t==='auto')localStorage.removeItem('financas-tema');else localStorage.setItem('financas-tema',t)}catch(e){}temaAplica();desenhaTema()}});
temaAplica();try{matchMedia('(prefers-color-scheme: dark)').addEventListener('change',temaAplica)}catch(e){}
$('cfgvolta').onclick=function(){vaiPagina(voltaK)};
var cardD=$('ring').parentNode;cardD.setAttribute('role','button');cardD.tabIndex=0;cardD.title='Toque para ver os lançamentos';cardD.setAttribute('aria-label','Ver os lançamentos do mês');
cardD.onclick=function(){abreLan()};cardD.onkeydown=function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();abreLan()}};
$('dispok').onclick=function(){var m=$('dispmsg'),v=lerReais($('disp').value);if(!(v>=0)){m.textContent='Digite um valor válido, por exemplo 639,73.';return}
var alvo=Math.round(v*100)/100,dif=Math.round((alvo-saldoAtual())*100)/100;
if(dif===0){m.textContent='O disponível já é '+brl(alvo)+'.';return}
var c=st.contas[0];c.saldo=Math.round((Number(c.saldo)+dif)*100)/100;st.start=somaContas(st);save();render();desenhaCfg();
m.textContent='Disponível ajustado para '+brl(alvo)+'. Diferença de '+(dif>0?'+ ':'− ')+brl(Math.abs(dif))+' aplicada no saldo inicial de "'+c.nome+'".'};
$('iniok').onclick=function(){var m=$('inimsg'),rows=$('contas').children,cs=[],ok=true;
Array.prototype.forEach.call(rows,function(r,k){var v=lerReais(r.querySelector('.cs').value),cvs=r.querySelector('.cc').value.trim(),cv=cvs?lerReais(cvs):0;if(!(v>=0)||!(cv>=0)){ok=false;return}cs.push({id:k+1,nome:(r.querySelector('.cn').value||'').trim()||'Conta '+(k+1),saldo:r2(v),cred:r2(cv)})});
if(!ok||!cs.length){m.textContent='Confira os valores: digite algo como 639,73.';return}
st.contas=cs;st.start=somaContas(st);save();render();
m.textContent='Salvo. Débito '+brl(st.start)+(somaCred(st)?' · limite '+brl(somaCred(st)):'')+' em '+cs.length+(cs.length===1?' conta.':' contas.')};
$('limok').onclick=function(){var m=$('limmsg'),v=lerReais($('limv').value);if(!(v>=0)){m.textContent='Digite um valor válido, por exemplo 800,00.';return}
var alvo=r2(v),dif=r2(alvo-limAtual());if(dif===0){m.textContent='O limite já é '+brl(alvo)+'.';return}
var c=st.contas[0];c.cred=r2((Number(c.cred)||0)+dif);save();render();desenhaCfg();m.textContent='Limite ajustado para '+brl(alvo)+'.'};
$('limv').onblur=function(){var v=lerReais(this.value);if(v>=0)this.value=fmt2(v)};
/* microfone */
function desenhaOpc(){desenhaMem();desenhaBio();desenhaNuvem();$('abremic').checked=!!st.abreMic;$('autocomp').checked=st.autoComp!==false}
$('abremic').onchange=function(){st.abreMic=this.checked;save()};
$('autocomp').onchange=function(){st.autoComp=this.checked;save()};
$('rever').onclick=function(){st.tut={};save();vaiPagina(0)};
function entrega(txt,nome,compartilhar,m){
var marca=function(){st.ultimoBackup=hoje();save();$('aviso').hidden=true};
if(compartilhar&&window.File&&navigator.canShare){var f=new File([txt],nome,{type:'application/json'});if(navigator.canShare({files:[f]})){return navigator.share({files:[f],title:'Backup Minhas Finanças'}).then(function(){marca();m.textContent='Backup criptografado compartilhado.'}).catch(function(){m.textContent='Compartilhamento cancelado.'})}}
var b=new Blob([txt],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=nome;document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(a.href)},2000);marca();m.textContent=compartilhar?'Este aparelho não permite compartilhar arquivo; o backup foi salvo em Downloads.':'Backup criptografado salvo. Procure o arquivo em Downloads.'}
function exporta(compartilhar){var m=$('bkmsg'),pw=$('bkpw').value;
if(pw.length<8){m.textContent='Digite acima a senha do backup (8+ caracteres).';return}
m.textContent='Criptografando o backup...';
var txt,nome='financas-backup-'+hoje()+'.json',salt=crypto.getRandomValues(new Uint8Array(16));
try{txt=JSON.stringify(snapshot())}catch(e){m.textContent='Não consegui gerar o backup neste navegador.';return}
return derive(pw,salt,KDF_IT).then(function(k){return enc(k,txt)}).then(function(r){return entrega(JSON.stringify({app:'financas',cripto:1,it:KDF_IT,salt:b64(salt),iv:r.iv,ct:r.ct}),nome,compartilhar,m)}).catch(function(){m.textContent='Não consegui gerar o backup neste navegador.'})}
$('exp').onclick=function(){exporta(false)};
$('expShare').onclick=function(){exporta(true)};
$('impb').onclick=function(){$('imp').click()};
function nm(x,lo,hi,d){x=Number(x);return isFinite(x)?Math.max(lo,Math.min(hi,x)):d}
function tx(x,n){return String(x==null?'':x).replace(/[\u0000-\u001f]/g,' ').slice(0,n)}
function limpaItens(arr,max){if(!Array.isArray(arr))return[];var base=Date.now(),out=[];arr.slice(0,max).forEach(function(i,k){if(!i||typeof i!=='object')return;var v=Number(i.val);if(!isFinite(v)||v<0||v>1e9)return;
out.push({id:nm(i.id,1,9e15,base+k),d:/^\d{4}-\d{2}-\d{2}$/.test(i.d)?i.d:hoje(),t:/^\d{2}:\d{2}/.test(i.t)?String(i.t).slice(0,5):'',desc:tx(i.desc,200),val:Math.round(v*100)/100,pay:tx(i.pay,30)||'Não informada',cor:tx(i.cor,12),ent:!!i.ent,x:i.x?tx(i.x,80):undefined,lug:i.lug?tx(i.lug,30):undefined,obj:Number(i.obj)>0?Math.round(nm(i.obj,1,9e15,1)):undefined,ret:i.ret?true:undefined,dev:i.dev?true:undefined,rx:i.rx?true:undefined,pc:Number(i.pc)>0?Math.round(nm(i.pc,1,9e15,1)):undefined,dv:Number(i.dv)>0?Math.round(nm(i.dv,1,9e15,1)):undefined,txid:i.txid?tx(i.txid,48):undefined,cat:/^[a-z0-9]{1,16}$/.test(i.cat)?i.cat:undefined,doc:/^\d{14}$/.test(i.doc)?i.doc:undefined})});return out}
function limpaContas(cs){if(!Array.isArray(cs))return[];return cs.slice(0,30).map(function(c,k){c=c||{};return{id:nm(c.id,1,1e9,k+1),nome:tx(c.nome,40)||'Conta '+(k+1),saldo:nm(c.saldo,-1e9,1e9,0),cred:nm(c.cred,-1e9,1e9,0)}})}
function limpaFat(arr){return(Array.isArray(arr)?arr:[]).slice(0,2000).map(function(f,k){f=f||{};return{id:nm(f.id,1,9e15,Date.now()+k),d:/^\d{4}-\d{2}-\d{2}$/.test(f.d)?f.d:hoje(),t:tx(f.t,5),val:nm(f.val,0,1e9,0)}})}
function validaBackup(o){if(!o||typeof o!=='object'||typeof o.start!=='number'||!Array.isArray(o.items))throw 0;
return{start:nm(o.start,-1e9,1e9,0),contas:limpaContas(o.contas),lim:o.lim&&typeof o.lim==='object'?{y:nm(o.lim.y,0,1e9,400),r:nm(o.lim.r,0,1e9,100)}:undefined,gAnt:nm(o.gAnt,0,1e9,0),sep:o.sep?1:0,salario:nm(o.salario,0,1e9,0),
dividas:(Array.isArray(o.dividas)?o.dividas:[]).slice(0,100).map(function(d,k){d=d||{};var n=Math.round(nm(d.n,0,360,0));return{id:nm(d.id,1,9e15,Date.now()+k),nome:tx(d.nome,60)||'Dívida',valor:nm(d.valor,0,1e9,0),pago:!!d.pago,n:n,total:nm(d.total,0,1e9,0),pagas:Math.min(n,Math.round(nm(d.pagas,0,360,0))),ult:/^\d{4}-\d{2}$/.test(d.ult)?d.ult:'',dia:Math.round(nm(d.dia,0,31,0))}}),
arquivo:(Array.isArray(o.arquivo)?o.arquivo:[]).slice(0,240).map(function(a){a=a||{};return{id:nm(a.id,0,9e15,0),mes:/^\d{4}-\d{2}$/.test(a.mes)?a.mes:undefined,auto:a.auto?1:undefined,rotulo:tx(a.rotulo,40),fechadoEm:/^\d{4}-\d{2}-\d{2}$/.test(a.fechadoEm)?a.fechadoEm:hoje(),ini:nm(a.ini,-1e9,1e9,0),fim:nm(a.fim,-1e9,1e9,0),rec:nm(a.rec,0,1e12,0),gasto:nm(a.gasto,0,1e12,0),gua:nm(a.gua,0,1e12,0),items:limpaItens(a.items,50000).map(norm),prevContas:limpaContas(a.prevContas),prevGAnt:nm(a.prevGAnt,0,1e9,0),faturas:limpaFat(a.faturas),plano:(a.plano&&typeof a.plano==='object')?{sal:nm(a.plano.sal,0,1e9,0),div:nm(a.plano.div,0,1e9,0),pagas:nm(a.plano.pagas,0,1e9,0),n:Math.round(nm(a.plano.n,0,100,0)),sobra:nm(a.plano.sobra,-1e9,1e9,0)}:undefined}}),
faturas:limpaFat(o.faturas),lugares:(Array.isArray(o.lugares)?o.lugares:[]).slice(0,30).map(function(x){return tx(x,30)}).filter(Boolean),obj:(Array.isArray(o.obj)?o.obj:[]).slice(0,30).map(function(x,k){x=x||{};return{id:nm(x.id,1,9e15,Date.now()+k),nome:tx(x.nome,40)||'Objetivo',meta:nm(x.meta,0,1e9,0),ini:nm(x.ini,0,1e9,0),prazo:/^\d{4}-\d{2}-\d{2}$/.test(x.prazo)?x.prazo:undefined}}),gBase:(function(g){var r={};if(g&&typeof g==='object')Object.keys(g).slice(0,30).forEach(function(k){var v=Number(g[k]);if(isFinite(v)&&Math.abs(v)<=1e9)r[tx(k,30)]=Math.round(v*100)/100});return r})(o.gBase),
parcelas:(Array.isArray(o.parcelas)?o.parcelas:[]).slice(0,60).map(function(p,k){p=p||{};var n=Math.round(nm(p.n,2,60,2)),v2=!!p.v2;return{id:nm(p.id,1,9e15,Date.now()+k),desc:tx(p.desc,60)||'Compra',tot:nm(p.tot,0,1e9,0),n:n,k:Math.round(nm(p.k,v2?1:2,n+1,v2?1:2)),d0:/^\d{4}-\d{2}-\d{2}$/.test(p.d0)?p.d0:hoje(),cor:(p.cor==='uti'||p.cor==='des')?p.cor:'sem',v2:v2?1:undefined,t:v2?tx(p.t,5):undefined,cat:/^[a-z0-9]{1,16}$/.test(p.cat)?p.cat:undefined,txid:p.txid?tx(p.txid,48):undefined,doc:/^\d{14}$/.test(p.doc)?p.doc:undefined}}),metas:(o.metas&&typeof o.metas==='object')?{uti:nm(o.metas.uti,0,1e9,0),des:nm(o.metas.des,0,1e9,0),tot:nm(o.metas.tot,0,1e9,0)}:undefined,lemb:(o.lemb&&typeof o.lemb==='object')?{on:!!o.lemb.on,h:Math.round(nm(o.lemb.h,18,23,21))}:undefined,abreMic:!!o.abreMic,autoComp:o.autoComp!==false,invMeta:nm(o.invMeta,0,1e8,0),patri:(o.patri&&typeof o.patri==='object')?o.patri:undefined,mentor:limpaMentor(o.mentor),cats:limpaMem(o).cats,regras:limpaMem(o).regras,memV:o.memV?1:0,tut:(o.tut&&typeof o.tut==='object')?o.tut:undefined,rend:(function(g){var r={};if(g&&typeof g==='object')Object.keys(g).slice(0,30).forEach(function(k){var x=g[k];if(!x||typeof x!=='object')return;var p=Number(x.pct);if(p>=1&&p<=500&&/^\d{4}-\d{2}-\d{2}$/.test(x.ini))r[tx(k,30)]={pct:p,ini:x.ini,iso:!!x.iso}});return r})(o.rend),cdi:(o.cdi&&typeof o.cdi==='object')?{on:!!o.cdi.on,anual:nm(o.cdi.anual,0,100,0)}:undefined,
items:limpaItens(o.items,50000),cons:(o.cons&&typeof o.cons==='object')?{extra:o.cons.extra==null?null:nm(o.cons.extra,0,1e9,0),limDes:o.cons.limDes==null?null:nm(o.cons.limDes,0,1e9,0),simPct:nm(o.cons.simPct,0,100,50),simMeta:nm(o.cons.simMeta,0,1e9,1000)}:undefined}}
$('imp').onchange=function(){var f=this.files[0],inp=this,m=$('bkmsg');if(!f)return;
if(f.size>20e6){m.textContent='Arquivo grande demais para ser um backup deste app.';inp.value='';return}
var r=new FileReader();r.onload=function(){var env,legado=false;
try{env=JSON.parse(r.result);if(!env||typeof env!=='object')throw 0}catch(e){m.textContent='Arquivo inválido. Use um backup gerado por este app.';inp.value='';return}
var pr;
if(env.cripto===1){var pw=$('bkpw').value;if(!pw){m.textContent='Backup criptografado. Digite a senha acima e escolha o arquivo de novo.';inp.value='';return}
 if(typeof env.salt!=='string'||typeof env.iv!=='string'||typeof env.ct!=='string'||!(env.it>=100000&&env.it<=2000000)){m.textContent='Arquivo inválido. Use um backup gerado por este app.';inp.value='';return}
 m.textContent='Abrindo o backup...';
 pr=derive(pw,unb64(env.salt),env.it).then(function(k){return dec(k,{iv:env.iv,ct:env.ct})}).then(function(t){return JSON.parse(t)},function(){throw 'senha'})}
else{legado=true;pr=Promise.resolve(env)}
pr.then(function(o){var v=validaBackup(o);
 if(!confirm((legado?'Atenção: este backup antigo não é criptografado. ':'')+'Substituir os dados atuais pelo backup ('+v.items.length+' lançamentos)?'))return;
 var novo=migra(v);novo.nuvem=(st&&st.nuvem)||{on:false};st=novo;save();render();m.textContent='Backup importado: '+st.items.length+' lançamentos.'+(legado?' Faça um novo backup para ele ficar criptografado.':'')})
.catch(function(e){m.textContent=e==='senha'?'Senha do backup incorreta ou arquivo alterado.':'Arquivo inválido. Use um backup gerado por este app.'}).then(function(){inp.value=''})};r.readAsText(f)};
var zArm=false,zTm=null;
$('zera').onclick=function(){var b=this;
if(!zArm){zArm=true;b.textContent='Toque de novo para apagar os dados';zTm=setTimeout(function(){zArm=false;b.textContent='Apagar meus dados e recomeçar'},4000);return}
clearTimeout(zTm);zArm=false;b.textContent='Apagar meus dados e recomeçar';
try{localStorage.removeItem(dkey(uid))}catch(e){}st=null;eng.setAttribute('aria-expanded','false');mostraSetup()};

