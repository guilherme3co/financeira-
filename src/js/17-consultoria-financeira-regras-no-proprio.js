/* ---------- consultoria financeira (regras no próprio aparelho) ---------- */
function dfMes(){var d=new Date();return{dia:d.getDate(),tot:new Date(d.getFullYear(),d.getMonth()+1,0).getDate()}}
function mediaCampo(fn){var L=mesesLista(),fech=L.filter(function(x){return x.fechado}).map(function(x){return fn(statsMes(x))});
if(fech.length)return fech.reduce(function(a,b){return a+b},0)/fech.length;var f=dfMes(),v=fn(statsMes(L[L.length-1]));return f.dia>=5?v*f.tot/f.dia:v}
function guardadoTotal(){return r2((st.gAnt||0)+guaLiq())}
function lim01(x,a,b){return x<=a?1:x>=b?0:1-(x-a)/(b-a)}
function scoreMes(m,s){if(!s.n)return null;var c=[],rec=Math.max(s.rec||0,(m.plano&&m.plano.sal)||0),g=s.gasto;
if(rec>0){var p=s.gua/rec;c.push({n:'Poupança',pts:Math.min(1,p/0.15)*30,max:30,t:'Guardou '+Math.round(p*100)+'% das entradas (meta: 15%)'});
 var r=(g+s.gua)/rec;c.push({n:'Equilíbrio',pts:lim01(r,0.8,1)*25,max:25,t:'Gastos e guardados somam '+Math.round(r*100)+'% das entradas (ideal: até 80%)'})}
if(g>0){var sd=s.des/g;c.push({n:'Desnecessários',pts:lim01(sd,0.10,0.35)*20,max:20,t:Math.round(sd*100)+'% dos gastos foram desnecessários (ideal: até 10%)'})}
var pl=m.plano;if(pl&&pl.sal>0){var rd=pl.div/pl.sal;c.push({n:'Dívidas',pts:lim01(rd,0.3,0.6)*25,max:25,t:'Dívidas pesam '+Math.round(rd*100)+'% do salário (ideal: até 30%)'})}
if(!c.length)return null;var tp=0,tm=0;c.forEach(function(x){tp+=x.pts;tm+=x.max});var nota=Math.round(tp/tm*100);
return{nota:nota,rot:nota>=80?'Excelente':nota>=60?'Bom':nota>=40?'Atenção':'Crítico',cor:nota>=60?'--pos':nota>=40?'--mid':'--neg',c:c}}
function simDividas(arr,extra,maxM){var ds=arr.map(function(x){return{nome:x.nome,rest:x.rest,parc:x.parc,fim:0}}),m=0;function tot(){return ds.reduce(function(a,x){return a+x.rest},0)}
var hist=[tot()];while(tot()>0.004&&m<maxM){m++;var pool=extra;
 ds.forEach(function(x){if(x.rest<=0.004){pool+=x.parc;return}var p=Math.min(x.parc,x.rest);x.rest-=p;if(x.rest<=0.004){x.rest=0;x.fim=m}});
 ds.slice().sort(function(a,b){return a.rest-b.rest}).forEach(function(x){if(pool<=0.004||x.rest<=0.004)return;var p=Math.min(pool,x.rest);x.rest-=p;pool-=p;if(x.rest<=0.004){x.rest=0;x.fim=m}});
 hist.push(tot())}return{meses:m,ds:ds,hist:hist}}
function mesDepois(k){var d=new Date();d=new Date(d.getFullYear(),d.getMonth()+k,1);return MESES[d.getMonth()]+'/'+d.getFullYear()}
function cLinha(box,txt,cls){var p=rEl('p',cls||'rn',txt);box.appendChild(p);return p}
function cCampo(box,rot,val,ph,fn){var l=rEl('label',null,rot),i=document.createElement('input');i.inputMode='decimal';i.autocomplete='off';i.placeholder=ph||'';i.value=val;i.onchange=function(){fn(i.value)};box.appendChild(l);box.appendChild(i);return i}
function cDet(box,rot,fn){var d=rEl('details','cn-det'),s=rEl('summary',null,rot);d.appendChild(s);fn(d);box.appendChild(d)}
function renderConsultor(){var B=$('consBox');if(!B||!st)return;B.innerHTML='';var C=st.cons,L=mesesLista(),m=L[L.length-1],s=statsMes(m),pl=m.plano,sal=st.salario||0,rec=Math.max(s.rec||0,sal),df=dfMes(),sk=scoreMes(m,s);
/* nota + foco */
var sc=rSec('Nota do mês');
if(!sk)cLinha(sc,'Sem dados ainda. Lance entradas e gastos e cadastre o salário.');
else{var top=rEl('div','cn-top'),nb=rEl('b','cn-nota',String(sk.nota));nb.style.color='var('+sk.cor+')';top.appendChild(nb);var tx=rEl('div');tx.appendChild(rEl('b',null,sk.rot));tx.appendChild(rEl('span','rn',m.rot+(m.atual?' (parcial)':'')));top.appendChild(tx);sc.appendChild(top);
 var fr=sk.c.filter(function(x){return x.pts/x.max<0.7}).sort(function(a,b){return(b.max-b.pts)-(a.max-a.pts)}).slice(0,3);
 if(fr.length){sc.appendChild(rEl('p','cn-h','Foco agora'));fr.forEach(function(x){cLinha(sc,x.t,'tip alerta')})}else cLinha(sc,'Tudo dentro do ideal. Continue assim.','tip ok');
 cDet(sc,'Ver pontos da nota',function(d){sk.c.forEach(function(x){var r=rEl('div','rl');r.appendChild(rEl('span',null,x.n));r.appendChild(barra(Math.round(x.pts/x.max*100),x.pts/x.max>=0.7?'--pos':x.pts/x.max>=0.4?'--mid':'--neg'));r.appendChild(rEl('b',null,Math.round(x.pts)+'/'+x.max));d.appendChild(r)})})}
B.appendChild(sc);
/* dívidas */
var sd=rSec('Quitar dívidas'),par=(st.dividas||[]).filter(function(d){return dvAtivo(d)&&ehPar(d)}).map(function(d){return{nome:d.nome,rest:dvRest(d),parc:parcBase(d),pg:dvPago(d)}}).filter(function(x){return x.rest>0.004});
var livre=0;if(pl&&pl.sobra>0)livre=Math.round((pl.sobra-pl.sobra*faixa(pl.sobra))*100)/100;
if(!par.length)cLinha(sd,'Sem dívidas parceladas. Cadastre na aba Planejamento.');
else{var ord=par.slice().sort(function(a,b){return a.rest-b.rest}),off=par.some(function(x){return !x.pg})?0:1,
 ex=C.extra!=null&&C.extra>=0?C.extra:Math.round(livre*0.5*100)/100,s0=simDividas(par,0,600),s1=simDividas(par,ex,600);
 cLinha(sd,'Sem extra: livre em '+s0.meses+(s0.meses===1?' mês':' meses')+' ('+mesDepois(s0.meses-1+off)+').','tip dica');
 if(ex>0)cLinha(sd,'Com '+brl(ex)+' extra/mês: '+s1.meses+(s1.meses===1?' mês':' meses')+' ('+mesDepois(s1.meses-1+off)+')'+(s0.meses>s1.meses?', '+(s0.meses-s1.meses)+' a menos.':'.'),'tip ok');
 cCampo(sd,'Extra por mês (R$)',fmt2(ex),'0,00',function(v){var n=lerReais(v);C.extra=n>=0?Math.round(n*100)/100:null;save();renderConsultor()});
 cDet(sd,'Ordem de pagamento',function(d){d.appendChild(rTab(['Ordem','Dívida','Falta'],ord.map(function(x,i){return[String(i+1)+'º',x.nome,{t:brl(x.rest),n:1}]})));cLinha(d,'Extra vai para a menor dívida; quando acaba, a parcela dela vira extra. Sem juros.')})}
B.appendChild(sd);
/* reserva */
var sr=rSec('Reserva de emergência'),ess=mediaCampo(function(t){return t.uti+t.sem});if(!(ess>0)&&pl&&pl.div>0)ess=pl.div;
if(!(ess>0))cLinha(sr,'Classifique seus gastos como Útil para calcular.');
else{var gt=guardadoTotal(),a3=ess*3,a6=ess*6,rg=mediaCampo(function(t){return t.gua});if(!(rg>0)&&pl&&pl.sobra>0)rg=pl.sobra*faixa(pl.sobra);
 var bl=rEl('div','rl');bl.appendChild(rEl('span',null,'Guardado'));bl.appendChild(barra(pp(gt,a3),'--gua'));bl.appendChild(rEl('b',null,brl(gt)+' / '+brl(a3)));sr.appendChild(bl);
 var meta=gt>=a3?a6:a3,mm=gt>=a3?6:3;
 cLinha(sr,'Tem '+(gt/ess).toFixed(1).replace('.',',')+' de '+mm+' meses de gastos essenciais.'+(rg>0?' Guardando '+brl(rg)+'/mês, chega em ~'+Math.max(1,Math.ceil((meta-gt)/rg))+' meses.':' Defina quanto guardar por mês.'),'tip dica');
 cDet(sr,'Detalhes',function(d){cLinha(d,'Essencial por mês: '+brl(ess)+' (média de Útil e Sem categoria). Mínimo: 3 meses ('+brl(a3)+'). Ideal: 6 meses ('+brl(a6)+').')})}
B.appendChild(sr);
/* limite */
var sl=rSec('Limite de desnecessários');
if(!(rec>0))cLinha(sl,'Lance entradas ou cadastre o salário.');
else{var auto=Math.round(rec*0.10*100)/100,lim=C.limDes>0?C.limDes:auto,uso=s.des,pu=pp(uso,lim),proj=m.atual&&df.dia>=3?uso/df.dia*df.tot:uso;
 var br=rEl('div','rl');br.appendChild(rEl('span',null,'Usado'));br.appendChild(barra(pu,pu>=100?'--neg':pu>=70?'--mid':'--pos'));br.appendChild(rEl('b',null,brl(uso)+' / '+brl(lim)));sl.appendChild(br);
 cLinha(sl,uso>lim?'Passou '+brl(uso-lim)+'. Evite novos desnecessários.':'Restam '+brl(lim-uso)+(m.atual&&df.tot>df.dia?' (~'+brl((lim-uso)/(df.tot-df.dia))+'/dia)':'')+(m.atual&&df.dia>=3&&proj>lim?'. No ritmo atual, vai estourar.':'.'),uso>lim?'tip alerta':pu>=70?'tip dica':'tip ok');
 cCampo(sl,'Limite (R$) — vazio = 10% das entradas',C.limDes>0?fmt2(C.limDes):'',brl(auto),function(v){var n=lerReais(v);C.limDes=n>0?Math.round(n*100)/100:null;save();renderConsultor()})}
B.appendChild(sl);
B.appendChild(rEl('p','rn','Orientação geral e educativa. Não substitui profissional certificado.'))}
function snapshot(){return{app:'financas',versao:6,start:st.start,contas:st.contas,lim:st.lim,items:st.items,arquivo:st.arquivo,gAnt:st.gAnt,salario:st.salario,dividas:st.dividas,cons:st.cons,faturas:st.faturas,lugares:st.lugares,obj:st.obj,gBase:st.gBase,parcelas:st.parcelas,metas:st.metas,metaAv:st.metaAv,rend:st.rend,cdi:{on:st.cdi.on,anual:st.cdi.anual},lemb:st.lemb,abreMic:st.abreMic,autoComp:st.autoComp!==false,invMeta:st.invMeta||0,patri:st.patri||{},mentor:st.mentor,cats:st.cats,regras:st.regras,memV:st.memV?1:0,tut:st.tut,sep:1}}
