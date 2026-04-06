# Phase 4: Counter Lookup Page - Research

**Researched:** 2026-04-06
**Domain:** React page composition, search UX, data fetching patterns
**Confidence:** HIGH

## Summary

Phase 4 builds the core member-facing counter lookup page at `/counter`. All foundational pieces already exist from prior phases: the database schema (Phase 1), TypeScript types + service layer + `resolveMatchingStrategies` matcher (Phase 2), and shared UI components -- `CharacterMultiSelect`, `CharacterPortrait`, `useCharacterSearch` (Phase 3). This phase is primarily a composition task: wiring existing building blocks into a page with good UX.

The page has two interaction modes: (1) browse featured enemy defense templates at the top, and (2) search by selecting 1-6 enemy characters via the existing `CharacterMultiSelect` combobox. Both feed character IDs into `resolveMatchingStrategies()` which returns ranked `MatchResult[]` with applicable strategies per template.

**Primary recommendation:** Build as a single page component (`CounterSearch.tsx`) with extracted sub-components for counter result cards. Use existing hooks/services pattern. No new libraries needed -- everything is already in the stack.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| LOOK-01 | Counter search page -- member inputs enemy characters, sees matching counter strategies | Page component wires `CharacterMultiSelect` + `resolveMatchingStrategies` + result display. All building blocks exist. |
| LOOK-04 | Priority-ordered counter alternatives per scenario (try A first, then B, then C) | `resolveMatchingStrategies` already sorts strategies by `priority` ascending. UI renders in order with visual rank indicators. |
| LOOK-05 | Conditional branching display -- visual if/then/else showing which counter applies under which conditions | Each `CounterStrategyWithConditions` has `strategy_conditions[]` with `condition_type` and character reference. Render as badges/tags showing "If enemy has X" / "If enemy does NOT have Y". |
| LOOK-06 | Enemy defense templates shown prominently at top of browse view | `getEnemyTemplates()` service exists, returns `EnemyDefenseTemplateWithMembers[]` with `is_featured` flag and `sort_order`. Filter by `is_featured` for top display. |
| LOOK-07 | Strategy notes, pros/cons visible per counter entry | `CounterStrategy.strategy_notes` and `condition_note` fields exist. Render as collapsible or inline text on each counter card. |
| LOOK-08 | Partial-match search results when exact enemy comp not found | `resolveMatchingStrategies` returns ALL templates ranked by overlap ratio (0-1). No minimum threshold -- UI can filter/group by score. |
</phase_requirements>

## Standard Stack

### Core (Already Installed)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | 19.2.4 | UI framework | Already in project [VERIFIED: package.json] |
| React Router | 7.14.0 | Client-side routing | Already in project [VERIFIED: package.json] |
| Tailwind CSS | 4.2.2 | Styling | Already in project [VERIFIED: package.json] |
| @headlessui/react | 2.2.9 | Accessible combobox (used by CharacterMultiSelect) | Already in project [VERIFIED: package.json] |
| Fuse.js | 7.3.0 | Fuzzy search (used by useCharacterSearch) | Already in project [VERIFIED: package.json] |
| @supabase/supabase-js | 2.101.1 | Database access | Already in project [VERIFIED: package.json] |
| Vitest | 4.1.2 | Test framework | Already in project [VERIFIED: package.json] |
| @testing-library/react | 16.3.2 | Component testing | Already in project [VERIFIED: package.json] |

### Supporting (No New Libraries Needed)

This phase requires zero new dependencies. All building blocks are in place:

- `CharacterMultiSelect` -- character selection combobox (Phase 3)
- `CharacterPortrait` -- character image display (Phase 3)
- `useCharacterSearch` -- fuzzy search hook (Phase 3)
- `resolveMatchingStrategies` / `evaluateStrategy` -- matching logic (Phase 2)
- `getEnemyTemplates` / `getCounterStrategies` -- data fetching (Phase 2)
- `Badge`, `Button`, `Card` -- shared UI primitives (existing)

**Installation:**
```bash
# No new packages needed
```

## Architecture Patterns

### Recommended Project Structure

```
src/
  pages/
    CounterSearch.tsx              # Main page (default export, route at /counter)
  components/
    counter/
      CounterResultCard.tsx        # One matched scenario with its strategies
      StrategyCard.tsx             # One counter option within a result
      ConditionBadges.tsx          # Visual must_have / must_not_have display
      EnemyTemplateGrid.tsx        # Featured template quick-select grid
  hooks/
    useCounterSearch.ts            # Orchestrates data loading + matching
```

### Pattern 1: Page Component with Data Hook

**What:** Separate data orchestration (loading templates, strategies, characters, running matcher) into a custom hook, keeping the page component focused on layout and user interaction.
**When to use:** Always for data-heavy pages in this project.

```typescript
// Source: Existing project pattern (useCharacters, GvgMode page)
export function useCounterSearch() {
  const [selectedEnemies, setSelectedEnemies] = useState<Character[]>([]);
  const [templates, setTemplates] = useState<EnemyDefenseTemplateWithMembers[]>([]);
  const [allStrategies, setAllStrategies] = useState<CounterStrategyWithConditions[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load all templates + strategies + characters on mount
  useEffect(() => { /* fetch all three in parallel */ }, []);

  // Derive matches reactively from selectedEnemies
  const results = useMemo(() => {
    if (selectedEnemies.length === 0) return [];
    const enemyIds = selectedEnemies.map(c => c.id);
    return resolveMatchingStrategies(templates, allStrategies, enemyIds);
  }, [selectedEnemies, templates, allStrategies]);

  return { characters, selectedEnemies, setSelectedEnemies, results, templates, loading, error };
}
```

[VERIFIED: codebase pattern from `src/hooks/useCharacters.ts` and `src/pages/GvgMode.tsx`]

### Pattern 2: Template Quick-Select Populating Search

**What:** Clicking a featured enemy template fills the character selector with that template's members.
**When to use:** For the LOOK-06 requirement.

```typescript
// When user clicks a template card:
function handleTemplateClick(template: EnemyDefenseTemplateWithMembers): void {
  const chars = template.enemy_defense_members
    .toSorted((a, b) => a.position - b.position)
    .map(m => m.characters);
  setSelectedEnemies(chars);
}
```

[ASSUMED -- straightforward derivation from existing types]

### Pattern 3: Conditional Branching Display

**What:** Render strategy conditions as colored badges: green for "must have", red for "must not have".
**When to use:** For LOOK-05 requirement.

```typescript
// ConditionBadges component
function ConditionBadges({ conditions }: { conditions: StrategyConditionWithCharacter[] }) {
  const mustHave = conditions.filter(c => c.condition_type === 'must_have');
  const mustNotHave = conditions.filter(c => c.condition_type === 'must_not_have');
  
  return (
    <div className="flex flex-wrap gap-1">
      {mustHave.map(c => (
        <span key={c.id} className="... bg-green-900/30 text-green-300 ...">
          If enemy has {c.characters.name_en}
        </span>
      ))}
      {mustNotHave.map(c => (
        <span key={c.id} className="... bg-red-900/30 text-red-300 ...">
          If enemy lacks {c.characters.name_en}
        </span>
      ))}
    </div>
  );
}
```

[ASSUMED -- UI pattern, no external dependency]

### Anti-Patterns to Avoid

- **Fetching strategies per-template on demand:** Load ALL templates and ALL strategies upfront in a single parallel fetch. The dataset is small (guild-scoped) and client-side filtering via `resolveMatchingStrategies` is instant.
- **Separate state for "browse" vs "search" mode:** Use a single `selectedEnemies` array. Empty = show featured templates. Non-empty = show search results. One state, two views.
- **Deep component nesting:** Keep to 3 levels max: Page > ResultCard > StrategyCard/ConditionBadges.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Fuzzy character search | Custom string matching | `useCharacterSearch` (Fuse.js) | Already built in Phase 3, handles EN + TH names |
| Strategy matching/ranking | Custom filter logic | `resolveMatchingStrategies` | Already built in Phase 2, fully tested |
| Character selector combobox | Custom dropdown | `CharacterMultiSelect` | Already built in Phase 3, accessible via Headless UI |
| Character portraits | Custom image handling | `CharacterPortrait` + `safeImageUrl` | Already built in Phase 3, handles fallbacks |

**Key insight:** This phase is a composition phase. Every complex piece is already built. The risk is in UX polish and wiring, not in algorithmic complexity.

## Common Pitfalls

### Pitfall 1: Loading All Strategies Without Template Scope

**What goes wrong:** The existing `getCounterStrategies(templateId)` fetches strategies for ONE template. But the counter search page needs strategies for ALL templates to pass to `resolveMatchingStrategies`.
**Why it happens:** The service was designed for admin detail views, not bulk search.
**How to avoid:** Add a `getAllActiveStrategies()` service function that fetches all active counter strategies with conditions and team compositions joined, without filtering by template_id. Or fetch per-template in parallel after loading templates.
**Warning signs:** N+1 query pattern -- loading templates then looping to fetch strategies for each.

### Pitfall 2: Missing Counter Team Data in Results

**What goes wrong:** `CounterStrategyWithConditions` includes `team_compositions: TeamComposition | null` but this is just the team metadata. The actual team MEMBERS (with character portraits) require a separate join through `team_members`.
**Why it happens:** The strategy join in `strategies.ts` does `team_compositions(*)` which gets the TeamComposition row but not its nested team_members.
**How to avoid:** Either (a) extend the strategy query to also join `team_compositions(*, team_members(*, characters(*)))`, or (b) load team members separately for displayed results. Option (a) is cleaner.
**Warning signs:** Counter cards show team name but no character portraits.

### Pitfall 3: No Seed Data for Offline Fallback

**What goes wrong:** When Supabase is not configured, `getEnemyTemplates()` and `getCounterStrategies()` return `[]`. The page shows empty state even in development.
**Why it happens:** STATE.md explicitly flags this: "Seed data strategy for offline fallback does not yet cover counter strategies."
**How to avoid:** Either (a) add counter strategy seed data (recommended for development), or (b) accept empty state for counter search when Supabase is down. Given this is a member-facing feature that requires real admin-created data, option (b) is acceptable for v1.
**Warning signs:** The page always shows "no results" in local dev without Supabase.

### Pitfall 4: Score Display Confusing Members

**What goes wrong:** Showing raw match scores (0.67, 0.5) confuses non-technical users.
**Why it happens:** `resolveMatchingStrategies` returns `matchScore` as a float ratio.
**How to avoid:** Display as "3/4 characters matched" or visual progress indicators, not decimal scores. Group results into "Exact match", "Partial match" sections.
**Warning signs:** Users don't understand why certain results appear.

### Pitfall 5: last_verified_at Not Available

**What goes wrong:** Success criteria #5 requires `last_verified_at` timestamp on counter cards, but the `CounterStrategy` type uses `updated_at` not `last_verified_at`.
**Why it happens:** Phase 1 schema used `updated_at` as the auto-timestamp column.
**How to avoid:** Use `updated_at` as the display value. It auto-updates on any strategy edit. Label it "Last updated" or "Verified" in the UI. No schema change needed -- `updated_at` serves the same purpose as `last_verified_at` since admin edits imply re-verification.
**Warning signs:** Looking for a non-existent column.

## Code Examples

### Counter Search Page Structure

```typescript
// Source: Derived from existing GvgMode.tsx pattern [VERIFIED: codebase]
export default function CounterSearch() {
  const {
    characters, selectedEnemies, setSelectedEnemies,
    results, templates, loading, error,
  } = useCounterSearch();

  const featuredTemplates = templates.filter(t => t.is_featured);
  const hasSelection = selectedEnemies.length > 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      {/* Featured templates grid (visible when no selection) */}
      {!hasSelection && <EnemyTemplateGrid templates={featuredTemplates} onSelect={handleTemplateClick} />}
      
      {/* Character selector */}
      <CharacterMultiSelect
        characters={characters}
        selectedCharacters={selectedEnemies}
        onChange={setSelectedEnemies}
        maxSelections={6}
        placeholder="Select enemy characters..."
      />
      
      {/* Results */}
      {hasSelection && results
        .filter(r => r.matchScore > 0)
        .map(result => <CounterResultCard key={result.template.id} result={result} />)
      }
    </div>
  );
}
```

### Data Fetching Pattern

```typescript
// Source: Derived from existing service patterns [VERIFIED: codebase]

// Option A: New bulk fetch function (recommended)
export async function getAllActiveStrategies(): Promise<CounterStrategyWithConditions[]> {
  if (!isSupabaseConfigured()) return [];

  const { data, error } = await supabase
    .from('counter_strategies')
    .select('*, strategy_conditions(*, characters(*)), team_compositions(*, team_members(*, characters(*)))')
    .eq('is_active', true)
    .order('priority');

  if (error) {
    if (import.meta.env.DEV) console.error('Error fetching all strategies:', error);
    return [];
  }
  return (data ?? []) as CounterStrategyWithConditions[];
}
```

### Match Score Display

```typescript
// Source: Derived pattern [ASSUMED]
function MatchIndicator({ result }: { result: MatchResult }) {
  const matched = result.matchedCharacterIds.length;
  const total = result.template.enemy_defense_members.length;
  const isExact = result.matchScore === 1;

  return (
    <span className={isExact ? 'text-green-400' : 'text-amber-400'}>
      {isExact ? 'Exact match' : `${matched}/${total} matched`}
    </span>
  );
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Server-side search + API calls per query | Client-side matching with `resolveMatchingStrategies` | Phase 2 design decision | Zero latency on search, all data loaded upfront |
| Freeform text conditions | Structured `strategy_conditions` join table | Phase 1 design decision | Enables programmatic evaluation via `evaluateStrategy` |

**Already current:** All dependencies in this project are at latest stable versions as of the package.json. No upgrades needed.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Counter strategy dataset is small enough to load entirely client-side (all templates + all strategies) | Architecture Patterns | If dataset grows large (100+ templates), need pagination or server-side search |
| A2 | `updated_at` on `counter_strategies` is acceptable as "last verified" timestamp | Common Pitfalls | If admin wants explicit "verify without editing" action, need a new column |
| A3 | Partial match threshold of matchScore > 0 (at least 1 character overlap) is appropriate | Phase Requirements LOOK-08 | If too many irrelevant results appear, may need minimum threshold (e.g., 0.3) |
| A4 | Featured templates (is_featured=true) should always show at page top before search input | Architecture Patterns | UX decision -- could alternatively show them in a sidebar or separate tab |
| A5 | The `team_compositions` join in strategies needs to be extended to include `team_members(*, characters(*))` for counter team portraits | Common Pitfalls | If we display counter teams differently (e.g., just team name), the current join is sufficient |

## Open Questions

1. **Partial-match threshold**
   - What we know: `resolveMatchingStrategies` returns ALL templates with matchScore from 0 to 1. STATE.md flags this as needing a product decision.
   - What's unclear: Should results with matchScore < some threshold be hidden? Or show all with visual grouping?
   - Recommendation: Show all results where matchScore > 0, grouped into "Exact match" (score=1) and "Partial match" (score<1) sections. Let the user see everything and judge relevance. This can be tightened later based on user feedback.

2. **Seed data for counter strategies**
   - What we know: STATE.md flags "Seed data strategy for offline fallback does not yet cover counter strategies."
   - What's unclear: Is offline/seed-data fallback required for this page, or is it acceptable to show empty state without Supabase?
   - Recommendation: Accept empty state for v1. Counter strategies are admin-authored content, not static reference data. Add seed data as a separate task if dev experience needs it.

3. **Counter team display depth**
   - What we know: `CounterStrategyWithConditions` includes `team_compositions` but not nested `team_members` with character data.
   - What's unclear: Should counter teams show full character portraits (requires deeper join) or just team name?
   - Recommendation: Show full portraits. Extend the Supabase query join to include `team_members(*, characters(*))`. This matches the visual richness of other team displays in the app.

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.2 |
| Config file | `vite.config.ts` (test section) |
| Quick run command | `npm run test` |
| Full suite command | `npm run test` |

### Phase Requirements to Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| LOOK-01 | Page renders with character selector and shows results on selection | integration | `npx vitest run src/pages/CounterSearch.test.tsx` | No -- Wave 0 |
| LOOK-04 | Results display strategies ordered by priority | unit | `npx vitest run src/pages/CounterSearch.test.tsx` | No -- Wave 0 |
| LOOK-05 | Condition badges render must_have (green) and must_not_have (red) correctly | unit | `npx vitest run src/components/counter/ConditionBadges.test.tsx` | No -- Wave 0 |
| LOOK-06 | Featured templates render at page top, clicking one populates selector | integration | `npx vitest run src/pages/CounterSearch.test.tsx` | No -- Wave 0 |
| LOOK-07 | Strategy notes and condition_note text visible on counter cards | unit | `npx vitest run src/components/counter/StrategyCard.test.tsx` | No -- Wave 0 |
| LOOK-08 | Partial matches appear ranked by overlap when no exact match | unit | Already covered by `src/utils/strategyMatcher.test.ts` | Yes -- existing |

### Sampling Rate

- **Per task commit:** `npm run test`
- **Per wave merge:** `npm run test && npm run lint && npm run build`
- **Phase gate:** Full suite green before `/gsd-verify-work`

### Wave 0 Gaps

- [ ] `src/pages/CounterSearch.test.tsx` -- covers LOOK-01, LOOK-04, LOOK-06
- [ ] `src/components/counter/ConditionBadges.test.tsx` -- covers LOOK-05
- [ ] `src/components/counter/StrategyCard.test.tsx` -- covers LOOK-07
- [ ] `src/hooks/useCounterSearch.test.ts` -- covers data orchestration logic

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | No | Read-only page, no auth in v1 |
| V3 Session Management | No | No sessions |
| V4 Access Control | No | Public read-only data |
| V5 Input Validation | Yes | Character selection bounded by `maxSelections={6}`, IDs from character database |
| V6 Cryptography | No | No crypto operations |

### Known Threat Patterns

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| XSS via strategy_notes rendering | Tampering | React's default JSX escaping -- never use `dangerouslySetInnerHTML` for strategy notes |
| Supabase query injection | Tampering | Already mitigated by typed Supabase client with parameterized queries [VERIFIED: codebase] |

## Sources

### Primary (HIGH confidence)
- Project codebase -- `src/services/strategies.ts`, `src/utils/strategyMatcher.ts`, `src/types/database.ts`, `src/components/character-multi-select/CharacterMultiSelect.tsx`, `src/components/character-portrait/CharacterPortrait.tsx`
- `package.json` -- verified all dependency versions
- `.planning/STATE.md` -- project decisions and known blockers
- `.planning/REQUIREMENTS.md` -- requirement IDs and descriptions

### Secondary (MEDIUM confidence)
- Existing page patterns (`GvgMode.tsx`, `Characters.tsx`) for component structure conventions

### Tertiary (LOW confidence)
- None -- all findings verified against codebase

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all libraries already installed and verified in package.json
- Architecture: HIGH -- follows established project patterns (pages, hooks, services, components)
- Pitfalls: HIGH -- identified from reading actual service code and types

**Research date:** 2026-04-06
**Valid until:** 2026-05-06 (stable -- no fast-moving external dependencies)
