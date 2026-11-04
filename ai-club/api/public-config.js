// GET /api/public-config — what the browser needs to talk to Supabase.
// Only the publishable key (public by design, guarded by RLS) and feature
// flags. No secrets, no service URLs for Ollama.
import { env, supabaseConfigured, ollamaConfigured } from './_lib/env.js';
import { send, cors, methodGuard } from './_lib/http.js';

export default function handler(req, res) {
  if (!cors(req, res, 'GET, OPTIONS')) return;
  if (!methodGuard(req, res, ['GET'])) return;
  const c = env();
  send(res, 200, {
    supabaseUrl: supabaseConfigured(c) ? c.supabaseUrl : null,
    supabaseKey: supabaseConfigured(c) ? c.supabasePublishableKey : null,
    features: {
      database: supabaseConfigured(c),
      chat: ollamaConfigured(c),
    },
  }, { 'Cache-Control': 'public, max-age=300' });
}
