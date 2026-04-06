# Nyanneko Sheet — Seven Knights Rebirth Strategy Hub

## What This Is

A guild strategy hub for Seven Knights Rebirth that helps guild members find the right counter team for any enemy defense composition. Admins create conditional counter strategies (decision trees with priority-ordered alternatives), and guild members search or browse to find the right response for each matchup.

## Core Value

Guild members can look up any enemy defense team and instantly see what counter to use — with the right conditions and fallbacks — so the guild wins more GvG battles.

## Requirements

### Validated

- ✓ Character database with images, skills, and metadata — existing
- ✓ Basic GvG team viewer (team compositions display) — existing
- ✓ Admin panel for data management — existing
- ✓ Team CRUD operations (create, read, update, delete) — existing
- ✓ Excel import for bulk team data — existing
- ✓ Supabase backend with offline seed data fallback — existing
- ✓ Character detail pages with skill information — existing
- ✓ Counter-strategy schema (4 new tables) — Validated in Phase 1
- ✓ TypeScript types, service layer, and strategy matcher utility — Validated in Phase 2

### Active

- [ ] Conditional counter strategy system — define "if enemy has X (but not Y), use Team Z" with branching logic
- [ ] Priority-ordered alternatives — "try Team A first, if blocked try B, fallback to C"
- [ ] Enemy defense team templates — common/popular enemy comps shown prominently at the top
- [ ] Counter search — guild members search by enemy characters to find matching counter strategies
- [ ] Admin strategy builder — quick character search/autocomplete to compose teams and attach conditions
- [ ] Strategy submission — guild members can submit team suggestions for admin review
- [ ] Improved frontend UI — better visual design, character portraits in team displays, clearer navigation
- [ ] Strategy notes/guides — text explanations for why a counter works and what to watch for

### Out of Scope

- Real-time chat or messaging — use Discord/LINE for guild comms
- Automated meta tracking or win-rate analytics — manual strategy curation is the goal
- Multi-guild support or public access — this is for one guild
- Mobile native app — responsive web is sufficient
- PvE content guides — focus is GvG defense countering

## Context

- **Game:** Seven Knights Rebirth (sequel to Seven Knights by Netmarble)
- **GvG format:** Guild members attack enemy defense teams; knowing the right counter is critical
- **Current workflow:** Strategies are managed in Excel with copy-pasted character images; web version needed for faster team creation and better discoverability
- **Strategy complexity:** Ranges from simple character swaps to multi-condition branching with priority fallbacks
- **Existing codebase:** React 19 + TypeScript + Vite + Supabase + Tailwind CSS; character DB and basic team features already built
- **Users:** Admin (strategy creator/editor) + guild members (readers, can submit teams)
- **Existing architecture:** Layered client-side app — Pages → Hooks → Services → Supabase, with type-safe DB interface

## Constraints

- **Tech stack**: React + TypeScript + Supabase + Tailwind — already established, continue with same stack
- **Auth**: Supabase auth for admin vs member roles
- **Data**: Character database is the source of truth — strategies reference characters by ID
- **Deployment**: Static frontend (Vite build) with Supabase as backend
- **Solo admin**: Strategy authoring UX must be fast for a single power user

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Conditional branching as data model (not hardcoded) | Strategies need flexible if/then/else logic that varies per matchup | — Pending |
| Character search/autocomplete for team building | Faster than dropdown lists when you know the character names | — Pending |
| Priority-ordered counter alternatives | Some matchups have multiple viable counters depending on available units | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-06 after Phase 2 completion*
