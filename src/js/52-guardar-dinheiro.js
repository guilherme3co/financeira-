/* ---------- GUARDAR DINHEIRO ---------- */
function mGua(){var gt=guardadoTotal();mSay('Você tem '+brl(gt)+' guardado. O que quer saber?');mOps([['Quanto guardar?',mQuanto],['Reserva de emergência',mReserva],['Fazer render',mRender,'ren']])}
function mDefMeta(v,txt){return function(){st.mentor.res=v;save();mFeito(txt||'Meta definida: guardar '+brl(v)+' por mês. Eu acompanho pelo Guardado.')}}
function mQuanto(){var Z=mZona(),M=st.mentor,ess=M.ess||0,falta=ess>0?Math.max(0,r2(ess-Z.gua)):0;
 if(Z.sobra<=0){mSol('Hoje não sobra nada depois das contas. Comece pequeno: R$ 10 por semana (R$ 40 por mês) já cria o hábito. Ao mesmo tempo, renegocie parcelas para abrir espaço.',[['Definir R$ 40 por mês',mDefMeta(40)]]);return}
 mSay('Sua sobra é de '+brl(Z.sobra)+' por mês. A regra do app: acima de R$ 200 guarde 15%; de R$ 100 a 200, 10%; abaixo, 8%.');
 var n=falta>0?Math.ceil(falta/Z.guar):0;
 mSol('Guarde '+brl(Z.guar)+' por mês ('+Math.round(faixa(Z.sobra)*100)+'% da sobra) numa caixinha que pague 100% do CDI.'+(n>0?' Em '+n+(n===1?' mês':' meses')+' você tem 1 mês do essencial de reserva.':''),[['Definir como meta',mDefMeta(Z.guar)],['Outro valor',function(){mNum('Guardar por mês',function(v){var k=falta>0&&v>0?Math.ceil(falta/v):0;mSol('Guarde '+brl(v)+' por mês.'+(k>0?' Em '+k+(k===1?' mês':' meses')+' você tem 1 mês do essencial.':''),[['Definir como meta',mDefMeta(v)]])},null,1)},false]])}
function mReserva(){var M=st.mentor,Z=mZona(),ess=M.ess;if(!(ess>0)){mSay('Quanto você gasta por mês com o essencial (mercado, contas, transporte, remédio)?');mNum('Essencial por mês',function(v){M.ess=v;save();mReserva()},null,1);return}
 var a3=r2(ess*3),a6=r2(ess*6),g=Z.gua,meta=Z.ds.length?ess:(g>=a3?a6:a3);
 mSay('Reserva de emergência é o dinheiro para imprevisto: remédio, conserto, ficar sem renda. Ela impede que um susto vire dívida nova. '+(Z.ds.length?'Enquanto paga dívidas, a meta é 1 mês do essencial. Depois: 3 e 6 meses.':'Meta: 3 meses do essencial, depois 6.'));
 var c=mCard('Reserva',null,[['Guardado',brl(g)],['Meta agora',brl(meta)]]);c.appendChild(mBarra(meta>0?g/meta*100:0,'--gua'));mSay(c,'card');
 if(g>=meta){mSol(g>=a6?'Você já tem 6 meses do essencial guardados. Reserva completa! O que passar disso pode ir para objetivos maiores.':'Meta atingida! Próxima meta: '+brl(g>=a3?a6:a3)+'. Continue guardando todo mês e deixe o dinheiro rendendo com saque na hora.');return}
 var falta=r2(meta-g);mSay('Faltam '+brl(falta)+'. Quanto dá para guardar por mês?');
 var ops=[];if(Z.guar>0)ops.push(['Mínimo sugerido: '+brl(Z.guar),function(){mRes2(falta,Z.guar)}]);if(M.res>0&&M.res!==Z.guar)ops.push(['O de antes: '+brl(M.res),function(){mRes2(falta,M.res)}]);
 ops.push(['Outro valor',function(){mNum('Guardar por mês',function(v){mRes2(falta,v)},null,1)}]);mOps(ops)}
function mRes2(falta,v){var n=Math.ceil(falta/v);mSol('Guarde '+brl(v)+' por mês e você completa a reserva em '+n+(n===1?' mês':' meses')+' ('+mesDepois(n)+'). Deixe num lugar que rende e saca na hora, como uma caixinha ou CDB com liquidez diária pagando 100% do CDI.',[['Definir como meta',mDefMeta(v)]])}
function mRender(){var M=st.mentor,R=rendTudo(),gt=guardadoTotal(),cdi=(st.cdi&&st.cdi.anual>0)?st.cdi.anual:0,lg=guaLugares(),pm=0,pw=0;
 Object.keys(st.rend||{}).forEach(function(k){var v=Math.max(0,lg[k]||0);pm+=v*st.rend[k].pct;pw+=v});pm=pw>0?pm/pw:100;
 if(R.length){var tot=r2(R.reduce(function(a,x){return a+x.r.tot},0));mSay('Seu dinheiro já rendeu '+brl(tot)+' desde que você ligou o rendimento.','ok')}
 if(gt>0&&cdi>0){var y=cdi/100*pm/100,p6=r2(gt*(Math.pow(1+y,0.5)-1)),p12=r2(gt*y);mSay('Com o CDI em '+String(cdi).replace('.',',')+'% ao ano'+(pw>0?' e seus lugares pagando em média '+Math.round(pm)+'% dele':' a 100% dele')+', '+brl(gt)+' rende uns '+brl(p6)+' em 6 meses e '+brl(p12)+' em 12 meses, antes do imposto.')}
 mSay('Regras de ouro: prefira 100% do CDI ou mais, com saque na hora; poupança costuma render menos; desconfie de ganho alto “garantido”. Não é recomendação de investimento.','dica');
 if(gt>0&&!R.length){mSol('Ligue o rendimento no app: na aba Guardado, toque nos ⋯ do lugar onde está o dinheiro, escolha Rendimento e informe a % do CDI. Assim você vê o dinheiro crescendo todo dia.',[['Abrir Guardado',function(){fechaMentor();vaiPagina(0);try{setGaugePanel(1)}catch(e){}}]]);return}
 if(M.res>0&&cdi>0){var ym=Math.pow(1+cdi/100*pm/100,1/12)-1,fv=0;for(var i=0;i<12;i++)fv=(fv+M.res)*(1+ym);mSol('Mantendo '+brl(M.res)+' por mês, em 12 meses você terá uns '+brl(r2(gt+fv))+'. Não pare de guardar, nem em mês apertado: mesmo pouco mantém o hábito.');return}
 mSol('Defina quanto guardar por mês: é isso que faz o rendimento ganhar força.',[['Quanto guardar?',mQuanto]])}
