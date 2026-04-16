# Phase 6: Frontend UI Polish - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-16
**Phase:** 06-frontend-ui-polish
**Areas discussed:** Portrait adoption scope, Visual polish depth, Page-by-page priority

---

## Portrait Adoption Scope

| Option | Description | Selected |
|--------|-------------|----------|
| Everywhere possible | Characters.tsx, CharacterDetail.tsx, CounterSearch, GvgMode, Admin builders. Full consistency. | ✓ |
| Member-facing pages only | Skip admin pages — admin is a power user who doesn't need polish. | |
| Only UI-SPEC listed pages | Just Characters.tsx and CharacterDetail.tsx as UI-SPEC specifies. | |

**User's choice:** Everywhere possible
**Notes:** None

### Follow-up: UnitSlot Refactor

| Option | Description | Selected |
|--------|-------------|----------|
| Leave UnitSlot as-is | UnitSlot uses UnitSlotData (partial), has stat overlays. Different purpose. | |
| Unify them | Refactor UnitSlot to compose CharacterPortrait internally. | ✓ |

**User's choice:** Unify them — override UI-SPEC anti-pattern #2
**Notes:** UnitSlot keeps stat badge overlays but delegates base portrait rendering to CharacterPortrait

---

## Visual Polish Depth

| Option | Description | Selected |
|--------|-------------|----------|
| Standardize only | Apply UI-SPEC contracts only. No new visual effects. | |
| Standardize + subtle enhancements | UI-SPEC plus card hover effects, loading skeletons, smooth transitions. | ✓ |
| Full visual refresh | All above plus redesigned cards, empty state illustrations, animated transitions. | |

**User's choice:** Standardize + subtle enhancements

### Follow-up: Which Enhancements (multi-select)

| Option | Description | Selected |
|--------|-------------|----------|
| Card hover effects | Subtle border glow or scale on hover. CSS only. | ✓ |
| Loading skeletons | Placeholder shimmer while data loads. | ✓ |
| Smooth page transitions | Fade or slide transitions between routes. | ✓ |
| You decide | Claude picks based on effort and patterns. | |

**User's choice:** All three enhancements selected

### Follow-up: Skeleton Detail Level

| Option | Description | Selected |
|--------|-------------|----------|
| Layout-matching skeletons | Skeleton cards mimicking real card shape. More polished. | ✓ |
| Generic shimmer blocks | Simple rectangular pulse animations. Faster to build. | |

**User's choice:** Layout-matching skeletons

---

## Page-by-page Priority

| Option | Description | Selected |
|--------|-------------|----------|
| Battle-critical first | CounterSearch + Nav first, then Characters, then remaining, Admin last. | ✓ |
| Shared infrastructure first | Build PageHeader + Skeleton components first, then apply everywhere. | |
| All pages equal | No priority, planner decides by dependencies only. | |

**User's choice:** Battle-critical first

### Follow-up: Admin Page Treatment

| Option | Description | Selected |
|--------|-------------|----------|
| Same full treatment | PageHeader, portraits, skeletons, spacing for admin too. | ✓ |
| Lighter polish | Portraits and PageHeader yes, skip skeletons and hover for admin. | |
| Skip admin entirely | Admin pages fine as-is. | |

**User's choice:** Same full treatment for admin pages

---

## Claude's Discretion

- Card hover effect CSS details (glow intensity, scale, duration)
- Loading skeleton implementation approach
- Page transition technique
- Skeleton component granularity
- Common page container extraction

## Deferred Ideas

None — discussion stayed within phase scope
