/* ---------- INVESTIR: prontidão, simulador, onde guardar, rendendo bem, meta, projeção e taxas ---------- */
var IT={cur:'inv'},SIM=null,rendMes=0,txErro=false;
function itTab(k){if(['inv','pla','gua'].indexOf(k)<0)k='inv';IT.cur=k;Array.prototype.forEach.call(document.querySelectorAll('#itabs button'),function(b){var on=b.getAttribute('data-it')===k;b.setAttribute('aria-selected',on?'true':'false')});
 $('itInv').hidden=k!=='inv';$('itPla').hidden=k!=='pla';$('itGua').hidden=k!=='gua';
 if(k==='inv')renderInvest();if(k==='pla'){renderPlano();desenhaDiv()}if(k==='gua')renderGuardados();window.scrollTo(0,0);setTimeout(function(){tour(k==='inv'?'pgi':k==='pla'?'pgp':'pg3')},380)}
Array.prototype.forEach.call(document.querySelectorAll('#itabs button'),function(b){b.onclick=function(){itTab(b.getAttribute('data-it'))}});
function pctBR(x,d){return(Number(x)||0).toFixed(d==null?2:d).replace('.',',')+'%'}
function cdiUlt(){var c=st.cdi,ks=Object.keys(c.dias||{}).sort(),v=ks.length?Number(c.dias[ks[ks.length-1]]):0;return v>0?r2((Math.pow(1+v/100,252)-1)*100):0}
function taxas(){var t=st.tx||{},cdi=t.cdi>0?t.cdi:(cdiUlt()||(st.cdi.anual>0?st.cdi.anual:0)),selic=t.selic>0?t.selic:(cdi>0?r2(cdi+0.1):0);
 return{cdi:cdi,selic:selic,ipca:t.ipca>0?t.ipca:0,d:t.d||'',bc:t.cdi>0}}
function buscaTaxas(forca){if(!st||!window.fetch)return Promise.resolve(false);var hj=hoje();if(!forca&&st.tx&&st.tx.d===hj)return Promise.resolve(true);var meu=uid;
 function sgs(n){return fetch('https://api.bcb.gov.br/dados/serie/bcdata.sgs.'+n+'/dados/ultimos/1?formato=json',{method:'GET',credentials:'omit',referrerPolicy:'no-referrer',cache:'no-store'}).then(function(r){if(!r.ok)throw 0;return r.json()}).then(function(a){var v=Array.isArray(a)&&a[0]?Number(String(a[0].valor).replace(',','.')):NaN;if(!(v>-50&&v<200))throw 0;return v})}
 return Promise.all([sgs(4389),sgs(432),sgs(13522).catch(function(){return 0})]).then(function(v){if(!st||uid!==meu)return false;if(!(v[0]>0&&v[0]<100&&v[1]>0&&v[1]<100))throw 0;st.tx={cdi:r2(v[0]),selic:r2(v[1]),ipca:r2(v[2]||0),d:hj};txErro=false;save();if(!$('pgi').hidden&&$('pgi').className.indexOf('on')>=0&&IT.cur==='inv')renderInvest();return true}).catch(function(){txErro=true;return false})}
/* produtos comparados (taxas de exemplo, comuns no mercado) */
var PRODS=[{k:'pou',n:'Poupança',c:'Saque quando quiser · isenta de IR',pou:1,ise:1},
 {k:'c100',n:'CDB liquidez diária (100% do CDI)',c:'Saque no mesmo dia · “caixinhas” Nubank, Inter...',pct:100},
 {k:'c110',n:'CDB 110% do CDI',c:'Costuma ter prazo: saque no vencimento',pct:110},
 {k:'lci',n:'LCI/LCA (90% do CDI)',c:'Isenta de IR · carência de 90 dias ou mais',pct:90,ise:1},
 {k:'sel',n:'Tesouro Selic',c:'Saque em 1 dia útil · governo federal',sel:1}];
function taxaMes(p,T){if(p.pou)return T.selic>8.5?0.005:Math.pow(1+T.selic*0.7/100,1/12)-1;var a=p.sel?T.selic:T.cdi*p.pct/100;return Math.pow(1+a/100,1/12)-1}
/* simula mês a mês: valor inicial hoje + aporte no fim de cada mês; IR regressivo por aporte */
function simula(p,T,ini,ap,meses){var r=taxaMes(p,T),lot=[],inv=0;if(ini>0){lot.push({p:ini,b:ini,m:0});inv+=ini}
 for(var m=1;m<=meses;m++){lot.forEach(function(l){l.b*=1+r});if(ap>0&&m<meses){lot.push({p:ap,b:ap,m:m});inv+=ap}}
 var b=0,ir=0;lot.forEach(function(l){b+=l.b;if(!p.ise&&l.b>l.p)ir+=(l.b-l.p)*aliqIR(Math.round((meses-l.m)*30.44))});return{inv:r2(inv),bruto:r2(b),ir:r2(ir),liq:r2(b-ir),rend:r2(b-ir-inv)}}
function essMes(){var Z=mZona(),e=Z.ess>0?Z.ess:mediaCampo(function(t){return t.uti+t.sem});if(!(e>0)){var pl=planoSnap();if(pl.div>0)e=pl.div}return r2(e||0)}
function guaMes(){var mp=mesAt(),s=0;st.items.forEach(function(i){if(!i.ent&&i.cor==='gua'&&String(i.d).slice(0,7)===mp)s+=i.ret?-i.val:i.val});return r2(s)}
function metaSug(){var Z=mZona(),pl=planoSnap(),s=Z.guar>0?Z.guar:(pl.sobra>0?r2(pl.sobra*faixa(pl.sobra)):0);return r2(s)}
function iCard(tit,ico){var c=el_('section','icard'),h=el_('h3',null,(ico?ico+' ':'')+tit);c.appendChild(h);return c}
function iLinha(box,a,b,cls){var d=el_('div','irow'+(cls?' '+cls:''));d.appendChild(el_('span',null,a));d.appendChild(el_('b',null,b));box.appendChild(d);return d}
function renderInvest(){var B=$('invBox');if(!B||!st)return;B.innerHTML='';var T=taxas(),G=guardadoTotal(),Z=mZona(),ess=essMes();
 /* taxas */
 var ct=iCard('Taxas de hoje','📊');if(!(T.cdi>0)){ct.appendChild(el_('p','imsg','Sem taxa ainda. Toque em Atualizar (precisa de internet) ou digite o CDI em ⚙ → Meu dinheiro.'))}
 else{var g=el_('div','itx');[['CDI',pctBR(T.cdi)+' a.a.'],['Selic',pctBR(T.selic)+' a.a.'],['IPCA 12m',T.ipca?pctBR(T.ipca):'—'],['Poupança',pctBR((Math.pow(1+taxaMes(PRODS[0],T),12)-1)*100)+' a.a.']].forEach(function(x){var d=el_('div');d.appendChild(el_('small',null,x[0]));d.appendChild(el_('b',null,x[1]));g.appendChild(d)});ct.appendChild(g);
  ct.appendChild(el_('p','imsg',T.bc?'Banco Central, atualizado em '+dm(T.d)+'.':'Estimado pelo CDI do app'+(txErro?' (sem conexão com o Banco Central).':'.')))}
 var ab=el_('button','linkb','Atualizar taxas');ab.type='button';ab.onclick=function(){ab.textContent='Buscando...';buscaTaxas(true).then(function(ok){if(!ok){ab.textContent='Sem conexão. Tentar de novo';return}renderInvest()})};ct.appendChild(ab);B.appendChild(ct);
 /* 1. pronto para investir */
 var cp=iCard('Estou pronto para investir?','🪜'),a3=r2(ess*3),a6=r2(ess*6),d1=!Z.caro.length,d2=ess>0&&G>=a3,deg=!d1?1:!d2?2:3;
 [[d1,'Sem dívidas caras',d1?'Nenhuma dívida com juros altos (6% ao mês ou mais).':'Quite primeiro: '+Z.caro.map(function(x){return x.nome}).slice(0,3).join(', ')+'. Os juros delas são maiores que qualquer investimento.'],
  [d2,'Reserva de emergência',ess>0?(d2?'Montada: '+brl(G)+' (3 meses do essencial = '+brl(a3)+').'+(G<a6?' Ideal: 6 meses ('+brl(a6)+').':''):'Faltam '+brl(r2(a3-G))+' para 3 meses do essencial ('+brl(a3)+'). Guarde em algo com saque no mesmo dia.'):'Classifique seus gastos como Útil para o app calcular o seu essencial.'],
  [d1&&d2,'Investir para objetivos',d1&&d2?'Pode investir para seus objetivos. Veja abaixo onde guardar cada um.':'Libera quando os dois passos acima estiverem prontos.']].forEach(function(x,i){var r=el_('div','istep'+(x[0]?' ok':i+1===deg?' at':''));r.appendChild(el_('span','isn',x[0]?'✓':String(i+1)));var t=el_('div');t.appendChild(el_('b',null,x[1]));t.appendChild(el_('p',null,x[2]));r.appendChild(t);cp.appendChild(r)});
 cp.insertBefore(el_('p','imsg','Você está no '+deg+'º degrau.'),cp.children[1]);B.appendChild(cp);
 if(!(T.cdi>0)){B.appendChild(el_('p','rn','Com as taxas, aparecem aqui: simulador, onde guardar cada objetivo, análise dos seus guardados, meta do mês e projeção.'));return}
 /* 4. rendendo bem? */
 var cr=iCard('Seu dinheiro está rendendo bem?','🔍'),m=guaLugares(),soma=0,ganhoHoje=0,ganhoMax=0,nomes=Object.keys(m).filter(function(k){return m[k]>0.004}).sort(function(a,b){return m[b]-m[a]});nomes.forEach(function(k){soma+=m[k]});var sem=r2(G-soma);if(sem>0.004){nomes.push('Sem local');m['Sem local']=sem}
 var liq=PRODS.filter(function(p){return p.k==='c100'||p.k==='sel'}),ano=function(p,v){return simula(p,T,v,0,12).rend},melhorL=function(v){var b=null;liq.forEach(function(p){var x=ano(p,v);if(!b||x>b.v)b={p:p,v:x}});return b};
 if(!nomes.length)cr.appendChild(el_('p','imsg','Nada guardado ainda. Quando guardar, o app compara aqui onde rende mais.'));
 nomes.forEach(function(k){var v=m[k],rc=st.rend&&st.rend[k],atual=rc?ano({pct:rc.pct,ise:rc.iso},v):0,bm=melhorL(v),lc=ano(PRODS[3],v),d=el_('div','ilug'),h=el_('div','irow');ganhoHoje+=atual;ganhoMax+=Math.max(atual,bm.v);
  h.appendChild(el_('span',null,k));h.appendChild(el_('b',null,brl(v)));d.appendChild(h);
  var txt=rc?('Rende '+rc.pct+'% do CDI: cerca de '+brl(atual)+' por ano.'+(bm.v>atual+1?' Em '+bm.p.n+' renderia '+brl(bm.v)+' (+'+brl(r2(bm.v-atual))+').':' Já está entre as melhores opções com saque no dia.')):('Parado ou sem rendimento cadastrado. Em '+bm.p.n+' renderia '+brl(bm.v)+' por ano.');
  d.appendChild(el_('p',null,txt));if(v>=1000&&lc>Math.max(atual,bm.v)+1)d.appendChild(el_('p','idica','Se não for usar por 1 ano: LCI/LCA renderia '+brl(lc)+' sem IR.'));
  if(!rc&&k!=='Sem local'){var fb=el_('button','linkb','Cadastrar quanto rende ›');fb.type='button';fb.onclick=function(){RD.f=k;itTab('gua')};d.appendChild(fb)}cr.appendChild(d)});
 if(nomes.length){var tg=el_('div','itot');tg.appendChild(el_('span',null,'Hoje: ~'+brl(r2(ganhoHoje))+'/ano'));tg.appendChild(el_('b',null,'Possível: ~'+brl(r2(ganhoMax))+'/ano'));cr.appendChild(tg)}B.appendChild(cr);
 /* 6. meta do mês */
 var cm=iCard('Meta de investir por mês','🎯'),sug=metaSug(),meta=st.invMeta>0?st.invMeta:sug,feito=guaMes(),need=0;(st.obj||[]).forEach(function(o){if(!(o.meta>0)||!o.prazo)return;var f=r2(o.meta-objProg(o)),mm=Math.ceil(isoDias(hoje(),o.prazo)/30.44);if(f>0&&mm>0){var u=simula(PRODS[1],T,0,1,mm+1).liq;if(u>0)need+=f/u}});need=r2(need);
 if(sug>0)iLinha(cm,'Sugerido pela sua sobra',brl(sug));if(need>0)iLinha(cm,'Para os objetivos no prazo',brl(need));
 if(need>0&&Z.sobra>0&&need>Z.sobra)cm.appendChild(el_('p','idica al','Os objetivos pedem mais do que sobra por mês ('+brl(Z.sobra)+'). Estique algum prazo.'));
 var ml=el_('label',null,'Minha meta por mês (R$)'),mi=document.createElement('input');mi.inputMode='decimal';mi.autocomplete='off';mi.id='invmeta';mi.value=meta>0?fmt2(meta):'';mi.placeholder=sug>0?fmt2(sug):'0,00';
 mi.onchange=function(){var v=lerReais(mi.value);st.invMeta=v>0?r2(v):0;save();renderInvest()};cm.appendChild(ml);cm.appendChild(mi);
 if(meta>0){var pc_=Math.max(0,Math.min(100,feito/meta*100)),bb=el_('div','rbar'),bi=el_('i');bi.style.width=pc_+'%';bi.style.background='var(--pos)';bb.appendChild(bi);bb.style.margin='10px 0 4px';cm.appendChild(bb);cm.appendChild(el_('p','imsg','Guardado este mês: '+brl(feito)+' de '+brl(meta)+(feito>=meta?'. Meta batida! 🎉':'. Faltam '+brl(r2(meta-feito))+'.')))}
 B.appendChild(cm);
 /* 2. simulador */
 if(!SIM)SIM={ini:r2(G),ap:r2(meta||0),m:12};var cs=iCard('Simulador: quanto rende','🧮'),fw=el_('div','isim');
 function campo(rot,val,fn,dec){var w=el_('div'),l=el_('label',null,rot),i=document.createElement(dec?'input':'select');if(dec){i.inputMode='decimal';i.autocomplete='off';i.value=fmt2(val);i.onchange=function(){var v=lerReais(i.value);fn(v>=0?r2(v):0);desenhaSim()}}else{[3,6,12,24,36,60,120].forEach(function(n){var o=document.createElement('option');o.value=n;o.textContent=n<12?n+' meses':n===12?'1 ano':(n/12)+' anos';i.appendChild(o)});i.value=String(val);i.onchange=function(){fn(+i.value);desenhaSim()}}w.appendChild(l);w.appendChild(i);fw.appendChild(w)}
 campo('Começar com',SIM.ini,function(v){SIM.ini=v},1);campo('Por mês',SIM.ap,function(v){SIM.ap=v},1);campo('Prazo',SIM.m,function(v){SIM.m=v});cs.appendChild(fw);var so=el_('div');so.id='simres';cs.appendChild(so);B.appendChild(cs);desenhaSim();
 /* 3. onde guardar cada objetivo */
 var co=iCard('Onde guardar cada objetivo','🧭'),objs=(st.obj||[]).filter(function(o){return o.meta>0}).map(function(o){return{n:o.nome,falta:r2(o.meta-objProg(o)),pz:o.prazo||''}});
 if(ess>0&&G<a3)objs.unshift({n:'Reserva de emergência',falta:r2(a3-G),pz:'',res:1});
 if(!objs.length)co.appendChild(el_('p','imsg','Crie objetivos com meta e prazo na aba Guardados. O app mostra aqui o melhor lugar e quanto guardar por mês em cada opção.'));
 objs.forEach(function(o){var d=el_('details','iobj'),sm=el_('summary'),mm=o.pz?Math.max(1,Math.ceil(isoDias(hoje(),o.pz)/30.44)):12,rec=o.res||mm<=12?['c100','sel']:mm<=36?['lci','c110']:['sel','lci'];
  sm.appendChild(el_('b',null,o.n));sm.appendChild(el_('small',null,o.falta>0.004?'Faltam '+brl(o.falta)+' · '+(o.pz?mm+(mm===1?' mês':' meses'):'sem prazo (usei 1 ano)'):'Meta alcançada! 🎉'));d.appendChild(sm);
  if(o.falta>0.004){var rows=PRODS.map(function(p){var u=simula(p,T,0,1,mm+1).liq,ap=u>0?r2(o.falta/u):0;return{p:p,ap:ap,ok:rec.indexOf(p.k)>=0}}).sort(function(a,b){return a.ap-b.ap});
   rows.forEach(function(x){var r=el_('div','irow'+(x.ok?' irec':''));var s=el_('span',null,x.p.n);if(x.ok)s.appendChild(el_('em',null,' combina'));r.appendChild(s);r.appendChild(el_('b',null,brl(x.ap)+'/mês'));d.appendChild(r)});
   d.appendChild(el_('p','imsg',o.res?'Reserva precisa de saque rápido: prefira liquidez diária ou Tesouro Selic.':mm<=12?'Até 1 ano: prefira saque fácil (liquidez diária ou Tesouro Selic).':mm<=36?'De 1 a 3 anos: LCI/LCA ou CDB com prazo rendem mais, se não precisar sacar antes.':'Mais de 3 anos: Tesouro Selic, LCI/LCA longas ou Tesouro IPCA+ (protege da inflação).'))}
  co.appendChild(d)});if(co.querySelector('details'))co.querySelector('details').open=true;B.appendChild(co);
 /* 7. projeção */
 var cj=iCard('Projeção do futuro','🔭'),apm=meta>0?meta:sug,P3=[{n:'Parado',c:'--mute',p:null},{n:'Poupança',c:'--mid',p:PRODS[0]},{n:'CDB 100% CDI',c:'--pos',p:PRODS[1]}];
 cj.appendChild(el_('p','imsg','Começando com '+brl(G)+' e guardando '+brl(apm)+' por mês.'));
 var pts=P3.map(function(s){var a=[];for(var mm=0;mm<=120;mm+=6)a.push(s.p?simula(s.p,T,G,apm,mm||1).liq:r2(G+apm*Math.max(0,mm-1)));return a});cj.appendChild(iGraf(pts,P3));
 var tb=rTab(['','1 ano','5 anos','10 anos'],P3.map(function(s,i){return[s.n].concat([2,10,20].map(function(ix){return{t:brl(pts[i][ix]),n:1}}))}));tb.classList.add('itab');cj.appendChild(tb);
 var dif=r2(pts[2][20]-pts[0][20]);if(dif>0)cj.appendChild(el_('p','idica','Em 10 anos, investir em vez de deixar parado dá +'+brl(dif)+'.'));B.appendChild(cj);
 B.appendChild(el_('p','rn','Simulação educativa com taxas de hoje, que mudam com o tempo. Não é recomendação de investimento. CDB e LCI/LCA têm garantia do FGC até R$ 250 mil por banco.'))}
function desenhaSim(){var o=$('simres');if(!o)return;o.innerHTML='';var T=taxas(),res=PRODS.map(function(p){return{p:p,r:simula(p,T,SIM.ini,SIM.ap,SIM.m)}}),best=res.slice().sort(function(a,b){return b.r.liq-a.r.liq})[0];
 if(!(SIM.ini>0||SIM.ap>0)){o.appendChild(el_('p','imsg','Digite um valor para começar ou por mês.'));return}
 o.appendChild(el_('p','imsg','Você coloca '+brl(res[0].r.inv)+' no total. Valores já sem imposto:'));
 res.forEach(function(x){var d=el_('div','isr'+(x===best?' best':'')),h=el_('div','irow');h.appendChild(el_('span',null,x.p.n));h.appendChild(el_('b',null,brl(x.r.liq)));d.appendChild(h);d.appendChild(el_('small',null,'+'+brl(x.r.rend)+(x.r.ir>0?' · IR '+brl(x.r.ir):'')+' · '+x.p.c));o.appendChild(d)});
 o.appendChild(el_('p','idica','Para esse prazo, '+best.p.n+' rende mais: +'+brl(r2(best.r.liq-res[0].r.liq))+' que a poupança.'))}
function iGraf(series,meta){var W=320,H=140,pl=6,pr=6,pt=8,pb=18,mx=0;series.forEach(function(a){a.forEach(function(v){if(v>mx)mx=v})});mx=mx||1;var n=series[0].length-1,NS='http://www.w3.org/2000/svg',sv=document.createElementNS(NS,'svg');sv.setAttribute('viewBox','0 0 '+W+' '+H);sv.setAttribute('class','igraf');sv.setAttribute('role','img');sv.setAttribute('aria-label','Projeção de 10 anos');
 function X(i){return pl+(W-pl-pr)*i/n}function Y(v){return pt+(H-pt-pb)*(1-v/mx)}
 series.forEach(function(a,k){var p=document.createElementNS(NS,'polyline');p.setAttribute('points',a.map(function(v,i){return X(i).toFixed(1)+','+Y(v).toFixed(1)}).join(' '));p.setAttribute('fill','none');p.setAttribute('stroke','var('+meta[k].c+')');p.setAttribute('stroke-width',k===2?'2.6':'1.8');if(k===0)p.setAttribute('stroke-dasharray','4 4');sv.appendChild(p)});
 [[0,'hoje'],[10,'5 anos'],[20,'10 anos']].forEach(function(q){var t=document.createElementNS(NS,'text');t.setAttribute('x',X(q[0]));t.setAttribute('y',H-4);t.setAttribute('class','ax');t.setAttribute('text-anchor',q[0]===0?'start':q[0]===20?'end':'middle');t.textContent=q[1];sv.appendChild(t)});
 var w=el_('div');w.appendChild(sv);var lg=el_('div','rlg');meta.forEach(function(s){var sp=el_('span'),i=el_('i');i.style.background='var('+s.c+')';sp.appendChild(i);sp.appendChild(document.createTextNode(s.n));lg.appendChild(sp)});w.appendChild(lg);return w}


