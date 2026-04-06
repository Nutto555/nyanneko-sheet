# Codebase Concerns

**Analysis Date:** 2026-04-06

## Tech Debt

**Inconsistent Error Handling Strategy:**
- Issue: Error handling varies significantly between files. Some use `console.error` with `if (import.meta.env.DEV)`, others throw errors, others silently return fallback data.
- Files: `src/services/characters.ts`, `src/services/equipment.ts`, `src/services/pets.ts`, `src/services/rings.ts`, `src/services/updates.ts`, `src/services/admin.ts`
- Impact: Unpredictable behavior when services fail. Some failures are logged only in dev, others throw and bubble up. Difficult to implement consistent error reporting or monitoring.
- Fix approach: Standardize on a single error handling pattern. Create an error handling utility that consistently logs to a service (console in dev, external logger in prod) and either throws or returns fallback data based on error severity.

**Unsafe Type Assertions:**
- Issue: Multiple instances of `as unknown as Type` and `as Record<string, unknown>` casting that bypass type safety.
- Files: `src/services/admin.ts` (lines 12, 32, 50), `src/services/teams.ts` (line 69), `src/pages/GvgMode.tsx` (line 66, 158)
- Impact: Type safety guarantees bypassed. Bugs could occur if data structure doesn't match assumption. Changes to database schema won't be caught at compile time.
- Fix approach: Implement proper Zod schema validation instead of casting. Validate data shape at service boundaries before type assertions.

**Inline JSON Parsing Without Schema Validation:**
- Issue: JSON parsing in `gear_notes` field uses manual type guards (`typeof x === 'string'`) instead of schema validation. Silent fallback to string if JSON parse fails.
- Files: `src/pages/GvgMode.tsx` (lines 73-85), `src/components/team-card/TeamCard.tsx` (similar pattern)
- Impact: Malformed JSON silently falls back to string representation. No validation of expected fields. Could cause rendering issues if data structure changes.
- Fix approach: Use Zod schemas to validate `gear_notes` structure. Create a helper function for safe JSON parsing with schema validation.

**No Input Validation Before Database Operations:**
- Issue: Admin panel functions (`createTeam`, `addTeamMember`) accept user input without validation. Slug generation is done inline without validation.
- Files: `src/pages/Admin.tsx` (line 43), `src/services/admin.ts`
- Impact: Invalid data could be written to database. No constraints on string length, format, or required fields. Team name slugs could be empty or invalid.
- Fix approach: Add Zod schemas for all input DTOs. Validate in component before calling service functions. Return validation errors to UI.

**Missing Zod Schema Library Despite Type Checking Need:**
- Issue: Project has `@supabase/supabase-js` but no input validation library. Type safety relies on TypeScript alone, not runtime validation.
- Files: All service files
- Impact: Type checks only work at compile time. Runtime data from database or user input has no shape validation. Database changes could break code silently.
- Fix approach: Add Zod as dependency. Create schemas for all major data types (Character, Team, GameUpdate, etc.). Validate at service boundaries.

## Known Bugs

**URL Validation Too Permissive:**
- Symptoms: Both `http://` and `https://` URLs are accepted without domain validation. Non-https external URLs could be rendered in iframe-like contexts or trusted contexts.
- Files: `src/pages/Updates.tsx` (line 13-14)
- Trigger: Admin adds update with `http://` URL instead of `https://`
- Workaround: Document that only https URLs should be used
- Fix approach: Tighten validation to only allow `https://` URLs. Add whitelist of trusted domains if needed.

**Team Member Fallback Character Data Incomplete:**
- Symptoms: When character not found in map, fallback shows character with `name_en: m.slug` and empty `name_th`, could appear as broken in UI.
- Files: `src/services/teams.ts` (lines 93-105)
- Trigger: Database record deleted but still referenced in team_members table
- Workaround: Ensure referential integrity at database level
- Fix approach: Create explicit "unknown character" component or handle missing references more gracefully. Add database constraint to prevent orphaned references.

**Local Fallback Data Could Diverge from Database:**
- Symptoms: Seed data in `src/types/seed-data.json` is replicated in memory for offline fallback. If database is updated but seed data isn't, users see stale data.
- Files: `src/services/characters.ts`, `src/services/teams.ts`
- Trigger: Admin updates character in Supabase but doesn't update seed-data.json. Offline or fallback mode shows old data.
- Workaround: Keep seed data and database in sync manually
- Fix approach: Remove in-memory seed fallback or create a process to auto-generate seed files from database on deploy.

**Character.role Can Be Null But Code Assumes It Won't:**
- Symptoms: Type allows `role: CharacterRole | null`, but components and filters may break if null.
- Files: `src/types/database.ts` (line 92), `src/services/characters.ts` (line 15), `src/pages/Characters.tsx` (filtering by role)
- Trigger: Character added without role field
- Workaround: Ensure all characters have a role
- Fix approach: Make role required in database schema and types. Or handle null explicitly in all filtering code.

## Security Considerations

**Environment Variable Fallback Without Validation:**
- Risk: If `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are missing, empty strings are used as fallback. Supabase client created with empty credentials could silently fail or behave unexpectedly.
- Files: `src/lib/supabase.ts` (lines 4-5)
- Current mitigation: Checks in services for `isSupabaseConfigured()` before querying
- Recommendations: (1) Throw error at startup if required env vars missing. (2) Use environment validation library (zod/valibot) to ensure config at startup.

**Admin Panel Has No Authentication:**
- Risk: Anyone with access to `/admin` route can modify all teams, members, and team compositions. No role-based access control or user authentication check.
- Files: `src/pages/Admin.tsx`, `src/services/admin.ts`
- Current mitigation: Route not advertised in navigation; relies on "security through obscurity"
- Recommendations: (1) Add Supabase RLS (Row-Level Security) policies on team_compositions and team_members tables. (2) Require authentication via `supabase.auth`. (3) Implement role-based access control.

**Unsafe URL Handling in Multiple Places:**
- Risk: `isSafeUrl()` function only checks protocol (`http://` or `https://`), doesn't validate domain. Could allow redirects to phishing or malicious sites.
- Files: `src/pages/Updates.tsx` (line 13-14), similar pattern in `src/components/equip-card/EquipCard.tsx` (line 13)
- Current mitigation: External links open in new tab with `target="_blank" rel="noopener noreferrer"`
- Recommendations: (1) Validate against whitelist of trusted domains (Netmarble forums, etc.). (2) Use URL parsing to validate domain before rendering.

**Gear Notes JSON Not Escaped When Displayed:**
- Risk: Gear notes stored as JSON string. If malicious JSON is stored (e.g., containing script tags in notes field), and later parsed and rendered without sanitization, could cause XSS.
- Files: `src/pages/GvgMode.tsx` (lines 73-85), `src/components/team-card/TeamCard.tsx`
- Current mitigation: Content appears to be text-only, not rendered as HTML
- Recommendations: Sanitize any user-entered strings before storage. Use DOMPurify if rendering any HTML.

**Admin Service Functions Throw Unhandled Errors:**
- Risk: Admin page catches errors in local handlers but service functions throw raw Supabase errors containing potentially sensitive information (error codes, SQL details).
- Files: `src/services/admin.ts` (all functions throw `new Error(error.message)`)
- Current mitigation: Component catches and displays error message to user
- Recommendations: Wrap admin operations in try-catch. Log full error server-side only. Return sanitized error messages to UI.

## Performance Bottlenecks

**N+1 Query Problem in Team Rendering:**
- Problem: Each team's members are fetched with nested character data. If rendering 20 teams, this is 20+ nested queries. No pagination or lazy loading.
- Files: `src/services/teams.ts` (line 132), `src/pages/GvgMode.tsx` (line 61-97 builds cards from pre-fetched data)
- Cause: Select with nested `team_members(*, characters(*))` loads all teams and their members on every page view. No filtering at query level.
- Improvement path: (1) Add pagination. (2) Lazy load team members only when expanded. (3) Query only characters needed for current view. (4) Cache results.

**Full Character List Loaded on Every Characters Page Visit:**
- Problem: `getCharacters()` fetches all 90+ characters even if viewing a single role.
- Files: `src/pages/Characters.tsx`, `src/services/characters.ts` (line 44-45)
- Cause: No filtering in query. All characters loaded into memory and filtered in React.
- Improvement path: (1) Query only characters matching selected role. (2) Implement pagination. (3) Cache results with SWR or React Query.

**GameUpdate Service Fetches All Updates Without Pagination:**
- Problem: `getUpdates()` loads entire update table without limit. Could cause memory issues as updates grow.
- Files: `src/services/updates.ts`, `src/pages/Updates.tsx`
- Cause: No LIMIT or pagination in Supabase query.
- Improvement path: (1) Add limit to query (e.g., last 50 updates). (2) Implement infinite scroll or pagination. (3) Cache and invalidate on new updates.

**Image URLs Processed on Every Render:**
- Problem: `safeImageUrl()` in EquipCard and UnitSlot creates new URL() object on every render, even if URL hasn't changed.
- Files: `src/components/equip-card/EquipCard.tsx` (line 35), `src/components/unit-slot/UnitSlot.tsx` (similar)
- Cause: No memoization or caching of processed URLs.
- Improvement path: Memoize URL processing results or move to service layer.

## Fragile Areas

**Admin Panel Tight Coupling to Supabase Schema:**
- Files: `src/pages/Admin.tsx`, `src/services/admin.ts`
- Why fragile: Component assumes specific database schema (team_compositions table, team_members table, etc.). Any database refactoring breaks the panel. Type casting bypasses type safety.
- Safe modification: (1) Extract admin logic into separate service layer. (2) Use Zod schemas to validate data shape. (3) Add tests for admin operations. (4) Use database migrations and track schema versions.
- Test coverage: Admin.tsx has 334 lines but zero tests. No coverage for save, delete, or member operations.

**Seed Data Synchronization:**
- Files: `src/services/characters.ts`, `src/services/teams.ts`, `scripts/seed-data.json`
- Why fragile: Two sources of truth (seed data and Supabase). When one is updated, the other easily becomes stale. Offline fallback could show outdated information.
- Safe modification: (1) Generate seed-data.json from database on deploy. (2) Version seed data with database migrations. (3) Add check to ensure seed data matches current database schema.
- Test coverage: No tests for seed data consistency.

**Gear Notes Format Undocumented:**
- Files: `src/pages/Admin.tsx` (line 195), `src/pages/GvgMode.tsx` (lines 73-85), `src/components/team-card/TeamCard.tsx`
- Why fragile: Gear notes can be JSON or plain string. Parser assumes specific JSON structure but falls back silently. No schema validation. If format changes or user enters wrong format, parsing fails silently.
- Safe modification: (1) Create Zod schema for gear_notes structure. (2) Document format in Admin UI. (3) Add validation and error messages. (4) Provide form builder instead of free text input.
- Test coverage: No tests for gear_notes parsing.

**Character Image Handling Multi-Layered:**
- Files: `src/lib/supabase.ts` (getImageUrl), `src/components/equip-card/EquipCard.tsx` (safeImageUrl), `src/components/unit-slot/UnitSlot.tsx` (similar)
- Why fragile: Image URL validation and processing scattered across multiple files with different logic. Placeholder handling inconsistent. No single source of truth for image URL processing.
- Safe modification: (1) Centralize all image URL processing in service. (2) Create ImageUrl type with validation. (3) Test all paths (local, relative, Supabase, external).
- Test coverage: No tests for image URL handling.

## Scaling Limits

**Seed Data Loaded Into Memory at Module Load:**
- Current capacity: 90+ characters, multiple teams — all loaded into memory on app startup
- Limit: As seed data grows (characters > 500, teams > 100), initial page load and memory usage increases. No streaming or lazy loading.
- Scaling path: (1) Load seed data on demand. (2) Move to separate API endpoint. (3) Use service workers for caching. (4) Reduce seed data to essential information only.

**Single Supabase Client Instance:**
- Current capacity: Single authenticated client shared across app
- Limit: If concurrent requests increase significantly, single client could become bottleneck. No connection pooling.
- Scaling path: (1) Use Supabase connection pooling. (2) Implement request queuing. (3) Add caching layer (Redis).

**No Caching or Request Deduplication:**
- Current capacity: Each fetch is a direct Supabase query
- Limit: Repeated requests for same data create unnecessary database load. No SWR or React Query deduplication.
- Scaling path: (1) Implement SWR or React Query for automatic deduplication. (2) Add browser caching headers. (3) Implement Redis cache layer. (4) Use ISR (Incremental Static Regeneration) if migrating to Next.js.

## Dependencies at Risk

**React Router v7 Recently Released:**
- Risk: Latest major version (7.14.0) has limited production track record. Could have breaking bugs.
- Impact: Router behavior changes, navigation bugs, or API breaking changes in patch releases.
- Migration plan: Lock to v7 minor version (e.g., `^7.14.0`). Monitor releases. Consider reverting to v6 if v7 has issues.

**Tailwind CSS v4 Major Version:**
- Risk: New major version (4.2.2) has different configuration and utility API. Less battle-tested than v3.
- Impact: Style regressions, utility conflicts, JIT compilation issues.
- Migration plan: Test thoroughly. Keep v3 as fallback. Document any custom configuration.

**No Testing Framework Installed:**
- Risk: Zero test coverage. No testing infrastructure. Adding tests would require installing vitest/jest, configuring, and rewriting code to be testable.
- Impact: All changes are untested. Regressions go unnoticed. Refactoring is risky.
- Migration plan: Install vitest. Add tests for critical paths (admin operations, team filtering). Require tests for new features.

## Missing Critical Features

**No Real-Time Updates:**
- Problem: Data is fetched once on page load. Updates to Supabase are not reflected until manual refresh. Admin edits are not propagated to other users viewing same data.
- Blocks: Collaborative editing, live data dashboard, team composition changes visible to all players immediately.
- Improvement path: Implement Supabase realtime subscription. Use React Query or SWR for automatic updates. Add websocket listener for admin changes.

**No Offline Capability:**
- Problem: App requires constant internet. If connection drops, app becomes non-functional.
- Blocks: Use on unstable networks. Offline viewing of previously fetched data.
- Improvement path: Implement service worker caching. Use IndexedDB for offline storage. Sync changes when connection restored.

**No Error Monitoring or Analytics:**
- Problem: When service calls fail, errors are only logged to console or silent fallback. No tracking of error frequency or impact.
- Blocks: Detecting server issues, understanding user impact, alerting on widespread problems.
- Improvement path: Integrate Sentry or similar error tracking. Add analytics for API failures. Create dashboard for monitoring.

## Test Coverage Gaps

**Admin Panel — 100% Untested:**
- What's not tested: Team creation, editing, deletion. Member addition/removal. Form validation. Error handling.
- Files: `src/pages/Admin.tsx` (334 lines), `src/services/admin.ts` (97 lines)
- Risk: Critical business logic (team management) has zero coverage. Refactoring could silently break admin operations. Edge cases (empty names, duplicate slugs) not handled.
- Priority: HIGH — Admin panel is used to populate data. Bugs here affect entire application.

**Service Functions — No Unit Tests:**
- What's not tested: Supabase error handling. Fallback to seed data. Data transformation (slug generation, JSON parsing).
- Files: All `src/services/*.ts` files
- Risk: Service layer has complex logic (conditional fallbacks, data parsing, Supabase integration) with zero coverage. Changes to schema or error handling could break silently.
- Priority: HIGH — Services are core to application.

**Component Rendering — No E2E Tests:**
- What's not tested: Character detail page, GvG mode team rendering, equipment guide.
- Files: All pages and components
- Risk: UI changes could break layout or functionality without being caught. Critical user flows (viewing team builds, filtering by role) untested.
- Priority: MEDIUM — Can be caught by manual testing, but E2E tests would prevent regressions.

**Type Safety — Gaps in Type Coverage:**
- What's not tested: Null/undefined handling in character role, team member fallbacks, missing images. Optional fields accessed without null checks.
- Files: All files with optional fields
- Risk: Runtime errors when accessing properties of null/undefined. Type errors only caught if strict null checking used.
- Priority: MEDIUM — Enable `strictNullChecks` in tsconfig and fix type errors.

---

*Concerns audit: 2026-04-06*
