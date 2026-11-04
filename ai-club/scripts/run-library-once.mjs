// Run the library update once from a terminal (same code as the daily job).
//   npm run library:run            → uses .env.local
//   ENV_FILE=path npm run library:run
// Needs SUPABASE_URL + SUPABASE_SECRET_KEY; OLLAMA_* is optional (summaries).
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const envFile = process.env.ENV_FILE || path.join(ROOT, '.env.local');
if (existsSync(envFile)) {
  for (const line of readFileSync(envFile, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}

const { serviceClient } = await import('../api/_lib/supabase.js');
const { runLibraryJob } = await import('../api/_lib/library/job.js');

const db = serviceClient();
if (!db) {
  console.error('SUPABASE_URL and SUPABASE_SECRET_KEY are required (see .env.example).');
  process.exit(2);
}
const result = await runLibraryJob(db, { trigger: 'manual' });
console.log(JSON.stringify(result, null, 2));
process.exit(result.ok || result.skipped ? 0 : 1);
