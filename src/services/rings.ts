import { supabase } from '../lib/supabase';
import type { Ring } from '../types/database';
import seedData from '../../scripts/seed-data.json';

const isSupabaseConfigured = () => {
  const url = import.meta.env.VITE_SUPABASE_URL;
  return url && url !== '' && url !== 'undefined';
};

const localRings: Ring[] = (seedData.rings || []).map((r, i) => ({
  id: `local-ring-${i}`,
  name_en: r.name_en,
  name_th: r.name_th || null,
  slug: r.slug,
  stars: r.stars,
  image_url: r.image_url,
  description: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}));

export async function getRings(): Promise<Ring[]> {
  if (!isSupabaseConfigured()) return localRings;

  const { data, error } = await supabase
    .from('rings')
    .select('*')
    .order('name_en');

  if (error) {
    console.error('Error fetching rings:', error);
    return localRings;
  }
  return data;
}

export async function getRingBySlug(slug: string): Promise<Ring | null> {
  if (!isSupabaseConfigured()) {
    return localRings.find((r) => r.slug === slug) || null;
  }

  const { data, error } = await supabase
    .from('rings')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    console.error('Error fetching ring:', error);
    return localRings.find((r) => r.slug === slug) || null;
  }
  return data;
}
