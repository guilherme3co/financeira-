/* ---------- evolução ---------- */
function mHist(){var M=st.mentor,ds=mDiv(),div=r2(ds.reduce(function(a,x){return a+x.rest},0)),m=mesAt(),h=M.hist,u=h[h.length-1];if(u&&u.m===m){u.div=div;u.gua=guardadoTotal()}else h.push({m:m,div:div,gua:guardadoTotal()});if(h.length>24)M.hist=h.slice(-24);save()}
function mMesesDe(a,b){var x=a.split('-'),y=b.split('-');return(+y[0]-+x[0])*12+(+y[1]-+x[1])}
function mNovidades(){var M=st.mentor,h=M.hist;mFecha();
 (st.dividas||[]).forEach(function(d){var I=M.info[String(d.id)];if(!ehPar(d)&&I&&I.sd>0&&!I.fixa&&I.base&&mMesesDe(I.base,mesAt())>=1)mSay('Quanto falta hoje em “'+d.nome+'”? Estou estimando pelos pagamentos. Atualize em Minhas dívidas → Atualizar uma.','dica')});
 if(h.length>=2){var a=h[h.length-2],b=h[h.length-1];if(a.div-b.div>0.5)mSay('Desde o mês passado sua dívida caiu '+brl(r2(a.div-b.div))+'. Boa!','ok');else if(b.div-a.div>0.5)mSay('Sua dívida subiu '+brl(r2(b.div-a.div))+' desde o mês passado. Vamos olhar o plano?','alerta')}
 var P=M.plano,Z=mZona();if(P&&Z.ds.length){var R=mSim(Z.ds,P.extra,P.est),pass=mMesesDe(P.ini,mesAt()),prev=P.meses-pass;if(!R.nunca&&pass>0){if(R.meses<prev)mSay('Você está '+(prev-R.meses)+(prev-R.meses===1?' mês':' meses')+' adiantado no plano das dívidas.','ok');else if(R.meses>prev)mSay('Você está '+(R.meses-prev)+(R.meses-prev===1?' mês':' meses')+' atrasado no plano das dívidas. Que tal revisar o valor extra?','alerta')}}
 else if(P&&!Z.ds.length&&M.diag)mSay('Você não tem mais dívidas para quitar. Parabéns! 🎉','ok');
 if(M.mis){var r=mAval(M.mis);mSay('Missão até '+r.ate+': '+mTxt(M.mis)+'. '+r.txt,r.ok?'ok':'dica')}}
