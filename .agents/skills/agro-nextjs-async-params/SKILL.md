---
name: agro-nextjs-async-params
description: Use when writing any Next.js 15+ route handler or dynamic page that accesses params. Catches the params-as-Promise change. Triggers on "params", "route handler", "dynamic page", "app/[id]".
---

# Agro Next.js Async Params

## When to Use

Writing or reviewing any file that destructures `params` in a route handler, page, layout, or metadata function.

## The rule

In Next.js 15+, `params` is a Promise. Always type it as such and always `await` it.

## Correct

```typescript
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  // use id
}
```

```typescript
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <div>{id}</div>;
}
```

## Wrong (Next.js 14-style — broken in 15+)

```typescript
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id; // TypeError at runtime
}
```

## Also applies to

- `searchParams` (same Promise treatment)
- `generateMetadata({ params })`
- `generateStaticParams` returns — unchanged (still synchronous).

## Anti-Patterns

- Non-awaited `params.x` access.
- Typing `params` as the inner object instead of `Promise<...>`.
- Trying to reuse a Next.js 14 codemod output without checking.
