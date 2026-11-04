-- Daily library update at 08:00 Asia/Riyadh = 05:00 UTC/GMT (Saudi Arabia has no DST).
-- Supabase Cron runs schedules in GMT. Run once in Dashboard → SQL Editor
-- after the site is deployed and CRON_SECRET is set in Vercel.
-- Requires the pg_cron and pg_net extensions (Dashboard → Database → Extensions).

create extension if not exists pg_cron;
create extension if not exists pg_net;

-- Store the endpoint and the shared secret in Vault (not in this file).
-- Replace both values below before running; do not commit the filled-in copy.
select vault.create_secret('https://ewa-ai.vercel.app/api/cron/library', 'library_cron_url');
select vault.create_secret('REPLACE-WITH-THE-SAME-CRON_SECRET-AS-VERCEL', 'library_cron_secret');

select cron.schedule(
  'library-daily-0800-riyadh',
  '0 5 * * *',
  $$
  select net.http_get(
    url := (select decrypted_secret from vault.decrypted_secrets where name = 'library_cron_url'),
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'library_cron_secret')
    ),
    timeout_milliseconds := 290000
  ) as request_id;
  $$
);

-- ---------------------------------------------------------------------------
-- Check it:
--   select jobid, jobname, schedule, active from cron.job;
--   select status, start_time, return_message from cron.job_run_details
--     where jobid = (select jobid from cron.job where jobname = 'library-daily-0800-riyadh')
--     order by start_time desc limit 10;
--   -- HTTP answer from the site (200 = ok, 207 = finished with some source errors):
--   select status_code, created, left(content::text, 300) from net._http_response order by created desc limit 5;
--   -- What the job did (also visible in /admin → المكتبة الرقمية → سجل التشغيل):
--   select started_at, ok, sources_ok, sources_total, items_new, items_updated, errors from public.library_runs order by started_at desc limit 10;
-- Stop it:
--   select cron.unschedule('library-daily-0800-riyadh');
