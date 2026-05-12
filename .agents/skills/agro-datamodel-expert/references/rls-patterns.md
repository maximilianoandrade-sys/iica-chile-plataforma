# RLS Patterns

Every table has RLS enabled. Policy names follow the pattern `<table>_<action>_<role>` (e.g., `businesses_select_owner`, `findings_update_auditor`).

## Canonical helpers

```sql
-- app-defined: true if caller's user_type is admin or super_admin
CREATE OR REPLACE FUNCTION is_admin() RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM users u
    JOIN user_types ut ON ut.id = u.user_type_id
    WHERE u.id = auth.uid() AND ut.name IN ('admin', 'super_admin')
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;
```

## Patterns by access shape

### Own row
```sql
CREATE POLICY my_table_select_own ON my_table
  FOR SELECT USING (user_id = auth.uid());
```

### Business-owner
```sql
CREATE POLICY my_table_all_business_owner ON my_table
  FOR ALL USING (
    business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())
  );
```

### Team-member (active only)
```sql
CREATE POLICY my_table_select_team ON my_table
  FOR SELECT USING (
    business_id IN (
      SELECT business_id FROM business_team_members
      WHERE user_id = auth.uid() AND is_active = true
    )
  );
```

### Admin bypass
```sql
CREATE POLICY my_table_all_admin ON my_table
  FOR ALL USING (is_admin());
```

## JWT-claim shortcut (avoids cross-table recursion)

When a policy needs to check the caller's role, prefer the JWT claim
populated by `custom_access_token_hook` — no users-table query, so no
recursion risk:

```sql
CREATE POLICY my_table_select_admin ON my_table
  FOR SELECT TO authenticated
  USING ((SELECT auth.jwt() ->> 'user_role') = ANY (ARRAY['admin', 'super_admin']));
```

## Breaking cross-table policy recursion

If a policy on table A queries table B and B's policy queries A, you'll
get an `infinite recursion detected` error at SELECT time. The fix is a
`SECURITY DEFINER` helper that bypasses RLS for the inner lookup:

```sql
CREATE FUNCTION public.get_user_business_ids()
  RETURNS SETOF uuid
  LANGUAGE sql STABLE SECURITY DEFINER
  SET search_path = public
AS $$
  SELECT id FROM public.businesses WHERE owner_id = auth.uid()
  UNION
  SELECT business_id FROM public.business_team_members
    WHERE user_id = auth.uid() AND is_active = true
$$;

-- Then in the policy on a different table:
CREATE POLICY my_table_select_team ON my_table
  FOR SELECT USING (business_id IN (SELECT public.get_user_business_ids()));
```
