# Domain Pitfalls

**Domain:** Guild strategy / counter-picking tool (Seven Knights Rebirth GvG)
**Researched:** 2026-04-06
**Milestone scope:** Adding conditional counter-strategy system — decision trees, priority-ordered counters, search interface

---

## Critical Pitfalls

Mistakes that cause rewrites, data loss, or make the system unusable for the admin.

---

### Pitfall 1: Encoding Conditional Logic as Free-Text or Ad-Hoc JSON

**What goes wrong:** The current codebase already does this for `strategy_notes` (regex-parsed plain text) and `gear_notes` (JSON-or-string dual format). If the new conditional counter system follows the same pattern — storing "if enemy has X, use team Y" as free-text or unschematized JSON blobs — the logic becomes impossible to query, validate, or display reliably.

**Why it happens:** It is fast to start. Admin types conditions in a text field. Works fine for one or two strategies. Falls apart at 20+ strategies when conditions can't be searched, when the admin makes a typo that silently fails, and when the UI needs to render branching logic rather than a flat text blob.

**Consequences:**
- Counter search cannot query inside free-text conditions — user searches for "Kris" and gets no results because the condition is buried in unstructured text
- Condition rendering breaks whenever the text format drifts slightly
- Admin has no guardrails: invalid conditions saved silently, discovered only when members see broken UI
- Cannot implement priority ordering reliably on freeform data

**Prevention:**
- Model conditions as structured data from day one: a condition is `{ character_ids_required: string[], character_ids_excluded: string[], label: string }`, not a sentence
- Use a Zod schema to validate condition shapes before writing to Supabase
- Store conditions in a dedicated `counter_conditions` table (or a validated `jsonb` column with a CHECK constraint), not embedded in a notes field
- The existing `gear_notes` dual-format problem is the direct warning — do not repeat it for conditions

**Warning signs:**
- Any field named `_notes` that holds conditional logic
- Any code path that uses regex to parse if/then logic out of a string
- "We'll figure out the format later" during schema design

**Phase:** Must be resolved in the data model phase, before any UI is built. Retrofitting a schema onto existing freeform text is expensive.

---

### Pitfall 2: Overly Complex Condition Matching Logic in the Client

**What goes wrong:** The search feature needs to match "enemy has characters A and B but not C" against stored conditions. If matching logic is written as ad-hoc client-side JavaScript (nested loops, inline conditionals), it diverges from what is actually stored in the database, becomes untestable, and breaks when conditions have edge cases (partial matches, character variants, empty conditions).

**Why it happens:** Matching feels simple at first — just check if the selected characters overlap with the condition. But priority ordering, "excluded character" conditions, partial match fallbacks, and "no condition" (catch-all) strategies require a small but real rules engine.

**Consequences:**
- Member searches for a 4-character enemy team and gets wrong counter because partial-match logic is wrong
- Admin creates a "not X" exclusion condition and members never see it (exclusion not handled)
- Priority ordering silently ignored because list is sorted incorrectly after match

**Prevention:**
- Write a pure function `matchCondition(selectedCharIds: string[], condition: Condition): boolean` with explicit tests before connecting it to the UI
- Define the matching contract explicitly: what does "partial match" mean? Do all required characters need to be present, or any?
- Handle the catch-all case (condition with no character requirements = always matches, lowest priority)
- Unit-test the matching function with at least: exact match, partial match, excluded-character blocking, catch-all fallback, empty input

**Warning signs:**
- Matching logic written inline inside a `.filter()` inside a component
- No tests for the matching function
- "It works for the happy path" — edge cases untested

**Phase:** Build and test the matching function as a standalone utility before building any UI that depends on it.

---

### Pitfall 3: Strategy Data Becomes Stale After Game Patches

**What goes wrong:** Seven Knights Rebirth patches characters regularly. A counter strategy that was valid last month (use Kris to counter team X) may be wrong after a balance patch buffs team X. The tool will confidently show wrong recommendations to guild members, eroding trust faster than having no tool at all.

**Why it happens:** The tool has no concept of "this strategy was written for patch X" and no mechanism for the admin to flag outdated entries. Members have no way to know if what they are reading is current.

**Consequences:**
- Guild loses GvG battles following outdated guides
- Admin has to manually review every strategy after each patch with no UI support
- Members stop trusting the tool and revert to Discord/LINE (defeating the purpose)

**Prevention:**
- Add a `last_verified_at` timestamp and optional `patch_version` field to strategy records
- Show a "last updated" date on every strategy card — even if it's just the row `updated_at` from Supabase
- Build a simple admin workflow: "mark all strategies as needing review" button (bulk-sets a `needs_review` flag), then let admin clear the flag as each is verified
- Avoid building a full versioning system; a simple staleness indicator is sufficient and low-cost

**Warning signs:**
- No `updated_at` visible in the member-facing UI
- Admin has no way to mark strategies as needing review after a patch
- Strategy records have no temporal metadata at all

**Phase:** Add temporal metadata columns in the database phase. Surface `last_updated` in the frontend during the member view phase. The admin "needs review" workflow can be deferred to a later milestone but the data model must support it from the start.

---

### Pitfall 4: Counter Search Returns No Results When Members Expect Partial Matches

**What goes wrong:** Member selects 5 enemy characters and searches. The tool returns nothing because no stored condition exactly matches all 5. Member concludes "the tool doesn't have this matchup" and asks in Discord — but a strategy exists for a 3-character subset of the enemy team.

**Why it happens:** Exact-match search is simpler to implement. Partial matching requires a defined ranking strategy and is easy to deprioritize ("we'll add fuzzy search later"). But for a small game character dataset (90+ characters), partial matching is the only mode that makes the tool useful under real game conditions.

**Consequences:**
- Tool appears useless even when strategies exist
- High "zero results" rate destroys trust in the tool
- Members stop using search and fall back to Discord

**Prevention:**
- Design search as ranked partial match from the start: "strategies that match 3 of your 5 selected characters rank higher than strategies that match 1"
- Show match quality explicitly: "Matches 3 of 5 selected characters" on each result card
- Always show a fallback: if no exact match, show top partial matches; if no partial matches, show general catch-all strategies
- Never show a completely empty results page when the member has selected at least one character — show the closest available strategy with an explanation

**Warning signs:**
- Search implementation uses an equality check on the full character set
- No "partial match" concept in the data model or query logic
- Empty state is a blank screen with no suggestions

**Phase:** Define the partial-match ranking algorithm in the search design phase. Implement and test before connecting to UI.

---

### Pitfall 5: Admin Strategy Builder Is Too Slow for the Solo Power User

**What goes wrong:** The admin (one person, building many strategies) must click through dropdowns to add characters, type conditions in separate fields, and save/reload to see the result. At 20+ strategies with 3+ conditions each, this becomes a bottleneck and the admin either stops adding strategies or introduces errors from tedium.

**Why it happens:** Admin UX is treated as secondary to member-facing UX. Forms are built generically (every field is a separate input) rather than optimized for the specific workflow (bulk-add team members, fast character lookup by name, inline condition builder).

**Consequences:**
- Admin fatigue → strategies not added → tool has limited coverage
- Errors introduced by slow repetitive data entry
- Admin builds strategies in Excel and ignores the tool (existing workflow wins by default)

**Prevention:**
- Autocomplete character search by name, not a dropdown — the admin knows character names and types faster than they scroll
- "Clone strategy" to quickly create a variant (same team, different condition)
- Inline editing — click to edit a condition, save in place, no full-page reload
- Show a live preview of how the strategy will appear to members while editing
- Keyboard shortcuts for the most common actions (add character, save, next strategy)

**Warning signs:**
- Admin form requires more than 5 clicks to add a complete strategy (team + condition + priority)
- No keyboard navigation in the character picker
- Saving requires navigating away from the current state

**Phase:** Admin UX must be validated with the solo admin before launch. Build a prototype and have the admin attempt to create 5 strategies. Measure time and click count.

---

### Pitfall 6: Priority Order Not Preserved After Edit

**What goes wrong:** The system stores priority-ordered counter alternatives (try Team A first, if blocked try Team B, fallback to Team C). Admin edits Team B. The priority order is reset or corrupted because the UI re-renders the list and the order field is not updated atomically with the edit.

**Why it happens:** Priority ordering requires an explicit `priority` or `sort_order` integer on each row. If the admin UI implements drag-to-reorder, that reorder must write new `priority` values to all affected rows in a single operation. If it writes them one at a time or optimistically updates only the UI state, the database order diverges from what the member sees.

**Consequences:**
- Members get Team C (the weakest fallback) instead of Team A (the recommended counter) because priority got corrupted
- Admin can't trust the order they set is preserved
- Bug is subtle: everything looks right in the admin view but members see wrong priority

**Prevention:**
- Store explicit `priority` integer on each counter alternative row — not derived from insertion order or `created_at`
- Reorder operations must update all affected rows in a single Supabase transaction (use `upsert` with the full updated priority list)
- Show current priority numbers visibly in the admin UI so admin can verify the order is correct
- Write a test: create 3 strategies with priority 1/2/3, reorder to 3/1/2, verify database reflects new order

**Warning signs:**
- Priority derived from array index in the frontend state (not persisted)
- Reorder writes only the moved item, not all affected items
- No visible priority indicator in the admin list

**Phase:** Model priority as an explicit column in the database schema phase. Implement atomic reorder in the admin builder phase.

---

## Moderate Pitfalls

---

### Pitfall 7: Character Name Mismatch Between Search Terms and Database IDs

**What goes wrong:** Member types "Rudy" in the enemy search. The character is stored in the database as "Rudolf" or "루디" (Korean transliteration). No results. Member does not know the canonical name the admin used.

**Why it happens:** Game characters have multiple name forms (English localized, Thai transliteration, abbreviations used by the community). The character database has `name_en` and `name_th` but community nicknames are not indexed.

**Prevention:**
- Search character autocomplete against both `name_en` and `name_th` fields at minimum
- Add an optional `aliases` array column to the character table for community nicknames
- Use fuzzy matching (Fuse.js with a low threshold) for the character picker so "Rudy" finds "Rudolf"
- Display both `name_en` and `name_th` in the autocomplete dropdown so the member can visually confirm they selected the right character

**Warning signs:**
- Character search is strict prefix-match only on `name_en`
- No `name_th` search path
- Zero guidance when a character is not found ("No results" with no suggestion)

**Phase:** Character search implementation phase.

---

### Pitfall 8: Fuse.js Instance Recreated on Every Render

**What goes wrong:** The character picker uses Fuse.js for fuzzy search. A new `Fuse` instance is created inside a component without `useMemo`. On every keystroke, the entire character list is re-indexed. With 90+ characters this is fast but adds noticeable lag on low-end mobile devices used during GvG.

**Prevention:**
- Wrap `new Fuse(characters, options)` in `useMemo` with `characters` and `options` as dependencies
- Index only the fields needed for search (`name_en`, `name_th`, `aliases`) — do not pass the full character object to Fuse
- Debounce the search query input with a 150ms delay to reduce search calls during rapid typing

**Warning signs:**
- `new Fuse(...)` inside a component body outside of `useMemo`
- Fuse instance recreated on every search keystroke

**Phase:** Character search implementation phase.

---

### Pitfall 9: Existing Unsafe Type Assertions Spread Into New Code

**What goes wrong:** The codebase already has `as unknown as Type` and `as Record<string, unknown>` in multiple service files (documented in CONCERNS.md). The new counter strategy service will introduce new Supabase queries. If the same pattern is copied, new schema changes will silently break without compile-time errors, especially for the complex condition data structure.

**Prevention:**
- Add Zod as a dependency before writing any new service functions
- Define Zod schemas for `CounterStrategy`, `CounterCondition`, and `CounterAlternative` types
- Validate all Supabase responses at service boundaries before returning typed data
- Do not use `as unknown as` in any new code; use `zod.parse()` instead

**Warning signs:**
- New service files contain `as unknown as` casts
- No Zod dependency added before new services are written
- Type checking only at compile time, not at runtime

**Phase:** Before writing any new service code. Zod setup should be the first commit of the new milestone.

---

### Pitfall 10: Admin Panel Still Has No Authentication When Counter System Launches

**What goes wrong:** CONCERNS.md documents that the admin panel at `/admin` has no authentication — anyone with the URL can modify all data. The counter strategy system adds more sensitive admin operations (create/edit/delete strategies, set priorities). Launching this without auth means any guild member who discovers the URL can corrupt the strategy data.

**Prevention:**
- Implement Supabase Auth (email/password or magic link) before launching the counter strategy admin UI
- Add RLS policies on all new counter strategy tables: only authenticated admin users can write
- Gate the admin UI route with an auth check; redirect unauthenticated users
- This is a prerequisite, not a "we'll add it later" item

**Warning signs:**
- New counter strategy tables have no RLS policies
- Admin route renders without checking session
- "Auth will be added in a future milestone" with no timeline

**Phase:** Auth must be implemented in the same milestone as the admin strategy builder. Do not ship writable admin UI without it.

---

## Minor Pitfalls

---

### Pitfall 11: Seed Data Diverges From Database After Counter Strategies Are Added

**What goes wrong:** The existing codebase uses `src/types/seed-data.json` as an offline fallback. New counter strategy tables have no seed data. When Supabase is unavailable, members see the member-facing counter search with zero strategies — no indication that data exists but can't be loaded.

**Prevention:**
- Either extend the seed data export to include counter strategies (regenerated on deploy), or remove the offline fallback for counter strategies entirely and show a clear "offline" message
- Do not silently return empty arrays when the real reason is a connection failure

**Phase:** Seed data and fallback strategy phase (can be deferred, but the decision must be made before the member search UI ships).

---

### Pitfall 12: "Common Enemy Teams" Section Becomes Stale Faster Than Individual Strategies

**What goes wrong:** The planned "enemy defense team templates — common/popular enemy comps shown prominently at the top" requires someone to curate which enemy teams are currently popular. This becomes stale after each season reset or meta shift, and there is no admin workflow to update it.

**Prevention:**
- Make the "featured/popular" flag an explicit boolean or `featured_order` integer on defense team records, editable from the admin panel
- Do not hardcode popular compositions in the frontend
- Surface `updated_at` on featured templates so members can see how current the curation is

**Phase:** When implementing the featured templates section.

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| Counter strategy data model | Freeform text conditions (Pitfall 1) | Define structured condition schema with Zod before any UI work |
| Counter search implementation | Exact-match returning zero results (Pitfall 4) | Design partial-match ranking algorithm before implementing |
| Admin strategy builder | Slow data entry killing adoption (Pitfall 5) | Prototype and time the admin workflow before polishing |
| Priority ordering UI | Priority corruption on reorder (Pitfall 6) | Atomic batch-update all priorities; test reorder explicitly |
| Character picker search | Name mismatch / Fuse.js recreated every render (Pitfalls 7, 8) | Search name_en + name_th; useMemo for Fuse instance |
| New service functions | Unsafe casts spreading from existing code (Pitfall 9) | Install Zod and define schemas before writing services |
| Admin UI launch | No auth on writable routes (Pitfall 10) | Auth is a prerequisite, not a follow-up |
| Game meta updates | Strategies become outdated silently (Pitfall 3) | Add last_verified_at to schema; surface updated_at in member UI |

---

## Sources

- CONCERNS.md — existing codebase tech debt, unsafe type assertions, gear_notes dual-format fragility, admin auth absence
- PROJECT.md — scope, user roles, constraints, active requirements
- [Storing trees in RDBMS](https://bitworks.software/en/2017-10-20-storing-trees-in-rdbms.html) — hierarchical data model tradeoffs
- [JsonLogic for storing/processing rules](https://kommradhomer.medium.com/jsonlogic-for-storing-processing-rules-and-logic-ccf32a7eef74) — structured vs freeform rule storage
- [Supabase JSON column docs](https://supabase.com/docs/guides/database/json) — jsonb pitfalls, integrity trade-offs
- [Fuse.js + React fuzzy search](https://dev.to/noclat/using-fuse-js-with-react-to-build-an-advanced-search-with-highlighting-4b93) — useMemo requirement, pitfalls
- [Empty state UX guidelines — NN/G](https://www.nngroup.com/articles/empty-state-interface-design/) — zero-results empty state design
- [The role of game patches in esports meta](https://fairgaze.com/generalnews/the-role-of-game-updates-and-patches-in-competitive-play.html) — strategy staleness after patches
- [Smogon teambuilder UX thread](https://www.smogon.com/forums/threads/teambuilder-tier-selection-search-bar-fixing-the-tier-list.3725136/) — real-world game tool search UX problems
- [Common data modeling pitfalls](https://medium.com/itversity/common-pitfalls-in-data-modeling-and-how-to-avoid-them-5160a9bb382d) — schema design pitfalls

---

*Pitfalls audit: 2026-04-06*
