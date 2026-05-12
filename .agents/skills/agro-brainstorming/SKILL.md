---
name: agro-brainstorming
description: Use at the start of any feature, enhancement, or UX change in Ciruela Certificada. Wraps superpowers:brainstorming with agro-specific context loading. Triggers on "let's build", "design a feature", "what should X look like", "brainstorm".
---

# Agro Brainstorming

## When to Use

Any new feature, UX change, or workflow extension — before a spec is written.

## What I Do

1. Load `CLAUDE.md` and recent git history (`git log -20 --oneline`) to ground questions in current project state.
2. Invoke `superpowers:brainstorming`.
3. Route domain-specific questions to the right expert.

## Delegation

- Invokes `superpowers:brainstorming` (required).
- During brainstorming, invokes domain experts when their area is discussed.

## Project-specific notes for brainstorming

- **Language:** Brainstorm in English with the user, but every UX artifact (copy, screenshots, mockup text) is in Spanish.
- **Audience:** Chilean fruit producers, varied tech literacy. Assume mobile phones, assume spotty connectivity.
- **Authorization model:** Business-level. Team members see everything in their business. Ask early: who sees this, who edits this?
- **Certification ceremony:** Many flows end in an approval by an admin or owner. Ask: who approves, what's the state after approval?
- **Don't confuse `intended_role` with `user_type_id`.**

## Anti-Patterns

- Starting design without checking recent commits to understand current project focus.
- Assuming English UX because the conversation is in English.
- Designing a feature without an authorization model ("who can do this?").
