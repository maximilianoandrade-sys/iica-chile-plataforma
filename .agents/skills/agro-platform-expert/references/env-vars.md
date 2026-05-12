# Env Vars

All env vars are validated in `lib/utils/env.ts`. Do not read `process.env.*` directly in app code.

## Required in every env

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server-only; never expose)

## Additional (check `lib/utils/env.ts` for the authoritative list)

Before giving a definitive list, run:
```bash
grep -E "^\s+\w+:" ciruela-certificada/lib/utils/env.ts
```

## Where each is set

- **Local:** `.env.local` in `ciruela-certificada/`.
- **Vercel (staging/prod):** Vercel dashboard → Project → Settings → Environment Variables. Push from local via `make push-env-all`.
- **Supabase:** project dashboard → Settings → API (URL + anon) and Settings → API → service_role key (separately).

## Never commit

- `SUPABASE_SERVICE_ROLE_KEY`
- Any `*_SECRET`
- `.env.local` is gitignored; keep it that way.
