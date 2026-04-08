import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TemplateForm } from './TemplateForm';
import type { Character, EnemyDefenseTemplateWithMembers } from '../../types/database';

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
        data-testid="mock-char-select"
        onClick={() => onChange([...selectedCharacters, allCharacters[0]])}
      >
        Select Character
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
const allCharacters = [charA, charB, charC];

const existingTemplate: EnemyDefenseTemplateWithMembers = {
  id: 'tmpl-1',
  name_en: 'Lubu Sustain Core',
  name_th: 'ทีมหลู่ปู้',
  slug: 'lubu-sustain-core',
  description: 'A sustain team with Lubu',
  is_featured: true,
  sort_order: 0,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
  enemy_defense_members: [
    { id: 'edm-1', template_id: 'tmpl-1', character_id: 'char-a', position: 0, created_at: '', characters: charA },
    { id: 'edm-2', template_id: 'tmpl-1', character_id: 'char-b', position: 1, created_at: '', characters: charB },
  ],
};

// ─── Tests ───────────────────────────────────────────────────────

describe('TemplateForm', () => {
  const mockOnSave = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockOnSave.mockResolvedValue(undefined);
  });

  it('renders name input and CharacterMultiSelect with maxSelections=3', () => {
    render(
      <TemplateForm
        characters={allCharacters}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByPlaceholderText('Template name (English)')).toBeInTheDocument();
    const select = screen.getByTestId('character-multi-select');
    expect(select).toHaveAttribute('data-max', '3');
    expect(select).toHaveAttribute('data-placeholder', 'Select enemy characters (1-3)...');
  });

  it('calls onSave with template data on submit', async () => {
    render(
      <TemplateForm
        characters={allCharacters}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    fireEvent.change(screen.getByPlaceholderText('Template name (English)'), {
      target: { value: 'Rush Defense' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith(
        expect.objectContaining({
          name_en: 'Rush Defense',
          is_featured: false,
          characters: [],
        })
      );
    });
  });

  it('populates fields when editing an existing template', () => {
    render(
      <TemplateForm
        characters={allCharacters}
        template={existingTemplate}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText('Edit Template')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Lubu Sustain Core')).toBeInTheDocument();
    expect(screen.getByDisplayValue('ทีมหลู่ปู้')).toBeInTheDocument();
    expect(screen.getByDisplayValue('A sustain team with Lubu')).toBeInTheDocument();

    // Featured checkbox should be checked
    const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
    expect(checkbox.checked).toBe(true);

    // CharacterMultiSelect should have the existing members
    const select = screen.getByTestId('character-multi-select');
    expect(select).toHaveAttribute('data-selected', 'char-a,char-b');
  });

  it('renders is_featured checkbox', () => {
    render(
      <TemplateForm
        characters={allCharacters}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeInTheDocument();
    expect(screen.getByText(/Featured template/)).toBeInTheDocument();
  });
});
