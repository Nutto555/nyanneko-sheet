# Testing Patterns

**Analysis Date:** 2026-04-06

## Test Framework

**Runner:**
- Not configured - No test runner installed
- No testing dependency in package.json (no vitest, jest, mocha, etc.)

**Assertion Library:**
- Not applicable - No testing framework in place

**Test Commands:**
- None defined - `package.json` has no test script

## Current Testing Status

**Test Files:**
- No test files found in codebase
- No `*.test.ts`, `*.spec.ts`, `*.test.tsx`, `*.spec.tsx` files present
- Coverage: 0% - Untested codebase

**Test Configuration:**
- No `jest.config.js`, `vitest.config.ts`, or equivalent in project root
- No test configuration in `vite.config.ts`

## Code Subject to Testing

**High-Value Test Areas (Priority Order):**

### 1. Service Layer (Critical Path)
- `src/services/characters.ts` - Character data fetching, filtering by role, fallback logic
- `src/services/teams.ts` - Complex team composition assembly with local fallbacks
- `src/services/admin.ts` - CRUD operations for team/character management
- `src/services/equipment.ts` - Equipment set loading and filtering
- `src/services/pets.ts` - Pet data fetching
- `src/services/rings.ts` - Ring data fetching

**What to test:**
- Supabase API success path (mock @supabase/supabase-js)
- Fallback to local data when Supabase unconfigured or errored
- Filtering operations (getCharactersByRole, getTeamsByCategory)
- CRUD operations (createTeam, updateTeam, deleteTeam, addTeamMember, removeTeamMember)

### 2. Custom Hooks (User Interaction)
- `src/hooks/useCharacters.ts` - Character loading with loading/error state
- `src/hooks/useEquipment.ts` - Equipment set loading
- `src/hooks/usePets.ts` - Pet loading
- `src/hooks/useRings.ts` - Ring loading

**What to test:**
- Loading state lifecycle (initial true → false after fetch)
- Error state capture on fetch failure
- Data loading on component mount
- Slug parameter changes trigger new fetch (useCharacter)

### 3. Utility Functions (Security/Validation)
- `src/lib/supabase.ts` - `safeImageUrl()` function
  - Allow relative paths (/images/...)
  - Allow same-origin Supabase URLs
  - Reject external URLs
  - Handle null/undefined gracefully
  - Handle malformed URLs

- `src/pages/Admin.tsx` - Slug generation logic
  ```typescript
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80);
  ```

### 4. Type System (Data Integrity)
- Database types inference from seed data
- Type compatibility between database.ts and service layer
- Props interface compliance in components

**What to test:**
- Seed data matches Character, TeamComposition interfaces
- TypeScript strict mode catches type errors

### 5. React Components (UI Correctness)
- `src/components/ui/Button.tsx` - Variant/size combinations
- `src/components/team-card/TeamCard.tsx` - Conditional rendering of speed badges, skill order, etc.
- `src/components/unit-slot/UnitSlot.tsx` - Image URL safety validation
- `src/pages/Characters.tsx` - Filtering/search logic, role-based display

## Recommended Testing Approach

### Setup Recommendation

**Framework:** Vitest (lightweight, fast, Vite-integrated)

```bash
npm install -D vitest @vitest/ui happy-dom
```

**Mock Supabase:**

```typescript
// __mocks__/supabase.ts
export const mockSupabaseSelect = vi.fn();
export const supabase = {
  from: vi.fn().mockReturnValue({
    select: mockSupabaseSelect,
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  }),
  storage: {
    from: vi.fn().mockReturnValue({
      getPublicUrl: vi.fn().mockReturnValue({
        data: { publicUrl: 'https://example.com/image.png' }
      })
    })
  }
};
```

### Test File Organization

**Co-located tests:** Place `.test.ts` next to implementation files

```
src/
├── services/
│   ├── characters.ts
│   ├── characters.test.ts      ← Test alongside implementation
│   ├── teams.ts
│   ├── teams.test.ts
│   └── admin.test.ts
├── hooks/
│   ├── useCharacters.ts
│   ├── useCharacters.test.ts
│   └── ...
├── lib/
│   ├── supabase.ts
│   └── supabase.test.ts
└── pages/
    ├── Admin.tsx
    └── Admin.test.tsx
```

### Test Structure Pattern

**Service tests:**

```typescript
// src/services/characters.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as charactersService from './characters';
import { supabase } from '../lib/supabase';

vi.mock('../lib/supabase');

describe('getCharacters', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return characters from Supabase when configured', async () => {
    const mockCharacters = [
      { id: '1', name_en: 'Hero', name_th: 'ฮีโร่', ... }
    ];
    
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: mockCharacters, error: null })
      })
    } as any);

    const result = await charactersService.getCharacters();
    expect(result).toEqual(mockCharacters);
  });

  it('should return local fallback when Supabase not configured', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', '');
    const result = await charactersService.getCharacters();
    expect(result).toBeDefined();
    expect(result.length).toBeGreaterThan(0);
  });

  it('should return local fallback on Supabase error', async () => {
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Network error' }
        })
      })
    } as any);

    const result = await charactersService.getCharacters();
    expect(result).toBeDefined();
    expect(result.length).toBeGreaterThan(0);
  });
});
```

**Hook tests (using @testing-library/react):**

```typescript
// src/hooks/useCharacters.test.ts
import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useCharacters } from './useCharacters';
import * as service from '../services/characters';

vi.mock('../services/characters');

describe('useCharacters', () => {
  it('should initialize with loading=true', () => {
    const { result } = renderHook(() => useCharacters());
    expect(result.current.loading).toBe(true);
  });

  it('should load characters on mount', async () => {
    const mockCharacters = [{ id: '1', name_en: 'Hero', ... }];
    vi.mocked(service.getCharacters).mockResolvedValue(mockCharacters);

    const { result } = renderHook(() => useCharacters());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.characters).toEqual(mockCharacters);
  });

  it('should set error on fetch failure', async () => {
    vi.mocked(service.getCharacters).mockRejectedValue(
      new Error('Fetch failed')
    );

    const { result } = renderHook(() => useCharacters());

    await waitFor(() => expect(result.current.error).not.toBeNull());
    expect(result.current.error).toBe('Fetch failed');
  });
});
```

**Utility function tests:**

```typescript
// src/lib/supabase.test.ts
import { describe, it, expect, vi } from 'vitest';
import { safeImageUrl } from './supabase';

describe('safeImageUrl', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_SUPABASE_URL', 'https://abc123.supabase.co');
  });

  it('should accept relative paths', () => {
    expect(safeImageUrl('/images/icon.png')).toBe('/images/icon.png');
  });

  it('should accept same-origin Supabase URLs', () => {
    const url = 'https://abc123.supabase.co/storage/v1/object/public/char.png';
    expect(safeImageUrl(url)).toBe(url);
  });

  it('should reject external URLs', () => {
    expect(safeImageUrl('https://evil.com/malware.png')).toBeNull();
  });

  it('should handle null/undefined', () => {
    expect(safeImageUrl(null)).toBeNull();
    expect(safeImageUrl(undefined)).toBeNull();
  });

  it('should handle malformed URLs gracefully', () => {
    expect(safeImageUrl('not a url')).toBeNull();
  });
});
```

**Component tests (using @testing-library/react):**

```typescript
// src/components/ui/Button.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Button from './Button';

describe('Button', () => {
  it('renders with primary variant by default', () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toHaveClass('bg-primary');
  });

  it('applies secondary variant', () => {
    render(<Button variant="secondary">Secondary</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-dark-lighter');
  });

  it('handles click events', async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    
    await userEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalled();
  });

  it('applies size variants', () => {
    const { rerender } = render(<Button size="sm">Small</Button>);
    expect(screen.getByRole('button')).toHaveClass('px-3', 'py-1.5');

    rerender(<Button size="lg">Large</Button>);
    expect(screen.getByRole('button')).toHaveClass('px-8', 'py-3');
  });
});
```

## Mocking Strategy

**What to Mock:**
- `@supabase/supabase-js` - All external API calls
- `react-router-dom` - Navigation in isolated component tests
- `import.meta.env` - Environment variables

**What NOT to Mock:**
- React itself
- Custom hooks (test through components or with renderHook)
- TypeScript types (no runtime mocking needed)
- Local seed data

## Coverage Goals

**Minimum Coverage:** 80% across all metrics

**Priority Coverage (in order):**
1. **Statements:** 80%+ - Every line of logic exercised
2. **Branches:** 80%+ - All conditional paths (if/else, ternary)
3. **Functions:** 80%+ - Entry points for each module
4. **Lines:** 80%+ - Physical lines of code

**Critical Coverage (Must be 100%):**
- `src/lib/supabase.ts` - Security function
- `src/services/admin.ts` - CRUD operations
- URL validation in components

## Run Tests

**After setup:**

```bash
npm install -D vitest @testing-library/react @testing-library/user-event happy-dom

# Add to package.json scripts:
"test": "vitest",
"test:ui": "vitest --ui",
"test:coverage": "vitest --coverage"
```

**Commands:**

```bash
npm test                  # Watch mode
npm run test:ui           # Vitest UI dashboard
npm run test:coverage     # Generate coverage report
```

## Integration Tests

**Testing database flows (optional, for critical paths):**

- End-to-end team CRUD in Admin.tsx
- Character search and filtering on Characters.tsx page
- Image URL validation across all pages

Use Playwright or Cypress for E2E tests of user workflows.

---

*Testing analysis: 2026-04-06*
