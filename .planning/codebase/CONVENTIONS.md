# Coding Conventions

**Analysis Date:** 2026-04-06

## Naming Patterns

**Files:**
- React components: PascalCase with .tsx extension (`EquipCard.tsx`, `Button.tsx`)
- TypeScript utilities/services: camelCase with .ts extension (`useCharacters.ts`, `characters.ts`)
- Type definition files: singular nouns in .ts (`database.ts`, `ui.ts`)
- Directories: kebab-case when multi-word (`unit-slot/`, `team-card/`, `equip-card/`)

**Functions:**
- Exported functions: camelCase (`getCharacters()`, `getCharacterBySlug()`)
- React hooks: camelCase with `use` prefix (`useCharacters`, `useCharacter`)
- Component render functions: PascalCase (`SpeedBadge`, `MemberEditor`)
- Helper functions: camelCase, often prefixed with role or context (`safeImageUrl()`, `isSupabaseConfigured()`)

**Variables:**
- React state: camelCase (`characters`, `loading`, `error`, `selectedRole`)
- Constants: SCREAMING_SNAKE_CASE for critical config (`CATEGORIES`, `ROLE_INFO`, `ROLE_ORDER`)
- Local constants in functions: camelCase (`now`, `charBySlug`, `filtered`)
- Boolean checks: prefixed with `is` or `has` (`isSupabaseConfigured`, `isFast`)

**Types:**
- Interfaces: PascalCase, end with descriptive noun (`Character`, `TeamWithMembers`, `UnitSlotData`)
- Type aliases: PascalCase (`BadgeVariant`, `CharacterRole`, `UpdateCategory`)
- Union types: use string literals not enums (`'primary' | 'secondary' | 'accent'`)
- Props interfaces: `{ComponentName}Props` format (`ButtonProps`, `UnitSlotProps`, `TeamCardProps`)

## Code Style

**Formatting:**
- Prettier: Not explicitly configured, but ESLint indicates common formatting standards
- No explicit .prettierrc file; uses ESLint as primary linter
- Line length: Standard formatting, no hard limit visible
- Indentation: 2 spaces (consistent throughout codebase)
- Quotes: Single quotes for JS/TS, double quotes in JSX attributes

**Linting:**
- ESLint with TypeScript support (eslint.config.js)
- Configuration in `eslint.config.js`: Uses flat config
- Enabled plugins: `typescript-eslint`, `react-hooks`, `react-refresh`
- Strict TypeScript config (tsconfig.app.json): `strict: true`
- No unused variables or parameters allowed (`noUnusedLocals`, `noUnusedParameters`)

**TypeScript Strictness:**
- Target: ES2023
- Strict mode enabled
- `noUncheckedSideEffectImports` enforced
- `noFallthroughCasesInSwitch` enforced
- Type: Full type annotations on public APIs

## Import Organization

**Order:**
1. External library imports (React, react-router-dom, @supabase)
2. Relative imports from lib/ utilities
3. Relative imports from types/ (database.ts, ui.ts)
4. Relative imports from services/ and hooks/
5. Relative imports from components/

Example from `useCharacters.ts`:
```typescript
import { useState, useEffect } from 'react';
import type { Character, CharacterWithSkills } from '../types/database';
import { getCharacters, getCharacterBySlug } from '../services/characters';
```

**Path Aliases:**
- None configured; all imports use relative paths
- Consistent use of '../' for parent directory navigation

## Error Handling

**Patterns:**
- Service layer: Log errors with `console.error()` in development, return fallback data
- Conditional logging: `if (import.meta.env.DEV) console.error(...)` to avoid console noise in production
- Error messages: Descriptive context included (`'Error fetching characters:', error`)
- UI layer: Catch errors in try-catch blocks, display user-friendly messages
- Admin forms: Store error state and display below form elements (`[error, setError]`)
- Async operations: Always use `.finally()` to clear loading state

Example from `characters.ts`:
```typescript
const { data, error } = await supabase
  .from('characters')
  .select('*')
  .order('name_en');

if (error) {
  console.error('Error fetching characters:', error);
  return localCharacters;
}
return data;
```

Example from `Admin.tsx`:
```typescript
try {
  const [t, c] = await Promise.all([getAllTeams(), getAllCharacters()]);
  setTeams(t);
  setCharacters(c);
} catch {
  // data may not be available yet
} finally {
  setLoading(false);
}
```

## Logging

**Framework:** `console.error()` only; no logger library installed

**Patterns:**
- Production: Errors logged only in DEV environment
- Message format: Descriptive action + error object (`'Error fetching {resource}:', error`)
- Location: Service layer handles logging (separation of concerns)
- No logging for successful operations (verbose but not noisy)

Example from `teams.ts`:
```typescript
if (error) {
  if (import.meta.env.DEV) console.error('Error fetching teams:', error);
  return localTeams;
}
```

## Comments

**When to Comment:**
- Section separators: Used for visual organization in files
  - `// ─── Characters ──────────────────────────────────────────────────────────────`
- Complex logic: Explain *why*, not what (code reads as what)
- Security decisions: Important context like URL validation
  - `// Allow only relative paths and same-origin Supabase URLs as image src.`
- Type definitions: Document interface purpose with JSDoc-style comments

**JSDoc/TSDoc:**
- Limited usage; not consistently applied
- Used for security-critical functions (`safeImageUrl`)
- Inline comments preferred over block comments for brief explanations

Example from `UnitSlot.tsx`:
```typescript
/** Allow only relative paths and same-origin Supabase URLs as image src. */
function safeImageUrl(url: string | null | undefined): string | null {
```

## Function Design

**Size:** 
- Typical range: 10-50 lines
- Limit: Keep under 100 lines; extract utilities when approaching limit
- Examples: `getCharacters()` (12 lines), `useCharacter()` (15 lines), `TeamEditor()` (45 lines)

**Parameters:**
- Simple functions: 2-3 params maximum
- Complex state: Use destructuring for object params
- Props interfaces: Always use named interface type, not inline object type

Example from `Admin.tsx`:
```typescript
function TeamEditor({
  team,
  onSave,
  onDelete,
  onCancel,
}: {
  team: TeamWithMembers | null;
  onSave: () => void;
  onDelete?: () => void;
  onCancel: () => void;
}) {
```

**Return Values:**
- Promises: Use `Promise<T>` explicit return types
- React hooks: Return object with clear property names (`{ characters, loading, error }`)
- Falsy handling: Return `null` explicitly for "not found", not `undefined`

Example from `characters.ts`:
```typescript
export async function getCharacterBySlug(slug: string): Promise<CharacterWithSkills | null> {
  // ...
  return localCharactersWithSkills.find((c) => c.slug === slug) || null;
}
```

## Module Design

**Exports:**
- Services: Export functions directly, not class/object wrappers
- Hooks: Export named functions (not default)
- Components: Default export for page components, named export for UI components
- Types: Named exports from `types/database.ts` and `types/ui.ts`

Examples:
- `src/services/characters.ts`: Named exports `getCharacters()`, `getCharacterBySlug()`
- `src/hooks/useCharacters.ts`: Named exports `useCharacters()`, `useCharacter()`
- `src/components/ui/Button.tsx`: Default export function
- `src/pages/Characters.tsx`: Default export function

**Barrel Files:**
- Not used; direct imports from specific files preferred
- All imports use explicit relative paths

## Type Safety

**Approach:**
- Strict mode enabled in TypeScript compiler
- Explicit types on all exported functions and public APIs
- Local variable types inferred when obvious
- Database types generated from Supabase schema (see `types/database.ts`)
- UI types separate from database types (see `types/ui.ts`)

**Type Assertion Patterns:**
- Cast types only when necessary for external data (`data as CharacterWithSkills`)
- Avoid `as unknown` unless converting between unrelated types
- Use type guards for runtime validation in security-critical code

Example from `UnitSlot.tsx`:
```typescript
function safeImageUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    // Type-safe URL validation
  } catch { /* invalid URL */ }
  return null;
}
```

## Immutability

**Pattern:**
- Spread operator for state updates
- Array methods: `map()`, `filter()`, `concat()` preferred over `push()`, `splice()`
- Never mutate function parameters or state directly

Example from `Admin.tsx`:
```typescript
const members = [...(team.team_members || [])].sort((a, b) => a.position - b.position);
```

Example from `teams.ts`:
```typescript
const localTeams: TeamWithMembers[] = [...teamBuilds, ...legacyTeams];
```

---

*Convention analysis: 2026-04-06*
