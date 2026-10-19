/* ---------- MINHAS DÍVIDAS ---------- */
function mDivR(){var ds=mDiv(),gi=function(id){return st.mentor.info[String(id)]||{}},fx=(st.dividas||[]).filter(function(d){var I=gi(d.id);return !ehPar(d)&&!(I.sd>0&&!I.fixa)});
 if(!ds.length){mSay('Você não tem dívidas para quitar cadastradas.'+(fx.length?' Contas fixas: '+fx.map(function(d){return d.nome}).join(', ')+'.':''));mSay('O que quer fazer?');mOps([['Adicionar uma dívida',function(){mAddDiv(mDivR)}],['Início',mRaiz]]);return}
 var Z=mZona();mSay(mCard('Falta quitar: '+brl(Z.tot),null,ds.map(function(x){return[x.nome+(x.atr?' (atrasada)':'')+(x.est?' (estimado)':''),brl(x.rest)+' · '+brl(x.parc)+'/mês'+(x.jr>0?' · '+pctTxt(x.jo)+' a.m.':x.jr===0?' · sem juros':'')]}),fx.length?'Contas fixas (não entram aqui): '+fx.map(function(d){return d.nome}).join(', ')+'.':''),'card');
 mSay('O que você quer fazer?');mOps([['Quando fico livre?',mLivreQ],['Adicionar uma dívida',function(){mAddDiv(mDivR)}],['Atualizar uma',mAtuQ]])}
function mAtuQ(){var ds=(st.dividas||[]).filter(function(d){return ehPar(d)?dvAtivo(d):true});if(!ds.length){mDivR();return}mSay('Qual?');mOps(ds.map(function(d){return[d.nome,function(){mEditDiv(d.id)}]}).concat([['Voltar',mDivR]]))}
function mLivreQ(){var Z=mZona();if(!Z.ds.length){mDivR();return}var P=st.mentor.plano,ex=P?P.extra:0,R=mSim(Z.ds,ex,P?P.est:mEst(Z));
 mSay(mGraf(R.hist,null,'Quanto falta, mês a mês'+(ex>0?' (com o seu plano de '+brl(ex)+' a mais)':'')+'.'),'card');
 if(R.nunca){mSay('Do jeito que está, a dívida não acaba: o pagamento não cobre os juros.','alerta');var c=Z.caro[0]||Z.ds[0];
  mSol('Renegocie “'+c.nome+'”: peça uma parcela fixa que caiba na sua sobra ('+brl(Z.livre)+' livres), ou troque por um empréstimo com juros menores. Pagar só o mínimo não resolve.',[['Ver como negociar',function(){var f=FAQ[3];mSol(f.a(mZona()))},false]]);return}
 mSay((P?'No seu plano':'Do jeito que está')+', você fica livre em '+mQuando(R)+'.'+(R.jur>0?' Juros até lá: '+brl(R.jur)+'.':''),'ok');
 mSay('Quer chegar antes?');mOps([['Sim, me mostre como',mAntesQ],['Ver ordem de pagamento',function(){mOrdem(ex)}],['Início',mRaiz]])}
function mAntesQ(){var Z=mZona();if(Z.sobra<=0){mSol('Hoje não sobra nada depois das contas. Para sair antes: corte desnecessários ('+brl(Z.des)+' por mês) ou busque uma renda extra, e use esse dinheiro na dívida mais cara.');return}
 mSay('Quanto dá para colocar a mais por mês? Depois de guardar o mínimo ('+brl(Z.guar)+'), sobram uns '+brl(Z.livre)+' livres.');
 var ops=[];if(Z.livre>=10){ops.push(['Metade: '+brl(r2(Z.livre/2)),function(){mPlanoSol(r2(Z.livre/2))}]);ops.push(['Tudo: '+brl(Z.livre),function(){mPlanoSol(Z.livre)}])}
 ops.push(['Outro valor',function(){mNum('Valor extra por mês',function(v){mPlanoSol(v)},null,0)}]);mOps(ops)}
function mAlvo(ds,est){var c=ds.filter(function(x){return x.rest>x.parc+0.004});if(!c.length)c=ds.slice();return c.sort(est==='aval'?function(p,q){return(q.jo-p.jo)||(p.rest-q.rest)}:function(p,q){return p.rest-q.rest})[0]}
function mMelhor(Z,ex){var a=mSim(Z.ds,ex,'neve'),b=mSim(Z.ds,ex,'aval'),tj=Z.ds.some(function(x){return x.jo>0}),best=(tj&&!b.nunca&&(a.nunca||b.jur<a.jur-0.5||b.meses<a.meses))?'aval':'neve';return{R:best==='aval'?b:a,est:best,a:a,b:b,tj:tj}}
function mAplica(ex,X){return function(){st.mentor.plano={extra:ex,est:X.est,ini:mesAt(),meses:X.R.meses};save();mFeito('Plano aplicado. Eu acompanho e te aviso se você estiver adiantado ou atrasado.')}}
function mPlanoSol(ex){var Z=mZona(),s0=mSim(Z.ds,0,'neve'),X=mMelhor(Z,ex),R=X.R;
 if(R.nunca){mSol('Mesmo com '+brl(ex)+' a mais, o pagamento não cobre os juros. Renegocie a dívida mais cara antes de qualquer coisa.');return}
 mSay(mGraf(R.hist,ex>0?s0.hist:null,ex>0?'Verde: com '+brl(ex)+' a mais por mês. Tracejada: só as parcelas.':'Quanto falta, mês a mês.'),'card');
 if(X.tj&&(X.a.meses!==X.b.meses||Math.abs(X.a.jur-X.b.jur)>0.5))mSay('Comparei dois jeitos:\n• Menor dívida primeiro: '+X.a.meses+' meses, '+brl(X.a.jur)+' de juros.\n• Juros mais alto primeiro: '+X.b.meses+' meses, '+brl(X.b.jur)+' de juros.');
 var pri=mAlvo(Z.ds,X.est),eco=s0.nunca?0:r2(Math.max(0,s0.jur-R.jur)),ant=s0.nunca?0:s0.meses-R.meses;
 mSol((ex>0?'Coloque '+brl(ex)+' a mais por mês em “'+pri.nome+'”'+(pri.jo>0?' ('+pctTxt(pri.jo)+' ao mês)':'')+'. Quando ela acabar, passe tudo para a próxima.\n':'Mantenha as parcelas em dia.\n')+'Você fica livre em '+mQuando(R)+(ant>0?', '+ant+(ant===1?' mês':' meses')+' antes':'')+(eco>0?' e economiza '+brl(eco)+' de juros':'')+'.'+(ex>0&&Z.ds.some(function(x){return x.par})?'\nAo adiantar parcelas, peça o desconto dos juros (Código de Defesa do Consumidor, art. 52).':''),
  [['Aplicar este plano',mAplica(ex,X)],['Outro valor',mAntesQ,false]])}
function mOrdem(ex){var Z=mZona(),X=mMelhor(Z,ex),R=X.R;if(R.nunca){mLivreQ();return}var ord=R.ds.slice().sort(function(p,q){return(p.fim-q.fim)||(q.jo-p.jo)});
 mSay('Ordem para quitar:\n'+ord.map(function(x,i){return(i+1)+'º '+x.nome+' — quitada em '+mesDepois(x.fim-1+mOff())}).join('\n'));
 var al=mAlvo(Z.ds,X.est),prox=ord.filter(function(x){return x.nome!==al.nome})[0];mSol('Pague todas as parcelas em dia e coloque todo dinheiro extra em “'+al.nome+'”. '+(X.est==='aval'&&al.jo>0?'Ela tem os juros mais altos: é onde cada real rende mais.':'É a menor: quitar rápido libera a parcela dela para a próxima.')+' Quando acabar, a parcela dela vai para “'+(prox?prox.nome:'o guardado')+'”.',[['Aplicar este plano',mAplica(ex,X)]])}
/* adicionar e editar dívida (vai para o Planejamento também) */
function mAddDiv(next){mSay('Qual o nome da dívida? Ex.: Cartão Nubank, Empréstimo, Moto.');
 mPede('Nome da dívida',function(v){var nome=String(v).replace(/\s+/g,' ').trim().slice(0,40);if(nome.length<2){mSay('Digite um nome com pelo menos 2 letras.');mAddDiv(next);return}
  if((st.dividas||[]).length>=90){mSay('Você já tem muitas dívidas cadastradas. Apague alguma no Planejamento antes.');next();return}
  function grava(d,I){d.id=nid();st.dividas.push(d);I.base=mesAt();st.mentor.info[String(d.id)]=I;save();render();mSay('“'+nome+'” adicionada. Ela aparece também no Planejamento.','ok');next()}
  function porMes(sd,j){mSay('Quanto você consegue pagar por mês nela?');mNum('Pagamento por mês',function(v){if(j>0&&v<=sd*j/100)mSay('Atenção: '+brl(v)+' por mês não cobre nem os juros ('+brl(r2(sd*j/100))+'). Assim a dívida só cresce. Renegocie.','alerta');
   grava({nome:nome,valor:v,pago:false,n:0,total:0,pagas:0,ult:''},{j:j,sd:sd,atr:false,fixa:false})},null,0.01)}
  mSay('Como ela é?');
  mOps([['Parcelas fixas',function(){mSay('Quanto falta pagar no total, somando as parcelas que restam?');mNum('Total que falta',function(tot){mSay('Quantas parcelas faltam?');mInt('Parcelas que faltam',function(n){mSay('Ela tem juros?');
     var cria=function(j){if(n<=1)grava({nome:nome,valor:tot,pago:false,n:0,total:0,pagas:0,ult:''},{j:j,sd:tot,atr:false,fixa:false});else grava({nome:nome,valor:r2(tot/n),pago:false,n:n,total:tot,pagas:0,ult:''},{j:j,sd:0,atr:false,fixa:false})};
     mOps([['Sem juros',function(){cria(0)}],['Sei a taxa',function(){mNum('Juros ao mês, em %',function(j){cria(Math.min(50,j))})}],['Não sei',function(){cria(-1)}]])},1,360)},null,0.01)}],
   ['Cartão, cheque especial ou empréstimo',function(){mSay('Quanto você deve hoje nela?');mNum('Quanto deve hoje',function(sd){mSay('Qual o juro ao mês, em %? Cartão rotativo e cheque especial costumam passar de 8%.');mNum('Juros ao mês, em %',function(j){porMes(sd,Math.min(50,j))},[['Não sei',function(){porMes(sd,-1)}]])},null,0.01)}]])},null,false)}
function mEditDiv(id){var d=(st.dividas||[]).filter(function(x){return x.id===id})[0];if(!d){mDivR();return}var I=mI(id),ops=[];
 mSay(ehPar(d)?'“'+d.nome+'”: '+d.pagas+' de '+d.n+' parcelas pagas. As parcelas avançam quando você marca como paga no Planejamento.':'“'+d.nome+'”: deve '+brl(I.sd)+', paga '+brl(d.valor)+' por mês.');
 if(!ehPar(d))ops.push(['Atualizar quanto falta',function(){mNum('Quanto falta hoje',function(v){I.sd=v;I.base=mesAt();if(v>0)I.fixa=false;save();if(v<=0.004){mSay('Quitada! 🎉 Quer apagar do app?');mOps([['Apagar',function(){mApaga(d)}],['Manter',mDivR]])}else{mSay('Atualizado.','ok');mDivR()}})}]);
 if(!ehPar(d))ops.push(['Mudar valor por mês',function(){mNum('Pagamento por mês',function(v){d.valor=v;save();render();mSay('Atualizado.','ok');mDivR()},null,0.01)}]);
 ops.push(['Mudar juros',function(){mNum('Juros ao mês, em %',function(j){I.j=Math.min(50,j);save();mSay('Atualizado.','ok');mDivR()},[['Sem juros',function(){I.j=0;save();mDivR()}],['Não sei',function(){I.j=-1;save();mDivR()}]])}]);
 ops.push([I.atr?'Não está mais atrasada':'Marcar como atrasada',function(){I.atr=!I.atr;save();mSay('Anotado.','ok');mDivR()}]);
 ops.push(['Apagar',function(){mSay('Apagar “'+d.nome+'” do app (também some do Planejamento)?');mOps([['Sim, apagar',function(){mApaga(d)}],['Não',mDivR]])}]);
 ops.push(['Voltar',mDivR]);mOps(ops)}
function mApaga(d){st.dividas=(st.dividas||[]).filter(function(x){return x.id!==d.id});delete st.mentor.info[String(d.id)];save();render();mSay('“'+d.nome+'” apagada.');mDivR()}
