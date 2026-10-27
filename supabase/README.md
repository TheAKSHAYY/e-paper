# Supabase Infrastructure & Database Migrations

This directory manages database migrations, Row-Level Security (RLS) policies, and pgTAP automated test suites for E-Paper Studio.

## Structure

- `migrations/`: Sequential PostgreSQL migration scripts applied via Supabase CLI.
- `tests/`: Automated database assertion suites (pgTAP / unit verification).

## Local Development (When Supabase CLI is installed)

```bash
# Start local Supabase container stack (PostgreSQL, GoTrue, PostgREST, Inbucket, Storage)
supabase start

# Apply local migrations
supabase migration up

# Run database tests
supabase test db
```
