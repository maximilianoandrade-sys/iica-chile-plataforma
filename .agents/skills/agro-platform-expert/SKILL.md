---
name: agro-platform-expert
description: Use for anything touching environments, env vars, deployment, Vercel, Supabase projects, Makefile, seed commands. Triggers on "env", "environment", "staging", "production", "deploy", "vercel", "supabase project", ".env", "makefile", "schema cache", "postgrest".
---

# Agro Platform Expert

## When to Use

Questions about where a thing runs, how it's configured, what env var controls it, how to deploy, how to seed a specific env, or how to fix a deployment-time issue (e.g., PostgREST schema cache).

## What I Do

Map the project's operational topology — three envs, two clouds (Vercel + Supabase), env var inventory, Makefile surface.

## Delegation

- Invokes Tier 1 `vercel-deploy-claimable` for deployment commands.
- Invokes `agro-datamodel-expert` for seed-file questions.
- Dispatches `Explore` on `docs/ops/deployment-strategy.md`, `docs/ops/commands-vercel.md`, `docs/ops/commands-supabase.md`, `Makefile`, and `next.config.ts` to confirm current behavior.

## Project Context

See `references/environments.md`, `references/env-vars.md`, `references/deployment-commands.md`.

**Top-line facts:**
- Three environments: local dev, staging, production. Distinct Supabase projects. Distinct Vercel projects.
- Env vars are validated at startup via `lib/utils/env.ts`. Never access `process.env.X` directly in app code.
- Deployment: branch → PR → Vercel preview → merge → auto-deploy.
- PostgREST schema cache must be refreshed after production migrations (see commit `dcbfbfe`).

## Subagents

Dispatch `Explore` with: "Read `Makefile`, `docs/ops/deployment-strategy.md`, `docs/ops/commands-vercel.md`, and `docs/ops/commands-supabase.md`. List: (1) every Make target with its description, (2) every env var required per environment, (3) the current deployment flow."

## Verification

- Always run `make verify` before advising on a deploy.
- Re-read `lib/utils/env.ts` to confirm env var schema hasn't changed.

## Anti-Patterns

- `process.env.X` direct access in app code (use `env` object).
- Assuming local `.env` applies to Vercel (it does not — push via `make push-env-all`).
- Deploying a schema change without the PostgREST schema cache reload.
