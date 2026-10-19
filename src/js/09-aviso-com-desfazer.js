/* ---------- aviso com Desfazer ---------- */
var tt=null;
function toast(m,id,extra,q){var t=$('toast'),b=$('tund');fechaLanc();
$('tmsg').textContent=m;b.hidden=!id;var ed=$('tedi'),ei=(typeof id==='number'&&acha(id))?id:null;ed.hidden=!ei;ed.onclick=function(){t.hidden=true;clearTimeout(tt);if(acha(ei))abreEdicao(ei)};$('tuti').hidden=$('tdes').hidden=!q;
$('tcats').hidden=true;$('tcats').innerHTML='';
if(q){var sc=function(k){var i=acha(q)||parcRec(q);if(i){i.cor=k;aprende(i);save();render()}$('tuti').hidden=$('tdes').hidden=true;
 if(i&&!i.cat){$('tmsg').textContent='Marcado como '+COR[k].n+'. Qual a categoria?';var w=$('tcats');w.innerHTML='';st.cats.forEach(function(c){var bb=document.createElement('button');bb.type='button';bb.textContent=c.n;bb.onclick=function(){i.cat=c.k;aprende(i);save();render();w.hidden=true;$('tmsg').textContent='Pronto: '+COR[k].n+' · '+c.n+'. Da próxima vez faço sozinho.';clearTimeout(tt);tt=setTimeout(function(){t.hidden=true},2500)};w.appendChild(bb)});w.hidden=false;clearTimeout(tt);tt=setTimeout(function(){t.hidden=true},12000);return}
 $('tmsg').textContent='Marcado como '+COR[k].n+(i&&i.cat?' · '+catNome(i.cat):'')+'. Da próxima vez faço sozinho.';clearTimeout(tt);tt=setTimeout(function(){t.hidden=true},2500)};$('tuti').onclick=function(){sc('uti')};$('tdes').onclick=function(){sc('des')}}
b.onclick=function(){(Array.isArray(id)?id:[id]).forEach(remove);if(extra)extra();render();t.hidden=true;clearTimeout(tt)};
t.hidden=false;clearTimeout(tt);tt=setTimeout(function(){t.hidden=true},q?9000:6000)}

