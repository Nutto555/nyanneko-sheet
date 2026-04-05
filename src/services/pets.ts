import { supabase } from '../lib/supabase';
import type { Pet } from '../types/database';
import seedData from '../../scripts/seed-data.json';

const isSupabaseConfigured = () => {
  const url = import.meta.env.VITE_SUPABASE_URL;
  return url && url !== '' && url !== 'undefined';
};

const localPets: Pet[] = (seedData.pets || []).map((p, i) => ({
  id: `local-pet-${i}`,
  name_en: p.name_en,
  name_th: p.name_th,
  slug: p.slug,
  stars: p.stars,
  description: null,
  image_url: p.image_url,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}));

export async function getPets(): Promise<Pet[]> {
  if (!isSupabaseConfigured()) return localPets;

  const { data, error } = await supabase
    .from('pets')
    .select('*')
    .order('name_en');

  if (error) {
    console.error('Error fetching pets:', error);
    return localPets;
  }
  return data;
}

export async function getPetBySlug(slug: string): Promise<Pet | null> {
  if (!isSupabaseConfigured()) {
    return localPets.find((p) => p.slug === slug) || null;
  }

  const { data, error } = await supabase
    .from('pets')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    console.error('Error fetching pet:', error);
    return localPets.find((p) => p.slug === slug) || null;
  }
  return data;
}
