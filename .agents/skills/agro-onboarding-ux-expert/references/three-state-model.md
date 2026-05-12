# Onboarding 3-State Model

## States

| State | Condition | Behavior |
|---|---|---|
| NOT STARTED | `intended_role IS NULL` AND `user_type_id IS NULL` | Redirect to `/onboarding/select-role` |
| IN PROGRESS | `intended_role IS NOT NULL` AND `user_type_id IS NULL` | Continue role-specific flow (create/join business, submit application) |
| COMPLETE | `user_type_id IS NOT NULL` | Full access; ignore `intended_role` |

## Transitions

```
NOT STARTED ──select role──▶ IN PROGRESS ──owner/admin approval──▶ COMPLETE
```

## Invariants

- `user_type_id` is written only by approval routes. Never by self-service.
- `intended_role` is informational — it is not consulted for authorization.
- A user can never transition COMPLETE → IN PROGRESS via self-service. Only admins via a data fix.

## Implementation pointers

- State detection: `lib/utils/onboarding-check.ts`
- Owner approval: `app/api/admin/businesses/[id]/approve/route.ts`
- Team member approval: `app/api/businesses/[id]/team-members/[userId]/approve/route.ts`
