// Bnan AI · backend connection.
// Leave both values empty to run fully offline (content from js/content-data.js, contact form via email).
// After setting up Supabase (see backend/README.md), paste your project URL and anon (public) key here.
// The anon key is safe to publish: Row Level Security limits it to reading published content
// and sending contact requests.
window.BNAN_CONFIG = {
  supabaseUrl: '',
  supabaseAnonKey: '',
  contactEmail: 'a.almass3dii@gmail.com',
  requestTimeoutMs: 5000,
  // Name of the Supabase Edge Function that runs the Claude agent (backend/supabase/functions).
  chatFunction: 'ask-banan',
  chatTimeoutMs: 60000
};
