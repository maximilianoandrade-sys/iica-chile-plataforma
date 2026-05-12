# Role Approval Flow

## Roles

See `user_types` table. Common values: `admin`, `super_admin`, `business_owner`, `certification_manager`, `evidence_provider`, `auditor`.

## Approval matrix

| Who approves | Whom | Mechanism |
|---|---|---|
| Admin | Business owner | `POST /api/admin/businesses/[id]/approve` → sets `users.user_type_id` from `intended_role`; activates `businesses` |
| Business owner | Team member of their business | `POST /api/businesses/[id]/team-members/[userId]/approve` → sets `users.user_type_id`; sets `business_team_members.is_active = true` |

## Guardrails

- Admin approval must verify `businesses.owner_id = users.id`.
- Team-member approval must verify the caller is the business owner (RLS + app-layer check).
- On approval, **never** allow `user_type_id` to be different from the `intended_role` without explicit override logic.

## UX copy notes

- Spanish, `usted`, warm.
- "Pendiente de aprobación" (not "Esperando revisión").
- Confirmations in context of the person: "Hemos aprobado a Juan Pérez como Gerente de Certificación."
