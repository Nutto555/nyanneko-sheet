import { supabase } from '../lib/supabase';
import type { TeamComposition, TeamWithMembers } from '../types/database';
import seedData from '../../scripts/seed-data.json';

const isSupabaseConfigured = () => {
  const url = import.meta.env.VITE_SUPABASE_URL;
  return url && url !== '' && url !== 'undefined';
};

const localTeams: TeamComposition[] = (seedData.team_compositions || []).map((t, i) => ({
  id: `local-team-${i}`,
  name: t.name,
  slug: t.slug,
  category: t.category,
  description: t.description ?? null,
  strategy_notes: t.strategy_notes ?? null,
  speed_requirement: t.speed_requirement ?? null,
  tier: t.tier ?? null,
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

export async function getTeamBySlug(slug: string): Promise<TeamWithMembers | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const { data, error } = await supabase
    .from('team_compositions')
    .select(`*, team_members(*, characters(*))`)
    .eq('slug', slug)
    .single();

  if (error) {
    console.error('Error fetching team:', error);
    return null;
  }
  return data as TeamWithMembers;
}
