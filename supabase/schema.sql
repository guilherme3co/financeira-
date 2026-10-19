-- =====================================================================
-- Minhas Finanças — molde completo do banco (Supabase / Postgres)
-- Recria tabelas, funções, permissões e a tarefa diária num projeto novo.
-- Como usar: Supabase → SQL Editor → cole este arquivo inteiro → Run.
-- Depois siga os passos do fim do arquivo (segredos e função "avisos").
-- Nenhuma tabela é acessível direto: o app só usa as funções (RPC).
-- =====================================================================

create extension if not exists pgcrypto with schema extensions;
create extension if not exists pg_cron;
create extension if not exists pg_net;

-- ---------- tabelas ----------
create table if not exists public.backups (
  id text not null,
  dados text not null,
  atualizado timestamptz not null default now(),
  criado timestamptz not null default now(),
  constraint backups_pkey primary key (id),
  constraint backups_id_check check (id ~ '^[a-f0-9]{64}$'),
  constraint backups_dados_check check (length(dados) >= 2 and length(dados) <= 6000000)
);

create table if not exists public.backup_versoes (
  id text not null,
  slot smallint not null,
  dados text not null,
  atualizado timestamptz not null default now(),
  constraint backup_versoes_pkey primary key (id, slot),
  constraint backup_versoes_id_check check (id ~ '^[a-f0-9]{64}$'),
  constraint backup_versoes_slot_check check (slot >= 0 and slot <= 6),
  constraint backup_versoes_dados_check check (length(dados) >= 2 and length(dados) <= 6000000)
);

create table if not exists public.casal (
  sala text not null,
  autor text not null,
  dados text not null default '',
  atualizado timestamptz not null default now(),
  criado timestamptz not null default now(),
  constraint casal_pkey primary key (sala, autor),
  constraint casal_sala_check check (sala ~ '^[a-f0-9]{64}$'),
  constraint casal_autor_check check (autor ~ '^[a-f0-9]{64}$')
);

create table if not exists public.avisos (
  id text not null,
  sub text not null default '',
  datas jsonb not null default '[]'::jsonb,
  atualizado timestamptz not null default now(),
  criado timestamptz not null default now(),
  acesso text,
  constraint avisos_pkey primary key (id),
  constraint avisos_id_check check (id ~ '^[a-f0-9]{64}$')
);

create table if not exists public.acessos (
  id text not null,
  nome text not null default '',
  status text not null default 'ok',
  admin boolean not null default false,
  legado boolean not null default false,
  convite text,
  criado timestamptz not null default now(),
  visto timestamptz not null default now(),
  constraint acessos_pkey primary key (id),
  constraint acessos_id_check check (id ~ '^[a-f0-9]{64}$'),
  constraint acessos_status_check check (status in ('ok','bloq','rem','exp'))
);

create table if not exists public.convites (
  codigo text not null,
  criado timestamptz not null default now(),
  expira timestamptz not null,
  usado_por text,
  usado_em timestamptz,
  cancelado boolean not null default false,
  constraint convites_pkey primary key (codigo)
);

create table if not exists public.config (
  chave text not null,
  valor text not null,
  constraint config_pkey primary key (chave)
);

alter table public.backups enable row level security;
alter table public.backup_versoes enable row level security;
alter table public.casal enable row level security;
alter table public.avisos enable row level security;
alter table public.acessos enable row level security;
alter table public.convites enable row level security;
alter table public.config enable row level security;
revoke all on public.backups, public.backup_versoes, public.casal, public.avisos, public.acessos, public.convites, public.config from anon, authenticated;

-- ---------- utilidades ----------
create or replace function public._hid(p text) returns text language sql immutable set search_path to '' as $f$
  select encode(sha256(convert_to(p,'UTF8')),'hex') $f$;

create or replace function public.ping() returns timestamptz language sql set search_path to '' as $f$ select now() $f$;

-- ---------- controle de acesso ----------
create or replace function public._acesso_exige(p_acesso text) returns text language plpgsql security definer set search_path to '' as $f$
declare r record;
begin
  if p_acesso is null or p_acesso !~ '^[a-f0-9]{64}$' then raise exception 'acesso negado'; end if;
  select * into r from public.acessos a where a.id = public._hid(p_acesso);
  if r is null or r.status <> 'ok' or (not r.admin and r.visto < now() - interval '30 days') then raise exception 'acesso negado'; end if;
  return r.id;
end $f$;

create or replace function public._admin_exige(p_acesso text) returns text language plpgsql security definer set search_path to '' as $f$
declare a text := public._acesso_exige(p_acesso);
begin
  if not exists (select 1 from public.acessos x where x.id = a and x.admin) then raise exception 'so o administrador'; end if;
  return a;
end $f$;

create or replace function public.acesso_entrar(p_acesso text, p_nome text, p_codigo text) returns text language plpgsql security definer set search_path to '' as $f$
declare a text; c record; r record; cod text := upper(regexp_replace(coalesce(p_codigo,''),'[^A-Za-z0-9]','','g'));
begin
  if p_acesso is null or p_acesso !~ '^[a-f0-9]{64}$' then raise exception 'acesso invalido'; end if;
  a := public._hid(p_acesso);
  select * into r from public.acessos x where x.id = a;
  if r is not null and r.status = 'bloq' then raise exception 'bloqueado'; end if;
  if r is not null and r.status = 'ok' and (r.admin or r.visto >= now() - interval '30 days') then update public.acessos set visto = now() where id = a; return 'ok'; end if;
  if length(cod) <> 11 or left(cod,3) <> 'FIN' then raise exception 'convite invalido'; end if;
  cod := 'FIN-' || substr(cod,4,4) || '-' || substr(cod,8,4);
  select * into c from public.convites v where v.codigo = cod for update;
  if c is null or c.cancelado or c.usado_por is not null then raise exception 'convite invalido'; end if;
  if c.expira < now() then raise exception 'convite vencido'; end if;
  update public.convites set usado_por = a, usado_em = now() where codigo = cod;
  insert into public.acessos(id, nome, status, convite, criado, visto) values (a, left(coalesce(p_nome,''),40), 'ok', cod, now(), now())
  on conflict (id) do update set status = 'ok', convite = excluded.convite, visto = now(), nome = case when excluded.nome <> '' then excluded.nome else public.acessos.nome end;
  return 'ok';
end $f$;

-- contas que já usavam o app antes dos convites (no máximo 2, até a data abaixo)
create or replace function public.acesso_legado(p_acesso text, p_nome text) returns text language plpgsql security definer set search_path to '' as $f$
declare a text;
begin
  if p_acesso is null or p_acesso !~ '^[a-f0-9]{64}$' then raise exception 'acesso invalido'; end if;
  a := public._hid(p_acesso);
  if exists (select 1 from public.acessos x where x.id = a) then return (select status from public.acessos x where x.id = a); end if;
  if now() > timestamptz '2026-11-30 23:59:59-03' or (select count(*) from public.acessos x where x.legado) >= 2 then raise exception 'precisa de convite'; end if;
  insert into public.acessos(id, nome, status, legado) values (a, left(coalesce(p_nome,''),40), 'ok', true);
  return 'ok';
end $f$;

create or replace function public.acesso_checar(p_acesso text, p_uso date) returns table(s text, adm boolean) language plpgsql security definer set search_path to '' as $f$
declare a text; r record; u timestamptz;
begin
  if p_acesso is null or p_acesso !~ '^[a-f0-9]{64}$' then raise exception 'acesso invalido'; end if;
  a := public._hid(p_acesso);
  select * into r from public.acessos x where x.id = a;
  if r is null then return query select 'nao'::text, false; return; end if;
  if r.status <> 'ok' then return query select r.status, r.admin; return; end if;
  u := greatest(r.visto, least(coalesce(p_uso::timestamptz + interval '12 hours', r.visto), now()));
  if not r.admin and u < now() - interval '30 days' then update public.acessos set status = 'exp' where id = a; return query select 'exp'::text, false; return; end if;
  update public.acessos set visto = now() where id = a;
  return query select 'ok'::text, r.admin;
end $f$;

create or replace function public.admin_ativar(p_acesso text, p_codigo text) returns boolean language plpgsql security definer set search_path to '' as $f$
declare a text := public._acesso_exige(p_acesso); h text;
begin
  select valor into h from public.config where chave = 'admin_ativacao';
  if h is null or h = '' or public._hid(upper(regexp_replace(coalesce(p_codigo,''),'[^A-Za-z0-9]','','g'))) <> h then raise exception 'codigo invalido'; end if;
  update public.acessos set admin = true where id = a;
  update public.config set valor = '' where chave = 'admin_ativacao';
  return true;
end $f$;

create or replace function public.admin_convite(p_acesso text) returns table(codigo text, expira timestamptz) language plpgsql security definer set search_path to '' as $f$
declare a text := public._admin_exige(p_acesso); al text := '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'; b bytea; cod text; i int;
begin
  if (select count(*) from public.convites v where v.usado_por is null and not v.cancelado and v.expira > now()) >= 20 then raise exception 'muitos convites abertos'; end if;
  loop
    b := extensions.gen_random_bytes(8); cod := '';
    for i in 0..7 loop cod := cod || substr(al, (get_byte(b,i) % 32) + 1, 1); end loop;
    cod := 'FIN-' || left(cod,4) || '-' || right(cod,4);
    exit when not exists (select 1 from public.convites v where v.codigo = cod);
  end loop;
  insert into public.convites(codigo, expira) values (cod, now() + interval '30 days');
  return query select cod, now() + interval '30 days';
end $f$;

create or replace function public.admin_lista(p_acesso text) returns jsonb language plpgsql security definer set search_path to '' as $f$
declare a text := public._admin_exige(p_acesso);
begin
  update public.acessos set status = 'exp' where status = 'ok' and not admin and visto < now() - interval '30 days';
  return jsonb_build_object(
   'usuarios', coalesce((select jsonb_agg(jsonb_build_object('id', left(x.id,16), 'nome', x.nome, 'status', x.status, 'admin', x.admin, 'eu', x.id = a, 'criado', x.criado, 'visto', x.visto) order by x.criado) from public.acessos x where x.status <> 'rem'), '[]'::jsonb),
   'convites', coalesce((select jsonb_agg(jsonb_build_object('codigo', v.codigo, 'expira', v.expira) order by v.criado desc) from public.convites v where v.usado_por is null and not v.cancelado and v.expira > now()), '[]'::jsonb),
   'espaco', pg_database_size(current_database()),
   'limite', 524288000);
end $f$;

create or replace function public.admin_status(p_acesso text, p_id text, p_status text) returns boolean language plpgsql security definer set search_path to '' as $f$
declare a text := public._admin_exige(p_acesso); n int;
begin
  if p_status not in ('ok','bloq','rem') or p_id !~ '^[a-f0-9]{16}$' then raise exception 'pedido invalido'; end if;
  if left(a,16) = p_id then raise exception 'nao pode mudar a propria conta'; end if;
  update public.acessos set status = p_status, visto = case when p_status = 'ok' then now() else visto end where left(id,16) = p_id and not admin;
  get diagnostics n = row_count; return n = 1;
end $f$;

create or replace function public.admin_cancela(p_acesso text, p_codigo text) returns boolean language plpgsql security definer set search_path to '' as $f$
declare a text := public._admin_exige(p_acesso);
begin
  update public.convites set cancelado = true where codigo = p_codigo and usado_por is null; return found;
end $f$;

-- ---------- backup na nuvem (internas: só chamadas pelas versões com acesso) ----------
create or replace function public.salvar_backup(p_id text, p_dados text) returns timestamptz language plpgsql security definer set search_path to '' as $f$
declare t timestamptz := now(); s smallint := extract(dow from (now() at time zone 'America/Fortaleza'))::smallint; ult timestamptz;
begin
  if p_id is null or p_id !~ '^[a-f0-9]{64}$' then raise exception 'id invalido'; end if;
  if p_dados is null or left(p_dados,1) <> '{' or length(p_dados) > 6000000 then raise exception 'dados invalidos'; end if;
  select b.atualizado into ult from public.backups b where b.id = p_id;
  if ult is not null and ult > t - interval '3 seconds' then raise exception 'muitos envios, tente em instantes'; end if;
  if ult is null and (select count(*) from public.backups b where b.criado > t - interval '1 hour') >= 50 then raise exception 'limite de novos backups atingido'; end if;
  insert into public.backups(id, dados, atualizado) values (p_id, p_dados, t)
  on conflict (id) do update set dados = excluded.dados, atualizado = excluded.atualizado;
  insert into public.backup_versoes(id, slot, dados, atualizado) values (p_id, s, p_dados, t)
  on conflict (id, slot) do update set dados = excluded.dados, atualizado = excluded.atualizado;
  return t;
end $f$;

create or replace function public.ler_backup(p_id text) returns table(dados text, atualizado timestamptz) language sql stable security definer set search_path to '' as $f$
  select b.dados, b.atualizado from public.backups b where p_id ~ '^[a-f0-9]{64}$' and b.id = p_id; $f$;

create or replace function public.apagar_backup(p_id text) returns boolean language plpgsql security definer set search_path to '' as $f$
declare n int;
begin
  if p_id is null or p_id !~ '^[a-f0-9]{64}$' then return false; end if;
  delete from public.backups where id = p_id;
  get diagnostics n = row_count;
  return n > 0;
end $f$;

create or replace function public.listar_versoes(p_id text) returns table(slot smallint, atualizado timestamptz) language sql stable security definer set search_path to '' as $f$
  select v.slot, v.atualizado from public.backup_versoes v where p_id ~ '^[a-f0-9]{64}$' and v.id = p_id and v.dados <> '{}' order by v.atualizado desc; $f$;

create or replace function public.ler_versao(p_id text, p_slot smallint) returns table(dados text, atualizado timestamptz) language sql stable security definer set search_path to '' as $f$
  select v.dados, v.atualizado from public.backup_versoes v where p_id ~ '^[a-f0-9]{64}$' and v.id = p_id and v.slot = p_slot and v.dados <> '{}'; $f$;

create or replace function public.limpar_versoes(p_id text) returns boolean language plpgsql security definer set search_path to '' as $f$
begin
  if p_id is null or p_id !~ '^[a-f0-9]{64}$' then return false; end if;
  update public.backup_versoes set dados = '{}', atualizado = now() where id = p_id;
  return true;
end $f$;

-- ---------- casal (internas) ----------
create or replace function public.casal_salvar(p_sala text, p_token text, p_dados text) returns timestamptz language plpgsql security definer set search_path to '' as $f$
declare t timestamptz := now(); a text; ult timestamptz;
begin
  if p_sala is null or p_sala !~ '^[a-f0-9]{64}$' then raise exception 'sala invalida'; end if;
  if p_token is null or p_token !~ '^[a-f0-9]{64}$' then raise exception 'token invalido'; end if;
  if p_dados is null or length(p_dados) > 400000 or (p_dados <> '' and left(p_dados,1) <> '{') then raise exception 'dados invalidos'; end if;
  a := encode(sha256(convert_to(p_token,'UTF8')),'hex');
  select c.atualizado into ult from public.casal c where c.sala = p_sala and c.autor = a;
  if ult is not null and ult > t - interval '3 seconds' then raise exception 'muitos envios, tente em instantes'; end if;
  if ult is null then
    if (select count(*) from public.casal c where c.sala = p_sala) >= 2 then raise exception 'casal completo'; end if;
    if (select count(*) from public.casal c where c.criado > t - interval '1 hour') >= 60 then raise exception 'limite atingido'; end if;
  end if;
  insert into public.casal(sala, autor, dados, atualizado) values (p_sala, a, p_dados, t)
  on conflict (sala, autor) do update set dados = excluded.dados, atualizado = excluded.atualizado;
  return t;
end $f$;

create or replace function public.casal_ler(p_sala text) returns table(autor text, dados text, atualizado timestamptz) language plpgsql security definer set search_path to '' as $f$
begin
  if p_sala is null or p_sala !~ '^[a-f0-9]{64}$' then raise exception 'sala invalida'; end if;
  return query select c.autor, c.dados, c.atualizado from public.casal c where c.sala = p_sala order by c.autor limit 2;
end $f$;

-- ---------- avisos (internas) ----------
create or replace function public.avisos_salvar(p_token text, p_sub text, p_datas jsonb) returns timestamptz language plpgsql security definer set search_path to '' as $f$
declare t timestamptz := now(); a text; ult timestamptz; ep text; s jsonb;
begin
  if p_token is null or p_token !~ '^[a-f0-9]{64}$' then raise exception 'token invalido'; end if;
  a := encode(sha256(convert_to(p_token,'UTF8')),'hex');
  if p_sub is null or length(p_sub) > 2000 then raise exception 'sub invalida'; end if;
  if p_sub <> '' then
    s := p_sub::jsonb;
    ep := s->>'endpoint';
    if ep is null or ep !~ '^https://(fcm\.googleapis\.com|web\.push\.apple\.com|updates\.push\.services\.mozilla\.com|[a-z0-9.-]+\.notify\.windows\.com)/' then raise exception 'endpoint nao permitido'; end if;
    if coalesce(s->'keys'->>'p256dh','') !~ '^[A-Za-z0-9_-]{80,100}$' or coalesce(s->'keys'->>'auth','') !~ '^[A-Za-z0-9_-]{16,30}$' then raise exception 'chaves invalidas'; end if;
  end if;
  if p_datas is null or jsonb_typeof(p_datas) <> 'array' or jsonb_array_length(p_datas) > 60 or length(p_datas::text) > 4000 then raise exception 'datas invalidas'; end if;
  select v.atualizado into ult from public.avisos v where v.id = a;
  if ult is not null and ult > t - interval '3 seconds' then raise exception 'muitos envios, tente em instantes'; end if;
  if ult is null and (select count(*) from public.avisos v where v.criado > t - interval '1 hour') >= 50 then raise exception 'limite atingido'; end if;
  insert into public.avisos(id, sub, datas, atualizado) values (a, p_sub, p_datas, t)
  on conflict (id) do update set sub = excluded.sub, datas = excluded.datas, atualizado = excluded.atualizado;
  return t;
end $f$;

-- usadas só pela função "avisos" (service_role)
create or replace function public.avisos_config() returns table(vapid_priv text, vapid_pub text, cron text) language sql security definer set search_path to '' as $f$
 select (select decrypted_secret from vault.decrypted_secrets where name='vapid_priv' limit 1),
        (select decrypted_secret from vault.decrypted_secrets where name='vapid_pub' limit 1),
        (select decrypted_secret from vault.decrypted_secrets where name='avisos_cron' limit 1) $f$;

create or replace function public.avisos_lista() returns table(id text, sub text, datas jsonb, atualizado timestamptz) language sql security definer set search_path to '' as $f$
 select v.id, v.sub, v.datas, v.atualizado from public.avisos v join public.acessos x on x.id = v.acesso
 where v.sub <> '' and x.status = 'ok' and (x.admin or x.visto > now() - interval '30 days') $f$;

create or replace function public.avisos_invalida(p_id text) returns void language sql security definer set search_path to '' as $f$
 update public.avisos set sub='' where id=p_id $f$;

-- ---------- funções que o app chama (todas exigem acesso liberado) ----------
create or replace function public.salvar_backup(p_id text, p_dados text, p_acesso text) returns timestamptz language plpgsql security definer set search_path to '' as $f$ begin perform public._acesso_exige(p_acesso); return public.salvar_backup(p_id, p_dados); end $f$;
create or replace function public.ler_backup(p_id text, p_acesso text) returns table(dados text, atualizado timestamptz) language plpgsql security definer set search_path to '' as $f$ begin perform public._acesso_exige(p_acesso); return query select * from public.ler_backup(p_id); end $f$;
create or replace function public.apagar_backup(p_id text, p_acesso text) returns boolean language plpgsql security definer set search_path to '' as $f$ begin perform public._acesso_exige(p_acesso); return public.apagar_backup(p_id); end $f$;
create or replace function public.listar_versoes(p_id text, p_acesso text) returns table(slot smallint, atualizado timestamptz) language plpgsql security definer set search_path to '' as $f$ begin perform public._acesso_exige(p_acesso); return query select * from public.listar_versoes(p_id); end $f$;
create or replace function public.ler_versao(p_id text, p_slot smallint, p_acesso text) returns table(dados text, atualizado timestamptz) language plpgsql security definer set search_path to '' as $f$ begin perform public._acesso_exige(p_acesso); return query select * from public.ler_versao(p_id, p_slot); end $f$;
create or replace function public.limpar_versoes(p_id text, p_acesso text) returns boolean language plpgsql security definer set search_path to '' as $f$ begin perform public._acesso_exige(p_acesso); return public.limpar_versoes(p_id); end $f$;
create or replace function public.casal_salvar(p_sala text, p_token text, p_dados text, p_acesso text) returns timestamptz language plpgsql security definer set search_path to '' as $f$ begin perform public._acesso_exige(p_acesso); return public.casal_salvar(p_sala, p_token, p_dados); end $f$;
create or replace function public.casal_ler(p_sala text, p_acesso text) returns table(autor text, dados text, atualizado timestamptz) language plpgsql security definer set search_path to '' as $f$ begin perform public._acesso_exige(p_acesso); return query select * from public.casal_ler(p_sala); end $f$;
create or replace function public.avisos_salvar(p_token text, p_sub text, p_datas jsonb, p_acesso text) returns timestamptz language plpgsql security definer set search_path to '' as $f$ declare a text := public._acesso_exige(p_acesso); t timestamptz; begin t := public.avisos_salvar(p_token, p_sub, p_datas); update public.avisos set acesso = a where id = public._hid(p_token); return t; end $f$;

-- ---------- permissões: nada liberado por padrão, só o que o app usa ----------
do $$ declare f record; begin
  for f in select p.oid::regprocedure as sig from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname = 'public' loop
    execute 'revoke all on function ' || f.sig || ' from public, anon, authenticated';
  end loop;
end $$;
grant execute on function
  public.ping(),
  public.acesso_entrar(text,text,text), public.acesso_legado(text,text), public.acesso_checar(text,date),
  public.admin_ativar(text,text), public.admin_convite(text), public.admin_lista(text), public.admin_status(text,text,text), public.admin_cancela(text,text),
  public.salvar_backup(text,text,text), public.ler_backup(text,text), public.apagar_backup(text,text),
  public.listar_versoes(text,text), public.ler_versao(text,smallint,text), public.limpar_versoes(text,text),
  public.casal_salvar(text,text,text,text), public.casal_ler(text,text),
  public.avisos_salvar(text,text,jsonb,text)
to anon;
grant execute on function public.avisos_config(), public.avisos_lista(), public.avisos_invalida(text) to service_role;

-- =====================================================================
-- DEPOIS DE RODAR ESTE ARQUIVO (só num projeto novo):
-- 1) Segredos no Vault (troque os valores; gere as chaves VAPID com `npx web-push generate-vapid-keys`):
--    select vault.create_secret('<CHAVE_PRIVADA_VAPID>', 'vapid_priv');
--    select vault.create_secret('<CHAVE_PUBLICA_VAPID>', 'vapid_pub');
--    select vault.create_secret('<SEGREDO_ALEATORIO_64_HEX>', 'avisos_cron');
--    A chave pública VAPID também vai no app (variável AV_PUB do index.html).
-- 2) Código para virar administrador (troque pelo seu, só letras A-Z e números):
--    insert into public.config(chave, valor) values ('admin_ativacao', public._hid('ADMXXXXYYYYZZZZ'));
--    (no app digite ADM-XXXX-YYYY-ZZZZ em ⚙ → Conta → Ativar administrador)
-- 3) Publique a função supabase/functions/avisos (sem verificação JWT).
-- 4) Tarefa diária às 9h (Fortaleza = 12h UTC):
--    select cron.schedule('avisos-diarios', '0 12 * * *', $c$select net.http_post(
--      url:='https://<PROJETO>.supabase.co/functions/v1/avisos',
--      headers:=jsonb_build_object('content-type','application/json','x-cron',(select decrypted_secret from vault.decrypted_secrets where name='avisos_cron')),
--      body:='{}'::jsonb, timeout_milliseconds:=60000)$c$);
-- 5) No app (index.html), troque SB_URL e SB_KEY pelo endereço e a chave publishable do projeto novo.
-- =====================================================================
