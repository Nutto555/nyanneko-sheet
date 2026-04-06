# Phase 3: Shared UI Components - Research

**Researched:** 2026-04-06
**Domain:** React UI components (Headless UI Combobox, Fuse.js fuzzy search, character portrait display)
**Confidence:** HIGH

## Summary

Phase 3 builds two reusable components -- a character multi-select combobox and a character portrait display -- that serve as shared building blocks for Phase 4 (Counter Lookup) and Phase 5 (Admin Builder). The technical stack is well-established: Headless UI provides an accessible, unstyled combobox with native multi-select support, and Fuse.js handles client-side fuzzy search across bilingual character names.

The existing codebase already has patterns for character image display (`UnitSlot.tsx`) and data fetching (`useCharacters` hook). The main work is extracting `safeImageUrl` into a shared utility (currently duplicated in two files), creating a new `CharacterPortrait` component with three size variants, and building a `CharacterMultiSelect` component that wires Headless UI Combobox with Fuse.js search.

**Primary recommendation:** Use `@headlessui/react` Combobox with `multiple` prop for the multi-select, Fuse.js for bilingual fuzzy search with `useMemo`-memoized instance, and extract `safeImageUrl` to `src/utils/imageUrl.ts` before building the new components.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Combobox with portrait chips -- type to search, dropdown shows character name + portrait thumbnail. Selected characters appear as removable portrait chips.
- **D-02:** Fuse.js searches both `name_en` and `name_th` fields.
- **D-03:** New dedicated `CharacterPortrait` component, NOT extending existing UnitSlot.
- **D-04:** Three size variants: sm (32px) for chips, md (48px) for search results, lg (72px) for team displays.
- **D-05:** Controlled component -- parent passes `selectedCharacters` + `onChange` callback.
- **D-06:** Configurable `maxSelections` prop with default unlimited.
- **D-07:** Use existing CSS variables from index.css. Tailwind + CSS vars.
- **D-08:** Subtle CSS transitions for chip add/remove and dropdown show/hide. No animation library.

### Claude's Discretion
- Exact Fuse.js configuration (threshold, keys, weights)
- Headless UI Combobox implementation details
- Dropdown positioning and max height
- Portrait fallback icon/placeholder when no image
- Keyboard navigation details within the combobox

### Deferred Ideas (OUT OF SCOPE)
None
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| LOOK-02 | Multi-character search input with fuzzy matching (Fuse.js) against character database | Headless UI Combobox `multiple` mode + Fuse.js with bilingual keys config; `useMemo` for Fuse instance |
| LOOK-03 | Character portraits displayed in all team compositions (enemy and counter teams) | `CharacterPortrait` component with sm/md/lg variants; `safeImageUrl` extracted to shared utility |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @headlessui/react | 2.2.9 | Accessible unstyled Combobox with multi-select | Official Tailwind Labs companion; fully accessible, no styling conflicts, React 19 compatible since 2.2.x [VERIFIED: npm registry] |
| fuse.js | 7.3.0 | Client-side fuzzy search for character names | Most popular JS fuzzy search library; zero-dependency, works with bilingual text [VERIFIED: npm registry] |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @testing-library/react | 16.3.2 | Component testing | Unit tests for multi-select and portrait components [VERIFIED: npm registry] |
| @testing-library/jest-dom | 6.9.1 | DOM assertion matchers | Enhanced test assertions (toBeInTheDocument, etc.) [VERIFIED: npm registry] |
| jsdom | 29.0.1 | Browser environment for tests | Required by vitest for component rendering [VERIFIED: npm registry] |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Headless UI Combobox | Radix UI Select/Combobox | Both excellent; Headless UI is the natural fit since project already uses Tailwind |
| Fuse.js | minisearch, flexsearch | Fuse.js is simpler for this use case; ~60 characters is not enough data to need a full-text engine |

**Installation:**
```bash
npm install @headlessui/react fuse.js
npm install -D @testing-library/react @testing-library/jest-dom jsdom
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── utils/
│   └── imageUrl.ts            # Extracted safeImageUrl (shared)
├── hooks/
│   ├── useCharacters.ts       # Existing — fetches character data
│   └── useFuseSearch.ts       # New — memoized Fuse instance + search
├── components/
│   ├── character-portrait/
│   │   └── CharacterPortrait.tsx   # New — portrait with sm/md/lg sizes
│   └── character-multi-select/
│       └── CharacterMultiSelect.tsx # New — Headless UI Combobox + Fuse
└── types/
    └── ui.ts                  # Extend with CharacterPortraitSize type
```

### Pattern 1: Memoized Fuse.js Search Hook
**What:** Custom hook that creates a Fuse.js instance via `useMemo` and exposes a search function.
**When to use:** Any component needing fuzzy character search.
**Example:**
```typescript
// Source: Fuse.js docs + React useMemo pattern
import Fuse from 'fuse.js';
import { useMemo, useState, useCallback } from 'react';
import type { Character } from '../types/database';

const FUSE_OPTIONS: Fuse.IFuseOptions<Character> = {
  keys: [
    { name: 'name_en', weight: 0.6 },
    { name: 'name_th', weight: 0.4 },
  ],
  threshold: 0.4,
  includeScore: true,
  minMatchCharLength: 1,
};

export function useFuseSearch(characters: Character[]) {
  const fuse = useMemo(
    () => new Fuse(characters, FUSE_OPTIONS),
    [characters]
  );

  const search = useCallback(
    (query: string): Character[] => {
      if (!query.trim()) return characters;
      return fuse.search(query).map((result) => result.item);
    },
    [fuse, characters]
  );

  return { search };
}
```

### Pattern 2: Headless UI Multi-Select Combobox
**What:** Controlled Combobox with `multiple` prop, filtering delegated to Fuse.js.
**When to use:** The `CharacterMultiSelect` component.
**Example:**
```typescript
// Source: headlessui.com/react/combobox
import {
  Combobox,
  ComboboxInput,
  ComboboxOptions,
  ComboboxOption,
} from '@headlessui/react';

// Combobox with multiple mode passes array to value/onChange
<Combobox
  multiple
  value={selectedCharacters}
  onChange={handleChange}
  by="id"
>
  <ComboboxInput
    onChange={(e) => setQuery(e.target.value)}
    placeholder="Search characters..."
  />
  <ComboboxOptions anchor="bottom start">
    {filteredCharacters.map((char) => (
      <ComboboxOption key={char.id} value={char}>
        <CharacterPortrait character={char} size="md" />
        <span>{char.name_en}</span>
      </ComboboxOption>
    ))}
  </ComboboxOptions>
</Combobox>
```

### Pattern 3: Controlled Component with maxSelections
**What:** Parent-controlled selection state with optional cap.
**When to use:** Both counter lookup (unlimited) and admin builder (4-6 cap).
**Example:**
```typescript
interface CharacterMultiSelectProps {
  characters: Character[];
  selectedCharacters: Character[];
  onChange: (characters: Character[]) => void;
  maxSelections?: number;
  placeholder?: string;
  disabled?: boolean;
}

// Inside onChange handler:
function handleChange(newSelection: Character[]) {
  if (maxSelections && newSelection.length > maxSelections) return;
  onChange(newSelection);
}
```

### Anti-Patterns to Avoid
- **Creating Fuse instance in render:** Always wrap in `useMemo` with `characters` as dependency. Re-creating the index on every keystroke kills performance with 60+ characters.
- **Extending UnitSlot for portraits:** Decision D-03 explicitly says NO. UnitSlot has team-specific features (stats, role badges) that pollute a general portrait component.
- **Inline safeImageUrl duplication:** Currently duplicated in UnitSlot.tsx and EquipCard.tsx. Extract once, import everywhere.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Fuzzy search | Custom string matching | Fuse.js | Handles Unicode (Thai), scoring, threshold tuning |
| Accessible combobox | Custom dropdown + keyboard handling | Headless UI Combobox | WAI-ARIA combobox pattern is complex (40+ keyboard interactions) |
| Image URL validation | N/A (already exists) | Extract `safeImageUrl` to shared util | Already battle-tested in UnitSlot.tsx, just needs extraction |

**Key insight:** The combobox accessibility pattern (ARIA roles, keyboard navigation, screen reader announcements) is deceptively complex. Headless UI handles all of it while leaving styling to Tailwind.

## Common Pitfalls

### Pitfall 1: Fuse.js Re-indexing on Every Render
**What goes wrong:** Creating `new Fuse(data, options)` inside the component body causes a full re-index on every render/keystroke.
**Why it happens:** Developers forget that Fuse constructor builds an internal index.
**How to avoid:** Wrap in `useMemo(() => new Fuse(chars, opts), [chars])`. This is explicitly called out in success criterion #4.
**Warning signs:** Lag when typing in the search input, especially with 60+ characters.

### Pitfall 2: Headless UI Combobox displayValue with Multiple Mode
**What goes wrong:** Setting `displayValue` on `ComboboxInput` in multi-select mode shows concatenated names in the input field instead of chips.
**Why it happens:** `displayValue` is designed for single-select to show the selected item's label.
**How to avoid:** In multi-select mode, omit `displayValue` and render selected items as chips above/beside the input. The input should always show the search query, not selected items.
**Warning signs:** Input field shows "CharA, CharB, CharC" instead of portrait chips.

### Pitfall 3: Missing `by` Prop for Object Comparison
**What goes wrong:** Combobox uses reference equality by default. If character objects are re-fetched (new references), previously selected items appear unselected.
**Why it happens:** React re-renders with new object references from API calls.
**How to avoid:** Always pass `by="id"` to Combobox so it compares characters by their ID, not by object reference.
**Warning signs:** Selections disappear after data refetch.

### Pitfall 4: Thai Character Search Threshold Too Strict
**What goes wrong:** Thai character names don't match with tight Fuse.js threshold because Thai script has different character density than Latin.
**Why it happens:** Default Fuse.js threshold (0.6) may be too strict or too loose for Thai text.
**How to avoid:** Set threshold to 0.4 (slightly stricter than default) and test with real Thai character names. Adjust based on results.
**Warning signs:** Searching Thai names returns no results even with close matches.

### Pitfall 5: Supabase Image URLs Not Validating
**What goes wrong:** Character images fail to load silently.
**Why it happens:** `safeImageUrl` validates against `VITE_SUPABASE_URL` host, which may not match the storage URL format.
**How to avoid:** Use the existing `safeImageUrl` implementation (already handles this). Test with actual Supabase storage URLs.
**Warning signs:** All character portraits show the fallback placeholder.

## Code Examples

### Extracted safeImageUrl Utility
```typescript
// src/utils/imageUrl.ts
// Source: Existing implementation in src/components/unit-slot/UnitSlot.tsx

/** Allow only relative paths and same-origin Supabase URLs as image src. */
export function safeImageUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith('/')) return url;
  try {
    const parsed = new URL(url);
    const supabaseHost = import.meta.env.VITE_SUPABASE_URL
      ? new URL(import.meta.env.VITE_SUPABASE_URL).host
      : null;
    if (supabaseHost && parsed.host === supabaseHost) return url;
  } catch { /* invalid URL */ }
  return null;
}
```

### CharacterPortrait Component Shape
```typescript
// src/components/character-portrait/CharacterPortrait.tsx
import type { Character } from '../../types/database';

export type CharacterPortraitSize = 'sm' | 'md' | 'lg';

interface CharacterPortraitProps {
  character: Character;
  size?: CharacterPortraitSize;
  showName?: boolean;
  showRole?: boolean;
  className?: string;
}

const SIZE_MAP: Record<CharacterPortraitSize, number> = {
  sm: 32,
  md: 48,
  lg: 72,
};
```

### Recommended Fuse.js Configuration
```typescript
// Source: fusejs.io options docs [CITED: fusejs.io]
const FUSE_OPTIONS: Fuse.IFuseOptions<Character> = {
  keys: [
    { name: 'name_en', weight: 0.6 },  // English name prioritized
    { name: 'name_th', weight: 0.4 },  // Thai name secondary
  ],
  threshold: 0.4,          // Slightly stricter than default 0.6
  includeScore: true,       // For potential relevance display
  minMatchCharLength: 1,    // Allow single-char search for Thai
  shouldSort: true,         // Best matches first
  findAllMatches: false,    // Stop at first good match per item
};
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| @headlessui/react v1 (nullable value) | @headlessui/react v2.x (data attributes, anchor positioning) | 2024 | v2 uses CSS anchor positioning and data-* attributes instead of render props for state |
| Fuse.js v6 | Fuse.js v7 (ESM-first, improved TypeScript types) | 2024 | Better tree-shaking, native ESM support |

**Deprecated/outdated:**
- Headless UI v1 `Combobox.Input`, `Combobox.Options` compound component syntax replaced with flat imports (`ComboboxInput`, `ComboboxOptions`) in v2

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Fuse.js threshold 0.4 works well for Thai + English bilingual search | Code Examples | May need tuning; can adjust post-testing without architecture change |
| A2 | English name weight 0.6 vs Thai 0.4 is the right balance | Code Examples | Easy to adjust; guild members may prefer Thai names |
| A3 | ~60 characters is small enough that Fuse.js indexing is fast even without optimization | Common Pitfalls | If character roster grows to 200+, may need debounced search input |

## Open Questions

1. **Portrait fallback design**
   - What we know: UnitSlot currently uses a sword emoji (crossed swords) as fallback when no image
   - What's unclear: Should CharacterPortrait use the same fallback or a different one
   - Recommendation: Use the same fallback pattern for consistency, but with a generic silhouette placeholder matching the size variant

2. **Dropdown max visible items**
   - What we know: Character list is ~60 items; showing all would be too long
   - What's unclear: Optimal number of visible items in the dropdown
   - Recommendation: Show 6-8 items with scroll, using `max-h-60 overflow-auto` on ComboboxOptions

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.2 |
| Config file | `vite.config.ts` (inline test config) |
| Quick run command | `npm run test` |
| Full suite command | `npm run test` |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| LOOK-02a | Fuse.js search returns matches for partial English name | unit | `npx vitest run src/hooks/useFuseSearch.test.ts -t "english"` | No -- Wave 0 |
| LOOK-02b | Fuse.js search returns matches for partial Thai name | unit | `npx vitest run src/hooks/useFuseSearch.test.ts -t "thai"` | No -- Wave 0 |
| LOOK-02c | Fuse instance is memoized (not recreated on query change) | unit | `npx vitest run src/hooks/useFuseSearch.test.ts -t "memoize"` | No -- Wave 0 |
| LOOK-02d | CharacterMultiSelect renders selected items as chips | unit | `npx vitest run src/components/character-multi-select/CharacterMultiSelect.test.tsx` | No -- Wave 0 |
| LOOK-02e | Chips can be individually removed | unit | `npx vitest run src/components/character-multi-select/CharacterMultiSelect.test.tsx -t "remove"` | No -- Wave 0 |
| LOOK-02f | maxSelections prop prevents adding beyond limit | unit | `npx vitest run src/components/character-multi-select/CharacterMultiSelect.test.tsx -t "max"` | No -- Wave 0 |
| LOOK-03a | CharacterPortrait renders image with safeImageUrl | unit | `npx vitest run src/components/character-portrait/CharacterPortrait.test.tsx` | No -- Wave 0 |
| LOOK-03b | CharacterPortrait renders sm/md/lg sizes correctly | unit | `npx vitest run src/components/character-portrait/CharacterPortrait.test.tsx -t "size"` | No -- Wave 0 |
| LOOK-03c | CharacterPortrait shows fallback when no image | unit | `npx vitest run src/components/character-portrait/CharacterPortrait.test.tsx -t "fallback"` | No -- Wave 0 |

### Sampling Rate
- **Per task commit:** `npm run test`
- **Per wave merge:** `npm run test`
- **Phase gate:** Full suite green before `/gsd-verify-work`

### Wave 0 Gaps
- [ ] `src/hooks/useFuseSearch.test.ts` -- covers LOOK-02a, LOOK-02b, LOOK-02c
- [ ] `src/components/character-multi-select/CharacterMultiSelect.test.tsx` -- covers LOOK-02d, LOOK-02e, LOOK-02f
- [ ] `src/components/character-portrait/CharacterPortrait.test.tsx` -- covers LOOK-03a, LOOK-03b, LOOK-03c
- [ ] `src/utils/imageUrl.test.ts` -- covers safeImageUrl extraction correctness
- [ ] Install test dependencies: `npm install -D @testing-library/react @testing-library/jest-dom jsdom`
- [ ] Update `vite.config.ts` test environment from `'node'` to `'jsdom'` for component testing

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | N/A |
| V3 Session Management | no | N/A |
| V4 Access Control | no | N/A |
| V5 Input Validation | yes | `safeImageUrl` validates image sources; Fuse.js query is read-only (no injection risk) |
| V6 Cryptography | no | N/A |

### Known Threat Patterns

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| XSS via image URL | Spoofing | `safeImageUrl` restricts to relative paths and same-origin Supabase URLs |
| Open redirect via image src | Tampering | URL validation rejects non-Supabase external URLs |

## Sources

### Primary (HIGH confidence)
- [headlessui.com/react/combobox](https://headlessui.com/react/combobox) -- Combobox API, multi-select mode, controlled pattern
- [npm registry](https://www.npmjs.com/package/@headlessui/react) -- @headlessui/react 2.2.9, React 19 support confirmed in 2.2.x series
- [npm registry](https://www.npmjs.com/package/fuse.js) -- fuse.js 7.3.0 current version
- Existing codebase -- UnitSlot.tsx, EquipCard.tsx (safeImageUrl pattern), useCharacters hook, index.css design tokens

### Secondary (MEDIUM confidence)
- [fusejs.io](https://www.fusejs.io) -- Configuration options (threshold, keys, weights)
- [GitHub headlessui#3538](https://github.com/tailwindlabs/headlessui/issues/3538) -- React 19 peer dependency resolution confirmed in 2.2.x

### Tertiary (LOW confidence)
- Fuse.js threshold/weight tuning for Thai text -- needs empirical testing with actual character data [ASSUMED]

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- well-known libraries, versions verified against npm
- Architecture: HIGH -- patterns derived from existing codebase conventions and official docs
- Pitfalls: MEDIUM -- Thai text search tuning is empirical; other pitfalls verified from docs/issues

**Research date:** 2026-04-06
**Valid until:** 2026-05-06 (30 days -- stable domain, no fast-moving dependencies)
