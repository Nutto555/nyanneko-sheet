# Codebase Structure

**Analysis Date:** 2026-04-06

## Directory Layout

```
nyanneko-sheet/
├── src/
│   ├── components/          # Reusable UI components and layout
│   ├── hooks/               # React hooks for data fetching and state
│   ├── lib/                 # Utilities and client initialization
│   ├── pages/               # Full-page components (route handlers)
│   ├── services/            # Business logic and data access
│   ├── types/               # TypeScript type definitions
│   ├── App.tsx              # Router configuration and root element
│   ├── main.tsx             # Application entry point
│   └── index.css            # Global styles and design tokens
├── scripts/                 # Build and utility scripts
│   ├── seed.ts              # Database seeding script
│   └── seed-data.json       # Local fallback data (characters, teams, etc.)
├── public/                  # Static assets (icons, images)
├── dist/                    # Build output (generated)
├── supabase/                # Supabase configuration and migrations
├── .planning/               # Planning documents (agent output)
├── package.json             # Dependencies and scripts
├── tsconfig.json            # TypeScript root config
├── tsconfig.app.json        # App-specific TypeScript config
├── vite.config.ts           # Vite build configuration
├── eslint.config.js         # ESLint rules
├── vercel.json              # Vercel deployment config
├── Makefile                 # Build and utility commands
└── README.md                # Project documentation
```

## Directory Purposes

**src/:**
- Purpose: Application source code (TypeScript/TSX)
- Contains: Components, pages, services, types, utilities
- Key files: `App.tsx` (routing), `main.tsx` (bootstrap), `index.css` (theme)

**src/components/:**
- Purpose: Reusable UI building blocks and layout structure
- Substructure:
  - `layout/`: Layout wrapper (`Layout.tsx`), navigation (`Navbar.tsx`), footer (`Footer.tsx`)
  - `ui/`: Atomic components — `Badge.tsx`, `Button.tsx`, `Card.tsx`, `StatBadge.tsx`
  - `equip-card/`: Equipment card component for display
  - `team-card/`: Team composition card component (used in GvgMode page)
  - `unit-slot/`: Individual unit slot within a team card
- Pattern: One component per file, self-contained styles via Tailwind classes

**src/hooks/:**
- Purpose: Custom React hooks for data loading and async operations
- Files: One hook per entity — `useCharacters.ts`, `useCharacter(slug)`, `useEquipment.ts`, `usePets.ts`, `useRings.ts`
- Pattern: Each hook exports 1–2 functions (`useEntity()` and `useEntity(id)` variants)
- Return shape: `{ data/entity, loading, error }` standardized across all hooks
- Wiring: Hooks call service functions in useEffect, manage loading/error state

**src/services/:**
- Purpose: Data access layer and business logic
- Files: One service per entity type
  - `characters.ts`: getCharacters, getCharacterBySlug, getCharactersByRole
  - `teams.ts`: getTeamCompositions, getTeamsByCategory, getTeamBySlug
  - `equipment.ts`, `pets.ts`, `rings.ts`: Similar CRUD patterns
  - `updates.ts`: Game update fetching
  - `admin.ts`: Admin operations (create/update/delete teams and members)
- Pattern: Fallback logic in every function — checks `isSupabaseConfigured()`, returns seed data if false
- Typing: Services are async, return Promise<Entity> or Promise<Entity[]>

**src/types/:**
- Purpose: TypeScript type definitions and interfaces
- Files:
  - `database.ts`: Supabase Database interface, entity row types (Character, Pet, Ring, Equipment, Team, etc.), join types with Omit/Partial for Insert/Update
  - `ui.ts`: View-layer types — `BadgeVariant`, `ButtonVariant`, `UnitSlotData`, `TeamCardData`, `GvgModeConfig`
- Pattern: Database types map 1:1 to Supabase tables; UI types for component props
- Notable: Character roles enum-like with ROLE_INFO lookup table in database.ts

**src/lib/:**
- Purpose: Library setup and reusable utilities
- Files:
  - `supabase.ts`: Supabase client creation with Database type parameter, `getImageUrl()` helper for storage paths
- Pattern: Single source of truth for external client initialization

**src/pages/:**
- Purpose: Full-page components for each route
- Key files:
  - `Characters.tsx`: List with role filter and search (calls `useCharacters()`)
  - `CharacterDetail.tsx`: Single character detail view (calls `useCharacter(slug)`)
  - `GvgMode.tsx`: Team builds filtered by category (calls `getTeamsByCategory()`, orchestrates with characters map)
  - `Equip.tsx`, `Equipment.tsx`, `Pets.tsx`, `Rings.tsx`: Similar list/detail patterns
  - `Admin.tsx`: CRUD interface for teams and members (calls admin service functions)
  - `Home.tsx`, `About.tsx`, `Updates.tsx`: Static/info pages
- Pattern: Pages fetch data via hooks or services, render with loading/error states, delegate to components for presentation

**scripts/:**
- Purpose: Build-time and utility scripts
- Files:
  - `seed.ts`: Populates Supabase with data from JSON (run via `npm run seed`)
  - `seed-data.json`: Master data file with characters, skills, teams, equipment, pets, rings, updates
- Usage: `seed-data.json` also imported by services as offline fallback

**public/:**
- Purpose: Static assets served as-is
- Contents: Placeholder images, favicon, game assets
- Access: `/images/placeholder.png` referenced in fallback image handlers

**supabase/:**
- Purpose: Database schema and migrations
- Contents: SQL migration files defining tables, columns, types, relationships

## Key File Locations

**Entry Points:**
- `src/main.tsx`: React root mount point
- `src/App.tsx`: Router configuration and page layout
- `index.html`: HTML template in project root

**Configuration:**
- `package.json`: Dependencies, scripts (dev, build, seed, lint)
- `tsconfig.app.json`: TS compiler options (strict mode, JSX, module resolution)
- `vite.config.ts`: Bundler configuration and plugins
- `eslint.config.js`: Linting rules

**Core Logic:**
- `src/services/`: All async data operations (getCharacters, createTeam, etc.)
- `src/hooks/`: React state and async adapters (useCharacters, useCharacter)
- `src/lib/supabase.ts`: Database client initialization and image URL helper

**Testing:**
- `.planning/`: Planning documents (from agent runs, not code)
- No test files present in codebase (untested)

## Naming Conventions

**Files:**
- Components: PascalCase (e.g., `Characters.tsx`, `CharacterDetail.tsx`, `TeamCard.tsx`)
- Services/Utilities: camelCase (e.g., `characters.ts`, `supabase.ts`)
- Types: camelCase file, PascalCase exports (e.g., `database.ts` exports `type Character`, `interface Database`)
- Pages: PascalCase matching route name (e.g., `GvgMode.tsx` for `/attack`, `/defense/phy`, etc.)

**Directories:**
- Features: kebab-case (e.g., `team-card`, `unit-slot`, `equip-card`)
- Logical grouping: lowercase (e.g., `components`, `services`, `hooks`, `pages`)

**Functions:**
- Services: verb-noun (e.g., `getCharacters()`, `createTeam()`, `deleteTeam()`, `addTeamMember()`)
- Hooks: `use` prefix (e.g., `useCharacters()`, `useCharacter()`, `useEquipment()`)
- Components: Exports default as PascalCase (e.g., `export default function Characters()`)
- Utilities: Descriptive verbs (e.g., `getImageUrl()`, `buildTeamCards()`)

**Variables:**
- State: `[state, setState]` for useState pairs
- Booleans: `is*` or `*ing` prefix (e.g., `isSupabaseConfigured`, `loading`, `editing`)
- Collections: Plural (e.g., `characters`, `teams`, `members`)
- Records/Maps: Lowercase noun (e.g., `charBySlug: Map<string, Character>`)

**Types:**
- Interfaces: PascalCase, descriptive (e.g., `Character`, `TeamWithMembers`, `UnitSlotData`)
- Type aliases: PascalCase, often union (e.g., `CharacterRole`, `BadgeVariant`)
- Enums: Literal unions preferred over `enum` (e.g., `type UpdateCategory = 'patch' | 'developer' | ...`)

## Where to Add New Code

**New Feature (e.g., Skills page listing skills):**

1. **Data**: Add/update entity types in `src/types/database.ts`
2. **Service**: Create `src/services/skills.ts` with `getSkills()`, `getSkillByCharacterId()`, etc.
3. **Hook**: Create `src/hooks/useSkills.ts` exporting `useSkills()`, `useSkillsByCharacter()`
4. **Component**: Create UI components if needed (e.g., `src/components/skill-card/SkillCard.tsx`)
5. **Page**: Create `src/pages/Skills.tsx` calling hooks, rendering components
6. **Route**: Add route in `src/App.tsx`: `<Route path="skills" element={<Skills />} />`

**New Component:**

- Location: `src/components/feature-name/FeatureName.tsx`
- Import in: Parent page or component using it
- Props: Define interface `interface FeatureNameProps { ... }` above component
- Styling: Use Tailwind utility classes; color vars from `index.css` theme (e.g., `var(--color-primary)`)

**New Utility/Helper:**

- Location: `src/lib/` if it's a library wrapper (like supabase.ts), or `src/services/` if it's data-specific
- Naming: Describe what it does (e.g., `parseGearNotes()`, `buildTeamCards()`)
- Export: Named export for testability

**New Service Function:**

- Location: Add to existing `src/services/[entity].ts` or create new if new entity
- Pattern:
  ```typescript
  export async function getMyData(): Promise<MyType[]> {
    if (!isSupabaseConfigured()) return localData;
    const { data, error } = await supabase.from('my_table').select('...');
    if (error) {
      console.error('Error fetching my data:', error);
      return localData;
    }
    return data;
  }
  ```

**New Hook:**

- Location: `src/hooks/use[Entity].ts`
- Pattern:
  ```typescript
  export function use[Entity]() {
    const [entity, setEntity] = useState<MyType | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    useEffect(() => {
      getMyData()
        .then(setEntity)
        .catch((e) => setError(e.message))
        .finally(() => setLoading(false));
    }, []);
    
    return { entity, loading, error };
  }
  ```

## Special Directories

**dist/:**
- Purpose: Build output directory
- Generated: Yes (via `npm run build`)
- Committed: No (in .gitignore)
- Contents: Minified JS/CSS bundle and HTML entry point

**node_modules/:**
- Purpose: Installed dependencies
- Generated: Yes (via `npm install`)
- Committed: No (in .gitignore)
- Lock file: `package-lock.json` tracked for reproducible builds

**supabase/:**
- Purpose: Supabase project configuration and migrations
- Committed: Yes
- Contains: SQL files for creating tables, indexes, functions

**.planning/:**
- Purpose: Agent-generated analysis and planning documents
- Generated: Yes (via GSD commands)
- Committed: Yes (to share context across team)
- Contains: ARCHITECTURE.md, STRUCTURE.md, CONVENTIONS.md, TESTING.md, CONCERNS.md, STACK.md, INTEGRATIONS.md

**scripts/:**
- Purpose: Build and seeding utilities
- Contents: TypeScript scripts run via npm scripts or Makefile
- Key: `seed-data.json` is both a seed source and runtime fallback data

---

*Structure analysis: 2026-04-06*
