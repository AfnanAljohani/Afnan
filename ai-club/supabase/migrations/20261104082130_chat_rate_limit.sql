-- EWA AI Club · chat rate limiting
-- Serverless instances don't share memory, so the per-visitor request budget
-- for /api/chat is counted here. Only the server (service_role) can call it.
-- Keys are salted hashes of the visitor IP; raw IPs are never stored.

create table public.chat_rate (
  key          text not null check (char_length(key) = 64),
  window_start timestamptz not null,
  hits         integer not null default 0,
  primary key (key, window_start)
);
create index chat_rate_window_idx on public.chat_rate (window_start);

revoke all on public.chat_rate from public, anon, authenticated;
grant all on public.chat_rate to service_role;
alter table public.chat_rate enable row level security;
-- no policies: visitors have no access; service_role bypasses RLS

-- Count one request; return true when it is within the limit.
create or replace function public.chat_rate_hit(p_key text, p_limit integer, p_window_seconds integer)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  w timestamptz := to_timestamp(floor(extract(epoch from now()) / p_window_seconds) * p_window_seconds);
  n integer;
begin
  insert into public.chat_rate as r (key, window_start, hits)
  values (p_key, w, 1)
  on conflict (key, window_start) do update set hits = r.hits + 1
  returning r.hits into n;

  -- opportunistic cleanup of old windows
  if random() < 0.02 then
    delete from public.chat_rate where window_start < now() - interval '1 day';
  end if;

  return n <= p_limit;
end;
$$;
revoke all on function public.chat_rate_hit(text, integer, integer) from public, anon, authenticated;
grant execute on function public.chat_rate_hit(text, integer, integer) to service_role;
