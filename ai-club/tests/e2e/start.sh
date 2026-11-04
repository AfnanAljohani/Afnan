#!/usr/bin/env bash
# Start an isolated local stack for browser tests (test data only):
#   PostgreSQL db "ewa_ai_e2e" (fresh, migrations + 2 test accounts)
#   fake Supabase API :54400 · fake Ollama :54500 · site + /api :3000
# usage: PGHOST=127.0.0.1 PGPORT=54329 PGUSER=postgres tests/e2e/start.sh
set -euo pipefail
cd "$(dirname "$0")/../.."
DB=ewa_ai_e2e
psql -q -v ON_ERROR_STOP=1 -d postgres -c "drop database if exists $DB" -c "create database $DB"
if psql -q -d "$DB" -tAc "select 1 from pg_roles where rolname='anon'" | grep -q 1; then
  sed -n '/^create schema auth;/,$p' tests/db/supabase_stub.sql | psql -q -v ON_ERROR_STOP=1 -d "$DB"
else
  psql -q -v ON_ERROR_STOP=1 -d "$DB" -f tests/db/supabase_stub.sql
fi
for f in supabase/migrations/*.sql; do psql -q -v ON_ERROR_STOP=1 -d "$DB" -f "$f"; done
psql -q -v ON_ERROR_STOP=1 -d "$DB" <<'SQL'
insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-00000000a001','admin@test.local'),
  ('00000000-0000-0000-0000-00000000b002','member@test.local');
insert into private.admins (user_id, email) values ('00000000-0000-0000-0000-00000000a001','admin@test.local');
SQL

mkdir -p tests/e2e/.run
export TEST_DATABASE_URL="postgres://postgres@${PGHOST:-127.0.0.1}:${PGPORT:-5432}/$DB"
export FAKE_SB_USERS="admin@test.local:Admin-Test-Pass-2026!:00000000-0000-0000-0000-00000000a001,member@test.local:Member-Test-Pass-2026!:00000000-0000-0000-0000-00000000b002"
export FAKE_SB_JWT_SECRET="e2e-$(date +%s)-$RANDOM"
[ -f tests/e2e/.run/cert.pem ] || openssl req -x509 -newkey rsa:2048 -nodes -days 2 -subj "/CN=127.0.0.1" -addext "subjectAltName=IP:127.0.0.1" -keyout tests/e2e/.run/key.pem -out tests/e2e/.run/cert.pem 2>/dev/null
export FAKE_SB_TLS_DIR=tests/e2e/.run
node tests/e2e/fake-supabase.mjs > tests/e2e/.run/supabase.log 2>&1 & echo $! > tests/e2e/.run/supabase.pid
node tests/e2e/fake-ollama.mjs   > tests/e2e/.run/ollama.log 2>&1 & echo $! > tests/e2e/.run/ollama.pid

cat > tests/e2e/.run/env <<'ENV'
SUPABASE_URL=https://127.0.0.1:54400
SUPABASE_PUBLISHABLE_KEY=sb_publishable_TEST_ONLY
SUPABASE_SECRET_KEY=sb_secret_TEST_ONLY
OLLAMA_URL=http://127.0.0.1:54500
OLLAMA_MODEL=test-model
OLLAMA_API_KEY=test-ollama-key
OLLAMA_TIMEOUT_MS=8000
CRON_SECRET=test-cron-secret-0123456789abcdef
LIBRARY_FIXTURE_DIR=tests/fixtures/feeds
LIBRARY_SUMMARY_LIMIT=5
CHAT_RATE_LIMIT=12
ALLOWED_ORIGINS=http://localhost:3000
ENV
NODE_EXTRA_CA_CERTS=tests/e2e/.run/cert.pem ENV_FILE=tests/e2e/.run/env PORT=3000 node scripts/dev-server.mjs > tests/e2e/.run/site.log 2>&1 & echo $! > tests/e2e/.run/site.pid
sleep 1.5
echo "stack up: site http://localhost:3000 · admin http://localhost:3000/admin"
