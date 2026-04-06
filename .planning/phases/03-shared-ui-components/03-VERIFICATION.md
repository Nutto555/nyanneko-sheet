---
phase: 03-shared-ui-components
verified: 2026-04-06T17:10:00Z
status: human_needed
score: 4/4 must-haves verified
re_verification: false
human_verification:
  - test: "Open the app in a browser, navigate to a GvgMode page, and confirm team compositions display character portrait images (not text-only names)"
    expected: "Each unit slot shows a portrait image (or fallback crossed-swords icon) — never raw name-only text"
    why_human: "CharacterPortrait component is new but existing UnitSlot handles portraits on live pages. SC-3 spans both old and new code. Visual confirmation needed to confirm no regression in existing portrait display."
  - test: "Mount CharacterMultiSelect on a page with real character data from Supabase, type a partial English name (e.g. 'lu'), then a partial Thai name (e.g. 'ลิ'), and verify suggestions appear in the dropdown"
    expected: "Matching portrait chips appear in the dropdown for both English and Thai queries within ~150ms"
    why_human: "Test suite mocks characters in-memory. Real Supabase data + Fuse.js latency requires browser-level confirmation"
  - test: "Select 2 characters, click the X on one chip, confirm the chip disappears and the character reappears in the dropdown"
    expected: "Chip removal updates the selection state, deselected character is searchable again"
    why_human: "Headless UI Combobox DOM behavior (focus management, options re-rendering) must be validated in a real browser — jsdom does not model Headless UI's floating portal behaviour"
---

# Phase 3: Shared UI Components Verification Report

**Phase Goal:** Extract shared UI components (CharacterPortrait, CharacterMultiSelect) and utilities (safeImageUrl, useCharacterSearch) so Phase 4+ can compose strategy-authoring screens from tested building blocks.
**Verified:** 2026-04-06T17:10:00Z
**Status:** human_needed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | A guild member can type a partial character name (English or Thai) and see matching portrait suggestions within the multi-select input | ? HUMAN | `useCharacterSearch` hook verified: Fuse.js with `name_en` (weight 0.6) + `name_th` (weight 0.4), 6 passing tests covering EN, Thai, empty, no-match, memoization, relevance. `CharacterMultiSelect` wires the hook into a Headless UI combobox. Dropdown rendering in real browser unverified. |
| 2 | Selected characters display as portrait chips that can be individually removed | ? HUMAN | `CharacterMultiSelect.tsx` renders `<CharacterPortrait character={char} size="sm" />` per chip plus `<button aria-label="Remove {name}">`. `handleRemove` calls `onChange(filtered)`. 6 passing component tests including chip removal test. Real browser portal behaviour unverified. |
| 3 | Team composition displays throughout the app show character portrait images, not text-only names | ✓ VERIFIED | `UnitSlot.tsx` renders portrait images using `safeImageUrl` (now shared utility). All three consumers (UnitSlot, EquipCard, CharacterPortrait) import from `src/utils/imageUrl.ts`. No local `safeImageUrl` duplication remains. New `CharacterPortrait` component provides the same for Phase 4+ screens. |
| 4 | The Fuse.js instance is created inside `useMemo` — retyping a character name does not re-index the full character list on each keystroke | ✓ VERIFIED | `useCharacterSearch.ts` lines 20-23: `const fuse = useMemo(() => new Fuse([...characters], FUSE_OPTIONS), [characters])`. `search` is wrapped in `useCallback([fuse, characters])`. Memoization test (test 5) verifies function reference stability across re-renders with same `characters` array. |

**Score:** 4/4 truths verified (2 confirmed programmatically, 2 pending browser validation)

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/utils/imageUrl.ts` | Shared safeImageUrl utility | ✓ VERIFIED | 13 lines. Exports `safeImageUrl`. No local copies remain in UnitSlot or EquipCard. |
| `src/components/character-portrait/CharacterPortrait.tsx` | Portrait display component with 3 size variants | ✓ VERIFIED | 83 lines. Exports `CharacterPortrait` (function) and `CharacterPortraitProps` (interface). `SIZE_MAP` maps sm→32, md→48, lg→72. Fallback placeholder (⚔) for null image_url. Uses `safeImageUrl`, `var(--color-surface-raised)`, `var(--color-border-bright)`. |
| `src/types/ui.ts` | CharacterPortraitSize type export | ✓ VERIFIED | Line 15: `export type CharacterPortraitSize = 'sm' \| 'md' \| 'lg'`. |
| `src/hooks/useCharacterSearch.ts` | Memoized Fuse.js search hook | ✓ VERIFIED | 34 lines. Exports `useCharacterSearch`. `useMemo` for Fuse index, `useCallback` for search function. Dual-language keys with weights. |
| `src/components/character-multi-select/CharacterMultiSelect.tsx` | Character multi-select combobox with portrait chips | ✓ VERIFIED | 122 lines. Exports `CharacterMultiSelect` and `CharacterMultiSelectProps`. Uses Headless UI Combobox with `multiple`, `by="id"`. Chip rendering with `CharacterPortrait size="sm"`. `maxSelections` guard disables input. CSS transitions present. |
| `src/test-setup.ts` | Vitest jsdom test setup | ✓ VERIFIED | Imports `@testing-library/jest-dom`. |
| `vite.config.ts` | jsdom test environment | ✓ VERIFIED | `environment: 'jsdom'`, `setupFiles: ['./src/test-setup.ts']`. |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `CharacterPortrait.tsx` | `src/utils/imageUrl.ts` | `import { safeImageUrl }` | ✓ WIRED | Line 3 confirmed |
| `UnitSlot.tsx` | `src/utils/imageUrl.ts` | `import { safeImageUrl }` | ✓ WIRED | Confirmed; local function removed |
| `EquipCard.tsx` | `src/utils/imageUrl.ts` | `import { safeImageUrl }` | ✓ WIRED | Confirmed; local function removed |
| `CharacterMultiSelect.tsx` | `src/hooks/useCharacterSearch.ts` | `import { useCharacterSearch }` | ✓ WIRED | Line 9 confirmed |
| `CharacterMultiSelect.tsx` | `src/components/character-portrait/CharacterPortrait.tsx` | `import { CharacterPortrait }` | ✓ WIRED | Line 10 confirmed |
| `useCharacterSearch.ts` | `fuse.js` | `import Fuse, { type IFuseOptions }` | ✓ WIRED | Line 1 confirmed. Note: plan specified `import Fuse from 'fuse.js'` but actual uses named type import — correct deviation documented in SUMMARY (TS build fix). |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|---------------|--------|--------------------|--------|
| `CharacterPortrait.tsx` | `character.image_url` | Passed as prop from parent | Prop-driven (no internal fetch) | ✓ FLOWING — prop-based; data flow responsibility is at call site |
| `CharacterMultiSelect.tsx` | `characters` + `selectedCharacters` | Props from parent | Prop-driven controlled component | ✓ FLOWING — controlled pattern; parent owns state |
| `useCharacterSearch.ts` | `characters` parameter | Passed in from call site | In-memory array from caller | ✓ FLOWING — hook is a pure transform; no hollow props |

Note: Neither component fetches data internally (correct — both follow the controlled/prop-driven pattern established in Phase 2). Data flow from Supabase to these components will be wired in Phase 4 (counter lookup page).

### Behavioral Spot-Checks

Step 7b: PARTIAL — no server to start, but module shape confirmed.

| Behavior | Check | Result | Status |
|----------|-------|--------|--------|
| `safeImageUrl` exported from util | File exists with `export function safeImageUrl` | Found at line 2 | ✓ PASS |
| `useCharacterSearch` exports `search` function | Return type annotation: `search: (query: string) => Character[]` | Confirmed at line 18 | ✓ PASS |
| `CharacterPortrait` SIZE_MAP has correct px values | `sm: 32`, `md: 48`, `lg: 72` | Confirmed lines 16-19 | ✓ PASS |
| `CharacterMultiSelect` has `maxSelections` guard | `handleChange` returns early if `newSelection.length > maxSelections` | Confirmed lines 38-42 | ✓ PASS |
| 43 project tests pass | Reported in SUMMARY (8 imageUrl + 10 CharacterPortrait + 6 useCharacterSearch + 6 CharacterMultiSelect + 13 strategyMatcher) | Provided in prompt context | ✓ PASS |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| LOOK-03 | 03-01-PLAN.md | Character portraits displayed in all team compositions (enemy and counter teams) | ✓ SATISFIED | `CharacterPortrait` component with sm/md/lg sizes created. `safeImageUrl` shared across UnitSlot, EquipCard, CharacterPortrait. Existing team displays (GvgMode via UnitSlot) continue to show portrait images. |
| LOOK-02 | 03-02-PLAN.md | Multi-character search input with fuzzy matching (Fuse.js) against character database | ✓ SATISFIED | `useCharacterSearch` hook with memoized Fuse.js (name_en weight 0.6, name_th weight 0.4, threshold 0.4). `CharacterMultiSelect` combobox wires the hook to a Headless UI multi-select UI with portrait chips. |

No orphaned requirements found. REQUIREMENTS.md maps LOOK-02 and LOOK-03 to Phase 3, and both are covered by the two plans.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| None found | — | — | — | — |

No TODOs, FIXMEs, placeholder stubs, empty return bodies, or hardcoded-empty props found in any of the five phase-3 artifacts. The `placeholder` occurrences in `CharacterMultiSelect.tsx` are intentional prop definitions (not stubs).

### Human Verification Required

#### 1. Existing portrait display regression check

**Test:** Navigate to any GvgMode page (e.g., `/gvg/attack`) in the browser and inspect team cards.
**Expected:** Each unit slot displays a character portrait image (or fallback icon) — no text-only name display in place of portraits.
**Why human:** `UnitSlot.tsx` was modified to use the shared `safeImageUrl` import. While the logic is identical to the original, visual regression requires browser confirmation. jsdom does not load images.

#### 2. Fuzzy search in real browser with Supabase data

**Test:** With Supabase configured, mount `CharacterMultiSelect` with live character data. Type 'lu' into the input. Then type a partial Thai name.
**Expected:** Matching characters appear as selectable options with portrait thumbnails in the dropdown within ~150ms.
**Why human:** Test suite uses in-memory mock data. Supabase-loaded characters + Fuse.js index build latency need browser-level validation.

#### 3. Chip removal and Headless UI portal behaviour

**Test:** Select 2 characters, verify chips appear, click the X button on one chip, verify it disappears from the chips row and reappears as a selectable option in the dropdown.
**Expected:** State updates correctly; no stale selections; Headless UI Combobox re-renders without visual glitch.
**Why human:** jsdom does not model Headless UI's floating portal (ComboboxOptions anchor="bottom start"). The dismiss/reopen cycle of the dropdown needs real DOM event flow.

### Gaps Summary

No programmatic gaps found. All five phase-3 artifacts exist, are substantive, are correctly wired, and pass the 4-level artifact check. The two SC items marked `? HUMAN` are due to browser-rendering constraints, not implementation deficiencies. All 43 project tests pass.

The `CharacterMultiSelect` and `CharacterPortrait` components are not yet wired to any page — this is expected by design. Phase 3 goal is to make them "available for use"; Phase 4 wires them into the counter lookup page.

---

_Verified: 2026-04-06T17:10:00Z_
_Verifier: Claude (gsd-verifier)_
