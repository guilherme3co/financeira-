/* ---------- gastos frequentes ---------- */
function atalhos(){var box=$('chips'),mp={},d60=isoAdd(hoje(),-59);
itemsTodos().forEach(function(i){if(!i||i.ent||i.fat||i.ret||(i.cor!=='uti'&&i.cor!=='des')||i.pc||!(i.d>=d60))return;var k=mChave(i.desc)||normT(i.desc);if(!k)return;var o=mp[k]||(mp[k]={n:0,last:i});o.n++;if((i.d+'|'+i.id)>=(o.last.d+'|'+o.last.id))o.last=i});
var arr=Object.keys(mp).map(function(k){return mp[k]}).filter(function(o){return o.n>=2}).sort(function(a,b){return b.n-a.n||b.last.id-a.last.id}).slice(0,6);
box.innerHTML='';$('atalhos').hidden=!arr.length;
arr.forEach(function(o){var l=o.last,b=document.createElement('button');b.type='button';b.className='chip';b.innerHTML='<i class="dot"></i><span></span>';
b.firstChild.style.background='var('+COR[l.cor].v+')';b.lastChild.textContent=(l.cat&&catOk(l.cat)?catIco(l.cat)+' ':'')+l.desc+' · '+brl(l.val);b.setAttribute('aria-label','Lançar de novo: '+l.desc+', '+brl(l.val));
b.onclick=function(){var it={id:nid(),d:hoje(),t:hora(),desc:l.desc,val:l.val,pay:l.pay,cor:l.cor,ent:false};if(l.cat&&catOk(l.cat))it.cat=l.cat;addItem(it);render();toast('Lançado: '+it.desc+' · '+brl(it.val)+rotulo(it)+'. Valor diferente? Toque em Editar.',it.id)};
box.appendChild(b)})}
