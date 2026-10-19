/* ---------- casal: gastos compartilhados, criptografados de ponta a ponta ---------- */
var QR=(function(){
var EXP=[],LOG=[];(function(){var x=1,i;for(i=0;i<255;i++){EXP[i]=x;LOG[x]=i;x<<=1;if(x&256)x^=0x11d}for(i=255;i<512;i++)EXP[i]=EXP[i-255]})();
function mul(a,b){return a&&b?EXP[LOG[a]+LOG[b]]:0}
function rsGen(n){var g=[1],i,j;for(i=0;i<n;i++){var ng=[];for(j=0;j<=g.length;j++)ng[j]=0;for(j=0;j<g.length;j++){ng[j]^=g[j];ng[j+1]^=mul(g[j],EXP[i])}g=ng}return g}
function rsEnc(data,n){var g=rsGen(n),r=data.slice(),i,j;for(i=0;i<n;i++)r.push(0);for(i=0;i<data.length;i++){var c=r[i];if(c)for(j=0;j<g.length;j++)r[i+j]^=mul(g[j],c)}return r.slice(data.length)}
var T=[null,[7,1,19,0,0],[10,1,34,0,0],[15,1,55,0,0],[20,1,80,0,0],[26,1,108,0,0],[18,2,68,0,0],[20,2,78,0,0],[24,2,97,0,0],[30,2,116,0,0],[18,2,68,2,69],[20,4,81,0,0],[24,2,92,2,93],[26,4,107,0,0],[30,3,115,1,116],[22,5,87,1,88],[24,5,98,1,99],[28,1,107,5,108],[30,5,120,1,121],[28,3,113,4,114],[28,3,107,5,108]];
var AL=[null,[],[6,18],[6,22],[6,26],[6,30],[6,34],[6,22,38],[6,24,42],[6,26,46],[6,28,50],[6,30,54],[6,32,58],[6,34,62],[6,26,46,66],[6,26,48,70],[6,26,50,74],[6,30,54,78],[6,30,56,82],[6,30,58,86],[6,34,62,90]];
function dataCap(v){var t=T[v];return t[1]*t[2]+t[3]*t[4]}
function bch(v,g,nb){var r=v<<nb;var gl=g.toString(2).length;for(var i=r.toString(2).length-gl;i>=0;i--)if((r>>>(i+gl-1))&1)r^=g<<i;return r}
function make(bytes){var v=1;for(;v<=20;v++){var cb=v<10?8:16;if(4+cb+8*bytes.length<=dataCap(v)*8)break}if(v>20)return null;
var bits=[];function put(val,n){for(var i=n-1;i>=0;i--)bits.push((val>>>i)&1)}
put(4,4);put(bytes.length,v<10?8:16);bytes.forEach(function(b){put(b,8)});var cap=dataCap(v)*8;put(0,Math.min(4,cap-bits.length));while(bits.length%8)bits.push(0);
var cw=[];for(var i=0;i<bits.length;i+=8){var x=0;for(var j=0;j<8;j++)x=x*2+bits[i+j];cw.push(x)}
for(var pd=0xEC;cw.length<dataCap(v);pd^=0xEC^0x11)cw.push(pd);
var t=T[v],blocks=[],pos=0,k;for(k=0;k<t[1];k++){blocks.push(cw.slice(pos,pos+t[2]));pos+=t[2]}for(k=0;k<t[3];k++){blocks.push(cw.slice(pos,pos+t[4]));pos+=t[4]}
var ecs=blocks.map(function(b){return rsEnc(b,t[0])}),all=[],mx=Math.max(t[2],t[4]);
for(i=0;i<mx;i++)blocks.forEach(function(b){if(i<b.length)all.push(b[i])});for(i=0;i<t[0];i++)ecs.forEach(function(e){all.push(e[i])});
var N=17+4*v,M=[],F=[],r,c;for(r=0;r<N;r++){M[r]=[];F[r]=[];for(c=0;c<N;c++){M[r][c]=0;F[r][c]=0}}
function setF(r,c,d){M[r][c]=d?1:0;F[r][c]=1}
function finder(r0,c0){for(var dr=-1;dr<=7;dr++)for(var dc=-1;dc<=7;dc++){var rr=r0+dr,cc=c0+dc;if(rr<0||cc<0||rr>=N||cc>=N)continue;var d=Math.max(Math.abs(dr-3),Math.abs(dc-3));setF(rr,cc,d!==2&&d!==4)}}
finder(0,0);finder(0,N-7);finder(N-7,0);
for(i=8;i<N-8;i++){setF(6,i,i%2===0);setF(i,6,i%2===0)}
var a=AL[v];a.forEach(function(ar){a.forEach(function(ac){if((ar===6&&ac===6)||(ar===6&&ac===a[a.length-1])||(ar===a[a.length-1]&&ac===6))return;for(var dr=-2;dr<=2;dr++)for(var dc=-2;dc<=2;dc++)setF(ar+dr,ac+dc,Math.max(Math.abs(dr),Math.abs(dc))!==1)})});
for(i=0;i<9;i++){F[8][i]=1;F[i][8]=1}for(i=0;i<8;i++){F[8][N-1-i]=1;F[N-1-i][8]=1}F[N-8][8]=1;M[N-8][8]=1;
if(v>=7){var vi=(v<<12)|bch(v,0x1F25,12);for(i=0;i<18;i++){var bt=(vi>>>i)&1,aa=N-11+i%3,bb=Math.floor(i/3);setF(bb,aa,bt);setF(aa,bb,bt)}}
var bi=0,up=true;for(c=N-1;c>0;c-=2){if(c===6)c--;for(var s=0;s<N;s++){r=up?N-1-s:s;for(var dx=0;dx<2;dx++){var cc2=c-dx;if(!F[r][cc2]){var by=all[bi>>3];M[r][cc2]=by===undefined?0:(by>>>(7-(bi&7)))&1;bi++}}}up=!up}
var MK=[function(r,c){return(r+c)%2===0},function(r){return r%2===0},function(r,c){return c%3===0},function(r,c){return(r+c)%3===0},function(r,c){return(Math.floor(r/2)+Math.floor(c/3))%2===0},function(r,c){return(r*c)%2+(r*c)%3===0},function(r,c){return((r*c)%2+(r*c)%3)%2===0},function(r,c){return((r+c)%2+(r*c)%3)%2===0}];
var best=null,bs=1e9;
for(var m=0;m<8;m++){var Q=M.map(function(row){return row.slice()});for(r=0;r<N;r++)for(c=0;c<N;c++)if(!F[r][c]&&MK[m](r,c))Q[r][c]^=1;
 var fb=((1<<3)|m);var fm=((fb<<10)|bch(fb,0x537,10))^0x5412;
 function sf(r,c,bit){Q[r][c]=bit}
 for(i=0;i<=5;i++)sf(i,8,(fm>>>i)&1);sf(7,8,(fm>>>6)&1);sf(8,8,(fm>>>7)&1);sf(8,7,(fm>>>8)&1);for(i=9;i<15;i++)sf(8,14-i,(fm>>>i)&1);
 for(i=0;i<8;i++)sf(8,N-1-i,(fm>>>i)&1);for(i=8;i<15;i++)sf(N-15+i,8,(fm>>>i)&1);Q[N-8][8]=1;
 var p=pen(Q,N);if(p<bs){bs=p;best=Q}}
return{n:N,m:best,v:v}}
function pen(Q,N){var p=0,r,c,i;
for(var pass=0;pass<2;pass++){for(r=0;r<N;r++){var run=1;for(c=1;c<N;c++){var cur=pass?Q[c][r]:Q[r][c],prv=pass?Q[c-1][r]:Q[r][c-1];if(cur===prv){run++;if(run===5)p+=3;else if(run>5)p++}else run=1}}}
for(r=0;r<N-1;r++)for(c=0;c<N-1;c++){var x=Q[r][c];if(x===Q[r][c+1]&&x===Q[r+1][c]&&x===Q[r+1][c+1])p+=3}
var P1=[1,0,1,1,1,0,1,0,0,0,0],P2=[0,0,0,0,1,0,1,1,1,0,1];
for(pass=0;pass<2;pass++)for(r=0;r<N;r++)for(c=0;c<=N-11;c++){var a=true,b=true;for(i=0;i<11;i++){var vv=pass?Q[c+i][r]:Q[r][c+i];if(vv!==P1[i])a=false;if(vv!==P2[i])b=false;if(!a&&!b)break}if(a||b)p+=40}
var d=0;for(r=0;r<N;r++)for(c=0;c<N;c++)d+=Q[r][c];var k=Math.ceil(Math.abs(d*20-N*N*10)/(N*N))-1;p+=Math.max(0,k)*10;return p}
return{make:make,cap:function(){return dataCap(20)}}})();
var CAS={cod:'',sala:'',eu:'',key:null,rod:false,ult:'',env:0,cam:null,camOn:false,erro:''},CAS_AB='23456789ABCDEFGHJKLMNPQRSTUVWXYZ',casArm=false;
function casHex(buf){var a=new Uint8Array(buf),s='';for(var i=0;i<a.length;i++)s+=(a[i]<16?'0':'')+a[i].toString(16);return s}
function casNovoCod(){var b=crypto.getRandomValues(new Uint8Array(20)),s='';for(var i=0;i<20;i++)s+=CAS_AB[b[i]&31];return s}
function casLimpaCod(s){s=String(s||'').toUpperCase().replace(/^FCASAL1:/,'').replace(/[\s-]/g,'');return /^[2-9A-HJ-NP-Z]{20}$/.test(s)?s:''}
function casFmt(c){return c.match(/.{4}/g).join('-')}
function casNivOk(n){return n==='det'||n==='tot'||n==='pau'}
function casLimpaPar(o){if(!o||typeof o!=='object')return null;var n=function(x){x=Number(x);return isFinite(x)&&x>=0&&x<1e9?r2(x):0},niv=casNivOk(o.niv)?o.niv:'pau',p={v:1,n:tx(o.n,20),niv:niv,m:tx(o.m,12)};if(niv==='pau')return p;
 p.tot=n(o.tot);var c=(o.cor&&typeof o.cor==='object')?o.cor:{};p.cor={uti:n(c.uti),des:n(c.des),sem:n(c.sem)};
 p.cat=(Array.isArray(o.cat)?o.cat:[]).slice(0,12).filter(Array.isArray).map(function(x){return[tx(x[0],40),n(x[1])]});
 if(niv==='det')p.it=(Array.isArray(o.it)?o.it:[]).slice(0,300).filter(function(i){return i&&typeof i==='object'&&/^\d{4}-\d{2}-\d{2}$/.test(i.d)}).map(function(i){return{d:i.d,t:/^\d{2}:\d{2}$/.test(i.t)?i.t:'',v:n(i.v),ds:tx(i.ds,60),c:(i.c==='uti'||i.c==='des')?i.c:'sem',k:tx(i.k,40),pg:tx(i.pg,30)}});
 return p}
function limpaCasal(c){if(!c||typeof c!=='object'||!/^[2-9A-HJ-NP-Z]{20}$/.test(c.cod)||!/^[a-f0-9]{64}$/.test(c.tok))return undefined;
 var r={cod:c.cod,tok:c.tok,nome:tx(c.nome,20),niv:casNivOk(c.niv)?c.niv:'det',desde:/^\d{4}-\d{2}-\d{2}$/.test(c.desde)?c.desde:hoje(),sync:typeof c.sync==='string'?c.sync.slice(0,30):''};
 if(c.saiu)r.saiu=1;var p=c.par&&casLimpaPar(c.par);if(p){r.par=p;r.parQ=tx(c.parQ,40)}return r}
function casPrep(){var c=st&&st.casal;if(!c)return Promise.reject(new Error('sem'));if(CAS.cod===c.cod&&CAS.key)return Promise.resolve();
 var te=new TextEncoder(),salt=te.encode('financas-casal-v1');
 return crypto.subtle.importKey('raw',te.encode(c.cod),'HKDF',false,['deriveKey','deriveBits']).then(function(k){
  return Promise.all([crypto.subtle.deriveBits({name:'HKDF',hash:'SHA-256',salt:salt,info:te.encode('sala')},k,256),
   crypto.subtle.deriveKey({name:'HKDF',hash:'SHA-256',salt:salt,info:te.encode('chave')},k,{name:'AES-GCM',length:256},false,['encrypt','decrypt']),
   crypto.subtle.digest('SHA-256',te.encode(c.tok))])}).then(function(r){CAS.cod=c.cod;CAS.sala=casHex(r[0]);CAS.key=r[1];CAS.eu=casHex(r[2]);CAS.ult=''})}
function casRpc(fn,args){var body=JSON.stringify(acArgs(fn,args));return fetch(SB_URL+'/rest/v1/rpc/'+fn,{method:'POST',headers:{apikey:SB_KEY,'Content-Type':'application/json',Accept:'application/json'},body:body,cache:'no-store',credentials:'omit',referrerPolicy:'no-referrer',keepalive:body.length<60000}).then(function(r){return r.text().then(function(t){var j=null;try{j=JSON.parse(t)}catch(e){}if(!r.ok)throw new Error((j&&j.message)||('http'+r.status));return j})})}
function casMeus(){return st.items.filter(function(i){return !i.ent&&i.cor!=='gua'&&i.val>0})}
function casResumo(g){var r={tot:0,cor:{uti:0,des:0,sem:0},cat:{}};g.forEach(function(i){r.tot+=i.val;r.cor[(i.cor==='uti'||i.cor==='des')?i.cor:'sem']+=i.val;var k=catNome(i.cat)||(COR[i.cor]||COR.sem).n;r.cat[k]=(r.cat[k]||0)+i.val});
 r.tot=r2(r.tot);Object.keys(r.cor).forEach(function(k){r.cor[k]=r2(r.cor[k])});r.lc=Object.keys(r.cat).map(function(k){return[k,r2(r.cat[k])]}).sort(function(a,b){return b[1]-a[1]}).slice(0,12);return r}
function casPacote(){var c=st.casal,p={v:1,n:c.nome||'',niv:c.niv,m:rotuloMes()};if(c.niv==='pau')return p;var g=casMeus(),r=casResumo(g);p.tot=r.tot;p.cor=r.cor;p.cat=r.lc;
 if(c.niv==='det')p.it=g.slice(-300).map(function(i){return{d:i.d,t:i.t,v:r2(i.val),ds:tx(i.desc,60),c:i.cor,k:catNome(i.cat)||'',pg:tx(i.pay,30)}});return p}
function casSync(forca){var c=st&&st.casal;if(!c||CAS.rod)return Promise.resolve(false);if(!forca&&CAS.env&&Date.now()-CAS.env<60000)return Promise.resolve(false);
 CAS.rod=true;var cod=c.cod;
 return casPrep().then(function(){var js=JSON.stringify(casPacote());if(js===CAS.ult)return;return enc(CAS.key,js).then(function(r){return casRpc('casal_salvar',{p_sala:CAS.sala,p_token:c.tok,p_dados:JSON.stringify({v:1,iv:r.iv,ct:r.ct})})}).then(function(){CAS.ult=js})})
 .then(function(){return casRpc('casal_ler',{p_sala:CAS.sala})}).then(function(rows){if(!st||!st.casal||st.casal.cod!==cod)return;
  var o=(Array.isArray(rows)?rows:[]).filter(function(x){return x&&x.autor!==CAS.eu&&typeof x.dados==='string'})[0];if(!o)return;
  if(!o.dados){if(st.casal.par){delete st.casal.par;st.casal.saiu=1}return}
  var e=null;try{e=JSON.parse(o.dados)}catch(_){}if(!e||typeof e.iv!=='string'||typeof e.ct!=='string')return;
  return dec(CAS.key,e).then(function(t){var p=casLimpaPar(JSON.parse(t));if(p&&st.casal&&st.casal.cod===cod){st.casal.par=p;st.casal.parQ=tx(o.atualizado,40);delete st.casal.saiu}})})
 .then(function(){CAS.rod=false;CAS.erro='';CAS.env=Date.now();if(st&&st.casal&&st.casal.cod===cod){st.casal.sync=new Date().toISOString();save()}casTela();return true},
  function(e){CAS.rod=false;CAS.erro=String(e&&e.message||e);casTela();return false})}
function casTela(){casUI();if(st&&$('pgy').className.indexOf('on')>=0)renderCasal()}
function casQuando(iso){var t=Date.parse(iso);if(!t)return '';var m=Math.round((Date.now()-t)/60000);if(m<1)return 'agora';if(m<60)return 'há '+m+' min';var h=Math.round(m/60);if(h<24)return 'há '+h+' h';var d=new Date(t);return 'em '+pad(d.getDate())+'/'+pad(d.getMonth()+1)}
function casErroTxt(){var e=CAS.erro;if(!e)return '';if(/completo/.test(e))return 'Este código já está ligado a dois celulares. Desfaça e gere um novo.';if(/muitos/.test(e))return 'Muitas atualizações seguidas. Tente em instantes.';return navigator.onLine===false?'Sem internet. Mostrando os últimos dados salvos.':'Não consegui atualizar agora. Mostrando os últimos dados salvos.'}
var CAS_NIVX={det:'Seu par vê cada gasto: valor, dia, local e categoria.',tot:'Seu par vê só o total do mês e por categoria.',pau:'Nada é mostrado até você voltar a compartilhar.'};
function casUI(){if(!st||!$('cason'))return;var c=st.casal;$('casoff').hidden=!!c;$('cason').hidden=!c;
 $('casres').textContent=c?(c.par?'Ligado com '+(c.par.n||'seu par'):'Esperando o outro celular'):'Ver os gastos um do outro';
 $('casmsg').textContent=casErroTxt();if(!c){$('casqr').hidden=true;return}
 if(document.activeElement!==$('casnome'))$('casnome').value=c.nome||'';
 [].forEach.call($('casniv').children,function(b){b.setAttribute('aria-checked',b.getAttribute('data-n')===c.niv?'true':'false')});$('casnivx').textContent=CAS_NIVX[c.niv];
 $('casst').textContent=c.par?'✅ Ligado com '+(c.par.n||'seu par')+(c.sync?' · atualizado '+casQuando(c.sync):''):(c.saiu?'Seu par desfez a ligação.':'⏳ Esperando o outro celular ler o seu QR Code.');
 $('casler2').hidden=!!c.par}
function casDesenhaQR(){var c=st.casal,s='FCASAL1:'+c.cod,bytes=[];for(var i=0;i<s.length;i++)bytes.push(s.charCodeAt(i));var q=QR.make(bytes);if(!q)return;
 var sc=Math.max(4,Math.floor(300/(q.n+8))),px=(q.n+8)*sc,cv=$('qcv'),x=cv.getContext('2d');cv.width=cv.height=px;x.fillStyle='#fff';x.fillRect(0,0,px,px);x.fillStyle='#000';
 for(var r=0;r<q.n;r++)for(var k=0;k<q.n;k++)if(q.m[r][k])x.fillRect((k+4)*sc,(r+4)*sc,sc,sc);$('cascod').textContent=casFmt(c.cod)}
function casCria(){if(st.casal)return;st.casal={cod:casNovoCod(),tok:casHex(crypto.getRandomValues(new Uint8Array(32))),nome:'',niv:'det',desde:hoje(),sync:''};CAS.cod='';save()}
function casMostra(){casCamPara();casCria();casDesenhaQR();$('casqr').hidden=false;casUI();casSync(true)}
function casEntra(t){var cod=casLimpaCod(t),m=$('cascmsg');if(!cod){m.textContent='Código inválido. Confira e tente de novo.';return false}casCamPara();
 if(st.casal&&st.casal.cod===cod){$('casmsg').textContent='Vocês já estão ligados.';return true}
 var nome=st.casal?st.casal.nome:'',niv=st.casal?st.casal.niv:'det';st.casal={cod:cod,tok:casHex(crypto.getRandomValues(new Uint8Array(32))),nome:nome,niv:niv,desde:hoje(),sync:''};CAS.cod='';CAS.key=null;save();
 $('casqr').hidden=true;casUI();$('casok').hidden=false;try{if(navigator.vibrate)navigator.vibrate(60)}catch(e){}casSync(true);return true}
function casJsqr(){if(window.jsQR)return Promise.resolve();return new Promise(function(ok,no){var s=document.createElement('script');s.src='qr/jsqr.js';s.onload=function(){if(window.jsQR)ok();else no()};s.onerror=no;document.head.appendChild(s)})}
function casDetector(){if('BarcodeDetector' in window){try{var d=new BarcodeDetector({formats:['qr_code']});return Promise.resolve(function(v){return d.detect(v).then(function(cs){return cs.length?cs[0].rawValue:''})})}catch(e){}}
 return casJsqr().then(function(){var cv=document.createElement('canvas'),cx=cv.getContext('2d',{willReadFrequently:true});return function(v){var w=v.videoWidth,h=v.videoHeight;if(!w||!h)return Promise.resolve('');var s=Math.min(1,720/Math.max(w,h));w=Math.round(w*s);h=Math.round(h*s);cv.width=w;cv.height=h;cx.drawImage(v,0,0,w,h);var r=window.jsQR(cx.getImageData(0,0,w,h).data,w,h,{inversionAttempts:'dontInvert'});return Promise.resolve(r?r.data:'')}})}
function casLoop(det){if(!CAS.camOn)return;det($('qvid')).then(function(t){if(t&&String(t).indexOf('FCASAL1:')===0&&casEntra(t))return 'fim'},function(){}).then(function(r){if(r!=='fim'&&CAS.camOn)setTimeout(function(){casLoop(det)},200)})}
function casCam(){var m=$('cascmsg');$('casqr').hidden=true;$('casok').hidden=true;$('cascam').hidden=false;$('qcode').value='';
 if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia){m.textContent='Este navegador não abre a câmera. Digite o código abaixo.';return}
 if(CAS.camOn)return;m.textContent='Abrindo a câmera...';
 navigator.mediaDevices.getUserMedia({video:{facingMode:'environment'},audio:false}).then(function(s){if($('cascam').hidden){s.getTracks().forEach(function(t){t.stop()});return null}
  CAS.cam=s;CAS.camOn=true;var v=$('qvid');v.setAttribute('playsinline','');v.muted=true;v.srcObject=s;v.hidden=false;var pl=v.play();if(pl&&pl.catch)pl.catch(function(){});m.textContent='Aponte para o QR Code do outro celular.';return casDetector()},function(){throw 'cam'})
 .then(function(det){if(det&&CAS.camOn)casLoop(det)},function(e){m.textContent=e==='cam'?'Não consegui abrir a câmera. Libere a permissão ou digite o código abaixo.':'Não consegui ler pela câmera aqui. Digite o código abaixo.'})}
function casCamPara(){CAS.camOn=false;if(CAS.cam){CAS.cam.getTracks().forEach(function(t){t.stop()});CAS.cam=null}var v=$('qvid');if(v){try{v.srcObject=null}catch(e){}v.hidden=true}var b=$('cascam');if(b)b.hidden=true}
$('casmos').onclick=casMostra;$('casmos2').onclick=casMostra;$('casler').onclick=casCam;$('casler2').onclick=casCam;
$('casqx').onclick=function(){$('casqr').hidden=true};$('cascx').onclick=casCamPara;
$('casdig').onclick=function(){var t=$('qcode').value;if(!t.trim()){$('cascmsg').textContent='Digite o código que aparece no outro celular.';return}casEntra(t)};
$('qcode').onkeydown=function(e){if(e.key==='Enter'){e.preventDefault();$('casdig').click()}};
$('casnome').onchange=function(){if(!st||!st.casal)return;st.casal.nome=tx(this.value.trim(),20);save();casSync(true)};
$('casniv').onclick=function(e){var b=e.target.closest('button');if(!b||!st||!st.casal)return;st.casal.niv=b.getAttribute('data-n');save();casUI();casSync(true)};
$('casver').onclick=function(){vaiPagina(5)};
$('cassai').onclick=function(){var b=this;if(!st||!st.casal)return;if(!casArm){casArm=true;b.textContent='Toque de novo para desfazer';setTimeout(function(){casArm=false;b.textContent='Desfazer casal'},4000);return}
 casArm=false;b.textContent='Desfazer casal';b.disabled=true;var c=st.casal;casPrep().then(function(){return casRpc('casal_salvar',{p_sala:CAS.sala,p_token:c.tok,p_dados:''})}).catch(function(){}).then(function(){b.disabled=false;if(st){delete st.casal;save()}CAS.cod='';CAS.key=null;CAS.ult='';CAS.erro='';casCamPara();$('casok').hidden=true;casUI();$('casmsg').textContent='Ligação desfeita. Nada mais é compartilhado.'})};
$('cfgcas').addEventListener('toggle',function(){if(this.open)casUI();else casCamPara()});
document.addEventListener('visibilitychange',function(){if(!st||!st.casal)return;if(document.hidden){casCamPara();casSync(true)}else casSync(false)});
function renderCasal(){var B=$('cyBox');if(!B||!st)return;B.innerHTML='';var c=st.casal;
 if(!c){var k0=iCard('Casal','👫');k0.appendChild(el_('p','imsg','Vejam os gastos um do outro. Cada um escolhe o que mostra. Vai tudo criptografado: nem o servidor consegue ler.'));var b0=el_('button','add pri','Ligar com meu par (QR Code)');b0.type='button';b0.onclick=function(){abreCfg(false,'cfgcas')};k0.appendChild(b0);B.appendChild(k0);return}
 var P=c.par,nm=(P&&P.n)||'Seu par',eu=casResumo(casMeus());
 var tp=el_('div','cytop');tp.appendChild(el_('small',null,CAS.rod?'Atualizando...':c.sync?'Atualizado '+casQuando(c.sync):'Ainda não atualizou'));var rb=el_('button','linkb','🔄 Atualizar');rb.type='button';rb.disabled=CAS.rod;rb.onclick=function(){casSync(true);renderCasal()};tp.appendChild(rb);B.appendChild(tp);
 var et=casErroTxt();if(et)B.appendChild(el_('p','idica al',et));
 if(!P){var k1=iCard(c.saiu?'Ligação desfeita':'Esperando seu par','⏳');k1.appendChild(el_('p','imsg',c.saiu?'Seu par desfez a ligação. Para ligar de novo, desfaça aqui e leiam um QR Code novo.':'O outro celular ainda não leu o seu QR Code. No celular dele(a): ⚙ → Casal → Ler QR Code.'));var b1=el_('button','add','Abrir Casal em ⚙');b1.type='button';b1.onclick=function(){abreCfg(false,'cfgcas')};k1.appendChild(b1);B.appendChild(k1);return}
 if(P.niv==='pau'){var kp=iCard(nm,'⏸️');kp.appendChild(el_('p','imsg',nm+' pausou o compartilhamento. Você continua mostrando o que escolheu em ⚙ → Casal.'));B.appendChild(kp);return}
 var k2=iCard('Gastos do mês','👫');
 var tb=rTab(['','Você',nm],[['Útil',{t:brl(eu.cor.uti),n:1},{t:brl(P.cor.uti),n:1}],['Desnecessário',{t:brl(eu.cor.des),n:1},{t:brl(P.cor.des),n:1}],['Sem categoria',{t:brl(eu.cor.sem),n:1},{t:brl(P.cor.sem),n:1}],['Total',{t:brl(eu.tot),n:1},{t:brl(P.tot),n:1}]]);tb.classList.add('itab');k2.appendChild(tb);
 iLinha(k2,'Juntos no mês',brl(r2(eu.tot+P.tot)),'cyjun');var mx=Math.max(eu.tot,P.tot);if(mx>0){var br=el_('div','cybar');var a=el_('i','cyeu');a.style.width=Math.round(eu.tot/(eu.tot+P.tot||1)*100)+'%';br.appendChild(a);k2.appendChild(br);var lg=el_('div','cyleg');lg.appendChild(el_('span','cyeu','Você'));lg.appendChild(el_('span','cyela',nm));k2.appendChild(lg)}
 if(P.m&&P.m!==rotuloMes())k2.appendChild(el_('p','imsg','Os dados de '+nm+' são de '+P.m+'.'));B.appendChild(k2);
 if(P.cat&&P.cat.length){var k3=iCard('Onde '+nm+' gastou','📊');P.cat.forEach(function(x){iLinha(k3,x[0],brl(x[1]))});B.appendChild(k3)}
 if(P.niv!=='det'){B.appendChild(el_('p','imsg',nm+' mostra só os totais.'));return}
 var k4=iCard('Gastos de '+nm,'🧾'),L=(P.it||[]).slice().sort(function(x,y){return(y.d+y.t).localeCompare(x.d+x.t)});
 if(!L.length)k4.appendChild(el_('p','imsg','Nenhum gasto neste mês ainda.'));
 var mostra=Math.min(L.length,CAS.todos?300:40),dia='';
 for(var i=0;i<mostra;i++){var it=L[i];if(it.d!==dia){dia=it.d;k4.appendChild(el_('b',null,dm(it.d)))}var r=el_('div','irow cyit'),s=el_('span');var dt=el_('i','cyd');dt.style.background='var(--'+it.c+')';s.appendChild(dt);s.appendChild(document.createTextNode(it.ds||'Gasto'));var sub=[it.t,it.k,it.pg].filter(Boolean).join(' · ');if(sub)s.appendChild(el_('small',null,' · '+sub));r.appendChild(s);r.appendChild(el_('b',null,brl(it.v)));k4.appendChild(r)}
 if(L.length>mostra){var bm=el_('button','add','Ver todos ('+L.length+')');bm.type='button';bm.onclick=function(){CAS.todos=true;renderCasal()};k4.appendChild(bm)}
 B.appendChild(k4)}
