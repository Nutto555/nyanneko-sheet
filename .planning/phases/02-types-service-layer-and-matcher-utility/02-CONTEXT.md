# Phase 2: Types, Service Layer, and Matcher Utility - Context

**Gathered:** 2026-04-06
**Status:** Ready for planning

<domain>
## Phase Boundary

TypeScript types for the 4 new counter-strategy tables, a single service file with full CRUD operations, a pure client-side strategy matcher utility, and unit tests for the matcher. No UI, no pages, no routes — this is the data layer that Phase 3+ builds on.

</domain>

<decisions>
## Implementation Decisions

### Service Scope
- **D-01:** Full CRUD in a single `src/services/strategies.ts` file — reads and writes together. Counter-strategy is a distinct domain; no splitting across admin.ts.
- **D-02:** No offline fallback. Per Phase 1 D-08, strategies require Supabase. Return empty arrays if not configured. No seed data to maintain.

### Matcher Algorithm
- **D-03:** Partial matching uses character overlap ratio: score = (matched enemy characters ÷ template members). A 4/6 overlap scores higher than 2/6.
- **D-04:** Show all templates ranked by match score, no minimum threshold. Let the UI layer handle display (e.g., dim low-relevance results).
- **D-05:** Tiebreaker on equal overlap scores: use admin-controlled `sort_order` from `enemy_defense_templates`.
- **D-06:** `evaluateStrategy()` filters strategies by must_have/must_not_have conditions — returns true/false. Only matching strategies appear in results.

### Zod Validation
- **D-07:** Zod schemas for write payloads only (create/update strategy, create/update template, add conditions). Search inputs are simple character ID arrays — TypeScript types are sufficient.
- **D-08:** Schemas live in a dedicated `src/schemas/strategies.ts` file, separate from types and services.

### Testing Setup
- **D-09:** Use Vitest as the test framework. Native Vite integration, same config.
- **D-10:** Unit tests for `strategyMatcher.ts` only in Phase 2. Pure functions, no mocking needed. Service layer tests deferred — they need Supabase mocking which adds complexity.

### Claude's Discretion
- Exact function signatures and return types for service CRUD operations
- How to structure the Database interface additions in database.ts (follow existing Row/Insert/Update pattern)
- Vitest configuration details
- Internal helper functions within the matcher

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Schema (Phase 1 output)
- `supabase/migrations/007_counter_strategies.sql` — Defines all 4 tables, columns, constraints, and indexes that types must mirror
- `.planning/phases/01-counter-strategy-schema/01-CONTEXT.md` — Phase 1 decisions (D-01 through D-08) that constrain this phase

### Existing Patterns
- `src/types/database.ts` — Current Database interface, Row/Insert/Update pattern, entity types to extend
- `src/services/characters.ts` — Service pattern: isSupabaseConfigured(), Supabase queries, error handling
- `src/services/admin.ts` — Write operation patterns (create, update, delete)

### Requirements
- `.planning/REQUIREMENTS.md` — DATA-07 (types + service layer) and DATA-08 (matcher utility)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/types/database.ts`: Database interface with Row/Insert/Update pattern — extend with 4 new table entries
- `src/lib/supabase.ts`: Typed Supabase client (`createClient<Database>`) — reuse for strategy queries
- `src/services/characters.ts`: Service pattern template — async functions, error handling, console.error in DEV
- `isSupabaseConfigured()` helper in multiple services — reuse (though strategies will just return empty arrays)

### Established Patterns
- Types: `Omit<T, 'id' | 'created_at' | 'updated_at'>` for Insert, `Partial<Omit<T, 'id'>>` for Update
- Services: Named exports, async functions returning `Promise<T[]>` or `Promise<T | null>`
- Joins: Extended interfaces like `TeamWithMembers extends TeamComposition` with nested relations
- Error handling: `console.error()` in DEV, return fallback/empty data

### Integration Points
- `Database.public.Tables` — new entries for all 4 counter-strategy tables
- `characters.id` — FK references in enemy_defense_members and strategy_conditions
- `team_compositions.id` — FK reference in counter_strategies.counter_team_id

</code_context>

<specifics>
## Specific Ideas

- `resolveMatchingStrategies()` and `evaluateStrategy()` must be pure functions — no UI or Supabase imports in `strategyMatcher.ts`
- The matcher accepts pre-fetched data (templates with members, strategies with conditions) and an array of enemy character IDs as input
- Matcher output should include the match score so the UI layer can use it for display decisions

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 02-types-service-layer-and-matcher-utility*
*Context gathered: 2026-04-06*
