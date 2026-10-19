/* ---------- OCR de foto do comprovante (motor local em ocr/, nada sai do aparelho) ---------- */
function fixDig(x){return String(x).replace(/[Oo]/g,'0').replace(/[Il|]/g,'1').replace(/S/g,'5').replace(/B/g,'8')}
function parseBR(x){x=String(x).replace(/\s/g,'');if(!x)return NaN;if(/^\d{1,3}(\.\d{3})*,\d{2}$/.test(x)||/^\d+,\d{2}$/.test(x))return parseFloat(x.replace(/\./g,'').replace(',','.'));
if(/^\d+\.\d{2}$/.test(x))return parseFloat(x);if(/^\d{1,3}(\.\d{3})+$/.test(x))return parseFloat(x.replace(/\./g,''));if(/^\d+$/.test(x))return parseFloat(x);return NaN}
function limpaOcr(t){t=String(t||'').replace(/\r/g,'\n').replace(/[\u0000-\u0009\u000b-\u001f]/g,' ').slice(0,6000);
t=t.replace(/\bR\s?[$S§5]\s?(?=[\dOoIl|SB])/g,'R$ ');
t=t.replace(/[\dOoIl]{1,2}\s?[\/\-.]\s?[\dOoIl]{1,2}\s?[\/\-.]\s?[\dOoIl]{4}/g,function(m){var f=fixDig(m).replace(/\s/g,'').replace(/[\-.]/g,'/');return /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(f)&&(m.match(/\d/g)||[]).length>=4?f:m});
t=t.replace(/\b[\dOoIl]{2}:[\dOoIl]{2}\b/g,function(m){var f=fixDig(m);return /^\d{2}:\d{2}$/.test(f)?f:m});
return t}
function ocrValores(t){var out=[],seen={},lines=t.split('\n');
lines.forEach(function(ln,k){if(/saldo|limite|tarifa|taxa|\biof\b|desconto|cashback|parcelamento|\d\s*x\s*de\s*R/i.test(ln))return;var re=/R\$\s?([\dOoIlSB.,]+(?:\s\d{3}(?:,\d{2})?)?)/g,m;
while((m=re.exec(ln))){var raw=fixDig(m[1]).replace(/[.,]+$/,''),v=parseBR(raw);if(!(v>=0.01&&v<=1e7))continue;v=Math.round(v*100)/100;var key=String(Math.round(v*100)),ctx=((lines[k-1]||'')+' '+ln).toLowerCase();var lab=/valor|total|quantia|pagamento de|voc[eê] (enviou|recebeu)|pix (enviado|recebido)/.test(ctx);
if(!seen[key])seen[key]={v:v,lab:false,n:0,k:key,c:false};seen[key].n++;if(lab)seen[key].lab=true;if(/,\d{2}$/.test(raw))seen[key].c=true}});
var all=Object.keys(seen).map(function(k){return seen[k]}),lab=all.filter(function(x){return x.lab});
var pick=all.length===1?all:(lab.length===1?lab:null);
return{n:pick?1:all.length,v:pick?pick[0].v:0,c:pick?pick[0].c:false,lista:all.map(function(x){return brl(x.v)}).join(' e ')}}
function ocrDir(t){var n=normT(t),sai=/comprovante\s+de\s+pagamento|nupay\s+(credito|debito)|compra\s+aprovada|pix\s+envi\w+|voce\s+envi\w+|transfer\w*\s+envi\w+|pagamento\s+(realiz|efetu)\w+|pix\s+(realiz|efetu)\w+/.test(n),rec=/pix\s+receb\w+|voce\s+receb\w+|transfer\w*\s+receb\w+|dep\w+\s+receb\w+|valor\s+receb\w+/.test(n);
return sai&&rec?'?':rec?'ent':sai?'sai':''}
function ocrUuid(t){var i=t.search(/id\s+da\s+transa/i);if(i<0)return'';var z=t.slice(i,i+160).replace(/^[^:]*:?/,'').replace(/[\s\n]+/g,''),m=z.match(/[0-9a-z]{8}-[0-9a-z]{4}-[0-9a-z]{4}-[0-9a-z]{4}-[0-9a-z]{12}/i);if(!m)return'';var u=fixDig(m[0]).toLowerCase().replace(/[^0-9a-f-]/g,'');return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(u)?u.toUpperCase():''}
function ocrTxid(t){var c=t.replace(/[ \t]+/g,''),m=c.match(/\b[ED]\d{8}\d{12}[A-Za-z0-9]{11}\b/);if(m)return m[0].toUpperCase();var uu=ocrUuid(t);if(uu)return uu;
m=c.match(/\b[ED][\dOoIlSB]{20}[A-Za-z0-9]{11}\b/);if(m){var q=m[0];q=(q.charAt(0)+fixDig(q.slice(1,21))+q.slice(21)).toUpperCase();if(/^[ED]\d{20}[A-Z0-9]{11}$/.test(q))return q}
var l=t.match(/(?:id\s+da\s+transa[cç][aã]o|c[oó]digo\s+da\s+transa[cç][aã]o|n[uú]mero\s+da\s+transa[cç][aã]o|id\s+pix|autentica[cç][aã]o|protocolo)\s*[:\-]?\s*\n?\s*([A-Za-z0-9][A-Za-z0-9 \n]{9,48})/i);
if(l){var z=l[1].replace(/[\s\n]+/g,'').slice(0,40);if(z.length>=10&&/\d/.test(z))return z.toUpperCase()}return''}
function ocrNome(t,ent){var re=ent?/quem\s+pag\w+|\borigem\b/i:/quem\s+rece\w+|\bdestino\b/i,m=re.exec(t);if(!m)return'';var seg=t.slice(m.index+m[0].length,m.index+m[0].length+240),n=seg.match(/\bnome\b[ \t:\-]*\n?[ \t]*([^\n]{2,60})/i);if(!n)return'';
var d=n[1].replace(/\s+(cpf|cnpj|ag[eê]ncia|banco|conta|institui[cç][aã]o)\b.*$/i,'').replace(/[\d.\-\/*]{6,}.*$/,'').replace(/^[^A-Za-zÀ-ÿ0-9]+/,'').replace(/[^A-Za-zÀ-ÿ0-9]+$/,'').trim().slice(0,50);
if((d.match(/[A-Za-zÀ-ÿ]/g)||[]).length<3||/^(cpf|cnpj|institui|chave|ag[eê]ncia|conta)/i.test(d))return'';return cap1(d)}
function ocrDoc(t,ent){var re=ent?/quem\s+pag\w+|\borigem\b/i:/quem\s+rece\w+|\bdestino\b/i,m=re.exec(t);if(!m)return'';var seg=t.slice(m.index,m.index+300),d=seg.match(/\b(\d{2})[.,]?(\d{3})[.,]?(\d{3})\s?\/?\s?(\d{4})\s?-?\s?(\d{2})\b/);return d?d.slice(1).join(''):''}
function idInfo(tx){var m=/^[ED](\d{8})(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})[A-Za-z0-9]{11}$/.exec(tx||'');if(!m)return null;var y=+m[2],mo=+m[3],dd=+m[4],hh=+m[5],mi=+m[6];if(y<2020||y>2100||mo<1||mo>12||dd<1||dd>31||hh>23||mi>59)return null;
var u=new Date(Date.UTC(y,mo-1,dd,hh,mi));if(isNaN(u.getTime())||u.getUTCDate()!==dd)return null;return{d:u.getFullYear()+'-'+pad(u.getMonth()+1)+'-'+pad(u.getDate()),t:pad(u.getHours())+':'+pad(u.getMinutes()),min:Math.round(u.getTime()/60000)}}
function minDe(d,t){var a=/^(\d{4})-(\d{2})-(\d{2})$/.exec(d||''),b=/^(\d{2}):(\d{2})$/.exec(t||'');if(!a||!b)return null;return Math.round(new Date(+a[1],+a[2]-1,+a[3],+b[1],+b[2]).getTime()/60000)}
function parseOcr(t,t2){var x=limpaOcr(t),r=parseComp(x),av=[],vs=ocrValores(x),conf=false;
var tl=x.match(/hor[aá]rio[^\n\d]{0,15}([01]?\d|2[0-3])\s?[h:]\s?([0-5]\d)\b/i);if(tl)r.t=pad(+tl[1])+':'+tl[2];
else{var cand=[];x.split('\n').forEach(function(l,k){var re=/\b([01]?\d|2[0-3])[h:]([0-5]\d)\b/g,q;while((q=re.exec(l)))cand.push({k:k,t:pad(+q[1])+':'+q[2]})});var c2=cand.filter(function(c){return c.k>1});r.t=c2.length?c2[0].t:cand.length?cand[0].t:''}
if(vs.n===1){r.val=vs.v;if(!vs.c)av.push('Confira os centavos do valor.')}else if(vs.n>1){r.val=0;av.push('Achei mais de um valor ('+vs.lista+'). Digite o certo.')}else if(r.val>0)av.push('Valor lido sem R$. Confira.');else av.push('Não achei o valor.');
if(t2){var v2=ocrValores(limpaOcr(t2));if(vs.n===1&&v2.n===1){if(Math.abs(v2.v-vs.v)<0.004)conf=true;else{r.val=0;av.push('As duas leituras deram valores diferentes ('+brl(vs.v)+' e '+brl(v2.v)+'). Digite o certo.')}}else if(vs.n===1&&v2.n>1&&v2.lista.indexOf(brl(vs.v))<0){r.val=0;av.push('A segunda leitura não confirmou o valor. Digite o certo.')}}
var dir=ocrDir(x),dirOk=false;if(dir==='ent'){r.ent=true;r.tipo='rec';dirOk=true}else if(dir==='sai'){r.ent=false;r.tipo=null;dirOk=true}else av.push(dir==='?'?'O texto fala em enviado e em recebido. Confira o tipo.':'Não deu para saber se foi enviado ou recebido.');
r.txid=ocrTxid(x);var ii=idInfo(r.txid),idOk=false;
if(ii){if(!r.d){r.d=ii.d;r.dId=true}if(!r.t){r.t=ii.t;r.tId=true}
 var mm=minDe(r.d,r.t);if(mm!==null&&!r.dId&&!r.tId){var df=mm-ii.min;if(Math.abs(df)<=3)idOk=true;else av.push('A data e a hora não batem com o ID da transação. Confira.')}else if(r.dId&&r.tId)av.push('Não achei data e hora na foto. Confira.');else if(r.dId||r.tId)av.push('Data ou hora lida só em parte. Confira.')}
else if(/^[0-9A-F]{8}-[0-9A-F]{4}-/.test(r.txid)){if(r.d&&r.t)idOk=true}
else if(r.txid)av.push('ID da transação duvidoso. Confira.');else av.push('Não achei o ID da transação.');
if(!r.d){av.push(/\d{2}\/\d{2}\/\d{4}/.test(x)?'Data inválida: usei hoje.':'Não achei a data: usei hoje.')}
r.desc=dirOk?ocrNome(x,r.ent):'';r.doc=dirOk?ocrDoc(x,r.ent):'';if(!r.desc)av.push('Não achei o nome. Digite a descrição.');
if(r.pay==='Não informada')av.push('Não achei a forma de pagamento.');
r.parc=parcComp(x);r.parcOk=r.parc?parcConfere(x,r.parc,r.val):false;if(r.parc&&r.pay==='Não informada')r.pay='Crédito';r.av=av;r.valOk=!!(r.val>0&&vs.n===1&&(conf||vs.c));r.dirOk=dirOk;r.auto=!!(conf&&dirOk&&idOk&&r.val>0&&r.desc&&r.d&&r.t&&av.length===0&&(!r.parc||r.parcOk));return r}
function normTx(x){return String(x||'').toUpperCase().replace(/[^A-Z0-9]/g,'')}
function hmMin(t){var m=/^(\d{2}):(\d{2})$/.exec(t||'');return m?(+m[1])*60+(+m[2]):null}
function compDup(r){var tx=normTx(r.txid),dd=r.d||hoje(),hit=null,soft=false,rm=hmMin(r.t),p21=/^[ED]\d{20}/.test(tx)?tx.slice(0,21):'';
itemsTodos().concat((st.parcelas||[]).filter(function(p){return p.v2}).map(function(p){return{desc:p.desc,val:p.tot,d:p.d0,t:p.t,txid:p.txid,ent:false}})).forEach(function(i){if(hit)return;var ix=normTx(i.txid);if(tx&&ix&&(ix===tx||(p21&&ix.slice(0,21)===p21))){hit=i;return}
if(!i.ent!==!r.ent)return;if(Math.abs((Number(i.val)||0)-(Number(r.val)||0))>0.004||!(r.val>0))return;if(i.d!==dd)return;
if(r.t&&i.t&&i.t!==r.t){var im=hmMin(i.t);if(!(r.solto&&!ix&&rm!==null&&im!==null&&Math.abs(im-rm)<=180))return}hit=i;soft=true});
if(!hit)return'';return(soft?'Parece já lançado: ':'Este comprovante já foi lançado: ')+(hit.desc||'sem descrição')+', '+dm(hit.d)+(hit.t?' às '+hit.t:'')+'.'}
/* gasto que o app já conhece (mesmo nome ou CNPJ, já classificado): entra sozinho se o valor está seguro e não é repetido */
function compMem(r,fonte){if(st.autoComp===false||!r||r.ent||(r.parc>1&&!r.parcOk)||!r.desc||!(r.val>0)||!r.valOk)return'';if(fonte==='ocr'&&(!r.dirOk||!r.d||(r.av||[]).some(function(x){return !/^(Não achei o ID da transação|ID da transação duvidoso|Não achei a forma de pagamento)/.test(x)})))return'';var g=memRegra(r.desc,r.doc);if(!g||(g.cor!=='uti'&&g.cor!=='des'))return'';
 if(compDup(Object.assign({},r,{d:r.d||hoje(),solto:true})))return'';return g.n||r.desc}
function lancaAuto(r,mem){var ent=!!r.ent,it={id:nid(),d:r.d||hoje(),t:r.t||hora(),desc:r.desc,val:Math.round(r.val*100)/100,pay:r.pay,cor:ent?'rec':'sem',ent:ent,txid:r.txid};if(r.doc)it.doc=r.doc;
if(!ent&&r.parc>1){it.pay='Crédito';if(!r.txid)delete it.txid;var pq=novaParc(it,r.parc);avisoParc(pq,mem?'Lançado sozinho (já conhecido): ':'Compra parcelada lida: ');return}
if(r.txid)it.txid=r.txid;else delete it.txid;addItem(it);var db=ligaDivida(it);render();if(mem){toast('Lançado sozinho (já conhecido): '+it.desc+' · '+brl(it.val)+rotulo(it)+' · '+dm(it.d),it.id,db?function(){dvMarca(db,false);save()}:null,null);return}hint.textContent='Lido pela foto e lançado: '+it.desc+' · '+brl(it.val)+' · '+dm(it.d)+' às '+it.t+(ent?' · Entrada':'')+'. Confira o valor no aviso e desfaça se estiver errado.';
toast((ent?'Entrada: ':'Lançado: ')+it.desc+' · '+brl(it.val)+rotulo(it),it.id,db?function(){dvMarca(db,false);save()}:null,(ent||it.cor!=='sem')?null:it.id)}
function abreComprovante(t,fonte,t2){var r=fonte==='ocr'?parseOcr(t,t2):parseComp(t);
if(fonte==='ocr'&&r.auto&&st.autoComp!==false&&!compDup(Object.assign({},r,{solto:true}))){lancaAuto(r);return}
var mk=compMem(r,fonte);if(mk){r.desc=mk;lancaAuto(r,true);return}
abreNovo(r);COMP={fonte:fonte||'txt',txid:r.txid||'',av:r.av||[],sig:'',doc:r.doc||''};
var msg=r.val>0?'Confira os dados do comprovante e escolha o tipo.':'Não achei o valor. Digite no campo Valor.';
if(fonte==='ocr')msg='Lido por foto: pode haver erros. '+(r.val>0?'Confira tudo e escolha o tipo.':'Digite o valor.')+(r.av.length?' '+r.av.join(' '):'');
var d=compDup(r);if(d)msg+=' Atenção: '+d;$('emsg').textContent=msg}
var ocrP=null;
function carregaOcr(){if(window.Tesseract&&window.Tesseract.createWorker)return Promise.resolve(window.Tesseract);if(ocrP)return ocrP;
ocrP=new Promise(function(ok,er){var e=document.createElement('script');e.src='ocr/tesseract.min.js';e.onload=function(){if(window.Tesseract&&window.Tesseract.createWorker)ok(window.Tesseract);else{ocrP=null;er(new Error('motor'))}};e.onerror=function(){ocrP=null;try{e.remove()}catch(x){}er(new Error('semmotor'))};document.head.appendChild(e)});return ocrP}
function preparaImg(blob,top){return(window.createImageBitmap?createImageBitmap(blob,{imageOrientation:'from-image'}).catch(function(){return createImageBitmap(blob)}):Promise.reject(new Error('img'))).then(function(bm){
var w=bm.width,h=bm.height;if(!(w>0&&h>0)||w*h>60e6){try{bm.close()}catch(x){}throw new Error('tamanho')}var sh=top?Math.max(1,Math.round(h*top)):h,f=w>1400?1400/w:(w<560?Math.min(2,900/w):1),cw=Math.max(1,Math.round(w*f)),ch=Math.max(1,Math.round(sh*f)),cv=document.createElement('canvas');cv.width=cw;cv.height=ch;var cx=cv.getContext('2d');cx.imageSmoothingQuality='high';cx.drawImage(bm,0,0,w,sh,0,0,cw,ch);try{bm.close()}catch(x){}
var im=cx.getImageData(0,0,cw,ch),d=im.data,hist=new Array(256).fill(0),sum=0,n=cw*ch,i,g;for(i=0;i<d.length;i+=4){g=(d[i]*299+d[i+1]*587+d[i+2]*114)/1000|0;d[i]=g;hist[g]++;sum+=g}
var inv=(sum/n)<110;if(inv){var h2=new Array(256).fill(0);for(i=0;i<256;i++)h2[255-i]=hist[i];hist=h2}
var lo=0,hi=255,acc=0;for(i=0;i<256;i++){acc+=hist[i];if(acc>=n*0.02){lo=i;break}}acc=0;for(i=255;i>=0;i--){acc+=hist[i];if(acc>=n*0.02){hi=i;break}}if(hi-lo<30){lo=0;hi=255}var sc=255/(hi-lo);
for(i=0;i<d.length;i+=4){g=d[i];if(inv)g=255-g;g=Math.max(0,Math.min(255,(g-lo)*sc))|0;d[i]=d[i+1]=d[i+2]=g}cx.putImageData(im,0,0);
return new Promise(function(ok,er){cv.toBlob(function(b){cv.width=cv.height=1;b?ok(b):er(new Error('png'))},'image/png')})})}
/* o leitor fica pronto enquanto o app está aberto (sai sozinho depois de 3 min parado) */
var ocrW=null,ocrWT=null;
function ocrWorker(){clearTimeout(ocrWT);if(!ocrW){ocrW=carregaOcr().then(function(T){return T.createWorker('por',1,{workerPath:'ocr/worker.min.js',corePath:'ocr',langPath:'ocr',workerBlobURL:false})}).then(function(w){try{var p=w.setParameters&&w.setParameters({tessedit_do_invert:'0'});if(p&&p.catch)p.catch(function(){})}catch(e){}return w});ocrW.catch(function(){ocrW=null})}return ocrW}
function ocrSolta(){clearTimeout(ocrWT);ocrWT=setTimeout(function(){var p=ocrW;ocrW=null;if(p)p.then(function(w){try{w.terminate()}catch(e){}},function(){})},180000)}
function ocrAquece(){if(!ocrW)ocrWorker().then(ocrSolta,function(){})}
/* lê a foto inteira; a leitura do topo (confirma o valor) vem logo depois, só se for preciso */
function ocrLer(blob){var o={pula:false},wp=ocrWorker(),p1=preparaImg(blob),p2=p1.then(function(){return preparaImg(blob,0.4)}).catch(function(){return null});
o.full=Promise.all([wp,p1]).then(function(a){return a[0].recognize(a[1])}).then(function(r){return String(r&&r.data&&r.data.text||'')});
o.full.catch(function(){ocrW=null});
o.top=o.full.then(function(){if(o.pula)return'';return Promise.all([wp,p2]).then(function(a){if(o.pula||!a[1])return'';return a[0].recognize(a[1]).then(function(r){return String(r&&r.data&&r.data.text||'')})})}).catch(function(){return''});
o.top.then(ocrSolta,ocrSolta);return o}
/* decide: gasto conhecido entra na hora; o resto espera a confirmação do valor */
function ocrAplica(o){return o.full.then(function(full){if(String(full).replace(/\s/g,'').length<12){o.pula=true;compFalha('Não consegui ler a foto. Use um print mais nítido ou digite os dados.');return}
 if(st.autoComp!==false){var r0=parseOcr(full,''),mk=compMem(r0,'ocr');if(mk){o.pula=true;r0.desc=mk;lancaAuto(r0,true);return}}
 hint.textContent='Conferindo o valor...';return o.top.then(function(top){hint.textContent='';abreComprovante(full,'ocr',top)})})}
function ocrErro(e){hint.textContent='';compFalha(e&&e.message==='semmotor'?'O leitor de foto ainda não foi instalado neste app. Digite os dados ou use o PDF.':e&&e.message==='tempo'?'A leitura demorou demais. Tente de novo ou digite os dados.':'Não consegui ler a foto. Digite os dados.')}
function comLimite(p,ms){return Promise.race([p,new Promise(function(_,er){setTimeout(function(){er(new Error('tempo'))},ms)})])}
function ocrArquivo(buf,tipo,o){hint.textContent='Lendo a foto...';if(!o)o=ocrLer(new Blob([buf],{type:tipo||'image/png'}));comLimite(ocrAplica(o),90000).catch(ocrErro)}

