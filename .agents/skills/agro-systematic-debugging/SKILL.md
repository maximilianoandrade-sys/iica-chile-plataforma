---
name: agro-systematic-debugging
description: Use when a bug, test failure, or unexpected behavior is reported in Ciruela Certificada. Wraps superpowers:systematic-debugging and seeds the hypothesis list with project-common pitfalls. Triggers on "bug", "broken", "fails", "unexpected", "stack trace", "error 500".
---

# Agro Systematic Debugging

## When to Use

Any defect, flaky test, or surprising behavior.

## What I Do

1. Seed the hypothesis list with project-common pitfalls (below).
2. Invoke `superpowers:systematic-debugging`.
3. Cross-reference with domain experts for subsystem-specific behavior.

## Delegation

- Invokes `superpowers:systematic-debugging` (required).
- Invokes `agro-datamodel-expert` if error shape suggests RLS/schema.
- Invokes `agro-platform-expert` if error shape suggests env var / deploy.

## Project-common hypotheses (check these first)

1. **Next.js 15+ async params** — `params.id` used without `await`. Symptom: `undefined` or type error.
2. **Supabase client at module scope in `'use client'`** — SSR-time crash or undefined client. Fix: move into `useEffect` or event handler.
3. **RLS blocking the query** — empty results where rows exist. Isolate by running the same query with `createAdminClient()`; if that works, it's RLS.
4. **PostgREST schema cache stale** — "relation does not exist" or "column does not exist" in production after a migration. Fix: reload schema in Supabase dashboard (see `dcbfbfe`).
5. **API response nesting** — `result.data` vs `result.data?.data`. Always use optional chain fallback.
6. **Validated env missing** — `lib/utils/env.ts` throws at startup if a var is missing. Check Vercel env list.
7. **Wrong Supabase client** — `createClient` (client-side) vs `createServerClient` (server-side, RLS-aware) vs `createAdminClient` (server-only, bypasses RLS).

## Anti-Patterns

- Starting with `console.log` spray. Start with a hypothesis.
- Fixing symptoms without isolating cause (e.g., catching errors to hide them).
