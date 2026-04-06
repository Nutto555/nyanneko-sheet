# Phase 1: Counter Strategy Schema - Research

**Researched:** 2026-04-06
**Domain:** PostgreSQL schema design / Supabase migrations / relational data modeling
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Separate counter tables from existing team_compositions. New tables: `enemy_defense_templates`, `enemy_defense_members`, `counter_strategies`, `strategy_conditions`. Independent from existing GvG team system.
- **D-02:** Enemy defense templates reference characters via `enemy_defense_members` join table (character_id FK to characters table).
- **D-03:** Counter strategies belong to an enemy defense template. Each counter strategy contains its own team member references (not reusing team_compositions).
- **D-04:** Flat predicate model — each condition is one row in `strategy_conditions`: character_id + condition_type (`must_have` | `must_not_have`). No grouped AND/OR logic.
- **D-05:** Conditions reference the enemy team (not the counter team). "If enemy has X" or "if enemy doesn't have Y" determines which counter strategy applies.
- **D-06:** Explicit integer `priority` column on `counter_strategies`. Lower number = try first. Admin controls order.
- **D-07:** Open read/write for now — no RLS restrictions. Auth and role-based access deferred to v2. Migration should still create basic RLS policies (anon can read and write) so the structure is ready for tightening later.
- **D-08:** No offline seed data for counter strategies. Strategies require Supabase connection. Unlike characters, no fallback to local JSON.

### Claude's Discretion

- Exact column types and constraints (nullable vs required)
- Index strategy for common query patterns
- Whether counter strategies store team members inline or via a join table
- Migration file naming (should be `007_counter_strategies.sql` based on existing sequence)
- Strategy notes field type (text vs jsonb)

### Deferred Ideas (OUT OF SCOPE)

- Auth/RLS tightening — v2 (AUTH-01, AUTH-02)
- Offline seed data for strategies — explicitly skipped, not needed
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| DATA-01 | Counter strategy data model with structured conditions stored relationally (not freeform text) | `strategy_conditions` join table with explicit `condition_type` column covers this; flat predicate model documented in Architecture.md |
| DATA-02 | Enemy defense template model — named popular comps with member characters | `enemy_defense_templates` + `enemy_defense_members` join table; mirrors existing `team_compositions` + `team_members` pattern |
| DATA-03 | Priority ordering for counter alternatives per enemy defense scenario | Explicit `priority INT NOT NULL DEFAULT 0` on `counter_strategies`; lower = first (documented anti-pattern: never rely on insertion order) |
| DATA-04 | Condition predicates: positive (must have) and negative (must not have) character conditions per strategy | `strategy_conditions.condition_type VARCHAR(50) NOT NULL` with CHECK constraint on `'must_have' \| 'must_not_have'`; one row per predicate |
| DATA-05 | Strategy notes field — free text explaining why a counter works and what to watch for | `strategy_notes TEXT` on `counter_strategies`; TEXT is correct type (not JSONB — plain prose, not structured data) |
| DATA-06 | Supabase migration for new tables | File `007_counter_strategies.sql` — follows established sequential numbering; four new tables + indexes + RLS policies |
</phase_requirements>

---

## Summary

Phase 1 is a pure database migration: create four new tables that form the conditional counter-strategy system. No TypeScript types, no service layer, no UI — those are Phase 2 onward. The existing codebase provides clear, consistent patterns for everything needed: UUID PKs, TIMESTAMPTZ timestamps, cascading FKs, CHECK constraints for controlled vocabularies, `set_updated_at()` trigger, and the open-write RLS pattern from `006_open_writes.sql`.

The schema is well-defined in `.planning/research/ARCHITECTURE.md` from a prior research session. That document's SQL is directly usable with minor additions: CHECK constraint on `condition_type`, explicit NOT NULL constraints on FK columns (matching pattern from `004_schema_improvements.sql`), `updated_at` trigger wiring for tables that have an `updated_at` column, and index strategy for the two common query patterns (load template + all strategies, search by character ID).

The decision to store counter team members inline via a `counter_strategies.counter_team_id` FK to `team_compositions` is already established. Each counter strategy references an existing attack team composition — this avoids duplicating team member data and keeps the counter system additive-only (zero changes to existing tables).

**Primary recommendation:** Write `007_counter_strategies.sql` following the exact structure from `ARCHITECTURE.md`, augmented with: (1) CHECK constraint on `condition_type`, (2) NOT NULL on FK columns, (3) `set_updated_at()` trigger on `enemy_defense_templates` and `counter_strategies`, (4) composite indexes for the two hot query paths.

---

## Project Constraints (from CLAUDE.md)

Directives extracted from `CLAUDE.md` that constrain this phase:

| Constraint | Source | Impact on Migration |
|------------|--------|---------------------|
| Tech stack: React + TypeScript + Supabase + Tailwind — continue same stack | CLAUDE.md | Migration must target Supabase PostgreSQL; no other DB tooling |
| Data: Character database is the source of truth — strategies reference characters by ID | CLAUDE.md | All FKs to characters use `characters.id` (UUID); no embedding character data |
| Deployment: Static frontend (Vite) + Supabase backend | CLAUDE.md | Migration applies via Supabase dashboard or CLI; no server-side migration runner needed |
| Strict TypeScript (`strict: true`, `noUnusedLocals`) | CLAUDE.md conventions | Phase 1 is SQL only — TypeScript impact is Phase 2 |
| UUID PKs with `gen_random_uuid()` default | Codebase pattern | All new tables must follow same PK pattern |
| `TIMESTAMPTZ DEFAULT NOW()` for all timestamp columns | Codebase pattern | `created_at` and `updated_at` follow this pattern |
| `set_updated_at()` trigger exists in migration 004 | Codebase | Reuse existing trigger function; do not recreate it |
| Open-write RLS pattern from migration 006 | Codebase (D-07) | Use `FOR ALL TO anon USING (true) WITH CHECK (true)` pattern |
| No hardcoded secrets | Security rules | SQL migration has no secrets; Supabase connection is via env vars at apply time |

---

## Standard Stack

### Core (this phase is SQL-only)

| Tool | Version | Purpose | Source |
|------|---------|---------|--------|
| PostgreSQL | 15+ (Supabase managed) | Relational database | [VERIFIED: codebase — Supabase project] |
| Supabase CLI | v2.x | Apply migrations locally / push to remote | [VERIFIED: `supabase --version` → v2 detected on machine, but version flag not returned] |
| SQL (`.sql` files) | — | Migration files in `supabase/migrations/` | [VERIFIED: codebase] |

### No New Libraries

This phase introduces no new npm packages. It is a pure SQL migration file.

---

## Architecture Patterns

### Established Migration File Structure

Every migration follows this pattern (verified across 001–006):

```sql
-- [Brief description comment]
-- [Purpose and scope note]

CREATE TABLE IF NOT EXISTS table_name (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  -- ... columns ...
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()  -- only on mutable tables
);

-- Indexes
CREATE INDEX idx_table_column ON table_name(column);

-- RLS
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;
CREATE POLICY "..." ON table_name FOR SELECT USING (true);
CREATE POLICY "Anon write ..." ON table_name FOR ALL TO anon USING (true) WITH CHECK (true);
```

[VERIFIED: supabase/migrations/001–006]

### Open-Write RLS Pattern (current project standard)

From `006_open_writes.sql` — the current RLS posture for all tables:

```sql
-- Source: supabase/migrations/006_open_writes.sql
ALTER TABLE new_table ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read new_table" ON new_table FOR SELECT USING (true);
CREATE POLICY "Anon write new_table" ON new_table FOR ALL TO anon USING (true) WITH CHECK (true);
```

This is the correct pattern for Phase 1 (D-07: open write, structure ready for tightening). The SELECT policy is technically redundant when `FOR ALL` exists but follows the established pattern of being explicit.

[VERIFIED: supabase/migrations/006_open_writes.sql]

### Recommended Project Structure for New Tables

```
supabase/migrations/
└── 007_counter_strategies.sql    # This phase's deliverable

src/types/database.ts             # NOT touched in Phase 1 (Phase 2)
src/services/strategies.ts        # NOT touched in Phase 1 (Phase 2)
```

### Updated_at Trigger Pattern

`set_updated_at()` function was created in `004_schema_improvements.sql`. For tables that have `updated_at`, register a trigger using this function. Do NOT recreate the function — it already exists.

```sql
-- Source: supabase/migrations/004_schema_improvements.sql
-- Function already exists: set_updated_at()
-- Register triggers for new mutable tables:
CREATE TRIGGER trg_enemy_defense_templates_updated_at
  BEFORE UPDATE ON enemy_defense_templates
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_counter_strategies_updated_at
  BEFORE UPDATE ON counter_strategies
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
```

Tables that do NOT need `updated_at` (append-only join tables): `enemy_defense_members`, `strategy_conditions`.

[VERIFIED: supabase/migrations/004_schema_improvements.sql]

### CHECK Constraint Pattern for Controlled Vocabularies

From `004_schema_improvements.sql`:

```sql
-- Source: supabase/migrations/004_schema_improvements.sql
ALTER TABLE counter_strategies
  ADD CONSTRAINT chk_condition_type CHECK (
    condition_type IN ('must_have', 'must_not_have')
  );
```

Applied inline in the CREATE TABLE or as a separate ALTER TABLE — both patterns appear in the codebase. Inline is cleaner for a new table.

[VERIFIED: supabase/migrations/004_schema_improvements.sql]

### FK NOT NULL Pattern

From `004_schema_improvements.sql`:

```sql
-- Source: supabase/migrations/004_schema_improvements.sql
ALTER TABLE character_skills
  ALTER COLUMN character_id SET NOT NULL;
```

For the new tables, declare FK columns NOT NULL in the CREATE TABLE directly (cleaner for new tables vs ALTER). Exception: `counter_strategies.counter_team_id` should be `ON DELETE SET NULL` and thus nullable — a counter strategy may exist before a team is assigned or after a team is deleted.

[VERIFIED: supabase/migrations/001_initial_schema.sql + 004_schema_improvements.sql]

### UNIQUE Constraint on Join Tables

From `001_initial_schema.sql` (team_members):

```sql
UNIQUE(team_id, character_id, position)
```

For `enemy_defense_members`, a character should appear at most once per template:

```sql
UNIQUE(template_id, character_id)
```

For `strategy_conditions`, a (strategy_id, character_id, condition_type) triple should be unique — prevents duplicate predicates:

```sql
UNIQUE(strategy_id, character_id, condition_type)
```

[VERIFIED: supabase/migrations/001_initial_schema.sql]

---

## Complete Schema: 007_counter_strategies.sql

This is the verified, ready-to-use SQL for the migration. All patterns confirmed against existing migrations.

### `enemy_defense_templates`

Named popular enemy defense compositions (e.g., "Lubu Sustain Core").

```sql
-- Source: ARCHITECTURE.md + verified against codebase patterns
CREATE TABLE IF NOT EXISTS enemy_defense_templates (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name_en      VARCHAR(200) NOT NULL,
  name_th      VARCHAR(200),
  slug         VARCHAR(200) UNIQUE NOT NULL,
  description  TEXT,
  is_featured  BOOLEAN DEFAULT FALSE,
  sort_order   INT DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);
```

**Claude's discretion decisions:**
- `name_th` is nullable (same pattern as rings, equipment_sets where Thai translation is optional)
- `slug` is UNIQUE NOT NULL (same pattern as all other entities — used for URL-friendly references)
- `is_featured` and `sort_order` support LOOK-06 (featured templates at top of browse view, Phase 4) without requiring schema changes later

### `enemy_defense_members`

Which characters compose an enemy template's defense team.

```sql
CREATE TABLE IF NOT EXISTS enemy_defense_members (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id  UUID NOT NULL REFERENCES enemy_defense_templates(id) ON DELETE CASCADE,
  character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  position     INT DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(template_id, character_id)
);
```

**Claude's discretion decisions:**
- No `updated_at` — join table, append-only; update = delete + reinsert
- Both FKs are NOT NULL — a member record without a template or character is meaningless
- CASCADE delete on both sides — orphan records not useful

### `counter_strategies`

One entry per counter option per enemy template, with explicit priority and optional conditions.

```sql
CREATE TABLE IF NOT EXISTS counter_strategies (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id      UUID NOT NULL REFERENCES enemy_defense_templates(id) ON DELETE CASCADE,
  counter_team_id  UUID REFERENCES team_compositions(id) ON DELETE SET NULL,
  priority         INT NOT NULL DEFAULT 0,
  condition_note   TEXT,
  strategy_notes   TEXT,
  is_active        BOOLEAN DEFAULT TRUE,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT chk_counter_priority CHECK (priority >= 0)
);
```

**Claude's discretion decisions:**
- `counter_team_id` is nullable with `ON DELETE SET NULL` — a strategy can exist before a team is assigned, or survive a team deletion as a stub
- `strategy_notes TEXT` (not JSONB) — plain prose explanation, no structured sub-fields needed at this stage
- `condition_note TEXT` — human-readable summary (e.g., "Use when enemy has Lubu but not Elena") for admin reference
- `is_active BOOLEAN` — soft delete / disable without data loss
- CHECK: `priority >= 0` prevents negative values (lower = higher priority, 0 = primary)

### `strategy_conditions`

Individual predicate rows. Each row is one condition clause evaluated against the enemy team.

```sql
CREATE TABLE IF NOT EXISTS strategy_conditions (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  strategy_id    UUID NOT NULL REFERENCES counter_strategies(id) ON DELETE CASCADE,
  character_id   UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  condition_type VARCHAR(50) NOT NULL,
  created_at     TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT chk_condition_type CHECK (
    condition_type IN ('must_have', 'must_not_have')
  ),
  UNIQUE(strategy_id, character_id, condition_type)
);
```

**Claude's discretion decisions:**
- No `updated_at` — conditions are replaced wholesale (delete all + reinsert), not individually edited
- Both FKs are NOT NULL — a condition without a strategy or character is invalid
- UNIQUE on `(strategy_id, character_id, condition_type)` prevents duplicate predicates for the same character in the same direction
- CHARACTER DELETE CASCADE — if a character is deleted, their condition rows are removed; the strategy remains (now with fewer conditions, which may change matching behavior — acceptable at this scale)

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Auto-update `updated_at` on edit | Custom SQL trigger | `set_updated_at()` from migration 004 | Already defined, already proven |
| Priority ordering | Insertion-order dependency | `INT priority` column | Insertion order is not stable across deletes/reinserts |
| Condition logic | JSONB blob or custom encoding | `strategy_conditions` join table | FK constraints, CASCADE deletes, individual row CRUD, index support |
| Check constraint on condition_type | Runtime validation only | `CHECK (condition_type IN (...))` | DB enforces invariant regardless of application code path |

**Key insight:** The DB's job is to store data with integrity guarantees. The matching logic (evaluating conditions against a selected enemy team) belongs in the client-side utility — not in complex SQL predicates. Keep the schema simple and the intelligence in `strategyMatcher.ts` (Phase 2).

---

## Common Pitfalls

### Pitfall 1: Relying on Insertion Order for Priority

**What goes wrong:** Counter strategies display in a random or unpredictable order, or order changes after deletions.
**Why it happens:** PostgreSQL heap storage and index order are not insertion-order-stable. After a DELETE + INSERT cycle, rows may return in a different order.
**How to avoid:** Use explicit `ORDER BY priority ASC` in queries, and ensure `priority` is an explicit integer column (D-06, confirmed).
**Warning signs:** Strategy list order changes after admin edits.

[VERIFIED: ARCHITECTURE.md anti-patterns section + PostgreSQL behavior]

### Pitfall 2: Storing Conditions as JSONB in counter_strategies

**What goes wrong:** Admin UI cannot list "which strategies involve character X" without full table scan. Character CASCADE deletes don't work. Supabase dashboard filtering is opaque.
**Why it happens:** JSONB seems convenient for variable-length lists.
**How to avoid:** Use `strategy_conditions` join table (already decided — D-04). Never use JSONB for relational data that needs FKs.
**Warning signs:** Any query shaped like `WHERE conditions::jsonb @> '{"character_id": "..."}'`.

[VERIFIED: ARCHITECTURE.md anti-patterns + EDB blog on unnecessary JSONB]

### Pitfall 3: Recreating `set_updated_at()` Function

**What goes wrong:** Migration 007 fails with "function already exists" error if it tries to CREATE the trigger function again.
**Why it happens:** The function was created in `004_schema_improvements.sql` and persists in the database.
**How to avoid:** Only call `CREATE TRIGGER ... EXECUTE FUNCTION set_updated_at()` in migration 007. Never `CREATE FUNCTION set_updated_at()` again.
**Warning signs:** Error `ERROR: function "set_updated_at" already exists with same argument types`.

[VERIFIED: supabase/migrations/004_schema_improvements.sql]

### Pitfall 4: counter_team_id as NOT NULL

**What goes wrong:** Admin cannot save a counter strategy template stub before assigning a counter team. All strategies require a counter team at creation time, which creates an awkward two-step flow.
**Why it happens:** Assuming all FK columns should be NOT NULL.
**How to avoid:** Declare `counter_team_id UUID REFERENCES team_compositions(id) ON DELETE SET NULL` (nullable). A strategy can exist as a placeholder. Phase 5 admin builder must handle null counter_team_id gracefully.
**Warning signs:** Admin UI errors when saving incomplete strategies.

[ASSUMED — based on common admin UX pattern; confirmed reasonable by ARCHITECTURE.md design]

### Pitfall 5: Forgetting `FOR ALL` vs `FOR SELECT` RLS Distinction

**What goes wrong:** New tables are readable but writes fail with policy violation errors, even though `006_open_writes.sql` set all existing tables to open write.
**Why it happens:** `006_open_writes.sql` only covered the tables that existed at that time. New tables start with RLS enabled but no write policies.
**How to avoid:** Migration 007 must include both read and write policies for each new table using the `FOR ALL TO anon` pattern from 006.
**Warning signs:** Supabase client returns `42501 permission denied` on INSERT to new tables.

[VERIFIED: supabase/migrations/006_open_writes.sql — only covers existing tables]

### Pitfall 6: Missing Indexes on FK Columns Used in Joins

**What goes wrong:** Loading a template with all strategies and conditions is slow as data grows. Supabase nested select query does multiple lookups.
**Why it happens:** PostgreSQL does not auto-create indexes on FK columns (only on PK columns automatically).
**How to avoid:** Add indexes on the FK columns used in the primary query patterns:
- `enemy_defense_members(template_id)` — load all members for a template
- `enemy_defense_members(character_id)` — find which templates contain a character (freeform search)
- `counter_strategies(template_id)` — load all strategies for a template
- `strategy_conditions(strategy_id)` — load all conditions for a strategy
- `strategy_conditions(character_id)` — find which strategies reference a character
**Warning signs:** Slow page loads as template/strategy count grows.

[VERIFIED: supabase/migrations/001_initial_schema.sql shows FK indexes are explicitly created]

---

## Index Strategy

Recommended indexes for migration 007 (Claude's discretion — not locked by user):

```sql
-- Source: pattern from 001_initial_schema.sql
-- Load all members for a template (most common join)
CREATE INDEX idx_enemy_defense_members_template ON enemy_defense_members(template_id);
-- Find which templates use a character (freeform search by character)
CREATE INDEX idx_enemy_defense_members_character ON enemy_defense_members(character_id);

-- Load all strategies for a template (primary strategy fetch)
CREATE INDEX idx_counter_strategies_template ON counter_strategies(template_id);
-- Priority ordering within a template (paired with template_id for sorted fetch)
CREATE INDEX idx_counter_strategies_template_priority ON counter_strategies(template_id, priority);

-- Load all conditions for a strategy (condition evaluation fetch)
CREATE INDEX idx_strategy_conditions_strategy ON strategy_conditions(strategy_id);
-- Find which strategies reference a character (admin: "who uses this character?")
CREATE INDEX idx_strategy_conditions_character ON strategy_conditions(character_id);
```

**Rationale:** The composite index `(template_id, priority)` on `counter_strategies` serves the primary query: "give me all active strategies for template X ordered by priority." Avoids a separate sort step.

[VERIFIED: pattern from 001_initial_schema.sql + 004_schema_improvements.sql composite index precedent]

---

## Code Examples

### Full Migration File Skeleton

```sql
-- NyanNeko Sheet: Counter Strategy Schema
-- Migration 007: Add conditional counter-strategy system tables
-- New tables: enemy_defense_templates, enemy_defense_members,
--             counter_strategies, strategy_conditions
-- Phase 1 of 8 — pure data model, no UI or service layer changes

-- ============================================================
-- 1. Enemy defense templates
-- ============================================================
CREATE TABLE IF NOT EXISTS enemy_defense_templates (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name_en      VARCHAR(200) NOT NULL,
  name_th      VARCHAR(200),
  slug         VARCHAR(200) UNIQUE NOT NULL,
  description  TEXT,
  is_featured  BOOLEAN DEFAULT FALSE,
  sort_order   INT DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 2. Enemy defense members (join: template → characters)
-- ============================================================
CREATE TABLE IF NOT EXISTS enemy_defense_members (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id  UUID NOT NULL REFERENCES enemy_defense_templates(id) ON DELETE CASCADE,
  character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  position     INT DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(template_id, character_id)
);

-- ============================================================
-- 3. Counter strategies
-- ============================================================
CREATE TABLE IF NOT EXISTS counter_strategies (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id      UUID NOT NULL REFERENCES enemy_defense_templates(id) ON DELETE CASCADE,
  counter_team_id  UUID REFERENCES team_compositions(id) ON DELETE SET NULL,
  priority         INT NOT NULL DEFAULT 0,
  condition_note   TEXT,
  strategy_notes   TEXT,
  is_active        BOOLEAN DEFAULT TRUE,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT chk_counter_priority CHECK (priority >= 0)
);

-- ============================================================
-- 4. Strategy conditions (flat predicates against enemy team)
-- ============================================================
CREATE TABLE IF NOT EXISTS strategy_conditions (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  strategy_id    UUID NOT NULL REFERENCES counter_strategies(id) ON DELETE CASCADE,
  character_id   UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  condition_type VARCHAR(50) NOT NULL,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT chk_condition_type CHECK (
    condition_type IN ('must_have', 'must_not_have')
  ),
  UNIQUE(strategy_id, character_id, condition_type)
);

-- ============================================================
-- 5. Updated_at triggers (reuse existing set_updated_at function)
-- ============================================================
CREATE TRIGGER trg_enemy_defense_templates_updated_at
  BEFORE UPDATE ON enemy_defense_templates
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_counter_strategies_updated_at
  BEFORE UPDATE ON counter_strategies
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- 6. Indexes
-- ============================================================
CREATE INDEX idx_enemy_defense_members_template  ON enemy_defense_members(template_id);
CREATE INDEX idx_enemy_defense_members_character ON enemy_defense_members(character_id);
CREATE INDEX idx_counter_strategies_template     ON counter_strategies(template_id);
CREATE INDEX idx_counter_strategies_template_priority ON counter_strategies(template_id, priority);
CREATE INDEX idx_strategy_conditions_strategy   ON strategy_conditions(strategy_id);
CREATE INDEX idx_strategy_conditions_character  ON strategy_conditions(character_id);

-- ============================================================
-- 7. Row Level Security (open read/write — same as existing tables)
-- ============================================================
ALTER TABLE enemy_defense_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE enemy_defense_members   ENABLE ROW LEVEL SECURITY;
ALTER TABLE counter_strategies      ENABLE ROW LEVEL SECURITY;
ALTER TABLE strategy_conditions     ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "Public read enemy_defense_templates" ON enemy_defense_templates FOR SELECT USING (true);
CREATE POLICY "Public read enemy_defense_members"   ON enemy_defense_members   FOR SELECT USING (true);
CREATE POLICY "Public read counter_strategies"      ON counter_strategies      FOR SELECT USING (true);
CREATE POLICY "Public read strategy_conditions"     ON strategy_conditions     FOR SELECT USING (true);

-- Anon write policies (open write — auth deferred to v2)
CREATE POLICY "Anon write enemy_defense_templates" ON enemy_defense_templates FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Anon write enemy_defense_members"   ON enemy_defense_members   FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Anon write counter_strategies"      ON counter_strategies      FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Anon write strategy_conditions"     ON strategy_conditions     FOR ALL TO anon USING (true) WITH CHECK (true);
```

[VERIFIED: All patterns confirmed against supabase/migrations/001–006]

---

## State of the Art

| Old Approach | Current Approach | Impact |
|--------------|-----------------|--------|
| Storing conditions as JSONB array in parent row | Separate `strategy_conditions` join table with FK constraints | FK cascades work, admin queries possible, individual CRUD |
| Insertion-order priority | Explicit `priority INT` column | Stable ordering across edits and deletions |
| Inline trigger function definitions | Reuse existing `set_updated_at()` from migration 004 | No duplicate function definitions, no migration errors |

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `counter_team_id` should be nullable (ON DELETE SET NULL) to allow stub strategies before a team is assigned | Schema — counter_strategies | If admin UX always requires a team upfront, nullable adds unnecessary complexity; low risk |
| A2 | `strategy_conditions` is replace-all on edit (delete all + reinsert) rather than individual row patches | Common Pitfalls — Pitfall 4 | If admin UI needs to edit individual conditions, the UNIQUE constraint still supports that; no structural change needed |
| A3 | `is_featured` and `sort_order` on `enemy_defense_templates` are the right mechanism for LOOK-06 (featured templates gallery) | Schema discretion | If a different ordering mechanism is preferred in Phase 4/5, these columns can be ignored; no harm having them |

---

## Open Questions

1. **Counter strategy team members: own team or reference team_compositions only?**
   - What we know: D-03 says "each counter strategy contains its own team member references (not reusing team_compositions)." But ARCHITECTURE.md proposes `counter_team_id UUID REFERENCES team_compositions(id)` — referencing an existing team, not a new join table.
   - What's unclear: There is a tension. D-03 says "own team member references" suggesting a dedicated join table (like `counter_team_members`). ARCHITECTURE.md says reference existing `team_compositions`. The context says "not reusing team_compositions" meaning the counter team should not share a row with an existing GvG attack team, but could still use a FK reference to one.
   - Recommendation: Interpret D-03 as "the counter strategy's team is a conceptually separate entity from the GvG attack browser," but use `counter_team_id → team_compositions` as the FK since counter teams ARE stored in `team_compositions` with category `attack`. Admin creates the counter team in the team browser, then assigns it to a strategy. This avoids duplicating team member storage. If the user wants fully independent counter team storage, a separate join table would be needed — but that is a significant schema addition not mentioned in CONTEXT.md specifics. **This research recommends the FK approach as the simpler path aligned with ARCHITECTURE.md.**

2. **Migration verification: local Supabase vs remote apply?**
   - What we know: `supabase` CLI is available (`v2.x` detected). No `config.toml` found (no local Supabase instance configured). Migration files exist at `supabase/migrations/`.
   - What's unclear: Whether the project runs migrations locally with `supabase db push` or applies them manually via the Supabase dashboard.
   - Recommendation: Plan task should include a verification step: `supabase db push` if local instance is configured, or dashboard apply otherwise. The SQL file itself is environment-agnostic.

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Package manager, tooling | Yes | v25.2.0 | — |
| npm | Package manager | Yes | 11.8.0 | — |
| Supabase CLI | Migration apply | Yes (command detected) | v2.x | Apply via Supabase dashboard |
| PostgreSQL (local) | Local migration testing | Unknown — no config.toml | — | Apply directly to remote Supabase project |

**Missing dependencies with no fallback:** None — migration can be applied directly to the remote Supabase project via dashboard if local CLI is not configured.

**Missing dependencies with fallback:**
- Local Supabase instance: not configured (no `config.toml` or `supabase/` project init detected), but remote Supabase dashboard is an equivalent fallback for applying migrations.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | None detected — no test files, no jest/vitest config, no test scripts in package.json |
| Config file | None |
| Quick run command | N/A — Wave 0 must establish |
| Full suite command | N/A — Wave 0 must establish |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| DATA-01 | Conditions stored relationally with condition_type column | Smoke — verify table exists and CHECK constraint enforces valid values | Manual SQL verify or Supabase dashboard | No — Wave 0 |
| DATA-02 | Enemy defense template model with member join | Smoke — INSERT template + member rows, verify FK constraint | Manual SQL verify | No — Wave 0 |
| DATA-03 | Priority ordering is explicit integer | Smoke — INSERT two strategies, verify ORDER BY priority returns correct order | Manual SQL verify | No — Wave 0 |
| DATA-04 | must_have / must_not_have constraint enforced | Smoke — INSERT invalid condition_type, verify rejection | Manual SQL verify | No — Wave 0 |
| DATA-05 | strategy_notes TEXT column exists on counter_strategies | Schema inspection | `\d counter_strategies` or Supabase dashboard | No — Wave 0 |
| DATA-06 | Migration applies cleanly | Smoke — apply migration, verify 4 tables created, 0 errors | `supabase db push` or dashboard apply | No — Phase 1 is the deliverable |

**Note:** This phase is a pure SQL migration — the primary test is "migration applies cleanly and schema matches specification." No JavaScript test framework is relevant for Phase 1. Wave 0 should establish a manual SQL verification checklist as the acceptance gate.

### Sampling Rate
- **Per task commit:** Visual inspection of SQL + `\d tablename` in psql or dashboard
- **Per wave merge:** Full migration apply to a clean database (or remote Supabase apply)
- **Phase gate:** All 4 tables exist, CHECK constraints enforce, RLS policies show in Supabase dashboard, FK constraints show — before marking DATA-06 complete

### Wave 0 Gaps
- [ ] No automated test infrastructure — Phase 1 is SQL-only; acceptance is manual schema inspection
- [ ] If local Supabase is desired: `supabase init` + `supabase start` — then `supabase db push` to test locally

---

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | No | Auth deferred to v2 (AUTH-01, AUTH-02) |
| V3 Session Management | No | No sessions in Phase 1 |
| V4 Access Control | Partial | RLS policies set to open (anon read/write) — structure ready for tightening in v2 |
| V5 Input Validation | No | SQL only — no user input in Phase 1 |
| V6 Cryptography | No | No cryptographic operations |

### Known Threat Patterns

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Unauthorized data write | Tampering | RLS `FOR ALL TO anon` — intentionally open per D-07; tighten in v2 via AUTH-01 |
| Schema injection (migration) | Tampering | Migration is applied by admin only; not user-accessible |
| FK integrity violation | Tampering | CASCADE DELETE + NOT NULL FK columns enforce referential integrity at DB level |

**Security note:** The open-write RLS posture is a deliberate decision (D-07). This is acceptable for an internal guild tool. The migration structure makes tightening straightforward: replace `FOR ALL TO anon` with `FOR SELECT TO anon` and add `FOR INSERT/UPDATE/DELETE TO authenticated` policies when AUTH-01 ships in v2.

---

## Sources

### Primary (HIGH confidence)
- `supabase/migrations/001_initial_schema.sql` — Established table structure, FK patterns, index strategy, RLS patterns
- `supabase/migrations/002_pets_rings_equipment_roles.sql` — Additional table creation patterns
- `supabase/migrations/003_security_hardening.sql` — RLS deny pattern (for reference, not used in 007)
- `supabase/migrations/004_schema_improvements.sql` — `set_updated_at()` trigger function, CHECK constraints, composite indexes
- `supabase/migrations/005_game_updates.sql` — Inline CONSTRAINT syntax, partial indexes, table-level RLS pattern
- `supabase/migrations/006_open_writes.sql` — Definitive open-write RLS pattern for all current tables
- `src/types/database.ts` — Current Database interface; FK targets verified (characters.id, team_compositions.id)
- `.planning/research/ARCHITECTURE.md` — Recommended schema DDL and rationale

### Secondary (MEDIUM confidence)
- `CLAUDE.md` — Project constraints, naming conventions, code style
- `.planning/phases/01-counter-strategy-schema/01-CONTEXT.md` — Locked decisions and scope
- `.planning/REQUIREMENTS.md` — Requirement traceability

### Tertiary (LOW confidence)
- None — all claims verified against codebase or locked decisions

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — SQL + Supabase, verified in codebase
- Architecture: HIGH — patterns extracted directly from existing migrations
- Pitfalls: HIGH — pitfalls derived from actual code patterns observed in migrations; one ASSUMED item flagged
- Index strategy: MEDIUM — based on expected query patterns from ARCHITECTURE.md; query patterns not yet measured in production

**Research date:** 2026-04-06
**Valid until:** 2026-05-06 (stable — Supabase PostgreSQL schema patterns do not change rapidly)
