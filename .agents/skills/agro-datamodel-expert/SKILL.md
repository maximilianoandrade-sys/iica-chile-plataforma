---
name: agro-datamodel-expert
description: Use for anything touching the Supabase schema in Ciruela Certificada — migrations, RLS policies, FK naming, table design, seed strategy, client init, database types generation. Triggers on "migration", "RLS", "schema", "foreign key", "fk_", "table", "seed", "supabase client", "business_team_members", "gen_random_uuid".
---

# Agro Datamodel Expert

## When to Use

Any migration, RLS policy, table/column change, seed script work, or Supabase client concern in this project. Also invoked by `agro-writing-plans` when a plan touches `supabase/migrations/` or `lib/supabase/`.

## What I Do

Hold the project's datamodel conventions and invariants, and invoke official Supabase skills for product-level knowledge.

## Delegation

- Invokes Tier 1 `supabase` for product-feature questions (Auth, Storage, Realtime, Edge Functions).
- Invokes Tier 1 `supabase-postgres-best-practices` for perf/schema-design guidance.
- Invokes `agro-platform-expert` for per-env seed commands and project refs.
- Dispatches `Explore` to scan `supabase/migrations/` and `lib/supabase/` before advising.

## Project Context

**FK naming convention:** `fk_<table>_<column>` (e.g., `fk_businesses_owner`). NOT `<table>_<column>_fkey`. When querying `information_schema.table_constraints`, filter with the `fk_` prefix.

**RLS baseline (every new table):**
```sql
-- Own data
USING (user_id = auth.uid())

-- Business owner
USING (business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid()))

-- Team member
USING (business_id IN (
  SELECT business_id FROM business_team_members
  WHERE user_id = auth.uid() AND is_active = true
))

-- Admin bypass
USING (is_admin())
```

**Authorization model:** Business-level, not per-installation. Users with team-member access see ALL installations under that business.

**Client init rules (CRITICAL — SSR pitfall):**
- Never instantiate a client at module scope in `'use client'` files.
- `useMemo(() => createClient(), [])` also runs during SSR — forbidden.
- Client-side: inside `useEffect` or event handlers.
- Server-side: `createServerClient()` (RLS-aware) or `createAdminClient()` (bypasses RLS — server routes only).

**Seed strategy:**
- `seed_standards.sql` — mandatory, all environments.
- `seed-prod.sql` / `seed-staging.sql` — user_types only.
- `seed-dev.sql` — full mock data (local only).

**Misc:**
- Use `gen_random_uuid()` not `uuid_generate_v4()`.
- After migration, regenerate types: `supabase gen types typescript --project-id <id> > lib/database.types.ts`.
- Response nesting: `result.data?.data || result.data || []`.

See `references/rls-patterns.md`, `references/fk-naming.md`, `references/seed-strategy.md`.

## Subagents

Dispatch `Explore` with: "List all files under `supabase/migrations/` created since <date>. For each, extract table names, RLS policy names, and FK constraint names. Report any FK not matching `fk_<table>_<column>` pattern."

## Verification

Before advising on RLS or migrations:
1. `ls supabase/migrations/ | tail -5` — know what's current.
2. Read the latest migration touching the table in question.
3. Grep for the table name in `lib/database.types.ts` to confirm regenerated types exist.

## Anti-Patterns

- `table_column_fkey` FK naming (breaks project's `information_schema` queries).
- RLS policy without a name (`CREATE POLICY ... ON ...` with no name).
- Creating a table without RLS enabled.
- Writing `SUPABASE_URL` env access bypassing `@/lib/utils/env`.
- Calling `createAdminClient()` from a client component (exposes service role).
- Forgetting to regenerate `lib/database.types.ts` after a migration.
