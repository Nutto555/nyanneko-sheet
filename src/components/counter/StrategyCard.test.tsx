import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { StrategyCard } from './StrategyCard';
import type { CounterStrategyWithConditions, Character, StrategyCondition } from '../../types/database';

vi.mock('../character-portrait/CharacterPortrait', () => ({
  CharacterPortrait: ({ character }: { character: Character }) => (
    <div data-testid="character-portrait">{character.name_en}</div>
  ),
}));

vi.mock('./ConditionBadges', () => ({
  ConditionBadges: ({ conditions }: { conditions: unknown[] }) => (
    <div data-testid="condition-badges">{conditions.length} conditions</div>
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
    updated_at: '2026-03-15T10:30:00Z',
    strategy_conditions: [],
    team_compositions: null,
    ...overrides,
  };
}

describe('StrategyCard', () => {
  it('renders priority number badge with "Priority {n}" text', () => {
    render(<StrategyCard strategy={makeStrategy()} rank={1} />);

    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('Priority 1')).toBeInTheDocument();
  });

  it('renders strategy_notes text when present', () => {
    const strategy = makeStrategy({ strategy_notes: 'Use this against sustain comps' });

    render(<StrategyCard strategy={strategy} rank={1} />);

    expect(screen.getByText('Use this against sustain comps')).toBeInTheDocument();
  });

  it('renders condition_note text when present', () => {
    const strategy = makeStrategy({ condition_note: 'Only viable post-patch 3.2' });

    render(<StrategyCard strategy={strategy} rank={1} />);

    expect(screen.getByText('Only viable post-patch 3.2')).toBeInTheDocument();
  });

  it('renders "Last updated" with formatted updated_at date', () => {
    const strategy = makeStrategy({ updated_at: '2026-03-15T10:30:00Z' });

    render(<StrategyCard strategy={strategy} rank={1} />);

    const el = screen.getByText(/Last updated/);
    expect(el).toBeInTheDocument();
  });

  it('renders ConditionBadges for strategy conditions', () => {
    const conditions: (StrategyCondition & { characters: Character })[] = [
      {
        id: 'cond-1',
        strategy_id: 'strat-1',
        character_id: 'char-1',
        condition_type: 'must_have',
        created_at: '2026-01-01T00:00:00Z',
        characters: makeCharacter(),
      },
    ];
    const strategy = makeStrategy({ strategy_conditions: conditions });

    render(<StrategyCard strategy={strategy} rank={1} />);

    expect(screen.getByTestId('condition-badges')).toBeInTheDocument();
    expect(screen.getByText('1 conditions')).toBeInTheDocument();
  });
});
