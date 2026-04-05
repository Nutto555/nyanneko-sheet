import { supabase } from '../lib/supabase';
import type { GameUpdate, UpdateCategory } from '../types/database';

const isSupabaseConfigured = () => {
  const url = import.meta.env.VITE_SUPABASE_URL;
  return url && url !== '' && url !== 'undefined';
};

/** Fetch all updates, newest first. Optionally filter by category. */
export async function getUpdates(category?: UpdateCategory): Promise<GameUpdate[]> {
  if (!isSupabaseConfigured()) return [];

  let query = supabase
    .from('game_updates')
    .select('*')
    .order('date', { ascending: false })
    .limit(100);

  if (category) {
    query = query.eq('category', category);
  }

  const { data, error } = await query;

  if (error) {
    if (import.meta.env.DEV) console.error('Error fetching game updates:', error);
    return [];
  }

  return data as GameUpdate[];
}

/** Fetch only updates that affect GVG. */
export async function getGvgUpdates(): Promise<GameUpdate[]> {
  if (!isSupabaseConfigured()) return [];

  const { data, error } = await supabase
    .from('game_updates')
    .select('*')
    .eq('affects_gvg', true)
    .order('date', { ascending: false });

  if (error) {
    if (import.meta.env.DEV) console.error('Error fetching GVG updates:', error);
    return [];
  }

  return data as GameUpdate[];
}
