import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import CounterSearch from './CounterSearch';
import type { Character, EnemyDefenseTemplateWithMembers } from '../types/database';
import type { MatchResult } from '../utils/strategyMatcher';

vi.mock('../hooks/useCounterSearch', () => ({
  useCounterSearch: vi.fn(),
}));

vi.mock('../components/character-multi-select/CharacterMultiSelect', () => ({
  CharacterMultiSelect: ({ placeholder }: { placeholder?: string }) => (
    <div data-testid="character-multi-select">{placeholder}</div>
  ),
}));

vi.mock('../components/counter/EnemyTemplateGrid', () => ({
  EnemyTemplateGrid: () => <div data-testid="enemy-template-grid" />,
}));

vi.mock('../components/counter/CounterResultCard', () => ({
  CounterResultCard: ({ result }: { result: MatchResult }) => (
    <div data-testid="counter-result-card">{result.template.name_en}</div>
  ),
}));

import { useCounterSearch } from '../hooks/useCounterSearch';

function makeDefaultReturn(overrides: Partial<ReturnType<typeof useCounterSearch>> = {}): ReturnType<typeof useCounterSearch> {
  return {
    characters: [] as Character[],
    selectedEnemies: [] as Character[],
    setSelectedEnemies: vi.fn(),
    results: [] as MatchResult[],
    templates: [] as EnemyDefenseTemplateWithMembers[],
    loading: false,
    error: null,
    ...overrides,
  };
}

describe('CounterSearch', () => {
  it('renders page title "Counter Lookup"', () => {
    vi.mocked(useCounterSearch).mockReturnValue(makeDefaultReturn());

    render(<CounterSearch />);

    expect(screen.getByText('Counter Lookup')).toBeInTheDocument();
  });

  it('renders "Select enemy characters..." placeholder', () => {
    vi.mocked(useCounterSearch).mockReturnValue(makeDefaultReturn());

    render(<CounterSearch />);

    expect(screen.getByText('Select enemy characters...')).toBeInTheDocument();
  });

  it('renders loading skeleton when loading is true', () => {
    vi.mocked(useCounterSearch).mockReturnValue(makeDefaultReturn({ loading: true }));

    render(<CounterSearch />);

    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('renders error message when error is set', () => {
    vi.mocked(useCounterSearch).mockReturnValue(
      makeDefaultReturn({ error: 'Network error' }),
    );

    render(<CounterSearch />);

    expect(
      screen.getByText('Failed to load counter data. Check your connection and refresh the page.'),
    ).toBeInTheDocument();
  });
});
