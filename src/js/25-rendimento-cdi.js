/* ---------- rendimento (CDI) ---------- */
var RD={f:null,novo:false,sel:null};
function isoAdd(iso,n){var p=iso.split('-'),d=new Date(+p[0],+p[1]-1,+p[2]+n);return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate())}
function isoDow(iso){var p=iso.split('-');return new Date(+p[0],+p[1]-1,+p[2]).getDay()}
function isoDias(a,b){var x=a.split('-'),y=b.split('-');return Math.round((Date.UTC(+y[0],+y[1]-1,+y[2])-Date.UTC(+x[0],+x[1]-1,+x[2]))/864e5)}
function rTaxa(iso){var c=st.cdi,v=c.dias[iso];if(v!=null)return v;var w=isoDow(iso);if(w===0||w===6)return 0;
if(c.de&&c.ate&&iso>=c.de&&iso<=c.ate)return 0;if(c.anual>0)return(Math.pow(1+c.anual/100,1/252)-1)*100;return null}
function aliqIR(dias){return dias<=180?.225:dias<=360?.2:dias<=720?.175:.15}
function fluxosLug(l){var a=[];itemsTodos().forEach(function(i){if(!i.ent&&i.cor==='gua'&&i.lug===l&&!i.rx)a.push({d:i.d,v:i.ret?-i.val:i.val})});return a}
function rendLug(l){var rc=st.rend&&st.rend[l];if(!rc)return null;var hj=hoje();if(rc.ini>hj)return null;
var fl=fluxosLug(l),bal=(guaLugares()[l]||0),p0=bal;fl.forEach(function(f){if(f.d>rc.ini)p0-=f.v});p0=Math.max(0,r2(p0));
var por={};fl.forEach(function(f){if(f.d>rc.ini){(por[f.d]=por[f.d]||[]).push(f.v)}});
var tr=p0>0?[{d0:rc.ini,p:p0,b:p0}]:[],rows=[],miss=0,tot=0,fator=rc.pct/100;
function liq(d){var B=0,P=0,IR=0;tr.forEach(function(t){B+=t.b;P+=t.p;if(!rc.iso&&t.b>t.p)IR+=(t.b-t.p)*aliqIR(isoDias(t.d0,d))});return{b:B,p:P,l:B-IR}}
var u=liq(rc.ini);rows.push({d:rc.ini,b:r2(u.b),l:r2(u.l),p:r2(u.p),gy:0});var prev=u.l,n=0;
for(var d=isoAdd(rc.ini,1);d<=hj&&n<2200;d=isoAdd(d,1),n++){var tx_=rTaxa(d);if(tx_==null){miss++;tx_=0}var f=tx_/100*fator;
if(f>0)tr.forEach(function(t){if(t.d0<d)t.b*=1+f});var a=liq(d),gy=a.l-prev;
(por[d]||[]).forEach(function(v){if(v>0)tr.push({d0:d,p:v,b:v});else{var w=-v;for(var k=0;k<tr.length&&w>1e-9;k++){var t=tr[k],tk=Math.min(t.b,w);if(t.b>0){var fr=tk/t.b;t.p*=1-fr;t.b-=tk;w-=tk}}tr=tr.filter(function(t){return t.b>1e-9})}});
var z=liq(d);rows.push({d:d,b:r2(z.b),l:r2(z.l),p:r2(z.p),gy:r2(gy)});prev=z.l;tot+=gy}
return{rows:rows,miss:miss,tot:r2(tot)}}
function rendTudo(){var nomes=Object.keys(st.rend||{}),res=[];nomes.forEach(function(k){var r=rendLug(k);if(r)res.push({nome:k,r:r})});return res}
var cdiErro=false;
function buscaCdi(forca){if(!st||!st.cdi||!st.cdi.on||!window.fetch)return;var nomes=Object.keys(st.rend||{});if(!nomes.length)return;var hj=hoje();
if(!forca&&st.cdi.busca===hj&&st.cdi.ate)return;var ini=hj;nomes.forEach(function(k){if(st.rend[k].ini<ini)ini=st.rend[k].ini});var lim=isoAdd(hj,-1826);if(ini<lim)ini=lim;
function br(i){var p=i.split('-');return p[2]+'/'+p[1]+'/'+p[0]}
var url='https://api.bcb.gov.br/dados/serie/bcdata.sgs.12/dados?formato=json&dataInicial='+br(ini)+'&dataFinal='+br(hj),meu=uid;
fetch(url,{method:'GET',credentials:'omit',referrerPolicy:'no-referrer',cache:'no-store'}).then(function(r){if(!r.ok)throw 0;return r.json()}).then(function(a){
if(!st||uid!==meu)return;if(!Array.isArray(a)||a.length>2500)throw 0;var dias={},ate='',ok=0;
a.forEach(function(x){if(!x||typeof x.data!=='string')return;var m=x.data.match(/^(\d{2})\/(\d{2})\/(\d{4})$/),v=Number(x.valor);if(!m||!(v>=0&&v<=0.5))return;var iso=m[3]+'-'+m[2]+'-'+m[1];dias[iso]=v;ok++;if(iso>ate)ate=iso});
if(!ok)throw 0;st.cdi.dias=dias;st.cdi.de=ini;st.cdi.ate=ate;st.cdi.busca=hj;cdiErro=false;save();render();cdiMsg()}).catch(function(){cdiErro=true;try{cdiMsg()}catch(e){}})}
function cdiStatus(){var c=st.cdi;if(!Object.keys(st.rend||{}).length)return'';
if(c.on&&c.ate&&!cdiErro)return'CDI do Banco Central até '+dm(c.ate)+'.';
if(c.on&&cdiErro)return'Sem conexão com o Banco Central; usando '+(c.anual>0?'a taxa de '+String(c.anual).replace('.',',')+'% ao ano que você digitou.':'o último CDI obtido. Digite o CDI ao ano em ⚙ para cobrir os dias novos.');
if(c.anual>0)return'Usando CDI de '+String(c.anual).replace('.',',')+'% ao ano (digitado).';return'Sem CDI: ligue a busca automática ou digite o CDI ao ano em ⚙.'}
function cdiMsg(){var m=$('cdimsg');if(m)m.textContent=cdiStatus()}
function cdiCfg(){$('cdion').checked=!!st.cdi.on;$('cdian').value=st.cdi.anual>0?fmt2(st.cdi.anual):'';cdiMsg()}
var _dcfg=desenhaCfg;desenhaCfg=function(){_dcfg();cdiCfg()};
$('cdion').onchange=function(){if(!st)return;st.cdi.on=this.checked;save();render();if(st.cdi.on)buscaCdi(true);cdiMsg()};
$('cdiok').onclick=function(){if(!st)return;var t=$('cdian').value.trim(),v=t?lerReais(t):0;if(!(v>=0&&v<=100)){$('cdimsg').textContent='Digite o CDI ao ano, por exemplo 14,65.';return}st.cdi.anual=r2(v);save();render();cdiCfg();$('cdimsg').textContent='Salvo. '+cdiStatus()};
$('cdiatu').onclick=function(){if(!st)return;if(!st.cdi.on){$('cdimsg').textContent='Ligue a busca automática primeiro.';return}$('cdimsg').textContent='Buscando...';buscaCdi(true);setTimeout(cdiMsg,2500)};
function renderGrend(){var H=$('grend');if(!H)return;H.innerHTML='';var nb=el_('button','add',RD.novo?'Cancelar':'+ Lugar rendendo');nb.type='button';nb.onclick=function(){RD.novo=!RD.novo;renderGuardados()};H.appendChild(nb);if(RD.novo)formRend(H,null)}
function formRend(host,lug){var rc=lug&&st.rend&&st.rend[lug],f=el_('div','gf'),sl=null,nn=null;
if(!lug){sl=document.createElement('select');sl.setAttribute('aria-label','Banco ou lugar');todosLugares().concat(['__novo']).forEach(function(n){var o=document.createElement('option');o.value=n;o.textContent=n==='__novo'?'+ Outro banco...':n;sl.appendChild(o)});f.appendChild(sl);
nn=document.createElement('input');nn.placeholder='Nome do banco';nn.autocomplete='off';nn.hidden=true;nn.style.marginTop='6px';f.appendChild(nn);sl.onchange=function(){nn.hidden=(sl.value!=='__novo');setV()}}
function lb(t){var e=el_('label','',t);e.style.marginTop='8px';return e}
f.appendChild(lb('Quanto rende (% do CDI)'));var pc=document.createElement('input');pc.setAttribute('inputmode','decimal');pc.autocomplete='off';pc.value=rc?String(rc.pct).replace('.',','):'100';f.appendChild(pc);
f.appendChild(lb('Valor guardado (sem contar o que já rendeu)'));var vv=document.createElement('input');vv.className='gv';vv.setAttribute('inputmode','decimal');vv.autocomplete='off';vv.placeholder='0,00';f.appendChild(vv);
function setV(){var l=lug||(sl&&sl.value!=='__novo'?sl.value:''),b=l?(guaLugares()[l]||0):0;vv.value=b>0?fmt2(b):''}
if(lug){var b0=guaLugares()[lug]||0;vv.value=fmt2(b0);vv.disabled=true;vv.setAttribute('aria-label','Valor atual (para mudar, use Retirar ou Guardar)')}else setV();
f.appendChild(lb('Rendendo desde'));var dt=document.createElement('input');dt.type='date';dt.value=rc?rc.ini:hoje();dt.max=hoje();f.appendChild(dt);
var lk=document.createElement('label');lk.style.cssText='display:flex;gap:8px;align-items:center;margin:8px 0';var ck=document.createElement('input');ck.type='checkbox';ck.style.cssText='width:auto;min-height:0';ck.checked=!!(rc&&rc.iso);lk.appendChild(ck);lk.appendChild(document.createTextNode('Isento de IR (ex.: LCI/LCA)'));f.appendChild(lk);
f.appendChild(el_('p','msg','Começa a render no dia seguinte. É uma estimativa: o banco pode diferir um pouco.'));
var ms=el_('p','msg','');ms.setAttribute('role','alert');f.appendChild(ms);var g=el_('div','gb'),ok=el_('button','add pri','Salvar'),cn=el_('button','add','Cancelar');ok.type=cn.type='button';
ok.onclick=function(){var l=lug;if(!l){l=sl.value;if(l==='__novo'){l=(nn.value||'').trim().slice(0,30);if(!l){ms.textContent='Digite o nome do banco.';return}var ex=todosLugares().filter(function(n){return normT(n)===normT(l)})[0];if(ex)l=ex;else st.lugares.push(l)}}
var p=lerReais(pc.value);if(!(p>=1&&p<=500)){ms.textContent='Digite o % do CDI, por exemplo 100 ou 110.';return}
var ini=dt.value;if(!/^\d{4}-\d{2}-\d{2}$/.test(ini)||ini>hoje()||ini<isoAdd(hoje(),-1826)){ms.textContent='Escolha uma data de hoje até 5 anos atrás.';return}
if(!rc&&Object.keys(st.rend||{}).length>=30){ms.textContent='Limite de 30 lugares.';return}
var bal=guaLugares()[l]||0,v=lug?bal:lerReais(vv.value);if(!lug){if(!(v>0)){ms.textContent='Digite o valor guardado, por exemplo 1000,00.';return}v=r2(v);
if(v<bal-0.004){ms.textContent='Aqui já há '+brl(bal)+'. Digite esse valor ou mais.';return}}
var p0=bal;if(!lug&&v>bal)p0=v;fluxosLug(l).forEach(function(x){if(x.d>ini)p0-=x.v});if(p0<-0.004){ms.textContent='Há movimentos depois dessa data maiores que o valor. Ajuste a data.';return}
if(!lug&&v>bal+0.004)addItem({id:Date.now(),d:hoje(),t:hora(),desc:'Saldo inicial '+l,val:r2(v-bal),pay:'Saldo inicial',cor:'gua',ent:false,lug:l,rx:true});
if(!st.rend)st.rend={};st.rend[l]={pct:p,ini:ini,iso:!!ck.checked};RD.f=null;RD.novo=false;save();render();buscaCdi(true);toast('Rendimento de '+l+' ligado')};
cn.onclick=function(){RD.f=null;RD.novo=false;renderGuardados()};g.appendChild(ok);g.appendChild(cn);
if(rc){var pb=el_('button','add','Parar de render');pb.type='button';var arm=false;pb.onclick=function(){if(!arm){arm=true;pb.textContent='Toque de novo para parar';setTimeout(function(){arm=false;pb.textContent='Parar de render'},3500);return}delete st.rend[lug];RD.f=null;save();render()};g.appendChild(pb)}
f.appendChild(g);host.appendChild(f)}
function renderRend(){var H=$('rendBox');if(!H)return;H.innerHTML='';rendMes=0;var res=rendTudo();
if(!res.length){H.appendChild(el_('p','vazio','Nenhum rendimento ainda. Deslize o painel do anel até Guardado e toque em “+ Lugar rendendo”.'));return}
var hj=hoje(),mes=hj.slice(0,7),ds=[],ini=hj;res.forEach(function(x){if(x.r.rows[0].d<ini)ini=x.r.rows[0].d});
var N=30,d0=isoAdd(hj,-(N-1));if(d0<ini)d0=ini;for(var d=d0;d<=hj;d=isoAdd(d,1))ds.push(d);
if(ds.length<2)ds=[isoAdd(hj,-1),hj];
var pts=ds.map(function(d){var t=0;res.forEach(function(x){var rw=x.r.rows,i=isoDias(rw[0].d,d);if(i<0)i=0;if(i>=rw.length)i=rw.length-1;t+=rw[i].l});return{d:d,v:r2(t)}});
var tot=0,mm=0,ult=0,ultd='';res.forEach(function(x){tot+=x.r.tot;x.r.rows.forEach(function(r){if(r.d.slice(0,7)===mes)mm+=r.gy})});rendMes=r2(mm);
for(var i=ds.length-1;i>=0&&!ultd;i--){var s1=0;res.forEach(function(x){var rw=x.r.rows,k=isoDias(rw[0].d,ds[i]);if(k>=1&&k<rw.length)s1+=rw[k].gy});if(s1>0.004){ult=s1;ultd=ds[i]}}
var S=el_('div','rst');[['Último dia'+(ultd?' ('+dm(ultd)+')':''),'+ '+brl(r2(ult))],['No mês','+ '+brl(r2(mm))],['Total rendido','+ '+brl(r2(tot))]].forEach(function(a){var c=el_('div');c.appendChild(el_('small','',a[0]));c.appendChild(el_('b','',a[1]));S.appendChild(c)});H.appendChild(S);
var W=320,Hh=120,pl=8,pr=8,pt=16,pb=18,mn=Infinity,mx=-Infinity;pts.forEach(function(p){if(p.v<mn)mn=p.v;if(p.v>mx)mx=p.v});if(mx-mn<1){var c=(mx+mn)/2;mn=c-.5;mx=c+.5}var pd=(mx-mn)*.12;mn-=pd;mx+=pd;
function X(i){return pl+(W-pl-pr)*i/(pts.length-1)}function Y(v){return pt+(Hh-pt-pb)*(1-(v-mn)/(mx-mn))}
var NS='http://www.w3.org/2000/svg',sv=document.createElementNS(NS,'svg');sv.setAttribute('viewBox','0 0 '+W+' '+Hh);sv.setAttribute('class','rsv');sv.setAttribute('role','img');
sv.setAttribute('aria-label','Valor líquido estimado dos seus rendimentos nos últimos '+pts.length+' dias: de '+brl(pts[0].v)+' para '+brl(pts[pts.length-1].v));
function mk(t,a){var e=document.createElementNS(NS,t);for(var k in a)e.setAttribute(k,a[k]);return e}
var pl_=mk('polyline',{'class':'ln',points:pts.map(function(p,i){return X(i).toFixed(1)+','+Y(p.v).toFixed(1)}).join(' ')});sv.appendChild(pl_);
var selL=mk('line',{'class':'sel',x1:0,x2:0,y1:pt-6,y2:Hh-pb,visibility:'hidden'});sv.appendChild(selL);
pts.forEach(function(p,i){var x=X(i),y=Y(p.v),dv=i?p.v-pts[i-1].v:0;if(dv>.004)sv.appendChild(mk('polygon',{'class':'up',points:(x-4)+','+(y-3)+' '+(x+4)+','+(y-3)+' '+x+','+(y-10)}));else if(dv<-.004)sv.appendChild(mk('polygon',{'class':'dn',points:(x-4)+','+(y+3)+' '+(x+4)+','+(y+3)+' '+x+','+(y+10)}));else sv.appendChild(mk('circle',{'class':'pt',cx:x,cy:y,r:2}))});
var t1=mk('text',{'class':'ax',x:pl,y:Hh-4});t1.textContent=dm(pts[0].d);sv.appendChild(t1);var t2=mk('text',{'class':'ax',x:W-pr,y:Hh-4,'text-anchor':'end'});t2.textContent=dm(pts[pts.length-1].d);sv.appendChild(t2);
H.appendChild(sv);var sel=el_('p','rsel','');sel.setAttribute('aria-live','polite');H.appendChild(sel);
function mostra(i){var p=pts[i],dv=i?r2(p.v-pts[i-1].v):0;sel.textContent=dm(p.d)+' · '+brl(p.v)+(i?(dv>.004?' · ▲ +'+brl(dv):dv<-.004?' · ▼ −'+brl(-dv):' · sem variação'):'');selL.setAttribute('x1',X(i));selL.setAttribute('x2',X(i));selL.setAttribute('visibility','visible')}
sv.onclick=function(e){var r=sv.getBoundingClientRect(),x=(e.clientX-r.left)/r.width*W,i=Math.round((x-pl)/(W-pl-pr)*(pts.length-1));mostra(Math.max(0,Math.min(pts.length-1,i)))};
mostra(pts.length-1);
res.forEach(function(x){var l=x.r.rows[x.r.rows.length-1],rc=st.rend[x.nome],row=el_('div','rpl'),a=el_('div'),b2=el_('div');a.appendChild(document.createTextNode(x.nome));a.appendChild(el_('small','',rc.pct+'% do CDI · rendeu '+brl(x.r.tot)));b2.style.textAlign='right';b2.appendChild(el_('b','',brl(l.l)));row.appendChild(a);row.appendChild(b2);H.appendChild(row)});
var cs=cdiStatus();var miss=0;res.forEach(function(x){miss+=x.r.miss});H.appendChild(el_('p','rnote','Valores líquidos estimados'+(cs?'. '+cs:'')+(miss?' Há '+miss+' dia(s) sem CDI, contados como zero.':'')+' O banco pode diferir um pouco.'))}
