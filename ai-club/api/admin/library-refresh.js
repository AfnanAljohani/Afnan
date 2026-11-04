// POST /api/admin/library-refresh — «تحديث الآن» in the admin panel.
// Requires a signed-in admin (Supabase access token, checked on the server).
import { supabaseServerConfigured, env } from '../_lib/env.js';
import { send, fail, bearer, cors, methodGuard } from '../_lib/http.js';
import { serviceClient, requireAdmin } from '../_lib/supabase.js';
import { runLibraryJob } from '../_lib/library/job.js';

export const config = { maxDuration: 300 };

export default async function handler(req, res) {
  if (!cors(req, res, 'POST, OPTIONS')) return;
  if (!methodGuard(req, res, ['POST'])) return;
  const auth = await requireAdmin(bearer(req));
  if (auth.error) return fail(res, auth.error.status, auth.error.code, 'Admin sign-in required');
  if (!supabaseServerConfigured(env())) return fail(res, 503, 'supabase_not_configured', 'Supabase server key is not set');
  try {
    const result = await runLibraryJob(serviceClient(), { trigger: 'manual' });
    send(res, 200, result);
  } catch (e) {
    fail(res, 500, 'job_failed', String(e.message || e).slice(0, 200));
  }
}
