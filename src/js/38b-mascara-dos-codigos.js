/* ---------- formato automático dos códigos (convite, recuperação, administrador, casal) ---------- */
var MSK_OK=/[2-9A-HJ-NP-Z]/;
function mascara(inp,pref,grupos){if(!inp)return;var tot=grupos.reduce(function(a,b){return a+b},0),ini=pref?pref+'-':'',dica=document.createElement('small');dica.className='mskh';dica.setAttribute('aria-live','polite');inp.insertAdjacentElement('afterend',dica);
 inp.setAttribute('autocapitalize','characters');inp.setAttribute('autocorrect','off');inp.setAttribute('spellcheck','false');
 function forma(){var v=String(inp.value||'').toUpperCase();if(ini&&v.indexOf(ini)===0)v=v.slice(ini.length);var s=v.replace(/[^A-Z0-9]/g,'');if(pref&&s.length>tot&&s.indexOf(pref)===0)s=s.slice(pref.length);
  var c='';for(var i=0;i<s.length&&c.length<tot;i++)if(MSK_OK.test(s[i]))c+=s[i];
  var out=ini,k=0;grupos.forEach(function(g,gi){if(k>=c.length)return;if(gi>0)out+='-';out+=c.slice(k,k+g);k+=g});
  if(!c.length&&document.activeElement!==inp)out='';
  if(inp.value!==out){inp.value=out;try{inp.setSelectionRange(out.length,out.length)}catch(e){}}
  var falta=tot-c.length;inp.classList.toggle('mskok',falta===0);dica.textContent=c.length&&falta>0?'Faltam '+falta+(falta===1?' caractere':' caracteres'):falta===0?'✓ Código completo':''}
 inp.addEventListener('input',forma);inp.addEventListener('focus',function(){if(!inp.value&&ini){inp.value=ini;try{inp.setSelectionRange(ini.length,ini.length)}catch(e){}}});inp.addEventListener('blur',function(){if(inp.value===ini)inp.value='';forma()});
 inp.addEventListener('keydown',function(e){if(ini&&e.key==='Backspace'&&inp.selectionStart<=ini.length&&inp.selectionEnd<=ini.length)e.preventDefault()});
 var d=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value');try{Object.defineProperty(inp,'value',{configurable:true,get:function(){return d.get.call(inp)},set:function(x){d.set.call(inp,x);setTimeout(function(){if(d.get.call(inp)===x&&x)forma();else if(!x){inp.classList.remove('mskok');dica.textContent=''}},0)}})}catch(e){}}
mascara($('ucod'),'FIN',[4,4]);mascara($('acsc'),'FIN',[4,4]);mascara($('rcod'),'REC',[4,4,4,4]);mascara($('admac'),'ADM',[4,4,4]);mascara($('qcode'),'',[4,4,4,4,4]);
