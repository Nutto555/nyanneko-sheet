import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAdminTemplates } from './useAdminTemplates';
import type {
  EnemyDefenseTemplate,
  EnemyDefenseTemplateWithMembers,
} from '../types/database';

// ─── Mocks ────────────────────────────────────────────────────

vi.mock('../services/strategies', () => ({
  getEnemyTemplates: vi.fn(),
  createEnemyTemplate: vi.fn(),
  updateEnemyTemplate: vi.fn(),
  deleteEnemyTemplate: vi.fn(),
  replaceTemplateMembers: vi.fn(),
}));

import {
  getEnemyTemplates,
  createEnemyTemplate,
  updateEnemyTemplate,
  deleteEnemyTemplate,
  replaceTemplateMembers,
} from '../services/strategies';

// ─── Helpers ──────────────────────────────────────────────────

function makeTemplate(
  overrides: Partial<EnemyDefenseTemplateWithMembers> = {},
): EnemyDefenseTemplateWithMembers {
  return {
    id: 'tmpl-1',
    name_en: 'Lubu Sustain',
    name_th: null,
    slug: 'lubu-sustain',
    description: null,
    is_featured: false,
    sort_order: 0,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    enemy_defense_members: [],
    ...overrides,
  };
}

function makeBaseTemplate(
  overrides: Partial<EnemyDefenseTemplate> = {},
): EnemyDefenseTemplate {
  return {
    id: 'tmpl-new',
    name_en: 'New Template',
    name_th: null,
    slug: 'new-template',
    description: null,
    is_featured: false,
    sort_order: 0,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

// ─── Tests ────────────────────────────────────────────────────

describe('useAdminTemplates', () => {
  const mockTemplates = [makeTemplate()];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getEnemyTemplates).mockResolvedValue(mockTemplates);
    vi.mocked(createEnemyTemplate).mockResolvedValue(makeBaseTemplate());
    vi.mocked(updateEnemyTemplate).mockResolvedValue(undefined);
    vi.mocked(deleteEnemyTemplate).mockResolvedValue(undefined);
    vi.mocked(replaceTemplateMembers).mockResolvedValue(undefined);
  });

  it('returns { templates, loading, error, refresh } on mount', async () => {
    const { result } = renderHook(() => useAdminTemplates());

    expect(result.current.loading).toBe(true);

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.templates).toEqual(mockTemplates);
    expect(result.current.error).toBeNull();
    expect(typeof result.current.refresh).toBe('function');
    expect(typeof result.current.createTemplate).toBe('function');
    expect(typeof result.current.updateTemplate).toBe('function');
    expect(typeof result.current.deleteTemplate).toBe('function');
    expect(typeof result.current.replaceMembers).toBe('function');
  });

  it('refresh() re-fetches templates from service', async () => {
    const { result } = renderHook(() => useAdminTemplates());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(getEnemyTemplates).toHaveBeenCalledTimes(1);

    const updatedTemplates = [makeTemplate({ id: 'tmpl-2', name_en: 'Updated' })];
    vi.mocked(getEnemyTemplates).mockResolvedValue(updatedTemplates);

    await act(async () => {
      await result.current.refresh();
    });

    expect(getEnemyTemplates).toHaveBeenCalledTimes(2);
    expect(result.current.templates).toEqual(updatedTemplates);
  });

  it('mutation functions call service and auto-refresh', async () => {
    const { result } = renderHook(() => useAdminTemplates());
    await waitFor(() => expect(result.current.loading).toBe(false));

    // createTemplate
    await act(async () => {
      await result.current.createTemplate({ name_en: 'Test', slug: 'test' });
    });
    expect(createEnemyTemplate).toHaveBeenCalledWith({ name_en: 'Test', slug: 'test' });
    expect(getEnemyTemplates).toHaveBeenCalledTimes(2); // initial + after create

    // updateTemplate
    await act(async () => {
      await result.current.updateTemplate('tmpl-1', { name_en: 'Updated' });
    });
    expect(updateEnemyTemplate).toHaveBeenCalledWith('tmpl-1', { name_en: 'Updated' });
    expect(getEnemyTemplates).toHaveBeenCalledTimes(3);

    // deleteTemplate
    await act(async () => {
      await result.current.deleteTemplate('tmpl-1');
    });
    expect(deleteEnemyTemplate).toHaveBeenCalledWith('tmpl-1');
    expect(getEnemyTemplates).toHaveBeenCalledTimes(4);

    // replaceMembers
    await act(async () => {
      await result.current.replaceMembers('tmpl-1', [{ character_id: 'c1', position: 1 }]);
    });
    expect(replaceTemplateMembers).toHaveBeenCalledWith('tmpl-1', [{ character_id: 'c1', position: 1 }]);
    expect(getEnemyTemplates).toHaveBeenCalledTimes(5);
  });
});
