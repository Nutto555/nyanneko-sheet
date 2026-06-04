---
review_date: 2026-05-20
scope: full-stack (frontend + backend + tests)
branch: dev (post Phase 6 UI polish, uncommitted)
reviewers: typescript-reviewer, code-reviewer, general-purpose (test audit)
verification:
  build: pass
  tests: 109/109 pass
  lint: 3 pre-existing errors + 1 warning (unrelated to Phase 6)
status: open — remediation not started
---

# Full-Stack Review — 2026-05-20

Performed after Phase 6 UI polish landed (16 files modified). Three parallel review agents covered frontend, backend, and tests. This is the canonical punch list for the next session.

---

## 🔴 CRITICAL — block any public deploy (2)

### C1 — Admin password is shipped in the JS bundle
**File:** `src/hooks/useAdminAuth.ts:14`

`VITE_ADMIN_PASSWORD` uses the `VITE_` prefix, which means Vite inlines it into the production bundle. Anyone can open DevTools → Sources, search for the string, and read it. They can also set the `sessionStorage` auth flag manually to bypass the check entirely.

**Fix:** Replace with Supabase Auth (email/password sign-in). Remove `VITE_ADMIN_PASSWORD` and all references. Gate admin pages on `supabase.auth.getUser()`.

### C2 — RLS grants `anon` full write access to every table
**Files:** `supabase/migrations/006_open_writes.sql`, `supabase/migrations/007_counter_strategies.sql:110-113`

Every table has `FOR ALL TO anon USING (true) WITH CHECK (true)`. The anonymous Supabase key is public (embedded in the frontend bundle as `VITE_SUPABASE_ANON_KEY`). Any visitor can use `curl` or the Supabase JS SDK to INSERT/UPDATE/DELETE any row in any table — no authentication needed.

**Fix:** Restrict write policies to `auth.role() = 'authenticated'`. Keep SELECT open to `anon`. This requires C1 (real auth) to be in place first.

> **C1 and C2 chain together.** Currently any browser visitor can wipe the guild database. This is a hard blocker for going public.

---

## 🟠 HIGH (10)

### Frontend

| ID | File:Line | Issue | Fix |
|---|---|---|---|
| H1 | `src/main.tsx:6` | `document.getElementById('root')!` — non-null assertion will throw a confusing error if absent | Guard explicitly: `if (!root) throw new Error('Root element #root not found')` |
| H2 | `src/pages/GvgMode.tsx:205` | `teams.map((team, i) => <TeamCard key={i} ...>)` — index keys on reorderable list cause mis-reconciliation | Use `team.title` or a stable id |
| H3 | `src/pages/Admin.tsx:228-232` | `refresh()` catch is silent no-op comment; admin has no feedback on failure | Surface error in state, render to user |
| H4 | `src/pages/AdminStrategies.tsx:82-84`, `AdminTemplates.tsx:73` | `handleDelete`/`handleReorder` async with no try/catch; rejections silently swallowed | Wrap in try/catch, surface error to user via state |
| H5 | `src/components/unit-slot/UnitSlot.tsx:13-25` | Builds a fake `Character` via `as Character` to satisfy `CharacterPortrait` props; type lie that breaks if portrait ever reads other fields | Widen `CharacterPortrait` to accept `Pick<Character, 'name_en' \| 'image_url'>` or a dedicated `PortraitInput` type |

### Backend

| ID | File:Line | Issue | Fix |
|---|---|---|---|
| H6 | `src/services/admin.ts:15-20, 53-59` | `updateCharacter`/`updateTeam` accept arbitrary `Partial<>` with no Zod validation; uses `as never` cast | Add Zod schemas like `src/schemas/strategies.ts` does |
| H7 | `src/services/strategies.ts:46`, `src/services/teams.ts:169` | `.single()` on slug lookup throws `PGRST116` on miss; error handler silently returns `null`, masking real errors | Use `.maybeSingle()` |
| H8 | `src/services/strategies.ts:220-233` | `reorderStrategies` fires N independent UPDATEs via `Promise.all`; partial failure leaves inconsistent priority state | Wrap in a Postgres RPC for atomicity |
| H9 | `src/services/strategies.ts:171-190` (`replaceStrategyConditions`), `192-218` (`replaceTemplateMembers`) | DELETE commits immediately, INSERT can fail → permanent data loss | Wrap in a Postgres RPC / transaction |
| H10 | `src/services/characters.ts:48, 66, 84` | `console.error(...)` not gated by `import.meta.env.DEV`; leaks query internals to prod console | Add the `if (import.meta.env.DEV)` guard the rest of the codebase uses |

---

## 🟡 MEDIUM

### Tests (high-leverage gaps)
- `@vitest/coverage-v8` is not installed → cannot enforce the 80% coverage rule. Install + configure `coverage: { provider: 'v8', thresholds: { lines: 80 } }` in `vitest.config.ts`.
- **Zero tests** for: `src/services/strategies.ts` (233 lines, all admin write paths), `src/services/admin.ts`, `src/schemas/strategies.ts` (Zod boundary validation), `src/lib/supabase.ts`.
- 12 of 13 pages untested — only `CounterSearch` has one (thin smoke test).
- `src/hooks/useCounterSearch.test.ts:23-25` — mocks `resolveMatchingStrategies`, so the integration between hook and matcher is never exercised. Add an integration test that wires real matcher + real hook.
- `src/hooks/useAdminStrategies.test.ts:127-166` — one `it` bundles 5 mutation tests; split for localization.
- Missing dedicated unit test for slug generation (the `name.toLowerCase().replace(/[^a-z0-9]+/g, '-')` pattern CLAUDE.md references).
- Test setup duplication: `vitest.config.ts` points to `./src/test/setup.ts`, but `src/test-setup.ts` (sibling) also exists — likely dead, delete one.

### Backend
- `src/services/admin.ts:25-33` `getAllTeams` — unbounded SELECT; will silently hit Supabase's 1000-row cap as teams grow. Add `.limit(500)` or pagination.
- `src/services/updates.ts:41` `getGvgUpdates` — same unbounded issue (note: `getUpdates` correctly caps at 100).
- `src/hooks/useAdminAuth.ts:15` — empty `VITE_ADMIN_PASSWORD` silently disables admin (`return false`). Fail loudly instead — render an obvious warning.
- `createTemplateSchema` doesn't validate slug format with a regex; slug is used in `.eq('slug', ...)` lookups.

### Frontend
- `src/pages/Home.tsx:119-126` — imperative hover via `onMouseEnter`/`onMouseLeave` mutating styles. Replace with Tailwind `group-hover:` utilities.
- `src/pages/Updates.tsx` + `src/pages/GvgMode.tsx` — bespoke headers (icon + Thai subtitle + gold divider) duplicate the `PageHeader` pattern. Extend `PageHeader` with optional `icon` and `subtitleTh` props instead of hand-rolling.
- `src/pages/CharacterDetail.tsx` — text spinner ("Loading character details…") instead of `SkeletonCard`. Inconsistent with sibling pages.
- `src/pages/Pets.tsx:74` and `src/pages/Rings.tsx:71` — `src={`/images/${item.image_url}`}` has no truthy guard; empty `image_url` becomes `/images/` (silent 404). Add a guard.
- `src/components/layout/Navbar.tsx:69` — `onBlur={() => setTimeout(() => setOpenDropdown(null), 150)}` is a timing hack; breaks keyboard accessibility. Use `onMouseLeave` + focus-within.
- `src/pages/CounterSearch.tsx:8` — `React.JSX.Element` return-type annotation with no React import. Use `JSX.Element` from `'react'` or omit (inferred).

---

## 🟢 LOW (count only)

~12 items. Examples:
- `roleColors` duplicated identically between `Characters.tsx` and `CharacterDetail.tsx`.
- `src/pages/Admin.tsx` imports `Link` from `react-router`, while `Navbar.tsx`/`Layout.tsx` import from `react-router-dom`. Pick one.
- `isSupabaseConfigured()` re-implemented in every service file — extract to `src/lib/supabase.ts`.
- `as never` casts in `src/services/admin.ts` should be replaced with proper typed Insert/Update types from `src/types/database.ts`.
- `src/pages/GvgMode.tsx` `mode: string` should be a union of the four valid mode strings.
- `Skeleton` component locally re-defined in `Updates.tsx` duplicates `SkeletonCard`.
- Magic hex/rgba literals scattered across `Home.tsx`, `Updates.tsx`, `GvgMode.tsx` — promote to CSS custom properties.

---

## ✅ Positives (keep doing)

- `CharacterPortrait` consistently adopted across the codebase after Phase 6 — the spec anti-pattern of raw `<img>` + `getImageUrl` is gone wherever a portrait fits.
- Cancellation flag (`let cancelled = false`) pattern used correctly in `GvgMode`, `Equip`, `Updates`, and `useCounterSearch` — mature async hygiene.
- `isSafeUrl` guard in `Updates.tsx` protects against `javascript:`/data-URI abuse on external links.
- `strategyMatcher.test.ts` is a model test file — use as template for the missing service/schema tests.
- All `src/services/strategies.ts` write paths go through Zod schemas before touching Supabase.
- Migration 007 includes a composite `(template_id, priority)` index well-tuned for the counter lookup query.

---

## Recommended remediation order

1. **C1 + C2** — Supabase Auth + RLS lock-down. One coordinated change; unblocks public deploy.
2. **HIGH backend** — H7 (`.maybeSingle()`), H10 (DEV-gate logs), H6 (Zod for admin writes), H8/H9 (transactions via RPC).
3. **HIGH frontend** — H3/H4 (error surfacing), H5 (UnitSlot type lie), H2 (GvgMode reorder key), H1 (root guard).
4. **Test infra** — install `@vitest/coverage-v8`, write tests for `strategies.ts` + Zod schemas. Use `strategyMatcher.test.ts` as the pattern.
5. **MEDIUM frontend** — extend `PageHeader`, swap CharacterDetail spinner for Skeleton, guard image URLs, fix Navbar dropdown a11y.
6. **LOW** — opportunistic cleanup pass.

---

## Next session resume

Pick item from the top of the remediation order. C1+C2 are coupled and should be one branch. Everything else can be independent PRs.
