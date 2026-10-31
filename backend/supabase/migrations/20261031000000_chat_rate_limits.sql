-- Bnan AI: per-visitor rate limit for the "Ask Banan" chat agent.
-- Only the Edge Function (service role) touches this table; visitors have no access.

create table if not exists public.chat_rate_limits (
  ip_hash      text not null,
  window_start timestamptz not null,
  hits         integer not null default 0 check (hits >= 0),
  primary key (ip_hash, window_start)
);

-- Lets old windows be cleared cheaply (see backend/README.md).
create index if not exists chat_rate_limits_window_idx on public.chat_rate_limits (window_start);

alter table public.chat_rate_limits enable row level security;
revoke all on public.chat_rate_limits from anon, authenticated;

-- Counts one message for this visitor in the current hour; true while under the limit.
-- A single upsert, so concurrent messages from the same visitor can't skip the count.
create or replace function public.chat_rate_hit(p_ip_hash text, p_limit integer)
returns boolean
language sql
set search_path = ''
as $$
  insert into public.chat_rate_limits as r (ip_hash, window_start, hits)
  values (p_ip_hash, date_trunc('hour', now()), 1)
  on conflict (ip_hash, window_start) do update set hits = r.hits + 1
  returning r.hits <= p_limit;
$$;

revoke execute on function public.chat_rate_hit(text, integer) from public, anon, authenticated;
grant execute on function public.chat_rate_hit(text, integer) to service_role;
