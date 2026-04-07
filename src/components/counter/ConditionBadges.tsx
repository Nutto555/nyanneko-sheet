import type { StrategyCondition, Character } from '../../types/database';

interface ConditionBadgesProps {
  conditions: ReadonlyArray<StrategyCondition & { characters: Character }>;
}

export function ConditionBadges({ conditions }: ConditionBadgesProps): React.JSX.Element | null {
  if (conditions.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1">
      {conditions.map((c) => {
        const isMustHave = c.condition_type === 'must_have';

        return (
          <span
            key={c.id}
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
              isMustHave
                ? 'bg-green-900/30 text-green-300 border-green-700/30'
                : 'bg-red-900/30 text-red-300 border-red-700/30'
            }`}
          >
            {isMustHave
              ? `If enemy has ${c.characters.name_en}`
              : `If enemy lacks ${c.characters.name_en}`}
          </span>
        );
      })}
    </div>
  );
}
