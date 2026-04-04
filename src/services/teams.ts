import { supabase } from '../lib/supabase';
import type { TeamComposition, TeamWithMembers } from '../types/database';
import { getCached, setCached } from './cache';
import seedData from '../../scripts/seed-data.json';

const isSupabaseConfigured = () => {
  const url = import.meta.env.VITE_SUPABASE_URL;
  return url && url !== '' && url !== 'undefined';
};

// Local fallback from seed JSON — team_builds if present, else team_compositions
const rawTeams = (seedData as Record<string, unknown>).team_builds as TeamBuildSeed[] | undefined;
const rawComps = seedData.team_compositions;

interface TeamBuildSeed {
  name: string;
  slug: string;
  category: string;
  speed_requirement?: string;
  skill_order?: string;
  speed_order?: string;
  strategy_notes?: string;
  description?: string;
  tier?: string;
  members?: {
    slug: string;
    position: number;
    stat_primary: string;
    stat_target: string;
    notes?: string;
  }[];
}

const localTeams: TeamComposition[] = (rawTeams || rawComps).map((t, i) => ({
  id: `local-team-${i}`,
  name: t.name,
  slug: t.slug,
  category: t.category,
  description: (t as { description?: string }).description ?? null,
  strategy_notes: (t as { strategy_notes?: string }).strategy_notes ?? null,
  speed_requirement: (t as { speed_requirement?: string }).speed_requirement ?? null,
  tier: (t as { tier?: string }).tier ?? null,
  image_url: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}));

export async function getTeamCompositions(): Promise<TeamComposition[]> {
  if (!isSupabaseConfigured()) return localTeams;

  const key = 'teams:all';
  const cached = getCached<TeamComposition[]>(key);
  if (cached) return cached;

  const { data, error } = await supabase
    .from('team_compositions')
    .select('*')
    .order('category');

  if (error) {
    if (import.meta.env.DEV) console.error('Error fetching teams:', error);
    return localTeams;
  }
  setCached(key, data);
  return data;
}

export async function getTeamsByCategory(category: string): Promise<TeamComposition[]> {
  if (!isSupabaseConfigured()) {
    return localTeams.filter((t) => t.category === category);
  }

  const key = `teams:category:${category}`;
  const cached = getCached<TeamComposition[]>(key);
  if (cached) return cached;

  const { data, error } = await supabase
    .from('team_compositions')
    .select('*')
    .eq('category', category)
    .order('name');

  if (error) {
    if (import.meta.env.DEV) console.error('Error fetching teams by category:', error);
    return localTeams.filter((t) => t.category === category);
  }
  setCached(key, data);
  return data;
}

export async function getTeamBySlug(slug: string): Promise<TeamWithMembers | null> {
  if (!isSupabaseConfigured()) {
    const t = localTeams.find((t) => t.slug === slug);
    return t ? { ...t, team_members: [] } : null;
  }

  const key = `team:${slug}`;
  const cached = getCached<TeamWithMembers>(key);
  if (cached) return cached;

  const { data, error } = await supabase
    .from('team_compositions')
    .select(`*, team_members(*, characters(*))`)
    .eq('slug', slug)
    .single();

  if (error) {
    if (import.meta.env.DEV) console.error('Error fetching team:', error);
    return null;
  }
  setCached(key, data as TeamWithMembers);
  return data as TeamWithMembers;
}

/** Full team with members from DB — used by GvgMode page */
export async function getTeamsWithMembersByCategory(
  category: string
): Promise<TeamWithMembers[]> {
  if (!isSupabaseConfigured()) {
    // Return local with empty members array for demo
    return localTeams
      .filter((t) => t.category === category)
      .map((t) => ({ ...t, team_members: [] }));
  }

  const key = `teams:withMembers:${category}`;
  const cached = getCached<TeamWithMembers[]>(key);
  if (cached) return cached;

  const { data, error } = await supabase
    .from('team_compositions')
    .select(`*, team_members(*, characters(*))`)
    .eq('category', category)
    .order('name');

  if (error) {
    if (import.meta.env.DEV) console.error('Error fetching teams with members:', error);
    return localTeams
      .filter((t) => t.category === category)
      .map((t) => ({ ...t, team_members: [] }));
  }
  setCached(key, data as TeamWithMembers[]);
  return data as TeamWithMembers[];
}
