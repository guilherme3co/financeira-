/* ---------- painel lateral dentro do mesmo velocímetro ---------- */
var gaugeIndex=0;
function initGaugeCarousel(){
  var saved=$('pg3').querySelector('main'),ss=$('itGua'),pl=$('pgp').querySelector('main');
  if(saved){var saveHint=saved.querySelector('.hint');if(saveHint)saveHint.textContent='Para guardar, diga “guardar 50 no Inter”.';var h1=saved.querySelector('h1');if(h1)h1.remove();while(saved.firstChild)ss.appendChild(saved.firstChild)}
  if(pl){while(pl.firstChild)$('itPla').appendChild(pl.firstChild)}$('pgp').style.display='none';
  $('pg3').setAttribute('aria-hidden','true');
  $('pg3').style.display='none';
  setGaugePanel(0);
}
function setGaugePanel(n){
  gaugeIndex=(n+2)%2;
  var slides=document.querySelectorAll('.gauge-slide'),dots=$('gaugeCard').querySelectorAll('.gauge-dots i');
  slides.forEach(function(el,i){el.classList.toggle('active',i===gaugeIndex);el.setAttribute('aria-hidden',i===gaugeIndex?'false':'true')});
  dots.forEach(function(el,i){el.classList.toggle('active',i===gaugeIndex)});
  $('gaugeName').textContent=['Disponível','Guardado'][gaugeIndex];
  $('gPrev').disabled=false;$('gNext').disabled=false;
}
$('gsver').onclick=function(){vaiPagina(1,'gua')};$('gaugeSaved').onclick=function(e){if(e.target.id!=='gsver')vaiPagina(1,'gua')};
$('gPrev').onclick=function(){setGaugePanel(gaugeIndex-1)};
$('gNext').onclick=function(){setGaugePanel(gaugeIndex+1)};
(function(){var sx=0,sy=0,card=$('gaugeCard');card.addEventListener('touchstart',function(e){sx=e.touches[0].clientX;sy=e.touches[0].clientY},{passive:true});card.addEventListener('touchend',function(e){var dx=e.changedTouches[0].clientX-sx,dy=e.changedTouches[0].clientY-sy;if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy)*1.3)setGaugePanel(gaugeIndex+(dx<0?1:-1))},{passive:true});
card.addEventListener('keydown',function(e){if(e.key==='ArrowRight')setGaugePanel(gaugeIndex+1);if(e.key==='ArrowLeft')setGaugePanel(gaugeIndex-1)});})();
