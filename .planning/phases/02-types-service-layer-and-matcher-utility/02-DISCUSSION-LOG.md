# Phase 2: Types, Service Layer, and Matcher Utility - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-06
**Phase:** 02-types-service-layer-and-matcher-utility
**Areas discussed:** Service scope, Matcher algorithm, Zod validation, Testing setup

---

## Service Scope

### Q1: Write operations scope

| Option | Description | Selected |
|--------|-------------|----------|
| Reads + Writes (Recommended) | Include full CRUD now so Phase 5 just wires up the UI. Follows admin.ts pattern. | ✓ |
| Reads only | Only read functions. Write operations added in Phase 5. | |
| Reads + write stubs | Implement reads, export write signatures with TODO bodies. | |

**User's choice:** Reads + Writes
**Notes:** None

### Q2: Offline fallback pattern

| Option | Description | Selected |
|--------|-------------|----------|
| No fallback (Recommended) | Per D-08, strategies require Supabase. Return empty arrays. | ✓ |
| Keep fallback pattern | Match characters.ts with local seed data. | |
| Graceful error only | No seed data but return empty results with DEV warning. | |

**User's choice:** No fallback
**Notes:** None

### Q3: File organization

| Option | Description | Selected |
|--------|-------------|----------|
| Single file (Recommended) | All strategy CRUD in strategies.ts. Counter-strategy is a distinct domain. | ✓ |
| Split read/write | Reads in strategies.ts, writes in admin.ts or admin-strategies.ts. | |

**User's choice:** Single file
**Notes:** None

---

## Matcher Algorithm

### Q4: Partial matching approach

| Option | Description | Selected |
|--------|-------------|----------|
| Character overlap ratio (Recommended) | Score = matched enemy characters ÷ template members. | ✓ |
| Weighted by conditions | Score considers condition satisfaction too. | |
| Exact match only | Only show fully matching templates. | |

**User's choice:** Character overlap ratio
**Notes:** None

### Q5: Minimum match threshold

| Option | Description | Selected |
|--------|-------------|----------|
| Show all, ranked (Recommended) | Display all templates sorted by score. UI handles display. | ✓ |
| Minimum 50% overlap | Only show templates with ≥50% match. | |
| Configurable threshold | Default 0% but allow a parameter. | |

**User's choice:** Show all, ranked
**Notes:** None

### Q6: Tiebreaker

| Option | Description | Selected |
|--------|-------------|----------|
| Template sort_order (Recommended) | Admin-controlled sort_order from enemy_defense_templates. | ✓ |
| Template size (fewer members first) | Smaller templates rank higher on ties. | |
| You decide | Claude picks during implementation. | |

**User's choice:** Template sort_order
**Notes:** None

### Q7: Condition filtering

| Option | Description | Selected |
|--------|-------------|----------|
| Filter strategies (Recommended) | evaluateStrategy() returns true/false. Only matching strategies show. | ✓ |
| Annotate, don't filter | Show all with met/unmet annotations. | |
| Filter with fallback | Filter first, relax if nothing passes. | |

**User's choice:** Filter strategies
**Notes:** None

---

## Zod Validation

### Q8: Payload scope

| Option | Description | Selected |
|--------|-------------|----------|
| Write payloads only (Recommended) | Schemas for create/update operations. Search inputs too simple for Zod. | ✓ |
| All payloads | Zod for writes AND search inputs. | |
| Skip Zod for now | Defer to Phase 5. TypeScript types sufficient. | |

**User's choice:** Write payloads only
**Notes:** None

### Q9: Schema file location

| Option | Description | Selected |
|--------|-------------|----------|
| Dedicated schemas file (Recommended) | New src/schemas/strategies.ts. Clean separation. | ✓ |
| Co-located in service | Schemas in strategies.ts service file. | |
| In types directory | Add to src/types/ alongside database.ts. | |

**User's choice:** Dedicated schemas file
**Notes:** None

---

## Testing Setup

### Q10: Test framework

| Option | Description | Selected |
|--------|-------------|----------|
| Vitest (Recommended) | Native Vite integration, Jest-compatible API. | ✓ |
| Jest | Popular but requires separate config. | |
| You decide | Claude picks during implementation. | |

**User's choice:** Vitest
**Notes:** None

### Q11: Test scope

| Option | Description | Selected |
|--------|-------------|----------|
| Matcher only (Recommended) | Pure function tests, no mocking. Service tests deferred. | ✓ |
| Matcher + service layer | Mock Supabase client for service tests too. | |
| Matcher + Zod schemas | Test matcher and validation schemas. | |

**User's choice:** Matcher only
**Notes:** None

---

## Claude's Discretion

- Exact function signatures and return types for service CRUD operations
- Database interface additions structure
- Vitest configuration details
- Internal helper functions within the matcher

## Deferred Ideas

None — discussion stayed within phase scope
