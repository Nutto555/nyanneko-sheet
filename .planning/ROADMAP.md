# Roadmap: Nyanneko Sheet — Seven Knights Rebirth Strategy Hub

## Overview

The existing codebase has a character database and basic GvG team viewer. This roadmap extends it with a conditional counter-strategy system: a relational data foundation, a member-facing counter lookup, an admin strategy builder with drag-to-reorder and condition authoring, a member submission queue, and a visual UI overhaul. Phases follow a strict dependency order — schema before types, types before service, service before UI, auth bundled with the first writable admin route.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Counter Strategy Schema** - Supabase migration with four new tables, RLS policies, and indexes for the counter-strategy system
- [ ] **Phase 2: Types, Service Layer, and Matcher Utility** - TypeScript types, CRUD service functions, and the client-side strategy matcher utility with unit tests
- [ ] **Phase 3: Shared UI Components** - Character multi-select (Headless UI + Fuse.js) and character portraits used throughout the app
- [ ] **Phase 4: Counter Lookup Page** - Member-facing search page with template gallery, priority-ordered results, and conditional branching display
- [ ] **Phase 5: Admin Strategy Builder** - Admin route with auth guard, strategy create/edit/delete, condition editor, and drag-to-reorder priority
- [ ] **Phase 6: Enemy Defense Templates** - Admin management of named popular enemy comps shown at the top of the browse view
- [ ] **Phase 7: Member Submission Queue** - Members submit counter team suggestions; admin reviews, approves, or rejects
- [ ] **Phase 8: Frontend UI Polish** - Consistent visual design, character portraits everywhere, responsive layout, and clear navigation

## Phase Details

### Phase 1: Counter Strategy Schema
**Goal**: The Supabase database has a correct, production-ready schema for the conditional counter-strategy system
**Depends on**: Nothing (brownfield — existing character DB and team tables are the foundation)
**Requirements**: DATA-01, DATA-02, DATA-03, DATA-04, DATA-05, DATA-06
**Success Criteria** (what must be TRUE):
  1. Migration `007_counter_strategies.sql` applies cleanly against a fresh Supabase instance without errors
  2. Four new tables exist: `enemy_defense_templates`, `enemy_defense_members`, `counter_strategies`, `strategy_conditions`
  3. `strategy_conditions` rows have an explicit `condition_type` column (`must_have` | `must_not_have`) — no freeform condition encoding
  4. Priority ordering is stored as an explicit integer column on `counter_strategies`, not derived from insertion order
  5. RLS policies are present on all new tables; direct unauthenticated writes are rejected
**Plans**: 1 plan

Plans:
- [x] 01-01-PLAN.md — Write migration 007_counter_strategies.sql, push schema, verify integrity

### Phase 2: Types, Service Layer, and Matcher Utility
**Goal**: TypeScript types and service functions cover all counter-strategy reads and writes; the strategy matcher utility evaluates conditions against an enemy team with full unit test coverage
**Depends on**: Phase 1
**Requirements**: DATA-07, DATA-08
**Success Criteria** (what must be TRUE):
  1. `database.ts` TypeScript types reflect all four new tables with no `as unknown as` casts in the service layer
  2. `strategies.ts` service exposes read functions (`getEnemyTemplates`, `getCounterStrategies`) that follow the existing `isSupabaseConfigured()` pattern
  3. `strategyMatcher.ts` exports `evaluateStrategy()` and `resolveMatchingStrategies()` as pure functions with no UI or Supabase imports
  4. Unit tests for `strategyMatcher.ts` cover must_have match, must_not_have rejection, priority ordering, and partial-match ranking — all pass
  5. Zod schemas validate strategy form payloads before any Supabase write
**Plans**: 2 plans

Plans:
- [x] 02-01-PLAN.md — Types, service layer CRUD, and Zod validation schemas
- [x] 02-02-PLAN.md — Strategy matcher utility with TDD (tests first, then implementation)

### Phase 3: Shared UI Components
**Goal**: A reusable character multi-select component and character portrait display are available for use in both the member search page and the admin builder
**Depends on**: Phase 2
**Requirements**: LOOK-02, LOOK-03
**Success Criteria** (what must be TRUE):
  1. A guild member can type a partial character name (English or Thai) and see matching portrait suggestions within the multi-select input
  2. Selected characters display as portrait chips that can be individually removed
  3. Team composition displays throughout the app show character portrait images, not text-only names
  4. The Fuse.js instance is created inside `useMemo` — retyping a character name does not re-index the full character list on each keystroke
**Plans**: 2 plans
**UI hint**: yes

Plans:
- [x] 03-01-PLAN.md — Extract safeImageUrl utility, configure test infra, create CharacterPortrait component
- [x] 03-02-PLAN.md — Create useCharacterSearch hook and CharacterMultiSelect combobox component

### Phase 4: Counter Lookup Page
**Goal**: A guild member can look up the right counter for any enemy defense team by selecting enemy characters or clicking a popular template, and sees prioritized results with conditions and notes
**Depends on**: Phase 3
**Requirements**: LOOK-01, LOOK-04, LOOK-05, LOOK-06, LOOK-07, LOOK-08
**Success Criteria** (what must be TRUE):
  1. A guild member visiting `/counter` can select 1-6 enemy characters and immediately see ranked counter strategies without a page reload
  2. When no exact enemy comp match is found, partial-match results still appear ranked by how many of the selected characters they cover (no empty results on a non-empty selection)
  3. Each counter result displays: counter team with portraits, priority rank (try A first, then B), conditions ("only if enemy has X but not Y"), and strategy notes
  4. Popular enemy defense templates are visible at the top of the page before any search input — clicking one populates the character selector automatically
  5. The `last_verified_at` timestamp is visible on each counter card so members know if the strategy is post-patch
**Plans**: TBD
**UI hint**: yes

### Phase 5: Admin Strategy Builder
**Goal**: An authenticated admin can create, edit, delete, and reorder counter strategies through the web UI; unauthenticated users cannot access or modify strategy data
**Depends on**: Phase 4
**Requirements**: ADMIN-01, ADMIN-02, ADMIN-03, ADMIN-04, ADMIN-06, ADMIN-07
**Success Criteria** (what must be TRUE):
  1. Navigating to `/admin/strategies` without an authenticated admin session redirects to a login page
  2. An admin can create a new counter scenario: choose an enemy template, add one or more counter teams with character autocomplete, attach must_have and must_not_have conditions, and save — the new strategy appears in the member lookup immediately
  3. An admin can drag counter alternatives to reorder them; after saving, the member-facing priority order reflects the new sequence
  4. An admin can add strategy notes (free text) and a `last_verified_at` date to any counter entry
  5. An admin can edit or delete an existing counter strategy from the builder list
**Plans**: TBD
**UI hint**: yes

### Phase 6: Enemy Defense Templates
**Goal**: An admin can manage named enemy defense templates so guild members can browse by archetype rather than manually selecting characters
**Depends on**: Phase 5
**Requirements**: ADMIN-05
**Success Criteria** (what must be TRUE):
  1. An admin can create a named enemy template (e.g. "Lubu Sustain Core") by selecting 4-6 characters via the character autocomplete
  2. An admin can edit a template's name or member characters, or delete a template
  3. Templates created or edited by the admin appear in the member-facing template gallery on the counter lookup page without requiring a cache clear
**Plans**: TBD
**UI hint**: yes

### Phase 7: Member Submission Queue
**Goal**: Guild members can suggest counter teams for admin review, and the admin can approve or reject them through a dedicated review queue
**Depends on**: Phase 5
**Requirements**: SUB-01, SUB-02, SUB-03, SUB-04
**Success Criteria** (what must be TRUE):
  1. A guild member can submit a counter team suggestion for a specific enemy comp, including a note explaining their reasoning
  2. Submitted strategies are not visible in the public counter lookup until an admin approves them
  3. An admin can see a list of all pending submissions and click through to review each one
  4. An admin can approve a submission (it becomes live in the lookup) or reject it (it is removed from the queue) with a single action
**Plans**: TBD
**UI hint**: yes

### Phase 8: Frontend UI Polish
**Goal**: The app has a consistent, clean visual design with character portraits everywhere, works well on mobile, and has clear navigation between all major sections
**Depends on**: Phase 3
**Requirements**: UI-01, UI-02, UI-03, UI-04
**Success Criteria** (what must be TRUE):
  1. Character portraits appear in team displays, search results, and the admin builder without inconsistency across pages
  2. A guild member checking the app on a phone during a GvG battle can read counter strategies and navigate between pages without horizontal scrolling or unreadable text
  3. A navigation element on every page gives one-click access to: Counter Lookup, Team Browser, Character Database, and Admin (admin-only)
  4. The visual layout has consistent spacing, typography, and color use across all pages — no mismatched or unstyled sections
**Plans**: TBD
**UI hint**: yes

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4 -> 5 -> 6 -> 7 -> 8

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Counter Strategy Schema | 0/1 | Not started | - |
| 2. Types, Service Layer, and Matcher Utility | 0/2 | Not started | - |
| 3. Shared UI Components | 0/2 | Not started | - |
| 4. Counter Lookup Page | 0/TBD | Not started | - |
| 5. Admin Strategy Builder | 0/TBD | Not started | - |
| 6. Enemy Defense Templates | 0/TBD | Not started | - |
| 7. Member Submission Queue | 0/TBD | Not started | - |
| 8. Frontend UI Polish | 0/TBD | Not started | - |
