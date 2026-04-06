---
phase: 03-shared-ui-components
plan: 01
subsystem: ui
tags: [react, vitest, jsdom, testing-library, component, image-security]

# Dependency graph
requires:
  - phase: 02-types-service-layer-and-matcher-utility
    provides: Character type, database types
provides:
  - Shared safeImageUrl utility (src/utils/imageUrl.ts)
  - CharacterPortrait component with sm/md/lg variants
  - CharacterPortraitSize type export
  - Vitest jsdom test environment with @testing-library/react
affects: [03-02-PLAN (multi-select chips use CharacterPortrait), phase-04 (counter lookup), phase-05 (admin builder)]

# Tech tracking
tech-stack:
  added: ["@testing-library/react", "@testing-library/jest-dom", "jsdom"]
  patterns: [shared-utility-extraction, component-test-with-testing-library, tdd-red-green]

key-files:
  created:
    - src/utils/imageUrl.ts
    - src/utils/imageUrl.test.ts
    - src/components/character-portrait/CharacterPortrait.tsx
    - src/components/character-portrait/CharacterPortrait.test.tsx
    - src/test-setup.ts
  modified:
    - src/components/unit-slot/UnitSlot.tsx
    - src/components/equip-card/EquipCard.tsx
    - src/types/ui.ts
    - vite.config.ts
    - tsconfig.node.json
    - package.json

key-decisions:
  - "CharacterPortrait is standalone named export, not extending UnitSlot (per D-03)"
  - "Added vitest/config to tsconfig.node.json types to fix build compatibility with test config in vite.config.ts"

patterns-established:
  - "Shared utility extraction: security-critical helpers live in src/utils/ with dedicated test files"
  - "Component testing: use @testing-library/react with jsdom environment and data-testid for style assertions"

requirements-completed: [LOOK-03]

# Metrics
duration: 5min
completed: 2026-04-06
---

# Phase 03 Plan 01: Shared Image Utility and CharacterPortrait Summary

**Shared safeImageUrl utility extracted from duplicated code, CharacterPortrait component with 3 size variants (32/48/72px) and fallback placeholder, jsdom test infrastructure with 18 passing tests**

## Performance

- **Duration:** 5 min
- **Started:** 2026-04-06T16:35:33Z
- **Completed:** 2026-04-06T16:40:06Z
- **Tasks:** 2
- **Files modified:** 11

## Accomplishments
- Extracted duplicated safeImageUrl from UnitSlot.tsx and EquipCard.tsx into shared src/utils/imageUrl.ts
- Created CharacterPortrait component rendering character images at sm (32px), md (48px), lg (72px) with fallback placeholder, optional name text and role badge
- Configured Vitest with jsdom environment and @testing-library/react for component testing
- All 31 tests pass across the codebase (8 imageUrl + 10 CharacterPortrait + 13 strategyMatcher)

## Task Commits

Each task was committed atomically:

1. **Task 1: Extract safeImageUrl, install test deps, configure jsdom** - `ee57d51` (feat)
2. **Task 2 RED: Failing CharacterPortrait tests** - `7b26022` (test)
3. **Task 2 GREEN: Implement CharacterPortrait component** - `d5137db` (feat)

## Files Created/Modified
- `src/utils/imageUrl.ts` - Shared safeImageUrl utility for URL validation (security: blocks external URLs)
- `src/utils/imageUrl.test.ts` - 8 unit tests covering null, undefined, empty, relative, invalid, external, Supabase URLs
- `src/components/character-portrait/CharacterPortrait.tsx` - Portrait component with 3 size variants, fallback, showName, showRole
- `src/components/character-portrait/CharacterPortrait.test.tsx` - 10 component tests using @testing-library/react
- `src/test-setup.ts` - Test setup importing @testing-library/jest-dom matchers
- `src/components/unit-slot/UnitSlot.tsx` - Replaced local safeImageUrl with shared import
- `src/components/equip-card/EquipCard.tsx` - Replaced local safeImageUrl with shared import
- `src/types/ui.ts` - Added CharacterPortraitSize type
- `vite.config.ts` - Changed test environment from node to jsdom, added setupFiles
- `tsconfig.node.json` - Added vitest/config to types array
- `package.json` - Added @testing-library/react, @testing-library/jest-dom, jsdom devDependencies

## Decisions Made
- CharacterPortrait is a standalone named export component, not extending UnitSlot (per decision D-03)
- Added `vitest/config` to `tsconfig.node.json` types to resolve TS2769 build error with `test` property in vite.config.ts

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added vitest/config to tsconfig.node.json types**
- **Found during:** Task 2 (build verification)
- **Issue:** `npm run build` (tsc -b) failed with TS2769 because the `test` property in vite.config.ts was not recognized -- `tsconfig.node.json` only had `"node"` in its types array
- **Fix:** Added `"vitest/config"` to the types array in tsconfig.node.json
- **Files modified:** tsconfig.node.json
- **Verification:** `npm run build` succeeds after the change
- **Committed in:** d5137db (Task 2 GREEN commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Auto-fix necessary for build to pass. No scope creep.

## Issues Encountered
- Pre-existing lint errors in EquipCard.tsx (no-useless-escape in parseStats regex) and useCharacters.ts (setState-in-effect) -- these are out of scope and not caused by plan changes

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- CharacterPortrait component ready for use by Plan 02 (multi-select character chips)
- safeImageUrl shared utility available for any component needing image URL validation
- Test infrastructure (jsdom + @testing-library/react) ready for future component tests

## Self-Check: PASSED

All 5 created files verified present. All 3 commit hashes verified in git log.

---
*Phase: 03-shared-ui-components*
*Completed: 2026-04-06*
