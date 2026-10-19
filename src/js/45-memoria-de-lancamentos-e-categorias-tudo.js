/* ---------- memória de lançamentos e categorias (tudo no aparelho) ---------- */
var CATS0=[['mer','Mercado'],['ali','Alimentação/Delivery'],['tra','Transporte'],['cas','Contas da casa'],['sau','Saúde'],['laz','Lazer'],['com','Compras'],['out','Outros']];
var SEMENTE=[
 [/\bmercado ?livre\b|\bshopee\b|\bamazon\b|\bmagalu\b|\bmagazine\b|\bshein\b|\baliexpress\b|\broupa|\bcalcad|\btenis\b|\bloja\b|\blojas\b/,'com'],
 [/\bifood\b|\brappi\b|\blanche|\bpizza|\bhamburg|\bburger|\bdelivery\b|\brestaurante|\bacai\b|\bpadaria|\bpastel|\bsorvete|\bcafe\b|\blanchonete|\bmc ?donald|\bbobs\b|\bsalgad|\bespetinho/,'ali'],
 [/\buber\b|\b99 ?(pop|app|taxi)\b|\bcabify\b|\bindrive|\bonibus\b|\bpassagem|\bposto\b|\bcombustivel|\bgasolina|\betanol|\bshell\b|\bipiranga\b|\bestacionamento|\bpedagio|\bmetro\b|\btaxi\b|\bmototaxi/,'tra'],
 [/\bsupermercado|\bmercado|\bmercadinho|\bminimercado|\batacad|\bassai\b|\bcarrefour\b|\bgbarbosa\b|\bhortifruti|\bfeira\b|\bacougue|\bfrigorifico/,'mer'],
 [/\bfarmacia|\bdrogaria|\bdrogasil\b|\bpague menos\b|\bremedio|\bmedic|\bhospital|\bclinica|\bdentista|\bexame|\bconsulta|\blaboratorio/,'sau'],
 [/\bluz\b|\benergia|\benergisa\b|\bagua\b|\bdeso\b|\binternet|\baluguel|\bcondominio|\bgas\b|\bbotijao|\bclaro\b|\bvivo\b|\btim\b|\btelefone|\bconta de/,'cas'],
 [/\bnetflix\b|\bspotify\b|\bdisney|\bprime video|\bcinema|\bbar\b|\bcerveja|\bbebida|\bshow\b|\bjogo|\bfutebol|\bbola\b|\bingresso|\bviagem|\bpraia/,'laz']];
var MSTOP=' ltda me sa eireli epp do da de dos das com br brasil pagamento pagto pix compra no na em o a e cia tecnologia servicos servico comercio comercial ltd inc '.split(' ').join(' ');
function mChave(desc){return normT(desc).replace(/[^a-z0-9 ]/g,' ').split(/\s+/).filter(function(w){return w.length>=2&&!/^\d+$/.test(w)&&MSTOP.indexOf(' '+w+' ')<0}).slice(0,3).join(' ')}
function catSemente(desc){var n=' '+normT(desc).replace(/[^a-z0-9 ]/g,' ')+' ';for(var i=0;i<SEMENTE.length;i++)if(SEMENTE[i][0].test(n))return SEMENTE[i][1];return''}
function catOk(k){return !!k&&(st.cats||[]).some(function(c){return c.k===k})}
var CICO={mer:'🛒',ali:'🍔',tra:'🚗',cas:'🏠',sau:'💊',laz:'🎉',com:'🛍️',out:'📦'};
function catIco(k){return CICO[k]||'🏷️'}
function catNomeP(k){var c=(st.cats||[]).filter(function(x){return x.k===k})[0];return c?c.n:''}
function catNome(k){var n=catNomeP(k);return n?catIco(k)+' '+n:''}
/* palavras genéricas não bastam para reconhecer um lugar (“Loja X” não é “Loja Y”) */
var MGEN=' loja lojas posto auto casa comercial super restaurante bar lanchonete farmacia drogaria padaria mercado mercadinho supermercado distribuidora atacado clinica pagamento transferencia pix compra ';
function memRegra(desc,doc){var R=st.regras||{},ks=Object.keys(R);if(doc){var d=ks.filter(function(k){return R[k].doc===doc})[0];if(d)return R[d]}
 var k=mChave(desc);if(!k)return null;if(R[k])return R[k];var fw=k.split(' ')[0];if(fw.length<3||MGEN.indexOf(' '+fw+' ')>=0)return null;var c=ks.filter(function(x){return x.split(' ')[0]===fw});return c.length===1?R[c[0]]:null}
/* aplica o que o app já aprendeu: devolve true se classificou sozinho */
function aplicaMem(it){if(!it||it.ent||it.cor==='gua'||it.fat)return false;var r=memRegra(it.desc,it.doc),auto=false;
 if(r){if(!it.cat&&catOk(r.cat))it.cat=r.cat;if((it.cor==='sem'||!it.cor)&&(r.cor==='uti'||r.cor==='des')){it.cor=r.cor;auto=true}}
 if(!it.cat){var s=catSemente(it.desc);if(s&&catOk(s))it.cat=s}return auto}
/* aprende com a escolha do usuário */
function aprende(it){if(!it||it.ent||it.cor==='gua'||!it.desc)return;var k=mChave(it.desc);if(!k)return;if(!st.regras)st.regras={};var R=st.regras,r=R[k];
 if(!r){var ks=Object.keys(R);if(ks.length>=300){ks.sort(function(a,b){return(R[a].u||'').localeCompare(R[b].u||'')});delete R[ks[0]]}r=R[k]={n:String(it.desc).slice(0,40),cor:'',cat:'',c:0,doc:'',u:''}}
 if(it.cor==='uti'||it.cor==='des')r.cor=it.cor;if(catOk(it.cat))r.cat=it.cat;if(it.doc)r.doc=it.doc;r.c=Math.min(99999,(r.c||0)+1);r.u=hoje();save()}
function rotulo(it){return it.ent?'':(it.cor&&it.cor!=='sem'?' · '+COR[it.cor].n:'')+(it.cat?' · '+catNome(it.cat):'')}
function limpaMem(o){var cats=[],vis={};(Array.isArray(o.cats)?o.cats:[]).slice(0,20).forEach(function(c){if(!c||!/^[a-z0-9]{1,16}$/.test(c.k)||vis[c.k])return;var n=String(c.n||'').replace(/[\u0000-\u001f]/g,' ').trim().slice(0,24);if(!n)return;vis[c.k]=1;cats.push({k:c.k,n:n})});
 CATS0.forEach(function(c){if(!vis[c[0]]){cats.push({k:c[0],n:c[1]});vis[c[0]]=1}});
 var R={};if(o.regras&&typeof o.regras==='object')Object.keys(o.regras).slice(0,300).forEach(function(k){var r=o.regras[k];if(!r||typeof r!=='object'||!/^[a-z0-9 ]{2,60}$/.test(k))return;
  R[k]={n:String(r.n||k).replace(/[\u0000-\u001f]/g,' ').slice(0,40),cor:(r.cor==='uti'||r.cor==='des')?r.cor:'',cat:vis[r.cat]?r.cat:'',c:Math.max(0,Math.min(99999,parseInt(r.c,10)||0)),doc:/^\d{14}$/.test(r.doc)?r.doc:'',u:/^\d{4}-\d{2}-\d{2}$/.test(r.u)?r.u:''}});
 return{cats:cats,regras:R}}
/* primeira vez: classifica os lançamentos antigos e monta a memória com o que você já fez */
function memInicial(o){var todos=(o.items||[]).slice();(o.arquivo||[]).forEach(function(a){(a.items||[]).forEach(function(i){todos.push(i)})});var vis={};o.cats.forEach(function(c){vis[c.k]=1});
 var g={};todos.forEach(function(i){if(!i||i.ent||i.cor==='gua'||i.fat)return;if(!i.cat){var s=catSemente(i.desc);if(s&&vis[s])i.cat=s}var k=mChave(i.desc);if(!k)return;var x=g[k]||(g[k]={n:String(i.desc).slice(0,40),cors:{},cats:{},c:0,u:''});x.c++;if(i.cor==='uti'||i.cor==='des')x.cors[i.cor]=1;if(i.cat)x.cats[i.cat]=(x.cats[i.cat]||0)+1;if((i.d||'')>x.u)x.u=i.d||''});
 Object.keys(g).forEach(function(k){if(o.regras[k])return;var x=g[k],cs=Object.keys(x.cors),ct=Object.keys(x.cats).sort(function(a,b){return x.cats[b]-x.cats[a]})[0]||'';if(cs.length!==1&&!ct)return;o.regras[k]={n:x.n,cor:cs.length===1?cs[0]:'',cat:ct,c:x.c,doc:'',u:x.u}})}
/* ⚙ memória de lançamentos */
function desenhaMem(){var L=$('memlist');if(!L)return;L.innerHTML='';var R=st.regras||{},ks=Object.keys(R).sort(function(a,b){return(R[b].c||0)-(R[a].c||0)}).slice(0,80);
 if(!ks.length){L.appendChild(el_('p','msg','Ainda vazia. Classifique um lançamento como Útil ou Desnecessário e escolha a categoria: da próxima vez o app faz sozinho.'));return}
 ks.forEach(function(k){var r=R[k],row=el_('div','memrow'),nm_=el_('b',null,r.n),s1=document.createElement('select'),s2=document.createElement('select'),x=el_('button','memx','×');x.type='button';x.setAttribute('aria-label','Esquecer '+r.n);
  [['','Útil ou Desn.?'],['uti','Útil'],['des','Desnecessário']].forEach(function(o){var op=document.createElement('option');op.value=o[0];op.textContent=o[1];s1.appendChild(op)});s1.value=r.cor||'';
  [['','Categoria?']].concat(st.cats.map(function(c){return[c.k,c.n]})).forEach(function(o){var op=document.createElement('option');op.value=o[0];op.textContent=o[1];s2.appendChild(op)});s2.value=r.cat||'';
  s1.onchange=function(){r.cor=this.value;save()};s2.onchange=function(){r.cat=this.value;save()};x.onclick=function(){delete R[k];save();desenhaMem()};
  row.appendChild(nm_);var sw=el_('div','memsel');sw.appendChild(s1);sw.appendChild(s2);row.appendChild(sw);row.appendChild(x);L.appendChild(row)});
 if(Object.keys(R).length>80)L.appendChild(el_('p','msg','Mostrando os 80 mais usados.'))}
function novaCat(nome){nome=String(nome||'').replace(/\s+/g,' ').trim().slice(0,24);if(nome.length<2)return null;var ex=st.cats.filter(function(c){return normT(c.n)===normT(nome)})[0];if(ex)return ex.k;if(st.cats.length>=20)return null;var k='c'+nid().toString(36);st.cats.push({k:k,n:nome});save();return k}
$('catadd').onclick=function(){var k=novaCat($('catn').value),m=$('catmsg');if(!k){m.textContent=st.cats.length>=20?'Limite de 20 categorias.':'Digite um nome com pelo menos 2 letras.';return}$('catn').value='';m.textContent='Categoria criada.';desenhaMem()};
/* campo Categoria na janela de lançamento */
function desenhaCatSel(v){var s=$('ecat');s.innerHTML='';[['','Sem categoria']].concat(st.cats.map(function(c){return[c.k,c.n]})).concat([['__novo','+ Nova categoria...']]).forEach(function(o){var op=document.createElement('option');op.value=o[0];op.textContent=o[1];s.appendChild(op)});s.value=catOk(v)?v:'';$('ecatn').hidden=true;$('ecatn').value=''}
$('ecat').onchange=function(){$('ecatn').hidden=(this.value!=='__novo');if(this.value==='__novo')$('ecatn').focus()};
function lerCat(){var v=$('ecat').value;if(v==='__novo')return novaCat($('ecatn').value)||'';return catOk(v)?v:''}
/* histórico: filtro por categoria */
var histCat='';
function catTotais(items){var t={};items.forEach(function(i){if(i.ent||i.cor==='gua'||i.fat)return;var k=i.cat&&catOk(i.cat)?i.cat:'_';t[k]=r2((t[k]||0)+(Number(i.val)||0))});return t}
function desenhaHistCats(){var w=$('histcats');if(!w)return;w.innerHTML='';var t=catTotais(st.items),ks=Object.keys(t).filter(function(k){return t[k]>0}).sort(function(a,b){return t[b]-t[a]});if(!ks.length){w.hidden=true;return}w.hidden=false;
 if(histCat&&ks.indexOf(histCat)<0)histCat='';
 [['','Todas',null]].concat(ks.map(function(k){return[k,k==='_'?'Sem categoria':catNome(k),t[k]]})).forEach(function(c){var b=el_('button','hcat'+(histCat===c[0]?' sel':''),c[1]+(c[2]!=null?' · '+brl(c[2]):''));b.type='button';b.setAttribute('aria-pressed',histCat===c[0]?'true':'false');b.onclick=function(){histCat=c[0];renderHistorico()};w.appendChild(b)})}
