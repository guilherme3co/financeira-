/* ---------- comprovante em PDF (o leitor só é carregado quando precisa) ---------- */
var pdfP=null;
function carregaJs(src){return new Promise(function(ok,er){var e=document.createElement('script');e.src=src;e.onload=function(){ok()};e.onerror=function(){try{e.remove()}catch(x){}er(new Error('script'))};document.head.appendChild(e)})}
function carregaPdf(){if(pdfP)return pdfP;pdfP=carregaJs('pdf/pdfw.js').then(function(){return carregaJs('pdf/pdfm.js')}).then(function(){var L=window.pdfjsLib;if(!(L&&L.getDocument))throw new Error('pdf');try{L.GlobalWorkerOptions.workerSrc='pdf.worker.js'}catch(x){}return L}).catch(function(e){pdfP=null;throw e});return pdfP}
function linhasPdf(it){var a=it.filter(function(i){return i.str&&i.str.trim()}).map(function(i){return{s:i.str,x:i.transform[4],y:i.transform[5]}});a.sort(function(p,q){return Math.abs(p.y-q.y)>3?q.y-p.y:p.x-q.x});var out=[],cur=null,ly=null;a.forEach(function(i){if(ly===null||Math.abs(i.y-ly)>3){cur=[];out.push(cur);ly=i.y}cur.push(i.s)});return out.map(function(l){return l.join(' ')}).join('\n')}
function pdfTexto(buf){return carregaPdf().then(function(L){return L.getDocument({data:new Uint8Array(buf),isEvalSupported:false,useWorkerFetch:false,disableFontFace:true,useSystemFonts:false,verbosity:0,disableAutoFetch:true,disableStream:true}).promise}).then(function(doc){var n=Math.min(doc.numPages,3),out=[],p=Promise.resolve();function pag(i){p=p.then(function(){return doc.getPage(i)}).then(function(pg){return pg.getTextContent()}).then(function(tc){out.push(linhasPdf(tc.items))})}
for(var i=1;i<=n;i++)pag(i);return p.then(function(){try{doc.destroy()}catch(e){}return out.join('\n')})})}
function ePdf(buf){var u=new Uint8Array(buf.slice(0,1024)),x='';for(var i=0;i<u.length;i++)x+=String.fromCharCode(u[i]);return x.indexOf('%PDF-')>=0}
function compFalha(m){abreNovo({desc:'',val:0,pay:'Não informada',ent:false,tipo:null,d:'',t:''});$('emsg').textContent=m}
function preArquivo(buf,tipo){if(!buf||!buf.byteLength)return{k:'erro',m:'Arquivo vazio. Digite os dados.'};if(buf.byteLength>8388608)return{k:'erro',m:'Arquivo grande demais. Digite os dados.'};
if(ePdf(buf)){var p=comLimite(pdfTexto(buf),20000);p.catch(function(){});return{k:'pdf',p:p}}
if(/^image\//.test(tipo||'')){var o=ocrLer(new Blob([buf],{type:tipo}));o.full.catch(function(){});return{k:'ocr',o:o,buf:buf,tipo:tipo}}
return{k:'erro',m:'Só leio comprovante em PDF ou foto.'}}
function fazArquivo(j){if(j.k==='erro'){compFalha(j.m);return}
if(j.k==='pdf'){hint.textContent='Lendo o comprovante...';j.p.then(function(tx){hint.textContent='';if(!String(tx).trim()){compFalha('Este PDF não tem texto para ler (parece foto). Digite os dados.');return}abreComprovante(tx)}).catch(function(){hint.textContent='';compFalha('Não consegui ler este PDF. Digite os dados.')});return}
ocrArquivo(j.buf,j.tipo,j.o)}
function leArquivo(buf,tipo){fazArquivo(preArquivo(buf,tipo))}
function lerShare(){if(!window.caches)return Promise.resolve(null);return caches.open('financas-share').then(function(c){return c.match('/__share/meta').then(function(m){if(!m)return null;return m.json().then(function(meta){return c.match('/__share/arq').then(function(a){return(a?a.arrayBuffer().then(function(b){return{buf:b,tipo:a.headers.get('content-type')||''}}):Promise.resolve(null)).then(function(arq){return c.keys().then(function(ks){return Promise.all(ks.map(function(k){return c.delete(k)}))}).then(function(){return(Date.now()-(+meta.t||0)>900000)?null:{meta:meta,arq:arq}})})})})})}).catch(function(){return null})}
/* comprovante compartilhado: a leitura começa assim que o app abre, antes da digital/senha */
var SHP=null;
function preShare(){return lerShare().then(function(sh){if(!sh)return null;return{sh:sh,j:sh.arq?preArquivo(sh.arq.buf,sh.arq.tipo):null}})}
function usaShare(){var p=SHP||preShare();SHP=null;p.then(function(x){if(!x||!st)return;var sh=x.sh;var tx=[sh.meta.title,sh.meta.text,sh.meta.url].filter(function(x){return typeof x==='string'&&x}).join('\n').slice(0,3000);if(x.j){abreLanc();fazArquivo(x.j)}else if(tx)abreComprovante(tx)})}
$('ocrbtn').onclick=function(){$('ocrfile').value='';$('ocrfile').click()};
$('ocrfile').onchange=function(){var f=this.files&&this.files[0];if(!f)return;if(f.size>8388608){compFalha('Foto grande demais. Digite os dados.');return}if(!/^image\//.test(f.type||'')){compFalha('Escolha uma imagem.');return}hint.textContent='Lendo a foto...';f.arrayBuffer().then(function(b){ocrArquivo(b,f.type)}).catch(function(){compFalha('Não consegui abrir a foto.')})};
$('compbtn').onclick=function(){$('compfile').value='';$('compfile').click()};
$('compfile').onchange=function(){var f=this.files&&this.files[0];if(!f)return;if(f.size>8388608){compFalha('Arquivo grande demais. Digite os dados.');return}f.arrayBuffer().then(function(b){leArquivo(b,f.type)}).catch(function(){compFalha('Não consegui abrir o arquivo.')})};

