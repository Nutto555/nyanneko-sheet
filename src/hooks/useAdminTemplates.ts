import { useState, useEffect, useCallback } from 'react';
import type { EnemyDefenseTemplate, EnemyDefenseTemplateWithMembers } from '../types/database';
import {
  getEnemyTemplates,
  createEnemyTemplate,
  updateEnemyTemplate,
  deleteEnemyTemplate,
  replaceTemplateMembers,
} from '../services/strategies';

export function useAdminTemplates(): {
  templates: EnemyDefenseTemplateWithMembers[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  createTemplate: (input: {
    name_en: string;
    slug: string;
    name_th?: string | null;
    description?: string | null;
    is_featured?: boolean;
    sort_order?: number;
  }) => Promise<EnemyDefenseTemplate>;
  updateTemplate: (id: string, input: {
    name_en?: string;
    slug?: string;
    name_th?: string | null;
    description?: string | null;
    is_featured?: boolean;
    sort_order?: number;
  }) => Promise<void>;
  deleteTemplate: (id: string) => Promise<void>;
  replaceMembers: (templateId: string, members: ReadonlyArray<{ character_id: string; position: number }>) => Promise<void>;
} {
  const [templates, setTemplates] = useState<EnemyDefenseTemplateWithMembers[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const data = await getEnemyTemplates();
      setTemplates(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to fetch templates');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleCreateTemplate = useCallback(async (input: {
    name_en: string;
    slug: string;
    name_th?: string | null;
    description?: string | null;
    is_featured?: boolean;
    sort_order?: number;
  }): Promise<EnemyDefenseTemplate> => {
    const result = await createEnemyTemplate(input);
    await refresh();
    return result;
  }, [refresh]);

  const handleUpdateTemplate = useCallback(async (id: string, input: {
    name_en?: string;
    slug?: string;
    name_th?: string | null;
    description?: string | null;
    is_featured?: boolean;
    sort_order?: number;
  }): Promise<void> => {
    await updateEnemyTemplate(id, input);
    await refresh();
  }, [refresh]);

  const handleDeleteTemplate = useCallback(async (id: string): Promise<void> => {
    await deleteEnemyTemplate(id);
    await refresh();
  }, [refresh]);

  const handleReplaceMembers = useCallback(async (
    templateId: string,
    members: ReadonlyArray<{ character_id: string; position: number }>,
  ): Promise<void> => {
    await replaceTemplateMembers(templateId, members);
    await refresh();
  }, [refresh]);

  return {
    templates,
    loading,
    error,
    refresh,
    createTemplate: handleCreateTemplate,
    updateTemplate: handleUpdateTemplate,
    deleteTemplate: handleDeleteTemplate,
    replaceMembers: handleReplaceMembers,
  };
}
