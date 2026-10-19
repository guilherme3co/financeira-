/* ---------- guardado: onde está + objetivos ---------- */
var DEF_LUG=['Mercado Pago','Inter','Nubank','PicPay','C6 Bank','Caixa','Dinheiro'];
var ALI={'mercado pago':'Mercado Pago','mercadopago':'Mercado Pago','mercado livre':'Mercado Pago','inter':'Inter','banco inter':'Inter','nubank':'Nubank','nu bank':'Nubank','roxinho':'Nubank','picpay':'PicPay','pic pay':'PicPay','c6':'C6 Bank','c6 bank':'C6 Bank','caixa':'Caixa','dinheiro':'Dinheiro','carteira':'Dinheiro','cofre':'Dinheiro'};
function itemsTodos(){var a=[];(st.arquivo||[]).forEach(function(x){(x.items||[]).forEach(function(i){a.push(i)})});return a.concat(st.items)}
function guaLugares(){var m={};Object.keys(st.gBase||{}).forEach(function(k){m[k]=Number(st.gBase[k])||0});
itemsTodos().forEach(function(i){if(!i.ent&&i.cor==='gua'&&i.lug)m[i.lug]=(m[i.lug]||0)+(i.ret?-i.val:i.val)});
Object.keys(m).forEach(function(k){m[k]=r2(m[k])});return m}
function todosLugares(){var out=[],seen={};function add(n){var k=normT(n);if(n&&!seen[k]){seen[k]=1;out.push(n)}}
DEF_LUG.forEach(add);(st.lugares||[]).forEach(add);Object.keys(guaLugares()).forEach(add);return out}
function achaLugar(raw){var t=' '+normT(raw)+' ',best='',bl=0;
var nomes=todosLugares().map(function(n){return[normT(n),n]});Object.keys(ALI).forEach(function(k){nomes.push([k,ALI[k]])});
nomes.forEach(function(x){if(x[0]&&t.indexOf(' '+x[0]+' ')>=0&&x[0].length>bl){bl=x[0].length;best=x[1]}});return best}
function tiraLugar(desc,lug){var d=' '+desc+' ';var ks=[normT(lug)];Object.keys(ALI).forEach(function(k){if(ALI[k]===lug)ks.push(k)});
ks.forEach(function(k){var re=new RegExp('\\s(?:no|na|em|do|da|de|pro|pra|para o|para a)?\\s*'+k.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'(?=\\s)','i');d=d.replace(re,' ')});
return d.replace(/\s+/g,' ').trim()}
/* prazo do objetivo: quanto guardar por semana e por mês */
function objPrazo(o,cur){if(!o.prazo||!(o.meta>0))return null;var falta=r2(o.meta-cur),dt=new Date(o.prazo+'T12:00:00'),pz=pad(dt.getDate())+'/'+pad(dt.getMonth()+1)+'/'+dt.getFullYear();if(falta<=0.004)return{c:'ok',t:'Meta alcançada! 🎉 Prazo era '+pz+'.'};var d=isoDias(hoje(),o.prazo);if(d<=0)return{c:'al',t:'O prazo ('+pz+') passou. Faltam '+brl(falta)+'.'};
 var sem=Math.max(1,Math.ceil(d/7)),mes=Math.max(1,Math.ceil(d/30.44));return{c:'',t:'Até '+pz+': guarde '+brl(r2(falta/sem))+' por semana'+(sem>=5?' ('+brl(r2(falta/mes))+' por mês)':'')+'.'}}
function objProg(o){var x=Number(o.ini)||0;itemsTodos().forEach(function(i){if(!i.ent&&i.cor==='gua'&&i.obj===o.id)x+=i.ret?-i.val:i.val});return r2(x)}
var retLug=null,defOpen=false,LM={},OM={},MN=null;
function fechaMn(){var a=document.querySelectorAll('.gpop');for(var i=0;i<a.length;i++)a[i].remove();var d=document.querySelectorAll('.gdots');for(var j=0;j<d.length;j++)d[j].setAttribute('aria-expanded','false')}
function menuPts(items,key){var w=el_('span','gmw'),bt=document.createElement('button');bt.type='button';bt.className='gdots';bt.textContent='⋯';bt.title='Opções';bt.setAttribute('aria-label','Mais opções');bt.setAttribute('aria-haspopup','menu');bt.setAttribute('aria-expanded','false');
bt.onclick=function(e){e.stopPropagation();var abre=MN!==key;fechaMn();MN=null;if(!abre)return;MN=key;bt.setAttribute('aria-expanded','true');var pop=el_('div','gpop');pop.setAttribute('role','menu');
items.forEach(function(it){var b=el_('button',it[0].indexOf('Apagar')===0||it[0].indexOf('Excluir')===0?'pg-x':'',it[0]);b.type='button';b.setAttribute('role','menuitem');b.onclick=function(ev){ev.stopPropagation();fechaMn();MN=null;it[1]()};pop.appendChild(b)});w.appendChild(pop);var f=pop.querySelector('button');if(f)try{f.focus()}catch(x){}};
w.appendChild(bt);return w}
document.addEventListener('click',function(){MN=null;fechaMn()});document.addEventListener('keydown',function(e){if(e.key==='Escape'){MN=null;fechaMn()}});
function formLugar(host,k,bal){var f=el_('div','gf'),ms=el_('p','msg','');ms.setAttribute('role','alert');var g=el_('div','gb'),ok=el_('button','add pri',LM.modo==='ren'?'Salvar':'Apagar lugar'),cn=el_('button','add','Cancelar');ok.type=cn.type='button';
cn.onclick=function(){LM={};renderGuardados()};
if(LM.modo==='ren'){var inp=document.createElement('input');inp.value=k;inp.maxLength=30;inp.autocomplete='off';inp.setAttribute('aria-label','Novo nome');f.appendChild(inp);f.appendChild(ms);
ok.onclick=function(){var n=(inp.value||'').trim().slice(0,30);if(!n){ms.textContent='Digite o nome.';return}if(n===k){LM={};renderGuardados();return}
var ex=todosLugares().filter(function(x){return x!==k&&normT(x)===normT(n)})[0];if(ex){ms.textContent='Já existe '+ex+'. Use outro nome.';return}
itemsTodos().forEach(function(i){if(i.lug===k)i.lug=n});if(st.gBase&&k in st.gBase){st.gBase[n]=st.gBase[k];delete st.gBase[k]}
st.lugares=(st.lugares||[]).map(function(x){return x===k?n:x});if(st.lugares.indexOf(n)<0&&DEF_LUG.indexOf(k)<0&&!st.lugares.length)st.lugares.push(n);if(st.rend&&st.rend[k]){st.rend[n]=st.rend[k];delete st.rend[k]}
LM={};save();render();toast('Renomeado para '+n)};setTimeout(function(){try{inp.focus();inp.select()}catch(e){}},30)}
else{var sl=null;f.appendChild(el_('p','msg',bal>0.004?'Em '+k+' há '+brl(bal)+'. O valor continua guardado; só muda o lugar.':'Apagar '+k+' da lista?'));
if(bal>0.004){sl=document.createElement('select');sl.setAttribute('aria-label','O que fazer com o valor');var o0=document.createElement('option');o0.value='';o0.textContent='Deixar em “Sem local”';sl.appendChild(o0);
todosLugares().filter(function(x){return x!==k}).forEach(function(n){var o=document.createElement('option');o.value=n;o.textContent='Mover para '+n;sl.appendChild(o)});f.appendChild(sl)}
if(st.rend&&st.rend[k])f.appendChild(el_('p','msg','O rendimento deste lugar será desligado.'));f.appendChild(ms);
var arm=false;ok.onclick=function(){if(!arm){arm=true;ok.textContent='Toque de novo para apagar';setTimeout(function(){arm=false;ok.textContent='Apagar lugar'},3500);return}
var dest=sl?sl.value:'';itemsTodos().forEach(function(i){if(i.lug===k){if(dest)i.lug=dest;else delete i.lug}});
var b0=Number((st.gBase||{})[k])||0;if(st.gBase){delete st.gBase[k];if(dest&&b0)st.gBase[dest]=r2((Number(st.gBase[dest])||0)+b0)}
st.lugares=(st.lugares||[]).filter(function(x){return x!==k});if(st.rend)delete st.rend[k];LM={};save();render();toast(k+' apagado')}}
g.appendChild(ok);g.appendChild(cn);f.appendChild(g);host.appendChild(f)}
function formObj(host,o){var f=el_('div','gf'),ms=el_('p','msg',''),g=el_('div','gb'),ok=el_('button','add pri',OM.modo==='ed'?'Salvar':'Excluir objetivo'),cn=el_('button','add','Cancelar');ms.setAttribute('role','alert');ok.type=cn.type='button';
cn.onclick=function(){OM={};renderGuardados()};
if(OM.modo==='ed'){var n=document.createElement('input');n.value=o.nome;n.maxLength=30;n.setAttribute('aria-label','Nome');n.autocomplete='off';var mt=document.createElement('input');mt.setAttribute('inputmode','decimal');mt.setAttribute('aria-label','Meta (R$)');mt.placeholder='Meta (R$), vazio = sem meta';mt.value=o.meta>0?fmt2(o.meta):'';mt.autocomplete='off';mt.style.marginTop='6px';var pzl=el_('label',null,'Prazo (opcional)'),pzi=document.createElement('input');pzi.type='date';pzi.value=o.prazo||'';pzi.setAttribute('aria-label','Prazo');f.appendChild(n);f.appendChild(mt);f.appendChild(pzl);f.appendChild(pzi);f.appendChild(ms);
ok.onclick=function(){var nm=(n.value||'').trim().slice(0,30),mv=mt.value.trim()?lerReais(mt.value):0;if(!nm){ms.textContent='Digite o nome.';return}if(!(mv>=0)){ms.textContent='Confira a meta.';return}var pv=pzi.value;if(pv&&!/^\d{4}-\d{2}-\d{2}$/.test(pv))pv='';if(pv&&!(mv>0)){ms.textContent='Para usar prazo, informe a meta em reais.';return}o.nome=nm;o.meta=r2(mv);if(pv)o.prazo=pv;else delete o.prazo;OM={};save();render();toast('Objetivo salvo')}}
else{f.appendChild(el_('p','msg','Excluir “'+o.nome+'”? Os valores guardados continuam, só saem do objetivo.'));f.appendChild(ms);var arm=false;
ok.onclick=function(){if(!arm){arm=true;ok.textContent='Toque de novo para excluir';setTimeout(function(){arm=false;ok.textContent='Excluir objetivo'},3500);return}
st.obj=st.obj.filter(function(z){return z.id!==o.id});itemsTodos().forEach(function(i){if(i.obj===o.id)delete i.obj});OM={};save();render()}}
g.appendChild(ok);g.appendChild(cn);f.appendChild(g);host.appendChild(f)}
function renderGuardados(){var W=$('gplaces'),O=$('gobjs');if(!W||!O)return;W.innerHTML='';O.innerHTML='';
var m=guaLugares(),tot=guardadoTotal(),soma=0;(st.lugares||[]).concat(Object.keys(st.rend||{})).forEach(function(k){if(m[k]==null)m[k]=0});var nomes=Object.keys(m).filter(function(k){return m[k]>0.004||(st.lugares||[]).indexOf(k)>=0||(st.rend&&st.rend[k])}).sort(function(a,b){return m[b]-m[a]});
nomes.forEach(function(k){soma+=m[k]});var sem=r2(tot-soma);
if(!nomes.length&&sem<=0.004){W.appendChild(el_('p','msg','Nada guardado ainda.'))}
nomes.forEach(function(k){var d=el_('div','gl'),h=el_('div','glh');h.appendChild(el_('span','',k));h.appendChild(el_('b','',brl(m[k])));d.appendChild(h);
var rc=st.rend&&st.rend[k];if(rc){var rr=rendLug(k);d.appendChild(el_('p','gsub2',rc.pct+'% do CDI · desde '+dm(rc.ini)+(rr?' · líquido estimado '+brl(rr.rows[rr.rows.length-1].l)+' · rendeu '+brl(rr.tot):'')))}
var its=[];if(m[k]>0.004)its.push(['Retirar',function(){retLug=(retLug===k?null:k);LM={};RD.f=null;renderGuardados()}]);
its.push([rc?'Rendimento':'Fazer render',function(){RD.f=(RD.f===k?null:k);retLug=null;LM={};renderGuardados()}]);
its.push(['Renomear',function(){LM={k:k,modo:'ren'};retLug=null;RD.f=null;renderGuardados()}]);
its.push(['Apagar lugar',function(){LM={k:k,modo:'del'};retLug=null;RD.f=null;renderGuardados()}]);
h.appendChild(menuPts(its,'l:'+k));
if(LM.k===k)formLugar(d,k,m[k]);
if(RD.f===k)formRend(d,k);
if(retLug===k){var f=el_('div','gf'),inp=document.createElement('input');inp.className='gv';inp.setAttribute('inputmode','decimal');inp.setAttribute('aria-label','Valor a retirar');inp.placeholder='Valor a retirar (R$)';inp.autocomplete='off';f.appendChild(inp);
var lb=document.createElement('label');lb.style.cssText='display:flex;gap:8px;align-items:center;margin:6px 0';var ck=document.createElement('input');ck.type='checkbox';ck.style.cssText='width:auto;min-height:0';lb.appendChild(ck);lb.appendChild(document.createTextNode('Somar ao Disponível'));f.appendChild(lb);
var ms=el_('p','msg','');ms.setAttribute('role','alert');f.appendChild(ms);var gb=el_('div','gb'),ok=el_('button','add pri','Retirar'),cn=el_('button','add','Cancelar');ok.type=cn.type='button';
ok.onclick=function(){var v=lerReais(inp.value);if(!(v>0)){ms.textContent='Digite um valor, por exemplo 50,00.';return}v=r2(v);if(v>m[k]+0.004){ms.textContent='Em '+k+' há só '+brl(m[k])+'.';return}
addItem({id:Date.now(),d:hoje(),t:hora(),desc:'Retirada '+k,val:v,pay:'Retirada',cor:'gua',ent:false,ret:true,lug:k,dev:!!ck.checked});retLug=null;render();toast('Retirado '+brl(v)+' de '+k+(ck.checked?' · somou ao Disponível':''))};
cn.onclick=function(){retLug=null;renderGuardados()};gb.appendChild(ok);gb.appendChild(cn);f.appendChild(gb);d.appendChild(f);setTimeout(function(){try{inp.focus()}catch(e){}},30)}
W.appendChild(d)});
if(sem>0.004){var d2=el_('div','gl'),h2=el_('div','glh');h2.appendChild(el_('span','','Sem local'));h2.appendChild(el_('b','',brl(sem)));d2.appendChild(h2);
var b2=el_('div','gbtns'),db=el_('button','add','Definir lugar');db.type='button';db.onclick=function(){defOpen=!defOpen;renderGuardados()};b2.appendChild(db);d2.appendChild(b2);
if(defOpen){var f2=el_('div','gf'),sl=document.createElement('select');sl.setAttribute('aria-label','Lugar');todosLugares().concat(['__novo']).forEach(function(n){var o=document.createElement('option');o.value=n;o.textContent=n==='__novo'?'+ Outro lugar...':n;sl.appendChild(o)});f2.appendChild(sl);
var nn=document.createElement('input');nn.placeholder='Nome do lugar';nn.autocomplete='off';nn.hidden=true;nn.style.marginTop='6px';f2.appendChild(nn);sl.onchange=function(){nn.hidden=(sl.value!=='__novo')};
var vv=document.createElement('input');vv.className='gv';vv.setAttribute('inputmode','decimal');vv.setAttribute('aria-label','Valor');vv.value=fmt2(sem);vv.style.marginTop='6px';f2.appendChild(vv);
var m2=el_('p','msg','');m2.setAttribute('role','alert');f2.appendChild(m2);var g2=el_('div','gb'),o2=el_('button','add pri','Definir'),c2=el_('button','add','Cancelar');o2.type=c2.type='button';
o2.onclick=function(){var v=lerReais(vv.value),l=sl.value;if(l==='__novo'){l=(nn.value||'').trim().slice(0,30);if(!l){m2.textContent='Digite o nome do lugar.';return}var ex=todosLugares().filter(function(n){return normT(n)===normT(l)})[0];if(ex)l=ex;else st.lugares.push(l)}
if(!(v>0)||v>sem+0.004){m2.textContent='Digite até '+brl(sem)+'.';return}if(!st.gBase)st.gBase={};st.gBase[l]=r2((Number(st.gBase[l])||0)+r2(v));defOpen=false;save();render();toast(brl(v)+' definido em '+l)};
c2.onclick=function(){defOpen=false;renderGuardados()};g2.appendChild(o2);g2.appendChild(c2);f2.appendChild(g2);d2.appendChild(f2)}
W.appendChild(d2)}
(st.obj||[]).forEach(function(o){var cur=objProg(o),d=el_('div','gl'),h=el_('div','glh');h.appendChild(el_('span','',o.nome));
h.appendChild(el_('b','',brl(cur)+(o.meta>0?' / '+brl(o.meta):'')));d.appendChild(h);
if(o.meta>0){var bar=el_('div','rbar'),i2=document.createElement('i'),pct=Math.max(0,Math.min(100,cur/o.meta*100));i2.style.width=pct+'%';i2.style.display='block';i2.style.height='100%';i2.style.background='var(--pos)';i2.style.borderRadius='inherit';bar.style.cssText='height:8px;border-radius:4px;background:var(--line);overflow:hidden';bar.setAttribute('role','progressbar');bar.setAttribute('aria-valuenow',String(Math.round(pct)));bar.appendChild(i2);d.appendChild(bar);d.appendChild(el_('p','gsub2',Math.round(pct)+'% · faltam '+brl(Math.max(0,o.meta-cur))));var pzx=objPrazo(o,cur);if(pzx)d.appendChild(el_('p','gprazo '+pzx.c,pzx.t))}
h.appendChild(menuPts([['Editar',function(){OM={id:o.id,modo:'ed'};renderGuardados()}],['Excluir objetivo',function(){OM={id:o.id,modo:'del'};renderGuardados()}]],'o:'+o.id));
if(OM.id===o.id)formObj(d,o);O.appendChild(d)});
if(!(st.obj||[]).length)O.appendChild(el_('p','msg','Sem objetivos. Crie um para acompanhar uma meta.'));renderGrend()}
$('gobjnew').onclick=function(){var f=$('gobjform');f.hidden=!f.hidden;if(!f.hidden)$('gon').focus()};
$('gook').onclick=function(){var m=$('gomsg'),n=($('gon').value||'').trim().slice(0,30),meta=$('gom').value.trim()?lerReais($('gom').value):0,ini=$('goi').value.trim()?lerReais($('goi').value):0;
if(!n){m.textContent='Digite o nome do objetivo.';return}if(!(meta>=0)||!(ini>=0)){m.textContent='Confira os valores.';return}
if((st.obj||[]).length>=30){m.textContent='Limite de 30 objetivos.';return}
var pz=$('gop').value;if(pz&&!/^\d{4}-\d{2}-\d{2}$/.test(pz))pz='';if(pz&&pz<=hoje()){m.textContent='Escolha um prazo depois de hoje.';return}if(pz&&!(meta>0)){m.textContent='Para usar prazo, informe a meta em reais.';return}var no={id:Date.now(),nome:n,meta:r2(meta),ini:r2(ini)};if(pz)no.prazo=pz;st.obj.push(no);$('gon').value=$('gom').value=$('goi').value=$('gop').value='';m.textContent='';$('gobjform').hidden=true;save();render()};
$('gom').onblur=$('goi').onblur=function(){var v=lerReais(this.value);if(v>=0&&this.value.trim())this.value=fmt2(v)};

