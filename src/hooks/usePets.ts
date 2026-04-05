import { useState, useEffect } from 'react';
import type { Pet } from '../types/database';
import { getPets } from '../services/pets';

export function usePets() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getPets()
      .then(setPets)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return { pets, loading, error };
}
