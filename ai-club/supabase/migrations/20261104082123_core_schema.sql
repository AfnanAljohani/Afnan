-- EWA AI Club · core schema
-- Content the admin panel manages: site documents (survey, department leaders,
-- announcements, heroes, video), news & events, club projects, chatbot knowledge.
--
-- Access model
--   * anon / authenticated visitors: read published content only.
--   * admins (rows in private.admins): full read/write, checked in RLS.
--   * service_role (server functions only): bypasses RLS.
-- New public tables are not exposed to the Data API by default (Supabase change
-- enforced 2026-10-30), so every table below carries explicit GRANTs + RLS.

-- ---------------------------------------------------------------------------
-- Admin registry (non-exposed schema)
-- ---------------------------------------------------------------------------
create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to anon, authenticated, service_role;

create table private.admins (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  email      text not null,
  created_at timestamptz not null default now()
);
revoke all on private.admins from public, anon, authenticated;

-- True when the caller's JWT belongs to a registered admin.
-- SECURITY DEFINER so policies can read private.admins without exposing it;
-- it only ever answers for auth.uid(), never for an arbitrary user.
create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from private.admins a where a.user_id = (select auth.uid())
  );
$$;
revoke all on function private.is_admin() from public;
grant execute on function private.is_admin() to anon, authenticated, service_role;

-- RPC for the admin UI ("am I an admin?"). Invoker rights: it can only report
-- on the caller.
create or replace function public.am_i_admin()
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$ select private.is_admin(); $$;
revoke all on function public.am_i_admin() from public;
grant execute on function public.am_i_admin() to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Shared helpers
-- ---------------------------------------------------------------------------
create type public.publish_status as enum ('draft', 'published', 'hidden');

create or replace function private.touch_updated()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  new.updated_by := (select auth.uid());
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- site_docs: small JSON documents addressed by path, e.g. 'site/config',
-- 'site/video', 'heroes/r01'. Backs the page's existing db.doc()/collection()
-- calls so the original editors keep working outside Claude.
-- ---------------------------------------------------------------------------
create table public.site_docs (
  path       text primary key check (path ~ '^[a-z0-9_-]{1,40}/[a-z0-9_-]{1,40}$'),
  data       jsonb not null default '{}'::jsonb check (pg_column_size(data) < 64000),
  updated_at timestamptz not null default now(),
  updated_by uuid
);
create trigger site_docs_touch before insert or update on public.site_docs
  for each row execute function private.touch_updated();

grant select on public.site_docs to anon, authenticated;
grant insert, update, delete on public.site_docs to authenticated;
grant all on public.site_docs to service_role;
alter table public.site_docs enable row level security;

create policy "site_docs: public read" on public.site_docs
  for select to anon, authenticated using (true);
create policy "site_docs: admin insert" on public.site_docs
  for insert to authenticated with check ((select private.is_admin()));
create policy "site_docs: admin update" on public.site_docs
  for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "site_docs: admin delete" on public.site_docs
  for delete to authenticated using ((select private.is_admin()));

-- ---------------------------------------------------------------------------
-- content_items: news cards and events/workshops shown on the home page
-- ---------------------------------------------------------------------------
create table public.content_items (
  id          uuid primary key default gen_random_uuid(),
  kind        text not null check (kind in ('news', 'event')),
  title       text not null check (char_length(title) between 1 and 200),
  body        text check (char_length(body) <= 2000),
  event_type  text check (event_type in ('ورشة', 'لقاء', 'معسكر')),
  event_date  date,
  date_label  text check (date_label in ('', 'open')),     -- news: '' = "قريبًا", 'open' = registration open
  place       text check (char_length(place) <= 120),
  duration    text check (char_length(duration) <= 60),
  tags        text[] not null default '{}' check (cardinality(tags) <= 8),
  image_url   text check (image_url is null or image_url ~ '^(https://|img/)'),
  link_url    text check (link_url is null or link_url ~ '^(https://|#)'),
  status      public.publish_status not null default 'draft',
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  updated_by  uuid
);
create index content_items_list_idx on public.content_items (kind, status, sort_order, event_date);
create trigger content_items_touch before update on public.content_items
  for each row execute function private.touch_updated();

grant select on public.content_items to anon, authenticated;
grant insert, update, delete on public.content_items to authenticated;
grant all on public.content_items to service_role;
alter table public.content_items enable row level security;

create policy "content: read published or admin" on public.content_items
  for select to anon, authenticated
  using (status = 'published' or (select private.is_admin()));
create policy "content: admin insert" on public.content_items
  for insert to authenticated with check ((select private.is_admin()));
create policy "content: admin update" on public.content_items
  for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "content: admin delete" on public.content_items
  for delete to authenticated using ((select private.is_admin()));

-- ---------------------------------------------------------------------------
-- projects: «مشاريع النادي»
-- ---------------------------------------------------------------------------
create table public.projects (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique check (slug ~ '^[a-z0-9-]{2,60}$'),
  title       text not null check (char_length(title) between 1 and 160),
  author      text not null check (char_length(author) between 1 and 120),
  description text not null check (char_length(description) between 1 and 1200),
  url         text not null check (url ~ '^https://'),
  cover_url   text check (cover_url is null or cover_url ~ '^(https://|img/)'),
  cover_is_screenshot boolean not null default false,  -- true only for a real capture of the project
  tags        text[] not null default '{}' check (cardinality(tags) <= 8),
  status      public.publish_status not null default 'draft',
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  updated_by  uuid
);
create index projects_list_idx on public.projects (status, sort_order);
create trigger projects_touch before update on public.projects
  for each row execute function private.touch_updated();

grant select on public.projects to anon, authenticated;
grant insert, update, delete on public.projects to authenticated;
grant all on public.projects to service_role;
alter table public.projects enable row level security;

create policy "projects: read published or admin" on public.projects
  for select to anon, authenticated
  using (status = 'published' or (select private.is_admin()));
create policy "projects: admin insert" on public.projects
  for insert to authenticated with check ((select private.is_admin()));
create policy "projects: admin update" on public.projects
  for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "projects: admin delete" on public.projects
  for delete to authenticated using ((select private.is_admin()));

-- ---------------------------------------------------------------------------
-- chatbot_knowledge: approved facts the assistant may answer from.
-- Not readable by visitors directly; the /api/chat function reads it with the
-- service key and only sends published rows to the model.
-- ---------------------------------------------------------------------------
create table public.chatbot_knowledge (
  id          uuid primary key default gen_random_uuid(),
  title       text not null check (char_length(title) between 1 and 160),
  body        text not null check (char_length(body) between 1 and 4000),
  lang        text not null default 'ar' check (lang in ('ar', 'en')),
  tags        text[] not null default '{}' check (cardinality(tags) <= 12),
  status      public.publish_status not null default 'draft',
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  updated_by  uuid
);
create index chatbot_knowledge_status_idx on public.chatbot_knowledge (status, sort_order);
create trigger chatbot_knowledge_touch before update on public.chatbot_knowledge
  for each row execute function private.touch_updated();

grant select, insert, update, delete on public.chatbot_knowledge to authenticated;
grant all on public.chatbot_knowledge to service_role;
alter table public.chatbot_knowledge enable row level security;

create policy "kb: admin read" on public.chatbot_knowledge
  for select to authenticated using ((select private.is_admin()));
create policy "kb: admin insert" on public.chatbot_knowledge
  for insert to authenticated with check ((select private.is_admin()));
create policy "kb: admin update" on public.chatbot_knowledge
  for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "kb: admin delete" on public.chatbot_knowledge
  for delete to authenticated using ((select private.is_admin()));

-- ---------------------------------------------------------------------------
-- Storage: one public bucket for images, video and captions.
-- Limits are enforced by Storage itself (size + MIME allow-list).
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'media', 'media', true, 52428800,  -- 50 MB (Free-plan global upload limit)
  array['image/webp', 'image/png', 'image/jpeg', 'image/avif', 'video/mp4', 'video/webm', 'text/vtt']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Public reads go through the public bucket URL. Writes: admins only.
-- (Upsert needs INSERT + SELECT + UPDATE.)
create policy "media: admin select" on storage.objects
  for select to authenticated using (bucket_id = 'media' and (select private.is_admin()));
create policy "media: admin insert" on storage.objects
  for insert to authenticated with check (bucket_id = 'media' and (select private.is_admin()));
create policy "media: admin update" on storage.objects
  for update to authenticated
  using (bucket_id = 'media' and (select private.is_admin()))
  with check (bucket_id = 'media' and (select private.is_admin()));
create policy "media: admin delete" on storage.objects
  for delete to authenticated using (bucket_id = 'media' and (select private.is_admin()));
