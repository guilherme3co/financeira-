/* ---------- velocímetro ---------- */
var TOPO=0;
function ring(saldo,gasto,gua,base){var C=2*Math.PI*80,sw=20,h='<circle cx="100" cy="100" r="80" fill="none" stroke="var(--line)" stroke-width="'+sw+'"/>',g=0,rd=0,gu=0;
if(saldo<0){$('ring').innerHTML=h+'<circle cx="100" cy="100" r="80" fill="none" stroke="var(--neg)" stroke-width="'+sw+'"/>';$('ring').setAttribute('aria-label','Anel todo vermelho: o Disponível está negativo');return}$('ring').setAttribute('aria-label','Anel: verde é o disponível, vermelho os gastos');
if(base>0){g=Math.max(0,saldo)/base;rd=gasto/base;gu=gua/base;var t=g+rd+gu;if(t>1){g/=t;rd/=t;gu/=t}}
var segs=[[g,'--pos'],[gu,'--gua'],[rd,'--neg']].filter(function(x){return x[0]>0.002}),gap=segs.length>1?7:0,off=0;
segs.forEach(function(x){var len=x[0]*C,d=Math.max(len-gap,0.8);h+='<circle cx="100" cy="100" r="80" fill="none" stroke="var('+x[1]+')" stroke-width="'+sw+'" stroke-dasharray="'+d.toFixed(2)+' '+(C-d).toFixed(2)+'" stroke-dashoffset="'+(-off).toFixed(2)+'" transform="rotate(-90 100 100)"/>';off+=len});
$('ring').innerHTML=h}

