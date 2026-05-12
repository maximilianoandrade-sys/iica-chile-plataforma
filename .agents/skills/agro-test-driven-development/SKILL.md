---
name: agro-test-driven-development
description: Use when implementing any feature or bugfix in Ciruela Certificada that warrants tests. Wraps superpowers:test-driven-development. Triggers on "implement", "write a test", "new feature code", "TDD".
---

# Agro Test-Driven Development

## When to Use

Implementing any feature or fix that warrants tests (most do).

## What I Do

1. Verify project testing conventions via `Explore` (do not assume — this project's test conventions have evolved).
2. Invoke `superpowers:test-driven-development`.
3. Ensure tests cover the RLS / authorization boundary where applicable.

## Delegation

- Invokes `superpowers:test-driven-development` (required).
- Dispatches `Explore` first with: "Find every test file under `ciruela-certificada/`. Report: test runner (vitest/jest/playwright), location convention, and any existing test for the module I'm about to modify."

## Project notes

- If tests don't exist for the area yet, ask the user whether to add a test harness first or skip tests for this change.
- For API routes, prefer integration tests that hit a real Supabase (never mock the DB for auth/RLS tests).
- For UI, prefer Playwright over unit tests for anything interaction-heavy (see Tier 1 `webapp-testing` if available).

## Anti-Patterns

- Mocking the Supabase client in tests that check authorization.
- Writing tests after the code (not TDD).
- Skipping the verification `Explore` step and assuming vitest when the project uses something else.
