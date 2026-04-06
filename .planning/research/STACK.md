# Technology Stack

**Project:** Nyanneko Sheet — Conditional Counter-Strategy System
**Researched:** 2026-04-06
**Milestone context:** Adding conditional counter-picking to existing React 19 + Supabase + Tailwind 4 app

---

## Existing Stack (Do Not Change)

| Technology | Version | Role |
|------------|---------|------|
| React | 19.2.4 | UI framework |
| TypeScript | 5.9.3 | Type safety |
| Vite | 8.0.1 | Build tool |
| Tailwind CSS | 4.2.2 | Styling |
| @supabase/supabase-js | 2.101.1 | Backend / DB / Auth |
| React Router | 7.14.0 | Client routing |

---

## Recommended Additions

### 1. Character Search / Autocomplete

**Recommendation: `@headlessui/react` Combobox**

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| @headlessui/react | 2.2.9 | Accessible combobox for character search | Made by Tailwind Labs, explicitly supports React 19 (`^18 \|\| ^19`), unstyled so it works natively with Tailwind 4 utility classes, ships Combobox component with full keyboard nav and WAI-ARIA out of the box. Zero styling opinion = no fighting existing design tokens. |
| fuse.js | 7.3.0 | Fuzzy client-side search for character filtering | 7KB, no deps, runs entirely in the browser. Character DB is small (<200 characters) so no server round-trips needed. Handles partial name matches (e.g., "sia" → "Siara"), supports Thai and English fields simultaneously. |

**Why NOT cmdk (1.1.1):** cmdk is a command-palette component — optimized for a floating modal triggered by a hotkey. The admin strategy builder needs inline embedded comboboxes inside a form (pick character for slot 1, 2, 3…). Headless UI Combobox maps directly to that use case. cmdk's API is modal-first and fights the embed-in-form pattern.

**Why NOT Radix UI Combobox:** Radix does not ship a built-in Combobox primitive as of this research. Building one from its Select + Popover primitives requires significant glue code. Headless UI ships a purpose-built Combobox with less assembly.

**Confidence: HIGH** — Verified version and peer deps via `npm info`. React 19 support confirmed in peerDependencies (`^18 || ^19`).

---

### 2. Priority-Ordered Alternatives (Drag-to-Reorder)

**Recommendation: `@dnd-kit/sortable` + `@dnd-kit/core`**

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| @dnd-kit/core | 6.3.1 | Drag-and-drop foundation | Active maintenance, 10 kB core, accessible (keyboard DnD supported), touch/mouse/keyboard. Works with React >=16.8 — no React 19 breakage risk. |
| @dnd-kit/sortable | 10.0.0 | Vertical list reordering for counter priority | Adds sortable preset on top of core: wrap items in `<SortableContext>`, each item gets `useSortable()`. Simple, no magic. Exactly what reordering "Team A → Team B → Team C fallback" needs. |

**Use case:** Admin builds a list of counter teams in priority order. Drag handles let the admin reorder them. dnd-kit makes this ~30 lines of component code.

**Why NOT react-beautiful-dnd:** Atlassian officially deprecated it in 2022. No updates since. Known issues with React Strict Mode (double-invoke effects). Dead library — avoid for new work.

**Why NOT @dnd-kit/react (0.3.2):** This is an experimental rewrite still in pre-release. API is unstable. Use the stable `@dnd-kit/core` + `@dnd-kit/sortable` packages.

**Confidence: HIGH** — Versions confirmed via `npm info`. Peer deps are `react: >=16.8.0`, React 19 works fine.

---

### 3. Decision Tree / Conditional Logic — Data Model

**Recommendation: Custom JSONB schema stored in Supabase. No external library.**

This is the most critical design decision. The "conditional counter strategy" system is the core product feature. The right approach is a purpose-built data model, not a generic rule-engine library.

#### Data Model Design

A counter strategy is structured as a tree: the root is an **enemy team scenario**, which has one or more **counter options** in priority order. Each counter option has **conditions** (characters the enemy MUST have, characters the enemy must NOT have) and points to a **counter team** (existing `team_compositions` row).

**Proposed schema (new Supabase migration):**

```sql
-- A named scenario: "enemy runs heavy healer stack"
CREATE TABLE counter_scenarios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(200) NOT NULL,           -- "vs Healer Stack"
  description TEXT,                     -- optional admin notes
  enemy_template_ids UUID[],            -- optional: link to popular enemy templates
  is_published BOOLEAN DEFAULT false,   -- hide drafts from guild members
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enemy characters that define the scenario (the "trigger" side)
CREATE TABLE scenario_enemy_characters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  scenario_id UUID REFERENCES counter_scenarios(id) ON DELETE CASCADE,
  character_id UUID REFERENCES characters(id),
  is_required BOOLEAN DEFAULT true,     -- true = must be in enemy team
                                        -- false = must NOT be in enemy team
  position INT DEFAULT 0                -- ordering hint only
);

-- Counter options: ordered alternatives for this scenario
CREATE TABLE counter_options (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  scenario_id UUID REFERENCES counter_scenarios(id) ON DELETE CASCADE,
  priority INT NOT NULL,                -- 1 = try first, 2 = fallback, 3 = last resort
  counter_team_id UUID REFERENCES team_compositions(id),
  condition_notes TEXT,                 -- e.g. "only if you have Clair at +10"
  is_active BOOLEAN DEFAULT true
);
```

**Why relational rows, not JSONB blob:**
- Relational rows let Supabase RLS and foreign key constraints protect data integrity.
- Enemy character conditions can be queried directly: `SELECT * FROM scenario_enemy_characters WHERE character_id = ?` to find all scenarios that involve a given character — this powers the counter search feature.
- JSONB conditions in a single blob would require application-level parsing for every lookup. With small tables (<500 scenarios), the relational approach is simpler and faster.
- The `is_required: boolean` flag cleanly encodes "must have" vs. "must NOT have" conditions without a custom expression language.

**Why NOT a rules engine library (json-rules-engine, react-awesome-query-builder):**
- `json-rules-engine` is a Node.js backend evaluation library, not a UI component. It adds complexity without providing UI.
- `react-awesome-query-builder` is a powerful general-purpose query builder — but it's designed for arbitrary field/operator/value rules. This project's conditions are always "enemy has/doesn't have [character]". That's a fixed schema. A generic rule builder adds hundreds of KB of JS for a problem that a simple multi-select with an include/exclude toggle solves in 50 lines.
- The fixed vocabulary (characters in/not in enemy team) makes a custom UI far simpler to build and reason about.

**Confidence: HIGH** — Pattern derived from existing schema conventions in the project (relational, Supabase RLS, UUID PKs). JSONB tradeoffs are well-documented in Supabase official docs.

---

### 4. Input Validation

**Recommendation: `zod` 4.x**

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| zod | 4.3.6 | Schema validation for strategy form inputs | Already recommended in TypeScript rules. Validates counter scenario data before it hits Supabase. Catches missing required fields (no team selected, no enemy characters set). TypeScript `z.infer<>` produces form types automatically — zero duplication between validation schema and TS types. |

**Note:** Zod 4 is a major version with breaking changes from Zod 3. If the project already uses Zod 3 indirectly (via another lib), verify peer dep compatibility before upgrading. For a greenfield addition, use 4.x directly.

**Confidence: HIGH** — Confirmed via `npm info`. Zod is a zero-dependency library; no React peer dep.

---

### 5. Character Search on the Member-Facing Side

**Recommendation: Custom `useCharacterSearch` hook using existing character data + native `<input>` + Fuse.js**

The guild member counter-search page (search by enemy character → see counter options) does not need a combobox component — it's more of a tag-picker / multi-select pattern. Implement as:

1. A `useCharacterSearch(query)` hook wrapping Fuse.js over the character list (already fetched from Supabase/seed).
2. A simple character portrait grid with click-to-select, driven by that hook.
3. Results update as characters are selected, filtering scenarios by matching conditions.

This avoids adding another component dependency for a custom interaction pattern. The component is simple enough to build from scratch with Tailwind.

**Confidence: HIGH** — Conclusion from codebase analysis: character data is already loaded in-memory via existing service layer; no additional library needed.

---

## What NOT to Add

| Library | Why to Avoid |
|---------|--------------|
| react-beautiful-dnd | Deprecated by Atlassian in 2022, broken in React Strict Mode |
| react-query / TanStack Query | Overhead not warranted; Supabase SDK + React hooks already handle data fetching. Adding TanStack Query would require migrating all existing `useEffect`-based hooks. |
| Redux / Zustand | Strategy editor state is contained in a single page/component. Local `useState` + `useReducer` is sufficient. Global state for a single-page form is over-engineering. |
| react-flow / ReactFlow | Visual node-based editor for decision trees. This is far too complex for what's needed — the branching here is a simple ordered list with include/exclude conditions, not an arbitrary directed graph. Adds >100 kB bundle. |
| json-rules-engine | Backend evaluation library, not a UI. Solving the wrong layer of the problem. |
| react-awesome-query-builder | Designed for arbitrary column/operator/value SQL-style filters. The project's condition vocabulary is fixed (character in/not in enemy team). Massive overkill. |
| MUI / Ant Design / Mantine | Full UI kit — conflicts with existing Tailwind 4 + custom component approach. Adding a second design system creates style conflicts. |

---

## Installation

```bash
# Combobox for admin character picker
npm install @headlessui/react

# Fuzzy search for client-side character filtering
npm install fuse.js

# Drag-to-reorder counter priority list
npm install @dnd-kit/core @dnd-kit/sortable

# Validation (already likely to be needed; install if not present)
npm install zod
```

---

## Summary of Additions

| Library | Version | Purpose | Confidence |
|---------|---------|---------|------------|
| @headlessui/react | 2.2.9 | Combobox for admin character selection | HIGH |
| fuse.js | 7.3.0 | Client-side fuzzy search over character list | HIGH |
| @dnd-kit/core | 6.3.1 | DnD foundation | HIGH |
| @dnd-kit/sortable | 10.0.0 | Sortable priority list for counter options | HIGH |
| zod | 4.3.6 | Strategy form validation | HIGH |

The data model (decision tree conditions) is relational SQL in Supabase — no additional library needed.

---

## Sources

- Headless UI Combobox: https://headlessui.com/react/combobox (version and React 19 peer deps confirmed via `npm info @headlessui/react`)
- dnd-kit: https://dndkit.com/ and https://github.com/clauderic/dnd-kit (versions confirmed via `npm info @dnd-kit/core` and `npm info @dnd-kit/sortable`)
- react-beautiful-dnd deprecation: https://github.com/atlassian/react-beautiful-dnd (official deprecation notice)
- Fuse.js: https://www.fusejs.io/ (version confirmed via `npm info fuse.js`)
- Zod: https://zod.dev/ (version confirmed via `npm info zod`)
- Supabase JSONB guidance: https://supabase.com/docs/guides/database/json
- Existing project schema: `/supabase/migrations/001_initial_schema.sql` (relational pattern basis)
- cmdk: https://cmdk.paco.me/ (confirmed unsuitable for embedded inline combobox use case)
