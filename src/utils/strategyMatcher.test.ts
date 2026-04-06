import { describe, it, expect } from 'vitest';
import { evaluateStrategy, resolveMatchingStrategies } from './strategyMatcher';
import type {
  CounterStrategyWithConditions,
  EnemyDefenseTemplateWithMembers,
  ConditionType,
  Character,
} from '../types/database';

// ============================================================
// Factory helpers
// ============================================================

const stubCharacter: Character = {
  id: 'stub',
  name_en: 'Stub',
  name_th: 'Stub',
  slug: 'stub',
  role: null,
  type: null,
  image_url: null,
  thumbnail_url: null,
  notes: null,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

function makeStrategy(
  overrides: Partial<CounterStrategyWithConditions> & {
    conditions?: { character_id: string; condition_type: ConditionType }[];
  } = {}
): CounterStrategyWithConditions {
  const { conditions = [], ...rest } = overrides;
  return {
    id: 'strategy-1',
    template_id: 'template-1',
    counter_team_id: null,
    priority: 0,
    condition_note: null,
    strategy_notes: null,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    team_compositions: null,
    strategy_conditions: conditions.map((c, i) => ({
      id: `cond-${i}`,
      strategy_id: rest.id ?? 'strategy-1',
      character_id: c.character_id,
      condition_type: c.condition_type,
      created_at: '2024-01-01T00:00:00Z',
      characters: { ...stubCharacter, id: c.character_id },
    })),
    ...rest,
  };
}

function makeTemplate(
  overrides: Partial<EnemyDefenseTemplateWithMembers> & {
    memberCharacterIds?: string[];
  } = {}
): EnemyDefenseTemplateWithMembers {
  const { memberCharacterIds = [], ...rest } = overrides;
  return {
    id: 'template-1',
    name_en: 'Template',
    name_th: null,
    slug: 'template',
    description: null,
    is_featured: false,
    sort_order: 0,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    enemy_defense_members: memberCharacterIds.map((charId, i) => ({
      id: `member-${i}`,
      template_id: rest.id ?? 'template-1',
      character_id: charId,
      position: i + 1,
      created_at: '2024-01-01T00:00:00Z',
      characters: { ...stubCharacter, id: charId },
    })),
    ...rest,
  };
}

// ============================================================
// evaluateStrategy
// ============================================================

describe('evaluateStrategy', () => {
  it('returns true when strategy has no conditions', () => {
    const strategy = makeStrategy({ conditions: [] });
    expect(evaluateStrategy(strategy, ['char-aaa', 'char-bbb'])).toBe(true);
  });

  it('returns true when all must_have characters are present', () => {
    const strategy = makeStrategy({
      conditions: [
        { character_id: 'char-aaa', condition_type: 'must_have' },
        { character_id: 'char-bbb', condition_type: 'must_have' },
      ],
    });
    expect(evaluateStrategy(strategy, ['char-aaa', 'char-bbb', 'char-ccc'])).toBe(true);
  });

  it('returns false when a must_have character is missing', () => {
    const strategy = makeStrategy({
      conditions: [
        { character_id: 'char-aaa', condition_type: 'must_have' },
        { character_id: 'char-bbb', condition_type: 'must_have' },
      ],
    });
    expect(evaluateStrategy(strategy, ['char-aaa', 'char-ccc'])).toBe(false);
  });

  it('returns true when must_not_have characters are absent', () => {
    const strategy = makeStrategy({
      conditions: [
        { character_id: 'char-ddd', condition_type: 'must_not_have' },
      ],
    });
    expect(evaluateStrategy(strategy, ['char-aaa', 'char-bbb'])).toBe(true);
  });

  it('returns false when a must_not_have character is present', () => {
    const strategy = makeStrategy({
      conditions: [
        { character_id: 'char-ddd', condition_type: 'must_not_have' },
      ],
    });
    expect(evaluateStrategy(strategy, ['char-aaa', 'char-ddd'])).toBe(false);
  });

  it('handles combined must_have and must_not_have', () => {
    const strategy = makeStrategy({
      conditions: [
        { character_id: 'char-aaa', condition_type: 'must_have' },
        { character_id: 'char-ddd', condition_type: 'must_not_have' },
      ],
    });

    // must_have present, must_not_have absent -> true
    expect(evaluateStrategy(strategy, ['char-aaa', 'char-bbb'])).toBe(true);

    // must_have present, must_not_have also present -> false
    expect(evaluateStrategy(strategy, ['char-aaa', 'char-ddd'])).toBe(false);

    // must_have missing -> false
    expect(evaluateStrategy(strategy, ['char-bbb'])).toBe(false);
  });
});

// ============================================================
// resolveMatchingStrategies
// ============================================================

describe('resolveMatchingStrategies', () => {
  it('returns templates ranked by match score descending', () => {
    const templateA = makeTemplate({
      id: 'tmpl-a',
      memberCharacterIds: ['char-aaa', 'char-bbb', 'char-ccc', 'char-ddd', 'char-eee', 'char-fff'],
      sort_order: 0,
    });
    const templateB = makeTemplate({
      id: 'tmpl-b',
      memberCharacterIds: ['char-aaa', 'char-bbb'],
      sort_order: 0,
    });

    const results = resolveMatchingStrategies(
      [templateA, templateB],
      [],
      ['char-aaa', 'char-bbb']
    );

    expect(results[0].template.id).toBe('tmpl-b');
    expect(results[0].matchScore).toBe(1.0);
    expect(results[1].template.id).toBe('tmpl-a');
    expect(results[1].matchScore).toBeCloseTo(2 / 6);
  });

  it('breaks ties using sort_order ascending', () => {
    const templateA = makeTemplate({
      id: 'tmpl-a',
      memberCharacterIds: ['char-aaa'],
      sort_order: 10,
    });
    const templateB = makeTemplate({
      id: 'tmpl-b',
      memberCharacterIds: ['char-aaa'],
      sort_order: 5,
    });

    const results = resolveMatchingStrategies(
      [templateA, templateB],
      [],
      ['char-aaa']
    );

    expect(results[0].template.id).toBe('tmpl-b');
    expect(results[1].template.id).toBe('tmpl-a');
  });

  it('includes all templates regardless of match score', () => {
    const templateA = makeTemplate({
      id: 'tmpl-a',
      memberCharacterIds: ['char-xxx', 'char-yyy'],
      sort_order: 0,
    });

    const results = resolveMatchingStrategies(
      [templateA],
      [],
      ['char-aaa']
    );

    expect(results).toHaveLength(1);
    expect(results[0].matchScore).toBe(0);
  });

  it('filters strategies by evaluateStrategy within each template', () => {
    const template = makeTemplate({
      id: 'tmpl-a',
      memberCharacterIds: ['char-aaa'],
    });

    const passingStrategy = makeStrategy({
      id: 'strat-pass',
      template_id: 'tmpl-a',
      conditions: [{ character_id: 'char-aaa', condition_type: 'must_have' }],
    });
    const failingStrategy = makeStrategy({
      id: 'strat-fail',
      template_id: 'tmpl-a',
      conditions: [{ character_id: 'char-zzz', condition_type: 'must_have' }],
    });

    const results = resolveMatchingStrategies(
      [template],
      [passingStrategy, failingStrategy],
      ['char-aaa']
    );

    expect(results[0].strategies).toHaveLength(1);
    expect(results[0].strategies[0].id).toBe('strat-pass');
  });

  it('orders strategies by priority ascending within each template', () => {
    const template = makeTemplate({
      id: 'tmpl-a',
      memberCharacterIds: ['char-aaa'],
    });

    const stratLow = makeStrategy({
      id: 'strat-low',
      template_id: 'tmpl-a',
      priority: 2,
      conditions: [],
    });
    const stratHigh = makeStrategy({
      id: 'strat-high',
      template_id: 'tmpl-a',
      priority: 0,
      conditions: [],
    });

    const results = resolveMatchingStrategies(
      [template],
      [stratLow, stratHigh],
      ['char-aaa']
    );

    expect(results[0].strategies[0].id).toBe('strat-high');
    expect(results[0].strategies[1].id).toBe('strat-low');
  });

  it('returns empty array when no templates provided', () => {
    const results = resolveMatchingStrategies([], [], ['char-aaa']);
    expect(results).toEqual([]);
  });

  it('matchedCharacterIds contains the IDs that overlapped', () => {
    const template = makeTemplate({
      id: 'tmpl-a',
      memberCharacterIds: ['char-aaa', 'char-bbb', 'char-ccc'],
    });

    const results = resolveMatchingStrategies(
      [template],
      [],
      ['char-aaa', 'char-ccc', 'char-zzz']
    );

    expect(results[0].matchedCharacterIds).toHaveLength(2);
    expect(results[0].matchedCharacterIds).toContain('char-aaa');
    expect(results[0].matchedCharacterIds).toContain('char-ccc');
    expect(results[0].matchedCharacterIds).not.toContain('char-bbb');
  });
});
