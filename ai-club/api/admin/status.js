// GET /api/admin/status — configuration health for the admin panel.
// Returns booleans and model name only; never URLs or keys.
import { env, ollamaConfigured, supabaseServerConfigured } from '../_lib/env.js';
import { send, fail, bearer, cors, methodGuard } from '../_lib/http.js';
import { requireAdmin } from '../_lib/supabase.js';
import { ollamaPing } from '../_lib/ollama.js';

export default async function handler(req, res) {
  if (!cors(req, res, 'GET, OPTIONS')) return;
  if (!methodGuard(req, res, ['GET'])) return;
  const auth = await requireAdmin(bearer(req));
  if (auth.error) return fail(res, auth.error.status, auth.error.code, 'Admin sign-in required');
  const c = env();
  const ollama = await ollamaPing();
  send(res, 200, {
    signedInAs: auth.user.email,
    supabaseServerKey: supabaseServerConfigured(c),
    cronSecret: Boolean(c.cronSecret),
    ollama: { ...ollama, model: ollamaConfigured(c) ? c.ollamaModel : null, auth: Boolean(c.ollamaApiKey) },
  });
}
