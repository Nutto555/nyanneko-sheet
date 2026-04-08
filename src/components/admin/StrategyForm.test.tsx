import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StrategyForm } from './StrategyForm';
import type { Character, CounterStrategyWithConditions } from '../../types/database';

// ─── Mock dependencies ──────────────────────────────────────────

vi.mock('../character-multi-select/CharacterMultiSelect', () => ({
  CharacterMultiSelect: ({ onChange, selectedCharacters, maxSelections, placeholder }: {
    onChange: (chars: Character[]) => void;
    selectedCharacters: Character[];
    maxSelections?: number;
    placeholder?: string;
  }) => (
    <div
      data-testid="character-multi-select"
      data-max={maxSelections}
      data-placeholder={placeholder}
      data-selected={selectedCharacters.map(c => c.id).join(',')}
    >
      <button
        data-testid="mock-team-select"
        onClick={() => onChange(selectedCharacters)}
      >
        Select Team
      </button>
    </div>
  ),
}));

vi.mock('./ConditionEditor', () => ({
  ConditionEditor: ({ conditions, onChange }: {
    conditions: readonly { character: Character; condition_type: string }[];
    onChange: (conditions: { character: Character; condition_type: string }[]) => void;
  }) => (
    <div data-testid="condition-editor" data-count={conditions.length}>
      <button
        data-testid="mock-condition-change"
        onClick={() => onChange([...conditions])}
      >
        Change Conditions
      </button>
    </div>
  ),
}));

vi.mock('../character-portrait/CharacterPortrait', () => ({
  CharacterPortrait: ({ character }: { character: Character }) => (
    <span data-testid={`portrait-${character.id}`}>{character.name_en}</span>
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
const allCharacters = [charA, charB];

const existingStrategy: CounterStrategyWithConditions = {
  id: 'strat-1',
  template_id: 'tmpl-1',
  counter_team_id: 'team-1',
  priority: 0,
  condition_note: 'Use when enemy has healer',
  strategy_notes: 'Focus fire on healer first',
  is_active: true,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
  strategy_conditions: [
    {
      id: 'cond-1',
      strategy_id: 'strat-1',
      character_id: 'char-a',
      condition_type: 'must_have',
      created_at: '2026-01-01T00:00:00Z',
      characters: charA,
    },
  ],
  team_compositions: null,
};

// ─── Tests ───────────────────────────────────────────────────────

describe('StrategyForm', () => {
  const mockOnSave = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockOnSave.mockResolvedValue(undefined);
  });

  it('renders counter team CharacterMultiSelect with maxSelections=3', () => {
    render(
      <StrategyForm
        characters={allCharacters}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    const select = screen.getByTestId('character-multi-select');
    expect(select).toHaveAttribute('data-max', '3');
    expect(select).toHaveAttribute('data-placeholder', 'Search counter characters...');
  });

  it('renders strategy_notes textarea', () => {
    render(
      <StrategyForm
        characters={allCharacters}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByPlaceholderText('Strategy notes...')).toBeInTheDocument();
  });

  it('renders condition_note input', () => {
    render(
      <StrategyForm
        characters={allCharacters}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByPlaceholderText('e.g. Use when enemy has healer')).toBeInTheDocument();
  });

  it('calls onSave with form data when submitted', async () => {
    render(
      <StrategyForm
        characters={allCharacters}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    // Fill in condition note
    fireEvent.change(screen.getByPlaceholderText('e.g. Use when enemy has healer'), {
      target: { value: 'Test condition' },
    });

    // Fill in strategy notes
    fireEvent.change(screen.getByPlaceholderText('Strategy notes...'), {
      target: { value: 'Test notes' },
    });

    // Click save
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith(
        expect.objectContaining({
          conditionNote: 'Test condition',
          strategyNotes: 'Test notes',
          isActive: true,
          counterTeamCharacters: [],
          conditions: [],
        })
      );
    });
  });

  it('populates fields when editing an existing strategy', () => {
    render(
      <StrategyForm
        characters={allCharacters}
        strategy={existingStrategy}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText('Edit Strategy')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Use when enemy has healer')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Focus fire on healer first')).toBeInTheDocument();

    // Condition editor should have 1 condition
    const condEditor = screen.getByTestId('condition-editor');
    expect(condEditor).toHaveAttribute('data-count', '1');
  });
});
