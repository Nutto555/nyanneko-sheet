# Project Research Summary

**Project:** Nyanneko Sheet — Conditional Counter-Strategy System
**Domain:** Guild GvG strategy hub / conditional counter-picking tool (Seven Knights Rebirth)
**Researched:** 2026-04-06
**Confidence:** HIGH

## Executive Summary

Nyanneko Sheet is a guild strategy hub for Seven Knights Rebirth GvG that is being extended to support conditional counter-picking: given a known enemy defense team, the tool surfaces ordered counter options, each gated by structured conditions ("use Team A only if enemy has X but not Y"). The recommended approach builds on the existing React 19 + Supabase + Tailwind 4 stack with minimal additions — four small libraries (@headlessui/react, fuse.js, @dnd-kit/sortable, zod) and four new relational Supabase tables. No external rules-engine library, no JSONB blobs, no second UI framework. The core innovation — conditional branching logic — lives in a pure client-side utility function (`strategyMatcher.ts`) that is fully unit-testable and independent of the UI layer.

The recommended feature set, grounded in analysis of SWGT, Fribbels E7 tracker, and Pokemon Showdown, divides into three layers: a core lookup layer (search by enemy characters, see prioritized counter options), an admin productivity layer (strategy builder with autocomplete and drag-to-reorder), and a community loop layer (member submission queue with admin review). The conditional logic engine is the primary differentiator — no surveyed comparable tool handles this natively. Visual node editors, global state managers, generic rule-builder components, and full-stack analytics are explicitly out of scope.

The dominant risk is data model decisions made too quickly. The existing codebase already shows the consequences of freeform condition encoding (dual-format `gear_notes`, unsafe type assertions in service files, unauthenticated admin panel). These same mistakes will replicate into the new system unless structured condition storage, Zod runtime validation, and Supabase auth are treated as prerequisites rather than follow-ups. Build the schema and the matcher utility first; UI depends on both.

---

## Key Findings

### Recommended Stack

The project runs on React 19 + TypeScript 5.9 + Vite + Tailwind 4 + Supabase and nothing about this needs to change. Four additions are warranted: `@headlessui/react` for the admin character combobox (purpose-built, Tailwind-native, React 19 verified), `fuse.js` for client-side fuzzy character name search (7 KB, no deps, handles both `name_en` and `name_th` fields), `@dnd-kit/core` + `@dnd-kit/sortable` for drag-to-reorder priority lists (actively maintained, accessible, replaces the deprecated react-beautiful-dnd), and `zod` 4.x for runtime validation of strategy form inputs and Supabase response shapes. The decision-tree/conditional logic layer requires no library — it is a custom relational schema in Supabase plus a pure TypeScript utility function.

**Core technologies:**
- `@headlessui/react` 2.2.9: Admin character combobox — purpose-built for embedded inline combobox in forms, React 19 peer deps confirmed, unstyled for Tailwind 4 compatibility
- `fuse.js` 7.3.0: Client-side fuzzy character search — 7 KB, handles partial names and bilingual fields (name_en / name_th), runs in-browser over <200 characters
- `@dnd-kit/core` 6.3.1 + `@dnd-kit/sortable` 10.0.0: Drag-to-reorder priority list — actively maintained, accessible, React >=16.8 compatible, replaces deprecated react-beautiful-dnd
- `zod` 4.3.6: Runtime schema validation — validates strategy forms before Supabase writes, eliminates `as unknown as` type casts in new service code
- Custom JSONB-free relational schema: Conditions stored in `strategy_conditions` join table, not as freeform text or JSON blobs — supports querying, cascading deletes, and RLS

### Expected Features

Reference tools studied: SWGT, Fribbels E7 GW Meta Tracker, Pokemon Showdown Team Builder, Paimon.plus, VGC Helper.

**Must have (table stakes):**
- Counter strategy display with character portraits — industry standard; text-only teams feel unfinished
- Search by enemy characters — primary lookup workflow for guild members entering battle
- Priority-ordered counter alternatives — critical for GvG where characters are depleted across rounds
- Strategy notes per counter — explains why a counter works; tools that omit this lose long-term trust
- Admin create/edit strategy with character autocomplete — if admin UX is slow, strategies go stale
- Role-based access (admin vs member) — Supabase Auth already in stack; required for data integrity

**Should have (differentiators):**
- Structured condition definitions per strategy (positive + negative character conditions) — no surveyed tool does this; primary reason this tool exists
- Enemy defense templates (named common comps) — lets members navigate by archetype rather than raw characters
- Member submission queue with admin review — crowdsources guild knowledge, reduces single-admin bottleneck
- Strategy version/last-updated timestamp — critical for trust after game patches
- Pros/cons structured fields per counter — SWGT pattern; low effort, high admin expressiveness
- Clone strategy action in admin builder — avoids repetitive data entry for variant counters

**Defer to later milestones:**
- Enemy comp frequency indicators — requires tracking infrastructure, high effort for single-guild scale
- Counter effectiveness voting — requires auth maturity and trust infrastructure
- Filter counters by owned characters — major scope expansion, separate milestone
- Import counter data from Excel — separate schema, defer until admin workflow proves too slow

### Architecture Approach

The system maps to a three-level hierarchy: `EnemyDefenseTemplate` (named enemy comp) → `CounterStrategy` (ordered counter option with conditions) → `TeamComposition` (existing table). Four new Supabase tables handle this: `enemy_defense_templates`, `enemy_defense_members`, `counter_strategies`, and `strategy_conditions`. Condition evaluation (must_have / must_not_have character checks) runs client-side in a pure `strategyMatcher.ts` utility function — not in SQL, not embedded in React components. This keeps the DB as a simple data store, the utility fully unit-testable, and the query layer a single Supabase join. Both search entry modes (template click and freeform multi-character select) route through the same `getCounterStrategies()` service function.

**Major components:**
1. `strategies.ts` service — all Supabase reads and writes for the new tables; follows existing `isSupabaseConfigured()` pattern
2. `strategyMatcher.ts` utility — pure `evaluateStrategy()` + `resolveMatchingStrategies()` functions; no UI or Supabase imports; fully unit-testable in isolation
3. `CounterSearch` page — member-facing lookup: character multi-select + template gallery + results list
4. `AdminStrategyBuilder` page — admin CRUD: template management, counter strategy creation, condition builder, drag-to-reorder
5. `CharacterMultiSelect` component — shared between search UI and admin builder; backed by Headless UI Combobox + Fuse.js
6. `StrategyCard` / `StrategyResults` components — render matched strategies in priority order with conditions and notes

### Critical Pitfalls

1. **Freeform/JSON conditions (Pitfall 1)** — The existing `gear_notes` dual-format issue is the direct warning. Store all conditions in the `strategy_conditions` join table with explicit `condition_type: 'must_have' | 'must_not_have'` rows. Validate with Zod before any write. Never encode logic in a text field.
2. **No auth on admin strategy routes (Pitfall 10)** — The current admin panel at `/admin` is unauthenticated. The counter strategy admin introduces more destructive write operations. Supabase Auth + RLS policies on all new tables must ship in the same milestone as the admin builder, not a future one.
3. **Exact-match search returning zero results (Pitfall 4)** — Enemy teams rarely match a stored template exactly. Search must implement ranked partial matching from day one: "matches 3 of 5 selected characters" surfaces the best available strategy even when no exact match exists. Empty results on any non-empty character selection destroys trust in the tool.
4. **Priority order corruption on reorder (Pitfall 6)** — Priority must be an explicit integer column, not derived from array index or insertion order. Reorder operations must batch-update all affected rows atomically. Test this explicitly: reorder 3 strategies and verify the database reflects the new order.
5. **Fuse.js instance recreated every render (Pitfall 8)** — Wrap `new Fuse(characters, options)` in `useMemo`. Without this, every keystroke re-indexes all characters, adding latency on mobile devices used during GvG battles.

---

## Implications for Roadmap

Based on combined research, four phases are recommended. The ordering is driven by hard dependencies: schema before types, types before service, service before UI, and auth before any writable admin UI ships.

### Phase 1: Data Foundation
**Rationale:** Everything downstream depends on the schema and type definitions being correct. Retrofitting a schema after UI is built is expensive (see Pitfall 1). The `strategyMatcher` utility can be written and fully unit-tested before any component exists.
**Delivers:** Migration `007_counter_strategies.sql` with four new tables + RLS policies + indexes; extended `database.ts` types; `strategies.ts` service (read path); `strategyMatcher.ts` utility with unit tests.
**Addresses:** Counter strategy data model, condition definitions, priority ordering column
**Avoids:** Pitfall 1 (freeform conditions), Pitfall 6 (priority corruption), Pitfall 9 (unsafe type casts — install Zod here)

### Phase 2: Member-Facing Counter Lookup (Read Path)
**Rationale:** The read path is simpler, has higher usage frequency, and unblocks guild members immediately without requiring auth. `CharacterMultiSelect` is a shared dependency also used by the admin builder — building it here means it is ready and tested when Phase 3 begins.
**Delivers:** `CharacterMultiSelect` component (Headless UI Combobox + Fuse.js), `EnemyTemplateList` component, `StrategyCard` + `StrategyResults` components, `useCounterSearch` + `useEnemyTemplates` hooks, `CounterSearch` page at `/counter`.
**Uses:** @headlessui/react, fuse.js, existing character seed data
**Implements:** Counter lookup data flow; partial-match ranking algorithm
**Avoids:** Pitfall 4 (exact-match zero results), Pitfall 7 (name mismatch — search name_en + name_th), Pitfall 8 (Fuse.js useMemo)

### Phase 3: Admin Strategy Builder (Write Path + Auth)
**Rationale:** Auth is a prerequisite for any writable admin UI (Pitfall 10). This phase adds Supabase Auth, RLS policies, write service functions, and the admin builder in a single milestone. Separating auth from the admin UI would create a window where writable strategy routes are live but unprotected.
**Delivers:** Supabase Auth integration + admin route guard; write functions in `strategies.ts`; `AdminStrategyBuilder` page at `/admin/strategies`; drag-to-reorder with @dnd-kit/sortable; condition builder UI; strategy preview; `last_verified_at` / `needs_review` admin workflow.
**Uses:** @dnd-kit/core, @dnd-kit/sortable, zod validation on all write paths
**Implements:** Admin create/edit/delete flow; atomic priority reorder; live strategy preview
**Avoids:** Pitfall 5 (slow admin UX — autocomplete, clone, inline edit), Pitfall 6 (priority atomicity), Pitfall 10 (auth prerequisite), Pitfall 3 (staleness — add `last_verified_at` column)

### Phase 4: Community Loop (Member Submission Queue)
**Rationale:** Builds on the complete read + write foundation. Requires auth from Phase 3. Lower urgency — core tool is fully usable by the guild without this. Can be a separate milestone.
**Delivers:** Member strategy submission form, pending submissions table (or `status` column on `counter_strategies`), admin review/approve/reject workflow, submission notes field.
**Addresses:** Member submission queue, admin review workflow, strategy version timestamps
**Research flag:** Standard CRUD + status-machine pattern; no deep research needed.

### Phase Ordering Rationale

- Schema before code is non-negotiable: TypeScript types cannot be written without the schema, and services cannot be written without types.
- Pure utility (`strategyMatcher`) before UI: unit tests validate matching semantics before any component depends on them.
- Read path before write path: members get value sooner; `CharacterMultiSelect` is built once and reused.
- Auth ships with admin writer, not separately: eliminates the unauthenticated admin window documented in CONCERNS.md and flagged as Pitfall 10.
- Submission queue is last because it requires both auth (Phase 3) and a working strategy display (Phase 2) to be meaningful.

### Research Flags

Phases with standard patterns (skip deeper research):
- **Phase 1 (Data Foundation):** Schema patterns are well-documented in Supabase docs and directly derived from existing project migrations. No new research needed.
- **Phase 4 (Submission Queue):** Standard CRUD + status-machine. Well-documented pattern.

Phases that may benefit from targeted research during planning:
- **Phase 2 (Counter Lookup):** The partial-match ranking algorithm is custom. Worth a short design spike before implementation to define "how many of N characters must match for a template to appear in results" — this is a product decision with UX implications, not a purely technical one.
- **Phase 3 (Admin Builder):** The "clone strategy" interaction and "live preview while editing" pattern are UX-sensitive. A lightweight prototype with the admin user before full build is recommended (see Pitfall 5).

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All library versions verified via `npm info`. React 19 peer deps confirmed. Existing stack constraints are concrete. |
| Features | HIGH | Table stakes and differentiators derived from 6 comparable tools with consistent patterns. Anti-features grounded in PROJECT.md explicit scope. |
| Architecture | HIGH | Schema design derived directly from existing project migrations + PostgreSQL relational modeling best practices. Component boundaries follow existing project conventions. |
| Pitfalls | HIGH | Six of twelve pitfalls are grounded in existing codebase tech debt (CONCERNS.md, dual-format fields, unauthenticated admin). Not speculative. |

**Overall confidence:** HIGH

### Gaps to Address

- **Partial-match ranking threshold:** Research defined the need for ranked partial matching but not the specific threshold (e.g., "show templates matching at least 1 of N selected characters, ranked by match count"). This is a product decision requiring admin + member input before Phase 2 implementation.
- **Auth provider choice:** Supabase Auth is confirmed as the mechanism, but the specific flow (email/password, magic link, or social OAuth) is not decided. Must be decided in Phase 3 planning given the guild's current access pattern.
- **Seed data strategy for offline fallback:** The existing `seed-data.json` pattern applies to characters and teams, not counter strategies. Whether to extend the seed export or remove offline fallback for the counter system is an open decision (Pitfall 11). Defer the decision to Phase 2 but make it before the `CounterSearch` page ships.
- **`aliases` column for characters:** Pitfall 7 recommends an `aliases` array for community nicknames. This requires a schema migration against the existing `characters` table. Scope this in Phase 1 planning — small change, high search UX value.

---

## Sources

### Primary (HIGH confidence)
- Direct codebase analysis — `src/types/database.ts`, `src/services/teams.ts`, `supabase/migrations/001_initial_schema.sql`, `CONCERNS.md`, `PROJECT.md`
- `npm info @headlessui/react`, `npm info @dnd-kit/core`, `npm info @dnd-kit/sortable`, `npm info fuse.js`, `npm info zod` — version and peer dep verification
- Headless UI Combobox docs: https://headlessui.com/react/combobox
- dnd-kit docs: https://dndkit.com/
- Fuse.js docs: https://www.fusejs.io/
- Zod docs: https://zod.dev/
- Supabase JSONB guidance: https://supabase.com/docs/guides/database/json

### Secondary (MEDIUM confidence)
- SWGT (Summoners War Game Tools) — https://swgt.io/3mdc/ — counter display format, pros/cons, submission workflow
- Fribbels Epic 7 GW Meta Tracker — https://fribbels.github.io/e7/gw-meta.html — search-by-defense, include/exclude filter patterns
- Pokemon Showdown Team Builder — https://play.pokemonshowdown.com/teambuilder — autocomplete UX gold standard
- PostgreSQL hierarchical data modeling — MadeCurious, Ackee.agency
- PostgreSQL JSON anti-patterns — EDB blog

### Tertiary (LOW confidence)
- Enemy comp frequency indicators — only seen in analytics-heavy tools at larger scale than this guild; applicability to this scope is unverified
- Keyboard shortcut UX for admin builder — inferred from Smogon UX thread; not validated against this admin's workflow

---

*Research completed: 2026-04-06*
*Ready for roadmap: yes*
