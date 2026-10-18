/* Teste diário do Minhas Finanças: abre o app num navegador de verdade e confere o básico.
   Não usa nenhum dado real: cria uma conta de teste e simula o servidor. */
const {chromium}=require('playwright');
const http=require('http'),fs=require('fs'),path=require('path'),crypto=require('crypto');
const RAIZ=path.join(__dirname,'..'),PORTA=8790,BASE='http://localhost:'+PORTA+'/';
const TIPOS={'.html':'text/html','.js':'text/javascript','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.woff':'font/woff','.wasm':'application/wasm','.txt':'text/plain'};
const srv=http.createServer((q,r)=>{let u=decodeURIComponent(q.url.split('?')[0]);let f=path.normalize(path.join(RAIZ,u==='/'?'index.html':u));if(!f.startsWith(RAIZ)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.statusCode=404;return r.end()}r.setHeader('content-type',TIPOS[path.extname(f)]||'application/octet-stream');r.end(fs.readFileSync(f))}).listen(PORTA);
let ok=0,falhas=[];const t=(n,c)=>{console.log((c?'✅ ':'❌ ')+n);if(c)ok++;else falhas.push(n)};
const SENHA='Zq7!mTeste42x',DB={},BK={};
async function servidorFalso(ctx){
 await ctx.route(/^https:\/\/(?!localhost)/,async route=>{const req=route.request(),u=req.url(),H={'access-control-allow-origin':'*','access-control-allow-headers':'*','content-type':'application/json'};
  if(!/ezivqczibtsqqqzpzcdh\.supabase\.co/.test(u))return route.fulfill({status:503,body:''});
  if(req.method()==='OPTIONS')return route.fulfill({status:200,headers:H});const fn=u.split('/rpc/')[1]||'',q=JSON.parse(req.postData()||'{}'),ok_=b=>route.fulfill({status:200,headers:H,body:JSON.stringify(b)});
  if(fn==='casal_salvar'){const a=crypto.createHash('sha256').update(q.p_token).digest('hex'),s=DB[q.p_sala]=DB[q.p_sala]||{};if(!s[a]&&Object.keys(s).length>=2)return route.fulfill({status:400,headers:H,body:'{"message":"casal completo"}'});s[a]={dados:q.p_dados,atualizado:new Date().toISOString()};return ok_(new Date().toISOString())}
  if(fn==='casal_ler'){const s=DB[q.p_sala]||{};return ok_(Object.keys(s).map(a=>({autor:a,dados:s[a].dados,atualizado:s[a].atualizado})))}
  if(fn==='salvar_backup'){BK[q.p_id]=q.p_dados;return ok_(new Date().toISOString())}
  return ok_(null)})}
async function novaConta(ctx,nome){const pg=await ctx.newPage(),erros=[];pg.on('pageerror',e=>erros.push(e.message));pg.on('console',m=>{if(/Content Security Policy|Refused to/.test(m.text()))erros.push('CSP: '+m.text())});
 await pg.goto(BASE);const v=await pg.evaluate(()=>VERSAO);await pg.evaluate(v=>localStorage.setItem('financas-visto',v),v);
 await pg.fill('#un',nome);await pg.fill('#up',SENHA);if(await pg.isVisible('#up2'))await pg.fill('#up2',SENHA);if(await pg.isVisible('#ucod'))await pg.fill('#ucod','FIN-TEST-2345');await pg.check('#ulem');await pg.click('#uok');
 await pg.waitForSelector('#ini0',{state:'visible',timeout:30000});await pg.fill('#ini0','1000');await pg.waitForSelector('#recs',{state:'visible',timeout:5000}).catch(()=>{});if(await pg.isVisible('#recs'))await pg.click('#recok');await pg.click('#ini0ok');await pg.waitForTimeout(800);
 await pg.evaluate(()=>{st.tut={pg1:1,pg3:1,pgp:1,pgk:1,pg4:1,pgc:1,pgr:1,pgi:1,pgx:1,sheet:1};document.getElementById('tut').hidden=true;document.getElementById('nov').hidden=true;save()});
 return {pg,erros}}
async function lanca(pg,frase){await pg.click('#fab');await pg.click('#ablan');if(await pg.isHidden('#frase'))await pg.click('#digita');await pg.fill('#frase',frase);await pg.click('#digok');await pg.waitForTimeout(400);if(await pg.isVisible('#edit'))await pg.click('#eok').catch(()=>{});await pg.waitForTimeout(200)}
(async()=>{
 const b=await chromium.launch({executablePath:process.env.CHROME||undefined,args:['--no-sandbox']});
 const ctx=await b.newContext({timezoneId:'America/Fortaleza',locale:'pt-BR',viewport:{width:390,height:800}});await servidorFalso(ctx);
 const {pg,erros}=await novaConta(ctx,'Teste Diario');
 t('app abre e cria a conta',await pg.isVisible('#fab'));
 // arquivos que o app precisa
 for(const a of ['sw.js','manifest.json','icon.svg','qr/jsqr.js','pdf/pdfw.js','fonts/dm-sans.woff'])t('arquivo no ar: '+a,(await pg.evaluate(u=>fetch(u).then(r=>r.status),a))===200);
 // lançar digitando
 await lanca(pg,'gastei 12,50 no pix na padaria');
 t('lança gasto digitado (12,50 no Pix)',await pg.evaluate(()=>st.items.some(i=>i.val===12.5&&/pix/i.test(i.pay))));
 await lanca(pg,'recebi 200 no pix');
 t('lança entrada',await pg.evaluate(()=>st.items.some(i=>i.ent&&i.val===200)));
 // menu + e todas as telas
 await pg.click('#fab');t('+ mostra as 6 opções',(await pg.$$eval('#mais .maisl button',a=>a.length))===6);await pg.keyboard.press('Escape');
 for(const [id,pgid] of [['abinv','pgi'],['abint','pgx'],['abmen','pgk'],['abhis','pg4'],['abcas','pgy']]){await pg.click('#fab');await pg.click('#'+id);await pg.waitForTimeout(400);t('abre a tela '+pgid,await pg.evaluate(p=>document.getElementById(p).className.indexOf('on')>=0,pgid))}
 t('histórico mostra os lançamentos',/padaria/i.test(await pg.textContent('#listaHist')));
 // configurações
 await pg.click('#eng');await pg.waitForTimeout(300);const blocos=await pg.$$eval('#cfg details.cfgs',a=>a.length);
 await pg.$$eval('#cfg details.cfgs',a=>a.forEach(d=>d.open=true));await pg.waitForTimeout(400);t('⚙ abre os '+blocos+' blocos',blocos>=7);
 t('checkup de segurança aparece',/criptografados/.test(await pg.textContent('#chkl')));
 // relatório
 await pg.evaluate(()=>vaiPagina(3));await pg.click('#relab');await pg.waitForTimeout(800);t('relatório do mês abre',await pg.evaluate(()=>document.getElementById('pgr').className.indexOf('on')>=0));
 // dados criptografados e reabrir com a senha
 const cru=await pg.evaluate(()=>Object.keys(localStorage).map(k=>localStorage.getItem(k)).join('|'));t('nada legível no armazenamento',!/padaria/i.test(cru));
 await pg.evaluate(()=>{try{sessionStorage.clear()}catch(e){}});await pg.evaluate(()=>indexedDB.databases?indexedDB.databases().then(ds=>Promise.all(ds.map(d=>new Promise(r=>{const q=indexedDB.deleteDatabase(d.name);q.onsuccess=q.onerror=q.onblocked=()=>r()})))):0);
 await pg.reload();await pg.waitForTimeout(1500);if(await pg.isVisible('#up')){await pg.fill('#up',SENHA);await pg.press('#up','Enter')}await pg.waitForTimeout(2500);
 t('reabre com a senha e os dados continuam',await pg.evaluate(()=>!!st&&st.items.some(i=>i.val===12.5)));
 // casal entre dois celulares (código digitado)
 await pg.evaluate(()=>{abreCfg(false,'cfgcas')});await pg.waitForTimeout(200);await pg.click('#casmos');await pg.waitForTimeout(800);const cod=await pg.textContent('#cascod');
 const ctx2=await b.newContext({timezoneId:'America/Fortaleza',viewport:{width:390,height:800}});await servidorFalso(ctx2);const B=await novaConta(ctx2,'Teste Par');
 await lanca(B.pg,'gastei 30 no débito na farmacia');
 await B.pg.evaluate(()=>abreCfg(false,'cfgcas'));await B.pg.click('#casler');await B.pg.fill('#qcode',cod);await B.pg.click('#casdig');await B.pg.waitForTimeout(2500);
 await pg.evaluate(()=>vaiPagina(5));await pg.click('#cyBox .cytop button');await pg.waitForTimeout(2500);
 t('casal: vê os gastos do par',/farm/i.test(await pg.textContent('#cyBox')));
 t('casal: servidor não vê nada legível',!/farmacia|padaria/i.test(JSON.stringify(DB)));
 const todos=erros.concat(B.erros).filter(e=>!/localStorage/.test(e));t('sem erros de JavaScript nem de segurança (CSP)',todos.length===0);if(todos.length)console.log(todos.join('\n'));
 await b.close();srv.close();
 console.log('\n'+ok+' ok, '+falhas.length+' falha(s)');if(falhas.length){console.log('FALHOU: '+falhas.join(' | '));process.exit(1)}
})().catch(e=>{console.log('ERRO NO TESTE:',e.message);srv.close();process.exit(1)});
