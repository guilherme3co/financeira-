/* ---------- fechar o mês ---------- */
var MESES=['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
function totaisMes(){var g={rec:0,gasto:0,gua:0,ret:0};st.items.forEach(function(i){if(i.ent)g.rec+=i.val;else if(i.cor==='gua'){if(i.ret)g.ret+=i.val;else g.gua+=i.val}else g.gasto+=i.val});return g}
function saldoAtual(){var s=st.start;st.items.forEach(function(i){if(i.ent)s+=i.val;else if(i.cor==='gua'){if(i.ret&&i.dev)s+=i.val}else if(!pagCred(i))s-=i.val});s-=somaFat(st.faturas);return Math.round(s*100)/100}
function rotuloMes(){var ds=st.items.map(function(i){return i.d}).filter(Boolean).sort(),d=ds.length?ds[ds.length-1]:hoje(),p=d.split('-');return MESES[(+p[1])-1]+'/'+p[0]}
var rArm=false,rTm=null;
/* fecha um mês: tira da lista os lançamentos daquele mês e leva o saldo para o mês seguinte */
function fechaMesK(mk){var its=st.items.filter(function(i){return String(i.d).slice(0,7)===mk}),fts=(st.faturas||[]).filter(function(f){return String(f.d).slice(0,7)===mk});if(!its.length&&!fts.length)return null;
var g={rec:0,gasto:0,gua:0,ret:0},ds=0,dl=0;its.forEach(function(i){if(i.ent){g.rec+=i.val;ds+=i.val}else if(i.cor==='gua'){if(i.ret){g.ret+=i.val;if(i.dev)ds+=i.val}else g.gua+=i.val}else{g.gasto+=i.val;if(pagCred(i))dl-=i.val;else ds-=i.val}});fts.forEach(function(f){ds-=f.val;dl+=f.val});ds=r2(ds);dl=r2(dl);
var p=mk.split('-'),rot=MESES[(+p[1])-1]+'/'+p[0],a=(st.arquivo||[]).filter(function(x){return x.mes===mk})[0];
if(a){a.items=(a.items||[]).concat(its);a.faturas=(a.faturas||[]).concat(fts);a.rec=r2(a.rec+g.rec);a.gasto=r2(a.gasto+g.gasto);a.gua=r2(a.gua+g.gua);a.fim=r2(a.fim+ds);var ix=st.arquivo.indexOf(a);st.arquivo.slice(ix+1).forEach(function(x){x.ini=r2(x.ini+ds);x.fim=r2(x.fim+ds)})}
else{a={id:nid(),mes:mk,plano:planoSnap(),rotulo:rot,fechadoEm:hoje(),ini:st.start,fim:r2(st.start+ds),rec:r2(g.rec),gasto:r2(g.gasto),gua:r2(g.gua),items:its,prevContas:JSON.parse(JSON.stringify(st.contas)),prevGAnt:st.gAnt||0,faturas:fts,auto:1};st.arquivo.push(a);st.dividas.forEach(function(d){d.pago=false})}
st.gAnt=r2((st.gAnt||0)+g.gua-g.ret);st.contas[0].saldo=r2(st.contas[0].saldo+ds);st.contas[0].cred=r2((Number(st.contas[0].cred)||0)+dl);st.start=somaContas(st);
st.items=st.items.filter(function(i){return its.indexOf(i)<0});st.faturas=(st.faturas||[]).filter(function(f){return fts.indexOf(f)<0});return{a:a,rec:r2(g.rec),gasto:r2(g.gasto),gua:r2(g.gua),nova:!a.auto||a.items.length===its.length}}
function mesesPend(){var mp=mesAt(),m={};st.items.forEach(function(i){var k=String(i.d).slice(0,7);if(/^\d{4}-\d{2}$/.test(k)&&k<mp)m[k]=1});(st.faturas||[]).forEach(function(f){var k=String(f.d).slice(0,7);if(/^\d{4}-\d{2}$/.test(k)&&k<mp)m[k]=1});return Object.keys(m).sort()}
function fechaAuto(manual){if(!st)return null;if(!manual&&st.fechaPausa===mesAt())return null;var ks=mesesPend();if(!ks.length)return null;var out=[];ks.forEach(function(k){var r=fechaMesK(k);if(r)out.push(r)});if(!out.length)return null;if(manual)delete st.fechaPausa;save();return out}
function avisoFechou(fx){var u=fx[fx.length-1];if(!u)return;var a=u.a;mostraAviso('Fechei o mês de '+a.rotulo+': entradas '+brl(u.rec)+', gastos '+brl(u.gasto)+', guardado '+brl(u.gua)+'. O mês novo começa com '+brl(st.start)+'.','Ver relatório',function(){$('aviso').hidden=true;relSel='a'+a.id;abreRelatorio()},'Ok')}
document.addEventListener('visibilitychange',function(){if(document.hidden||!st||$('pgs').className.indexOf('on')>=0||$('pga').className.indexOf('on')>=0)return;var fx=null;try{fx=fechaAuto()}catch(e){}if(fx){render();avisoFechou(fx)}});
var fArm=false,fTm=null;
$('fecha').onclick=function(){var b=this,m=$('fmsg');if(!mesesPend().length){m.textContent='Não há mês anterior para fechar.';b.hidden=true;return}
if(!fArm){fArm=true;b.textContent='Toque de novo para fechar';fTm=setTimeout(function(){fArm=false;b.textContent='Fechar o mês anterior agora'},5000);return}
clearTimeout(fTm);fArm=false;b.textContent='Fechar o mês anterior agora';var fx=fechaAuto(true);render();desenhaCfg();if(fx){var a=fx[fx.length-1].a;$('fmsg').textContent='Mês de '+a.rotulo+' fechado. Saldo inicial do mês atual: '+brl(st.start)+'.'}};
$('reabre').onclick=function(){var b=this,m=$('fmsg'),a=st.arquivo[st.arquivo.length-1];if(!a)return;
if(!rArm){rArm=true;b.textContent='Toque de novo para desfazer o fechamento';rTm=setTimeout(function(){rArm=false;b.textContent='Desfazer o último fechamento'},5000);return}
clearTimeout(rTm);rArm=false;b.textContent='Desfazer o último fechamento';
st.arquivo.pop();st.items=a.items.concat(st.items);st.faturas=(a.faturas||[]).concat(st.faturas||[]);st.contas=a.prevContas;st.start=somaContas(st);st.gAnt=a.prevGAnt;st.fechaPausa=mesAt();save();render();desenhaCfg();$('fmsg').textContent='Fechamento de '+a.rotulo+' desfeito. Os lançamentos voltaram para a lista. Quando quiser, toque em “Fechar o mês anterior agora”.'};
function arquivoHist(L){if(!st.arquivo||!st.arquivo.length)return;
var h=document.createElement('h2');h.style.marginTop='20px';h.textContent='Meses anteriores';L.appendChild(h);
st.arquivo.slice().reverse().forEach(function(a){var d=document.createElement('details');d.className='mes';var feito=false;
var sm=document.createElement('summary');sm.textContent=a.rotulo;var sg=document.createElement('small');sg.textContent='Entradas +'+brl(a.rec)+' · Gastos −'+brl(a.gasto)+' · Guardado '+brl(a.gua)+' · Saldo '+brl(a.ini)+' → '+brl(a.fim);sm.appendChild(sg);d.appendChild(sm);
d.addEventListener('toggle',function(){if(!d.open||feito)return;feito=true;(a.items||[]).slice().sort(function(x,y){return (y.d||'').localeCompare(x.d||'')}).forEach(function(i){var r=document.createElement('div');r.className='mi';var l=document.createElement('span');l.textContent=dm(i.d)+' · '+i.desc;var v=document.createElement('b');v.textContent=(i.ent?'+ ':'− ')+brl(i.val);r.appendChild(l);r.appendChild(v);d.appendChild(r)})});
L.appendChild(d)})}

