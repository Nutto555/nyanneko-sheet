import { supabase } from '../lib/supabase';
import type { EquipmentSet, EquipmentItem, EquipmentSetWithItems } from '../types/database';
import seedData from '../../scripts/seed-data.json';

const isSupabaseConfigured = () => {
  const url = import.meta.env.VITE_SUPABASE_URL;
  return url && url !== '' && url !== 'undefined';
};

const localSets: EquipmentSet[] = (seedData.equipment_sets || []).map((s, i) => ({
  id: `local-set-${i}`,
  name_en: s.name_en,
  name_th: s.name_th || null,
  slug: s.slug,
  icon_url: null,
  description: s.description || null,
  created_at: new Date().toISOString(),
}));

const localItems: EquipmentItem[] = (seedData.equipment_items || []).map((item, i) => ({
  id: `local-item-${i}`,
  name_en: item.name_en,
  name_th: item.name_th || null,
  slug: item.slug,
  set_id: localSets.find((s) => s.slug === (item as Record<string, unknown>).set_slug)?.id || null,
  slot: item.slot || null,
  image_url: item.image_url || null,
  description: null,
  created_at: new Date().toISOString(),
}));

const localSetsWithItems: EquipmentSetWithItems[] = localSets.map((s) => ({
  ...s,
  equipment_items: localItems.filter((item) => item.set_id === s.id),
}));

export async function getEquipmentSets(): Promise<EquipmentSet[]> {
  if (!isSupabaseConfigured()) return localSets;

  const { data, error } = await supabase
    .from('equipment_sets')
    .select('*')
    .order('name_en');

  if (error) {
    console.error('Error fetching equipment sets:', error);
    return localSets;
  }
  return data;
}

export async function getEquipmentSetBySlug(slug: string): Promise<EquipmentSetWithItems | null> {
  if (!isSupabaseConfigured()) {
    return localSetsWithItems.find((s) => s.slug === slug) || null;
  }

  const { data, error } = await supabase
    .from('equipment_sets')
    .select(`*, equipment_items(*)`)
    .eq('slug', slug)
    .single();

  if (error) {
    console.error('Error fetching equipment set:', error);
    return localSetsWithItems.find((s) => s.slug === slug) || null;
  }
  return data as EquipmentSetWithItems;
}

export async function getEquipmentItems(): Promise<EquipmentItem[]> {
  if (!isSupabaseConfigured()) return localItems;

  const { data, error } = await supabase
    .from('equipment_items')
    .select('*')
    .order('name_en');

  if (error) {
    console.error('Error fetching equipment items:', error);
    return localItems;
  }
  return data;
}
