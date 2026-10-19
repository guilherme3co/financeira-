/* ---------- navegação principal: apenas Principal e Histórico ---------- */
$('t1').onclick=function(){vaiPagina(0)};$('tp').onclick=function(){vaiPagina(1)};$('tk').onclick=function(){vaiPagina(2)};$('t2').onclick=function(){vaiPagina(3)};
var sx=0,sy=0;
var ign=false;
document.addEventListener('touchstart',function(e){sx=e.touches[0].clientX;sy=e.touches[0].clientY;ign=!!(e.target.closest&&e.target.closest('#gaugeCard'))},{passive:true});
document.addEventListener('touchend',function(e){if(true||!st||$('top').hidden||ign||!$('edit').hidden||!$('lanc').hidden||!$('men').hidden||!$('nov').hidden||$('pgc').className.indexOf('on')>=0)return;var dx=e.changedTouches[0].clientX-sx,dy=e.changedTouches[0].clientY-sy;if(Math.abs(dx)<60||Math.abs(dx)<Math.abs(dy)*1.5)return;var k=-1;PGS.forEach(function(id,i){if($(id).className.indexOf('on')>=0)k=i});if(k<0)return;vaiPagina(k+(dx<0?1:-1))},{passive:true});

