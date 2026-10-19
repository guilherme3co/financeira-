/* ---------- desenho das páginas ---------- */
function render(){
if(!st)return;
mDot();
if(geraParcelas())save();
var saldo=st.start,g={rec:0,uti:0,des:0,gua:0,sem:0},tg=0,tgua=0,gd=0,dv=0;
st.items.forEach(function(i){if(i.ent){g.rec+=i.val;saldo+=i.val}else if(i.cor==='gua'){if(i.ret){tgua-=i.val;if(i.dev){saldo+=i.val;dv+=i.val}}else{g.gua+=i.val;tgua+=i.val}}else{g[i.cor]+=i.val;tg+=i.val;if(!pagCred(i)){saldo-=i.val;gd+=i.val}}});
var ft=somaFat(st.faturas);saldo-=ft;gd+=ft;
saldo=Math.round(saldo*100)/100;TOPO=st.start+g.rec+dv;
var el=$('saldo');el.textContent=brl(saldo);el.className='saldo'+(saldo<0?' neg':'');
$('gasto').textContent=brl(tg);
ring(saldo,gd,0,TOPO);
var tl=temLimite();$('limc').hidden=!tl;$('fatbtn').hidden=!tl;if(tl){var la=limAtual();$('limc').textContent='Limite '+brl(la);$('limc').style.color=la<0?'var(--neg)':''}
var nc=st.contas.length;$('entradasTotal').textContent=brl(g.rec);$('guardadoTotal').textContent=brl(tgua+(st.gAnt||0));
atalhos();renderUlt();renderPrev();try{renderVenc()}catch(e){}try{patriGuarda()}catch(e){}if($('pgx').className.indexOf('on')>=0)try{renderIntel()}catch(e){}
var gastos=st.items.filter(function(i){return !i.ent&&i.cor!=='gua'}),recs=st.items.filter(function(i){return i.ent}),guar=st.items.filter(function(i){return !i.ent&&i.cor==='gua'});
try{renderRend()}catch(e){}try{var gT=r2(tgua+(st.gAnt||0));$('gsv').textContent=brl(gT);$('gss').textContent=rendMes>0.004?'Rendeu '+brl(rendMes)+' este mês':(Object.keys(st.rend||{}).length?'Rendendo todo dia':'Toque para ver onde está')}catch(e){}if($('pgi').className.indexOf('on')>=0){if(IT.cur==='inv')try{renderInvest()}catch(e){}}try{$('rendd').hidden=!Object.keys(st.rend||{}).length}catch(e){}
fill($('lista3'),guar,'Nada guardado ainda.',true);
renderHistorico();renderPlano();
renderGuardados();$('gtot').textContent=brl(tgua+(st.gAnt||0));$('gsub').textContent=guar.length+(guar.length===1?' valor guardado':' valores guardados')+(st.gAnt>0?' · '+brl(st.gAnt)+' de meses anteriores':'')}

function objTxt(i){var o=i.obj&&(st.obj||[]).filter(function(x){return x.id===i.obj})[0];return o?' · '+o.nome:''}
function fill(L,arr,msg,edit){L.innerHTML='';
if(!arr.length){L.innerHTML='<p class="vazio">'+msg+'</p>';return}
arr.slice().reverse().forEach(function(i){var K=kor(i);
var r=document.createElement('div');r.className='it';
var c=document.createElement('button');c.className='c';c.title=i.fat?'Fatura':(i.ent?COR.rec.n:'Trocar categoria');c.setAttribute('aria-label',i.fat?'Fatura paga':(i.ent?'Recebido':'Categoria: '+K.n+'. Toque para trocar'));c.style.background='var('+K.v+')';
if(!i.ent&&!i.fat&&!i.ret)c.onclick=function(){var o=['sem','uti','des','gua'];i.cor=o[(o.indexOf(i.cor)+1)%4];save();render()};
var t=document.createElement('div');t.className='t';t.innerHTML='<b></b><small></small>';t.firstChild.textContent=i.desc;t.lastChild.textContent=dm(i.d)+(i.t?' · '+i.t:'')+' · '+i.pay+(i.ent?' · entrada':i.fat?' · débito':i.ret?' · retirada':' · '+K.n)+(i.lug?' · '+i.lug:'')+objTxt(i);
var v=document.createElement('div');v.className='v';v.textContent=(i.ent?'+ ':(edit?(i.ret?'− ':'+ '):'− '))+brl(i.val);
var x=document.createElement('button');x.className='x';x.textContent='×';x.setAttribute('aria-label','Apagar lançamento');x.title='Apagar lançamento';
var armed=false,tm=null;
x.onclick=function(){if(!armed){armed=true;x.textContent='Apagar?';x.style.color='var(--neg)';x.style.fontWeight='700';x.style.fontSize='14px';tm=setTimeout(function(){armed=false;x.textContent='×';x.style.color='';x.style.fontWeight='';x.style.fontSize=''},3000);return}clearTimeout(tm);remove(i.id);render()};
if(!i.fat){t.title='Toque para editar';t.onclick=function(){abreEdicao(i.id)}}r.appendChild(c);r.appendChild(t);r.appendChild(v);if(edit&&!i.fat){var pe=document.createElement('button');pe.className='x pen';pe.textContent='✎';pe.setAttribute('aria-label','Editar valor');pe.title='Editar';pe.onclick=function(){abreEdicao(i.id)};r.appendChild(pe)}r.appendChild(x);L.appendChild(r)})}

