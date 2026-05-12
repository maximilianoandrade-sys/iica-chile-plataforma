# Environments

| Env | Frontend (Vercel) | Database (Supabase) | Mock data |
|---|---|---|---|
| local | `npm run dev` on `localhost:3000` | Local Supabase (`supabase start`) | Yes (`seed-dev.sql`) |
| staging | Vercel "staging" project | Staging Supabase project | No |
| production | Vercel production project | Production Supabase project | No |

## Parity rules

- All envs use the same migrations. Local catches up via `supabase db reset`.
- All envs must have `seed_standards.sql` applied.
- Only local runs `seed-dev.sql`. Staging and production are real user data.
