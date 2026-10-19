/* ---------- missões: candidatas e conferência ---------- */
function mCand(){var out=[],L=itemsTodos(),h=hoje(),d30=isoAdd(h,-29),rc=L.filter(function(i){return i.d>=d30&&i.d<=h&&!i.ent});
 var des=rc.filter(function(i){return i.cor==='des'}).reduce(function(a,i){return a+(Number(i.val)||0)},0);
 if(des>=15)out.push({t:'des',alvo:Math.max(10,Math.round(des/4.3*0.7/5)*5)});
 var g={};rc.filter(function(i){return i.cor==='des'}).forEach(function(i){var k=normT(i.desc);if(k.length<3)return;(g[k]=g[k]||{k:k,nome:i.desc,n:0}).n++});
 var top=Object.keys(g).map(function(k){return g[k]}).sort(function(a,b){return b.n-a.n})[0];if(top&&top.n>=3)out.push({t:'top',k:top.k,nome:top.nome.slice(0,40),alvo:Math.floor(top.n/4.3/2)});
 var Z=mZona();out.push({t:'gua',alvo:Math.max(10,Math.round((Z.guar>0?Z.guar:40)/4.3/5)*5)});
 if(st.items.filter(function(i){return !i.ent&&i.cor==='sem'}).length>=3)out.push({t:'sem',alvo:0});return out}
function mTxt(x){return x.t==='des'?'gastar no máximo '+brl(x.alvo)+' em desnecessários':x.t==='top'?(x.alvo===0?'nenhum gasto com “'+x.nome+'”':'no máximo '+x.alvo+(x.alvo===1?' vez':' vezes')+' “'+x.nome+'”'):x.t==='gua'?'guardar pelo menos '+brl(x.alvo):'deixar todos os gastos da semana com categoria (Útil ou Desnecessário)'}
function mAval(x){var fim=isoAdd(x.ini,6),h=hoje(),w=itemsTodos().filter(function(i){return i.d>=x.ini&&i.d<=fim&&!i.ent}),r={fim:h>fim,ok:false,txt:''};
 if(x.t==='des'){var s=r2(w.filter(function(i){return i.cor==='des'}).reduce(function(a,i){return a+i.val},0));r.ok=s<=x.alvo;r.txt='Desnecessários na semana: '+brl(s)+' de '+brl(x.alvo)+'.'+(!r.fim&&!r.ok?' Passou do limite: segure o resto da semana.':'')}
 else if(x.t==='top'){var n=w.filter(function(i){return normT(i.desc)===x.k}).length;r.ok=n<=x.alvo;r.txt='“'+x.nome+'” na semana: '+n+(n===1?' vez':' vezes')+' (limite: '+x.alvo+').'}
 else if(x.t==='gua'){var gs=r2(w.filter(function(i){return i.cor==='gua'&&!i.ret}).reduce(function(a,i){return a+i.val},0));r.ok=gs>=x.alvo;r.txt='Guardado na semana: '+brl(gs)+' de '+brl(x.alvo)+'.'}
 else{var sm=w.filter(function(i){return i.cor==='sem'}).length;r.ok=sm===0;r.txt=sm?'Faltam '+sm+(sm===1?' gasto':' gastos')+' sem categoria. Toque neles no Histórico.':'Todos classificados até agora.'}
 r.ate=dm(fim);return r}
function mFecha(){var M=st.mentor,x=M.mis;if(!x)return;var r=mAval(x);if(!r.fim)return;M.misTot++;if(r.ok){M.misOk++;M.seq++}else M.seq=0;M.mis=null;save();
 mSay(r.ok?'Missão cumprida: '+mTxt(x)+'! 🎉 '+r.txt+(M.seq>1?' Sequência: '+M.seq+' semanas seguidas.':''):'Missão da semana passada não foi cumprida ('+r.txt+') Sem problema: vamos de novo.',r.ok?'ok':'alerta')}
