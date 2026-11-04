// GET /api/cron/library — the daily library update (08:00 Asia/Riyadh).
// Called by the scheduler with `Authorization: Bearer <CRON_SECRET>`:
//   * Supabase Cron (pg_cron + pg_net) — see supabase/setup/schedule_library.sql
//   * or Vercel Cron, which sends the same header automatically when CRON_SECRET is set.
import { env, supabaseServerConfigured } from '../_lib/env.js';
import { send, fail, bearer, safeEqual, methodGuard } from '../_lib/http.js';
import { serviceClient } from '../_lib/supabase.js';
import { runLibraryJob } from '../_lib/library/job.js';

export const config = { maxDuration: 300 };

export default async function handler(req, res) {
  if (!methodGuard(req, res, ['GET', 'POST'])) return;
  const c = env();
  if (!c.cronSecret) return fail(res, 503, 'cron_not_configured', 'CRON_SECRET is not set');
  if (!safeEqual(bearer(req), c.cronSecret)) return fail(res, 401, 'unauthorized', 'Unauthorized');
  if (!supabaseServerConfigured(c)) return fail(res, 503, 'supabase_not_configured', 'Supabase server key is not set');
  try {
    const result = await runLibraryJob(serviceClient(), { trigger: 'schedule' });
    send(res, result.skipped ? 202 : result.ok ? 200 : 207, result);
  } catch (e) {
    fail(res, 500, 'job_failed', String(e.message || e).slice(0, 200));
  }
}
