import { createClient } from '@supabase/supabase-js';
import { env, supabaseServerConfigured } from './env.js';

let admin = null;

/** Server-only client with the secret key (bypasses RLS). Never expose it. */
export function serviceClient() {
  const c = env();
  if (!supabaseServerConfigured(c)) return null;
  admin ||= createClient(c.supabaseUrl, c.supabaseSecretKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  return admin;
}

/**
 * Verifies the caller's Supabase access token and asks the database whether
 * that user is an admin (the same private.is_admin() check RLS uses).
 * Returns { user } or { error: {status, code} }.
 */
export async function requireAdmin(token) {
  const c = env();
  if (!c.supabaseUrl || !c.supabasePublishableKey) return { error: { status: 503, code: 'supabase_not_configured' } };
  if (!token) return { error: { status: 401, code: 'not_signed_in' } };
  const userClient = createClient(c.supabaseUrl, c.supabasePublishableKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const { data: u, error: ue } = await userClient.auth.getUser(token);
  if (ue || !u?.user) return { error: { status: 401, code: 'invalid_session' } };
  const { data: isAdmin, error: ae } = await userClient.rpc('am_i_admin');
  if (ae) return { error: { status: 500, code: 'admin_check_failed' } };
  if (isAdmin !== true) return { error: { status: 403, code: 'not_admin' } };
  return { user: { id: u.user.id, email: u.user.email } };
}
