import { supabase } from '../lib/supabase';
import type { Character, TeamComposition, TeamWithMembers } from '../types/database';

// ─── Characters ──────────────────────────────────────────────────────────────

export async function getAllCharacters(): Promise<Character[]> {
  const { data, error } = await supabase
    .from('characters')
    .select('*')
    .order('name_en');
  if (error) throw new Error(error.message);
  return data as unknown as Character[];
}

export async function updateCharacter(id: string, updates: Partial<Character>) {
  const { error } = await supabase
    .from('characters')
    .update(updates as never)
    .eq('id', id);
  if (error) throw new Error(error.message);
}

// ─── Teams ───────────────────────────────────────────────────────────────────

export async function getAllTeams(): Promise<TeamWithMembers[]> {
  const { data, error } = await supabase
    .from('team_compositions')
    .select('*, team_members(*, characters(*))')
    .order('category')
    .order('name');
  if (error) throw new Error(error.message);
  return data as unknown as TeamWithMembers[];
}

export async function createTeam(team: {
  name: string;
  slug: string;
  category: string;
  description?: string;
  strategy_notes?: string;
  speed_requirement?: string;
  tier?: string;
}): Promise<TeamComposition> {
  const { data, error } = await supabase
    .from('team_compositions')
    .insert(team as never)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as unknown as TeamComposition;
}

export async function updateTeam(id: string, updates: Partial<TeamComposition>) {
  const { error } = await supabase
    .from('team_compositions')
    .update(updates as never)
    .eq('id', id);
  if (error) throw new Error(error.message);
}

export async function deleteTeam(id: string) {
  const { error } = await supabase
    .from('team_compositions')
    .delete()
    .eq('id', id);
  if (error) throw new Error(error.message);
}

// ─── Team Members ────────────────────────────────────────────────────────────

export async function addTeamMember(teamId: string, characterId: string, position: number, gearNotes?: string) {
  const { error } = await supabase
    .from('team_members')
    .insert({
      team_id: teamId,
      character_id: characterId,
      position,
      gear_notes: gearNotes || null,
    } as never);
  if (error) throw new Error(error.message);
}

export async function updateTeamMember(id: string, updates: { position?: number; gear_notes?: string }) {
  const { error } = await supabase
    .from('team_members')
    .update(updates as never)
    .eq('id', id);
  if (error) throw new Error(error.message);
}

export async function removeTeamMember(id: string) {
  const { error } = await supabase
    .from('team_members')
    .delete()
    .eq('id', id);
  if (error) throw new Error(error.message);
}
