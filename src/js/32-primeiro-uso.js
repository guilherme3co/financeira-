/* ---------- primeiro uso ---------- */
function mostraSetup(){$('bemv').textContent='Olá, '+((users.filter(function(u){return u.id===uid})[0]||{nome:''}).nome||'');$('ini0').value='';tela('pgs')}
$('ini0ok').onclick=function(){
var v=lerReais($('ini0').value),m=$('ini0msg');
if(!(v>=0)){m.textContent='Digite um valor válido, por exemplo 639,73.';return}
st=migra({start:Math.round(v*100)/100,items:[]});try{localStorage.setItem('financas-visto',VERSAO)}catch(e){}save();entra()};
$('ini0').onkeydown=function(e){if(e.key==='Enter'){e.preventDefault();$('ini0ok').click()}};

