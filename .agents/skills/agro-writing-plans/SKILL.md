---
name: agro-writing-plans
description: Use when writing an implementation plan for any Ciruela Certificada feature. Wraps superpowers:writing-plans and prepends agro-specific required checks. Triggers on "plan", "implementation plan", "spec is ready", "plan out this feature".
---

# Agro Writing Plans

## When to Use

After a spec exists (approved, in `docs/superpowers/specs/`) and you need to turn it into an implementation plan.

## What I Do

1. Load required project context (`CLAUDE.md` and recent commits via `git log -20 --oneline`).
2. Surface agro-specific mandatory checks that must appear in the plan.
3. Invoke `superpowers:writing-plans` via the Skill tool.
4. Invoke domain experts when the spec touches their area.

## Delegation

- Invokes `superpowers:writing-plans` (required).
- Invokes `agro-datamodel-expert` if spec mentions DB changes.
- Invokes `agro-onboarding-ux-expert` if spec mentions onboarding.
- Invokes `agro-certification-workflow-expert` if spec mentions surveys/certification.
- Invokes `agro-ui-design-expert` if spec has UI changes.
- Invokes `agro-platform-expert` if spec touches env vars / deploy.

## Mandatory checks to include in every plan

Every plan's tasks must, where relevant, assert:
- No `console.*` — use `getLogger('Module')`.
- API routes use `createSuccessResponse` / `createErrorResponse`.
- Next.js 15+ async params: `params: Promise<{...}>`, `const { id } = await params;`.
- Supabase client init obeys SSR rules (no top-level `createClient()` in `'use client'`, no `useMemo` wrapper).
- Every new table has RLS enabled and at least one named policy.
- No `process.env.X` in app code — use `env` from `lib/utils/env.ts`.
- After a migration task, include a type regeneration step.

## Workflow

1. Read the spec referenced by the user.
2. Read `CLAUDE.md` and `docs/superpowers/skills/README.md`.
3. For each domain the spec touches, invoke the matching domain-expert skill.
4. Invoke `superpowers:writing-plans` — it handles the task decomposition, file mapping, and self-review.
5. Before finalizing, grep the plan for the mandatory checks above and add them where missing.

## Anti-Patterns

- Writing the plan yourself without invoking `superpowers:writing-plans`.
- Skipping domain-expert delegation when spec touches their area.
- Allowing placeholder tasks ("add appropriate error handling").
