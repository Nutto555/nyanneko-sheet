import { useState, useEffect } from 'react';
import type { Character, EnemyDefenseTemplateWithMembers } from '../../types/database';
import { CharacterMultiSelect } from '../character-multi-select/CharacterMultiSelect';

export interface TemplateFormData {
  name_en: string;
  name_th: string;
  description: string;
  is_featured: boolean;
  characters: Character[];
}

interface TemplateFormProps {
  characters: Character[];
  template?: EnemyDefenseTemplateWithMembers | null;
  onSave: (data: TemplateFormData) => Promise<void>;
  onCancel: () => void;
  saving?: boolean;
}

export function TemplateForm({
  characters,
  template = null,
  onSave,
  onCancel,
  saving = false,
}: TemplateFormProps): React.JSX.Element {
  const [nameEn, setNameEn] = useState('');
  const [nameTh, setNameTh] = useState('');
  const [description, setDescription] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [selectedCharacters, setSelectedCharacters] = useState<Character[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (template) {
      setNameEn(template.name_en);
      setNameTh(template.name_th ?? '');
      setDescription(template.description ?? '');
      setIsFeatured(template.is_featured);
      const members = [...template.enemy_defense_members]
        .sort((a, b) => a.position - b.position)
        .map((m) => m.characters);
      setSelectedCharacters(members);
    }
  }, [template]);

  async function handleSave(): Promise<void> {
    if (!nameEn.trim()) {
      setError('Template name is required');
      return;
    }
    setError('');
    try {
      await onSave({
        name_en: nameEn.trim(),
        name_th: nameTh.trim(),
        description: description.trim(),
        is_featured: isFeatured,
        characters: selectedCharacters,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    }
  }

  return (
    <div className="p-4 rounded-lg border border-slate-700 bg-slate-800/50 space-y-4">
      <h3 className="text-sm font-bold text-white">
        {template ? 'Edit Template' : 'New Template'}
      </h3>

      <input
        type="text"
        placeholder="Template name (English)"
        value={nameEn}
        onChange={(e) => setNameEn(e.target.value)}
        className="w-full px-3 py-2 rounded text-sm bg-slate-800 border border-slate-700 text-white"
      />

      <input
        type="text"
        placeholder="Template name (Thai)"
        value={nameTh}
        onChange={(e) => setNameTh(e.target.value)}
        className="w-full px-3 py-2 rounded text-sm bg-slate-800 border border-slate-700 text-white"
      />

      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={2}
        className="w-full px-3 py-2 rounded text-sm bg-slate-800 border border-slate-700 text-white resize-y"
      />

      <label className="flex items-center gap-2 text-sm text-slate-300">
        <input
          type="checkbox"
          checked={isFeatured}
          onChange={(e) => setIsFeatured(e.target.checked)}
          className="rounded border-slate-600"
        />
        Featured template (shown on counter lookup page)
      </label>

      <div>
        <label className="text-xs font-medium text-slate-400 block mb-1">
          Enemy Characters
        </label>
        <CharacterMultiSelect
          characters={characters}
          selectedCharacters={selectedCharacters}
          onChange={setSelectedCharacters}
          maxSelections={3}
          placeholder="Select enemy characters (1-3)..."
        />
      </div>

      {error && <p className="text-red-400 text-xs">{error}</p>}

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
