/* ---------- fatura ---------- */
$('fatbtn').onclick=function(){var la=limAtual(),us=Math.max(0,r2(somaCred(st)-la));$('fatinfo').textContent='Limite usado: '+brl(us)+'. O valor sai do Disponível e volta ao Limite.';$('fatv').value=us>0?fmt2(us):'';$('fatmsg').textContent='';$('fat').hidden=false;setTimeout(function(){$('fatv').focus()},50)};
$('fatcan').onclick=function(){$('fat').hidden=true};
$('fatok').onclick=function(){var v=lerReais($('fatv').value);if(!(v>0)){$('fatmsg').textContent='Digite um valor, por exemplo 200,00.';return}var us=Math.max(0,r2(somaCred(st)-limAtual()));if(v>us+0.004){$('fatmsg').textContent=us>0?'A fatura aberta é de '+brl(us)+'.':'Não há fatura aberta (limite todo livre).';return}
var id=addFatura(v);$('fat').hidden=true;render();toast('Fatura paga: '+brl(v),id)};
