/* ---------- calendário do mês (Histórico) ---------- */
var calM='',calD='';
function calDados(ym){var L=itemsTodos(),d={};L.forEach(function(i){if(!i||i.ent||i.cor==='gua'||i.fat||String(i.d).slice(0,7)!==ym)return;var x=d[i.d]||(d[i.d]={g:0,n:0,its:[]});x.g=r2(x.g+(Number(i.val)||0));x.n++;x.its.push(i)});return d}
function calMeses(){var m={};m[mesAt()]=1;itemsTodos().forEach(function(i){if(i&&/^\d{4}-\d{2}/.test(i.d))m[i.d.slice(0,7)]=1});return Object.keys(m).sort()}
function renderCal(){var C=$('cal');if(!C||!st)return;C.innerHTML='';var ms=calMeses();if(!calM||ms.indexOf(calM)<0)calM=mesAt();var ix=ms.indexOf(calM),y=+calM.slice(0,4),mo=+calM.slice(5,7),dias=new Date(y,mo,0).getDate(),dw=new Date(y,mo-1,1).getDay(),hj=hoje(),D=calDados(calM);
 var pri=itemsTodos().reduce(function(m,i){return(i&&i.d&&(!m||i.d<m))?i.d:m},''),pass=calM===mesAt()?+hj.slice(8,10):dias,tot=0;Object.keys(D).forEach(function(k){tot+=D[k].g});tot=r2(tot);var med=pass>0?tot/pass:0;
 var h=el_('div','calh'),bp=el_('button','calnav','‹'),bn=el_('button','calnav','›');bp.type=bn.type='button';bp.setAttribute('aria-label','Mês anterior');bn.setAttribute('aria-label','Próximo mês');bp.disabled=ix<=0;bn.disabled=ix>=ms.length-1;
 bp.onclick=function(){calM=ms[ix-1];calD='';renderCal()};bn.onclick=function(){calM=ms[ix+1];calD='';renderCal()};
 var t=el_('div','calt');t.appendChild(el_('b',null,MESES[mo-1]+'/'+y));t.appendChild(el_('span',null,'Gastos: '+brl(tot)+(med>0?' · média '+brl(r2(med))+'/dia':'')));h.appendChild(bp);h.appendChild(t);h.appendChild(bn);C.appendChild(h);
 var g=el_('div','calg');['D','S','T','Q','Q','S','S'].forEach(function(w){g.appendChild(el_('span','calw',w))});for(var i=0;i<dw;i++)g.appendChild(el_('span'));
 for(var dd=1;dd<=dias;dd++){(function(dd){var iso=calM+'-'+pad(dd),x=D[iso],fut=iso>hj,b=el_('button','cald');b.type='button';b.appendChild(el_('b',null,String(dd)));
  if(fut||(!x&&(!pri||iso<pri))){b.disabled=true}else if(!x){b.className+=' z';b.appendChild(el_('small',null,'0'))}else{b.className+=x.g<=med*1.0001?' v':x.g<=med*1.5?' a':' r';b.appendChild(el_('small',null,x.g>=1000?(x.g/1000).toFixed(1).replace('.',',')+'k':String(Math.round(x.g))))}
  if(iso===hj)b.className+=' hj';if(iso===calD)b.className+=' sel';b.setAttribute('aria-label',dd+' de '+MESES[mo-1]+': '+(x?brl(x.g):'sem gastos'));
  if(!fut)b.onclick=function(){calD=(calD===iso)?'':iso;renderCal()};g.appendChild(b)})(dd)}
 C.appendChild(g);var lg=el_('div','call');[['v','Até a média'],['a','Até 1,5×'],['r','Acima'],['z','Sem gastos']].forEach(function(l){var s=el_('span');s.appendChild(el_('i','cl '+l[0]));s.appendChild(document.createTextNode(l[1]));lg.appendChild(s)});C.appendChild(lg);
 if(calD){var x=D[calD],dt=new Date(calD+'T12:00:00'),p=el_('div','calp');p.appendChild(el_('b',null,['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'][dt.getDay()]+', '+dm(calD)+' · '+(x?brl(x.g):'sem gastos')));
  if(x)x.its.slice().sort(function(a,b){return(a.t||'').localeCompare(b.t||'')}).forEach(function(i){var r=el_('div','calr');var e=el_('span',null,(i.t?i.t+' · ':'')+(i.desc||'Sem descrição')+(i.cat&&catOk(i.cat)?' · '+catNome(i.cat):''));e.style.borderLeft='3px solid var('+kor(i).v+')';r.appendChild(e);r.appendChild(el_('b',null,brl(i.val)));
   if(acha(i.id)){r.title='Toque para editar';r.onclick=function(){abreEdicao(i.id)};r.style.cursor='pointer'}p.appendChild(r)});
  else p.appendChild(el_('p','mleg','Dia sem gastos. Ótimo!'));C.appendChild(p)}}

