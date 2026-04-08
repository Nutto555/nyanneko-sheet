import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAdminStrategies } from './useAdminStrategies';
import type {
  CounterStrategy,
  CounterStrategyWithConditions,
} from '../types/database';

// ─── Mocks ────────────────────────────────────────────────────

vi.mock('../services/strategies', () => ({
  getAllCounterStrategies: vi.fn(),
  createCounterStrategy: vi.fn(),
  updateCounterStrategy: vi.fn(),
  deleteCounterStrategy: vi.fn(),
  replaceStrategyConditions: vi.fn(),
  reorderStrategies: vi.fn(),
}));

import {
  getAllCounterStrategies,
  createCounterStrategy,
  updateCounterStrategy,
  deleteCounterStrategy,
  replaceStrategyConditions,
  reorderStrategies,
} from '../services/strategies';

// ─── Helpers ──────────────────────────────────────────────────

function makeStrategy(
  overrides: Partial<CounterStrategyWithConditions> = {},
): CounterStrategyWithConditions {
  return {
    id: 'strat-1',
    template_id: 'tmpl-1',
    counter_team_id: 'team-1',
    priority: 0,
    condition_note: null,
    strategy_notes: null,
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    strategy_conditions: [],
    team_compositions: null,
    ...overrides,
  };
}

function makeBaseStrategy(
  overrides: Partial<CounterStrategy> = {},
): CounterStrategy {
  return {
    id: 'strat-new',
    template_id: 'tmpl-1',
    counter_team_id: null,
    priority: 0,
    condition_note: null,
    strategy_notes: null,
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

// ─── Tests ────────────────────────────────────────────────────

describe('useAdminStrategies', () => {
  const templateId = 'tmpl-1';
  const mockStrategies = [makeStrategy()];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getAllCounterStrategies).mockResolvedValue(mockStrategies);
    vi.mocked(createCounterStrategy).mockResolvedValue(makeBaseStrategy());
    vi.mocked(updateCounterStrategy).mockResolvedValue(undefined);
    vi.mocked(deleteCounterStrategy).mockResolvedValue(undefined);
    vi.mocked(replaceStrategyConditions).mockResolvedValue(undefined);
    vi.mocked(reorderStrategies).mockResolvedValue(undefined);
  });

  it('returns { strategies, loading, error, refresh } on mount with templateId', async () => {
    const { result } = renderHook(() => useAdminStrategies(templateId));

    expect(result.current.loading).toBe(true);

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.strategies).toEqual(mockStrategies);
    expect(result.current.error).toBeNull();
    expect(typeof result.current.refresh).toBe('function');
    expect(typeof result.current.createStrategy).toBe('function');
    expect(typeof result.current.updateStrategy).toBe('function');
    expect(typeof result.current.deleteStrategy).toBe('function');
    expect(typeof result.current.replaceConditions).toBe('function');
    expect(typeof result.current.reorder).toBe('function');
  });

  it('refresh() re-fetches strategies for the given templateId', async () => {
    const { result } = renderHook(() => useAdminStrategies(templateId));
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(getAllCounterStrategies).toHaveBeenCalledWith(templateId);
    expect(getAllCounterStrategies).toHaveBeenCalledTimes(1);

    const updated = [makeStrategy({ id: 'strat-2' })];
    vi.mocked(getAllCounterStrategies).mockResolvedValue(updated);

    await act(async () => {
      await result.current.refresh();
    });

    expect(getAllCounterStrategies).toHaveBeenCalledTimes(2);
    expect(result.current.strategies).toEqual(updated);
  });

  it('returns empty strategies when templateId is null', async () => {
    const { result } = renderHook(() => useAdminStrategies(null));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.strategies).toEqual([]);
    expect(getAllCounterStrategies).not.toHaveBeenCalled();
  });

  it('mutation functions call service and auto-refresh', async () => {
    const { result } = renderHook(() => useAdminStrategies(templateId));
    await waitFor(() => expect(result.current.loading).toBe(false));

    // createStrategy
    await act(async () => {
      await result.current.createStrategy({ template_id: templateId, priority: 0 });
    });
    expect(createCounterStrategy).toHaveBeenCalledWith({ template_id: templateId, priority: 0 });
    expect(getAllCounterStrategies).toHaveBeenCalledTimes(2);

    // updateStrategy
    await act(async () => {
      await result.current.updateStrategy('strat-1', { priority: 1 });
    });
    expect(updateCounterStrategy).toHaveBeenCalledWith('strat-1', { priority: 1 });
    expect(getAllCounterStrategies).toHaveBeenCalledTimes(3);

    // deleteStrategy
    await act(async () => {
      await result.current.deleteStrategy('strat-1');
    });
    expect(deleteCounterStrategy).toHaveBeenCalledWith('strat-1');
    expect(getAllCounterStrategies).toHaveBeenCalledTimes(4);

    // replaceConditions
    const conditions = [{ strategy_id: 'strat-1', character_id: 'c1', condition_type: 'must_have' as const }];
    await act(async () => {
      await result.current.replaceConditions('strat-1', conditions);
    });
    expect(replaceStrategyConditions).toHaveBeenCalledWith('strat-1', conditions);
    expect(getAllCounterStrategies).toHaveBeenCalledTimes(5);

    // reorder
    await act(async () => {
      await result.current.reorder(['strat-2', 'strat-1']);
    });
    expect(reorderStrategies).toHaveBeenCalledWith(templateId, ['strat-2', 'strat-1']);
    expect(getAllCounterStrategies).toHaveBeenCalledTimes(6);
  });
});
