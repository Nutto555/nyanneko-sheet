import { useState } from 'react';
import { Link } from 'react-router';
import { AdminAuthGate } from '../components/admin/AdminAuthGate';
import { useAdminAuth } from '../hooks/useAdminAuth';
import { useAdminTemplates } from '../hooks/useAdminTemplates';
import { useCharacters } from '../hooks/useCharacters';
import { TemplateForm, type TemplateFormData } from '../components/admin/TemplateForm';
import { TemplateList } from '../components/admin/TemplateList';
import type { EnemyDefenseTemplateWithMembers } from '../types/database';

type EditingState = null | 'new' | EnemyDefenseTemplateWithMembers;

function TemplateManagerContent(): React.JSX.Element {
  const { logout } = useAdminAuth();
  const { characters, loading: charsLoading } = useCharacters();
  const {
    templates,
    loading: templatesLoading,
    error: templatesError,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    replaceMembers,
  } = useAdminTemplates();

  const [editingTemplate, setEditingTemplate] = useState<EditingState>(null);
  const [saving, setSaving] = useState(false);

  async function handleSave(data: TemplateFormData): Promise<void> {
    setSaving(true);
    try {
      const slug = data.name_en
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        .slice(0, 80);

      const members = data.characters.map((c, i) => ({
        character_id: c.id,
        position: i,
      }));

      if (editingTemplate === 'new') {
        const created = await createTemplate({
          name_en: data.name_en,
          slug,
          name_th: data.name_th || null,
          description: data.description || null,
          is_featured: data.is_featured,
          sort_order: templates.length,
        });
        if (members.length > 0) {
          await replaceMembers(created.id, members);
        }
      } else if (editingTemplate) {
        await updateTemplate(editingTemplate.id, {
          name_en: data.name_en,
          slug,
          name_th: data.name_th || null,
          description: data.description || null,
          is_featured: data.is_featured,
        });
        await replaceMembers(editingTemplate.id, members);
      }
      setEditingTemplate(null);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(templateId: string): Promise<void> {
    await deleteTemplate(templateId);
    if (editingTemplate && typeof editingTemplate === 'object' && editingTemplate.id === templateId) {
      setEditingTemplate(null);
    }
  }

  const loading = templatesLoading || charsLoading;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">Template Manager</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Create and manage enemy defense templates
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/admin"
            className="text-xs text-slate-400 hover:text-white transition-colors duration-150"
          >
            Admin Home
          </Link>
          <Link
            to="/admin/strategies"
            className="text-xs text-slate-400 hover:text-white transition-colors duration-150"
          >
            Strategy Builder
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

      {/* Add template button */}
      <div className="flex justify-end mb-4">
        <button
          type="button"
          onClick={() => setEditingTemplate('new')}
          className="px-3 py-1.5 rounded text-xs font-medium bg-amber-600 hover:bg-amber-500 text-white"
        >
          + Add Template
        </button>
      </div>

      {/* Loading / Error */}
      {loading && <p className="text-xs text-slate-500 mb-4">Loading...</p>}
      {templatesError && (
        <p className="text-red-400 text-xs mb-4">{templatesError}</p>
      )}

      {/* Editing form */}
      {editingTemplate !== null && (
        <div className="mb-4">
          <TemplateForm
            characters={characters}
            template={editingTemplate === 'new' ? null : editingTemplate}
            onSave={handleSave}
            onCancel={() => setEditingTemplate(null)}
            saving={saving}
          />
        </div>
      )}

      {/* Template list */}
      <TemplateList
        templates={templates}
        onEdit={(template) => setEditingTemplate(template)}
        onDelete={handleDelete}
      />
    </div>
  );
}

export default function AdminTemplates(): React.JSX.Element {
  return (
    <AdminAuthGate>
      <TemplateManagerContent />
    </AdminAuthGate>
  );
}
