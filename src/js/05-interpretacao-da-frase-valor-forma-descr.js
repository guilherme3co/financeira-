/* ---------- interpretação da frase (valor, forma, descrição) ---------- */
var NUM=/\d{1,3}(?:\.\d{3})+(?:,\d{1,2})?|\d+(?:[.,]\d{1,2})?/;
function toVal(k){return parseFloat(/^\d{1,3}(?:\.\d{3})+(?:,\d+)?$/.test(k)?k.replace(/\./g,'').replace(',','.'):k.replace(',','.'))}

