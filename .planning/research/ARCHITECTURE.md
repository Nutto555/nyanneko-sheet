# Architecture Patterns: Conditional Counter-Strategy System

**Domain:** GvG strategy hub — conditional counter-picking with decision-tree branching
**Project:** Nyanneko Sheet (Seven Knights Rebirth)
**Researched:** 2026-04-06
**Confidence:** HIGH — based on direct codebase analysis + established relational modeling patterns

---

## Recommended Architecture

### Mental Model

The system answers one question: "Given these enemy characters on defense, which counter team should I use, and what are the fallbacks?"

This maps cleanly to a **three-level hierarchy**:

```
EnemyDefenseTemplate
  └── StrategyRule (ordered list of conditions)
        ├── condition: must_include_characters[] + must_exclude_characters[]
        └── counter_team_id → TeamComposition (existing table)
```

The decision logic is evaluated in the frontend, not in SQL — keep the DB as a data store, resolve matching in a service function. This is appropriate at this scale and avoids complex SQL predicate logic that would be hard to maintain.

---

## Database Schema

### New Tables

#### `enemy_defense_templates`

Represents a named common enemy defense comp — the "what we're countering."

```sql
CREATE TABLE IF NOT EXISTS enemy_defense_templates (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name_en      VARCHAR(200) NOT NULL,
  name_th      VARCHAR(200),
  slug         VARCHAR(200) UNIQUE NOT NULL,
  description  TEXT,
  is_featured  BOOLEAN DEFAULT FALSE,  -- shown prominently at top of search page
  sort_order   INT DEFAULT 0,           -- admin-controlled display order
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);
```

#### `enemy_defense_members`

Which characters compose the enemy template (the defense team being countered).

```sql
CREATE TABLE IF NOT EXISTS enemy_defense_members (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id  UUID REFERENCES enemy_defense_templates(id) ON DELETE CASCADE,
  character_id UUID REFERENCES characters(id) ON DELETE CASCADE,
  position     INT DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(template_id, character_id)
);
```

#### `counter_strategies`

One strategy entry per counter option, with explicit priority ordering and optional conditions.

```sql
CREATE TABLE IF NOT EXISTS counter_strategies (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id       UUID REFERENCES enemy_defense_templates(id) ON DELETE CASCADE,
  counter_team_id   UUID REFERENCES team_compositions(id) ON DELETE SET NULL,
  priority          INT NOT NULL DEFAULT 0,   -- lower number = try first (0 = primary, 1 = fallback, etc.)
  condition_note    TEXT,                      -- human-readable: "Use when enemy has X but not Y"
  strategy_notes    TEXT,                      -- why this counter works
  is_active         BOOLEAN DEFAULT TRUE,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);
```

#### `strategy_conditions`

Structured conditions for a counter strategy entry. Each row is one condition clause.
The frontend evaluates all conditions for a strategy to determine if it applies.

```sql
CREATE TABLE IF NOT EXISTS strategy_conditions (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  strategy_id     UUID REFERENCES counter_strategies(id) ON DELETE CASCADE,
  condition_type  VARCHAR(50) NOT NULL,    -- 'must_have' | 'must_not_have'
  character_id    UUID REFERENCES characters(id) ON DELETE CASCADE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

**Why separate conditions from the strategy row?**
Conditions are variable per strategy (zero to many). Storing them as a related table keeps `counter_strategies` flat, queryable, and easy to CRUD. JSON arrays in `counter_strategies` would make indexing and admin editing harder.

**Condition semantics:**
- A strategy matches when: ALL `must_have` characters are present AND NO `must_not_have` characters are present in the enemy team being searched.
- Strategies with zero conditions match unconditionally (they are always-valid fallbacks).

---

### How This Extends the Existing Schema

The new tables connect via foreign keys to existing tables — no changes to existing tables needed.

```
characters (existing)
    ↑                       ↑
enemy_defense_members   strategy_conditions
    ↑                       ↑
enemy_defense_templates → counter_strategies → team_compositions (existing)
```

**No migration to existing tables.** The strategy system is purely additive.

---

## Component Boundaries

### What Talks to What

```
CounterSearch (Page)
    ↓ calls
useCounterSearch (Hook)
    ↓ calls
getCounterStrategies() (Service)
    ↓ queries Supabase
enemy_defense_templates + enemy_defense_members + counter_strategies + strategy_conditions + team_compositions
```

```
StrategyBuilder (Admin sub-component)
    ↓ calls
createStrategy() / updateStrategy() (Service: src/services/strategies.ts)
    ↓ writes Supabase
counter_strategies + strategy_conditions
```

### Component Inventory

| Component | Type | Responsibility | Location |
|-----------|------|---------------|----------|
| `CounterSearch` | Page | Character multi-select + results list | `src/pages/CounterSearch.tsx` |
| `StrategyResults` | Component | Renders matched strategies in priority order | `src/components/strategy/StrategyResults.tsx` |
| `StrategyCard` | Component | One counter option: counter team + conditions + notes | `src/components/strategy/StrategyCard.tsx` |
| `EnemyTemplateList` | Component | Featured defense templates gallery | `src/components/strategy/EnemyTemplateList.tsx` |
| `CharacterMultiSelect` | Component | Autocomplete search for selecting enemy characters | `src/components/ui/CharacterMultiSelect.tsx` |
| `AdminStrategyBuilder` | Admin sub-page | CRUD for templates + strategies | `src/pages/AdminStrategyBuilder.tsx` |
| `useCounterSearch` | Hook | Manages search state, calls service, returns results | `src/hooks/useCounterSearch.ts` |
| `useEnemyTemplates` | Hook | Loads featured templates | `src/hooks/useEnemyTemplates.ts` |
| `strategies` service | Service | getCounterStrategies, createTemplate, etc. | `src/services/strategies.ts` |

---

## Data Flow

### Counter Lookup (Member Read Flow)

```
1. User opens CounterSearch page
   └─ EnemyTemplateList loads featured templates via useEnemyTemplates
      └─ getEnemyTemplates() queries: enemy_defense_templates WHERE is_featured=true

2. User selects enemy characters (multi-select autocomplete)
   └─ Component state: selectedCharacterIds: string[]

3. User triggers search (or auto-search on selection change)
   └─ useCounterSearch(selectedCharacterIds) hook fires
      └─ getCounterStrategies(selectedCharacterIds) service function

4. Service query:
   └─ Fetch all templates whose members overlap with selected character IDs
      (SQL: enemy_defense_templates with enemy_defense_members matching any selected ID)
   └─ For each matching template, fetch counter_strategies with strategy_conditions
      and JOIN counter_team → team_compositions → team_members → characters

5. Client-side resolution (in service or hook):
   └─ For each template:
       └─ For each counter_strategy (ordered by priority):
           └─ Evaluate conditions against selected characters:
               - All must_have characters present? AND no must_not_have characters present?
               - If yes → strategy matches
               - If no conditions → always matches
       └─ Return only matching strategies in priority order

6. useCounterSearch returns { results, loading, error }
   └─ results: MatchedTemplate[] = { template, matchingStrategies: CounterStrategy[] }

7. CounterSearch page renders StrategyResults
   └─ Groups by template, shows strategies in priority order
```

### Admin Strategy Builder Flow

```
1. Admin selects "New Template" → enters defense team characters
   └─ createEnemyTemplate() + createEnemyMembers()

2. Admin adds counter strategies to template:
   └─ Picks a counter team (from existing team_compositions)
   └─ Sets priority (drag-to-reorder or manual number)
   └─ Optionally adds conditions (character must_have / must_not_have)
   └─ Adds notes text

3. Save → createCounterStrategy() + createStrategyConditions()

4. Admin sees live preview of how conditions render
```

---

## Client-Side Condition Evaluation

The matching logic lives in a pure utility function — easy to test, easy to reason about.

```typescript
// src/utils/strategyMatcher.ts

interface StrategyCondition {
  condition_type: 'must_have' | 'must_not_have';
  character_id: string;
}

interface CounterStrategy {
  id: string;
  priority: number;
  counter_team_id: string | null;
  condition_note: string | null;
  strategy_notes: string | null;
  strategy_conditions: StrategyCondition[];
  counter_team: TeamWithMembers | null;
}

export function evaluateStrategy(
  strategy: CounterStrategy,
  selectedCharacterIds: Set<string>
): boolean {
  const conditions = strategy.strategy_conditions;
  if (conditions.length === 0) return true; // unconditional fallback

  for (const cond of conditions) {
    if (cond.condition_type === 'must_have' && !selectedCharacterIds.has(cond.character_id)) {
      return false;
    }
    if (cond.condition_type === 'must_not_have' && selectedCharacterIds.has(cond.character_id)) {
      return false;
    }
  }
  return true;
}

export function resolveMatchingStrategies(
  strategies: CounterStrategy[],
  selectedCharacterIds: string[]
): CounterStrategy[] {
  const idSet = new Set(selectedCharacterIds);
  return strategies
    .filter(s => s.is_active && evaluateStrategy(s, idSet))
    .sort((a, b) => a.priority - b.priority);
}
```

This intentionally stays in the client. The DB stores data; the app logic resolves it. At this scale (one guild, dozens of templates), there is no performance reason to push this into Postgres stored procedures.

---

## Template-Based vs. Freeform Search

Two entry modes for counter lookup, served by the same underlying data:

**Template mode:** User clicks a featured enemy defense template from the gallery. System immediately shows counter strategies for that template, pre-evaluated for all conditions.

**Freeform search:** User selects 1–5 characters from multi-select. System finds templates whose defense members overlap with the selected set (fuzzy: "show me templates containing at least N of these characters"), then applies condition evaluation on the matching strategies.

The service layer handles both through the same `getCounterStrategies()` function — template mode passes the template ID directly; freeform passes selected character IDs and the service resolves which templates partially match.

---

## Service Layer Design

`src/services/strategies.ts` owns all new data access:

```typescript
// Read
getEnemyTemplates(options?: { featuredOnly?: boolean }): Promise<EnemyDefenseTemplate[]>
getTemplateWithStrategies(templateId: string): Promise<TemplateWithStrategies | null>
searchTemplatesByCharacters(characterIds: string[]): Promise<TemplateWithStrategies[]>

// Write (admin)
createEnemyTemplate(data: CreateTemplateInput): Promise<EnemyDefenseTemplate>
updateEnemyTemplate(id: string, data: UpdateTemplateInput): Promise<EnemyDefenseTemplate>
deleteEnemyTemplate(id: string): Promise<void>
upsertCounterStrategy(data: UpsertStrategyInput): Promise<CounterStrategy>
deleteCounterStrategy(id: string): Promise<void>
setStrategyConditions(strategyId: string, conditions: ConditionInput[]): Promise<void>
```

Each function follows the existing pattern: check `isSupabaseConfigured()`, return seed fallback if not, else query Supabase with typed client.

The Supabase query for a full template load:
```typescript
supabase
  .from('enemy_defense_templates')
  .select(`
    *,
    enemy_defense_members(*, characters(*)),
    counter_strategies(
      *,
      strategy_conditions(*, characters(*)),
      counter_team:team_compositions(*, team_members(*, characters(*)))
    )
  `)
  .eq('id', templateId)
  .single()
```

This single join query loads everything needed for display and condition evaluation.

---

## Type Definitions

Extend `src/types/database.ts` with new entries in the `Database` interface:

```typescript
// New DB interface entries (to add to Database.public.Tables)
enemy_defense_templates: {
  Row: EnemyDefenseTemplate;
  Insert: Omit<EnemyDefenseTemplate, 'id' | 'created_at' | 'updated_at'>;
  Update: Partial<Omit<EnemyDefenseTemplate, 'id'>>;
};
enemy_defense_members: {
  Row: EnemyDefenseMember;
  Insert: Omit<EnemyDefenseMember, 'id' | 'created_at'>;
  Update: Partial<Omit<EnemyDefenseMember, 'id'>>;
};
counter_strategies: {
  Row: CounterStrategy;
  Insert: Omit<CounterStrategy, 'id' | 'created_at' | 'updated_at'>;
  Update: Partial<Omit<CounterStrategy, 'id'>>;
};
strategy_conditions: {
  Row: StrategyCondition;
  Insert: Omit<StrategyCondition, 'id' | 'created_at'>;
  Update: Partial<Omit<StrategyCondition, 'id'>>;
};
```

New join types in `src/types/database.ts`:

```typescript
export interface EnemyDefenseTemplateWithMembers extends EnemyDefenseTemplate {
  enemy_defense_members: (EnemyDefenseMember & { characters: Character })[];
}

export interface CounterStrategyWithDetails extends CounterStrategy {
  strategy_conditions: (StrategyCondition & { characters: Character })[];
  counter_team: TeamWithMembers | null;
}

export interface TemplateWithStrategies extends EnemyDefenseTemplateWithMembers {
  counter_strategies: CounterStrategyWithDetails[];
}
```

---

## Suggested Build Order

Dependencies between components determine the correct build order.

### Phase A: Data Foundation (build first — everything depends on this)
1. **Migration** — `007_counter_strategies.sql` with the four new tables + RLS policies + indexes
2. **Type definitions** — extend `database.ts` with new interfaces
3. **strategies service** — `getEnemyTemplates`, `getTemplateWithStrategies`, `searchTemplatesByCharacters`
4. **strategyMatcher utility** — pure function, no dependencies, fully testable

### Phase B: Read / Member UI (can build once service exists)
5. **CharacterMultiSelect component** — character autocomplete (reusable, no strategy dependency)
6. **EnemyTemplateList component** — featured templates grid
7. **StrategyCard component** — renders one counter option
8. **StrategyResults component** — renders ordered list of StrategyCards
9. **useCounterSearch hook** + **useEnemyTemplates hook**
10. **CounterSearch page** — wires all the above together

### Phase C: Admin / Write UI
11. **Write service functions** — createEnemyTemplate, upsertCounterStrategy, etc.
12. **AdminStrategyBuilder page/component** — admin CRUD; depends on CharacterMultiSelect

### Phase D: Submission Flow (guild member suggestions — optional, lower priority)
13. **Strategy submission** — guild members propose counter teams for admin review
14. Requires a `pending_submissions` table or a `status` field on `counter_strategies`

**Ordering rationale:**
- Migration before code — TypeScript compiler won't compile without types matching schema
- Pure utility (strategyMatcher) before UI — unit tests can validate matching logic in isolation
- Read path before write path — simpler, higher usage, unblocks the guild members sooner
- CharacterMultiSelect is shared by both search UI and admin builder — build once, use in both

---

## Scalability Considerations

| Concern | At current scale (1 guild, ~50 templates) | If opened wider |
|---------|-------------------------------------------|-----------------|
| Query performance | Single join query per page load is fine | Add index on `enemy_defense_members(character_id)` and `strategy_conditions(character_id)` |
| Client-side matching | Negligible — <100 strategies evaluated in memory | Move to DB-side filtering with array operators if >500 strategies |
| Admin write concurrency | Single admin user — no conflicts | Add optimistic locking if multiple admins |
| Condition complexity | `must_have` / `must_not_have` covers all described cases | Add `min_count` or `role_type` conditions later by adding new `condition_type` enum values |

---

## Anti-Patterns to Avoid

### Storing Conditions as JSON in `counter_strategies`

**What it looks like:**
```sql
-- WRONG
conditions JSONB  -- { "must_have": ["char-id-1"], "must_not_have": ["char-id-2"] }
```

**Why it fails:** Admin UI cannot list "which strategies involve character X" without full table scan + JSONB parsing. Character delete/rename cascade does not work. Filtering is opaque in Supabase dashboard. Use the `strategy_conditions` join table instead.

### Hardcoding Branching Logic in React Components

**What it looks like:** `if (team.name.includes('tank'))` or strategy matching logic embedded in JSX.

**Why it fails:** Logic is not testable, not reusable from admin preview, and breaks the layered architecture. Put all matching logic in `src/utils/strategyMatcher.ts`.

### Evaluating Conditions in SQL with Complex Predicate Joins

At this scale, fetching all strategies for a template and evaluating in the client is simpler, faster to build, and easier to unit test. Reserve SQL-side filtering for when the volume justifies the complexity.

### Using `team_compositions.category` to Mark Counter Teams

The existing `team_compositions` table already stores counter teams (category `attack`). Do not add a new category or repurpose the category field to mean "counter for template X." The `counter_strategies.counter_team_id` FK is the correct link.

---

## Router Integration

Add one new public route and one new admin route to `src/App.tsx`:

```
/counter          → CounterSearch page (guild member read)
/admin/strategies → AdminStrategyBuilder page (admin write)
```

Both follow the existing pattern: add to `MODE_CONFIGS`-style record or directly in the router, wrapped in `Layout`.

---

## Sources

- Direct codebase analysis of `src/types/database.ts`, `src/services/teams.ts`, `src/pages/GvgMode.tsx`, `supabase/migrations/001_initial_schema.sql`
- PostgreSQL hierarchical data modeling: [Trees in PostgreSQL — MadeCurious](https://madecurious.com/curiosities/trees-in-postgresql/), [Hierarchical models in PostgreSQL — Ackee](https://www.ackee.agency/blog/hierarchical-models-in-postgresql)
- PostgreSQL JSON anti-patterns: [Unnecessary json/hstore dynamic columns — EDB](https://www.enterprisedb.com/blog/postgresql-anti-patterns-unnecessary-jsonhstore-dynamic-columns)
- Rule engine with priority ordering: [SQL Rule Engine — Nected](https://www.nected.ai/us/blog-us/sql-rule-engine), [An SQL Based Rule Engine — Medium](https://medium.com/@siddhesh.jog/an-sql-based-rule-engine-6a187e2d88d8)

---

*Architecture analysis: 2026-04-06*
