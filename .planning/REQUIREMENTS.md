# Requirements: Nyanneko Sheet — Seven Knights Rebirth Strategy Hub

**Defined:** 2026-04-06
**Core Value:** Guild members can look up any enemy defense team and instantly see what counter to use with the right conditions and fallbacks

## v1 Requirements

### Data Foundation

- [ ] **DATA-01**: Counter strategy data model with structured conditions stored relationally (not freeform text)
- [ ] **DATA-02**: Enemy defense template model — named popular comps (e.g. "Lubu Sustain Core") with member characters
- [ ] **DATA-03**: Priority ordering for counter alternatives per enemy defense scenario
- [ ] **DATA-04**: Condition predicates: positive (must have) and negative (must not have) character conditions per strategy
- [ ] **DATA-05**: Strategy notes field — free text explaining why a counter works and what to watch for
- [ ] **DATA-06**: Supabase migration for new tables (counter_scenarios, scenario_enemy_characters, counter_options, strategy_conditions)
- [ ] **DATA-07**: TypeScript types and service layer for counter strategy CRUD operations
- [ ] **DATA-08**: Client-side strategy matcher utility that evaluates conditions against enemy team input

### Counter Lookup (Member-Facing)

- [ ] **LOOK-01**: Counter search page — member inputs enemy characters, sees matching counter strategies
- [ ] **LOOK-02**: Multi-character search input with fuzzy matching (Fuse.js) against character database
- [ ] **LOOK-03**: Character portraits displayed in all team compositions (enemy and counter teams)
- [ ] **LOOK-04**: Priority-ordered counter alternatives displayed per scenario (try A first, then B, then C)
- [ ] **LOOK-05**: Conditional branching display — visual if/then/else showing which counter applies under which conditions
- [ ] **LOOK-06**: Enemy defense templates shown prominently at top of browse view (common comps)
- [ ] **LOOK-07**: Strategy notes, pros/cons visible per counter entry
- [ ] **LOOK-08**: Partial-match search results when exact enemy comp not found (ranked by relevance)

### Admin Strategy Builder

- [ ] **ADMIN-01**: Admin strategy builder page — create counter scenarios with enemy team + counter teams + conditions
- [ ] **ADMIN-02**: Character autocomplete/search (Headless UI Combobox) for composing teams
- [ ] **ADMIN-03**: Condition editor — add positive (must have) and negative (must not have) character conditions
- [ ] **ADMIN-04**: Priority drag-and-drop reordering of counter alternatives (dnd-kit)
- [ ] **ADMIN-05**: Enemy defense template management — create/edit/delete named popular comps
- [ ] **ADMIN-06**: Edit and delete existing counter strategies
- [ ] **ADMIN-07**: Strategy version timestamp — auto-updated on save, visible to members

### Member Submissions

- [ ] **SUB-01**: Member can submit a counter team suggestion for a specific enemy comp
- [ ] **SUB-02**: Submission includes notes explaining reasoning
- [ ] **SUB-03**: Admin can view pending submissions queue
- [ ] **SUB-04**: Admin can approve (publish) or reject submissions

### Frontend UI Improvements

- [ ] **UI-01**: Improved visual design — cleaner layout, better spacing, consistent styling
- [ ] **UI-02**: Character portraits used throughout (team displays, search results, builder)
- [ ] **UI-03**: Responsive design for mobile viewing (guild members checking during battles)
- [ ] **UI-04**: Clear navigation between counter lookup, team browser, character database, and admin

## v2 Requirements

### Analytics & Meta

- **META-01**: Enemy comp frequency indicators (which defense comps appear most often)
- **META-02**: Counter effectiveness voting (upvotes from guild members)
- **META-03**: Filter counters by owned characters (member roster tracking)

### Enhanced Admin

- **EADM-01**: Import counter data from Excel
- **EADM-02**: Bulk operations on strategies
- **EADM-03**: Print/export strategy sheets for offline reference

### Auth & Access

- **AUTH-01**: Full Supabase auth with admin vs member roles
- **AUTH-02**: Login/signup flow for guild members

## Out of Scope

| Feature | Reason |
|---------|--------|
| Full decision-tree visual editor (drag/drop nodes) | Overkill for single admin — structured form is 10x faster |
| Real-time win/loss tracking | No game API; manual logging has low adoption |
| Chat or messaging | Guild uses Discord/LINE already |
| Multi-guild / public access | Single guild tool, no multi-tenancy needed |
| Automated meta tracking | No official SK:Rebirth API; scraping violates ToS |
| Character stat optimizer | PvE domain, this tool is GvG counter-picking only |
| Mobile native app | Responsive web is sufficient |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| DATA-01 | Pending | Pending |
| DATA-02 | Pending | Pending |
| DATA-03 | Pending | Pending |
| DATA-04 | Pending | Pending |
| DATA-05 | Pending | Pending |
| DATA-06 | Pending | Pending |
| DATA-07 | Pending | Pending |
| DATA-08 | Pending | Pending |
| LOOK-01 | Pending | Pending |
| LOOK-02 | Pending | Pending |
| LOOK-03 | Pending | Pending |
| LOOK-04 | Pending | Pending |
| LOOK-05 | Pending | Pending |
| LOOK-06 | Pending | Pending |
| LOOK-07 | Pending | Pending |
| LOOK-08 | Pending | Pending |
| ADMIN-01 | Pending | Pending |
| ADMIN-02 | Pending | Pending |
| ADMIN-03 | Pending | Pending |
| ADMIN-04 | Pending | Pending |
| ADMIN-05 | Pending | Pending |
| ADMIN-06 | Pending | Pending |
| ADMIN-07 | Pending | Pending |
| SUB-01 | Pending | Pending |
| SUB-02 | Pending | Pending |
| SUB-03 | Pending | Pending |
| SUB-04 | Pending | Pending |
| UI-01 | Pending | Pending |
| UI-02 | Pending | Pending |
| UI-03 | Pending | Pending |
| UI-04 | Pending | Pending |

**Coverage:**
- v1 requirements: 31 total
- Mapped to phases: 0
- Unmapped: 31

---
*Requirements defined: 2026-04-06*
*Last updated: 2026-04-06 after initial definition*
