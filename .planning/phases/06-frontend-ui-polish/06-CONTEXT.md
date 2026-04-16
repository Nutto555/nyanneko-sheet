# Phase 6: Frontend UI Polish - Context

**Gathered:** 2026-04-16
**Status:** Ready for planning

<domain>
## Phase Boundary

Consistent, clean visual design across all pages with character portraits everywhere, mobile responsiveness for battle-time use, and clear navigation between all major sections. Includes subtle visual enhancements (card hover effects, loading skeletons, smooth page transitions) beyond the baseline UI-SPEC standardization.

</domain>

<decisions>
## Implementation Decisions

### Portrait Adoption Scope
- **D-01:** CharacterPortrait component replaces raw `<img>` tags EVERYWHERE — Characters.tsx, CharacterDetail.tsx, CounterSearch results, GvgMode team displays, Admin strategy/template builders. Full consistency across all pages that show characters.
- **D-02:** UnitSlot SHOULD be refactored to compose CharacterPortrait internally. This overrides UI-SPEC anti-pattern #2. UnitSlot keeps its stat badge overlays but delegates the base portrait rendering to CharacterPortrait for consistency.

### Visual Polish Depth
- **D-03:** Standardize spacing/typography/colors per UI-SPEC contracts PLUS three subtle enhancements:
  - Card hover effects — subtle border glow or scale on hover for interactive cards (CSS only)
  - Loading skeletons — layout-matching skeleton placeholders (shimmer) while data loads, matching the real card shape per component type
  - Smooth page transitions — fade or slide transitions between routes using CSS
- **D-04:** Loading skeletons must match the exact layout of content they replace (skeleton cards in a grid with portrait placeholder, text lines). Not generic shimmer blocks.

### Page Priority (Wave Ordering)
- **D-05:** Battle-critical first ordering:
  - Wave 1: Shared components (PageHeader, Skeleton, UnitSlot refactor) + Navigation updates
  - Wave 2: CounterSearch + Characters/CharacterDetail (battle use + reference)
  - Wave 3: GvgMode + remaining member pages (Home, Pets, Rings, Equipment, Equip, EquipmentSets)
  - Wave 4: Admin pages (Admin, AdminStrategies, AdminTemplates)
- **D-06:** Admin pages get the SAME full treatment as member-facing pages — PageHeader, portraits, loading skeletons, hover effects, consistent spacing. No reduced scope for admin.

### Claude's Discretion
- Exact CSS for card hover effects (border glow intensity, scale amount, transition duration)
- Loading skeleton implementation approach (CSS animation vs lightweight library)
- Page transition technique (CSS transitions, React Router scroll-to-top, or ViewTransition API if browser support sufficient)
- Skeleton component granularity (one reusable Skeleton primitive vs per-page skeleton layouts)
- Whether to extract common page container pattern into a shared component or just standardize classes

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### UI Design Contract
- `.planning/phases/06-frontend-ui-polish/06-UI-SPEC.md` — Visual/interaction contract: spacing scale, typography, color roles, navigation order, responsive breakpoints, component inventory, anti-patterns (note: anti-pattern #2 is overridden by D-02)

### Phase Research
- `.planning/phases/06-frontend-ui-polish/06-RESEARCH.md` — Technical research: page container patterns, header standardization, nav restructuring, portrait adoption analysis, pitfalls

### Existing Components
- `src/components/character-portrait/CharacterPortrait.tsx` — Portrait component with sm/md/lg sizes (built in Phase 3)
- `src/components/unit-slot/UnitSlot.tsx` — Team unit slot with stat badges, to be refactored to compose CharacterPortrait (D-02)
- `src/components/ui/Card.tsx` — Card component, will get hover effects
- `src/components/ui/Button.tsx` — Button component, no changes needed
- `src/components/ui/Badge.tsx` — Badge component, no changes needed
- `src/components/layout/Navbar.tsx` — Navigation bar, will get Counter + Admin links per UI-SPEC nav contract

### Styling
- `src/index.css` — CSS custom properties (design tokens), @theme directive, font declarations

### Phase 3 Context (Portrait Decisions)
- `.planning/phases/03-shared-ui-components/03-CONTEXT.md` — D-03 through D-08: CharacterPortrait design decisions, sizing, CSS vars approach

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `CharacterPortrait` component (Phase 3): sm/md/lg sizes, safeImageUrl, role badge option — ready for adoption across all pages
- `Card` component: bg-surface-raised, border, rounded-xl — will add hover effect
- `Badge` component: role indicators, variant system — no changes needed
- `useCharacters` hook: data fetching with loading/error state — skeleton integration point
- CSS custom properties in index.css: full color system, font vars

### Established Patterns
- Components use Tailwind classes + CSS custom properties
- Props interfaces use `{ComponentName}Props` format
- Named exports for UI components, default export for page components
- Image loading uses `loading="lazy"` and `object-cover`
- Navbar uses bilingual labels (Thai + English) with dropdown groups

### Integration Points
- `App.tsx`: All routes defined here, page transitions hook into router
- `Layout.tsx`: Wraps all pages with Navbar + Footer via `<Outlet />`
- Every page component: needs PageHeader + standardized container + skeleton states
- `Navbar.tsx`: needs Counter Lookup and Admin nav items added

</code_context>

<specifics>
## Specific Ideas

- Card hover effects should feel subtle and game-themed (border glow using `--color-primary` or `--color-gold`)
- Loading skeletons should use the dark theme colors (surface/surface-raised) for the shimmer, not gray
- Page transitions should be fast (150-200ms) — this is a battle tool, not an art portfolio
- UnitSlot refactor: keep all stat badge overlays, just delegate the base image rendering to CharacterPortrait

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 06-frontend-ui-polish*
*Context gathered: 2026-04-16*
