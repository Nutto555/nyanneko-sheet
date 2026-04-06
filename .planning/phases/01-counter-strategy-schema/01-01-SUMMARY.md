---
phase: 01-counter-strategy-schema
plan: 01
subsystem: database
tags: [postgresql, supabase, sql, migrations, rls, counter-strategy]

requires: []
provides:
  - "Four-table counter-strategy schema: enemy_defense_templates, enemy_defense_members, counter_strategies, strategy_conditions"
  - "RLS policies: open anon read/write on all four new tables (D-07)"
  - "FK integrity: character references, cascade deletes, composite UNIQUE constraints"
  - "CHECK constraints: condition_type IN ('must_have','must_not_have'), priority >= 0"
  - "Performance indexes: 6 indexes including composite (template_id, priority)"
  - "Migration file 007_counter_strategies.sql — ready to apply to Supabase"
affects:
  - "02-counter-strategy-types: types and service layer will target these four tables"
  - "04-counter-lookup: page reads counter_strategies and strategy_conditions"
  - "05-admin-strategy-builder: admin CRUD writes to all four tables"

tech-stack:
  added: []
  patterns:
    - "Open-write RLS pattern (FOR ALL TO anon USING (true) WITH CHECK (true)) extended to new tables"
    - "Append-only join table pattern (no updated_at) for enemy_defense_members and strategy_conditions"
    - "Reuse existing set_updated_at() trigger from migration 004 — do not recreate"

key-files:
  created:
    - supabase/migrations/007_counter_strategies.sql
  modified: []

key-decisions:
  - "counter_team_id is nullable (ON DELETE SET NULL) to allow stub strategies before team is assigned (RESEARCH Pitfall 4)"
  - "strategy_notes is TEXT not JSONB — plain prose, no structured sub-fields needed at this stage"
  - "strategy_conditions is append-only (delete all + reinsert) — no updated_at column needed"
  - "Composite index (template_id, priority) on counter_strategies serves the primary sorted-load query without a separate sort step"

patterns-established:
  - "Reuse set_updated_at(): never recreate the trigger function — register triggers only"
  - "Append-only join tables: enemy_defense_members and strategy_conditions have no updated_at"
  - "Open-write RLS: all new tables follow FOR ALL TO anon pattern from migration 006"

requirements-completed:
  - DATA-01
  - DATA-02
  - DATA-03
  - DATA-04
  - DATA-05
  - DATA-06

duration: 15min
completed: 2026-04-06
---

# Phase 01 Plan 01: Counter Strategy Schema Summary

**Four-table PostgreSQL schema for conditional counter-strategy system: enemy defense templates, member join table, priority-ordered strategies with CHECK constraints, and flat condition predicates with controlled vocabulary enforcement**

## Performance

- **Duration:** 15 min
- **Started:** 2026-04-06T10:34:24Z
- **Completed:** 2026-04-06T10:49:57Z
- **Tasks:** 1 of 3 automated (Tasks 2–3 require Supabase credentials — see User Setup Required)
- **Files modified:** 1

## Accomplishments
- Created `supabase/migrations/007_counter_strategies.sql` with all four tables, indexes, triggers, and RLS policies
- All integrity constraints in place: `chk_condition_type` enforces `must_have|must_not_have`, `chk_counter_priority` enforces `priority >= 0`
- Migration file follows every established codebase pattern (001–006) including: UUID PKs, TIMESTAMPTZ, SET NULL on optional FK, CASCADE deletes, composite UNIQUE, open-write RLS from 006

## Task Commits

Each task was committed atomically:

1. **Task 1: Write migration 007_counter_strategies.sql** - `7ccfb22` (feat)
2. **Task 2: Push schema to Supabase** - NOT COMMITTED — requires Supabase access token (sbp_ format) or database password
3. **Task 3: Verify schema integrity** - NOT COMMITTED — depends on Task 2 applying successfully

**Plan metadata:** pending (docs commit created after SUMMARY)

## Files Created/Modified
- `supabase/migrations/007_counter_strategies.sql` — Four-table counter-strategy schema with RLS, indexes, triggers, and CHECK constraints

## Decisions Made
- `counter_team_id` is nullable (`ON DELETE SET NULL`) so a strategy can exist as a stub before a counter team is assigned — prevents a two-step creation UX problem (RESEARCH.md Pitfall 4)
- `strategy_notes` is `TEXT` not `JSONB` — plain prose explanation, no structured sub-fields required at this phase
- `strategy_conditions` and `enemy_defense_members` are append-only join tables — no `updated_at` column — replace via delete-all + reinsert
- Reused `set_updated_at()` trigger function from migration 004 — only registered `CREATE TRIGGER` statements, never `CREATE FUNCTION` (RESEARCH.md Pitfall 3)

## Deviations from Plan

None — Task 1 executed exactly as specified. Tasks 2–3 are blocked by missing credentials (auth gate), not a deviation.

## Issues Encountered

**Task 2 blocked — Supabase authentication gate:**

Attempted to push the migration via `supabase db push` and alternate methods. Found:
- `supabase` CLI is available via `npx supabase` (v2.84.10) but requires a personal access token in `sbp_` format for management API
- No `supabase/config.toml` in the project (no local Supabase instance configured)
- `.env.local` contains `VITE_SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` but NOT the database password or a personal access token (`sbp_...`)
- The service role JWT (`eyJhbGci...`) is rejected by both the management API (`JWT failed verification`) and the CLI (`Invalid access token format`)
- The Supabase REST API does not support raw DDL execution via PostgREST

**Resolution:** Migration must be applied manually. See User Setup Required section.

## User Setup Required

To complete Tasks 2 and 3, apply the migration to the Supabase database:

**Option A — Supabase Dashboard (no tools needed):**
1. Go to [https://supabase.com/dashboard/project/crlojtwphabryuasgftc/sql/new](https://supabase.com/dashboard/project/crlojtwphabryuasgftc/sql/new)
2. Copy the full contents of `supabase/migrations/007_counter_strategies.sql`
3. Paste into the SQL editor and click "Run"
4. Verify: no errors in output

**Option B — Supabase CLI with personal access token:**
1. Go to [https://supabase.com/dashboard/account/tokens](https://supabase.com/dashboard/account/tokens) and create a token
2. Run:
   ```bash
   export SUPABASE_ACCESS_TOKEN=sbp_your_token_here
   npx supabase link --project-ref crlojtwphabryuasgftc
   npx supabase db push
   ```

**Option C — Supabase CLI with DB password:**
```bash
npx supabase db push --db-url "postgresql://postgres.[password]@db.crlojtwphabryuasgftc.supabase.co:5432/postgres"
```
(Get the password from Supabase Dashboard → Project Settings → Database)

**Post-apply verification queries** (run in Dashboard SQL editor):
```sql
-- Verify 4 tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('enemy_defense_templates','enemy_defense_members','counter_strategies','strategy_conditions')
ORDER BY table_name;
-- Expected: 4 rows

-- Verify CHECK constraint
SELECT constraint_name, check_clause
FROM information_schema.check_constraints
WHERE constraint_name = 'chk_condition_type';
-- Expected: 1 row with 'must_have' and 'must_not_have'

-- Verify priority column
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'counter_strategies' AND column_name = 'priority';
-- Expected: integer, NO (NOT NULL)

-- Verify RLS enabled
SELECT relname, relrowsecurity FROM pg_class
WHERE relname IN ('enemy_defense_templates','enemy_defense_members','counter_strategies','strategy_conditions')
ORDER BY relname;
-- Expected: 4 rows, all relrowsecurity = true
```

## Next Phase Readiness

**Phase 2 (Counter Strategy Types) can begin after migration is applied.** The schema is fully specified and frozen — Phase 2 only needs to know the column names and types (available from the migration file).

**Phase 2 will target:**
- `enemy_defense_templates` — `EnemyDefenseTemplate` TypeScript type
- `enemy_defense_members` — `EnemyDefenseMember` type
- `counter_strategies` — `CounterStrategy` type with priority, strategy_notes, is_active
- `strategy_conditions` — `StrategyCondition` type with condition_type union `'must_have' | 'must_not_have'`

**Blockers for Phase 2:** Migration must be applied to Supabase before TypeScript types can be generated or service functions can be tested against live data.

---
*Phase: 01-counter-strategy-schema*
*Completed: 2026-04-06*

## Self-Check: PASSED

- FOUND: `supabase/migrations/007_counter_strategies.sql`
- FOUND: `.planning/phases/01-counter-strategy-schema/01-01-SUMMARY.md`
- FOUND: commit `7ccfb22` (feat(01-01): create migration 007_counter_strategies.sql)
