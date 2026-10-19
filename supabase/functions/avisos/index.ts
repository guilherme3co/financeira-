// Função "avisos" do Supabase: manda as notificações de contas a vencer.
// Roda todo dia às 9h (Fortaleza) chamada pelo pg_cron e, uma vez, quando alguém liga os avisos (aviso de teste).
// O servidor só conhece as DATAS de vencimento: nunca nomes nem valores.
import webpush from 'npm:web-push@3.6.7';

const URL_ = Deno.env.get('SUPABASE_URL')!;
const SRK = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const SITE = 'https://guilherme3co.github.io';
const H = { 'access-control-allow-origin': SITE, 'access-control-allow-headers': 'apikey, content-type', 'access-control-allow-methods': 'POST, OPTIONS', 'content-type': 'application/json' };

async function rpc(fn: string, args: unknown = {}) {
  const r = await fetch(`${URL_}/rest/v1/rpc/${fn}`, { method: 'POST', headers: { apikey: SRK, Authorization: `Bearer ${SRK}`, 'content-type': 'application/json' }, body: JSON.stringify(args) });
  if (!r.ok) throw new Error(fn + ' ' + r.status + ' ' + (await r.text()));
  const t = await r.text();
  return t ? JSON.parse(t) : null;
}
function dia(off: number) {
  const d = new Date(Date.now() - 3 * 3600e3 + off * 864e5);
  return d.toISOString().slice(0, 10);
}
async function hex(s: string) {
  const b = new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)));
  return Array.from(b).map((x) => x.toString(16).padStart(2, '0')).join('');
}
function iguais(a: string, b: string) {
  if (!a || !b || a.length !== b.length) return false;
  let r = 0; for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}
const plural = (n: number) => n === 1 ? '1 conta' : n + ' contas';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: H });
  if (req.method !== 'POST') return new Response('{}', { status: 405, headers: H });
  let body: any = {};
  try { body = await req.json(); } catch (_) { /* vazio */ }
  const [cfg] = await rpc('avisos_config');
  webpush.setVapidDetails(SITE + '/financeiro/', cfg.vapid_pub, cfg.vapid_priv);
  const lista: any[] = await rpc('avisos_lista');
  const envia = async (row: any, msg: object) => {
    try {
      await webpush.sendNotification(JSON.parse(row.sub), JSON.stringify(msg), { TTL: 86400, urgency: 'normal' });
      return 'ok';
    } catch (e: any) {
      const st = e && e.statusCode;
      if (st === 404 || st === 410) { await rpc('avisos_invalida', { p_id: row.id }); return 'expirou'; }
      return 'erro ' + (st || '');
    }
  };
  // teste pedido pelo próprio aparelho (só logo depois de ligar os avisos)
  if (typeof body.token === 'string' && /^[a-f0-9]{64}$/.test(body.token)) {
    const id = await hex(body.token);
    const row = lista.find((r) => r.id === id);
    if (!row || Date.now() - Date.parse(row.atualizado) > 120000) return new Response(JSON.stringify({ ok: false }), { status: 400, headers: H });
    const r = await envia(row, { t: 'Avisos ligados ✅', b: 'Você vai receber aqui os lembretes das contas.', tag: 'teste' });
    return new Response(JSON.stringify({ ok: r === 'ok', r }), { headers: H });
  }
  // rodada diária (pg_cron)
  if (!iguais(req.headers.get('x-cron') || '', cfg.cron || '')) return new Response('{}', { status: 401, headers: H });
  const hoje = dia(0), em3 = dia(3), amanha = dia(1);
  let env = 0, exp = 0, err = 0;
  for (const row of lista) {
    const ds: any[] = Array.isArray(row.datas) ? row.datas : [];
    const n = (d: string) => ds.filter((x) => x && x.d === d).reduce((a, x) => a + Math.max(1, Math.min(20, Number(x.n) || 1)), 0);
    const h = n(hoje), a = n(amanha), t3 = n(em3);
    let msg: any = null;
    if (h) msg = { t: '📅 Conta vence hoje', b: plural(h) + (h === 1 ? ' vence hoje.' : ' vencem hoje.') + ' Toque para ver.', tag: 'venc-' + hoje };
    else if (a) msg = { t: '📅 Conta vence amanhã', b: plural(a) + (a === 1 ? ' vence amanhã.' : ' vencem amanhã.') + ' Toque para ver.', tag: 'venc-' + amanha };
    else if (t3) msg = { t: '📅 Conta vence em 3 dias', b: plural(t3) + (t3 === 1 ? ' vence' : ' vencem') + ' em 3 dias. Toque para ver.', tag: 'venc-' + em3 };
    if (!msg) continue;
    const r = await envia(row, msg);
    if (r === 'ok') env++; else if (r === 'expirou') exp++; else err++;
  }
  return new Response(JSON.stringify({ hoje, total: lista.length, enviados: env, expirados: exp, erros: err }), { headers: H });
});
