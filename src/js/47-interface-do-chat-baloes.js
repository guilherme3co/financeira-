/* ---------- interface do chat (balões) ---------- */
var MKEYS=['dia','div','gua','mais','mis','evo','sols','ren'];
function mLib(k){var M=st.mentor;if(!M.diag)return false;
 if(k==='mis')return !!(M.plano||M.res>0||M.mis||M.misTot>0);
 if(k==='evo')return M.hist.length>=2||(!!M.dd&&isoDias(M.dd,hoje())>=7);
 if(k==='sols')return M.sols.length>0;
 if(k==='ren')return M.res>0||guardadoTotal()>0;return true}
function mNovo(k){return mLib(k)&&!st.mentor.novos[k]}
function mLog(){return $('menlog')}
function mRol(){var l=mLog();setTimeout(function(){l.scrollTop=l.scrollHeight},40)}
function mSay(t,cls){var b=el_('div','mb'+(cls?' '+cls:''));if(typeof t==='string')b.textContent=t;else b.appendChild(t);mLog().appendChild(b);mRol();return b}
function mEu(t){mLog().appendChild(el_('div','mu',t));mRol()}
/* ops: [rótulo, função, chave para liberar (opcional), chaves filhas (opcional)] */
function mOps(ops){var o=$('menops'),M=st.mentor,mud=false;o.innerHTML='';MEN.esp=null;$('menin').hidden=true;var i=$('mentx');i.value='';
 (ops||[]).forEach(function(x){if(x[2]&&!mLib(x[2]))return;var nv=(x[2]&&mNovo(x[2]))||(x[3]||[]).some(mNovo),b=el_('button','mchip'+(x[4]?' '+x[4]:''),x[0]);b.type='button';
  if(nv){var s=el_('span','mnovo','novo');b.appendChild(s)}if(x[2]&&!M.novos[x[2]]){M.novos[x[2]]=1;mud=true}
  b.onclick=function(){MEN.esp=null;mEu(x[0]);o.innerHTML='';$('menin').hidden=true;x[1]()};o.appendChild(b)});if(mud)save();mRol()}
function mPede(ph,fn,ops,num){mOps(ops||[]);MEN.esp=fn;$('menin').hidden=false;var i=$('mentx');i.placeholder=ph;i.inputMode=num?'decimal':'text';setTimeout(function(){try{i.focus()}catch(e){}},60);mRol()}
function mNum(ph,fn,ops,min){mPede(ph,function(v){var n=lerReais(v);if(!(n>=(min||0))||n>1e9){mSay('Não entendi o valor. Digite só o número, por exemplo 350,00.');mNum(ph,fn,ops,min);return}fn(r2(n))},ops,true)}
function mInt(ph,fn,a,b){mPede(ph,function(v){var n=parseInt(String(v).replace(/\D/g,''),10);if(!(n>=a&&n<=b)){mSay('Digite um número de '+a+' a '+b+'.');mInt(ph,fn,a,b);return}fn(n)},null,true)}
function mEnvia(){var i=$('mentx'),v=(i.value||'').trim();if(!v)return;i.value='';mEu(v.slice(0,300));var f=MEN.esp||mDuvida;MEN.esp=null;$('menops').innerHTML='';$('menin').hidden=true;f(v)}
function mCard(tit,cor,rows,nota){var c=el_('div');if(tit){var t=el_('div','mzona',tit);if(cor)t.style.color='var('+cor+')';c.appendChild(t)}
 rows.forEach(function(r){var d=el_('div','mrow');d.appendChild(el_('span',null,r[0]));d.appendChild(el_('b',null,r[1]));c.appendChild(d)});if(nota)c.appendChild(el_('p','mleg',nota));return c}
function mBarra(p,cor){var b=el_('div','mbar'),i=el_('i');i.style.width=Math.max(0,Math.min(100,p))+'%';if(cor)i.style.background='var('+cor+')';b.appendChild(i);return b}
function mGraf(h1,h2,leg){var W=300,H=110,P=6,all=h1.concat(h2||[]),mx=Math.max.apply(null,all)||1,n=Math.max(h1.length,(h2||[]).length)-1||1,ns='http://www.w3.org/2000/svg',s=document.createElementNS(ns,'svg');
 s.setAttribute('viewBox','0 0 '+W+' '+H);s.setAttribute('class','mgraf');s.setAttribute('aria-hidden','true');
 function ln(x1,y1,x2,y2){var l=document.createElementNS(ns,'line');l.setAttribute('x1',x1);l.setAttribute('y1',y1);l.setAttribute('x2',x2);l.setAttribute('y2',y2);l.setAttribute('class','mg0');s.appendChild(l)}
 function pl(h,cls){var p=document.createElementNS(ns,'polyline');p.setAttribute('points',h.map(function(v,i){return(P+i*(W-2*P)/n).toFixed(1)+','+(H-P-(v/mx)*(H-2*P)).toFixed(1)}).join(' '));p.setAttribute('class',cls);s.appendChild(p)}
 ln(P,H-P,W-P,H-P);if(h2)pl(h2,'mg2');pl(h1,'mg1');var c=el_('div');c.appendChild(s);if(leg)c.appendChild(el_('p','mleg',leg));return c}
/* cartão SOLUÇÃO: fecha cada caminho com o que fazer + balões de ação */
function mSol(txt,acoes){var M=st.mentor,c=el_('div');c.appendChild(el_('div','msolh','Solução'));c.appendChild(el_('p','msolt',txt));mSay(c,'sol');
 M.sols.unshift({d:hoje(),t:String(txt).slice(0,500)});if(M.sols.length>15)M.sols=M.sols.slice(0,15);save();
 mOps((acoes||[]).map(function(a){return[a[0],a[1],null,null,a[2]===false?'':'ac']}).concat([['Início',mRaiz]]))}
function mFeito(t){mSay(t,'ok');mOps([['Início',mRaiz]])}
function saud(){var h=new Date().getHours();return h<12?'Bom dia!':h<18?'Boa tarde!':'Boa noite!'}
function mDot(){var M=st&&st.mentor;if(!M)return;var nv=!!(!M.diag||(M.diag&&M.resVisto!==hoje())||(M.mis&&hoje()>isoAdd(M.mis.ini,6))||MKEYS.some(mNovo));$('tk').classList.toggle('nv',nv);$('menn').hidden=!nv;$('abmend').hidden=!nv;$('fab').classList.toggle('nv',nv)}
function abreMentor(){if(!st)return;fechaLanc();$('men').hidden=false;mLog().innerHTML='';var M=st.mentor;mHist();
 if(M.diag&&M.resVisto!==hoje()){M.resVisto=hoje();save();mFecha();mResDia(isoAdd(hoje(),-1),true);return}
 if(M.diag){mSay(saud()+' Que bom te ver.');mNovidades()}mRaiz()}
function fechaMentor(){$('men').hidden=true;MEN.esp=null;if(st)mDot()}
/* pergunta de introdução e raiz da conversa */
function mRaiz(){var M=st.mentor;
 if(!M.diag){mSay('Oi! Sou seu mentor financeiro. Vou te conhecer, montar um plano para você sair das dívidas e te acompanhar dia a dia. Tudo fica só no seu celular.');mSay('Vamos começar?');mOps([['Vamos nos conhecer',mDiag0],['Agora não',fechaMentor]]);return}
 mSay('O que você quer ver agora?');
 mOps([['Meu dia',mDia,'dia',['mis']],['Minhas dívidas',mDivR,'div'],['Guardar dinheiro',mGua,'gua',['ren']],['Mais',mMais,'mais',['evo','sols']]])}
function mAgora(){mOps([['Início',mRaiz],['Fechar',fechaMentor]])}

