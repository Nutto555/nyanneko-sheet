import type { CounterStrategyWithConditions, TeamWithMembers } from '../../types/database';
import { CharacterPortrait } from '../character-portrait/CharacterPortrait';
import { ConditionBadges } from './ConditionBadges';

interface StrategyCardProps {
  strategy: CounterStrategyWithConditions;
  rank: number;
}

export function StrategyCard({ strategy, rank }: StrategyCardProps): React.JSX.Element {
  const teamWithMembers = strategy.team_compositions as TeamWithMembers | null;
  const teamMembers = teamWithMembers?.team_members ?? [];

  return (
    <div className="bg-surface-raised rounded-lg p-4 border border-white/6">
      {/* Priority badge and label */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 rounded-full bg-primary/20 text-primary-light text-xs font-semibold flex items-center justify-center">
          {rank}
        </div>
        <span className="text-xs font-medium text-gray-400">Priority {rank}</span>
      </div>

      {/* Counter team portraits */}
      {teamMembers.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {teamMembers.map((member) => (
            <CharacterPortrait
              key={member.id}
              character={member.characters}
              size="md"
              showName={true}
            />
          ))}
        </div>
      )}

      {/* Conditions */}
      {strategy.strategy_conditions.length > 0 && (
        <div className="mb-3">
          <ConditionBadges conditions={strategy.strategy_conditions} />
        </div>
      )}

      {/* Condition note */}
      {strategy.condition_note && (
        <p className="text-sm text-gray-400 mb-2">{strategy.condition_note}</p>
      )}

      {/* Strategy notes */}
      {strategy.strategy_notes && (
        <p className="text-sm text-gray-400 mb-2">{strategy.strategy_notes}</p>
      )}

      {/* Timestamp */}
      <div className="text-xs text-gray-500 text-right">
        Last updated {new Date(strategy.updated_at).toLocaleDateString()}
      </div>
    </div>
  );
}
