import { supabase } from '../lib/supabase';
import type { TeamComposition } from '../types/database';
import seedData from '../../scripts/seed-data.json';

const isSupabaseConfigured = () => {
  const url = import.meta.env.VITE_SUPABASE_URL;
  return url && url !== '' && url !== 'undefined';
};

const localTeams: TeamComposition[] = seedData.team_compositions.map((t, i) => ({
  id: `local-team-${i}`,
  name: t.name,
  slug: t.slug,
  category: t.category,
  description: t.description,
  strategy_notes: t.strategy_notes,
  speed_requirement: t.speed_requirement,
  tier: t.tier,
  image_url: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}));

export async function getTeamCompositions(): Promise<TeamComposition[]> {
  if (!isSupabaseConfigured()) return localTeams;

  const { data, error } = await supabase
    .from('team_compositions')
    .select('*')
    .order('category');

  if (error) {
    console.error('Error fetching teams:', error);
    return localTeams;
  }
  return data;
}

export async function getTeamBySlug(slug: string): Promise<TeamComposition | null> {
  if (!isSupabaseConfigured()) {
    return localTeams.find((t) => t.slug === slug) || null;
  }

  const { data, error } = await supabase
    .from('team_compositions')
    .select(`*, team_members(*, characters(*))`)
    .eq('slug', slug)
    .single();

  if (error) {
    console.error('Error fetching team:', error);
    return localTeams.find((t) => t.slug === slug) || null;
  }
  return data;
}

export async function getTeamsByCategory(category: string): Promise<TeamComposition[]> {
  if (!isSupabaseConfigured()) {
    return localTeams.filter((t) => t.category === category);
  }

  const { data, error } = await supabase
    .from('team_compositions')
    .select('*')
    .eq('category', category)
    .order('name');

  if (error) {
    console.error('Error fetching teams by category:', error);
    return localTeams.filter((t) => t.category === category);
  }
  return data;
}
