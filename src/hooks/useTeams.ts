import { useState, useEffect } from 'react';
import type { TeamComposition } from '../types/database';
import { getTeamCompositions } from '../services/teams';

export function useTeams() {
  const [teams, setTeams] = useState<TeamComposition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getTeamCompositions()
      .then(setTeams)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return { teams, loading, error };
}
