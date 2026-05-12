# Seed Strategy

## Files

| File | Contents | Environments |
|---|---|---|
| `supabase/seed_standards.sql` | Standards & questions | all (mandatory) |
| `supabase/seed-prod.sql` | user_types only | production |
| `supabase/seed-staging.sql` | user_types only | staging |
| `supabase/seed-dev.sql` | user_types + mock users, businesses, surveys | local dev only |
| `supabase/create-admin.ts` | utility: create admin users | any env |
| `supabase/seed-users.ts` | dev-only: create users via API | local dev |

## Commands

```bash
# Local (auto on supabase db reset via config.toml)
supabase db reset

# Staging
make supabase-seed-staging

# Production
make supabase-seed-prod

# Create admin in any env
npx tsx supabase/create-admin.ts \
  --email admin@company.com \
  --password SecurePass123! \
  --env prod
```

## Invariants

- `seed-prod.sql` and `seed-staging.sql` MUST NOT contain mock users, businesses, or surveys.
- `seed_standards.sql` MUST be idempotent (safe to re-run).
- Never commit real passwords to any seed file.
