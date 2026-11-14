-- Bnan AI: group projects into AI, data and innovation for the site's project filters.
alter table public.projects add column if not exists category text not null default 'ai';

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'projects_category_check' and conrelid = 'public.projects'::regclass) then
    alter table public.projects add constraint projects_category_check check (category in ('ai', 'data', 'innovation'));
  end if;
end $$;
