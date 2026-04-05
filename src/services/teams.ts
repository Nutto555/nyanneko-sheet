import { supabase } from '../lib/supabase';
import type { TeamWithMembers, Character } from '../types/database';
import seedData from '../../scripts/seed-data.json';

const isSupabaseConfigured = () => {
  const url = import.meta.env.VITE_SUPABASE_URL;
  return url && url !== '' && url !== 'undefined';
};

interface SeedMember {
  slug: string;
  position: number;
  stat_primary?: string;
  stat_secondary?: string;
  stat_target?: string;
  notes?: string;
}

interface SeedTeamBuild {
  name: string;
  slug: string;
  category: string;
  description?: string;
  strategy_notes?: string;
  speed_requirement?: string;
  skill_order?: string;
  speed_order?: string;
  tier?: string;
  members?: SeedMember[];
}

// Build character lookup by slug for local fallback
const charBySlug = new Map<string, Character>();
for (const c of seedData.characters) {
  const char: Character = {
    id: `local-char-${c.slug}`,
    name_en: c.name_en,
    name_th: c.name_th,
    slug: c.slug,
    role: (c.role as Character['role']) ?? null,
    type: c.type ?? null,
    image_url: c.image_url ?? null,
    thumbnail_url: null,
    notes: c.notes ?? null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  charBySlug.set(c.slug, char);
}

const now = new Date().toISOString();

const legacyTeams: TeamWithMembers[] = (seedData.team_compositions || []).map((t, i) => ({
  id: `local-team-${i}`,
  name: t.name,
  slug: t.slug,
  category: t.category,
  description: t.description ?? null,
  strategy_notes: t.strategy_notes ?? null,
  speed_requirement: t.speed_requirement ?? null,
  tier: t.tier ?? null,
  image_url: null,
  created_at: now,
  updated_at: now,
  team_members: [],
}));

const teamBuilds: TeamWithMembers[] = (
  (seedData as Record<string, unknown>).team_builds as SeedTeamBuild[] || []
).map((b, i) => {
  const notes = [
    b.skill_order ? `Skill: ${b.skill_order}` : '',
    b.speed_order ? `Speed order: ${b.speed_order}` : '',
    b.strategy_notes || '',
  ].filter(Boolean).join('\n');

  const teamId = `local-build-${i}`;
  const members = (b.members || []).map((m, j) => {
    const char = charBySlug.get(m.slug);
    return {
      id: `local-member-${i}-${j}`,
      team_id: teamId,
      character_id: char?.id || `unknown-${m.slug}`,
      position: m.position,
      role_in_team: null,
      gear_notes: JSON.stringify({
        stat_primary: m.stat_primary,
        stat_secondary: m.stat_secondary,
        stat_target: m.stat_target,
        notes: m.notes,
      }),
      created_at: now,
      characters: char || {
        id: `unknown-${m.slug}`,
        name_en: m.slug,
        name_th: '',
        slug: m.slug,
        role: null,
        type: null,
        image_url: null,
        thumbnail_url: null,
        notes: null,
        created_at: now,
        updated_at: now,
      },
    };
  });

  return {
    id: teamId,
    name: b.name,
    slug: b.slug,
    category: b.category,
    description: b.description ?? null,
    strategy_notes: notes || null,
    speed_requirement: b.speed_requirement ?? null,
    tier: b.tier ?? null,
    image_url: null,
    created_at: now,
    updated_at: now,
    team_members: members,
  };
});

const localTeams: TeamWithMembers[] = [...teamBuilds, ...legacyTeams];

export async function getTeamCompositions(): Promise<TeamWithMembers[]> {
  if (!isSupabaseConfigured()) return localTeams;

  const { data, error } = await supabase
    .from('team_compositions')
    .select('*, team_members(*, characters(*))')
    .order('category');

  if (error) {
    if (import.meta.env.DEV) console.error('Error fetching teams:', error);
    return localTeams;
  }
  return data as TeamWithMembers[];
}

export async function getTeamsByCategory(category: string): Promise<TeamWithMembers[]> {
  if (!isSupabaseConfigured()) {
    return localTeams.filter((t) => t.category === category);
  }

  const { data, error } = await supabase
    .from('team_compositions')
    .select('*, team_members(*, characters(*))')
    .eq('category', category)
    .order('name');

  if (error) {
    if (import.meta.env.DEV) console.error('Error fetching teams by category:', error);
    return localTeams.filter((t) => t.category === category);
  }
  return data as TeamWithMembers[];
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
    if (import.meta.env.DEV) console.error('Error fetching team:', error);
    return null;
  }
  return data as TeamWithMembers;
}
