import type { EnemyDefenseTemplateWithMembers } from '../../types/database';
import { CharacterPortrait } from '../character-portrait/CharacterPortrait';

interface TemplateListProps {
  templates: ReadonlyArray<EnemyDefenseTemplateWithMembers>;
  onEdit: (template: EnemyDefenseTemplateWithMembers) => void;
  onDelete: (templateId: string) => Promise<void>;
}

export function TemplateList({
  templates,
  onEdit,
  onDelete,
}: TemplateListProps): React.JSX.Element {
  if (templates.length === 0) {
    return (
      <div className="text-sm text-slate-500 text-center py-8">
        No templates yet. Click &quot;Add Template&quot; to create one.
      </div>
    );
  }

  function handleDelete(templateId: string): void {
    if (!window.confirm('Delete this template?')) return;
    onDelete(templateId);
  }

  return (
    <div className="space-y-2">
      {templates.map((template) => {
        const memberCount = template.enemy_defense_members.length;
        const sortedMembers = [...template.enemy_defense_members].sort(
          (a, b) => a.position - b.position,
        );

        return (
          <div
            key={template.id}
            className="flex items-center gap-3 px-4 py-3 rounded-lg border border-slate-700 bg-slate-800/30"
          >
            {/* Featured indicator */}
            {template.is_featured && (
              <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
            )}

            {/* Template name */}
            <span className="text-sm text-white font-medium truncate">
              {template.name_en}
            </span>

            {/* Member portraits */}
            <div className="flex gap-1 shrink-0">
              {sortedMembers.map((m) => (
                <CharacterPortrait
                  key={m.id}
                  character={m.characters}
                  size="sm"
                />
              ))}
            </div>

            {/* Member count */}
            <span className="text-xs text-slate-500 shrink-0">
              {memberCount} {memberCount === 1 ? 'character' : 'characters'}
            </span>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Actions */}
            <button
              type="button"
              onClick={() => onEdit(template)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={() => handleDelete(template.id)}
              className="text-xs text-red-400 hover:text-red-300"
            >
              Delete
            </button>
          </div>
        );
      })}
    </div>
  );
}
