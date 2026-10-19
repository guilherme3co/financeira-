/* ---------- Gastos: campo + gavetas que salvam ---------- */
var hint=$('hint'),fr=$('frase'),ft=null;
function previa(){var r=parse(fr.value);if(!fr.value.trim())return;
if(r.ent){hint.textContent='Entrada identificada: '+(r.desc||'Recebido')+' · '+brl(r.val)+'. Ao falar, será salva automaticamente.';return}
if(/\b(guardar|guardado|guardada|poupar|poupado|reservar|reservado)\b/i.test(falado(fr.value))){hint.textContent='Valor para guardar identificado: '+brl(r.val)+'. Ao falar, será salvo como Guardado.';return}
hint.textContent=(r.val>0)?('Entendi: '+(r.desc||'Gasto')+' · '+brl(r.val)+' · '+r.pay+'. Para salvar uma saída, escolha Útil, Desnecessário ou Guardado.'):'Não entendi o valor. Diga “padaria 12,50” ou “recebi 100”.'}
function salvarCat(k){fmtFrase(fr);var r=parse(fr.value);
if(!fr.value.trim()||!(r.val>0)){hint.textContent='Primeiro diga ou digite o valor, por exemplo “padaria 12,50 pix”.';return}
var entrada=(k==='rec')||r.ent;
var it={id:Date.now(),d:hoje(),t:hora(),desc:r.desc||(entrada?'Entrada':'Gasto'),val:r.val,pay:r.pay,cor:entrada?'rec':k,ent:entrada};addItem(it);if(k==='uti'||k==='des')aprende(it);limpaCampo(fr);
render();hint.textContent=(entrada?'Entrada salva: ':'Salvo: ')+it.desc+' · '+brl(it.val)+' · '+dm(it.d)+(it.t?' às '+it.t:'')+' · '+it.pay+(entrada?' · Entrada':rotulo(it))+'. Campo liberado para o próximo lançamento.';toast((entrada?'Entrada: ':'Lançado: ')+it.desc+' · '+brl(it.val)+rotulo(it),it.id,null,(!entrada&&it.cor==='sem')?it.id:null)}
fr.onkeydown=function(e){if(e.key==='Enter'){e.preventDefault();voz1()}};
$('digok').onclick=function(){voz1()};
$('digita').onclick=function(){$('digbox').hidden=false;fr.focus()};
function gaveta(){}

