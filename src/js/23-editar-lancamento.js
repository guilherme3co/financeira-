/* ---------- editar lançamento ---------- */
var editId=null,editTipo=null,FORMAS=['Pix','Débito','Crédito','Dinheiro','Transferência','Boleto','Cartão','Não informada'];
function acha(id){return st.items.filter(function(z){return z.id===id})[0]}
function desenhaTipos(){var w=$('etipo');w.innerHTML='';
['rec','uti','des','gua','sem'].forEach(function(k){var b=document.createElement('button');b.type='button';b.className='cat'+(editTipo===k?' sel':'');b.setAttribute('aria-pressed',editTipo===k?'true':'false');
b.innerHTML='<i class="dot"></i><span></span>';b.firstChild.style.background='var('+COR[k].v+')';b.lastChild.textContent=COR[k].n;
b.onclick=function(){editTipo=k;desenhaTipos()};w.appendChild(b)});$('ewg').hidden=(editTipo!=='gua');$('ecw').hidden=!(editTipo==='uti'||editTipo==='des'||editTipo==='sem');parcUI()}
function desenhaWg(i){var sl=$('elug'),so=$('eobj'),lg=(i&&i.lug)||'';sl.innerHTML='';
[['','Sem local']].concat(todosLugares().map(function(n){return[n,n]})).concat([['__novo','+ Outro lugar...']]).forEach(function(x){var o=document.createElement('option');o.value=x[0];o.textContent=x[1];sl.appendChild(o)});
sl.value=lg;if(sl.value!==lg)sl.value='';
so.innerHTML='';[['','Sem objetivo']].concat((st.obj||[]).map(function(x){return[String(x.id),x.nome]})).forEach(function(x){var o=document.createElement('option');o.value=x[0];o.textContent=x[1];so.appendChild(o)});
so.value=(i&&i.obj)?String(i.obj):'';$('elugn').hidden=true;$('elugn').value='';$('ewg').hidden=(editTipo!=='gua')}
$('elug').onchange=function(){$('elugn').hidden=(this.value!=='__novo');if(this.value==='__novo')$('elugn').focus()};
function lerWg(){var v=$('elug').value,l='';if(v==='__novo'){l=($('elugn').value||'').trim().slice(0,30);if(l){var k=normT(l),ex=todosLugares().filter(function(n){return normT(n)===k})[0];if(ex)l=ex;else st.lugares.push(l)}}else l=v;var ob=parseInt($('eobj').value,10);return{lug:l,obj:ob>0?ob:0}}
var novoMode=false;
function abreEdicao(id){var i=acha(id);if(!i)return;novoMode=false;$('etit').textContent='Editar lançamento';$('esalva').textContent='Salvar alterações';$('eapaga').hidden=false;editId=id;editTipo=i.ent?'rec':i.cor;
$('ed').value=i.desc;$('ev').value=fmt2(i.val);$('edt').value=i.d;$('eh').value=i.t||'';
var sel=$('ep');sel.innerHTML='';(FORMAS.indexOf(i.pay)<0?FORMAS.concat([i.pay]):FORMAS).forEach(function(f){var o=document.createElement('option');o.value=o.textContent=f;sel.appendChild(o)});sel.value=i.pay;
desenhaCatSel(i.cat);desenhaTipos();desenhaWg(i);$('emsg').textContent='';eArm=false;$('eapaga').textContent='Apagar lançamento';$('edit').hidden=false;setTimeout(function(){tour('sheet')},350)}
var COMP={fonte:'',txid:'',av:[],sig:''};
function abreNovo(r){fechaLanc();COMP={fonte:'',txid:'',av:[],sig:''};novoMode=true;editId=null;editTipo=r.tipo||null;var mr=(!r.ent&&!r.tipo)?memRegra(r.desc||'',r.doc):null;if(mr&&(mr.cor==='uti'||mr.cor==='des'))editTipo=mr.cor;desenhaCatSel(r.cat||(mr&&mr.cat)||catSemente(r.desc||''));$('etit').textContent='Confirmar lançamento';$('esalva').textContent='Salvar lançamento';$('eapaga').hidden=true;
$('ed').value=r.desc||'';$('ev').value=r.val>0?fmt2(r.val):'';$('edt').value=r.d||hoje();$('eh').value=r.t||hora();parcSet(r.parc>1?r.parc:1);
var sel=$('ep');sel.innerHTML='';(FORMAS.indexOf(r.pay)<0?FORMAS.concat([r.pay]):FORMAS).forEach(function(f){var o=document.createElement('option');o.value=o.textContent=f;sel.appendChild(o)});sel.value=r.pay;
desenhaTipos();desenhaWg({lug:r.lug||''});$('emsg').textContent=r.val>0?'':'Não entendi o valor. Digite no campo Valor.';$('edit').hidden=false;setTimeout(function(){tour('sheet')},350)}
function fechaEdicao(){if(novoMode){limpaCampo(fr);fr.blur()}$('edit').hidden=true;editId=null;novoMode=false}
var eArm=false,eTm=null;
$('ecancela').onclick=fechaEdicao;
$('edit').onclick=function(e){if(e.target===this)fechaEdicao()};
document.addEventListener('keydown',function(e){if(e.key==='Escape'&&!$('edit').hidden)fechaEdicao()});
$('ev').onblur=function(){var v=lerReais(this.value);if(v>=0)this.value=fmt2(v)};
$('esalva').onclick=function(){
if(novoMode){var v0=lerReais($('ev').value),d0=$('edt').value,m0=$('emsg');
 if(!(v0>0)){m0.textContent='Digite um valor maior que zero, por exemplo 12,50.';return}
 if(!d0){m0.textContent='Escolha a data.';return}
 if(!editTipo){m0.textContent='Escolha o tipo: Entrada, Útil, Desnecessário, Guardado ou Sem categoria.';return}
 var ent0=(editTipo==='rec'),it0={id:Date.now(),d:d0,t:$('eh').value||hora(),desc:($('ed').value||'').trim()||(ent0?'Entrada':'Gasto'),val:Math.round(v0*100)/100,pay:$('ep').value,cor:editTipo,ent:ent0};
 if(editTipo==='gua'){var w0=lerWg();if(w0.lug)it0.lug=w0.lug;if(w0.obj)it0.obj=w0.obj}else if(!ent0){var c0=lerCat();if(c0)it0.cat=c0}
 if(COMP.fonte){if(COMP.txid)it0.txid=COMP.txid;if(COMP.doc)it0.doc=COMP.doc;var av0=(COMP.fonte==='ocr'?COMP.av.slice():[]),dp0=compDup({val:it0.val,d:it0.d,t:it0.t,ent:it0.ent,txid:COMP.txid});if(dp0)av0.push(dp0);
  var sg0=av0.join('|');if(av0.length&&COMP.sig!==sg0){COMP.sig=sg0;m0.textContent='Revise: '+av0.join(' ')+' Toque em Salvar de novo para confirmar.';return}}
 if(parcN()>1&&!ent0&&editTipo!=='gua'){it0.pay='Crédito';var pv0=novaParc(it0,parcN());limpaCampo(fr);novoMode=false;$('edit').hidden=true;avisoParc(pv0);return}var pl0=null;addItem(it0);if(!ent0&&editTipo!=='gua'&&(it0.cor!=='sem'||it0.cat))aprende(it0);var db0=ligaDivida(it0);limpaCampo(fr);novoMode=false;$('edit').hidden=true;render();toast((ent0?'Entrada: ':'Lançado: ')+it0.desc+' · '+brl(it0.val)+rotulo(it0)+(db0?' · “'+db0.nome+'” paga':''),it0.id,(db0||pl0)?function(){if(db0)dvMarca(db0,false);if(pl0)cancelaParc(pl0.id);save()}:null);return}
var i=acha(editId);if(!i){fechaEdicao();return}
var v=lerReais($('ev').value),d=$('edt').value,m=$('emsg');
if(!(v>0)){m.textContent='Digite um valor maior que zero, por exemplo 12,50.';return}
if(!d){m.textContent='Escolha a data.';return}
i.desc=($('ed').value||'').trim()||(editTipo==='rec'?'Entrada':'Gasto');i.val=Math.round(v*100)/100;i.d=d;i.t=$('eh').value||i.t||'';i.pay=$('ep').value;i.ent=(editTipo==='rec');i.cor=editTipo;
if(editTipo==='gua'){var w1=lerWg();if(w1.lug)i.lug=w1.lug;else delete i.lug;if(w1.obj)i.obj=w1.obj;else delete i.obj;delete i.cat}else{delete i.lug;delete i.obj;delete i.ret;delete i.dev;if(i.ent)delete i.cat;else{var c1=lerCat();if(c1)i.cat=c1;else delete i.cat;if(i.cor!=='sem'||i.cat)aprende(i)}}
save();render();fechaEdicao();toast('Lançamento atualizado')};
$('eapaga').onclick=function(){var b=this;if(!eArm){eArm=true;b.textContent='Toque de novo para apagar';eTm=setTimeout(function(){eArm=false;b.textContent='Apagar lançamento'},3500);return}
clearTimeout(eTm);var id=editId;fechaEdicao();remove(id);render();toast('Lançamento apagado')};

