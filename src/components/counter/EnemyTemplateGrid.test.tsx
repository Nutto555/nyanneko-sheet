import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { EnemyTemplateGrid } from './EnemyTemplateGrid';
import type {
  Character,
  EnemyDefenseTemplateWithMembers,
  EnemyDefenseMember,
} from '../../types/database';

vi.mock('../character-portrait/CharacterPortrait', () => ({
  CharacterPortrait: ({ character }: { character: Character }) => (
    <div data-testid="character-portrait">{character.name_en}</div>
  ),
}));

vi.mock('../ui/Card', () => ({
  default: ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => (
    <div data-testid="card" onClick={onClick}>
      {children}
    </div>
  ),
}));

function makeCharacter(overrides: Partial<Character> = {}): Character {
  return {
    id: 'char-1',
    name_en: 'Lubu',
    name_th: 'ลิโป้',
    slug: 'lubu',
    role: 'commander',
    type: null,
    image_url: null,
    thumbnail_url: null,
    notes: null,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

function makeMember(
  overrides: Partial<EnemyDefenseMember & { characters: Character }> = {},
): EnemyDefenseMember & { characters: Character } {
  return {
    id: 'member-1',
    template_id: 'tmpl-1',
    character_id: 'char-1',
    position: 1,
    created_at: '2026-01-01T00:00:00Z',
    characters: makeCharacter(),
    ...overrides,
  };
}

function makeTemplate(
  overrides: Partial<EnemyDefenseTemplateWithMembers> = {},
): EnemyDefenseTemplateWithMembers {
  return {
    id: 'tmpl-1',
    name_en: 'Lubu Sustain Core',
    name_th: null,
    slug: 'lubu-sustain-core',
    description: null,
    is_featured: false,
    sort_order: 0,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    enemy_defense_members: [
      makeMember({ id: 'm1', characters: makeCharacter({ id: 'c1', name_en: 'Lubu' }) }),
      makeMember({ id: 'm2', characters: makeCharacter({ id: 'c2', name_en: 'Eileene' }) }),
    ],
    ...overrides,
  };
}

describe('EnemyTemplateGrid', () => {
  it('renders one card per template', () => {
    const templates = [
      makeTemplate({ id: 't1', name_en: 'Template A' }),
      makeTemplate({ id: 't2', name_en: 'Template B' }),
      makeTemplate({ id: 't3', name_en: 'Template C' }),
    ];

    render(<EnemyTemplateGrid templates={templates} onSelect={vi.fn()} />);

    const cards = screen.getAllByTestId('card');
    expect(cards).toHaveLength(3);
  });

  it('renders template name_en in each card', () => {
    const templates = [
      makeTemplate({ id: 't1', name_en: 'Lubu Sustain Core' }),
      makeTemplate({ id: 't2', name_en: 'Kris CC Lockdown' }),
    ];

    render(<EnemyTemplateGrid templates={templates} onSelect={vi.fn()} />);

    expect(screen.getByText('Lubu Sustain Core')).toBeInTheDocument();
    expect(screen.getByText('Kris CC Lockdown')).toBeInTheDocument();
  });

  it('calls onSelect with template when card is clicked', () => {
    const onSelect = vi.fn();
    const template = makeTemplate({ id: 't1', name_en: 'Lubu Sustain Core' });

    render(<EnemyTemplateGrid templates={[template]} onSelect={onSelect} />);

    fireEvent.click(screen.getByTestId('card'));
    expect(onSelect).toHaveBeenCalledWith(template);
  });

  it('renders character portraits for each template member', () => {
    const template = makeTemplate({
      id: 't1',
      enemy_defense_members: [
        makeMember({ id: 'm1', characters: makeCharacter({ id: 'c1', name_en: 'Lubu' }) }),
        makeMember({ id: 'm2', characters: makeCharacter({ id: 'c2', name_en: 'Eileene' }) }),
        makeMember({ id: 'm3', characters: makeCharacter({ id: 'c3', name_en: 'Rachel' }) }),
      ],
    });

    render(<EnemyTemplateGrid templates={[template]} onSelect={vi.fn()} />);

    const portraits = screen.getAllByTestId('character-portrait');
    expect(portraits).toHaveLength(3);
    expect(screen.getByText('Lubu')).toBeInTheDocument();
    expect(screen.getByText('Eileene')).toBeInTheDocument();
    expect(screen.getByText('Rachel')).toBeInTheDocument();
  });
});
