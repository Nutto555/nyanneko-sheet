# Architecture

**Analysis Date:** 2026-04-06

## Pattern Overview

**Overall:** Layered Client-Side Application with Progressive Enhancement

**Key Characteristics:**
- React-based frontend with Router for multi-page navigation
- Service layer abstracts data access (Supabase with local fallback)
- Hook-based data fetching with React state management
- Tailwind CSS with custom design tokens for game UI theming
- Graceful degradation: offline-first with seed data fallback when Supabase unavailable

## Layers

**Presentation (Pages & Components):**
- Purpose: User-facing views and interactive elements
- Location: `src/pages/` (full-page components), `src/components/` (reusable UI)
- Contains: Page containers (`Characters.tsx`, `GvgMode.tsx`, `Admin.tsx`), layout wrappers, UI components (Badge, Button, Card)
- Depends on: Hooks for data, types for prop contracts
- Used by: Router (via App.tsx)

**State & Data Fetching (Hooks):**
- Purpose: Manage async data loading and component state
- Location: `src/hooks/`
- Contains: Custom hooks that call service functions and expose loading/error/data state
- Examples: `useCharacters()`, `useCharacter(slug)` - follow pattern: `useState` for state, `useEffect` for loading, return `{ data, loading, error }`
- Depends on: Services for data operations, types for return shapes
- Used by: Pages and components that need data

**Business Logic (Services):**
- Purpose: Encapsulate data access patterns and fallback logic
- Location: `src/services/`
- Contains: Functions for CRUD operations (getCharacters, createTeam, deleteTeam, etc.)
- Pattern: Each service checks `isSupabaseConfigured()`, falls back to local seed data if not
- Handles: Remote-local data orchestration, request composition (joins via .select())
- Used by: Hooks, which expose to components

**Data Access (Supabase Client):**
- Purpose: Database connection and storage access
- Location: `src/lib/supabase.ts`
- Contains: Client initialization with typed Database interface, helper for image URLs
- Pattern: `createClient<Database>(url, key)` ensures type safety on queries
- Used by: All service functions

**Type Definitions:**
- Purpose: Single source of truth for shape contracts across layers
- Location: `src/types/database.ts` (DB row types), `src/types/ui.ts` (view-layer types)
- Contains: Supabase Database interface, entity types (Character, Team, etc.), join types (CharacterWithSkills, TeamWithMembers)
- Database types use Omit for Insert/Update to exclude system fields (id, created_at)
- UI types separate from DB types (e.g., UnitSlotData vs Character)

## Data Flow

**Read Flow (Characters page example):**

1. `Characters` page component renders, calls `useCharacters()` hook
2. Hook's `useEffect` triggers on mount, calls `getCharacters()` service
3. Service checks Supabase config:
   - If configured: queries `characters` table, returns results
   - If not configured: returns local seed data from `scripts/seed-data.json`
4. Hook updates state: `setCharacters(data)`, `setLoading(false)`
5. Component re-renders with fresh data, displays in grid with role filters

**Write Flow (Admin panel - create team):**

1. User submits team form in Admin page
2. Component calls `createTeam()` service with form data
3. Service calls `supabase.from('team_compositions').insert(data).select().single()`
4. Response error is thrown and caught in Admin component's try-catch
5. On success, Admin calls `refresh()` to refetch all teams
6. Component state updates: `setTeams(updated)`, users see new team in list

**State Management:**
- Distributed per-page/component with React hooks (no Redux/Context needed at this scale)
- Admin panel maintains expanded state via `useState`, edits via local form state, persists via service
- Pages load data on mount (useEffect with empty deps), re-fetch on param change (deps: [slug])
- No client-side caching layer — each hook fresh-fetches on component mount

## Key Abstractions

**Service Functions as Repository Pattern:**
- Purpose: Encapsulate data access for each entity (characters, teams, equipment, pets, rings, updates)
- Examples: `getCharacters()`, `getTeamsByCategory()`, `addTeamMember()`
- Pattern: `async function(params): Promise<Type | Type[]>` with error handling
- Fallback: All services check `isSupabaseConfigured()` and return seed data on failure

**Hooks as Data Adapters:**
- Purpose: Bridge services (async/promise-based) to React components (state-based)
- Pattern: `export function use[Entity](slug?) { useState, useEffect, return { data, loading, error } }`
- Example: `useCharacter(slug)` fetches one character by slug, skips fetch if slug is empty
- Enables: Decoupled components — pages don't import services directly

**Type-Safe Database Schema:**
- Purpose: Catch column mismatches at compile time
- Implementation: `src/types/database.ts` defines `Database` interface with all tables and row types
- Usage: `createClient<Database>(url, key)` and `.select('*, related_table(...)')` return fully typed
- Benefits: Refactoring safer, IDE autocomplete on Supabase queries

**GVG Mode Configuration:**
- Purpose: DRY routing and UI labeling for 4 similar pages (attack, defense-phy, defense-mage, defense-tank)
- Implementation: `MODE_CONFIGS` record with title, category, description per mode
- Pattern: `GvgMode` page component receives mode prop, looks up config, fetches teams by category, renders TeamCard
- Benefit: Single component handles all variants with no duplication

## Entry Points

**Application Root:**
- Location: `src/main.tsx`
- Triggers: Browser load of `index.html`
- Responsibilities: Mounts React root, renders App component

**Router Config:**
- Location: `src/App.tsx`
- Triggers: Route changes (history/navigation)
- Responsibilities: Maps URL paths to page components, wraps pages in Layout

**Layout Wrapper:**
- Location: `src/components/layout/Layout.tsx`
- Triggers: Every route
- Responsibilities: Renders Navbar, footer, provides <Outlet /> for page content

**Page Components:**
- Location: `src/pages/`
- Examples: `Characters.tsx`, `GvgMode.tsx`, `Admin.tsx`
- Responsibilities: Fetch data via hooks, manage page-level state, delegate to feature components

## Error Handling

**Strategy:** Try-catch in services with fallback; graceful UI states in components

**Patterns:**

1. **Service-level errors:**
   - Services console.error and return fallback (seed data) on Supabase failures
   - Admin panel catches and shows error message in UI: `if (error) setError(err.message)`
   - Pattern: `try { await operation } catch (err) { setError(...) }`

2. **Component-level states:**
   - All data-fetching hooks expose `{ data, loading, error }`
   - Pages check `if (loading)` → show skeleton/loading text
   - Pages check `if (error)` → show error message
   - Example: `GvgMode.tsx` shows red alert box on fetch error

3. **Type safety:**
   - Supabase queries typed via Database interface
   - `as never` casts used when inserting (forced by Supabase client typing)
   - Components validate prop existence before rendering (e.g., `char?.image_url`)

## Cross-Cutting Concerns

**Logging:**
- Pattern: `console.error()` in service functions on Supabase failures
- DEV-only: `if (import.meta.env.DEV) console.error(...)` in teams service
- Goal: Server logs for debugging, silent fallback to seed data for users

**Validation:**
- Form inputs in Admin validated at submission (trim, length checks)
- Slug generation: `name.toLowerCase().replace(/[^a-z0-9]+/g, '-')`
- Character ID and position required in team member operations
- Enum-like types (CharacterRole, UpdateCategory) prevent invalid values

**Authentication:**
- Not implemented — app is read-only for most users, admin panel also unauthenticated
- Supabase client uses anonymous key (`VITE_SUPABASE_ANON_KEY`)
- Future: Can add RLS policies and auth checks to services if needed

**Multilingual Support:**
- Characters, pets, rings, equipment have name_en and name_th fields
- Pages display both: `<h3>{character.name_en}</h3> <p>{character.name_th}</p>`
- Types track language: `name_th` often nullable (optional translation)
- No i18n library used — translations embedded in data

---

*Architecture analysis: 2026-04-06*
