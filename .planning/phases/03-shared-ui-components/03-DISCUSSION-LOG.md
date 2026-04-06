# Phase 3: Shared UI Components - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-06
**Phase:** 03-shared-ui-components
**Areas discussed:** Multi-select design, Portrait display, Component API, Styling approach

---

## Multi-select Design

### Q1: Input UX pattern

| Option | Description | Selected |
|--------|-------------|----------|
| Combobox with portrait chips (Recommended) | Type to search, dropdown with portraits. Selected as removable chips. | ✓ |
| Search dropdown only | Type to search, selected listed separately in grid. | |
| Grid picker | Scrollable portrait grid, click to toggle. | |

**User's choice:** Combobox with portrait chips

### Q2: Search language

| Option | Description | Selected |
|--------|-------------|----------|
| Both EN and TH (Recommended) | Fuse.js searches name_en and name_th. | ✓ |
| English only | Simpler config. | |

**User's choice:** Both EN and TH

---

## Portrait Display

### Q3: Component approach

| Option | Description | Selected |
|--------|-------------|----------|
| New CharacterPortrait (Recommended) | Dedicated component with size variants. | ✓ |
| Extend UnitSlot | Add compact mode to existing component. | |
| You decide | Claude picks. | |

**User's choice:** New CharacterPortrait

### Q4: Portrait sizes

| Option | Description | Selected |
|--------|-------------|----------|
| Three sizes (Recommended) | sm (32px), md (48px), lg (72px). | ✓ |
| Two sizes | sm (32px), lg (72px). | |
| Single size | One size everywhere. | |

**User's choice:** Three sizes

---

## Component API

### Q5: Controlled vs uncontrolled

| Option | Description | Selected |
|--------|-------------|----------|
| Controlled (Recommended) | Parent passes selectedCharacters + onChange. | ✓ |
| Uncontrolled with ref | Component manages own state. | |
| You decide | Claude picks. | |

**User's choice:** Controlled

### Q6: Max selection limit

| Option | Description | Selected |
|--------|-------------|----------|
| Configurable via prop (Recommended) | maxSelections prop, default unlimited. | ✓ |
| Fixed at 6 | Hard limit everywhere. | |
| No limit | Always unlimited. | |

**User's choice:** Configurable via prop

---

## Styling Approach

### Q7: Theme integration

| Option | Description | Selected |
|--------|-------------|----------|
| Use existing CSS variables (Recommended) | Leverage design tokens from index.css. | ✓ |
| Custom theme for strategy UI | New CSS variables. | |
| You decide | Claude picks. | |

**User's choice:** Use existing CSS variables

### Q8: Animations

| Option | Description | Selected |
|--------|-------------|----------|
| Subtle transitions (Recommended) | Fade/slide with CSS transitions only. | ✓ |
| No animations | Instant show/hide. | |
| You decide | Claude picks. | |

**User's choice:** Subtle transitions

---

## Claude's Discretion

- Fuse.js configuration (threshold, keys, weights)
- Headless UI Combobox implementation details
- Dropdown positioning and max height
- Portrait fallback icon/placeholder
- Keyboard navigation

## Deferred Ideas

None
