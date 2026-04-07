import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ConditionBadges } from './ConditionBadges';
import type { StrategyCondition, Character } from '../../types/database';

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

function makeCondition(
  overrides: Partial<StrategyCondition> & { characters?: Partial<Character> } = {}
): StrategyCondition & { characters: Character } {
  const { characters: charOverrides, ...condOverrides } = overrides;
  return {
    id: 'cond-1',
    strategy_id: 'strat-1',
    character_id: 'char-1',
    condition_type: 'must_have',
    created_at: '2026-01-01T00:00:00Z',
    ...condOverrides,
    characters: makeCharacter(charOverrides),
  };
}

describe('ConditionBadges', () => {
  it('renders must_have conditions with green styling', () => {
    const conditions = [
      makeCondition({ condition_type: 'must_have', characters: { name_en: 'Lubu' } }),
    ];

    const { container } = render(<ConditionBadges conditions={conditions} />);
    const badge = container.querySelector('span');

    expect(badge).toBeInTheDocument();
    expect(badge?.className).toContain('bg-green-900/30');
    expect(badge?.className).toContain('text-green-300');
  });

  it('renders must_not_have conditions with red styling', () => {
    const conditions = [
      makeCondition({ condition_type: 'must_not_have', characters: { name_en: 'Eileene' } }),
    ];

    const { container } = render(<ConditionBadges conditions={conditions} />);
    const badge = container.querySelector('span');

    expect(badge).toBeInTheDocument();
    expect(badge?.className).toContain('bg-red-900/30');
    expect(badge?.className).toContain('text-red-300');
  });

  it('renders "If enemy has {name_en}" for must_have conditions', () => {
    const conditions = [
      makeCondition({ condition_type: 'must_have', characters: { name_en: 'Lubu' } }),
    ];

    render(<ConditionBadges conditions={conditions} />);

    expect(screen.getByText('If enemy has Lubu')).toBeInTheDocument();
  });

  it('renders "If enemy lacks {name_en}" for must_not_have conditions', () => {
    const conditions = [
      makeCondition({ condition_type: 'must_not_have', characters: { name_en: 'Eileene' } }),
    ];

    render(<ConditionBadges conditions={conditions} />);

    expect(screen.getByText('If enemy lacks Eileene')).toBeInTheDocument();
  });

  it('renders empty fragment when conditions array is empty', () => {
    const { container } = render(<ConditionBadges conditions={[]} />);

    expect(container.innerHTML).toBe('');
  });
});
