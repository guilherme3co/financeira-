/* ---------- relatório mensal (PDF pela impressão) ---------- */
var DIAS_EM=['no domingo','na segunda-feira','na terça-feira','na quarta-feira','na quinta-feira','na sexta-feira','no sábado'],relSel='atual';
function planoSnap(){var dv=(st.dividas||[]).filter(dvAtivo),tot=0,pg=0;dv.forEach(function(d){tot+=dvValor(d);if(dvPago(d))pg+=dvValor(d)});tot=Math.round(tot*100)/100;pg=Math.round(pg*100)/100;var sal=st.salario||0;return{sal:sal,div:tot,pagas:pg,n:dv.length,sobra:Math.round((sal-tot)*100)/100}}
function mesAtualRot(){if(st.items.length)return rotuloMes();var d=new Date();return MESES[d.getMonth()]+'/'+d.getFullYear()}
function mesesLista(){var L=(st.arquivo||[]).map(function(a){return{id:'a'+a.id,rot:a.rotulo,items:a.items||[],ini:a.ini,fim:a.fim,plano:a.plano||null,faturas:a.faturas||[],fechado:true}});
L.push({id:'atual',rot:mesAtualRot(),items:st.items,ini:st.start,fim:saldoAtual(),plano:planoSnap(),faturas:st.faturas||[],fechado:false,atual:true});return L}
function statsMes(m){var s={rec:0,gasto:0,gua:0,ret:0,uti:0,des:0,sem:0,n:m.items.length,pays:{},grp:{},dia:{},maiores:[]};
m.items.forEach(function(i){var v=Number(i.val)||0;if(i.ent){s.rec+=v;return}if(i.cor==='gua'){if(i.ret)s.ret+=v;else s.gua+=v;return}
s.gasto+=v;var c=(i.cor==='uti'||i.cor==='des')?i.cor:'sem';s[c]+=v;var py=i.pay||'Não informada';s.pays[py]=(s.pays[py]||0)+v;
var k=normT(i.desc)||'sem descricao',g=s.grp[k]||(s.grp[k]={nome:i.desc||'Sem descrição',n:0,soma:0,des:0});g.n++;g.soma+=v;if(i.cor==='des')g.des+=v;
var dd=i.d;s.dia[dd]=(s.dia[dd]||0)+v;s.maiores.push(i)});
s.maiores.sort(function(a,b){return b.val-a.val});s.maiores=s.maiores.slice(0,5);
s.grupos=Object.keys(s.grp).map(function(k){return s.grp[k]});return s}
function pp(x,t){return t>0?Math.round(x/t*100):0}
function dicasMes(m,s,pm,ps){var out=[],g=s.gasto,rec=s.rec;
function add(t,x){out.push({t:t,x:x})}
if(!s.n){add('dica','Sem lançamentos neste mês.');return out}
if(rec>0&&g+s.gua>rec)add('alerta','Saiu mais do que entrou: '+brl(rec)+' de entrada contra '+brl(g+s.gua)+'. Corte os desnecessários.');
else if(rec>0&&g<=rec)add('ok','Você gastou '+pp(g,rec)+'% do que entrou ('+brl(g)+' de '+brl(rec)+').');
if(g>0){var sd=s.des/g;
 if(sd>=0.25)add('alerta','Desnecessários: '+Math.round(sd*100)+'% dos gastos ('+brl(s.des)+'). Meta: abaixo de 15%.');
 else if(sd>0&&sd<=0.10)add('ok','Desnecessários em só '+Math.round(sd*100)+'% ('+brl(s.des)+'). Ótimo.');
 else if(sd>0)add('dica','Desnecessários: '+brl(s.des)+' ('+Math.round(sd*100)+'%). Ideal: abaixo de 15%.');
 var dg=s.grupos.filter(function(x){return x.des>0}).sort(function(a,b){return b.des-a.des})[0];
 if(dg&&s.des>0)add('dica','Maior desnecessário: “'+dg.nome+'” ('+dg.n+(dg.n===1?' vez':' vezes')+', '+brl(dg.des)+'). Defina um limite semanal.');
 if(s.sem/g>0.3)add('dica',Math.round(s.sem/g*100)+'% dos gastos sem categoria. Classifique como Útil ou Desnecessário no Histórico.');
 var rep=s.grupos.filter(function(x){return x.n>=4&&x.soma/x.n<=40}).sort(function(a,b){return b.soma-a.soma})[0];
 if(rep)add('dica','“'+rep.nome+'” se repetiu '+rep.n+' vezes ('+brl(rep.soma)+'). Cortar metade economiza '+brl(rep.soma/2)+'.');
 var cr=(s.pays['Crédito']||0)+(s.pays['Cartão']||0);if(cr/g>0.5)add('alerta',''+pp(cr,g)+'% dos gastos foram no crédito. Prefira débito ou Pix no que não é essencial.');
 var ne=m.items.filter(function(i){return !i.ent&&i.cor!=='gua'&&i.cor!=='uti'}),nt=0,wd={};ne.forEach(function(i){var w=new Date(i.d+'T12:00:00').getDay();wd[w]=(wd[w]||0)+i.val;nt+=i.val});
 if(ne.length>=4&&nt>0){var mw=Object.keys(wd).sort(function(a,b){return wd[b]-wd[a]})[0];if(wd[mw]/nt>=0.35)add('dica','Não essenciais se concentram '+DIAS_EM[mw]+' ('+pp(wd[mw],nt)+'%, '+brl(wd[mw])+'). Defina um limite para esse dia.')}}
var sug=0;if(m.plano&&m.plano.sobra>0)sug=Math.round(m.plano.sobra*faixa(m.plano.sobra)*100)/100;
if(rec>0){if(s.gua===0)add('dica','Nada guardado neste mês.'+(sug>0?' Comece com '+brl(sug)+'.':' Comece com pouco: “guardar 20”.'))
 else if(s.gua/rec<0.05)add('dica','Guardou '+Math.round(s.gua/rec*100)+'% das entradas ('+brl(s.gua)+').'+(sug>0?' Mínimo sugerido: '+brl(sug)+'.':'')+' Guarde ao receber.');
 else if(s.gua/rec<0.10)add('dica','Guardou '+Math.round(s.gua/rec*100)+'% das entradas ('+brl(s.gua)+'). Bom começo: mire 10%.')
 else add('ok','Guardou '+Math.round(s.gua/rec*100)+'% das entradas ('+brl(s.gua)+'). Continue.')}
var pl=m.plano;if(pl&&pl.sal>0){var r=pl.div/pl.sal;
 if(r>=0.6)add('alerta','Dívidas: '+Math.round(r*100)+'% do salário ('+brl(pl.div)+'). Evite novas parcelas.');
 else if(r>0.3)add('dica','Dívidas: '+Math.round(r*100)+'% do salário. Não passe de 50%.');
 else if(pl.div>0)add('ok','Dívidas em '+Math.round(r*100)+'% do salário: saudável.');
 if(pm&&pm.plano&&pm.plano.sal>0){var dd=Math.round((pl.div-pm.plano.div)*100)/100;if(Math.abs(dd)>=1)add(dd>0?'dica':'ok','As dívidas do mês '+(dd>0?'subiram ':'caíram ')+brl(Math.abs(dd))+' em relação a '+pm.rot+'.')}}
if(pm&&ps&&ps.gasto>0&&!m.atual){var v=(g-ps.gasto)/ps.gasto;
 if(v>0.1)add('alerta','Seus gastos subiram '+Math.round(v*100)+'% em relação a '+pm.rot+' (de '+brl(ps.gasto)+' para '+brl(g)+').');
 else if(v<-0.1)add('ok','Seus gastos caíram '+Math.round(-v*100)+'% em relação a '+pm.rot+'. Bom sinal.');
 if(s.des-ps.des>=30)add('dica','Os gastos desnecessários aumentaram '+brl(s.des-ps.des)+' em relação a '+pm.rot+'.')}
return out}
function rEl(tag,cls,txt){var e=document.createElement(tag);if(cls)e.className=cls;if(txt!=null)e.textContent=txt;return e}
function rTab(cab,linhas,cls){var t=rEl('table','rt '+(cls||'')),th=rEl('thead'),tr=rEl('tr');cab.forEach(function(c,i){var h=rEl('th',null,c),f=linhas[0]&&linhas[0][i];if(f&&f.n)h.className='n';tr.appendChild(h)});th.appendChild(tr);t.appendChild(th);var tb=rEl('tbody');
linhas.forEach(function(l){var r=rEl('tr');l.forEach(function(c,i){var d=rEl('td',(c&&c.cls)||'',(c&&c.t!=null)?c.t:c);if(c&&c.n)d.className+=' n';r.appendChild(d)});tb.appendChild(r)});t.appendChild(tb);return t}
function rSec(h){var s=rEl('section','rsec');s.appendChild(rEl('h3',null,h));return s}
function barra(p,cor){var b=rEl('div','rbar'),i=rEl('i');i.style.width=Math.min(100,Math.max(0,p))+'%';i.style.background='var('+cor+')';b.appendChild(i);return b}
function montaRelatorio(){var L=mesesLista(),idx=0;L.forEach(function(m,i){if(m.id===relSel)idx=i});var m=L[idx],s=statsMes(m),pm=idx>0?L[idx-1]:null,ps=pm?statsMes(pm):null,D=$('relDoc');D.innerHTML='';
var u=(users.filter(function(x){return x.id===uid})[0]||{nome:''}).nome,ag=new Date();
D.appendChild(rEl('h2','rtit','Relatório financeiro · '+m.rot+(m.atual?' (em andamento)':'')));
D.appendChild(rEl('p','rsub','Minhas Finanças'+(u?' · '+u:'')+' · gerado em '+pad(ag.getDate())+'/'+pad(ag.getMonth()+1)+'/'+ag.getFullYear()+' às '+pad(ag.getHours())+':'+pad(ag.getMinutes())));
var sc=rSec('Resumo do mês'),gr=rEl('div','rcards');
[['Saldo inicial',brl(m.ini),''],['Entradas','+ '+brl(s.rec),'pos'],['Gastos','− '+brl(s.gasto),'neg'],['Guardado',brl(s.gua),''],['Disponível no fim',brl(m.fim),'']].concat(somaFat(m.faturas)>0?[['Faturas pagas',brl(somaFat(m.faturas)),'']]:[]).concat((function(){var k=scoreMes(m,s);return k?[['Nota financeira',k.nota+'/100 · '+k.rot,'']]:[]})()).forEach(function(c){var d=rEl('div','rc');d.appendChild(rEl('span',null,c[0]));d.appendChild(rEl('b',c[2],c[1]));gr.appendChild(d)});sc.appendChild(gr);
if(pm&&ps){var vv=ps.gasto>0?Math.round((s.gasto-ps.gasto)/ps.gasto*100):0;sc.appendChild(rEl('p','rn',(m.atual?'Mês em andamento, comparação parcial. ':'')+'Em relação a '+pm.rot+': entradas '+brl(ps.rec)+' → '+brl(s.rec)+' · gastos '+brl(ps.gasto)+' → '+brl(s.gasto)+(ps.gasto>0?' ('+(vv>0?'+':'')+vv+'%)':'')+' · guardado '+brl(ps.gua)+' → '+brl(s.gua)+'.'))}D.appendChild(sc);
if(s.n){var sg=rSec('Para onde foi o dinheiro');
[['Útil','--uti',s.uti],['Desnecessário','--des',s.des],['Sem categoria','--sem',s.sem]].forEach(function(c){var r=rEl('div','rl');r.appendChild(rEl('span',null,c[0]));r.appendChild(barra(pp(c[2],s.gasto),c[1]));r.appendChild(rEl('b',null,brl(c[2])+' · '+pp(c[2],s.gasto)+'%'));sg.appendChild(r)});
var ct=catTotais(m.items),ck=Object.keys(ct).filter(function(k){return ct[k]>0}).sort(function(a,b){return ct[b]-ct[a]});if(ck.length&&!(ck.length===1&&ck[0]==='_')){sg.appendChild(rEl('h4',null,'Por categoria'));ck.forEach(function(k){var r=rEl('div','rl');r.appendChild(rEl('span',null,k==='_'?'Sem categoria':catNome(k)));r.appendChild(barra(pp(ct[k],s.gasto),'--ink'));r.appendChild(rEl('b',null,brl(ct[k])+' · '+pp(ct[k],s.gasto)+'%'));sg.appendChild(r)})}
var pk=Object.keys(s.pays).sort(function(a,b){return s.pays[b]-s.pays[a]});if(pk.length){sg.appendChild(rEl('h4',null,'Por forma de pagamento'));pk.forEach(function(k){var r=rEl('div','rl');r.appendChild(rEl('span',null,k));r.appendChild(barra(pp(s.pays[k],s.gasto),'--ink'));r.appendChild(rEl('b',null,brl(s.pays[k])+' · '+pp(s.pays[k],s.gasto)+'%'));sg.appendChild(r)})}
if(s.maiores.length){sg.appendChild(rEl('h4',null,'Maiores gastos'));sg.appendChild(rTab(['Data','Descrição','Valor'],s.maiores.map(function(i){return[dm(i.d),i.desc||'Sem descrição',{t:brl(i.val),n:1}]})))}
var rp=s.grupos.filter(function(x){return x.n>=2}).sort(function(a,b){return b.soma-a.soma}).slice(0,5);if(rp.length){sg.appendChild(rEl('h4',null,'Gastos que mais se repetem'));sg.appendChild(rTab(['Descrição','Vezes','Total'],rp.map(function(x){return[x.nome,{t:String(x.n),n:1},{t:brl(x.soma),n:1}]})))}D.appendChild(sg)}
var spl=rSec('Dívidas e planejamento'),pl=m.plano;
if(pl&&(pl.sal>0||pl.div>0)){var g2=rEl('div','rcards');[['Salário',brl(pl.sal)],['Dívidas do mês',brl(pl.div)],['Já pagas',brl(pl.pagas)],['Sobra',brl(pl.sobra)]].forEach(function(c){var d=rEl('div','rc');d.appendChild(rEl('span',null,c[0]));d.appendChild(rEl('b',null,c[1]));g2.appendChild(d)});spl.appendChild(g2);
 if(pl.sal>0)spl.appendChild(rEl('p','rn','Dívidas comprometem '+Math.round(pl.div/pl.sal*100)+'% do salário.'+(pl.sobra>0?' Mínimo sugerido para guardar: '+brl(Math.round(pl.sobra*faixa(pl.sobra)*100)/100)+' ('+Math.round(faixa(pl.sobra)*100)+'% da sobra).':'')));
 if(m.atual){var dv=(st.dividas||[]).filter(dvAtivo);if(dv.length)spl.appendChild(rTab(['Dívida','Situação','Valor do mês'],dv.map(function(d){return[d.nome,dvInfo(d)+(dvPago(d)?' (paga)':' (pendente)'),{t:brl(dvValor(d)),n:1}]})))}}
else spl.appendChild(rEl('p','rn',m.fechado?'Sem dados de dívidas neste mês.':'Cadastre o salário e as dívidas na aba Planejamento para ver esta parte.'));D.appendChild(spl);
var sd=rSec('Dicas para melhorar');dicasMes(m,s,pm,ps).forEach(function(d){sd.appendChild(rEl('p','tip '+d.t,d.x))});
sd.appendChild(rEl('p','rn','Teste no próximo mês: espere 24 h antes de compras não planejadas e guarde ao receber. Orientação geral, não substitui profissional.'));D.appendChild(sd);
if(L.length>1){var se=rSec('Evolução mês a mês');var mx=0;var ls=L.map(function(x){var t=statsMes(x);mx=Math.max(mx,t.gasto);return[x,t]});
se.appendChild(rTab(['Mês','Entradas','Gastos','Guardado','Desnec.','Dívidas'],ls.map(function(p){var x=p[0],t=p[1];return[{t:x.rot+(x.atual?' *':''),cls:x.id===m.id?'sel':''},{t:brl(t.rec),n:1},{t:brl(t.gasto),n:1},{t:brl(t.gua),n:1},{t:t.gasto>0?pp(t.des,t.gasto)+'%':'-',n:1},{t:x.plano&&x.plano.div>0?brl(x.plano.div):'-',n:1}]}),'ev'));
 se.appendChild(rEl('p','rn','* mês em andamento. Desnec. = parte dos gastos marcada como Desnecessário.'));D.appendChild(se)}
var sm=rSec('Todas as movimentações');
if(!s.n)sm.appendChild(rEl('p','rn','Nenhuma movimentação neste mês.'));
else{var its=m.items.slice().sort(function(a,b){return (a.d||'').localeCompare(b.d||'')||(a.t||'').localeCompare(b.t||'')});
 sm.appendChild(rTab(['Data','Hora','Descrição','Tipo','Pagamento','Valor'],its.map(function(i){var tp=i.ent?'Entrada':(COR[i.cor]?COR[i.cor].n:'Sem categoria');return[dm(i.d),i.t||'-',i.desc||'-',tp,i.pay||'-',{t:(i.ent?'+ ':'− ')+brl(Number(i.val)||0),n:1,cls:i.ent?'pos':''}]}),'mv'))}
D.appendChild(sm)}
function abreRelatorio(){if(!st)return;fechaLanc();telaHist(true);$('topvolta').hidden=false;ALLP.forEach(function(i){$(i).className='pg'});$('pgr').className='pg on';$('fab').hidden=true;$('top').hidden=false;eng.setAttribute('aria-expanded','false');marcaNav(3);$('ptit').textContent='Relatório';
var L=mesesLista(),sel=$('relmes');sel.innerHTML='';L.slice().reverse().forEach(function(m){var o=document.createElement('option');o.value=m.id;o.textContent=m.rot+(m.atual?' (em andamento)':'');sel.appendChild(o)});
if(!L.some(function(m){return m.id===relSel}))relSel='atual';sel.value=relSel;montaRelatorio();window.scrollTo(0,0);setTimeout(function(){tour('pgr')},380)}
$('relab').onclick=abreRelatorio;
$('relmes').onchange=function(){relSel=this.value;montaRelatorio()};
$('relvolta').onclick=function(){vaiPagina(3)};
var tituloOrig=document.title;
$('relpdf').onclick=function(){var L=mesesLista(),m=L.filter(function(x){return x.id===relSel})[0]||L[L.length-1];document.title='Relatorio-'+normT(m.rot).replace(/[^a-z0-9]+/g,'-');window.print()};
window.addEventListener('afterprint',function(){document.title=tituloOrig});

