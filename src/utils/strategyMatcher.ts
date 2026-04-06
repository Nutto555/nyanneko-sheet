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

export function evaluateStrategy(
  strategy: CounterStrategyWithConditions,
  enemyCharacterIds: string[]
): boolean {
  throw new Error('Not implemented');
}

export function resolveMatchingStrategies(
  templates: EnemyDefenseTemplateWithMembers[],
  strategies: CounterStrategyWithConditions[],
  enemyCharacterIds: string[]
): MatchResult[] {
  throw new Error('Not implemented');
}
