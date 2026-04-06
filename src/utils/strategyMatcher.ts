import type {
  CounterStrategyWithConditions,
  EnemyDefenseTemplateWithMembers,
} from '../types/database';

export interface MatchResult {
  template: EnemyDefenseTemplateWithMembers;
  matchScore: number;
  matchedCharacterIds: string[];
  strategies: CounterStrategyWithConditions[];
}

/**
 * Evaluate whether a counter strategy applies given the enemy team composition.
 * Returns true when all must_have characters are present AND no must_not_have
 * characters are present. A strategy with zero conditions always applies.
 */
export function evaluateStrategy(
  strategy: CounterStrategyWithConditions,
  enemyCharacterIds: string[]
): boolean {
  const enemySet = new Set(enemyCharacterIds);

  const mustHave = strategy.strategy_conditions.filter(
    (c) => c.condition_type === 'must_have'
  );
  const mustNotHave = strategy.strategy_conditions.filter(
    (c) => c.condition_type === 'must_not_have'
  );

  const allMustHavePresent = mustHave.every((c) => enemySet.has(c.character_id));
  const noMustNotHavePresent = mustNotHave.every((c) => !enemySet.has(c.character_id));

  return allMustHavePresent && noMustNotHavePresent;
}

/**
 * Rank enemy defense templates by how well they match a given set of enemy
 * character IDs. Returns ALL templates (no minimum threshold) sorted by
 * overlap ratio descending, with sort_order as tiebreaker ascending.
 *
 * For each template, applicable strategies are filtered via evaluateStrategy
 * and sorted by priority ascending.
 */
export function resolveMatchingStrategies(
  templates: ReadonlyArray<EnemyDefenseTemplateWithMembers>,
  strategies: ReadonlyArray<CounterStrategyWithConditions>,
  enemyCharacterIds: string[]
): MatchResult[] {
  const enemySet = new Set(enemyCharacterIds);

  const results: MatchResult[] = templates.map((template) => {
    const matchedCharacterIds = template.enemy_defense_members
      .filter((m) => enemySet.has(m.character_id))
      .map((m) => m.character_id);

    const memberCount = template.enemy_defense_members.length;
    const matchScore = memberCount === 0 ? 0 : matchedCharacterIds.length / memberCount;

    const applicableStrategies = strategies
      .filter((s) => s.template_id === template.id)
      .filter((s) => evaluateStrategy(s, enemyCharacterIds))
      .toSorted((a, b) => a.priority - b.priority);

    return {
      template,
      matchScore,
      matchedCharacterIds,
      strategies: applicableStrategies,
    };
  });

  return results.toSorted((a, b) => {
    const scoreDiff = b.matchScore - a.matchScore;
    if (scoreDiff !== 0) return scoreDiff;
    return a.template.sort_order - b.template.sort_order;
  });
}
