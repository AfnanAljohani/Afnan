#!/usr/bin/env bash
# Apply the migrations to a throwaway database and run the RLS tests.
# usage: PGHOST=127.0.0.1 PGPORT=54329 PGUSER=postgres tests/db/run.sh
set -euo pipefail
cd "$(dirname "$0")/../.."
DB="${TEST_DB:-ewa_ai_test}"
psql -q -v ON_ERROR_STOP=1 -d postgres -c "drop database if exists $DB" -c "create database $DB"
# roles are cluster-wide; create them once
psql -q -d "$DB" -tc "select 1 from pg_roles where rolname='anon'" | grep -q 1 || true
if ! psql -q -d "$DB" -tAc "select 1 from pg_roles where rolname='anon'" | grep -q 1; then
  psql -q -v ON_ERROR_STOP=1 -d "$DB" -f tests/db/supabase_stub.sql
else
  # roles exist; recreate only the per-database parts
  sed -n '/^create schema auth;/,$p' tests/db/supabase_stub.sql | psql -q -v ON_ERROR_STOP=1 -d "$DB"
fi
for f in supabase/migrations/*.sql; do
  echo "== $f"
  psql -q -v ON_ERROR_STOP=1 -d "$DB" -f "$f"
done
echo "== RLS tests"
psql -q -t -A -v ON_ERROR_STOP=1 -d "$DB" -f tests/db/rls_test.sql 2>&1 | grep -E "ok |FAIL|ERROR" | sed "s/^psql:[^:]*:[0-9]*: //"
