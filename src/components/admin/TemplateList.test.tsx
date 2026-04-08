import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TemplateList } from './TemplateList';
import type { Character, EnemyDefenseTemplateWithMembers } from '../../types/database';

// ─── Mock dependencies ──────────────────────────────────────────

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

const templates: EnemyDefenseTemplateWithMembers[] = [
  {
    id: 'tmpl-1',
    name_en: 'Lubu Sustain',
    name_th: null,
    slug: 'lubu-sustain',
    description: null,
    is_featured: true,
    sort_order: 0,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    enemy_defense_members: [
      { id: 'edm-1', template_id: 'tmpl-1', character_id: 'char-a', position: 0, created_at: '', characters: charA },
      { id: 'edm-2', template_id: 'tmpl-1', character_id: 'char-b', position: 1, created_at: '', characters: charB },
    ],
  },
  {
    id: 'tmpl-2',
    name_en: 'Rush Team',
    name_th: null,
    slug: 'rush-team',
    description: null,
    is_featured: false,
    sort_order: 1,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    enemy_defense_members: [
      { id: 'edm-3', template_id: 'tmpl-2', character_id: 'char-a', position: 0, created_at: '', characters: charA },
    ],
  },
];

// ─── Tests ───────────────────────────────────────────────────────

describe('TemplateList', () => {
  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders one row per template with name and member count', () => {
    render(
      <TemplateList
        templates={templates}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('Lubu Sustain')).toBeInTheDocument();
    expect(screen.getByText('Rush Team')).toBeInTheDocument();
    expect(screen.getByText('2 characters')).toBeInTheDocument();
    expect(screen.getByText('1 character')).toBeInTheDocument();
  });

  it('renders edit and delete buttons', () => {
    render(
      <TemplateList
        templates={templates}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    const editButtons = screen.getAllByText('Edit');
    const deleteButtons = screen.getAllByText('Delete');
    expect(editButtons).toHaveLength(2);
    expect(deleteButtons).toHaveLength(2);
  });

  it('calls onEdit when edit clicked', () => {
    render(
      <TemplateList
        templates={templates}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    const editButtons = screen.getAllByText('Edit');
    fireEvent.click(editButtons[0]);

    expect(mockOnEdit).toHaveBeenCalledWith(templates[0]);
  });

  it('calls onDelete when delete clicked after confirm', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    render(
      <TemplateList
        templates={templates}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);

    expect(window.confirm).toHaveBeenCalledWith('Delete this template?');
    expect(mockOnDelete).toHaveBeenCalledWith('tmpl-1');
  });

  it('renders "No templates yet" when empty', () => {
    render(
      <TemplateList
        templates={[]}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText(/No templates yet/)).toBeInTheDocument();
  });
});
