import { useState, useEffect } from 'react';
import type { EquipmentSet, EquipmentItem } from '../types/database';
import { getEquipmentSets, getEquipmentItems } from '../services/equipment';

export function useEquipmentSets() {
  const [sets, setSets] = useState<EquipmentSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getEquipmentSets()
      .then(setSets)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return { sets, loading, error };
}

export function useEquipmentItems() {
  const [items, setItems] = useState<EquipmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getEquipmentItems()
      .then(setItems)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return { items, loading, error };
}
