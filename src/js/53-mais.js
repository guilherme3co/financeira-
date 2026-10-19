/* ---------- MAIS ---------- */
function mMais(){mSay('Mais opções:');mOps([['Como estou indo',mEvolucao,'evo'],['Dúvidas',mDuvQ],['Minhas soluções',mSols,'sols'],['Refazer diagnóstico',mDiag0]])}
function mDuvQ(){mSay('Como prefere?');mOps([['Ver dúvidas prontas',function(){mFaq(0)}],['Escrever uma dúvida',function(){mPede('Escreva sua dúvida',mDuvida)}],['Perguntar ao Claude',mClaude]])}
function mSols(){var S=st.mentor.sols.slice(0,5);mSay('Suas últimas soluções:');S.forEach(function(s){var c=el_('div');c.appendChild(el_('div','msolh','Solução · '+dm(s.d)));c.appendChild(el_('p','msolt',s.t));mSay(c,'sol')});mAgora()}
function mEvolucao(){var M=st.mentor,h=M.hist,Z=mZona();
 if(h.length>=2){var a=h[0],b=h[h.length-1];mSay(mCard('Desde '+MESES[+a.m.slice(5)-1]+'/'+a.m.slice(0,4),null,[['Dívidas para quitar',brl(a.div)+' → '+brl(b.div)],['Guardado',brl(a.gua)+' → '+brl(b.gua)]]),'card');if(h.length>=3)mSay(mGraf(h.map(function(x){return x.div}),null,'Dívida mês a mês desde que você começou.'),'card')}
 else mSay('Ainda é seu primeiro mês comigo. A partir do próximo eu mostro a comparação.');
 mSay(mCard(Z.z.n+' · '+Z.z.t,Z.z.c,[['Contas e dívidas',Z.pct!=null?Math.round(Z.pct*100)+'% da renda':brl(Z.mens)],['Falta quitar',brl(Z.tot)],['Guardado',brl(Z.gua)],['Missões cumpridas',M.misOk+' de '+M.misTot+(M.seq>1?' · '+M.seq+' seguidas':'')]]),'card');
 var R=(M.plano&&Z.ds.length)?mSim(Z.ds,M.plano.extra,M.plano.est):null;
 mSol((R?'No ritmo do plano, você fica livre em '+mQuando(R)+'. ':'')+'Próximo passo: '+mDicas(Z)[0])}
/* dúvidas prontas, de 3 em 3 */
function mFaq(p){var ini=p*3,pg=FAQ.slice(ini,ini+3);mSay(p?'Mais dúvidas:':'Escolha uma dúvida:');
 mOps(pg.map(function(f){return[f.q,function(){mSol(f.a(mZona()),[['Outra dúvida',function(){mFaq(0)},false]])}]}).concat(ini+3<FAQ.length?[['Ver mais',function(){mFaq(p+1)}]]:[]).concat([['Início',mRaiz]]))}
function mDuvida(t){var n=' '+normT(t)+' ',best=null,bs=0;FAQ.forEach(function(f){var s=0;f.k.forEach(function(k){var w=normT(k),hit=w.indexOf(' ')>=0?n.indexOf(w)>=0:new RegExp('[^a-z0-9]'+w.replace(/[.*+?^${}()|[\]\\]/g,'')+'s?[^a-z0-9]').test(n);if(hit)s+=w.length>=5?2:1});if(s>bs){bs=s;best=f}});
 if(best&&bs>=2){mSay('Sobre “'+best.q+'”:');mSol(best.a(mZona()),[['Outra dúvida',mDuvQ,false]])}
 else{mSay('Essa eu não tenho pronta. Toque em “Perguntar ao Claude”: eu copio um resumo só com números e você cola na conversa com o Claude.');mOps([['Perguntar ao Claude',mClaude],['Ver dúvidas prontas',function(){mFaq(0)}],['Início',mRaiz]])}}
function mClaude(){var t=mResumo(),ta=el_('textarea','mres');ta.readOnly=true;ta.value=t;ta.rows=8;
 var fim=function(ok){mSay(ok?'Copiei o resumo. Abra o Claude, cole e escreva sua pergunta no fim. Nomes e descrições não vão junto.':'Toque no texto, selecione tudo e copie.',ok?'ok':'');mAgora()};
 mSay(ta,'card');if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(t).then(function(){fim(true)},function(){fim(false)});else fim(false)}
$('menab').onclick=abreMentor;$('menx').onclick=fechaMentor;$('men').onclick=function(e){if(e.target===this)fechaMentor()};
$('mensend').onclick=mEnvia;$('mentx').onkeydown=function(e){if(e.key==='Enter'){e.preventDefault();mEnvia()}};
document.addEventListener('keydown',function(e){if(e.key==='Escape'&&!$('men').hidden)fechaMentor()});

