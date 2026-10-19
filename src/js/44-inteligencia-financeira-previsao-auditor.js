/* ---------- INTELIGÊNCIA FINANCEIRA: previsão, auditor, simulador, patrimônio ---------- */
function mesNome(ym){var p=ym.split('-');return MESES[(+p[1])-1]}
function ymAdd(ym,k){var p=ym.split('-'),d=new Date(+p[0],(+p[1])-1+k,1);return d.getFullYear()+'-'+pad(d.getMonth()+1)}
function diasMes(ym){var p=ym.split('-');return new Date(+p[0],+p[1],0).getDate()}
/* contas com dia de vencimento ainda não pagas neste mês */
function vencs(){var hj=hoje(),ym=mesAt(),out=[];(st.dividas||[]).forEach(function(d){var dia=Number(d.dia)||0;if(!dia||!dvAtivo(d)||dvPago(d))return;var dd=ym+'-'+pad(Math.min(dia,diasMes(ym)));out.push({d:d,data:dd,falta:isoDias(hj,dd),val:dvValor(d)})});return out.sort(function(a,b){return a.data.localeCompare(b.data)})}
function txtFalta(f){return f<0?(f===-1?'venceu ontem':'venceu há '+(-f)+' dias'):f===0?'vence hoje':f===1?'vence amanhã':'vence em '+f+' dias'}
function paguei(d){var it={id:nid(),d:hoje(),t:hora(),desc:d.nome,val:r2(dvValor(d)),pay:'Pix',cor:'uti',ent:false,cat:catOk('cas')?'cas':undefined,dv:d.id};if(!it.cat)delete it.cat;addItem(it);dvMarca(d,true);save();render();
 toast('Pago: '+d.nome+' · '+brl(it.val)+' · lançado como gasto Útil',it.id,function(){dvMarca(d,false);save()})}
/* gasto do dia a dia (sem parcelas do cartão e sem contas fixas) */
function varItem(i){return i&&!i.ent&&i.cor!=='gua'&&!i.fat&&!i.pc&&!i.dv}
function gastoVar(){var A=(st.arquivo||[]).slice(-3),s=0,n=0;A.forEach(function(a){var x=0;(a.items||[]).forEach(function(i){if(varItem(i))x+=Number(i.val)||0});s+=x;n++});if(n)return r2(s/n);
 var f=dfMes(),x=0;st.items.forEach(function(i){if(varItem(i)&&String(i.d).slice(0,7)===mesAt())x+=i.val});return f.dia>=5?r2(x/f.dia*f.tot):0}
/* previsão dos próximos meses */
function prevMeses(N){var Z=mZona(),renda=Z.renda,va=gastoVar(),out=[],ym0=mesAt();
 for(var m=1;m<=N;m++){var ym=ymAdd(ym0,m),contas=0,cart=0;
  (st.dividas||[]).forEach(function(d){if(!dvAtivo(d))return;if(!ehPar(d)){contas+=Number(d.valor)||0;return}var rest=d.n-d.pagas-(dvPago(d)?0:1);if(m<=rest)contas+=parcBase(d)});
  (st.parcelas||[]).forEach(function(p){for(var k=p.k;k<=p.n;k++){if(parcData(p,k).slice(0,7)===ym)cart+=cpVal(p,k)}});
  out.push({ym:ym,renda:r2(renda),contas:r2(contas),cart:r2(cart),va:va,sobra:r2(renda-contas-cart-va)})}return out}
/* dia em que o saldo fica negativo neste mês (gasto médio por dia + contas no dia do vencimento) */
function diaNegativo(){var f=dfMes(),ym=mesAt(),g=0;st.items.forEach(function(i){if(varItem(i)&&!pagCred(i)&&String(i.d).slice(0,7)===ym)g+=i.val});var med=f.dia>=3?g/f.dia:0,s=saldoAtual(),V=vencs();
 for(var d=f.dia+1;d<=f.tot;d++){s-=med;V.forEach(function(v){var vd=+v.data.slice(8);if(vd===d||(d===f.dia+1&&vd<=f.dia))s-=v.val});if(s<-0.004)return{dia:d,saldo:r2(s)}}return null}
/* auditor */
var SUBS=/netflix|spotify|disney|prime ?video|amazon ?prime|youtube|deezer|hbo|globoplay|apple|icloud|google ?one|paramount|crunchyroll|smart ?fit|academia|gympass|wellhub|chatgpt|openai|canva|xbox|playstation|psn|uber ?one|ifood ?clube?|claro|vivo|\btim\b|internet|celular|streaming|assinatura|mensalidade/;
function assinaturas(){var d0=isoAdd(hoje(),-120),g={};itemsTodos().forEach(function(i){if(!i||i.ent||i.cor==='gua'||i.pc||i.fat||!(i.d>=d0))return;var k=mChave(i.desc)||normT(i.desc);if(!k)return;var x=g[k]||(g[k]={n:0,m:{},v:[],last:i});x.n++;x.m[i.d.slice(0,7)]=1;x.v.push(Number(i.val)||0);if(i.d>=x.last.d)x.last=i});
 return Object.keys(g).map(function(k){var x=g[k],ms=Object.keys(x.m).length,mn=Math.min.apply(null,x.v),mx=Math.max.apply(null,x.v),kn=SUBS.test(' '+normT(x.last.desc)+' ');return{k:k,nome:x.last.desc,val:r2(x.last.val),ok:(ms>=2&&mn>0&&mx/mn<=1.15&&x.n<=ms+1)||(kn&&x.n<=ms+1)}}).filter(function(a){return a.ok}).sort(function(a,b){return b.val-a.val})}
function formiga(){var ym=mesAt(),n=0,s=0,tot=0;st.items.forEach(function(i){if(!varItem(i)||String(i.d).slice(0,7)!==ym)return;tot+=i.val;if(i.val<20){n++;s+=i.val}});return{n:n,s:r2(s),pct:tot>0?Math.round(s/tot*100):0}}
function foraNormal(){var A=(st.arquivo||[]).slice(-3),f=dfMes(),ym=mesAt(),out=[];if(!A.length||f.dia<7)return null;var med={},cur={};
 A.forEach(function(a){(a.items||[]).forEach(function(i){if(varItem(i)&&i.cat)med[i.cat]=(med[i.cat]||0)+i.val/A.length})});
 st.items.forEach(function(i){if(varItem(i)&&i.cat&&String(i.d).slice(0,7)===ym)cur[i.cat]=(cur[i.cat]||0)+i.val});
 Object.keys(Object.assign({},med,cur)).forEach(function(k){if(!catOk(k))return;var m=med[k]||0,p=(cur[k]||0)/f.dia*f.tot;if(m>=20&&p>m*1.3&&p-m>=30)out.push({k:k,pct:Math.round((p/m-1)*100),up:1});else if(m>=50&&p<m*0.7&&m-p>=30&&f.dia>=15)out.push({k:k,pct:Math.round((1-p/m)*100),up:0})});return out}
function duplicados(){var g={};st.items.forEach(function(i){if(i.ent||i.fat||i.pc)return;var k=i.d+'|'+Math.round(i.val*100)+'|'+(mChave(i.desc)||normT(i.desc));(g[k]=g[k]||[]).push(i)});var out=[];
 Object.keys(g).forEach(function(k){var L=g[k];if(L.length<2)return;var tx={};L.forEach(function(i){if(i.txid)tx[normTx(i.txid)]=1});if(Object.keys(tx).length===L.length)return;var hs=L.map(function(i){return hmMin(i.t)}).filter(function(x){return x!=null}).sort(function(a,b){return a-b});if(hs.length===L.length&&hs[hs.length-1]-hs[0]>10)return;out.push(L)});return out.slice(0,3)}
/* patrimônio = o que tem (disponível + guardado) − o que deve (cartão usado + dívidas restantes) */
function patrimonio(){var tem=r2(saldoAtual()+guardadoTotal()),cart=temLimite()?Math.max(0,r2(somaCred(st)-limAtual())):0,div=0;try{mDiv().forEach(function(x){div+=x.rest})}catch(e){}div=r2(div);return{tem:tem,cart:cart,div:div,deve:r2(cart+div),liq:r2(tem-cart-div)}}
function patriGuarda(){if(!st)return;var p=patrimonio().liq;if(!st.patri||typeof st.patri!=='object')st.patri={};if(st.patri[mesAt()]!==p){st.patri[mesAt()]=p;var ks=Object.keys(st.patri).sort();if(ks.length>36)delete st.patri[ks[0]]}}
/* tela */
var SIMC={v:0,n:1},SIMD={id:'',v:0};
function resNota(){try{var L=mesesLista(),m=L[L.length-1],sk=scoreMes(m,statsMes(m)),e=$('consres');if(e)e.textContent=sk?'Nota '+sk.nota+' · '+sk.rot+' · toque para ver':'Nota, dívidas, reserva e limite de desnecessários'}catch(x){}}
function renderIntel(){var B=$('xBox');if(!B||!st)return;B.innerHTML='';patriGuarda();
 /* 1. previsão */
 var c1=iCard('Previsão','📅'),V=vencs(),neg=diaNegativo();
 if(neg)c1.appendChild(el_('p','idica al','⚠️ Dia '+neg.dia+' o saldo fica negativo ('+brl(neg.saldo)+') no ritmo atual, contando as contas a vencer.'));
 c1.appendChild(el_('b',null,'Contas a vencer'));
 if(!V.length)c1.appendChild(el_('p','imsg',(st.dividas||[]).some(function(d){return d.dia})?'Tudo pago neste mês. 🎉':'Coloque o dia do vencimento nas contas em Investir → Planejamento. O app avisa 3 dias antes.'));
 V.forEach(function(v){var r=el_('div','irow ivenc'+(v.falta<0?' al':v.falta<=3?' at':'')),a=el_('span');a.appendChild(el_('b',null,v.d.nome));a.appendChild(el_('small',null,' · '+txtFalta(v.falta)+' (dia '+(+v.data.slice(8))+')'));r.appendChild(a);var bx=el_('div','ivr');bx.appendChild(el_('b',null,brl(v.val)));var pb=el_('button','add pgb','Paguei');pb.type='button';pb.onclick=function(){paguei(v.d);renderIntel()};bx.appendChild(pb);r.appendChild(bx);c1.appendChild(r)});
 var P=prevMeses(3);if(P[0].renda>0||P.some(function(x){return x.contas||x.cart})){c1.appendChild(el_('b',null,'Próximos meses'));var tb=rTab(['','Entra','Sai','Sobra'],P.map(function(x){return[mesNome(x.ym).slice(0,3),{t:brl(x.renda),n:1},{t:brl(r2(x.contas+x.cart+x.va)),n:1},{t:brl(x.sobra),n:1}]}));tb.classList.add('itab');c1.appendChild(tb);
  c1.appendChild(el_('p','imsg','Sai = contas e dívidas + parcelas do cartão + gasto do dia a dia (média de '+brl(gastoVar())+'/mês).'));var ruim=P.filter(function(x){return x.sobra<0})[0];if(ruim)c1.appendChild(el_('p','idica al','Em '+mesNome(ruim.ym).toLowerCase()+' falta '+brl(-ruim.sobra)+'. Segure compras parceladas.'))}
 else c1.appendChild(el_('p','imsg','Cadastre o salário em Investir → Planejamento para ver os próximos meses.'));B.appendChild(c1);
 /* 2. auditor */
 var c2=iCard('Auditor','🔍'),S=assinaturas(),F=formiga(),N=foraNormal(),D=duplicados(),sem=st.items.filter(function(i){return !i.ent&&i.cor==='sem'}).length,achou=0;
 if(S.length){achou++;var ts=r2(S.reduce(function(a,x){return a+x.val},0)),d=el_('details','iobj'),sm=el_('summary');sm.appendChild(el_('b',null,'🔁 Assinaturas: '+brl(ts)+'/mês'));sm.appendChild(el_('small',null,S.length+(S.length===1?' gasto que se repete':' gastos que se repetem')+' · '+brl(r2(ts*12))+' por ano'));d.appendChild(sm);S.forEach(function(x){iLinha(d,x.nome,brl(x.val))});c2.appendChild(d)}
 if(F.n>=5){achou++;c2.appendChild(el_('p','idica','🐜 Efeito formiga: '+F.n+' gastos pequenos (até R$ 20) = '+brl(F.s)+' este mês'+(F.pct?' ('+F.pct+'% dos gastos)':'')+'.'))}
 if(N&&N.length){N.forEach(function(x){achou++;c2.appendChild(el_('p','idica'+(x.up?' al':''),(x.up?'📈 ':'👏 ')+catNome(x.k)+(x.up?' '+x.pct+'% acima da média.':' '+x.pct+'% abaixo da média. Boa!')))})}
 if(sem){achou++;var ps=el_('p','idica','🏷️ '+sem+(sem===1?' gasto sem':' gastos sem')+' Útil/Desnecessário. ');var bs=el_('button','linkb','Classificar ›');bs.type='button';bs.style.display='inline';bs.onclick=function(){vaiPagina(3)};ps.appendChild(bs);c2.appendChild(ps)}
 D.forEach(function(p){achou++;var pd=el_('p','idica al','⚠️ Pode estar repetido: '+p[0].desc+' · '+brl(p[0].val)+' · '+dm(p[0].d)+' ('+p.length+' vezes). ');var bd=el_('button','linkb','Ver ›');bd.type='button';bd.style.display='inline';bd.onclick=function(){abreEdicao(p[p.length-1].id)};pd.appendChild(bd);c2.appendChild(pd)});
 if(!achou)c2.appendChild(el_('p','imsg',N===null&&!(st.arquivo||[]).length?'Nada estranho por enquanto. A comparação com a média começa depois do primeiro mês fechado.':'Nada estranho por enquanto. 👍'));B.appendChild(c2);
 /* 3. simulador de compra */
 var c3=iCard('Simulador de compra','🧮'),fw=el_('div','isim isim2');function cp(rot,el){var w=el_('div');w.appendChild(el_('label',null,rot));w.appendChild(el);fw.appendChild(w)}
 var vi=document.createElement('input');vi.inputMode='decimal';vi.autocomplete='off';vi.placeholder='0,00';vi.id='scv';if(SIMC.v>0)vi.value=fmt2(SIMC.v);var ns=document.createElement('select');ns.id='scn';[1,2,3,4,5,6,8,10,12].forEach(function(n){var o=document.createElement('option');o.value=n;o.textContent=n===1?'À vista':n+'x';ns.appendChild(o)});ns.value=String(SIMC.n);
 cp('Valor da compra (R$)',vi);cp('Parcelas no crédito',ns);c3.appendChild(fw);var so=el_('div');so.id='scres';c3.appendChild(so);
 vi.onchange=function(){var v=lerReais(vi.value);SIMC.v=v>0?r2(v):0;desenhaSimC()};ns.onchange=function(){SIMC.n=+ns.value;desenhaSimC()};B.appendChild(c3);desenhaSimC();
 var ds=[];try{ds=mDiv()}catch(e){}if(ds.length){var c3b=iCard('Adiantar uma dívida','⏩'),fw2=el_('div','isim isim2'),sd=document.createElement('select');sd.id='sdd';ds.forEach(function(x){var o=document.createElement('option');o.value=String(x.id);o.textContent=x.nome+' (falta '+brl(x.rest)+')';sd.appendChild(o)});if(SIMD.id&&ds.some(function(x){return String(x.id)===SIMD.id}))sd.value=SIMD.id;else SIMD.id=sd.value;
  var dv=document.createElement('input');dv.inputMode='decimal';dv.autocomplete='off';dv.placeholder='200,00';dv.id='sdv';if(SIMD.v>0)dv.value=fmt2(SIMD.v);
  [[ 'Dívida',sd],['Adiantar (R$)',dv]].forEach(function(x){var w=el_('div');w.appendChild(el_('label',null,x[0]));w.appendChild(x[1]);fw2.appendChild(w)});c3b.appendChild(fw2);var so2=el_('div');so2.id='sdres';c3b.appendChild(so2);
  sd.onchange=function(){SIMD.id=sd.value;desenhaSimD()};dv.onchange=function(){var v=lerReais(dv.value);SIMD.v=v>0?r2(v):0;desenhaSimD()};B.appendChild(c3b);desenhaSimD()}
 /* 4. patrimônio */
 var c4=iCard('Patrimônio','💎'),Pt=patrimonio(),big=el_('p','ipat',brl(Pt.liq));if(Pt.liq<0)big.style.color='var(--neg)';c4.appendChild(big);
 iLinha(c4,'Você tem (disponível + guardado)',brl(Pt.tem));iLinha(c4,'Você deve (cartão + dívidas)','− '+brl(Pt.deve));
 var ks=Object.keys(st.patri||{}).sort().slice(-12);if(ks.length>=2){var ant=st.patri[ks[ks.length-2]],dif=r2(Pt.liq-ant);c4.appendChild(el_('p','idica'+(dif<0?' al':''),(dif>=0?'📈 +':'📉 ')+brl(dif)+' desde '+mesNome(ks[ks.length-2]).toLowerCase()+'.'));c4.appendChild(iBarras(ks.map(function(k){return{r:mesNome(k).slice(0,3),v:st.patri[k]}})))}
 else c4.appendChild(el_('p','imsg','A partir de agora o app guarda o patrimônio de cada mês e mostra o gráfico de evolução.'));B.appendChild(c4);
 B.appendChild(el_('p','rn','Previsões usam médias dos seus meses. Servem de guia, não são exatas.'))}
function desenhaSimC(){var o=$('scres');if(!o)return;o.innerHTML='';var v=SIMC.v,n=SIMC.n;if(!(v>0)){o.appendChild(el_('p','imsg','Digite o valor para ver se cabe no seu orçamento.'));return}
 var pc=r2(v/n),P=prevMeses(Math.max(1,Math.min(12,n))),ruim=null,lim=r2(limAtual()-v);
 P.forEach(function(x,i){if(i<n&&x.sobra-pc<0&&!ruim)ruim={ym:x.ym,f:r2(pc-x.sobra)}});
 o.appendChild(el_('p','idica'+(ruim||lim<0?' al':''),ruim?'⚠️ Não cabe: em '+mesNome(ruim.ym).toLowerCase()+' faltaria '+brl(ruim.f)+'.':lim<0?'⚠️ Passa do limite do cartão em '+brl(-lim)+'.':'✅ Cabe no orçamento.'));
 iLinha(o,n===1?'Na próxima fatura':n+'x de',brl(pc));if(temLimite())iLinha(o,'Limite depois da compra',brl(lim));
 P.slice(0,Math.min(n,3)).forEach(function(x){iLinha(o,'Sobra em '+mesNome(x.ym).toLowerCase(),brl(x.sobra)+' → '+brl(r2(x.sobra-pc)))});
 if(st.salario>0)o.appendChild(el_('p','imsg','⏱️ Custa cerca de '+Math.max(1,Math.round(v/(st.salario/176)))+' horas do seu trabalho.'))}
function desenhaSimD(){var o=$('sdres');if(!o)return;o.innerHTML='';var ds=mDiv(),i=-1;ds.forEach(function(x,k){if(String(x.id)===SIMD.id)i=k});if(i<0)return;if(!(SIMD.v>0)){o.appendChild(el_('p','imsg','Digite quanto quer adiantar.'));return}
 var a=mSim(ds,0),b2=ds.map(function(x){return Object.assign({},x)}),pg=Math.min(SIMD.v,b2[i].rest);b2[i].rest=r2(b2[i].rest-pg);var b=mSim(b2,0),fa=a.ds[i].fim||a.meses,fb=b.ds[i].fim||0,gm=Math.max(0,a.meses-b.meses),gj=Math.max(0,r2(a.jur-b.jur));
 o.appendChild(el_('p','idica','“'+ds[i].nome+'” acaba '+(fb===0?'agora':'em '+fb+(fb===1?' mês':' meses'))+' (antes: '+fa+(fa===1?' mês':' meses')+').'));
 iLinha(o,'Livre de todas as dívidas',(gm>0?gm+(gm===1?' mês':' meses')+' antes':'mesmo prazo'));iLinha(o,'Juros evitados',gj>0?brl(gj):(ds[i].jr>0?'R$ 0,00':'sem juros informados'));
 if(!(ds[i].jo>0)&&ds[i].par)o.appendChild(el_('p','imsg','Parcela sem juros: adiantar só ajuda se o banco der desconto. Peça o valor com desconto antes.'))}
function iBarras(a){var W=320,H=110,pb=18,pt=8,mx=0,mn=0;a.forEach(function(x){if(x.v>mx)mx=x.v;if(x.v<mn)mn=x.v});var sp=(mx-mn)||1,NS='http://www.w3.org/2000/svg',sv=document.createElementNS(NS,'svg'),bw=(W-8)/a.length;sv.setAttribute('viewBox','0 0 '+W+' '+H);sv.setAttribute('class','igraf');sv.setAttribute('role','img');sv.setAttribute('aria-label','Patrimônio mês a mês');
 var y0=pt+(H-pt-pb)*(mx/sp);a.forEach(function(x,i){var h=(H-pt-pb)*Math.abs(x.v)/sp,r=document.createElementNS(NS,'rect');r.setAttribute('x',(4+i*bw+bw*0.15).toFixed(1));r.setAttribute('width',(bw*0.7).toFixed(1));r.setAttribute('y',(x.v>=0?y0-h:y0).toFixed(1));r.setAttribute('height',Math.max(1,h).toFixed(1));r.setAttribute('rx','3');r.setAttribute('fill',x.v>=0?'var(--pos)':'var(--neg)');sv.appendChild(r);
  var t=document.createElementNS(NS,'text');t.setAttribute('x',(4+i*bw+bw/2).toFixed(1));t.setAttribute('y',H-4);t.setAttribute('text-anchor','middle');t.setAttribute('class','ax');t.textContent=x.r;sv.appendChild(t)});return sv}
/* aviso na tela principal: contas perto do vencimento e saldo negativo */
function renderVenc(){var w=$('venc');if(!w||!st)return;w.innerHTML='';var V=vencs().filter(function(v){return v.falta<=3}),neg=diaNegativo();if(!V.length&&!neg){w.hidden=true;return}w.hidden=false;
 V.slice(0,3).forEach(function(v){var r=el_('div','irow ivenc'+(v.falta<0?' al':' at')),a=el_('span');a.appendChild(el_('b',null,'📅 '+v.d.nome));a.appendChild(el_('small',null,' · '+txtFalta(v.falta)));r.appendChild(a);var bx=el_('div','ivr');bx.appendChild(el_('b',null,brl(v.val)));var pb=el_('button','add pgb','Paguei');pb.type='button';pb.onclick=function(){paguei(v.d)};bx.appendChild(pb);r.appendChild(bx);w.appendChild(r)});
 if(neg){var p=el_('p','idica al','⚠️ Dia '+neg.dia+' o saldo fica negativo no ritmo atual. ');var b=el_('button','linkb','Ver previsão ›');b.type='button';b.style.display='inline';b.onclick=function(){vaiPagina(4)};p.appendChild(b);w.appendChild(p)}}

