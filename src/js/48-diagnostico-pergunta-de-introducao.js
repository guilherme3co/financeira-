/* ---------- diagnóstico (pergunta de introdução) ---------- */
function mDiag0(){var s=st.salario||0;if(s>0){mSay('Seu salário cadastrado é '+brl(s)+' por mês. Está certo?');mOps([['Sim',mDiag1],['Mudar',function(){mSay('Quanto você recebe por mês?');mNum('Salário por mês',function(v){st.salario=v;save();render();mDiag1()},null,0)}]])}
 else{mSay('Para começar: quanto você recebe de salário por mês?');mNum('Salário por mês',function(v){st.salario=v;save();render();mDiag1()},null,0)}}
function mDiag1(){mSay('Tem alguma renda extra todo mês (bico, venda, comissão)?');mOps([['Não tenho',function(){st.mentor.sal2=0;save();mDiag2()}],['Tenho',function(){mSay('Quanto, em média, por mês?');mNum('Renda extra por mês',function(v){st.mentor.sal2=v;save();mDiag2()})}]])}
function mDiag2(){var M=st.mentor,q=(st.dividas||[]).filter(function(d){return(ehPar(d)?dvAtivo(d):true)&&!M.info[String(d.id)]});if(!q.length){mDiag3();return}
 var d=q[0],I={j:-1,sd:0,atr:false,fixa:false,base:mesAt()};function fim(){M.info[String(d.id)]=I;save();mDiag2()}
 if(ehPar(d)){mSay('Sobre “'+d.nome+'” ('+brl(parcBase(d))+' por mês, faltam '+brl(dvRest(d))+'): ela tem juros?');
  mOps([['Sem juros',function(){I.j=0;fim()}],['Tem, sei a taxa',function(){mSay('Quantos % ao mês?');mNum('Juros ao mês, em %',function(v){I.j=Math.min(50,v);fim()})}],['Não sei',fim]])}
 else{mSay('“'+d.nome+'” ('+brl(d.valor)+' por mês) é uma conta fixa, como aluguel ou internet, ou uma dívida que um dia acaba?');
  mOps([['Conta fixa',function(){I.fixa=true;fim()}],['Dívida para quitar',function(){mSay('Quanto falta pagar nela hoje, no total?');mNum('Quanto falta',function(v){I.sd=v;mSay('Qual o juro ao mês, em %?');mNum('Juros ao mês, em %',function(j){I.j=Math.min(50,j);fim()},[['Sem juros',function(){I.j=0;fim()}],['Não sei',fim]])},null,0.01)}]])}}
function mDiag3(){mSay('Tem alguma dívida que ainda não está no app? Cartão atrasado, empréstimo, cheque especial, dinheiro emprestado de alguém...');mOps([['Não, está tudo aí',mDiag4],['Tenho, vou adicionar',function(){mAddDiv(mDiag3b)}]])}
function mDiag3b(){mSay('Mais alguma dívida fora do app?');mOps([['Não',mDiag4],['Sim',function(){mAddDiv(mDiag3b)}]])}
function mDiag4(){var ds=mDiv().filter(function(x){return !x.atr});if(!ds.length){mDiag5();return}mSay('Alguma dessas está atrasada?');
 mOps([['Nenhuma',mDiag5]].concat(ds.map(function(x){return[x.nome,function(){mI(x.id).atr=true;save();mDiag4b()}]})))}
function mDiag4b(){var ds=mDiv().filter(function(x){return !x.atr});if(!ds.length){mDiag5();return}mSay('Anotado. Mais alguma atrasada?');mOps([['Não, só essa(s)',mDiag5]].concat(ds.map(function(x){return[x.nome,function(){mI(x.id).atr=true;save();mDiag4b()}]})))}
function mDiag5(){var M=st.mentor,e=r2(mediaCampo(function(t){return t.uti+t.sem})||0);
 var pede=function(){mSay('Última pergunta: quanto você gasta por mês com o essencial (mercado, contas, transporte, remédio)?');mNum('Essencial por mês',function(v){M.ess=v;save();mDiagRes()},null,1)};
 if(e>=50){mSay('Última: pelos seus lançamentos, o essencial gira em torno de '+brl(e)+' por mês. Uso esse valor?');mOps([['Sim',function(){M.ess=e;save();mDiagRes()}],['Outro valor',pede]])}else pede()}
function mDiagRes(){var M=st.mentor,pri=!M.diag;M.diag=true;M.dd=hoje();if(pri)['dia','div','gua','mais'].forEach(function(k){M.novos[k]=1});save();var Z=mZona();
 mSay('Pronto, já te conheço. Este é o seu retrato hoje:');
 mSay(mCard(Z.z.n+' · '+Z.z.t,Z.z.c,[['Renda por mês',brl(Z.renda)],['Contas e dívidas por mês',brl(Z.mens)+(Z.pct!=null?' ('+Math.round(Z.pct*100)+'%)':'')],['Sobra por mês',brl(Z.sobra)],['Falta quitar (dívidas)',brl(Z.tot)],['Guardado',brl(Z.gua)],['Desnecessários por mês',brl(Z.des)]],'Ideal: contas e dívidas até 30% da renda. Acima de 50% é zona vermelha.'),'card');
 var d=mDicas(Z).slice(0,3);mSay('Orientação educativa, não substitui um profissional.','mini');
 mSol('Seu plano agora:\n'+d.map(function(t,i){return(i+1)+'. '+t}).join('\n'),Z.ds.length?[['Montar plano das dívidas',mLivreQ]]:[['Quanto guardar?',mQuanto]])}
function mDicas(Z){var out=[],ex=mExtra(Z),es=mEst(Z);
 if(Z.sobra<=0)out.push('Suas contas fixas passam da renda. Renegocie parcelas menores ou busque uma renda extra. Sem isso, nenhuma estratégia fecha.');
 if(Z.atr)out.push('Negocie '+(Z.atr>1?'as '+Z.atr+' dívidas atrasadas':'a dívida atrasada')+' antes de tudo: multa e juros de atraso crescem rápido. Peça desconto à vista ou parcela que caiba na sua sobra.');
 if(Z.caro.length){var c=Z.caro[0];out.push('Todo dinheiro extra vai para “'+c.nome+'” ('+pctTxt(c.jo)+' ao mês), a mais cara. Se der, troque por um parcelamento com juros menores.')}
 if(Z.des>0&&Z.renda>0&&Z.des/Z.renda>=0.04){var meio=r2(Z.des/2);if(Z.ds.length){var b0=mSim(Z.ds,ex,es),b1=mSim(Z.ds,ex+meio,es);
  if(!b1.nunca&&(b0.nunca||b1.meses<b0.meses))out.push('Corte metade dos desnecessários ('+brl(meio)+' de '+brl(Z.des)+' por mês) e saia das dívidas '+(b0.nunca?'— elas passam a ter fim':(b0.meses-b1.meses)+((b0.meses-b1.meses)===1?' mês':' meses')+' antes')+'.');
  else out.push('Corte metade dos desnecessários: libera '+brl(meio)+' por mês.')}
  else out.push('Corte metade dos desnecessários ('+brl(Z.des)+' por mês): sobram '+brl(meio)+' a mais para guardar.')}
 if(Z.ess>0&&Z.gua<Z.ess)out.push('Guarde o mínimo'+(Z.guar>0?' ('+brl(Z.guar)+' por mês)':'')+' até ter 1 mês do essencial: é o que evita uma dívida nova no primeiro imprevisto.');
 var cr=0,g=0;st.items.forEach(function(i){if(i.ent||i.cor==='gua')return;g+=i.val;if(pagCred(i))cr+=i.val});if(g>0&&cr/g>0.5)out.push('Prefira débito ou Pix: mais da metade dos gastos do mês foi no crédito.');
 if(!out.length)out.push('Tudo em ordem. Mantenha o plano, guarde todo mês e cumpra as missões da semana.');return out}
