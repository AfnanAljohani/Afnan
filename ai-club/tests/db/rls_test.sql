-- RLS / grant tests. Run after the migrations on a disposable database.
-- Every check raises an exception on failure, so psql -v ON_ERROR_STOP=1 exits non-zero.
\set ON_ERROR_STOP 1

insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-00000000a001', 'admin@test.local'),
  ('00000000-0000-0000-0000-00000000b002', 'member@test.local');
insert into private.admins (user_id, email) values ('00000000-0000-0000-0000-00000000a001', 'admin@test.local');

-- a draft row visitors must not see
insert into public.projects (slug, title, author, description, url, status)
values ('draft-test', 'مسودة', 'test', 'لا تظهر للزوار', 'https://example.com/', 'draft');

create or replace function pg_temp.expect(ok boolean, label text) returns void language plpgsql as $$
begin
  if not ok then raise exception 'FAIL: %', label; end if;
  raise notice 'ok  %', label;
end $$;

create or replace function pg_temp.fails(sql text, label text) returns void language plpgsql as $$
begin
  begin
    execute sql;
  exception when insufficient_privilege or check_violation or unique_violation then
    raise notice 'ok  % (blocked)', label; return;
  end;
  raise exception 'FAIL: % was allowed', label;
end $$;

-- ===== anonymous visitor ===================================================
begin;
set local role anon;
select pg_temp.expect((select count(*) from public.projects) = 1, 'anon sees only the published project');
select pg_temp.expect((select count(*) from public.content_items where kind='news') = 6, 'anon sees published news');
select pg_temp.expect((select count(*) from public.site_docs) >= 1, 'anon can read site docs');
select pg_temp.expect((select count(*) from public.library_categories) = 6, 'anon sees categories');
select pg_temp.expect((select public.am_i_admin()) = false, 'anon is not admin');
select pg_temp.fails($q$select count(*) from public.chatbot_knowledge$q$, 'anon reading chatbot knowledge');
select pg_temp.fails($q$select count(*) from private.admins$q$, 'anon reading admin list');
select pg_temp.fails($q$select errors from public.library_runs$q$, 'anon reading run errors');
select pg_temp.fails($q$select filter_keywords from public.library_sources$q$, 'anon reading source config');
select pg_temp.fails($q$insert into public.site_docs(path,data) values ('site/x','{}')$q$, 'anon writing site docs');
select pg_temp.fails($q$update public.projects set title='x'$q$, 'anon updating projects');
select pg_temp.fails($q$select public.chat_rate_hit(repeat('a',64), 5, 60)$q$, 'anon calling rate limiter');
commit;

-- ===== signed-in non-admin =================================================
begin;
set local role authenticated;
set local request.jwt.claims = '{"sub":"00000000-0000-0000-0000-00000000b002","role":"authenticated"}';
select pg_temp.expect((select public.am_i_admin()) = false, 'member is not admin');
select pg_temp.expect((select count(*) from public.projects) = 1, 'member sees only published projects');
select pg_temp.expect((select count(*) from public.chatbot_knowledge) = 0, 'member sees no chatbot knowledge');
select pg_temp.fails($q$insert into public.content_items(kind,title,status) values ('news','x','published')$q$, 'member inserting news');
select pg_temp.fails($q$insert into public.site_docs(path,data) values ('heroes/r01','{}')$q$, 'member writing heroes');
select pg_temp.fails($q$insert into storage.objects(bucket_id,name) values ('media','x.png')$q$, 'member uploading media');
-- updates by a non-admin silently match 0 rows under RLS
with u as (update public.projects set title = 'hacked' returning 1) select pg_temp.expect((select count(*) from u) = 0, 'member update affects 0 rows');
with d as (delete from public.content_items returning 1) select pg_temp.expect((select count(*) from d) = 0, 'member delete affects 0 rows');
commit;

-- ===== admin ===============================================================
begin;
set local role authenticated;
set local request.jwt.claims = '{"sub":"00000000-0000-0000-0000-00000000a001","role":"authenticated"}';
select pg_temp.expect((select public.am_i_admin()) = true, 'admin is admin');
select pg_temp.expect((select count(*) from public.projects) = 2, 'admin sees drafts too');
select pg_temp.expect((select count(*) from public.chatbot_knowledge) = 10, 'admin reads chatbot knowledge');
insert into public.site_docs(path,data) values ('heroes/r01','{"entries":[{"name":"تجربة","points":90}]}');
update public.projects set status = 'hidden' where slug = 'draft-test';
insert into public.content_items(kind,title,status) values ('news','خبر تجريبي','draft');
insert into storage.objects(bucket_id,name) values ('media','projects/test.webp');
select pg_temp.expect((select updated_by from public.site_docs where path='heroes/r01') = '00000000-0000-0000-0000-00000000a001', 'updated_by recorded');
select pg_temp.fails($q$insert into public.projects(slug,title,author,description,url) values ('bad','x','x','x','javascript:alert(1)')$q$, 'admin cannot save a javascript: URL');
select pg_temp.fails($q$insert into public.site_docs(path,data) values ('../etc','{}')$q$, 'path traversal in doc path');
select pg_temp.expect((select count(*) from public.library_runs) = 0, 'admin can read run log');
rollback;

-- ===== server (service_role) ==============================================
begin;
set local role service_role;
select pg_temp.expect(public.chat_rate_hit(repeat('a',64), 2, 60), 'rate hit 1 allowed');
select pg_temp.expect(public.chat_rate_hit(repeat('a',64), 2, 60), 'rate hit 2 allowed');
select pg_temp.expect(not public.chat_rate_hit(repeat('a',64), 2, 60), 'rate hit 3 blocked');
insert into public.library_runs(trigger, ok, finished_at, errors) values ('schedule', true, now(), '[{"source":"x","error":"secret detail"}]');
insert into public.library_runs(trigger, ok, finished_at) values ('schedule', false, now());
commit;

begin;
set local role anon;
select pg_temp.expect((select count(*) from (select id, finished_at from public.library_runs) r) = 1, 'anon sees only the successful run');
commit;

-- duplicate URL hash is rejected (dedupe guarantee)
begin;
set local role service_role;
insert into public.library_items(source_name,url,url_hash,title,language,content_type) values ('t','https://a.example/x','h1','t','en','news');
select pg_temp.fails($q$insert into public.library_items(source_name,url,url_hash,title,language,content_type) values ('t','https://a.example/x','h1','t2','en','news')$q$, 'duplicate item');
rollback;
