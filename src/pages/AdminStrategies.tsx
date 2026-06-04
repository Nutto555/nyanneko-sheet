import { useState } from 'react';
import { Link } from 'react-router';
import { AdminAuthGate } from '../components/admin/AdminAuthGate';
import { useAdminAuth } from '../hooks/useAdminAuth';
import { useAdminTemplates } from '../hooks/useAdminTemplates';
import { useAdminStrategies } from '../hooks/useAdminStrategies';
import { useCharacters } from '../hooks/useCharacters';
import { StrategyForm, type StrategyFormData } from '../components/admin/StrategyForm';
import { StrategyList } from '../components/admin/StrategyList';
import { CharacterPortrait } from '../components/character-portrait/CharacterPortrait';
import { PageHeader } from '../components/ui/PageHeader';
import { SkeletonCard, SkeletonText } from '../components/ui/Skeleton';
import type { CounterStrategyWithConditions, EnemyDefenseTemplateWithMembers } from '../types/database';

type EditingState = null | 'new' | CounterStrategyWithConditions;

function StrategyBuilderContent(): React.JSX.Element {
  const { logout } = useAdminAuth();
  const { characters } = useCharacters();
  const { templates, loading: templatesLoading } = useAdminTemplates();

  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [editingStrategy, setEditingStrategy] = useState<EditingState>(null);
  const [saving, setSaving] = useState(false);

  const {
    strategies,
    loading: strategiesLoading,
    error: strategiesError,
    createStrategy,
    updateStrategy,
    deleteStrategy,
    replaceConditions,
    reorder,
  } = useAdminStrategies(selectedTemplateId);

  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId) ?? null;

  async function handleSave(data: StrategyFormData): Promise<void> {
    if (!selectedTemplateId) return;
    setSaving(true);
    try {
      if (editingStrategy === 'new') {
        const created = await createStrategy({
          template_id: selectedTemplateId,
          priority: strategies.length,
          condition_note: data.conditionNote || null,
          strategy_notes: data.strategyNotes || null,
          is_active: data.isActive,
        });
        if (data.conditions.length > 0) {
          await replaceConditions(
            created.id,
            data.conditions.map((c) => ({
              strategy_id: created.id,
              character_id: c.character.id,
              condition_type: c.condition_type,
            })),
          );
        }
      } else if (editingStrategy) {
        await updateStrategy(editingStrategy.id, {
          condition_note: data.conditionNote || null,
          strategy_notes: data.strategyNotes || null,
          is_active: data.isActive,
        });
        await replaceConditions(
          editingStrategy.id,
          data.conditions.map((c) => ({
            strategy_id: editingStrategy.id,
            character_id: c.character.id,
            condition_type: c.condition_type,
          })),
        );
      }
      setEditingStrategy(null);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(strategyId: string): Promise<void> {
    await deleteStrategy(strategyId);
  }

  async function handleReorder(orderedIds: string[]): Promise<void> {
    await reorder(orderedIds);
  }

  function renderTemplateSelector(): React.JSX.Element {
    return (
      <div className="mb-6">
        <label className="text-sm font-medium text-slate-300 block mb-2">
          Enemy Defense Template
        </label>
        {templatesLoading ? (
          <SkeletonText lines={3} />
        ) : templates.length === 0 ? (
          <p className="text-xs text-slate-500">
            No templates found. Create templates in the template manager first.
          </p>
        ) : (
          <div className="space-y-1">
            {templates.map((template: EnemyDefenseTemplateWithMembers) => (
              <button
                key={template.id}
                type="button"
                onClick={() => {
                  setSelectedTemplateId(template.id);
                  setEditingStrategy(null);
                }}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors duration-150 ${
                  selectedTemplateId === template.id
                    ? 'bg-amber-600/20 border border-amber-600/40 text-white'
                    : 'bg-slate-800/30 border border-slate-700 text-slate-300 hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{template.name_en}</span>
                  <span className="text-xs text-slate-500">
                    {template.enemy_defense_members.length} members
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  function renderSelectedTemplatePreview(): React.JSX.Element | null {
    if (!selectedTemplate) return null;
    return (
      <div className="mb-4 p-3 rounded-lg border border-slate-700/50 bg-slate-900/30">
        <div className="text-xs font-bold text-slate-400 uppercase mb-2">Enemy Defense</div>
        <div className="flex gap-2">
          {selectedTemplate.enemy_defense_members
            .sort((a, b) => a.position - b.position)
            .map((m) => (
              <CharacterPortrait
                key={m.id}
                character={m.characters}
                size="md"
                showName
              />
            ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 page-enter">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-2">
        <div className="flex-1 min-w-0">
          <PageHeader
            title="Strategy Builder"
            subtitle="Create and manage counter strategies"
          />
        </div>
        <div className="flex items-center gap-3 shrink-0 mt-1">
          <Link
            to="/admin"
            className="text-xs text-slate-400 hover:text-white transition-colors duration-150"
          >
            Back to Admin
          </Link>
          <button
            type="button"
            onClick={logout}
            className="px-3 py-1.5 rounded text-xs font-medium bg-slate-700 hover:bg-slate-600 text-white"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left sidebar: Template selector */}
        <div className="lg:col-span-1">
          {renderTemplateSelector()}
        </div>

        {/* Main area: Strategy list + form */}
        <div className="lg:col-span-2">
          {!selectedTemplateId ? (
            <div className="text-center py-12 text-slate-500 text-sm">
              Select an enemy defense template to manage its counter strategies.
            </div>
          ) : (
            <>
              {renderSelectedTemplatePreview()}

              {/* Strategy list header */}
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-bold text-white">
                  Counter Strategies ({strategies.length})
                </h2>
                <button
                  type="button"
                  onClick={() => setEditingStrategy('new')}
                  className="px-3 py-1.5 rounded text-xs font-medium bg-amber-600 hover:bg-amber-500 text-white"
                >
                  + Add Strategy
                </button>
              </div>

              {/* Loading / Error */}
              {strategiesLoading && (
                <div className="space-y-3 mb-3">
                  <SkeletonCard />
                  <SkeletonCard />
                </div>
              )}
              {strategiesError && (
                <p className="text-red-400 text-xs mb-3">{strategiesError}</p>
              )}

              {/* Strategy form */}
              {editingStrategy !== null && (
                <div className="mb-4">
                  <StrategyForm
                    characters={characters}
                    strategy={editingStrategy === 'new' ? null : editingStrategy}
                    onSave={handleSave}
                    onCancel={() => setEditingStrategy(null)}
                    saving={saving}
                  />
                </div>
              )}

              {/* Strategy list */}
              <StrategyList
                strategies={strategies}
                onReorder={handleReorder}
                onEdit={(strategy) => setEditingStrategy(strategy)}
                onDelete={handleDelete}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminStrategies(): React.JSX.Element {
  return (
    <AdminAuthGate>
      <StrategyBuilderContent />
    </AdminAuthGate>
  );
}
