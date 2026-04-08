import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { CounterStrategyWithConditions, TeamWithMembers } from '../../types/database';
import { CharacterPortrait } from '../character-portrait/CharacterPortrait';

interface StrategyListProps {
  strategies: CounterStrategyWithConditions[];
  onReorder: (orderedIds: string[]) => Promise<void>;
  onEdit: (strategy: CounterStrategyWithConditions) => void;
  onDelete: (strategyId: string) => Promise<void>;
}

interface SortableStrategyItemProps {
  strategy: CounterStrategyWithConditions;
  index: number;
  onEdit: (strategy: CounterStrategyWithConditions) => void;
  onDelete: (strategyId: string) => Promise<void>;
}

function SortableStrategyItem({ strategy, index, onEdit, onDelete }: SortableStrategyItemProps): React.JSX.Element {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: strategy.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition ?? undefined,
  };

  const mustHaveCount = strategy.strategy_conditions.filter((c) => c.condition_type === 'must_have').length;
  const mustNotHaveCount = strategy.strategy_conditions.filter((c) => c.condition_type === 'must_not_have').length;

  const team = strategy.team_compositions as (TeamWithMembers | null);
  const teamMembers = team && 'team_members' in team ? team.team_members : [];

  function handleDelete(): void {
    if (window.confirm('Delete this strategy?')) {
      onDelete(strategy.id);
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 px-4 py-3 rounded-lg border border-slate-700 bg-slate-800/30"
    >
      {/* Drag handle */}
      <div
        data-testid="drag-handle"
        className="cursor-grab text-slate-500 hover:text-slate-300 select-none"
        {...attributes}
        {...listeners}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <circle cx="5" cy="3" r="1.5" />
          <circle cx="11" cy="3" r="1.5" />
          <circle cx="5" cy="8" r="1.5" />
          <circle cx="11" cy="8" r="1.5" />
          <circle cx="5" cy="13" r="1.5" />
          <circle cx="11" cy="13" r="1.5" />
        </svg>
      </div>

      {/* Priority badge */}
      <div className="w-6 h-6 rounded-full bg-amber-600/20 text-amber-400 text-xs font-bold flex items-center justify-center shrink-0">
        {index + 1}
      </div>

      {/* Team info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          {team ? (
            <>
              <span className="text-sm text-white font-medium truncate">{team.name}</span>
              {teamMembers && teamMembers.length > 0 && (
                <div className="flex gap-1">
                  {teamMembers.map((m) => (
                    <CharacterPortrait key={m.id ?? m.character_id} character={m.characters} size="sm" />
                  ))}
                </div>
              )}
            </>
          ) : (
            <span className="text-sm text-slate-500 italic">No team assigned</span>
          )}
        </div>

        {/* Condition summary */}
        {(mustHaveCount > 0 || mustNotHaveCount > 0) && (
          <div className="text-xs text-slate-500 mt-0.5">
            {mustHaveCount > 0 && <span className="text-green-400">{mustHaveCount} must have</span>}
            {mustHaveCount > 0 && mustNotHaveCount > 0 && <span> / </span>}
            {mustNotHaveCount > 0 && <span className="text-red-400">{mustNotHaveCount} must not have</span>}
          </div>
        )}
      </div>

      {/* Active status */}
      {!strategy.is_active && (
        <span className="bg-red-900/30 text-red-400 text-xs px-2 py-0.5 rounded">
          Inactive
        </span>
      )}

      {/* Updated at */}
      <span className="text-xs text-slate-500 shrink-0">
        {new Date(strategy.updated_at).toLocaleDateString()}
      </span>

      {/* Edit button */}
      <button
        type="button"
        onClick={() => onEdit(strategy)}
        className="text-xs text-slate-400 hover:text-white"
      >
        Edit
      </button>

      {/* Delete button */}
      <button
        type="button"
        onClick={handleDelete}
        className="text-xs text-red-400 hover:text-red-300"
      >
        Delete
      </button>
    </div>
  );
}

export function StrategyList({
  strategies,
  onReorder,
  onEdit,
  onDelete,
}: StrategyListProps): React.JSX.Element {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function handleDragEnd(event: DragEndEvent): void {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = strategies.findIndex((s) => s.id === active.id);
    const newIndex = strategies.findIndex((s) => s.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(strategies, oldIndex, newIndex);
    onReorder(reordered.map((s) => s.id));
  }

  if (strategies.length === 0) {
    return (
      <div className="text-sm text-slate-500 text-center py-8">
        No strategies yet. Click &quot;Add Strategy&quot; to create one.
      </div>
    );
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={strategies.map((s) => s.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2">
          {strategies.map((strategy, index) => (
            <SortableStrategyItem
              key={strategy.id}
              strategy={strategy}
              index={index}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
