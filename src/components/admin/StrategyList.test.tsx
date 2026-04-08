import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StrategyList } from './StrategyList';
import type { CounterStrategyWithConditions, Character } from '../../types/database';

// ─── Mock dnd-kit ────────────────────────────────────────────────

vi.mock('@dnd-kit/core', () => ({
  DndContext: ({ children }: { children: React.ReactNode }) => <div data-testid="dnd-context">{children}</div>,
  closestCenter: vi.fn(),
  KeyboardSensor: vi.fn(),
  PointerSensor: vi.fn(),
  useSensor: vi.fn(() => ({})),
  useSensors: vi.fn(() => []),
}));

vi.mock('@dnd-kit/sortable', () => ({
  SortableContext: ({ children }: { children: React.ReactNode }) => <div data-testid="sortable-context">{children}</div>,
  sortableKeyboardCoordinates: vi.fn(),
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    transition: null,
  }),
  verticalListSortingStrategy: 'vertical',
  arrayMove: vi.fn(),
}));

vi.mock('@dnd-kit/utilities', () => ({
  CSS: { Transform: { toString: () => '' } },
}));

vi.mock('../character-portrait/CharacterPortrait', () => ({
  CharacterPortrait: ({ character }: { character: Character }) => (
    <span data-testid={`portrait-${character.id}`} />
  ),
}));

// ─── Test data ───────────────────────────────────────────────────

const makeStrategy = (
  id: string,
  priority: number,
  overrides: Partial<CounterStrategyWithConditions> = {},
): CounterStrategyWithConditions => ({
  id,
  template_id: 'tmpl-1',
  counter_team_id: null,
  priority,
  condition_note: null,
  strategy_notes: null,
  is_active: true,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-15T00:00:00Z',
  strategy_conditions: [],
  team_compositions: null,
  ...overrides,
});

const strategies: CounterStrategyWithConditions[] = [
  makeStrategy('strat-1', 0, {
    team_compositions: { id: 'team-1', name: 'Rush Team', slug: 'rush-team', category: 'attack', description: null, strategy_notes: null, speed_requirement: null, tier: null, image_url: null, created_at: '', updated_at: '' },
    strategy_conditions: [
      { id: 'cond-1', strategy_id: 'strat-1', character_id: 'c1', condition_type: 'must_have', created_at: '', characters: { id: 'c1', name_en: 'Alpha', name_th: '', slug: 'alpha', role: null, type: null, image_url: null, thumbnail_url: null, notes: null, created_at: '', updated_at: '' } },
    ],
  }),
  makeStrategy('strat-2', 1, {
    is_active: false,
  }),
];

// ─── Tests ───────────────────────────────────────────────────────

describe('StrategyList', () => {
  const mockOnReorder = vi.fn().mockResolvedValue(undefined);
  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders one item per strategy with priority number and team name', () => {
    render(
      <StrategyList
        strategies={strategies}
        onReorder={mockOnReorder}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    // Priority badges showing 1 and 2 (index + 1)
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    // Team name for first strategy
    expect(screen.getByText('Rush Team')).toBeInTheDocument();
  });

  it('renders edit and delete buttons for each strategy', () => {
    render(
      <StrategyList
        strategies={strategies}
        onReorder={mockOnReorder}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    const editButtons = screen.getAllByText('Edit');
    const deleteButtons = screen.getAllByText('Delete');
    expect(editButtons).toHaveLength(2);
    expect(deleteButtons).toHaveLength(2);
  });

  it('calls onEdit when edit button is clicked', () => {
    render(
      <StrategyList
        strategies={strategies}
        onReorder={mockOnReorder}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    const editButtons = screen.getAllByText('Edit');
    fireEvent.click(editButtons[0]);

    expect(mockOnEdit).toHaveBeenCalledWith(strategies[0]);
  });

  it('calls onDelete when delete button is clicked after confirm', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    render(
      <StrategyList
        strategies={strategies}
        onReorder={mockOnReorder}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);

    expect(window.confirm).toHaveBeenCalledWith('Delete this strategy?');
    expect(mockOnDelete).toHaveBeenCalledWith('strat-1');
  });

  it('renders "No strategies yet" when list is empty', () => {
    render(
      <StrategyList
        strategies={[]}
        onReorder={mockOnReorder}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText(/No strategies yet/)).toBeInTheDocument();
  });

  it('renders drag handle icon for each item', () => {
    render(
      <StrategyList
        strategies={strategies}
        onReorder={mockOnReorder}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    const handles = screen.getAllByTestId('drag-handle');
    expect(handles).toHaveLength(2);
  });
});
