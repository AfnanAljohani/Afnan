// Server-side configuration. Everything comes from environment variables
// (Vercel → Project → Settings → Environment Variables); nothing secret is
// ever sent to the browser except the Supabase publishable key, which is
// public by design and protected by RLS.

const num = (v, d) => (Number.isFinite(+v) && v !== '' && v != null ? +v : d);

export function env() {
  const e = process.env;
  return {
    supabaseUrl: (e.SUPABASE_URL || '').replace(/\/+$/, ''),
    supabasePublishableKey: e.SUPABASE_PUBLISHABLE_KEY || e.SUPABASE_ANON_KEY || '',
    supabaseSecretKey: e.SUPABASE_SECRET_KEY || e.SUPABASE_SERVICE_ROLE_KEY || '',

    ollamaUrl: (e.OLLAMA_URL || '').replace(/\/+$/, ''),
    ollamaModel: e.OLLAMA_MODEL || '',
    ollamaApiKey: e.OLLAMA_API_KEY || '',          // Bearer token (Ollama Cloud or your own reverse proxy)
    ollamaTimeoutMs: num(e.OLLAMA_TIMEOUT_MS, 45000),

    chatMaxMessageChars: num(e.CHAT_MAX_MESSAGE_CHARS, 800),
    chatMaxTurns: num(e.CHAT_MAX_TURNS, 8),
    chatRateLimit: num(e.CHAT_RATE_LIMIT, 20),          // requests …
    chatRateWindowSec: num(e.CHAT_RATE_WINDOW_SECONDS, 600), // … per window, per visitor
    rateSalt: e.RATE_LIMIT_SALT || e.CRON_SECRET || '',

    cronSecret: e.CRON_SECRET || '',
    librarySummaryLimit: num(e.LIBRARY_SUMMARY_LIMIT, 20),
    libraryTimeBudgetMs: num(e.LIBRARY_TIME_BUDGET_MS, 240000),

    // Comma-separated list of origins allowed to call the API from a browser.
    // Same-origin requests (the site itself) never need CORS.
    allowedOrigins: (e.ALLOWED_ORIGINS || 'https://ewa-ai.vercel.app')
      .split(',').map(s => s.trim().replace(/\/+$/, '')).filter(Boolean),
    siteUrl: (e.SITE_URL || 'https://ewa-ai.vercel.app').replace(/\/+$/, ''),
  };
}

export const ollamaConfigured = c => Boolean(c.ollamaUrl && c.ollamaModel);
export const supabaseConfigured = c => Boolean(c.supabaseUrl && c.supabasePublishableKey);
export const supabaseServerConfigured = c => Boolean(c.supabaseUrl && c.supabaseSecretKey);
