---
name: agro-using-git-worktrees
description: Use when starting parallel feature work that needs isolation from the current Ciruela Certificada workspace, or before executing a plan. Wraps superpowers:using-git-worktrees. Triggers on "worktree", "parallel work", "isolated branch", "separate workspace".
---

# Agro Using Git Worktrees

## When to Use

Before executing a plan, or when two workstreams need separate working directories.

## What I Do

1. Run `git status` in the current workspace; warn if there are uncommitted changes that should be preserved/stashed.
2. Invoke `superpowers:using-git-worktrees`.
3. Record the parent worktree path in the implementation plan under a "Worktree" header so resume sessions know where it lives.

## Delegation

- Invokes `superpowers:using-git-worktrees` (required).

## Project notes

- Primary working directory: `/Users/rodrigo/Projects/agro_extension_digital_app`.
- Default worktree parent: `/Users/rodrigo/Projects/agro_extension_digital_app-worktrees/<branch-name>` (confirm with user first).
- Never create a worktree on top of an existing directory — the Skill tool's safety check will catch this, but ask first.

## Anti-Patterns

- Creating a worktree while the main workspace has unstaged changes that may be in scope.
- Losing track of which worktree corresponds to which plan — always record it.
