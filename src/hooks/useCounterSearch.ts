import { useState, useEffect, useMemo } from 'react';
import type {
  Character,
  EnemyDefenseTemplateWithMembers,
  CounterStrategyWithConditions,
} from '../types/database';
import type { MatchResult } from '../utils/strategyMatcher';
import { resolveMatchingStrategies } from '../utils/strategyMatcher';
import { getEnemyTemplates, getAllActiveStrategies } from '../services/strategies';
import { getCharacters } from '../services/characters';

export function useCounterSearch(): {
  characters: Character[];
  selectedEnemies: Character[];
  setSelectedEnemies: (chars: Character[]) => void;
  results: MatchResult[];
  templates: EnemyDefenseTemplateWithMembers[];
  loading: boolean;
  error: string | null;
} {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [templates, setTemplates] = useState<EnemyDefenseTemplateWithMembers[]>([]);
  const [allStrategies, setAllStrategies] = useState<CounterStrategyWithConditions[]>([]);
  const [selectedEnemies, setSelectedEnemies] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    Promise.all([getCharacters(), getEnemyTemplates(), getAllActiveStrategies()])
      .then(([chars, tmpls, strats]) => {
        if (cancelled) return;
        setCharacters(chars);
        setTemplates(tmpls);
        setAllStrategies(strats);
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        const message = e instanceof Error ? e.message : 'Failed to load counter data';
        setError(message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const results = useMemo<MatchResult[]>(() => {
    if (selectedEnemies.length === 0) return [];
    return resolveMatchingStrategies(
      templates,
      allStrategies,
      selectedEnemies.map((c) => c.id),
    );
  }, [selectedEnemies, templates, allStrategies]);

  return {
    characters,
    selectedEnemies,
    setSelectedEnemies,
    results,
    templates,
    loading,
    error,
  };
}
