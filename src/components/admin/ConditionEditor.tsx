import { useState } from 'react';
import type { Character, ConditionType } from '../../types/database';
import { CharacterMultiSelect } from '../character-multi-select/CharacterMultiSelect';
import { CharacterPortrait } from '../character-portrait/CharacterPortrait';

export interface ConditionItem {
  character: Character;
  condition_type: ConditionType;
}

interface ConditionEditorProps {
  conditions: ReadonlyArray<ConditionItem>;
  characters: Character[];
  onChange: (conditions: ConditionItem[]) => void;
}

interface ConditionSectionProps {
  label: string;
  conditionType: ConditionType;
  items: ReadonlyArray<ConditionItem>;
  availableCharacters: Character[];
  chipClass: string;
  onAdd: (character: Character, type: ConditionType) => void;
  onRemove: (characterId: string) => void;
}

function ConditionSection({
  label,
  conditionType,
  items,
  availableCharacters,
  chipClass,
  onAdd,
  onRemove,
}: ConditionSectionProps): React.JSX.Element {
  const [showSelect, setShowSelect] = useState(false);

  function handleSelect(selected: Character[]): void {
    if (selected.length > 0) {
      onAdd(selected[selected.length - 1], conditionType);
    }
    setShowSelect(false);
  }

  return (
    <div>
      <div className="text-xs font-bold text-slate-400 mb-2">{label}</div>
      <div className="flex flex-wrap gap-2 mb-2">
        {items.map((item) => (
          <div
            key={item.character.id}
            data-testid={`condition-chip-${item.character.id}`}
            className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 ${chipClass}`}
          >
            <CharacterPortrait character={item.character} size="sm" />
            <span className="text-xs">{item.character.name_en}</span>
            <button
              type="button"
              aria-label={`Remove ${item.character.name_en}`}
              onClick={() => onRemove(item.character.id)}
              className="ml-1 text-xs opacity-50 hover:opacity-100 transition-opacity duration-150"
            >
              x
            </button>
          </div>
        ))}
        {!showSelect && (
          <button
            type="button"
            onClick={() => setShowSelect(true)}
            className="inline-flex items-center justify-center w-7 h-7 rounded-full border border-slate-600 text-slate-400 hover:text-white hover:border-slate-400 text-sm transition-colors duration-150"
          >
            +
          </button>
        )}
      </div>
      {showSelect && (
        <div className="mb-2">
          <CharacterMultiSelect
            characters={availableCharacters}
            selectedCharacters={[]}
            onChange={handleSelect}
            maxSelections={1}
            placeholder={`Search ${conditionType === 'must_have' ? 'required' : 'excluded'} character...`}
          />
        </div>
      )}
    </div>
  );
}

export function ConditionEditor({
  conditions,
  characters,
  onChange,
}: ConditionEditorProps): React.JSX.Element {
  const usedIds = new Set(conditions.map((c) => c.character.id));
  const availableCharacters = characters.filter((c) => !usedIds.has(c.id));

  const mustHaveItems = conditions.filter((c) => c.condition_type === 'must_have');
  const mustNotHaveItems = conditions.filter((c) => c.condition_type === 'must_not_have');

  function handleAdd(character: Character, conditionType: ConditionType): void {
    onChange([...conditions, { character, condition_type: conditionType }]);
  }

  function handleRemove(characterId: string): void {
    onChange(conditions.filter((c) => c.character.id !== characterId));
  }

  return (
    <div className="space-y-4">
      <ConditionSection
        label="MUST HAVE"
        conditionType="must_have"
        items={mustHaveItems}
        availableCharacters={availableCharacters}
        chipClass="bg-green-900/30 border border-green-700/30 text-green-300"
        onAdd={handleAdd}
        onRemove={handleRemove}
      />
      <ConditionSection
        label="MUST NOT HAVE"
        conditionType="must_not_have"
        items={mustNotHaveItems}
        availableCharacters={availableCharacters}
        chipClass="bg-red-900/30 border border-red-700/30 text-red-300"
        onAdd={handleAdd}
        onRemove={handleRemove}
      />
    </div>
  );
}
