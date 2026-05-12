---
name: agro-structured-logging
description: Use when creating any new module, API route, or component in Ciruela Certificada. Enforces the structured logging pattern (getLogger, no console.*). Triggers on "console.log", "new module", "new api route", "new component", "logger", "logging".
---

# Agro Structured Logging

## When to Use

Creating any new TypeScript module. Reviewing a diff that contains `console.*`.

## What I Do

Enforce the project's structured logger pattern. Reject `console.*`.

## Canonical pattern

At the top of every module:

```typescript
import { getLogger } from '@/lib/utils/logger';
const logger = getLogger('ModuleName');
```

Then:

```typescript
logger.info('Operation started', { userId, param1 });
logger.error('Operation failed', error as Error, { userId, operationName });
logger.debug('Fine-grained state', { cursor, attempt });
```

## Rules

- `getLogger` name matches the module / class / component name, not the file path.
- `logger.error(message, errorObject, context)` — always pass the `Error` object as the second arg.
- Context objects must be plain (serializable). No circular refs.
- Never log secrets, tokens, or full rows that may include PII (redact or truncate).

## Anti-Patterns

- `console.log`, `console.error`, `console.warn` — forbidden except in one-off scripts under `scripts/`.
- Passing a string message as the error: `logger.error('Failed', 'Something went wrong')` — wrong. Use `new Error('...')`.
- Initializing `getLogger` inside functions (should be module-level constant).
