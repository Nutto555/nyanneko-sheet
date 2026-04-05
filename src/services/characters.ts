import { supabase } from '../lib/supabase';
import type { Character, CharacterRole, CharacterWithSkills } from '../types/database';
import seedData from '../../scripts/seed-data.json';

const isSupabaseConfigured = () => {
  const url = import.meta.env.VITE_SUPABASE_URL;
  return url && url !== '' && url !== 'undefined';
};

const localCharacters: Character[] = seedData.characters.map((c, i) => ({
  id: `local-${i}`,
  name_en: c.name_en,
  name_th: c.name_th,
  slug: c.slug,
  role: c.role as CharacterRole,
  type: c.type,
  image_url: c.image_url,
  thumbnail_url: null,
  notes: c.notes,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}));

const localCharactersWithSkills: CharacterWithSkills[] = seedData.characters.map((c, i) => ({
  ...localCharacters[i],
  character_skills: c.skills.map((s, j) => ({
    id: `local-skill-${i}-${j}`,
    character_id: `local-${i}`,
    name: s.name,
    name_th: s.name_th,
    description: null,
    cooldown: s.cooldown || null,
    icon_url: (s as Record<string, unknown>).icon_url as string | null || null,
    skill_order: s.skill_order,
    created_at: new Date().toISOString(),
  })),
}));

export async function getCharacters(): Promise<Character[]> {
  if (!isSupabaseConfigured()) return localCharacters;

  const { data, error } = await supabase
    .from('characters')
    .select('*')
    .order('name_en');

  if (error) {
    console.error('Error fetching characters:', error);
    return localCharacters;
  }
  return data;
}

export async function getCharacterBySlug(slug: string): Promise<CharacterWithSkills | null> {
  if (!isSupabaseConfigured()) {
    return localCharactersWithSkills.find((c) => c.slug === slug) || null;
  }

  const { data, error } = await supabase
    .from('characters')
    .select(`*, character_skills(*)`)
    .eq('slug', slug)
    .single();

  if (error) {
    console.error('Error fetching character:', error);
    return localCharactersWithSkills.find((c) => c.slug === slug) || null;
  }
  return data as CharacterWithSkills;
}

export async function getCharactersByRole(role: string): Promise<Character[]> {
  if (!isSupabaseConfigured()) {
    return localCharacters.filter((c) => c.role === role);
  }

  const { data, error } = await supabase
    .from('characters')
    .select('*')
    .eq('role', role)
    .order('name_en');

  if (error) {
    console.error('Error fetching characters by role:', error);
    return localCharacters.filter((c) => c.role === role);
  }
  return data;
}
