# Deployment Commands

## Vercel

```bash
# From ciruela-certificada/ (recommended path)
cd ciruela-certificada
vercel          # Preview deployment
vercel --prod   # Production deployment
```

Or via Makefile from the project root:
```bash
make deploy-staging
make deploy-prod
make push-env-all   # Push .env values to Vercel (staging + prod based on the file)
make verify         # Sanity check
```

## Supabase

```bash
# Link (one-time per env)
supabase link --project-ref <project-ref>

# Push migrations (after code review, before app deploy)
supabase db push

# Regenerate types (after migration)
supabase gen types typescript --project-id <id> > ciruela-certificada/lib/database.types.ts

# Seed (staging/prod)
make supabase-seed-staging
make supabase-seed-prod
```

## PostgREST schema cache

After migrations on production, force a cache refresh:
1. Supabase dashboard → Database → API Settings → Reload schema.
2. Or `NOTIFY pgrst, 'reload schema';` via SQL editor.

See commit `dcbfbfe` for the incident that surfaced this.

## Rollback

- Vercel: dashboard → Deployments → previous deploy → Promote to Production.
- Supabase migrations: forward-only. Rollback = new migration that reverses.
