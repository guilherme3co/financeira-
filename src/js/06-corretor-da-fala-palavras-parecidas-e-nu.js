/* ---------- corretor da fala: palavras parecidas e números por extenso ---------- */
var VOC={};function vocAdd(c,l){l.forEach(function(w){VOC[normT(w)]=c})}
vocAdd('pix',['pix','pics','piks','picks','pixe','pique','piquis','pixis','pics']);
vocAdd('débito',['debito','debitu','debido','debeto','debitto','debitoo']);
vocAdd('crédito',['credito','creditu','cregito','credido','creditto']);
vocAdd('dinheiro',['dinheiro','dinheiru','dinhero','dinheio','dinheirro']);
vocAdd('boleto',['boleto','boleta','bolleto','bolleta']);
vocAdd('transferência',['transferencia','tranferencia','transferenssia']);
vocAdd('gastei',['gastei','gastou','gastar','gastamos','gastey','gasti']);
vocAdd('gasto',['gasto','gastos']);
vocAdd('paguei',['paguei','pagar','paguey','pagou','pagei']);
vocAdd('recebi',['recebi','recebido','recebida','recebeu','rebebi','recebe','recebii']);
vocAdd('ganhei',['ganhei','ganhou','ganhey','ganhe','ganhi']);
vocAdd('entrada',['entrada','entradas','entrda']);
vocAdd('guardado',['guardei','guardar','guardado','guardada','guardados','guardo','guardey','reservei','reservar','reservado','reservada','poupei','poupar','poupado','separei']);
vocAdd('desnecessário',['desnecessario','desnecessaria','desnecesario','desnessario','desnecessario','desnecessarios']);
vocAdd('útil',['util','uteis']);
var VK=Object.keys(VOC).filter(function(k){return k.length>=5});
function lev(a,b){var m=a.length,n=b.length,d=[],i,j;for(i=0;i<=m;i++){d[i]=[i]}for(j=1;j<=n;j++)d[0][j]=j;
for(i=1;i<=m;i++)for(j=1;j<=n;j++)d[i][j]=Math.min(d[i-1][j]+1,d[i][j-1]+1,d[i-1][j-1]+(a[i-1]===b[j-1]?0:1));return d[m][n]}
function corrige(t){t=String(t).replace(/\bd[eéê]\s+bito\b/gi,'débito').replace(/\bcr[eéê]\s+dito\b/gi,'crédito').replace(/\bpi\s+x\b/gi,'pix');
return t.replace(/[A-Za-zÀ-ÿ]+/g,function(w){var n=normT(w);if(Object.prototype.hasOwnProperty.call(VOC,n))return VOC[n];if(n.length<5)return w;
var best=null,bd=9,lim=n.length>=9?2:1;VK.forEach(function(k){if(Math.abs(k.length-n.length)>lim)return;var d=lev(n,k);if(d<bd){bd=d;best=k}});return best&&bd<=lim?VOC[best]:w})}
var NU={zero:0,um:1,uma:1,dois:2,duas:2,tres:3,quatro:4,cinco:5,seis:6,sete:7,oito:8,nove:9,dez:10,onze:11,doze:12,treze:13,catorze:14,quatorze:14,quinze:15,dezesseis:16,dezessete:17,dezoito:18,dezenove:19,vinte:20,trinta:30,quarenta:40,cinquenta:50,sessenta:60,setenta:70,oitenta:80,noventa:90,cem:100,cento:100,duzentos:200,trezentos:300,quatrocentos:400,quinhentos:500,seiscentos:600,setecentos:700,oitocentos:800,novecentos:900};
function numExt(t){var w=String(t).split(/\s+/),out=[],i=0;
function isN(x){return x!=null&&Object.prototype.hasOwnProperty.call(NU,normT(x))}
while(i<w.length){if(!isN(w[i])&&normT(w[i])!=='mil'){out.push(w[i]);i++;continue}
 var j=i,tot=0,cur=0,k=i;
 while(k<w.length){var n=normT(w[k]);
  if(isN(w[k])){cur+=NU[n];k++}
  else if(n==='mil'){tot+=(cur||1)*1000;cur=0;k++}
  else if(n==='e'&&isN(w[k+1])&&k>i){k++}
  else break}
 var val=tot+cur,nx=normT(w[k]||'');
 if(val>=10||/^(real|reais|centavo|centavos)$/.test(nx)){out.push(String(val))}else{for(var q=i;q<k;q++)out.push(w[q])}
 i=k}
return out.join(' ')}
function falado(t){
t=numExt(corrige(t));
t=t.replace(/(\d+)\s*reais?\s*e\s*(\d{1,2})\s*(?:centavos?)?/gi,function(_,a,b){return a+','+(b.length===1?b+'0':b)});
t=t.replace(/(\d+)\s*v[ií]rgula\s*(\d{1,2})/gi,'$1,$2');
t=t.replace(/(\d+)\s*centavos?/gi,function(_,a){return '0,'+pad(+a)});
return t}
function achaNum(t){var q='('+NUM.source+')',m=t.match(new RegExp('r\\$\\s*'+q+'|'+q+'\\s*(?:reais|real)(?![a-z])','i'));
if(m){var g=m[1]||m[2];return{txt:g,idx:t.indexOf(g,m.index)}}var m2=t.match(NUM);return m2?{txt:m2[0],idx:m2.index}:null}
function fmtFrase(el){var t=falado(el.value),m=achaNum(t);if(!m)return;var v=toVal(m.txt);if(!(v>=0))return;
var i=m.idx,b=t.slice(0,i).replace(/r\$\s*$/i,'');if(b&&!/\s$/.test(b))b+=' ';
var o=b+'R$ '+v.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})+t.slice(i+m.txt.length);if(o!==t)el.value=o}
function parse(t){
var low=falado(t).toLowerCase().trim(),pay='Não informada';
if(/\b(d[eé]bito)\b/.test(low))pay='Débito';
else if(/\b(cr[eé]dito)\b|cart[aã]o de cr[eé]dito/.test(low))pay='Crédito';
else if(/\b(pix)\b/.test(low))pay='Pix';
else if(/dinheiro|esp[eé]cie/.test(low))pay='Dinheiro';
else if(/transfer[eê]ncia|ted\b|doc\b/.test(low))pay='Transferência';
else if(/cart[aã]o/.test(low))pay='Cartão';
else if(/boleto/.test(low))pay='Boleto';
var parc=0,parcPor=false,pmx=low.match(/(^|\s)(?:em\s+|parcelad[oa]\s+(?:em\s+)?)?(\d{1,2}|um|dois|duas|tr[eê]s|quatro|cinco|seis|sete|oito|nove|dez|onze|doze)\s*(?:x|vezes|parcelas?)(?![a-zà-ÿ])(\s+de(?=\s))?/);
if(pmx){var pw0=normT(pmx[2]),pmp={um:1,dois:2,duas:2,tres:3,quatro:4,cinco:5,seis:6,sete:7,oito:8,nove:9,dez:10,onze:11,doze:12},pn=/^\d/.test(pw0)?parseInt(pw0,10):pmp[pw0];if(pn>=2&&pn<=60){parc=pn;parcPor=!!pmx[3];low=low.replace(pmx[0],' ')}}
var m=achaNum(low),v=m?toVal(m.txt):0;
var d=low.replace(/r\$/g,' ').replace(new RegExp(NUM.source,'g'),' ').replace(/(^|\s)(reais|real|pix|d[eé]bito|cr[eé]dito|cart[aã]o|dinheiro|esp[eé]cie|transfer[eê]ncia|ted|doc|boleto|via|por|no|na|em|com|de|do|da|gastei|gasto|paguei|pagar|recebi|recebido|recebida|recebidos|recebidas|recebimento|recebimentos|ganhei|ganho|ganhos|entrada|entradas|receita|receitas|rendimento|rendimentos|vendi|venda|vendas|faturei|guardar|guardado|guardada|guardados|guardadas|poupar|poupado|reservar|reservado|[uú]til|desnecess[aá]rio|desnecess[aá]ria)(?=\s|$)/g,' ').replace(/\s+/g,' ').trim();
d=d.charAt(0).toUpperCase()+d.slice(1);
var forte=/\b(receb\w*|ganh\w*|sal[aá]rio|vendi|faturei)\b/.test(low),fraca=/\b(entrada\w*|renda|receita\w*|rendimento\w*|venda|vendas)\b/.test(low),saida=/\b(gastei|gasto|gastos|paguei|pagar|comprei|compra)\b/.test(low);var ent=forte||(fraca&&!saida);
var tot0=Math.round(v*100)/100;if(parc&&parcPor)tot0=Math.round(v*parc*100)/100;if(parc&&(pay==='Não informada'||pay==='Cartão'))pay='Crédito';if(parc&&pay!=='Crédito')parc=0;
return{desc:d,val:tot0,pay:pay,ent:ent&&!parc,parc:parc}}

