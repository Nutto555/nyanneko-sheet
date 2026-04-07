import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useCounterSearch } from './useCounterSearch';
import type {
  Character,
  EnemyDefenseTemplateWithMembers,
  CounterStrategyWithConditions,
  EnemyDefenseMember,
} from '../types/database';
import type { MatchResult } from '../utils/strategyMatcher';

// ─── Mocks ─────────────────────────────────────────────────────

vi.mock('../services/characters', () => ({
  getCharacters: vi.fn(),
}));

vi.mock('../services/strategies', () => ({
  getEnemyTemplates: vi.fn(),
  getAllActiveStrategies: vi.fn(),
}));

vi.mock('../utils/strategyMatcher', () => ({
  resolveMatchingStrategies: vi.fn(),
}));

import { getCharacters } from '../services/characters';
import { getEnemyTemplates, getAllActiveStrategies } from '../services/strategies';
import { resolveMatchingStrategies } from '../utils/strategyMatcher';

// ─── Helpers ───────────────────────────────────────────────────

function makeCharacter(overrides: Partial<Character> = {}): Character {
  return {
    id: 'char-1',
    name_en: 'Lubu',
    name_th: 'ลิโป้',
    slug: 'lubu',
    role: 'commander',
    type: null,
    image_url: null,
    thumbnail_url: null,
    notes: null,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

function makeMember(
  overrides: Partial<EnemyDefenseMember & { characters: Character }> = {},
): EnemyDefenseMember & { characters: Character } {
  return {
    id: 'member-1',
    template_id: 'tmpl-1',
    character_id: 'char-1',
    position: 1,
    created_at: '2026-01-01T00:00:00Z',
    characters: makeCharacter(),
    ...overrides,
  };
}

function makeTemplate(
  overrides: Partial<EnemyDefenseTemplateWithMembers> = {},
): EnemyDefenseTemplateWithMembers {
  return {
    id: 'tmpl-1',
    name_en: 'Lubu Sustain Core',
    name_th: null,
    slug: 'lubu-sustain-core',
    description: null,
    is_featured: false,
    sort_order: 0,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    enemy_defense_members: [makeMember()],
    ...overrides,
  };
}

function makeStrategy(
  overrides: Partial<CounterStrategyWithConditions> = {},
): CounterStrategyWithConditions {
  return {
    id: 'strat-1',
    template_id: 'tmpl-1',
    counter_team_id: 'team-1',
    priority: 0,
    condition_note: null,
    strategy_notes: null,
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    strategy_conditions: [],
    team_compositions: null,
    ...overrides,
  };
}

// ─── Tests ─────────────────────────────────────────────────────

describe('useCounterSearch', () => {
  const mockCharacters = [makeCharacter({ id: 'c1', name_en: 'Lubu' }), makeCharacter({ id: 'c2', name_en: 'Eileene' })];
  const mockTemplates = [makeTemplate({ id: 'tmpl-1' })];
  const mockStrategies = [makeStrategy({ id: 'strat-1' })];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getCharacters).mockResolvedValue(mockCharacters);
    vi.mocked(getEnemyTemplates).mockResolvedValue(mockTemplates);
    vi.mocked(getAllActiveStrategies).mockResolvedValue(mockStrategies);
    vi.mocked(resolveMatchingStrategies).mockReturnValue([]);
  });

  it('returns the expected shape: characters, selectedEnemies, setSelectedEnemies, results, templates, loading, error', async () => {
    const { result } = renderHook(() => useCounterSearch());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current).toEqual(
      expect.objectContaining({
        characters: expect.any(Array),
        selectedEnemies: expect.any(Array),
        setSelectedEnemies: expect.any(Function),
        results: expect.any(Array),
        templates: expect.any(Array),
        loading: false,
        error: null,
      }),
    );
  });

  it('returns empty results when selectedEnemies is empty', async () => {
    const { result } = renderHook(() => useCounterSearch());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.results).toEqual([]);
    expect(resolveMatchingStrategies).not.toHaveBeenCalled();
  });

  it('returns MatchResult[] when selectedEnemies has characters', async () => {
    const mockResults: MatchResult[] = [
      {
        template: makeTemplate(),
        matchScore: 1,
        matchedCharacterIds: ['c1'],
        strategies: [makeStrategy()],
      },
    ];
    vi.mocked(resolveMatchingStrategies).mockReturnValue(mockResults);

    const { result } = renderHook(() => useCounterSearch());

    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.setSelectedEnemies([makeCharacter({ id: 'c1' })]);
    });

    expect(resolveMatchingStrategies).toHaveBeenCalledWith(
      mockTemplates,
      mockStrategies,
      ['c1'],
    );
    expect(result.current.results).toEqual(mockResults);
  });
});
