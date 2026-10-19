/* ---------- planejamento: salário, dívidas fixas e sugestão de guardar ---------- */
/* % mínimo a guardar, conforme o valor que sobra: acima de R$ 200 = 15%; de R$ 100 a R$ 200 = 10%; abaixo de R$ 100 = 8% */
function faixa(sobra){return sobra>200?0.15:sobra>=100?0.10:0.08}
function pc(x){return (x*100).toFixed(1).replace('.',',')+'%'}
function el_(tag,cls,txt){var e=document.createElement(tag);if(cls)e.className=cls;if(txt!=null)e.textContent=txt;return e}
function mesAt(){return hoje().slice(0,7)}
function ehPar(d){return d.n>1&&d.total>0}
function parcBase(d){return Math.round(d.total/d.n*100)/100}
function parcVal(d,k){return k>=d.n?Math.round((d.total-parcBase(d)*(d.n-1))*100)/100:parcBase(d)}
function dvPago(d){return ehPar(d)?d.ult===mesAt():!!d.pago}
function dvAtivo(d){return ehPar(d)?(d.pagas<d.n||d.ult===mesAt()):true}
function dvIdx(d){return Math.min(Math.max(dvPago(d)?d.pagas:d.pagas+1,1),d.n)}
function dvValor(d){return ehPar(d)?parcVal(d,dvIdx(d)):d.valor}
function dvRest(d){var pg=d.pagas>=d.n?d.total:parcBase(d)*d.pagas;return Math.max(0,Math.round((d.total-pg)*100)/100)}
function dvInfo(d){if(!ehPar(d))return 'Fixa · todo mês';var b='Parcela '+dvIdx(d)+' de '+d.n+' · ';return b+(dvPago(d)?(d.pagas>=d.n?'última parcela paga, quitada!':'paga neste mês · faltam '+brl(dvRest(d))):'faltam '+brl(dvRest(d))+' no total')}
function dvMarca(d,on){if(ehPar(d)){if(on&&d.ult!==mesAt()&&d.pagas<d.n){d.pagas++;d.ult=mesAt()}else if(!on&&d.ult===mesAt()){d.pagas=Math.max(0,d.pagas-1);d.ult=''}}else d.pago=!!on}
function normT(t){return String(t||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim()}
function ligaDivida(it){if(it.ent||it.cor==='gua')return null;var nd=normT(it.desc),best=null;if(!nd)return null;
(st.dividas||[]).forEach(function(d){if(!dvAtivo(d)||dvPago(d))return;var dn=normT(d.nome);if(dn.length<3)return;if(nd.indexOf(dn)>=0||(nd.length>=4&&dn.indexOf(nd)>=0)){var vd=dvValor(d),pal=/parcel|presta|pagamento|mensalidade|fatura|boleto|conta/.test(nd),perto=Math.abs((Number(it.val)||0)-vd)<=Math.max(1,vd*0.1);if(!(pal||perto))return;if(!best||dn.length>normT(best.nome).length)best=d}});
if(best){dvMarca(best,true);it.dv=best.id;save()}return best}
var pagasAb=false;
function dvLinha(d,pg){var par=ehPar(d),lb=document.createElement('label');lb.className='dvck';var cb=document.createElement('input');cb.type='checkbox';cb.checked=pg;cb.setAttribute('aria-label',(pg?'Desmarcar ':'Marcar ')+d.nome+' como paga neste mês');
cb.onchange=function(){dvMarca(d,cb.checked);save();render()};lb.appendChild(cb);
var head=el_('div','dvh');head.appendChild(lb);head.appendChild(el_('span','dvn',d.nome));head.appendChild(el_('b',null,brl(dvValor(d))));
if(!par){var r=el_('div','dv'+(pg?' pago':''));r.appendChild(head);return r}
var det=document.createElement('details');det.className='dv dvd'+(pg?' pago':'');var sm=document.createElement('summary');sm.appendChild(head);det.appendChild(sm);
var bd=el_('div','dvb'),g3=el_('div','dvg');[['Total',brl(d.total)],['Parcelas',(pg?d.pagas:d.pagas)+' pagas de '+d.n],['Faltam',brl(dvRest(d))]].forEach(function(x){var c=el_('div');c.appendChild(el_('span',null,x[0]));c.appendChild(el_('b',null,x[1]));g3.appendChild(c)});bd.appendChild(g3);
var pr=el_('div','pl-prog'),bi=el_('i');bi.style.width=Math.min(100,d.pagas/d.n*100)+'%';pr.appendChild(bi);bd.appendChild(pr);det.appendChild(bd);return det}
function renderPlano(){var box=$('gaugePlan');if(!box||!st)return;box.innerHTML='';
var sal=st.salario||0,dv=(st.dividas||[]).filter(dvAtivo);
if(!(sal>0)){box.appendChild(el_('p','pl-tip','Cadastre salário e dívidas abaixo para ver quanto sobra e quanto guardar.'));return}
var tot=0,pago=0;dv.forEach(function(d){tot+=dvValor(d);if(dvPago(d))pago+=dvValor(d)});
tot=Math.round(tot*100)/100;var sobra=Math.round((sal-tot)*100)/100;
var top=el_('div','pl-top');
if(sobra<=0){top.appendChild(el_('span','dl','Não sobra para guardar'));var n=el_('p','saldo','− '+brl(-sobra));n.style.color='var(--neg)';top.appendChild(n);top.appendChild(el_('p','sub','As dívidas fixas passam do salário.'))}
else{var p=faixa(sobra),min=Math.round(sobra*p*100)/100;
top.appendChild(el_('span','dl','Guardar no mínimo'));top.appendChild(el_('p','saldo',brl(min)));
top.appendChild(el_('p','sub',Math.round(p*100)+'% do que sobra · '+pc(min/sal)+' do salário'))}
box.appendChild(top);
var sum=el_('div','pl-sum');[['Salário',brl(sal)],['Dívidas','− '+brl(tot)],['Sobra',brl(sobra)+' ('+pc(Math.max(sobra,0)/sal)+')']].forEach(function(x){var d=el_('div');d.appendChild(el_('span',null,x[0]));d.appendChild(el_('b',null,x[1]));sum.appendChild(d)});box.appendChild(sum);
if(sobra>0){var q=faixa(sobra),livre=Math.round((sobra-sobra*q)*100)/100;box.appendChild(el_('p','pl-tip','Depois de guardar o mínimo, ficam livres '+brl(livre)+'. Acima de R$ 200 = 15%; R$ 100 a 200 = 10%; abaixo = 8%.'))}
if(dv.length){var menor=dv.slice().sort(function(a,b){return dvValor(a)-dvValor(b)})[0];
if(menor&&dvValor(menor)>0){var ns=Math.round((sobra+dvValor(menor))*100)/100,nm=ns>0?Math.round(ns*faixa(ns)*100)/100:0;box.appendChild(el_('p','pl-tip','Quitando “'+menor.nome+'” ('+brl(dvValor(menor))+'), a sobra vai a '+brl(ns)+' e o mínimo sugerido a '+brl(nm)+'.'))}
var pr=el_('div','pl-prog'),bi=el_('i');bi.style.width=(tot>0?Math.min(100,pago/tot*100):0)+'%';pr.appendChild(bi);box.appendChild(pr);
box.appendChild(el_('p','pl-tip','Pago este mês: '+brl(pago)+' de '+brl(tot)));
var pend=dv.filter(function(d){return !dvPago(d)}),pagas=dv.filter(dvPago);
pend.forEach(function(d){box.appendChild(dvLinha(d,false))});
if(!pend.length)box.appendChild(el_('p','pl-tip','Tudo pago neste mês!'));
if(pagas.length){var gv=document.createElement('details');gv.className='dvp';gv.open=pagasAb;gv.ontoggle=function(){pagasAb=gv.open};
gv.appendChild(el_('summary',null,'Pagas do mês ('+pagas.length+') · '+brl(pago)));pagas.forEach(function(d){gv.appendChild(dvLinha(d,true))});box.appendChild(gv)}}
else box.appendChild(el_('p','pl-tip','Nenhuma dívida cadastrada. Adicione abaixo para calcular a sobra.'))}
function linhaDivida(d,par){var w=$('dividas'),r=document.createElement('div');r.className='crow dv4';var p=!!(par||(d&&ehPar(d)));
r.innerHTML='<input class="cn" aria-label="Nome da dívida" placeholder="'+(p?'Ex.: Celular':'Ex.: Aluguel')+'" autocomplete="off"><input class="cs" aria-label="'+(p?'Valor total':'Valor mensal')+'" inputmode="decimal" placeholder="'+(p?'Total (R$)':'0,00')+'" autocomplete="off"><button type="button" class="x" aria-label="Remover da lista" title="Quitada: remover da lista">×</button>';
r.children[0].value=d?d.nome:'';r.children[1].value=d?fmt2(p?d.total:d.valor):'';r._id=d?d.id:nid();r._pago=d?d.pago:false;r._ult=d?(d.ult||''):'';r._par=p;
r.querySelector('.x').onclick=function(){r.remove()};
var cd=document.createElement('input');cd.className='cd';cd.inputMode='numeric';cd.placeholder='Dia';cd.autocomplete='off';cd.maxLength=2;cd.setAttribute('aria-label','Dia do vencimento');cd.title='Dia do vencimento (opcional)';cd.value=d&&d.dia?String(d.dia):'';r.insertBefore(cd,r.children[2]);
r.children[1].onblur=function(){var v=lerReais(this.value);if(v>=0)this.value=fmt2(v)};
if(p){var x=document.createElement('div');x.className='parx';x.innerHTML='<label>Nº de parcelas<input class="np" inputmode="numeric" placeholder="6" autocomplete="off"></label><label>Parcelas já pagas<input class="pp" inputmode="numeric" placeholder="0" autocomplete="off"></label>';var dt=document.createElement('details');dt.className='parxd';dt.open=!d;var dsm=document.createElement('summary');dt.appendChild(dsm);dt.appendChild(x);r.appendChild(dt);
 var np=x.querySelector('.np'),pp=x.querySelector('.pp'),nt=dsm;np.value=d&&d.n?d.n:'';pp.value=d?d.pagas:'0';
 function nota(){var t=lerReais(r.children[1].value),n=parseInt(np.value,10),pg=parseInt(pp.value||'0',10);if(t>0&&n>1){nt.textContent='Parcelas: '+Math.min(pg,n)+' de '+n+' pagas · '+brl(Math.round(t/n*100)/100)+' cada'}else nt.textContent='Parcelas: informe total e quantidade'}
 np.oninput=pp.oninput=r.children[1].oninput=nota;nota()}
w.appendChild(r)}
function desenhaDiv(){$('dividas').innerHTML='';(st.dividas||[]).forEach(function(d){linhaDivida(d,false)});$('sal').value=st.salario>0?fmt2(st.salario):'';$('divmsg').textContent=''}
$('addd').onclick=function(){linhaDivida(null,false)};
$('addp').onclick=function(){linhaDivida(null,true)};
$('sal').onblur=function(){var v=lerReais(this.value);if(v>=0)this.value=fmt2(v)};
$('divok').onclick=function(){var m=$('divmsg'),sal=$('sal').value.trim()?lerReais($('sal').value):0,ok=true,bad='',arr=[];
if(!(sal>=0)){m.textContent='Digite o salário, por exemplo 1.850,00.';return}
Array.prototype.forEach.call($('dividas').children,function(r){var nome=(r.children[0].value||'').trim(),vs=r.children[1].value.trim(),dia=parseInt((r.querySelector('.cd')||{}).value,10);dia=(dia>=1&&dia<=31)?dia:0;if(!nome&&!vs)return;var v=lerReais(vs);if(!(v>=0)){ok=false;bad='Confira os valores das dívidas: digite algo como 450,00.';return}
 if(r._par){var n=parseInt(r.querySelector('.np').value,10),pg=parseInt(r.querySelector('.pp').value||'0',10);if(!(v>0&&n>=2&&n<=360&&pg>=0&&pg<=n)){ok=false;bad='Confira a dívida parcelada “'+(nome||'sem nome')+'”: total maior que zero, 2 ou mais parcelas e parcelas pagas entre 0 e o total de parcelas.';return}
  var t=Math.round(v*100)/100;arr.push({id:r._id,nome:nome||'Dívida',valor:Math.round(t/n*100)/100,pago:false,n:n,total:t,pagas:pg,ult:pg===0?'':r._ult,dia:dia})}
 else arr.push({id:r._id,nome:nome||'Dívida',valor:Math.round(v*100)/100,pago:r._pago,n:0,total:0,pagas:0,ult:'',dia:dia})});
if(!ok){m.textContent=bad;return}
st.salario=Math.round(sal*100)/100;st.dividas=arr;save();render();desenhaDiv();
var tot=arr.filter(dvAtivo).reduce(function(a,d){return a+dvValor(d)},0);m.textContent='Salvo. Dívidas do mês: '+brl(tot)+(st.salario>0?' · sobra '+brl(st.salario-tot):'')+'.'};

