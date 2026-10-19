/* ---------- ajustar total guardado ---------- */
$('gnovok').onclick=function(){var m=$('gmsg'),v=lerReais($('gnov').value);if(!(v>=0)){m.textContent='Digite um valor, por exemplo 300,00.';return}
var atual=guaLiq();v=Math.round(v*100)/100;
if(v<atual-0.004){m.textContent='Esse total é menor que o guardado deste mês ('+brl(atual)+'). Edite ou apague os valores da lista.';return}
st.gAnt=Math.round((v-atual)*100)/100;save();render();$('gnov').value='';m.textContent='Total guardado: '+brl(v)+'.'};
$('gnov').onblur=function(){var v=lerReais(this.value);if(v>=0)this.value=fmt2(v)};

