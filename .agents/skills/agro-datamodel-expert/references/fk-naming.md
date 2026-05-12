# FK Naming Convention

## Rule

`fk_<table>_<column>` — e.g., `fk_businesses_owner` for `businesses.owner_id → users(id)`.

NOT Supabase default `businesses_owner_id_fkey`.

## Why

Project tooling queries `information_schema.table_constraints` and filters by the `fk_` prefix. The default Supabase naming breaks those queries.

## Migration template

```sql
ALTER TABLE public.survey_responses
  ADD CONSTRAINT fk_survey_responses_standard
  FOREIGN KEY (standard_id)
  REFERENCES public.standards(id)
  ON DELETE CASCADE;
```

## Inline in CREATE TABLE

```sql
CREATE TABLE public.implementation_plan_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id uuid NOT NULL,
  CONSTRAINT fk_implementation_plan_actions_plan
    FOREIGN KEY (plan_id) REFERENCES public.implementation_plans(id) ON DELETE CASCADE
);
```

## Checking existing FKs

```sql
SELECT constraint_name
FROM information_schema.table_constraints
WHERE table_schema = 'public'
  AND constraint_type = 'FOREIGN KEY'
  AND constraint_name NOT LIKE 'fk_%';
-- Any row returned is a convention violation.
```
