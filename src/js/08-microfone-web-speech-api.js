/* ---------- microfone (Web Speech API) ---------- */
function mkMic(btn,input,hintEl,done){
var SR=window.SpeechRecognition||window.webkitSpeechRecognition;
if(!SR){btn.hidden=true;hintEl.textContent='Sem voz neste navegador. Use o 🎤 do teclado ou digite. '+hintEl.textContent;return}
var rec=null,on=false,erro=false;
btn.onclick=function(){
if(on){try{rec.stop()}catch(e){}return}
rec=new SR();rec.lang='pt-BR';rec.interimResults=true;rec.continuous=false;rec.maxAlternatives=1;erro=false;
rec.onstart=function(){on=true;btn.classList.add('on');btn.setAttribute('aria-label','Parar de ouvir');hintEl.textContent='Ouvindo... fale agora.'};
rec.onresult=function(e){var t='';for(var i=0;i<e.results.length;i++)t+=e.results[i][0].transcript;input.value=t};
rec.onerror=function(e){erro=true;
var m={'not-allowed':'Microfone bloqueado. Libere nas permissões do site.','service-not-allowed':'O microfone está bloqueado. Libere nas permissões do site e tente de novo.','no-speech':'Não ouvi nada. Toque no 🎤 e fale de novo.','audio-capture':'Não encontrei um microfone neste aparelho.','network':'O reconhecimento de voz precisa de internet.'};
hintEl.textContent=m[e.error]||('Não consegui ouvir ('+e.error+'). Tente de novo.')};
rec.onend=function(){on=false;btn.classList.remove('on');btn.setAttribute('aria-label',btn.title);
if(input.value.trim()){input.value=falado(input.value);fmtFrase(input);done()}else if(!erro){hintEl.textContent='Não ouvi nada. Toque no 🎤 e fale de novo.'}};
try{rec.start()}catch(e){on=false;btn.classList.remove('on')}}}
function voz1(){
  fmtFrase(fr);if(!fr.value.trim())return;var raw=' '+falado(fr.value).toLowerCase()+' ',r=parse(fr.value);
  r.tipo=r.ent?'rec':/\b(guardar|guardado|guardada|poupar|poupado|reservar|reservado)\b/.test(raw)?'gua':/\bdesnecess[aá]ri[oa]\b/.test(raw)?'des':/\s[uú]til\s/.test(raw)?'uti':null;
  if(/\bfatura\b/.test(raw)&&r.val>0&&!r.ent){var us0=Math.max(0,r2(somaCred(st)-limAtual()));if(r.val>us0+0.004){hint.textContent=us0>0?'A fatura aberta é de '+brl(us0)+'. Diga um valor até esse.':'Não há fatura aberta.';return}var fid=addFatura(r.val);limpaCampo(fr);render();hint.textContent='Fatura paga: '+brl(r.val)+'. Saiu do Disponível e voltou para o Limite.';toast('Fatura paga: '+brl(r.val),fid);return}
  if(r.tipo==='gua')r.lug=achaLugar(raw);
  var gat=/\b(ganhei|ganho|entrada|recebi|recebido|gastei|gasto|paguei|guardado|guardada|guardar|poupar|poupado|reservar|reservado)\b/.test(raw);
  if(gat&&r.val>0&&(r.pay!=='Não informada'||r.tipo==='gua')){var tp=r.tipo||(r.ent?'rec':'sem'),en=(tp==='rec'),it={id:Date.now(),d:hoje(),t:hora(),desc:r.desc||(en?'Entrada':tp==='gua'?'Guardado':'Gasto'),val:r.val,pay:r.pay,cor:tp,ent:en};
   if(tp==='gua'&&r.lug){it.lug=r.lug;it.desc=tiraLugar(r.desc||'',r.lug)||'Guardado'}
   if(r.parc>1&&tp!=='rec'&&tp!=='gua'){it.pay='Crédito';var pv=novaParc(it,r.parc);limpaCampo(fr);avisoParc(pv);return}var pl=null;addItem(it);var db=ligaDivida(it);limpaCampo(fr);render();var qid=(!en&&it.cor==='sem')?it.id:null;
   hint.textContent='Salvo automaticamente: '+it.desc+' · '+brl(it.val)+' · '+it.pay+' · '+dm(it.d)+' às '+it.t+(en?' · Entrada':rotulo(it))+(db?' · dívida “'+db.nome+'” marcada como paga':'')+(pl?' · mais '+(pl.n-1)+' parcelas agendadas':'')+'.'+(qid?' Escolha Útil ou Desnecessário no aviso.':' Toque no lançamento para editar.');
   toast((en?'Entrada: ':'Lançado: ')+it.desc+' · '+brl(it.val)+rotulo(it)+' · '+it.pay+(db?' · “'+db.nome+'” paga':''),it.id,(db||pl)?function(){if(db)dvMarca(db,false);if(pl)cancelaParc(pl.id);save()}:null,qid);return}
  abreNovo(r)}
mkMic($('mic1'),fr,hint,voz1);
if(!(window.SpeechRecognition||window.webkitSpeechRecognition))$('digita').click();

