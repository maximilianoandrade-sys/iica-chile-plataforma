---
name: agro-executing-plans
description: Use when executing an implementation plan for Ciruela Certificada. Wraps superpowers:executing-plans with project pre-flight and checkpoint reviews. Triggers on "execute this plan", "implement the plan", "start the plan".
---

# Agro Executing Plans

## When to Use

User points at a plan file in `docs/superpowers/plans/` and says execute / implement / start.

## What I Do

1. **Pre-flight:**
   - Confirm current branch / worktree matches plan intent.
   - Confirm `npm install` is up to date (`cd ciruela-certificada && npm install` if `package-lock.json` changed).
   - Confirm env vars are present (invoke `agro-platform-expert` to check).
   - Confirm Supabase local is running if plan touches DB (`supabase status`).
2. Invoke `superpowers:executing-plans`.
3. After each checkpoint, dispatch `superpowers:code-reviewer` with the completed task range + the spec reference.

## Delegation

- Invokes `superpowers:executing-plans` (required).
- Dispatches `superpowers:code-reviewer` subagent at checkpoints.
- Invokes `agro-using-git-worktrees` if not already in one.
- Invokes `agro-platform-expert` for env-var pre-flight.

## Project notes

- After each migration task, remind to regenerate types (`supabase gen types ...`).
- After any code-quality-relevant change, spot-check for `console.*`, direct `process.env.*`, missing logger.
- Commit frequency: one commit per task (already encoded in the plan).

## Anti-Patterns

- Skipping pre-flight and hitting `npm install` errors mid-task.
- Skipping code review between checkpoints.
- Batching multiple tasks into one commit.
