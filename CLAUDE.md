<!-- GSD:project-start source:PROJECT.md -->
## Project

**Nyanneko Sheet — Seven Knights Rebirth Strategy Hub**

A guild strategy hub for Seven Knights Rebirth that helps guild members find the right counter team for any enemy defense composition. Admins create conditional counter strategies (decision trees with priority-ordered alternatives), and guild members search or browse to find the right response for each matchup.

**Core Value:** Guild members can look up any enemy defense team and instantly see what counter to use — with the right conditions and fallbacks — so the guild wins more GvG battles.

### Constraints

- **Tech stack**: React + TypeScript + Supabase + Tailwind — already established, continue with same stack
- **Auth**: Supabase auth for admin vs member roles
- **Data**: Character database is the source of truth — strategies reference characters by ID
- **Deployment**: Static frontend (Vite build) with Supabase as backend
- **Solo admin**: Strategy authoring UX must be fast for a single power user
<!-- GSD:project-end -->

## Open Review Findings

Latest full-stack review: **`.planning/reviews/2026-05-20-full-stack-review.md`**

- 2 CRITICAL (admin password in JS bundle; RLS open to anon writes) — block any public deploy
- 10 HIGH, ~15 MEDIUM, ~12 LOW
- Read the review doc before starting any non-trivial change, and remove items as they are fixed.

<!-- GSD:stack-start source:codebase/STACK.md -->
## Technology Stack

## Languages
- TypeScript 5.9.3 - Application code, type-safe development
- JavaScript - Build configuration and utilities
- HTML5 - Document markup (`index.html`)
- SQL - Database schema definitions in Supabase migrations
- Python - Legacy data processing scripts (seed data generation, Excel parsing)
## Runtime
- Node.js (version specified in `.nvmrc` or inferred from package.json tooling)
- npm (npm/node package manager)
- Lockfile: Present (`package-lock.json`)
## Frameworks
- React 19.2.4 - UI framework and component library
- React Router 7.14.0 - Client-side routing
- React DOM 19.2.4 - React rendering to DOM
- Tailwind CSS 4.2.2 - Utility-first CSS framework
- @tailwindcss/vite 4.2.2 - Vite integration for Tailwind
- Vite 8.0.1 - Frontend build tool and dev server
- @vitejs/plugin-react 6.0.1 - React plugin for Vite
- TypeScript Compiler (tsc) - Type checking and compilation
- ESLint 9.39.4 - JavaScript/TypeScript linting
- @eslint/js 9.39.4 - ESLint core
- typescript-eslint 8.57.0 - TypeScript support for ESLint
- eslint-plugin-react-hooks 7.0.1 - React hooks linting
- eslint-plugin-react-refresh 0.5.2 - React Fast Refresh linting
## Key Dependencies
- @supabase/supabase-js 2.101.1 - Supabase client SDK for database, auth, and storage operations
- dotenv 17.4.0 - Environment variable loading for development and seeding
- @types/react 19.2.14 - TypeScript types for React
- @types/react-dom 19.2.3 - TypeScript types for React DOM
- @types/node 24.12.0 - TypeScript types for Node.js APIs (for seeding scripts)
- globals 17.4.0 - Global object type definitions for ESLint
## Configuration
- `.env.local` - Local development configuration (not committed)
- `.env.example` - Template showing required environment variables
- Environment variables: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- `tsconfig.json` - Root TypeScript configuration with references
- `tsconfig.app.json` - Application-specific TypeScript settings (ES2023, strict mode, React JSX)
- `tsconfig.node.json` - Build tool TypeScript settings
- `vite.config.ts` - Vite configuration with React and Tailwind plugins
- `eslint.config.js` - ESLint configuration
- `.gitignore` - Git exclusion patterns
- `Makefile` - Build automation commands (install, dev, build, lint, seed, clean)
## Platform Requirements
- Node.js with npm
- TypeScript 5.9+
- Browser with ES2023+ support
- Vercel (deployed on Vercel platform, configured by `vercel.json`)
- Supabase PostgreSQL database
- Supabase Storage for images (character-images bucket)
- Modern browser with ES2023+ support
- Content-Security-Policy configured to allow Supabase and Google Fonts
- HSTS (Strict-Transport-Security) enabled
- X-Frame-Options set to DENY
- X-Content-Type-Options set to nosniff
- Cache control for immutable assets (images with 1-year expiry)
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

## Naming Patterns
- React components: PascalCase with .tsx extension (`EquipCard.tsx`, `Button.tsx`)
- TypeScript utilities/services: camelCase with .ts extension (`useCharacters.ts`, `characters.ts`)
- Type definition files: singular nouns in .ts (`database.ts`, `ui.ts`)
- Directories: kebab-case when multi-word (`unit-slot/`, `team-card/`, `equip-card/`)
- Exported functions: camelCase (`getCharacters()`, `getCharacterBySlug()`)
- React hooks: camelCase with `use` prefix (`useCharacters`, `useCharacter`)
- Component render functions: PascalCase (`SpeedBadge`, `MemberEditor`)
- Helper functions: camelCase, often prefixed with role or context (`safeImageUrl()`, `isSupabaseConfigured()`)
- React state: camelCase (`characters`, `loading`, `error`, `selectedRole`)
- Constants: SCREAMING_SNAKE_CASE for critical config (`CATEGORIES`, `ROLE_INFO`, `ROLE_ORDER`)
- Local constants in functions: camelCase (`now`, `charBySlug`, `filtered`)
- Boolean checks: prefixed with `is` or `has` (`isSupabaseConfigured`, `isFast`)
- Interfaces: PascalCase, end with descriptive noun (`Character`, `TeamWithMembers`, `UnitSlotData`)
- Type aliases: PascalCase (`BadgeVariant`, `CharacterRole`, `UpdateCategory`)
- Union types: use string literals not enums (`'primary' | 'secondary' | 'accent'`)
- Props interfaces: `{ComponentName}Props` format (`ButtonProps`, `UnitSlotProps`, `TeamCardProps`)
## Code Style
- Prettier: Not explicitly configured, but ESLint indicates common formatting standards
- No explicit .prettierrc file; uses ESLint as primary linter
- Line length: Standard formatting, no hard limit visible
- Indentation: 2 spaces (consistent throughout codebase)
- Quotes: Single quotes for JS/TS, double quotes in JSX attributes
- ESLint with TypeScript support (eslint.config.js)
- Configuration in `eslint.config.js`: Uses flat config
- Enabled plugins: `typescript-eslint`, `react-hooks`, `react-refresh`
- Strict TypeScript config (tsconfig.app.json): `strict: true`
- No unused variables or parameters allowed (`noUnusedLocals`, `noUnusedParameters`)
- Target: ES2023
- Strict mode enabled
- `noUncheckedSideEffectImports` enforced
- `noFallthroughCasesInSwitch` enforced
- Type: Full type annotations on public APIs
## Import Organization
- None configured; all imports use relative paths
- Consistent use of '../' for parent directory navigation
## Error Handling
- Service layer: Log errors with `console.error()` in development, return fallback data
- Conditional logging: `if (import.meta.env.DEV) console.error(...)` to avoid console noise in production
- Error messages: Descriptive context included (`'Error fetching characters:', error`)
- UI layer: Catch errors in try-catch blocks, display user-friendly messages
- Admin forms: Store error state and display below form elements (`[error, setError]`)
- Async operations: Always use `.finally()` to clear loading state
## Logging
- Production: Errors logged only in DEV environment
- Message format: Descriptive action + error object (`'Error fetching {resource}:', error`)
- Location: Service layer handles logging (separation of concerns)
- No logging for successful operations (verbose but not noisy)
## Comments
- Section separators: Used for visual organization in files
- Complex logic: Explain *why*, not what (code reads as what)
- Security decisions: Important context like URL validation
- Type definitions: Document interface purpose with JSDoc-style comments
- Limited usage; not consistently applied
- Used for security-critical functions (`safeImageUrl`)
- Inline comments preferred over block comments for brief explanations
## Function Design
- Typical range: 10-50 lines
- Limit: Keep under 100 lines; extract utilities when approaching limit
- Examples: `getCharacters()` (12 lines), `useCharacter()` (15 lines), `TeamEditor()` (45 lines)
- Simple functions: 2-3 params maximum
- Complex state: Use destructuring for object params
- Props interfaces: Always use named interface type, not inline object type
- Promises: Use `Promise<T>` explicit return types
- React hooks: Return object with clear property names (`{ characters, loading, error }`)
- Falsy handling: Return `null` explicitly for "not found", not `undefined`
## Module Design
- Services: Export functions directly, not class/object wrappers
- Hooks: Export named functions (not default)
- Components: Default export for page components, named export for UI components
- Types: Named exports from `types/database.ts` and `types/ui.ts`
- `src/services/characters.ts`: Named exports `getCharacters()`, `getCharacterBySlug()`
- `src/hooks/useCharacters.ts`: Named exports `useCharacters()`, `useCharacter()`
- `src/components/ui/Button.tsx`: Default export function
- `src/pages/Characters.tsx`: Default export function
- Not used; direct imports from specific files preferred
- All imports use explicit relative paths
## Type Safety
- Strict mode enabled in TypeScript compiler
- Explicit types on all exported functions and public APIs
- Local variable types inferred when obvious
- Database types generated from Supabase schema (see `types/database.ts`)
- UI types separate from database types (see `types/ui.ts`)
- Cast types only when necessary for external data (`data as CharacterWithSkills`)
- Avoid `as unknown` unless converting between unrelated types
- Use type guards for runtime validation in security-critical code
## Immutability
- Spread operator for state updates
- Array methods: `map()`, `filter()`, `concat()` preferred over `push()`, `splice()`
- Never mutate function parameters or state directly
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

## Pattern Overview
- React-based frontend with Router for multi-page navigation
- Service layer abstracts data access (Supabase with local fallback)
- Hook-based data fetching with React state management
- Tailwind CSS with custom design tokens for game UI theming
- Graceful degradation: offline-first with seed data fallback when Supabase unavailable
## Layers
- Purpose: User-facing views and interactive elements
- Location: `src/pages/` (full-page components), `src/components/` (reusable UI)
- Contains: Page containers (`Characters.tsx`, `GvgMode.tsx`, `Admin.tsx`), layout wrappers, UI components (Badge, Button, Card)
- Depends on: Hooks for data, types for prop contracts
- Used by: Router (via App.tsx)
- Purpose: Manage async data loading and component state
- Location: `src/hooks/`
- Contains: Custom hooks that call service functions and expose loading/error/data state
- Examples: `useCharacters()`, `useCharacter(slug)` - follow pattern: `useState` for state, `useEffect` for loading, return `{ data, loading, error }`
- Depends on: Services for data operations, types for return shapes
- Used by: Pages and components that need data
- Purpose: Encapsulate data access patterns and fallback logic
- Location: `src/services/`
- Contains: Functions for CRUD operations (getCharacters, createTeam, deleteTeam, etc.)
- Pattern: Each service checks `isSupabaseConfigured()`, falls back to local seed data if not
- Handles: Remote-local data orchestration, request composition (joins via .select())
- Used by: Hooks, which expose to components
- Purpose: Database connection and storage access
- Location: `src/lib/supabase.ts`
- Contains: Client initialization with typed Database interface, helper for image URLs
- Pattern: `createClient<Database>(url, key)` ensures type safety on queries
- Used by: All service functions
- Purpose: Single source of truth for shape contracts across layers
- Location: `src/types/database.ts` (DB row types), `src/types/ui.ts` (view-layer types)
- Contains: Supabase Database interface, entity types (Character, Team, etc.), join types (CharacterWithSkills, TeamWithMembers)
- Database types use Omit for Insert/Update to exclude system fields (id, created_at)
- UI types separate from DB types (e.g., UnitSlotData vs Character)
## Data Flow
- Distributed per-page/component with React hooks (no Redux/Context needed at this scale)
- Admin panel maintains expanded state via `useState`, edits via local form state, persists via service
- Pages load data on mount (useEffect with empty deps), re-fetch on param change (deps: [slug])
- No client-side caching layer — each hook fresh-fetches on component mount
## Key Abstractions
- Purpose: Encapsulate data access for each entity (characters, teams, equipment, pets, rings, updates)
- Examples: `getCharacters()`, `getTeamsByCategory()`, `addTeamMember()`
- Pattern: `async function(params): Promise<Type | Type[]>` with error handling
- Fallback: All services check `isSupabaseConfigured()` and return seed data on failure
- Purpose: Bridge services (async/promise-based) to React components (state-based)
- Pattern: `export function use[Entity](slug?) { useState, useEffect, return { data, loading, error } }`
- Example: `useCharacter(slug)` fetches one character by slug, skips fetch if slug is empty
- Enables: Decoupled components — pages don't import services directly
- Purpose: Catch column mismatches at compile time
- Implementation: `src/types/database.ts` defines `Database` interface with all tables and row types
- Usage: `createClient<Database>(url, key)` and `.select('*, related_table(...)')` return fully typed
- Benefits: Refactoring safer, IDE autocomplete on Supabase queries
- Purpose: DRY routing and UI labeling for 4 similar pages (attack, defense-phy, defense-mage, defense-tank)
- Implementation: `MODE_CONFIGS` record with title, category, description per mode
- Pattern: `GvgMode` page component receives mode prop, looks up config, fetches teams by category, renders TeamCard
- Benefit: Single component handles all variants with no duplication
## Entry Points
- Location: `src/main.tsx`
- Triggers: Browser load of `index.html`
- Responsibilities: Mounts React root, renders App component
- Location: `src/App.tsx`
- Triggers: Route changes (history/navigation)
- Responsibilities: Maps URL paths to page components, wraps pages in Layout
- Location: `src/components/layout/Layout.tsx`
- Triggers: Every route
- Responsibilities: Renders Navbar, footer, provides <Outlet /> for page content
- Location: `src/pages/`
- Examples: `Characters.tsx`, `GvgMode.tsx`, `Admin.tsx`
- Responsibilities: Fetch data via hooks, manage page-level state, delegate to feature components
## Error Handling
## Cross-Cutting Concerns
- Pattern: `console.error()` in service functions on Supabase failures
- DEV-only: `if (import.meta.env.DEV) console.error(...)` in teams service
- Goal: Server logs for debugging, silent fallback to seed data for users
- Form inputs in Admin validated at submission (trim, length checks)
- Slug generation: `name.toLowerCase().replace(/[^a-z0-9]+/g, '-')`
- Character ID and position required in team member operations
- Enum-like types (CharacterRole, UpdateCategory) prevent invalid values
- Not implemented — app is read-only for most users, admin panel also unauthenticated
- Supabase client uses anonymous key (`VITE_SUPABASE_ANON_KEY`)
- Future: Can add RLS policies and auth checks to services if needed
- Characters, pets, rings, equipment have name_en and name_th fields
- Pages display both: `<h3>{character.name_en}</h3> <p>{character.name_th}</p>`
- Types track language: `name_th` often nullable (optional translation)
- No i18n library used — translations embedded in data
<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->
## Project Skills

No project skills found. Add skills to any of: `.claude/skills/`, `.agents/skills/`, `.cursor/skills/`, or `.github/skills/` with a `SKILL.md` index file.
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->



<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
