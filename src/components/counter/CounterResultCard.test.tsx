import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CounterResultCard } from './CounterResultCard';
import type { MatchResult } from '../../utils/strategyMatcher';
import type {
  Character,
  EnemyDefenseTemplateWithMembers,
  CounterStrategyWithConditions,
  EnemyDefenseMember,
} from '../../types/database';

vi.mock('../character-portrait/CharacterPortrait', () => ({
  CharacterPortrait: ({ character }: { character: Character }) => (
    <div data-testid="character-portrait">{character.name_en}</div>
  ),
}));

vi.mock('./StrategyCard', () => ({
  StrategyCard: ({ strategy, rank }: { strategy: CounterStrategyWithConditions; rank: number }) => (
    <div data-testid="strategy-card">Strategy rank {rank}: {strategy.id}</div>
  ),
}));

vi.mock('../ui/Card', () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="card">{children}</div>
  ),
}));

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

function makeMember(overrides: Partial<EnemyDefenseMember & { characters: Character }> = {}): EnemyDefenseMember & { characters: Character } {
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

function makeTemplate(overrides: Partial<EnemyDefenseTemplateWithMembers> = {}): EnemyDefenseTemplateWithMembers {
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
    enemy_defense_members: [
      makeMember({ id: 'm1', character_id: 'c1', position: 1, characters: makeCharacter({ id: 'c1', name_en: 'Lubu' }) }),
      makeMember({ id: 'm2', character_id: 'c2', position: 2, characters: makeCharacter({ id: 'c2', name_en: 'Eileene' }) }),
      makeMember({ id: 'm3', character_id: 'c3', position: 3, characters: makeCharacter({ id: 'c3', name_en: 'Rachel' }) }),
      makeMember({ id: 'm4', character_id: 'c4', position: 4, characters: makeCharacter({ id: 'c4', name_en: 'Kris' }) }),
    ],
    ...overrides,
  };
}

function makeStrategy(overrides: Partial<CounterStrategyWithConditions> = {}): CounterStrategyWithConditions {
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

function makeResult(overrides: Partial<MatchResult> = {}): MatchResult {
  return {
    template: makeTemplate(),
    matchScore: 1,
    matchedCharacterIds: ['c1', 'c2', 'c3', 'c4'],
    strategies: [makeStrategy()],
    ...overrides,
  };
}

describe('CounterResultCard', () => {
  it('renders enemy template name as heading', () => {
    render(<CounterResultCard result={makeResult()} />);

    expect(screen.getByText('Lubu Sustain Core')).toBeInTheDocument();
  });

  it('renders "Exact match" when matchScore is 1', () => {
    render(<CounterResultCard result={makeResult({ matchScore: 1 })} />);

    expect(screen.getByText('Exact match')).toBeInTheDocument();
  });

  it('renders "3/4 matched" format for partial matches', () => {
    const result = makeResult({
      matchScore: 0.75,
      matchedCharacterIds: ['c1', 'c2', 'c3'],
    });

    render(<CounterResultCard result={result} />);

    expect(screen.getByText('3/4 matched')).toBeInTheDocument();
  });

  it('renders one StrategyCard per strategy in the result', () => {
    const strategies = [
      makeStrategy({ id: 'strat-1' }),
      makeStrategy({ id: 'strat-2' }),
      makeStrategy({ id: 'strat-3' }),
    ];
    const result = makeResult({ strategies });

    render(<CounterResultCard result={result} />);

    const cards = screen.getAllByTestId('strategy-card');
    expect(cards).toHaveLength(3);
    expect(screen.getByText('Strategy rank 1: strat-1')).toBeInTheDocument();
    expect(screen.getByText('Strategy rank 2: strat-2')).toBeInTheDocument();
    expect(screen.getByText('Strategy rank 3: strat-3')).toBeInTheDocument();
  });

  it('renders "No counter strategies defined for this matchup" when strategies array is empty', () => {
    const result = makeResult({ strategies: [] });

    render(<CounterResultCard result={result} />);

    expect(screen.getByText('No counter strategies defined for this matchup')).toBeInTheDocument();
  });
});
