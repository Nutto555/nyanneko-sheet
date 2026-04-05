import { useState, useEffect } from 'react';
import type { Ring } from '../types/database';
import { getRings } from '../services/rings';

export function useRings() {
  const [rings, setRings] = useState<Ring[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getRings()
      .then(setRings)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return { rings, loading, error };
}
