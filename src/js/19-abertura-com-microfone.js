/* ---------- abertura com microfone ---------- */
function tentaMic(){var b=$('mic1');if(!b||b.hidden)return;abreLanc();try{b.click()}catch(e){}setTimeout(function(){if(!b.classList.contains('on'))$('hint').textContent='Toque no microfone e fale.'},1500)}
var micFeito=false;
function aposEntrada(){if(!st)return;
if(PARAMS.share){PARAMS.share=false;vaiPagina(0);usaShare();return}
if(PARAMS.txt){var t=PARAMS.txt;PARAMS.txt='';vaiPagina(0);abreComprovante(t);return}
if(!micFeito&&(PARAMS.mic||st.abreMic)&&st.tut&&st.tut.pg1){micFeito=true;PARAMS.mic=false;vaiPagina(0);tentaMic()}}

