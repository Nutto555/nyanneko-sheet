import { useState, useEffect, useCallback } from 'react';
import type { CounterStrategy, CounterStrategyWithConditions, ConditionType } from '../types/database';
import {
  getAllCounterStrategies,
  createCounterStrategy,
  updateCounterStrategy,
  deleteCounterStrategy,
  replaceStrategyConditions,
  reorderStrategies,
} from '../services/strategies';

export function useAdminStrategies(templateId: string | null): {
  strategies: CounterStrategyWithConditions[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  createStrategy: (input: {
    template_id: string;
    counter_team_id?: string | null;
    priority: number;
    condition_note?: string | null;
    strategy_notes?: string | null;
    is_active?: boolean;
  }) => Promise<CounterStrategy>;
  updateStrategy: (id: string, input: {
    counter_team_id?: string | null;
    priority?: number;
    condition_note?: string | null;
    strategy_notes?: string | null;
    is_active?: boolean;
  }) => Promise<void>;
  deleteStrategy: (id: string) => Promise<void>;
  replaceConditions: (strategyId: string, conditions: ReadonlyArray<{
    strategy_id: string;
    character_id: string;
    condition_type: ConditionType;
  }>) => Promise<void>;
  reorder: (orderedIds: readonly string[]) => Promise<void>;
} {
  const [strategies, setStrategies] = useState<CounterStrategyWithConditions[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async (): Promise<void> => {
    if (templateId === null) {
      setStrategies([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await getAllCounterStrategies(templateId);
      setStrategies(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to fetch strategies');
    } finally {
      setLoading(false);
    }
  }, [templateId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleCreateStrategy = useCallback(async (input: {
    template_id: string;
    counter_team_id?: string | null;
    priority: number;
    condition_note?: string | null;
    strategy_notes?: string | null;
    is_active?: boolean;
  }): Promise<CounterStrategy> => {
    const result = await createCounterStrategy(input);
    await refresh();
    return result;
  }, [refresh]);

  const handleUpdateStrategy = useCallback(async (id: string, input: {
    counter_team_id?: string | null;
    priority?: number;
    condition_note?: string | null;
    strategy_notes?: string | null;
    is_active?: boolean;
  }): Promise<void> => {
    await updateCounterStrategy(id, input);
    await refresh();
  }, [refresh]);

  const handleDeleteStrategy = useCallback(async (id: string): Promise<void> => {
    await deleteCounterStrategy(id);
    await refresh();
  }, [refresh]);

  const handleReplaceConditions = useCallback(async (
    strategyId: string,
    conditions: ReadonlyArray<{
      strategy_id: string;
      character_id: string;
      condition_type: ConditionType;
    }>,
  ): Promise<void> => {
    await replaceStrategyConditions(strategyId, conditions);
    await refresh();
  }, [refresh]);

  const handleReorder = useCallback(async (orderedIds: readonly string[]): Promise<void> => {
    if (templateId === null) return;
    await reorderStrategies(templateId, orderedIds);
    await refresh();
  }, [templateId, refresh]);

  return {
    strategies,
    loading,
    error,
    refresh,
    createStrategy: handleCreateStrategy,
    updateStrategy: handleUpdateStrategy,
    deleteStrategy: handleDeleteStrategy,
    replaceConditions: handleReplaceConditions,
    reorder: handleReorder,
  };
}
