/* ---------- missões ---------- */
function mMissao(){var M=st.mentor;mFecha();if(M.mis){var r=mAval(M.mis),x=M.mis;mSay('Missão até '+r.ate+': '+mTxt(x)+'.\n'+r.txt,r.ok?'ok':'dica');
  var dias=Math.max(1,isoDias(hoje(),isoAdd(x.ini,6))+1),t=r.ok?'Você está dentro da missão. ':'';
  if(x.t==='des'){var s=r2(itemsTodos().filter(function(i){return i.d>=x.ini&&i.d<=isoAdd(x.ini,6)&&!i.ent&&i.cor==='des'}).reduce(function(a,i){return a+i.val},0));t+=s<x.alvo?'Restam '+brl(r2(x.alvo-s))+' até '+r.ate+': no máximo '+brl(r2((x.alvo-s)/dias))+' por dia.':'O limite acabou: até '+r.ate+', só o essencial.'}
  else if(x.t==='gua')t+=r.ok?'Meta batida! Se puder, guarde mais um pouco.':'Separe o que falta hoje mesmo: guardar no começo é mais fácil que no fim.';
  else if(x.t==='top')t+=r.ok?'Segure até '+r.ate+'.':'Passou do combinado. Até '+r.ate+', nenhum “'+x.nome+'”.';
  else t+='Abra o Histórico e toque em cada gasto sem categoria.';
  mSol(t,[['Trocar missão',function(){M.mis=null;save();mNova()},false]]);return}mNova()}
function mNova(vis){vis=vis||[];var M=st.mentor,c=mCand(),x=c.filter(function(y){return vis.indexOf(y.t)<0})[0]||c.filter(function(y){return y.t!==vis[vis.length-1]})[0]||c[0];
 if(!x){mSay('Ainda não tenho dados para montar uma missão. Lance seus gastos por uns dias.');mAgora();return}
 mSol('Missão para os próximos 7 dias: '+mTxt(x)+'.',[['Aceitar',function(){x.ini=hoje();M.mis=x;save();mFeito('Valendo até '+dm(isoAdd(x.ini,6))+'! Eu confiro sozinho pelos seus lançamentos.')}],['Outra missão',function(){var v=vis.concat([x.t]);mNova(v.length>=c.length?[x.t]:v)},false]])}
