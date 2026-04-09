# Phase 6: Frontend UI Polish - Research

**Researched:** 2026-04-09
**Domain:** React UI consistency, responsive design, navigation, Tailwind CSS
**Confidence:** HIGH

## Summary

Phase 6 is a pure CSS/layout/component polish phase with no new dependencies needed. The existing codebase already has a well-defined design system (dark game HUD theme, Tailwind CSS 4 with custom design tokens, Cinzel display font, Sarabun body font) and reusable components (Button, Card, Badge, CharacterPortrait). The work is about **closing gaps and enforcing consistency**, not building new systems.

Three concrete gaps were identified: (1) the Navbar is missing links to Counter Lookup and Admin -- the two most important new sections from Phases 4-5, (2) several pages use inconsistent container widths and page header patterns, and (3) the Characters page renders portraits using raw `getImageUrl()` instead of the standardized `CharacterPortrait` component created in Phase 3.

**Primary recommendation:** Structure this phase as 3 plans: navigation fix (Navbar + mobile menu), portrait and page layout consistency audit, and responsive polish pass. No new libraries needed.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| UI-01 | Improved visual design -- cleaner layout, better spacing, consistent styling | Identified inconsistencies: mixed max-w classes (3xl/4xl/5xl/7xl), some pages use font-display for headers while Characters/CharacterDetail do not, inline styles vs Tailwind classes used inconsistently |
| UI-02 | Character portraits used throughout (team displays, search results, builder) | CharacterPortrait component exists and is used in counter/admin components. Gap: Characters.tsx and CharacterDetail.tsx use raw `getImageUrl()` with inline `<img>` instead of CharacterPortrait. UnitSlot.tsx also uses `safeImageUrl` directly instead of CharacterPortrait. |
| UI-03 | Responsive design for mobile viewing (guild members checking during battles) | Navbar already has mobile hamburger menu. Gaps: no Counter Lookup or Admin in mobile nav, page containers have mixed padding/py values, Characters grid needs mobile column review |
| UI-04 | Clear navigation between counter lookup, team browser, character database, and admin | Navbar is missing Counter Lookup link and Admin link entirely. Only has: Home, Attack, Defense (dropdown), Database (dropdown), Gear Guide |
</phase_requirements>

## Project Constraints (from CLAUDE.md)

- **Tech stack**: React + TypeScript + Supabase + Tailwind -- no new frameworks
- **Deployment**: Static frontend (Vite build) on Vercel
- **Immutability**: Spread operator for state updates, never mutate
- **File organization**: 200-400 lines typical, 800 max
- **Component naming**: PascalCase .tsx, kebab-case directories
- **Module exports**: Default export for page components, named export for UI components
- **Error handling**: Try-catch with user-friendly messages, DEV-only console.error
- **Tailwind CSS 4**: Using `@theme` directive with custom design tokens
- **Fonts**: Cinzel (display) + Sarabun (body) via Google Fonts

## Standard Stack

### Core (Already Installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | 19.2.4 | UI framework | Already in use |
| Tailwind CSS | 4.2.2 | Utility-first CSS | Already in use with custom theme |
| React Router | 7.14.0 | Client-side routing | Already in use |

### No New Dependencies Needed

This phase is pure refactoring and polish of existing code. No new libraries are required.

## Architecture Patterns

### Current Project Structure (Relevant to This Phase)
```
src/
  components/
    layout/
      Navbar.tsx          # MODIFY: Add Counter Lookup + Admin links
      Layout.tsx          # No changes needed
      Footer.tsx          # No changes needed
    character-portrait/
      CharacterPortrait.tsx  # REUSE: Already exists, needs wider adoption
    ui/
      Button.tsx          # REUSE: Consistent button styles
      Card.tsx            # REUSE: Consistent card styles
      Badge.tsx           # REUSE: Consistent badge styles
    unit-slot/
      UnitSlot.tsx        # REVIEW: Uses safeImageUrl directly, not CharacterPortrait
    team-card/
      TeamCard.tsx        # REVIEW: Relies on UnitSlot
    counter/              # Already uses CharacterPortrait
    admin/                # Already uses CharacterPortrait
  pages/
    Characters.tsx        # MODIFY: Replace getImageUrl with CharacterPortrait
    CharacterDetail.tsx   # MODIFY: Replace getImageUrl with CharacterPortrait
    [others]              # REVIEW: Standardize container widths and page headers
```

### Pattern 1: Page Container Standardization
**What:** Every page uses the same container pattern with consistent max-width and padding
**When to use:** All page-level components
**Current state (inconsistent):**
- Home: `max-w-5xl py-10`
- Characters: `max-w-7xl py-16`
- GvgMode: `max-w-4xl py-8`
- CounterSearch: `max-w-4xl py-16`
- Admin: `max-w-4xl py-8`
- AdminStrategies: `max-w-5xl py-8`
- About: `max-w-3xl py-16`

**Recommended standard:** [ASSUMED]
- Content-heavy pages (Characters, Pets, Rings, Equipment): `max-w-7xl`
- Strategy/form pages (Counter, Admin, GvgMode): `max-w-5xl`
- Minimal pages (About): `max-w-3xl`
- All pages: `px-4 sm:px-6 lg:px-8 py-8` (standardize to py-8, currently mixed)

### Pattern 2: Page Header Pattern
**What:** Consistent page header with display font, subtitle, and divider
**When to use:** Top of every page
**Example (from GvgMode -- best current example):**
```typescript
<div className="mb-8">
  <h1
    className="text-2xl font-bold text-white"
    style={{ fontFamily: 'var(--font-display)' }}
  >
    {title}
  </h1>
  <p className="text-sm text-slate-400 mt-2">{description}</p>
  <div className="mt-3 h-px" style={{ background: 'linear-gradient(to right, var(--color-gold-dim), transparent)' }} />
</div>
```
**Gap:** Characters.tsx uses `text-4xl font-bold` without display font. CharacterDetail.tsx has no page header pattern.

### Pattern 3: Navigation Structure
**What:** Navbar needs Counter Lookup as a top-level link and Admin as a conditional link
**Current gaps identified:**
- No `/counter` link (Counter Lookup) -- this is the PRIMARY member-facing feature
- No `/admin` link -- admin needs quick access
- No `/updates` link -- exists as route but not in nav

**Recommended nav structure:** [ASSUMED]
```
Home | Counter Lookup | GvG Attack | Defense (dropdown) | Database (dropdown) | Gear Guide | Admin
```
Counter Lookup should be prominent (primary color or highlighted) since it is the core value proposition.

### Anti-Patterns to Avoid
- **Mixing getImageUrl and CharacterPortrait:** All character images should go through CharacterPortrait for consistent sizing, fallback, and border styling
- **Inline style overuse:** Several components use `style={{}}` for theme colors instead of Tailwind classes referencing CSS custom properties. Where Tailwind supports the color (via `@theme`), prefer Tailwind classes
- **Inconsistent mobile breakpoints:** Some pages use `sm:grid-cols-2` while others use different breakpoint patterns. Standardize grid responsive behavior

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Character portraits | Inline `<img>` with `getImageUrl` | `CharacterPortrait` component | Already built with proper fallback, sizing, lazy loading, border styling |
| Button styles | Custom `<button>` with ad-hoc classes | `Button` component | Already has variant system (primary/secondary/ghost) |
| Card containers | Custom divs with repeated border/bg | `Card` component | Already has consistent dark theme styling |
| Mobile navigation | Custom responsive logic | Extend existing Navbar component | Already has hamburger menu pattern |

## Common Pitfalls

### Pitfall 1: Mobile Horizontal Overflow
**What goes wrong:** Fixed-width elements (like 72px portraits in a 3-column grid) overflow on narrow screens
**Why it happens:** Portrait sizes are hardcoded in pixels, grids use fixed column counts
**How to avoid:** Use responsive grid columns (`grid-cols-2 sm:grid-cols-3`), test at 320px viewport width
**Warning signs:** Horizontal scrollbar on mobile, content cut off

### Pitfall 2: Navbar Dropdown Overlap on Mobile
**What goes wrong:** Desktop dropdown menus don't work well on touch devices
**Why it happens:** `onBlur` with setTimeout(150ms) is fragile on mobile
**How to avoid:** The existing mobile menu already uses a separate full-width slide-down pattern. Ensure new nav items follow this existing pattern.
**Warning signs:** Dropdown items are unreachable on mobile

### Pitfall 3: Portrait Component Prop Mismatch
**What goes wrong:** Trying to use CharacterPortrait where only a character name/image_url is available (not full Character object)
**Why it happens:** CharacterPortrait requires a full `Character` object, but some contexts (like UnitSlot) only have partial data
**How to avoid:** For UnitSlot and TeamCard, keep using safeImageUrl directly since they operate on UnitSlotData (not Character). CharacterPortrait adoption should focus on pages that already have full Character objects (Characters.tsx, CharacterDetail.tsx, counter components, admin components).
**Warning signs:** TypeScript errors when passing partial objects as Character

### Pitfall 4: Tailwind 4 @theme Syntax
**What goes wrong:** Using Tailwind 3 config format (`tailwind.config.js`) instead of Tailwind 4's `@theme` directive
**Why it happens:** Documentation confusion between versions
**How to avoid:** The project already uses `@theme` in index.css. All new custom values go there. Colors defined via `--color-*` are usable as `bg-primary`, `text-primary-light`, etc. [VERIFIED: codebase inspection]
**Warning signs:** Tailwind classes not applying, build warnings

## Code Examples

### Adding Counter Lookup to Navbar (verified pattern from existing Navbar.tsx)
```typescript
// Add to navGroups array before 'GVG Attack'
{ label_th: 'ค้นหาเคาน์เตอร์', label_en: 'Counter', path: '/counter' },

// Add Admin at end (could be conditional on auth state later)
{ label_th: 'จัดการ', label_en: 'Admin', path: '/admin' },
```

### Replacing getImageUrl with CharacterPortrait (Characters.tsx)
```typescript
// Before (inconsistent):
<img
  src={getImageUrl(character.image_url || '')}
  alt={character.name_en}
  className="h-48 w-auto object-contain"
  onError={(e) => { e.currentTarget.src = '/images/placeholder.png'; }}
/>

// After (consistent):
<CharacterPortrait
  character={character}
  size="lg"
  showName={false}
/>
```
Note: CharacterPortrait uses `safeImageUrl` internally and has built-in fallback (sword icon), so the `onError` handler and placeholder image become unnecessary.

### Standardized Page Header
```typescript
// Reusable pattern for all pages:
<div className="mb-8">
  <h1
    className="text-2xl font-bold text-white"
    style={{ fontFamily: 'var(--font-display)' }}
  >
    Character Database
  </h1>
  <p className="text-sm text-slate-400 mt-2">
    Browse all Seven Knights characters and their skills
  </p>
  <div
    className="mt-3 h-px"
    style={{ background: 'linear-gradient(to right, var(--color-gold-dim), transparent)' }}
  />
</div>
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| getImageUrl for portraits | CharacterPortrait component | Phase 3 | Characters.tsx and CharacterDetail.tsx still use old approach |
| No counter lookup in nav | Should be primary nav item | Phase 4 added /counter route | Navbar not updated when route was added |
| No admin in nav | Should be in nav | Phase 5 added admin routes | Navbar not updated when routes were added |

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Recommended page container width standardization (7xl for data, 5xl for forms, 3xl for minimal) | Architecture Patterns | Low -- can be adjusted per-page if user prefers different widths |
| A2 | Counter Lookup should be a prominent top-level nav item | Architecture Patterns | Medium -- user may want it nested under a group |
| A3 | Admin link should be visible in nav (currently no auth gate on nav) | Architecture Patterns | Low -- auth is simple password gate, showing link is fine |
| A4 | py-8 as standard vertical padding for all pages | Architecture Patterns | Low -- purely cosmetic preference |

## Open Questions

1. **Should Admin link be visible to all users or hidden?**
   - What we know: Admin currently uses a simple password gate (no Supabase auth)
   - What's unclear: Whether the admin link should always show in nav or be hidden
   - Recommendation: Show it -- password gate handles access control. Members seeing it is fine.

2. **Should UnitSlot be refactored to use CharacterPortrait?**
   - What we know: UnitSlot operates on UnitSlotData (partial data), not full Character objects
   - What's unclear: Whether it's worth the refactoring effort
   - Recommendation: Leave UnitSlot as-is. It already uses safeImageUrl and has its own portrait rendering with stat badges. Refactoring would require changing the data flow.

3. **Should a PageHeader component be extracted?**
   - What we know: Multiple pages repeat the same header pattern (h1 + subtitle + gold divider)
   - What's unclear: Whether to extract a component or just standardize inline
   - Recommendation: Extract a lightweight `PageHeader` component to enforce consistency and reduce duplication.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.2 + @testing-library/react 16.3.2 |
| Config file | vitest.config.ts (or vite.config.ts) |
| Quick run command | `npm test` |
| Full suite command | `npm test` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| UI-01 | Consistent page layout classes | manual | Visual inspection | N/A |
| UI-02 | CharacterPortrait used in Characters page | unit | `npx vitest run src/pages/Characters.test.tsx -x` | No -- Wave 0 |
| UI-03 | Mobile responsive (no horizontal scroll) | manual-only | Requires browser viewport testing | N/A |
| UI-04 | Navbar contains Counter, Admin links | unit | `npx vitest run src/components/layout/Navbar.test.tsx -x` | No -- Wave 0 |

**Manual-only justification for UI-03:** Responsive layout testing requires actual viewport rendering, not feasible with jsdom-based unit tests.

### Sampling Rate
- **Per task commit:** `npm test`
- **Per wave merge:** `npm test`
- **Phase gate:** Full suite green + manual viewport check

### Wave 0 Gaps
- [ ] `src/components/layout/Navbar.test.tsx` -- covers UI-04 (nav links present)
- [ ] No new framework install needed -- Vitest + testing-library already configured

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | N/A -- no auth changes in this phase |
| V3 Session Management | no | N/A |
| V4 Access Control | no | Admin link visibility is cosmetic, not security |
| V5 Input Validation | no | No new inputs added |
| V6 Cryptography | no | N/A |

This phase is purely visual/layout changes with no security surface.

## Sources

### Primary (HIGH confidence)
- Codebase inspection: All findings verified by reading actual source files
  - `src/components/layout/Navbar.tsx` -- confirmed no Counter/Admin links
  - `src/pages/Characters.tsx` -- confirmed uses `getImageUrl` not `CharacterPortrait`
  - `src/index.css` -- confirmed Tailwind 4 @theme config with design tokens
  - `src/components/character-portrait/CharacterPortrait.tsx` -- confirmed component API
  - All page files -- confirmed inconsistent max-w and py values

### Secondary (MEDIUM confidence)
- None needed -- this phase is entirely codebase-internal

### Tertiary (LOW confidence)
- None

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- no new libraries, all already installed
- Architecture: HIGH -- all gaps identified from direct codebase reading
- Pitfalls: HIGH -- based on actual code patterns observed

**Research date:** 2026-04-09
**Valid until:** 2026-05-09 (stable -- no external dependencies)
