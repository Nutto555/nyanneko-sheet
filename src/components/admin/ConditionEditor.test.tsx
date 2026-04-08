import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ConditionEditor, type ConditionItem } from './ConditionEditor';
import type { Character } from '../../types/database';

// ─── Mock CharacterMultiSelect ──────────────────────────────────

vi.mock('../character-multi-select/CharacterMultiSelect', () => ({
  CharacterMultiSelect: ({ onChange, characters: availableChars, placeholder }: {
    onChange: (chars: Character[]) => void;
    characters: Character[];
    placeholder?: string;
  }) => (
    <div data-testid="character-multi-select" data-placeholder={placeholder}>
      <button
        data-testid="mock-select-char"
        onClick={() => {
          if (availableChars.length > 0) {
            onChange([availableChars[0]]);
          }
        }}
      >
        Select
      </button>
    </div>
  ),
}));

vi.mock('../character-portrait/CharacterPortrait', () => ({
  CharacterPortrait: ({ character }: { character: Character }) => (
    <span data-testid={`portrait-${character.id}`} />
  ),
}));

// ─── Test data ───────────────────────────────────────────────────

const makeCharacter = (id: string, name: string): Character => ({
  id,
  name_en: name,
  name_th: '',
  slug: name.toLowerCase(),
  role: null,
  type: null,
  image_url: null,
  thumbnail_url: null,
  notes: null,
  created_at: '',
  updated_at: '',
});

const charA = makeCharacter('char-a', 'Alpha');
const charB = makeCharacter('char-b', 'Beta');
const charC = makeCharacter('char-c', 'Gamma');
const charD = makeCharacter('char-d', 'Delta');

const allCharacters = [charA, charB, charC, charD];

// ─── Tests ───────────────────────────────────────────────────────

describe('ConditionEditor', () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders existing must_have conditions with green styling and character name', () => {
    const conditions: ConditionItem[] = [
      { character: charA, condition_type: 'must_have' },
    ];

    render(
      <ConditionEditor
        conditions={conditions}
        characters={allCharacters}
        onChange={mockOnChange}
      />
    );

    expect(screen.getByText('MUST HAVE')).toBeInTheDocument();
    const chip = screen.getByTestId('condition-chip-char-a');
    expect(chip).toBeInTheDocument();
    expect(chip).toHaveTextContent('Alpha');
    expect(chip).toHaveClass('bg-green-900/30');
  });

  it('renders existing must_not_have conditions with red styling and character name', () => {
    const conditions: ConditionItem[] = [
      { character: charB, condition_type: 'must_not_have' },
    ];

    render(
      <ConditionEditor
        conditions={conditions}
        characters={allCharacters}
        onChange={mockOnChange}
      />
    );

    expect(screen.getByText('MUST NOT HAVE')).toBeInTheDocument();
    const chip = screen.getByTestId('condition-chip-char-b');
    expect(chip).toBeInTheDocument();
    expect(chip).toHaveTextContent('Beta');
    expect(chip).toHaveClass('bg-red-900/30');
  });

  it('calls onChange when a condition is added via character select', () => {
    const conditions: ConditionItem[] = [];

    render(
      <ConditionEditor
        conditions={conditions}
        characters={allCharacters}
        onChange={mockOnChange}
      />
    );

    // Click the "+" button to show CharacterMultiSelect for must_have section
    const addButtons = screen.getAllByText('+');
    fireEvent.click(addButtons[0]);

    // Now the CharacterMultiSelect mock is shown - click to select a character
    const selectButton = screen.getAllByTestId('mock-select-char')[0];
    fireEvent.click(selectButton);

    expect(mockOnChange).toHaveBeenCalledWith([
      { character: charA, condition_type: 'must_have' },
    ]);
  });

  it('calls onChange when a condition is removed', () => {
    const conditions: ConditionItem[] = [
      { character: charA, condition_type: 'must_have' },
      { character: charB, condition_type: 'must_have' },
    ];

    render(
      <ConditionEditor
        conditions={conditions}
        characters={allCharacters}
        onChange={mockOnChange}
      />
    );

    // Click the remove button on the first condition
    const removeButton = screen.getByLabelText('Remove Alpha');
    fireEvent.click(removeButton);

    expect(mockOnChange).toHaveBeenCalledWith([
      { character: charB, condition_type: 'must_have' },
    ]);
  });
});
