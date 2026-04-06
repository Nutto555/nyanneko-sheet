# Phase 3: Shared UI Components - Context

**Gathered:** 2026-04-06
**Status:** Ready for planning

<domain>
## Phase Boundary

A reusable character multi-select component (Headless UI Combobox + Fuse.js) and a character portrait component, both used by the member counter lookup page (Phase 4) and the admin strategy builder (Phase 5). No pages or routes — pure shared components.

</domain>

<decisions>
## Implementation Decisions

### Multi-select Design
- **D-01:** Combobox with portrait chips — type to search, dropdown shows character name + portrait thumbnail. Selected characters appear as removable portrait chips. Like a tag input with images.
- **D-02:** Fuse.js searches both `name_en` and `name_th` fields. Guild members may know characters by either name.

### Portrait Display
- **D-03:** New dedicated `CharacterPortrait` component, NOT extending existing UnitSlot. UnitSlot has team-specific features (stats, role badges) that don't apply everywhere. Portrait is simpler: image + name + optional role badge.
- **D-04:** Three size variants: sm (32px) for chips in multi-select, md (48px) for search results and lists, lg (72px) for team displays.

### Component API
- **D-05:** Controlled component — parent passes `selectedCharacters` + `onChange` callback. Standard React pattern needed because both counter lookup and admin builder read selections for different purposes.
- **D-06:** Configurable `maxSelections` prop with default unlimited. Admin needs 4-6 for enemy templates, counter lookup allows any number for search flexibility.

### Styling Approach
- **D-07:** Use existing CSS variables from index.css (`--color-surface-raised`, `--color-border-bright`, etc.). Consistent with current UnitSlot and Card components. Tailwind + CSS vars.
- **D-08:** Subtle CSS transitions for chip add/remove and dropdown show/hide. No animation library — CSS transitions only.

### Claude's Discretion
- Exact Fuse.js configuration (threshold, keys, weights)
- Headless UI Combobox implementation details
- Dropdown positioning and max height
- Portrait fallback icon/placeholder when no image
- Keyboard navigation details within the combobox

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Existing Components
- `src/components/unit-slot/UnitSlot.tsx` — Existing portrait display pattern with `safeImageUrl()` — reuse the URL validation logic
- `src/components/ui/Badge.tsx` — Existing badge component for role indicators
- `src/components/ui/Card.tsx` — Existing card component for styling reference

### Data Layer (Phase 2 output)
- `src/types/database.ts` — Character interface with `name_en`, `name_th`, `image_url`, `thumbnail_url`, `role` fields
- `src/hooks/useCharacters.ts` — Existing hook for fetching character data (`useCharacters()` returns `{ characters, loading, error }`)

### Styling
- `src/index.css` — CSS custom properties (design tokens) for the dark game theme

### Requirements
- `.planning/REQUIREMENTS.md` — LOOK-02 (multi-select with fuzzy matching) and LOOK-03 (character portraits)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `safeImageUrl()` in UnitSlot.tsx — URL validation for character images, reuse in CharacterPortrait
- `useCharacters` hook — pre-fetches all characters, returns typed array
- CSS custom properties in index.css — `--color-surface-raised`, `--color-border-bright`, `--color-accent` etc.
- `ROLE_INFO` constant in database.ts — role name lookups for badge display

### Established Patterns
- Components use Tailwind classes + CSS custom properties for theming
- Props interfaces use `{ComponentName}Props` format
- Named exports for UI components, default export for page components
- Image loading uses `loading="lazy"` and `object-cover`

### Integration Points
- Both Phase 4 (Counter Lookup) and Phase 5 (Admin Builder) will import these components
- Character data flows through `useCharacters` hook → component props
- Fuse.js instance should be memoized to avoid re-indexing on each keystroke (success criterion #4)

</code_context>

<specifics>
## Specific Ideas

- The multi-select should feel like a modern tag input (similar to GitHub's label picker or Slack's member selector) but with character portrait thumbnails
- Fuse.js instance created inside `useMemo` — retyping does not re-index the full character list on each keystroke (from ROADMAP success criteria)
- Portrait chips should be removable with an X button click

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 03-shared-ui-components*
*Context gathered: 2026-04-06*
