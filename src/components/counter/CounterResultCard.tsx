import type { MatchResult } from '../../utils/strategyMatcher';
import Card from '../ui/Card';
import { CharacterPortrait } from '../character-portrait/CharacterPortrait';
import { StrategyCard } from './StrategyCard';

interface CounterResultCardProps {
  result: MatchResult;
}

export function CounterResultCard({ result }: CounterResultCardProps): React.JSX.Element {
  const { template, matchScore, matchedCharacterIds, strategies } = result;
  const isExactMatch = matchScore === 1;
  const sortedMembers = template.enemy_defense_members.toSorted(
    (a, b) => a.position - b.position
  );

  return (
    <Card hover={false}>
      {/* Header row */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold">{template.name_en}</h3>
        {isExactMatch ? (
          <span className="text-green-400 text-xs font-medium">Exact match</span>
        ) : (
          <span className="text-amber-400 text-xs font-medium">
            {matchedCharacterIds.length}/{template.enemy_defense_members.length} matched
          </span>
        )}
      </div>

      {/* Enemy team portraits */}
      <div className="flex flex-wrap gap-2 mb-4">
        {sortedMembers.map((member) => (
          <CharacterPortrait
            key={member.id}
            character={member.characters}
            size="md"
          />
        ))}
      </div>

      {/* Divider */}
      <div className="border-t border-white/6 my-4" />

      {/* Strategy list */}
      {strategies.length > 0 ? (
        <div className="flex flex-col gap-4">
          {strategies.map((strategy, index) => (
            <StrategyCard key={strategy.id} strategy={strategy} rank={index + 1} />
          ))}
        </div>
      ) : (
        <p className="text-gray-400 text-sm">
          No counter strategies defined for this matchup
        </p>
      )}
    </Card>
  );
}
