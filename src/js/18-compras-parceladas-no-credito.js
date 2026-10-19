/* ---------- compras parceladas no crédito ---------- */
function addMes(d,n){var p=d.split('-'),y=+p[0],m=(+p[1]-1)+n,dia=+p[2];y+=Math.floor(m/12);m=((m%12)+12)%12;var u=new Date(y,m+1,0).getDate();return y+'-'+pad(m+1)+'-'+pad(Math.min(dia,u))}
function cpVal(p,k){var b=Math.floor(p.tot/p.n*100+1e-9)/100;return k>=p.n?r2(p.tot-b*(p.n-1)):r2(b)}
/* compra parcelada (modelo da fatura): nada entra hoje; a 1ª parcela entra no mês seguinte e as outras mês a mês.
   O Limite cai o total na hora (igual ao banco): as parcelas que ainda não entraram contam como limite usado. */
function parcData(p,k){return p.v2?addMes(p.d0,k):addMes(p.d0,k-1)}
function parcFuturo(){var f=0;(st.parcelas||[]).forEach(function(p){if(!p.v2)return;for(var k=p.k;k<=p.n;k++)f+=cpVal(p,k)});return r2(f)}
function parcRec(id){return(st.parcelas||[]).filter(function(p){return p.id===id})[0]}
function novaParc(it,n){n=Math.max(2,Math.min(60,n|0));aplicaMem(it);var p={id:it.id,desc:it.desc,tot:r2(it.val),n:n,k:1,d0:it.d,t:it.t||'',cor:(it.cor==='uti'||it.cor==='des')?it.cor:'sem',v2:1};if(it.cat)p.cat=it.cat;if(it.txid)p.txid=it.txid;if(it.doc)p.doc=it.doc;st.parcelas.push(p);if(p.cor!=='sem')aprende({desc:p.desc,cor:p.cor,cat:p.cat,doc:p.doc});save();return p}
function txtParc(p){var d=parcData(p,1),q=d.split('-');return p.desc+' · '+p.n+'x de '+brl(cpVal(p,1))+' · 1ª em '+MESES[(+q[1])-1].toLowerCase()+(p.cor!=='sem'?' · '+COR[p.cor].n:'')+(p.cat&&catOk(p.cat)?' · '+catNome(p.cat):'')}
function avisoParc(p,pre){render();toast((pre||'Compra parcelada: ')+txtParc(p)+'. Limite já reservado; as parcelas entram sozinhas.',p.id,function(){cancelaParc(p.id);save()},p.cor==='sem'?p.id:null)}
function mkParc(it,n){n=Math.max(2,Math.min(60,n|0));var p={id:it.id,desc:it.desc,tot:it.val,n:n,k:2,d0:it.d,cor:it.cor};it.val=cpVal(p,1);it.desc=it.desc+' (1/'+n+')';it.pc=p.id;st.parcelas.push(p);return p}
function cancelaParc(id){st.parcelas=st.parcelas.filter(function(p){return p.id!==id})}
function geraParcelas(){var h=hoje(),ch=false;st.parcelas=st.parcelas.filter(function(p){while(p.k<=p.n){var d=parcData(p,p.k);if(d>h)break;var id=Date.parse(d+'T08:00:00')+p.k;while(acha(id))id++;var it={id:id,d:d,t:'',desc:p.desc+' ('+p.k+'/'+p.n+')',val:cpVal(p,p.k),pay:'Crédito',cor:p.cor,ent:false,pc:p.id};if(p.cat)it.cat=p.cat;st.items.push(it);p.k++;ch=true}return p.k<=p.n});return ch}
function parcN(){return $('epw').hidden?1:Math.max(1,parseInt($('epar').value)||1)}
function parcSet(n){var sl=$('epar');n=String(n||1);if(!Array.prototype.some.call(sl.options,function(o){return o.value===n})){var o=document.createElement('option');o.value=n;o.textContent=n+'x';sl.appendChild(o)}sl.value=n}
function parcUI(){var on=novoMode&&$('ep').value==='Crédito'&&editTipo!=='rec'&&editTipo!=='gua';$('epw').hidden=!on;if(!on){$('epar').value='1';return}
var n=parcN(),v=lerReais($('ev').value);$('eparn').textContent=(n>1&&v>0)?('Valor total da compra. '+n+' parcelas de '+brl(cpVal({tot:r2(v),n:n},1))+'. A 1ª entra no mês que vem e as outras mês a mês; o Limite já reserva o total.'):'Se foi parcelado, escolha as parcelas e digite o valor total.'}
(function(){var sl=$('epar');[1,2,3,4,5,6,7,8,9,10,11,12,18,24].forEach(function(n){var o=document.createElement('option');o.value=String(n);o.textContent=n===1?'À vista (1x)':n+'x';sl.appendChild(o)});
sl.onchange=parcUI;$('ep').onchange=parcUI;$('ev').addEventListener('input',parcUI)})();
function desenhaParc(){var w=$('parcl');w.innerHTML='';if(!st.parcelas.length){w.innerHTML='<p class="vazio" style="padding:6px 0">Nenhuma compra parcelada.</p>';return}
st.parcelas.forEach(function(p){var r=document.createElement('div');r.className='ir';var t=document.createElement('div');t.className='t';t.innerHTML='<b></b><small></small>';t.firstChild.textContent=p.desc;t.lastChild.textContent='Próxima: '+dm(parcData(p,p.k))+' · parcela '+p.k+' de '+p.n+(p.v2&&p.k===1?' · comprada em '+dm(p.d0):'');
var v=document.createElement('div');v.className='v';v.textContent=brl(cpVal(p,p.k));
var x=document.createElement('button');x.type='button';x.className='x';x.textContent='×';x.setAttribute('aria-label','Cancelar as parcelas que faltam');x.title='Cancelar as parcelas que faltam';var ar=false,tm=null;
x.onclick=function(){if(!ar){ar=true;x.textContent='Cancelar?';x.style.color='var(--neg)';x.style.fontSize='13px';tm=setTimeout(function(){ar=false;x.textContent='×';x.style.color='';x.style.fontSize=''},3000);return}clearTimeout(tm);cancelaParc(p.id);save();desenhaParc()};
r.appendChild(t);r.appendChild(v);r.appendChild(x);w.appendChild(r)})}

