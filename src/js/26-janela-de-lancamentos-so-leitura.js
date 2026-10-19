/* ---------- janela de lançamentos (só leitura) ---------- */
var lanFoco=null;
function lanKey(e){if(e.key==='Escape'){e.preventDefault();fechaLan()}else if(e.key==='Tab'){var b=$('lanx');e.preventDefault();b.focus()}}
function abreLan(){if(!st)return;var L=$('lanl'),ar=st.items.filter(function(i){return i.ent||i.cor!=='gua'}).concat(faturaView()).sort(function(a,b){return(Number(b.id)||0)-(Number(a.id)||0)});
var en=0,sa=0;ar.forEach(function(i){if(i.ent)en+=i.val;else sa+=i.val});$('lantot').innerHTML='';
var a=el_('span','','Entrou '),ab=el_('b','',brl(r2(en)));a.appendChild(ab);var c=el_('span','','Saiu '),cb=el_('b','',brl(r2(sa)));c.appendChild(cb);$('lantot').appendChild(a);$('lantot').appendChild(c);
L.innerHTML='';if(!ar.length)L.appendChild(el_('p','vazio','Nenhum lançamento ainda. Toque no microfone e fale.'));
ar.forEach(function(i){var K=kor(i),r=el_('div','it'),dot=el_('span','c');dot.style.background='var('+K.v+')';dot.style.cssText+=';width:12px;height:12px;border-radius:50%;flex:none';var t=el_('div','t');t.appendChild(el_('b','',i.desc));t.appendChild(el_('small','',dm(i.d)+(i.t?' · '+i.t:'')+' · '+i.pay+(i.ent?' · entrada':i.fat?' · débito':' · '+K.n)+(i.lug?' · '+i.lug:'')));
var v=el_('div','v',(i.ent?'+ ':'− ')+brl(i.val));r.appendChild(dot);r.appendChild(t);r.appendChild(v);L.appendChild(r)});
lanFoco=document.activeElement;$('lan').hidden=false;document.body.style.overflow='hidden';document.addEventListener('keydown',lanKey,true);setTimeout(function(){try{$('lanx').focus()}catch(e){}},30)}
function fechaLan(mudo){if($('lan').hidden)return;$('lan').hidden=true;$('lanl').innerHTML='';document.body.style.overflow='';document.removeEventListener('keydown',lanKey,true);if(!mudo&&lanFoco&&lanFoco.focus)try{lanFoco.focus()}catch(e){}lanFoco=null}
$('lanx').onclick=function(){fechaLan()};$('lan').onclick=function(e){if(e.target===$('lan'))fechaLan()};
