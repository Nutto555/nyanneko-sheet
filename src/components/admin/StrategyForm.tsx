import { useState } from 'react';
import type { Character, CounterStrategyWithConditions } from '../../types/database';
import { CharacterMultiSelect } from '../character-multi-select/CharacterMultiSelect';
import { ConditionEditor, type ConditionItem } from './ConditionEditor';

export interface StrategyFormData {
  counterTeamCharacters: Character[];
  conditions: ConditionItem[];
  conditionNote: string;
  strategyNotes: string;
  isActive: boolean;
}

interface StrategyFormProps {
  characters: Character[];
  strategy?: CounterStrategyWithConditions | null;
  onSave: (data: StrategyFormData) => Promise<void>;
  onCancel: () => void;
  saving?: boolean;
}

function initConditions(strategy: CounterStrategyWithConditions | null | undefined): ConditionItem[] {
  if (!strategy?.strategy_conditions) return [];
  return strategy.strategy_conditions.map((sc) => ({
    character: sc.characters,
    condition_type: sc.condition_type,
  }));
}

function initTeamCharacters(strategy: CounterStrategyWithConditions | null | undefined): Character[] {
  if (!strategy?.team_compositions) return [];
  const team = strategy.team_compositions as { team_members?: Array<{ characters: Character }> };
  if (!team.team_members) return [];
  return team.team_members.map((m) => m.characters);
}

export function StrategyForm({
  characters,
  strategy = null,
  onSave,
  onCancel,
  saving = false,
}: StrategyFormProps): React.JSX.Element {
  const [counterTeamCharacters, setCounterTeamCharacters] = useState<Character[]>(
    () => initTeamCharacters(strategy),
  );
  const [conditions, setConditions] = useState<ConditionItem[]>(
    () => initConditions(strategy),
  );
  const [conditionNote, setConditionNote] = useState(strategy?.condition_note ?? '');
  const [strategyNotes, setStrategyNotes] = useState(strategy?.strategy_notes ?? '');
  const [isActive, setIsActive] = useState(strategy?.is_active ?? true);
  const [error, setError] = useState('');

  const isEditing = strategy !== null && strategy !== undefined;

  async function handleSave(): Promise<void> {
    setError('');
    try {
      await onSave({
        counterTeamCharacters,
        conditions,
        conditionNote,
        strategyNotes,
        isActive,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed');
    }
  }

  return (
    <div className="p-4 rounded-lg border border-slate-700 bg-slate-800/50 space-y-4">
      <h3 className="text-sm font-bold text-white">
        {isEditing ? 'Edit Strategy' : 'New Strategy'}
      </h3>

      {/* Counter team section */}
      <div>
        <label className="text-sm font-medium text-slate-300 block mb-1">
          Counter Team (3 characters)
        </label>
        <CharacterMultiSelect
          characters={characters}
          selectedCharacters={counterTeamCharacters}
          onChange={setCounterTeamCharacters}
          maxSelections={3}
          placeholder="Search counter characters..."
        />
      </div>

      {/* Conditions section */}
      <div>
        <label className="text-sm font-medium text-slate-300 block mb-1">
          Conditions
        </label>
        <ConditionEditor
          conditions={conditions}
          characters={characters}
          onChange={setConditions}
        />
      </div>

      {/* Condition note */}
      <div>
        <label className="text-xs text-slate-400 block mb-1">
          Condition Note (optional)
        </label>
        <input
          type="text"
          value={conditionNote}
          onChange={(e) => setConditionNote(e.target.value)}
          placeholder="e.g. Use when enemy has healer"
          className="w-full px-3 py-2 rounded text-sm bg-slate-800 border border-slate-700 text-white"
        />
      </div>

      {/* Strategy notes */}
      <div>
        <label className="text-xs text-slate-400 block mb-1">
          Strategy Notes
        </label>
        <textarea
          value={strategyNotes}
          onChange={(e) => setStrategyNotes(e.target.value)}
          placeholder="Strategy notes..."
          rows={3}
          className="w-full px-3 py-2 rounded text-sm bg-slate-800 border border-slate-700 text-white resize-y"
        />
      </div>

      {/* Active toggle */}
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
          className="rounded border-slate-600"
        />
        <span className="text-sm text-slate-300">Active</span>
      </label>

      {/* Error display */}
      {error && <p className="text-red-400 text-xs">{error}</p>}

      {/* Action buttons */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="px-3 py-1.5 rounded text-xs font-medium bg-amber-600 hover:bg-amber-500 text-white disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1.5 rounded text-xs font-medium bg-slate-700 hover:bg-slate-600 text-white"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
