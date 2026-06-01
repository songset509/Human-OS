# HumanOS Supabase Migrations

## Run order (fresh project)

1. `schema.sql`
2. `seed.sql`
3. `schema-upgrades.sql`
4. `schema-v5.sql`
5. `schema-assessment-v2.sql`

## Re-running migrations

Files `schema-upgrades.sql`, `schema-v5.sql`, and `schema-assessment-v2.sql` are **idempotent**:

- `CREATE TABLE IF NOT EXISTS`
- `CREATE INDEX IF NOT EXISTS`
- `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`
- `INSERT ... ON CONFLICT DO NOTHING`
- `DROP POLICY IF EXISTS` before each `CREATE POLICY`

`schema.sql` is intended for **first-time** setup. Re-running it may fail on policies/triggers unless you add the same DROP patterns (see recommendations below).

## Optional production index

After ensuring no duplicate in-progress sessions per user/assessment:

```sql
CREATE UNIQUE INDEX IF NOT EXISTS idx_assessment_sessions_one_active
  ON assessment_sessions (user_id, assessment_id)
  WHERE status = 'in_progress';
```
