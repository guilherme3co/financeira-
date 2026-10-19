/* ---------- tutorial com balões ---------- */
var TUR={
pg1:[
{e:'.summary-grid',t:'Entradas e Gastos',x:'O que entrou e o que saiu neste mês.'},
{e:'.ringbox',t:'Disponível',x:'Seu saldo do débito. Verde é o que sobra, vermelho o que já saiu. Toque no anel para ver os lançamentos.'},
{e:'#limc',t:'Limite',x:'Seu limite do crédito. Gasto no crédito sai daqui, não do Disponível.'},
{e:'#fatbtn',t:'Pagar fatura',x:'Paga a fatura com o dinheiro do débito e devolve o valor ao Limite.'},
{e:'#gaugeCard .gauge-nav',t:'Painéis',x:'Deslize ou toque nas setas para ver quanto você tem guardado. Toque no valor para abrir os guardados.'},
{e:'#fab',t:'Botão +',x:'Tudo começa aqui. Toque para ver as opções: Lançar, Investir, Casal, Inteligência, Mentor e Histórico.'},
{e:'#prev',t:'Previsão',x:'Quanto sobra no fim do mês se você continuar gastando nesse ritmo.'},
{e:'#ultimos',t:'Últimos lançamentos',x:'Os 3 mais recentes. Toque para editar ou em Ver todos.'},
{e:'#mic1',t:'Microfone',x:'Toque e fale: “gastei 12 no pix na padaria”. Com valor e pagamento, salva sozinho.'},
{e:'#mic1',t:'Mais por voz',x:'“Tênis 300 em 3x no crédito”, “quanto gastei hoje?” e “apaga o último”.'},
{e:'#digita',t:'Digitar',x:'Sem voz? Digite a frase do mesmo jeito.'},
{e:'#compbtn',t:'Comprovante',x:'Compartilhe o PDF ou a foto do comprovante com o app, ou toque aqui para escolher o arquivo. O lançamento já vem preenchido.'},
{e:'#atalhos',t:'Gastos frequentes',x:'Toque para lançar de novo um gasto que você repete.'},
{e:'#rendBox',t:'Rendimentos',x:'Quanto seus guardados rendem por dia. ▲ verde subiu, ▼ vermelho caiu. Toque no gráfico para ver o dia.'},
{e:'#eng',t:'Configurações',x:'Contas, limite, CDI e backup.'}],
pg3:[
{e:'#itGua .gcard',t:'Total guardado',x:'Fica separado do Disponível. Guardar não mexe no saldo.'},
{e:'#gplaces',t:'Onde está',x:'Cada banco ou caixinha com a sua parte. Toque nos três pontinhos ⋯ para retirar, renomear ou apagar.'},
{e:'#grend',t:'Rendimento',x:'Toque em “+ Lugar rendendo”: banco, % do CDI e valor guardado. O app calcula todo dia, sem abrir o banco.'},
{e:'#gobjs',t:'Objetivos',x:'Meta com barra de progresso. Use os três pontinhos ⋯ para editar ou excluir.'},
{e:'#gobjnew',t:'Novo objetivo',x:'Crie um objetivo com meta em reais.'},
{e:'.gadj',t:'Ajustar total',x:'Digite o total real guardado e o app acerta.'},
{e:'#lista3',t:'Valores guardados',x:'Toque no ✎ para editar. Por voz: “guardei 100 no Inter”.'}],
pgp:[
{e:'#gaugePlan',t:'Sobra do mês',x:'Salário menos dívidas. O app sugere guardar 15%, 10% ou 8% da sobra.'},
{e:'#sal',t:'Salário',x:'Digite quanto você recebe por mês.'},
{e:'#addd',t:'Dívida fixa',x:'Nome e valor de uma conta fixa. Quitou? Toque no ×.'},
{e:'#addp',t:'Dívida parcelada',x:'Informe o total e as parcelas. Marque a do mês como paga e a próxima entra no mês seguinte.'},
{e:'#divok',t:'Salvar',x:'Toque para o app recalcular tudo.'}],
pgx:[
{e:'#xBox .icard',t:'Inteligência',x:'Previsão com contas a vencer, auditor que encontra gastos estranhos, simulador de compra e o seu patrimônio.'}],
pgi:[
{e:'#itabs',t:'Investir',x:'Três abas: Investir (simulador, onde guardar, metas e projeção), Planejamento (salário e dívidas) e Guardados.'},
{e:'#invBox .icard',t:'Taxas de hoje',x:'CDI, Selic, IPCA e poupança, buscados no Banco Central. Só as taxas vêm da internet: seus dados ficam no celular.'}],
pgk:[
{e:'#menab',t:'Mentor',x:'Converse com o mentor: resumo do dia, plano para sair das dívidas, missões e dúvidas.'}],
pg4:[
{e:'#hbusca',t:'Buscar',x:'Digite “uber” ou “mercado” para ver todos os lançamentos e o total, de todos os meses.'},
{e:'#relab',t:'Relatório',x:'Escolha o mês e veja gráficos, dicas e a comparação entre meses. Dá para salvar em PDF.'},
{e:'#listaHist',t:'Histórico',x:'Todos os lançamentos do mês. Toque para editar.'}],
pgc:[
{e:'#cfgdin',t:'Meu dinheiro',x:'Saldo, limite, contas, compras parceladas e CDI.'},
{e:'#cfglan',t:'Lançamentos',x:'Microfone, comprovante automático, memória e categorias.'},
{e:'#cfgseg',t:'Segurança e backup',x:'Digital e backup na nuvem. O backup por arquivo fica em “Mais opções”.'},
{e:'#cfgapa',t:'Aparência',x:'Tema claro, escuro ou automático.'},
{e:'#cfgcon',t:'Conta',x:'Novidades, tutorial, sair e apagar dados.'}],
pgr:[
{e:'#relmes',t:'Mês do relatório',x:'Escolha qual mês você quer ver.'},
{e:'#relpdf',t:'Baixar PDF',x:'Toque e escolha “Salvar como PDF”.'}],
sheet:[
{e:'#etipo',t:'Tipo',x:'Entrada, Útil, Desnecessário, Guardado ou sem categoria.'},
{e:'#ep',t:'Pagamento',x:'Crédito sai do Limite. Pix, débito e dinheiro saem do Disponível.'},
{e:'#epw',t:'Parcelas',x:'Compra parcelada: digite o valor total e escolha as parcelas.'},
{e:'#esalva',t:'Salvar',x:'Confirma o lançamento. Dá para editar depois.'}]},
TPG={pgx:'pgx',pg1:'pg1',pg3:'pgi',pgp:'pgi',pgi:'pgi',pgk:'pgk',pg4:'pg4',pgc:'pgc',pgr:'pgr'},tutAt=null;
function tutEl(s){var e=document.querySelector(s.e);if(!e)return null;var r=e.getBoundingClientRect();return(r.width>2&&r.height>2)?e:null}
function tour(k){if(!st||tutAt||!TUR[k]||(st.tut&&st.tut[k]))return;
if(k!=='sheet'){if(!$('edit').hidden)return;var pg=$(TPG[k]);if(!pg||pg.className.indexOf('on')<0)return;if(k==='pg3'&&IT.cur!=='gua')return;if(k==='pgp'&&IT.cur!=='pla')return;if(k==='pgi'&&IT.cur!=='inv')return;if(k==='pg1'&&gaugeIndex!==0)return}
else if($('edit').hidden)return;
var steps=TUR[k].filter(tutEl);if(!steps.length)return;tutAt={k:k,s:steps,i:0};$('tut').hidden=false;tutShow()}
function tutShow(){if(!tutAt)return;var S=tutAt.s,s=S[tutAt.i],e=tutEl(s);if(!e){tutNext(1);return}
var vh=window.innerHeight,vw=window.innerWidth,r0=e.getBoundingClientRect();
if(r0.top<8||r0.bottom>vh-8||r0.height>vh*0.5){try{e.scrollIntoView({block:r0.height>vh*0.5?'start':'center'})}catch(x){}}
var r=e.getBoundingClientRect(),pad=6,top=Math.max(4,r.top-pad),hh=Math.min(r.height+pad*2,vh*0.5),lf=Math.max(4,r.left-pad),ww=Math.min(r.width+pad*2,vw-8),H=$('tuth');
H.style.left=lf+'px';H.style.top=top+'px';H.style.width=ww+'px';H.style.height=hh+'px';
$('tutt').textContent=s.t;$('tutx').textContent=s.x;$('tutn').textContent=(tutAt.i+1)+'/'+S.length;$('tutv').hidden=tutAt.i===0;$('tutk').textContent=tutAt.i===S.length-1?'Entendi':'Próximo';
var B=$('tutb'),bw=Math.min(300,vw-24);B.style.width=bw+'px';B.style.left='0px';B.style.top='0px';var bh=B.offsetHeight,cx=lf+ww/2,bl=Math.max(12,Math.min(cx-bw/2,vw-bw-12)),below=(top+hh+12+bh<=vh-8),bt=below?top+hh+12:(top-12-bh>=8?top-12-bh:Math.max(8,vh-bh-8));
B.style.left=bl+'px';B.style.top=bt+'px';var A=$('tuta'),ab=!below&&top-12-bh>=8;A.style.display=(below||ab)?'':'none';A.style.left=Math.max(14,Math.min(cx-bl-7,bw-28))+'px';A.style.top=below?'-7px':'';A.style.bottom=below?'':'-7px';
$('tutk').focus()}
function tutNext(d){if(!tutAt)return;tutAt.i+=d;if(tutAt.i<0)tutAt.i=0;if(tutAt.i>=tutAt.s.length)tutFim();else tutShow()}
function tutFim(){if(!tutAt)return;var k=tutAt.k;tutAt=null;$('tut').hidden=true;if(st){if(!st.tut)st.tut={};st.tut[k]=1;save()}}
$('tutk').onclick=function(){tutNext(1)};$('tutv').onclick=function(){tutNext(-1)};$('tutp').onclick=tutFim;
document.addEventListener('keydown',function(e){if(tutAt&&e.key==='Escape')tutFim()});
window.addEventListener('resize',function(){if(tutAt)tutShow()});
$('tut').addEventListener('touchmove',function(e){e.preventDefault()},{passive:false});

