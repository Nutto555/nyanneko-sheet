# Phase 1: Counter Strategy Schema - Context

**Gathered:** 2026-04-06
**Status:** Ready for planning

<domain>
## Phase Boundary

Create Supabase migration with new tables for the conditional counter-strategy system. Pure data model — no UI, no services, no TypeScript types (those are Phase 2). Builds on existing character DB and team tables.

</domain>

<decisions>
## Implementation Decisions

### Table Relationships
- **D-01:** Separate counter tables from existing team_compositions. New tables: `enemy_defense_templates`, `enemy_defense_members`, `counter_strategies`, `strategy_conditions`. Independent from existing GvG team system.
- **D-02:** Enemy defense templates reference characters via `enemy_defense_members` join table (character_id FK to characters table).
- **D-03:** Counter strategies belong to an enemy defense template. Each counter strategy contains its own team member references (not reusing team_compositions).

### Condition Model
- **D-04:** Flat predicate model — each condition is one row in `strategy_conditions`: character_id + condition_type (`must_have` | `must_not_have`). No grouped AND/OR logic.
- **D-05:** Conditions reference the enemy team (not the counter team). "If enemy has X" or "if enemy doesn't have Y" determines which counter strategy applies.

### Priority Ordering
- **D-06:** Explicit integer `priority` column on `counter_strategies`. Lower number = try first. Admin controls order.

### Access Control
- **D-07:** Open read/write for now — no RLS restrictions. Auth and role-based access deferred to v2. Migration should still create basic RLS policies (anon can read and write) so the structure is ready for tightening later.

### Offline Fallback
- **D-08:** No offline seed data for counter strategies. Strategies require Supabase connection. Unlike characters, no fallback to local JSON.

### Claude's Discretion
- Exact column types and constraints (nullable vs required)
- Index strategy for common query patterns
- Whether counter strategies store team members inline or via a join table
- Migration file naming (should be `007_counter_strategies.sql` based on existing sequence)
- Strategy notes field type (text vs jsonb)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Existing Schema
- `supabase/migrations/` — All existing migrations (001-006) for table naming conventions, RLS patterns
- `src/types/database.ts` — Current Database interface with existing table types

### Research
- `.planning/research/ARCHITECTURE.md` — Recommended schema design for counter system
- `.planning/research/STACK.md` — Technology recommendations

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- Existing migration pattern: SQL files in `supabase/migrations/` numbered sequentially
- `characters` table with `id` (uuid) as the character identity — all new FKs reference this
- `team_compositions` table pattern shows how team → member relationships are modeled

### Established Patterns
- RLS policies pattern from `003_security_hardening.sql` and `006_open_writes.sql`
- UUID primary keys with `gen_random_uuid()` default
- `created_at` and `updated_at` timestamp columns on all tables
- Database types generated into `src/types/database.ts` with Row/Insert/Update variants

### Integration Points
- `characters.id` — FK target for enemy defense members and strategy conditions
- Migration numbering — next is 007

</code_context>

<specifics>
## Specific Ideas

- Strategy conditions are about the enemy team composition, not the counter team
- Priority ordering must be explicit integer, not insertion order (research flagged this as a pitfall)
- The condition model should be simple enough that a flat `WHERE condition_type = 'must_have' AND character_id IN (...)` query works

</specifics>

<deferred>
## Deferred Ideas

- Auth/RLS tightening — v2 (AUTH-01, AUTH-02)
- Offline seed data for strategies — explicitly skipped, not needed

</deferred>

---

*Phase: 01-counter-strategy-schema*
*Context gathered: 2026-04-06*
