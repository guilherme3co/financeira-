/* ---------- tela inicial: últimos lançamentos e previsão ---------- */
function renderUlt(){var L=$('ultl');if(!L)return;L.innerHTML='';var arr=st.items.concat(faturaView()).slice().sort(function(a,b){return(b.d||'').localeCompare(a.d||'')||(b.t||'').localeCompare(a.t||'')||(Number(b.id)||0)-(Number(a.id)||0)}).slice(0,3);
if(!arr.length){L.appendChild(el_('p','vazio','Nada lançado neste mês. Toque no + para começar.'));return}
arr.forEach(function(i){var r=el_('div','it'),c=el_('span','c');c.style.display='inline-block';c.style.width=c.style.height='14px';c.style.background='var('+kor(i).v+')';var t=el_('div','t');t.appendChild(el_('b',null,i.desc||'Sem descrição'));t.appendChild(el_('small',null,dm(i.d)+(i.t?' · '+i.t:'')+' · '+(i.ent?'Entrada':kor(i).n)+(i.cat&&catOk(i.cat)?' · '+catNome(i.cat):'')));
var v=el_('div','v',(i.ent?'+ ':'− ')+brl(i.val));if(i.ent)v.style.color='var(--pos)';if(!i.fat&&acha(i.id)){t.title='Toque para editar';t.onclick=function(){abreEdicao(i.id)}}r.appendChild(c);r.appendChild(t);r.appendChild(v);L.appendChild(r)})}
$('ultver').onclick=function(){vaiPagina(3)};
function renderPrev(){var p=$('prev');if(!p)return;var f=dfMes(),hj=hoje(),mp=hj.slice(0,7),g=0;st.items.forEach(function(i){if(!i.ent&&i.cor!=='gua'&&!pagCred(i)&&String(i.d).slice(0,7)===mp)g+=Number(i.val)||0});
if(f.dia<3||f.tot<=f.dia||!(g>0)){p.hidden=true;return}var resto=f.tot-f.dia,med=g/f.dia,fim=r2(saldoAtual()-med*resto);p.hidden=false;p.textContent='';
p.appendChild(document.createTextNode('Nesse ritmo ('+brl(r2(med))+'/dia), você termina o mês com '));var b=el_('b',null,brl(fim));if(fim<0)b.style.color='var(--neg)';p.appendChild(b);p.appendChild(document.createTextNode(fim<0?'. Segure os gastos.':'.'))}
