import { useState } from 'react';
import {
  Combobox,
  ComboboxInput,
  ComboboxOptions,
  ComboboxOption,
} from '@headlessui/react';
import type { Character } from '../../types/database';
import { useCharacterSearch } from '../../hooks/useCharacterSearch';
import { CharacterPortrait } from '../character-portrait/CharacterPortrait';

export interface CharacterMultiSelectProps {
  characters: Character[];
  selectedCharacters: Character[];
  onChange: (characters: Character[]) => void;
  maxSelections?: number;
  placeholder?: string;
  disabled?: boolean;
}

export function CharacterMultiSelect({
  characters,
  selectedCharacters,
  onChange,
  maxSelections,
  placeholder = 'Search characters...',
  disabled = false,
}: CharacterMultiSelectProps): React.JSX.Element {
  const [query, setQuery] = useState('');
  const { search } = useCharacterSearch(characters);

  const isAtMax = maxSelections !== undefined && selectedCharacters.length >= maxSelections;

  const filtered = search(query).filter(
    (c) => !selectedCharacters.some((s) => s.id === c.id),
  );

  function handleChange(newSelection: Character[]): void {
    if (maxSelections && newSelection.length > maxSelections) return;
    onChange(newSelection);
    setQuery('');
  }

  function handleRemove(characterId: string): void {
    onChange(selectedCharacters.filter((c) => c.id !== characterId));
  }

  return (
    <div className="w-full">
      {/* Selected character chips */}
      {selectedCharacters.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {selectedCharacters.map((char) => (
            <div
              key={char.id}
              className="inline-flex items-center gap-1 rounded-full px-2 py-1 transition-all duration-150"
              style={{
                background: 'var(--color-surface-raised)',
                border: '1px solid var(--color-border-bright)',
              }}
            >
              <CharacterPortrait character={char} size="sm" />
              <span className="text-xs text-white">{char.name_en}</span>
              <button
                type="button"
                aria-label={`Remove ${char.name_en}`}
                onClick={() => handleRemove(char.id)}
                className="ml-1 text-xs opacity-50 hover:opacity-100 transition-opacity duration-150"
              >
                x
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Combobox */}
      <Combobox
        multiple
        value={selectedCharacters}
        onChange={handleChange}
        by="id"
        disabled={disabled || isAtMax}
      >
        <ComboboxInput
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
          value={query}
          placeholder={isAtMax ? `Max ${maxSelections} selected` : placeholder}
          className="w-full rounded-lg px-3 py-2 text-sm text-white bg-transparent outline-none focus:ring-2"
          style={{
            border: '1px solid var(--color-border-bright)',
            // focus ring color handled by Tailwind focus:ring class + CSS var
          }}
        />
        <ComboboxOptions
          anchor="bottom start"
          className="z-50 mt-1 max-h-60 w-[var(--input-width)] overflow-auto rounded-lg py-1 transition-opacity duration-150"
          style={{
            background: 'var(--color-surface-raised)',
            border: '1px solid var(--color-border-bright)',
          }}
        >
          {filtered.length === 0 && query !== '' ? (
            <div className="px-4 py-2 text-sm opacity-50">
              No characters found
            </div>
          ) : (
            filtered.map((char) => (
              <ComboboxOption
                key={char.id}
                value={char}
                className="flex items-center gap-2 px-3 py-2 cursor-pointer data-[focus]:bg-[var(--color-primary)] transition-colors duration-100"
              >
                <CharacterPortrait character={char} size="sm" showName />
              </ComboboxOption>
            ))
          )}
        </ComboboxOptions>
      </Combobox>
    </div>
  );
}
