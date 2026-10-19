/* ---------- comprovante compartilhado (texto) ---------- */
function secNome(t,tit){var i=t.toLowerCase().indexOf(tit);if(i<0)return'';var m=t.slice(i,i+220).match(/\bnome\s*[:\-]?\s*([^\n\r]{2,60})/i);return m?m[1]:''}
/* data com mês abreviado (Nubank: “17 OUT. 2026”) */
var MABR={jan:1,fev:2,mar:3,abr:4,mai:5,jun:6,jul:7,ago:8,set:9,out:10,nov:11,dez:12};
function mesExt(t){var m=String(t).match(/\b(\d{1,2})\s+(jan|fev|mar|abr|mai|jun|jul|ago|set|out|nov|dez)[a-zç]*\.?\s+(?:de\s+)?(\d{4})\b/i);return m?[m[0],pad(+m[1]),pad(MABR[m[2].toLowerCase()]),m[3]]:null}
function parcComp(t){var m=String(t).match(/\b(\d{1,2})\s*x\s*de\s*R\$/i);var n=m?parseInt(m[1],10):1;return n>1&&n<=60?n:0}
/* o valor da parcela vezes o número de parcelas tem de bater com o total (senão há juros ou leitura duvidosa) */
function parcConfere(t,n,tot){if(!(n>1)||!(tot>0))return false;var m=String(t).match(/\b\d{1,2}\s*x\s*de\s*R\$\s*([\dOoIlSB.,]+)/i);if(!m)return false;var pv=parseBR(fixDig(m[1]).replace(/[.,]+$/,''));return pv>0&&Math.abs(pv*n-tot)<=0.01*n+0.01}
/* primeira letra maiúscula, sem estragar nomes como “iFood” */
function cap1(d){d=String(d||'');return /^[a-zà-ÿ][A-Z]/.test(d)?d:d.charAt(0).toUpperCase()+d.slice(1)}
function parseComp(t){t=String(t||'').replace(/[\u0000-\u0009\u000b-\u001f]/g,' ').slice(0,4000);var low=t.toLowerCase(),mv=t.replace(/\d{1,2}\s*x\s*de\s*R\$\s*[\d.,]+/gi,' ').match(/R\$\s*(\d{1,3}(?:\.\d{3})+(?:,\d{2})?|\d+(?:,\d{2})?)/i),v=mv?toVal(mv[1]):0;
if(!(v>0)){var a=achaNum(low);v=a?toVal(a.txt):0}
var pay='Não informada';if(/\bpix\b/.test(low))pay='Pix';else if(/cr[eé]dito/.test(low))pay='Crédito';else if(/d[eé]bito/.test(low))pay='Débito';else if(/boleto/.test(low))pay='Boleto';else if(/transfer[eê]ncia|\bted\b|\bdoc\b/.test(low))pay='Transferência';
var ent=/voc[eê] recebeu|pix recebido|recebido de|dep[oó]sito recebido|transfer[eê]ncia recebida/.test(low);
var desc=secNome(t,ent?'quem pagou':'quem recebeu')||secNome(t,ent?'origem':'destino')||secNome(t,ent?'remetente':'favorecido')||secNome(t,'destinat');
if(!desc){var mm=t.match(/(?:\bpara\b|destinat[aá]rio|favorecido|recebedor|estabelecimento|\blocal\b|\bloja\b|compra\s+(?:aprovada\s+)?(?:em|no|na))\s*[:\-]?\s*\n?\s*([^\n\r]{2,60})/i);desc=mm?mm[1]:''}
desc=desc.replace(/\s+(cpf|cnpj|ag[eê]ncia|banco|conta|institui[cç][aã]o)\b.*$/i,'').replace(/[\d.\-\/]{8,}.*$/,'').trim().slice(0,50);
var md=t.match(/(\d{2})\/(\d{2})\/(\d{4})/),dt='',hh=t.match(/\b([01]\d|2[0-3]):([0-5]\d)\b/),hm=hh?hh[0]:'';if(!md)md=mesExt(t);
if(!hm){var h2=t.match(/\b([01]?\d|2[0-3])h([0-5]\d)\b/i);if(h2)hm=pad(+h2[1])+':'+h2[2]}
if(md){var y=+md[3],mo=+md[2],dd=+md[1];if(y>=2000&&y<=2100&&mo>=1&&mo<=12&&dd>=1&&dd<=31&&new Date(y,mo-1,dd).getDate()===dd){dt=y+'-'+pad(mo)+'-'+pad(dd);if(dt>hoje())dt=''}}
if(desc)desc=cap1(desc);
var pc=parcComp(t);if(pc&&!ent&&pay==='Não informada')pay='Crédito';
return{desc:desc,val:r2(v),pay:pay,ent:ent,tipo:ent?'rec':null,d:dt,t:hm,valOk:!!mv&&v>0,parc:pc,parcOk:pc?parcConfere(t,pc,r2(v)):false}}
