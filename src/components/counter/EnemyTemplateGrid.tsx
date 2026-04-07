import type { EnemyDefenseTemplateWithMembers } from '../../types/database';
import Card from '../ui/Card';
import { CharacterPortrait } from '../character-portrait/CharacterPortrait';

interface EnemyTemplateGridProps {
  templates: ReadonlyArray<EnemyDefenseTemplateWithMembers>;
  onSelect: (template: EnemyDefenseTemplateWithMembers) => void;
}

export function EnemyTemplateGrid({ templates, onSelect }: EnemyTemplateGridProps): React.JSX.Element {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Popular Defense Comps</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
        {templates.map((template) => (
          <Card key={template.id} onClick={() => onSelect(template)}>
            <div className="flex flex-wrap gap-1">
              {template.enemy_defense_members.map((member) => (
                <CharacterPortrait
                  key={member.id}
                  character={member.characters}
                  size="sm"
                />
              ))}
            </div>
            <div className="flex items-center gap-1 mt-2">
              {template.is_featured && (
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ background: 'var(--color-gold)' }}
                />
              )}
              <span className="text-sm font-semibold">{template.name_en}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
