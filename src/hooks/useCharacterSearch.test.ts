import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import type { Character } from '../types/database';

// Mock characters for testing
const mockCharacters: Character[] = [
  {
    id: '1',
    name_en: 'Lubu',
    name_th: 'ลิโป้',
    slug: 'lubu',
    role: 'commander',
    type: 'attack',
    image_url: null,
    thumbnail_url: null,
    notes: null,
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  },
  {
    id: '2',
    name_en: 'Shane',
    name_th: 'เชน',
    slug: 'shane',
    role: 'hunter',
    type: 'attack',
    image_url: null,
    thumbnail_url: null,
    notes: null,
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  },
  {
    id: '3',
    name_en: 'Rachel',
    name_th: 'ราเชล',
    slug: 'rachel',
    role: 'holy_knight',
    type: 'defense',
    image_url: null,
    thumbnail_url: null,
    notes: null,
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  },
  {
    id: '4',
    name_en: 'Luminous',
    name_th: 'ลูมินัส',
    slug: 'luminous',
    role: 'shaman',
    type: 'support',
    image_url: null,
    thumbnail_url: null,
    notes: null,
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  },
];

describe('useCharacterSearch', () => {
  it('search("lu") returns characters whose name_en contains "lu"', async () => {
    const { useCharacterSearch } = await import('./useCharacterSearch');
    const { result } = renderHook(() => useCharacterSearch(mockCharacters));

    const results = result.current.search('lu');
    const names = results.map((c) => c.name_en);

    expect(names).toContain('Lubu');
    expect(names).toContain('Luminous');
  });

  it('search with Thai text returns characters whose name_th matches', async () => {
    const { useCharacterSearch } = await import('./useCharacterSearch');
    const { result } = renderHook(() => useCharacterSearch(mockCharacters));

    const results = result.current.search('ลิโป้');
    const names = results.map((c) => c.name_en);

    expect(names).toContain('Lubu');
  });

  it('search("") returns the full character list', async () => {
    const { useCharacterSearch } = await import('./useCharacterSearch');
    const { result } = renderHook(() => useCharacterSearch(mockCharacters));

    const results = result.current.search('');

    expect(results).toHaveLength(mockCharacters.length);
  });

  it('search("zzzzz") returns empty array', async () => {
    const { useCharacterSearch } = await import('./useCharacterSearch');
    const { result } = renderHook(() => useCharacterSearch(mockCharacters));

    const results = result.current.search('zzzzz');

    expect(results).toHaveLength(0);
  });

  it('Fuse instance is memoized across different queries', async () => {
    const { useCharacterSearch } = await import('./useCharacterSearch');

    // Render the hook and capture the search function reference
    const { result, rerender } = renderHook(() => useCharacterSearch(mockCharacters));

    const searchRef1 = result.current.search;
    result.current.search('a');
    result.current.search('b');

    // Re-render with same characters — search function reference should be stable
    rerender();
    const searchRef2 = result.current.search;

    // useCallback with stable useMemo dep means the function reference is the same
    expect(searchRef1).toBe(searchRef2);
  });

  it('results are sorted by match relevance (best match first)', async () => {
    const { useCharacterSearch } = await import('./useCharacterSearch');
    const { result } = renderHook(() => useCharacterSearch(mockCharacters));

    // "lubu" should rank Lubu higher than Luminous (exact substring vs partial)
    const results = result.current.search('lubu');

    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results[0].name_en).toBe('Lubu');
  });
});
