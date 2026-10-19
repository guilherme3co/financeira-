/* ---------- mentor financeiro (robozinho) — roda só no aparelho, nada é enviado ---------- */
var MEN={esp:null};
function limpaMentor(m){m=(m&&typeof m==='object')?m:{};
var n=function(v,a,b,d){v=Number(v);return(isFinite(v)&&v>=a&&v<=b)?v:d},ym=function(s){return /^\d{4}-\d{2}$/.test(s)?s:''},ymd=function(s){return /^\d{4}-\d{2}-\d{2}$/.test(s)?s:''};
var info={};if(m.info&&typeof m.info==='object')Object.keys(m.info).slice(0,120).forEach(function(k){var x=m.info[k];if(!x||typeof x!=='object'||!/^\d{1,17}(\.\d{1,20})?$/.test(k))return;info[k]={j:n(x.j,-1,50,-1),sd:n(x.sd,0,1e9,0),atr:!!x.atr,fixa:!!x.fixa,base:ym(x.base)}});
var p=(m.plano&&typeof m.plano==='object')?m.plano:null,mi=(m.mis&&typeof m.mis==='object')?m.mis:null;
return{et:Math.round(n(m.et,0,4,0)),diag:!!m.diag,sal2:n(m.sal2,0,1e9,0),ess:n(m.ess,0,1e9,0),res:n(m.res,0,1e9,0),info:info,
plano:p?{extra:n(p.extra,0,1e9,0),est:p.est==='aval'?'aval':'neve',ini:ym(p.ini)||mesAt(),meses:Math.round(n(p.meses,0,600,0))}:null,
mis:(mi&&['des','gua','top','sem'].indexOf(mi.t)>=0&&ymd(mi.ini))?{t:mi.t,alvo:n(mi.alvo,0,1e9,0),k:String(mi.k||'').slice(0,60),nome:String(mi.nome||'').slice(0,60),ini:ymd(mi.ini)}:null,
resVisto:ymd(m.resVisto),dd:ymd(m.dd),novos:(function(o){var r={};if(o&&typeof o==='object')['dia','div','gua','mais','mis','evo','sols','ren'].forEach(function(k){if(o[k])r[k]=1});return r})(m.novos),
sols:(Array.isArray(m.sols)?m.sols:[]).filter(function(x){return x&&ymd(x.d)&&typeof x.t==='string'}).slice(0,15).map(function(x){return{d:x.d,t:x.t.slice(0,500)}}),misOk:Math.round(n(m.misOk,0,1e5,0)),misTot:Math.round(n(m.misTot,0,1e5,0)),seq:Math.round(n(m.seq,0,1e5,0)),
hist:(Array.isArray(m.hist)?m.hist:[]).filter(function(h){return h&&ym(h.m)}).slice(-24).map(function(h){return{m:h.m,div:n(h.div,0,1e10,0),gua:n(h.gua,-1e10,1e10,0)}})}}
function mI(id){var M=st.mentor,k=String(id);if(!M.info[k])M.info[k]={j:-1,sd:0,atr:false,fixa:false,base:mesAt()};return M.info[k]}
function pctTxt(x){return(Math.round(x*1000)/10).toFixed(1).replace('.',',').replace(',0','')+'%'}
/* dívidas que acabam (parceladas + dívidas com saldo informado) */
function mDiv(){var M=st.mentor,out=[];(st.dividas||[]).forEach(function(d){var I=M.info[String(d.id)]||{j:-1,sd:0};
 if(ehPar(d)){if(!dvAtivo(d))return;var r=dvRest(d);if(r<=0.004)return;out.push({id:d.id,nome:d.nome,rest:r,parc:parcBase(d),jo:I.j>0?I.j/100:0,jr:I.j,par:true,atr:!!I.atr})}
 else if(I.sd>0&&!I.fixa){var k=Math.max(0,Math.min(120,I.base?mMesesDe(I.base,mesAt()):0)),r=I.sd,jj=I.j>0?I.j/100:0,pv=Number(d.valor)||0;for(var q=0;q<k&&r>0;q++)r=Math.max(0,r*(1+jj)-pv);r=r2(r);if(r>0.004)out.push({id:d.id,nome:d.nome,rest:r,parc:pv,jo:jj,jr:I.j,par:false,atr:!!I.atr,est:k>0})}});return out}
/* simulação mês a mês: juros só nas dívidas com saldo (parcelas fixas já têm juros embutidos) */
function mSim(ds,extra,est,maxM){maxM=maxM||360;var a=ds.map(function(x){return{nome:x.nome,rest:x.rest,parc:x.parc,j:x.par?0:x.jo,jo:x.jo,fim:0}}),m=0,jur=0,hist=[];
function tot(){return a.reduce(function(s,x){return s+x.rest},0)}hist.push(r2(tot()));
while(tot()>0.01&&m<maxM){m++;var pool=extra||0;
 a.forEach(function(x){if(x.rest<=0.004){pool+=x.parc;return}var ju=x.rest*x.j;jur+=ju;x.rest+=ju;var p=Math.min(x.parc,x.rest);x.rest-=p;if(x.rest<=0.004){x.rest=0;x.fim=m;pool+=x.parc-p}});
 a.filter(function(x){return x.rest>0.004}).sort(est==='aval'?function(p,q){return(q.jo-p.jo)||(p.rest-q.rest)}:function(p,q){return p.rest-q.rest}).forEach(function(x){if(pool<=0.004)return;var p=Math.min(pool,x.rest);x.rest-=p;pool-=p;if(x.rest<=0.004){x.rest=0;x.fim=m}});
 hist.push(r2(tot()))}
return{meses:m,nunca:tot()>0.01,ds:a,hist:hist,jur:r2(jur)}}
function mZona(){var M=st.mentor,renda=r2((st.salario||0)+M.sal2),dv=(st.dividas||[]).filter(dvAtivo),mens=r2(dv.reduce(function(a,d){return a+dvValor(d)},0)),ds=mDiv(),tot=r2(ds.reduce(function(a,x){return a+x.rest},0)),
 atr=ds.filter(function(x){return x.atr}).length,caro=ds.filter(function(x){return x.jo>=0.06}).sort(function(a,b){return b.jo-a.jo}),pct=renda>0?mens/renda:null,sobra=r2(renda-mens),guar=sobra>0?r2(sobra*faixa(sobra)):0,livre=r2(Math.max(0,sobra-guar)),des=r2(mediaCampo(function(t){return t.des})||0);
 var z=(atr||(pct||0)>0.5||sobra<=0)?{n:'Zona vermelha',t:'Endividamento alto',c:'--neg'}:((pct||0)>0.3||caro.length)?{n:'Zona amarela',t:'Atenção',c:'--mid'}:{n:'Zona verde',t:'Sob controle',c:'--pos'};
 return{renda:renda,mens:mens,pct:pct,tot:tot,atr:atr,caro:caro,sobra:sobra,guar:guar,livre:livre,des:des,gua:guardadoTotal(),ess:M.ess,ds:ds,z:z}}
function mExtra(Z){var P=st.mentor.plano;return P?P.extra:r2(Z.livre/2)}
function mEst(Z){var P=st.mentor.plano;return P?P.est:(Z.ds.some(function(x){return x.jo>0})?'aval':'neve')}
function mOff(){return(st.dividas||[]).some(function(d){return dvAtivo(d)&&ehPar(d)&&!dvPago(d)})?0:1}
function mQuando(R){return R.nunca?'nunca (o pagamento não cobre os juros)':R.meses+(R.meses===1?' mês':' meses')+' ('+mesDepois(R.meses-1+mOff())+')'}
