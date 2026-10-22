-- Bnan AI: initial schema
-- Public content (projects, decks, graphics) is read-only for visitors.
-- Contact requests are write-only for visitors and readable only by the owner (service role / dashboard).

-- ---------------------------------------------------------------------------
-- Shared trigger: keep updated_at current
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- projects
-- ---------------------------------------------------------------------------
create table if not exists public.projects (
  id           bigint generated always as identity primary key,
  slug         text not null unique,
  status       text not null check (status in ('in_progress', 'completed', 'exploring')),
  progress     smallint not null default 0 check (progress between 0 and 100),
  icon         text not null default 'web' check (icon in ('web', 'bot', 'mic', 'eye', 'chart')),
  year_label   text not null,
  tags         text[] not null default '{}',
  title_ar     text not null check (char_length(title_ar) between 1 and 160),
  title_en     text not null check (char_length(title_en) between 1 and 160),
  summary_ar   text not null default '',
  summary_en   text not null default '',
  sort_order   integer not null default 0,
  is_published boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- The site always reads published rows in display order: index exactly that.
create index if not exists projects_published_sort_idx
  on public.projects (sort_order) where is_published;

create or replace trigger projects_set_updated_at
  before update on public.projects
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- decks (presentation designs)
-- ---------------------------------------------------------------------------
create table if not exists public.decks (
  id             bigint generated always as identity primary key,
  slug           text not null unique,
  title_ar       text not null check (char_length(title_ar) between 1 and 160),
  title_en       text not null check (char_length(title_en) between 1 and 160),
  summary_ar     text not null default '',
  summary_en     text not null default '',
  tag_ar         text not null default '',
  tag_en         text not null default '',
  pages          text[] not null check (cardinality(pages) between 1 and 60),
  cover_index    smallint not null default 0 check (cover_index >= 0),
  cover_position text not null default 'top',
  sort_order     integer not null default 0,
  is_published   boolean not null default true,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  constraint decks_cover_in_range check (cover_index < cardinality(pages))
);

create index if not exists decks_published_sort_idx
  on public.decks (sort_order) where is_published;

create or replace trigger decks_set_updated_at
  before update on public.decks
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- graphics (graphic design gallery)
-- ---------------------------------------------------------------------------
create table if not exists public.graphics (
  id           bigint generated always as identity primary key,
  slug         text not null unique,
  category     text not null check (category in ('logo', 'post', 'banner', 'icon')),
  image_path   text not null,
  caption_ar   text not null default '',
  caption_en   text not null default '',
  sort_order   integer not null default 0,
  is_published boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists graphics_published_sort_idx
  on public.graphics (sort_order) where is_published;

create or replace trigger graphics_set_updated_at
  before update on public.graphics
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- contact_requests (inbox for the contact form)
-- ---------------------------------------------------------------------------
create table if not exists public.contact_requests (
  id           bigint generated always as identity primary key,
  request_type text not null check (request_type in ('join', 'service', 'idea', 'partner')),
  name         text not null check (char_length(btrim(name)) between 1 and 120),
  email        text not null check (char_length(email) <= 254 and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  message      text not null check (char_length(btrim(message)) between 1 and 4000),
  lang         text not null default 'ar' check (lang in ('ar', 'en')),
  status       text not null default 'new' check (status in ('new', 'replied', 'archived')),
  created_at   timestamptz not null default now()
);

-- Triage view in the dashboard: newest unhandled requests first.
create index if not exists contact_requests_new_idx
  on public.contact_requests (created_at desc) where status = 'new';

-- ---------------------------------------------------------------------------
-- Privileges: least privilege for the public API roles
-- ---------------------------------------------------------------------------
revoke all on public.projects, public.decks, public.graphics, public.contact_requests from anon, authenticated;

grant select on public.projects, public.decks, public.graphics to anon, authenticated;

-- Visitors may only insert these columns; status, id and created_at stay server-controlled.
grant insert (request_type, name, email, message, lang) on public.contact_requests to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.projects         enable row level security;
alter table public.decks            enable row level security;
alter table public.graphics         enable row level security;
alter table public.contact_requests enable row level security;

drop policy if exists "Published projects are public" on public.projects;
create policy "Published projects are public" on public.projects
  for select to anon, authenticated
  using (is_published);

drop policy if exists "Published decks are public" on public.decks;
create policy "Published decks are public" on public.decks
  for select to anon, authenticated
  using (is_published);

drop policy if exists "Published graphics are public" on public.graphics;
create policy "Published graphics are public" on public.graphics
  for select to anon, authenticated
  using (is_published);

-- Anyone can send a request; nobody but the owner (service role) can read them back.
drop policy if exists "Visitors can send contact requests" on public.contact_requests;
create policy "Visitors can send contact requests" on public.contact_requests
  for insert to anon, authenticated
  with check (status = 'new');
