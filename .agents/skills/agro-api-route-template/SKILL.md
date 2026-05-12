---
name: agro-api-route-template
description: Use when creating any file under app/api/**/route.ts in Ciruela Certificada. Supplies the canonical API route template from CLAUDE.md. Triggers on "API route", "route.ts", "app/api", "new endpoint".
---

# Agro API Route Template

## When to Use

Creating a new `app/api/**/route.ts` file, or reviewing an existing one that doesn't follow the template.

## Canonical template

```typescript
import { NextRequest } from 'next/server';
import { createSuccessResponse, createErrorResponse } from '@/lib/types';
import { createServerClient } from '@/lib/supabase/server';
import { getLogger } from '@/lib/utils/logger';

const logger = getLogger('<RouteName>');

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    logger.info('GET request received', { id });

    const supabase = await createServerClient();

    const { data, error } = await supabase
      .from('<table>')
      .select()
      .eq('id', id)
      .single();

    if (error) throw error;

    logger.info('Data fetched successfully', { id });
    return createSuccessResponse({ data });
  } catch (error) {
    logger.error('Failed to fetch data', error as Error);
    return createErrorResponse('Failed to fetch data', 500, 'SERVER_ERROR');
  }
}
```

## Rules

- Always wrap the body in try/catch.
- Always use `createSuccessResponse` / `createErrorResponse` (never `NextResponse.json` directly).
- Always await `params` (Next.js 15+).
- Always use `createServerClient()` unless the route truly needs to bypass RLS — then `createAdminClient()` with a justification comment.
- Log entry with relevant identifiers; log exit on success; log error on catch.

## Error codes

Use UPPER_SNAKE_CASE, domain-prefixed: `AUTH_REQUIRED`, `BUSINESS_NOT_FOUND`, `VALIDATION_FAILED`, `SERVER_ERROR`.

## Anti-Patterns

- `return NextResponse.json(...)` — bypasses the response helper.
- `params.id` without `await params` — Next.js 15+ break.
- Silent catches that swallow errors.
- Mixing client and server Supabase clients in the same route.
