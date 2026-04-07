import { supabase } from '../lib/supabase';
import type {
  EnemyDefenseTemplate,
  EnemyDefenseTemplateWithMembers,
  CounterStrategy,
  CounterStrategyWithConditions,
} from '../types/database';
import {
  createTemplateSchema,
  updateTemplateSchema,
  createStrategySchema,
  updateStrategySchema,
  addConditionsSchema,
} from '../schemas/strategies';

const isSupabaseConfigured = (): boolean => {
  const url = import.meta.env.VITE_SUPABASE_URL;
  return Boolean(url && url !== '' && url !== 'undefined');
};

// ─── READ functions ─────────────────────────────────────────────

export async function getEnemyTemplates(): Promise<EnemyDefenseTemplateWithMembers[]> {
  if (!isSupabaseConfigured()) return [];

  const { data, error } = await supabase
    .from('enemy_defense_templates')
    .select('*, enemy_defense_members(*, characters(*))')
    .order('sort_order');

  if (error) {
    if (import.meta.env.DEV) console.error('Error fetching enemy templates:', error);
    return [];
  }
  return (data ?? []) as EnemyDefenseTemplateWithMembers[];
}

export async function getEnemyTemplateBySlug(slug: string): Promise<EnemyDefenseTemplateWithMembers | null> {
  if (!isSupabaseConfigured()) return null;

  const { data, error } = await supabase
    .from('enemy_defense_templates')
    .select('*, enemy_defense_members(*, characters(*))')
    .eq('slug', slug)
    .single();

  if (error) {
    if (import.meta.env.DEV) console.error('Error fetching enemy template:', error);
    return null;
  }
  return data as EnemyDefenseTemplateWithMembers;
}

export async function getCounterStrategies(templateId: string): Promise<CounterStrategyWithConditions[]> {
  if (!isSupabaseConfigured()) return [];

  const { data, error } = await supabase
    .from('counter_strategies')
    .select('*, strategy_conditions(*, characters(*)), team_compositions(*)')
    .eq('template_id', templateId)
    .eq('is_active', true)
    .order('priority');

  if (error) {
    if (import.meta.env.DEV) console.error('Error fetching counter strategies:', error);
    return [];
  }
  return (data ?? []) as CounterStrategyWithConditions[];
}

export async function getAllActiveStrategies(): Promise<CounterStrategyWithConditions[]> {
  if (!isSupabaseConfigured()) return [];

  const { data, error } = await supabase
    .from('counter_strategies')
    .select('*, strategy_conditions(*, characters(*)), team_compositions(*, team_members(*, characters(*)))')
    .eq('is_active', true)
    .order('priority');

  if (error) {
    if (import.meta.env.DEV) console.error('Error fetching all active strategies:', error);
    return [];
  }
  return (data ?? []) as CounterStrategyWithConditions[];
}

export async function getAllCounterStrategies(templateId: string): Promise<CounterStrategyWithConditions[]> {
  if (!isSupabaseConfigured()) return [];

  const { data, error } = await supabase
    .from('counter_strategies')
    .select('*, strategy_conditions(*, characters(*)), team_compositions(*)')
    .eq('template_id', templateId)
    .order('priority');

  if (error) {
    if (import.meta.env.DEV) console.error('Error fetching all counter strategies:', error);
    return [];
  }
  return (data ?? []) as CounterStrategyWithConditions[];
}

// ─── WRITE functions ────────────────────────────────────────────

export async function createEnemyTemplate(input: unknown): Promise<EnemyDefenseTemplate> {
  const validated = createTemplateSchema.parse(input);

  const { data, error } = await supabase
    .from('enemy_defense_templates')
    .insert(validated as never)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as EnemyDefenseTemplate;
}

export async function updateEnemyTemplate(id: string, input: unknown): Promise<void> {
  const validated = updateTemplateSchema.parse(input);

  const { error } = await supabase
    .from('enemy_defense_templates')
    .update(validated as never)
    .eq('id', id);

  if (error) throw new Error(error.message);
}

export async function deleteEnemyTemplate(id: string): Promise<void> {
  const { error } = await supabase
    .from('enemy_defense_templates')
    .delete()
    .eq('id', id);

  if (error) throw new Error(error.message);
}

export async function createCounterStrategy(input: unknown): Promise<CounterStrategy> {
  const validated = createStrategySchema.parse(input);

  const { data, error } = await supabase
    .from('counter_strategies')
    .insert(validated as never)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as CounterStrategy;
}

export async function updateCounterStrategy(id: string, input: unknown): Promise<void> {
  const validated = updateStrategySchema.parse(input);

  const { error } = await supabase
    .from('counter_strategies')
    .update(validated as never)
    .eq('id', id);

  if (error) throw new Error(error.message);
}

export async function deleteCounterStrategy(id: string): Promise<void> {
  const { error } = await supabase
    .from('counter_strategies')
    .delete()
    .eq('id', id);

  if (error) throw new Error(error.message);
}

export async function replaceStrategyConditions(strategyId: string, conditions: unknown): Promise<void> {
  const validated = addConditionsSchema.parse(conditions);

  // Delete existing conditions for this strategy
  const { error: deleteError } = await supabase
    .from('strategy_conditions')
    .delete()
    .eq('strategy_id', strategyId);

  if (deleteError) throw new Error(deleteError.message);

  // Insert new conditions (if any)
  if (validated.length > 0) {
    const { error: insertError } = await supabase
      .from('strategy_conditions')
      .insert(validated as never);

    if (insertError) throw new Error(insertError.message);
  }
}

export async function replaceTemplateMembers(
  templateId: string,
  members: ReadonlyArray<{ character_id: string; position: number }>
): Promise<void> {
  // Delete existing members for this template
  const { error: deleteError } = await supabase
    .from('enemy_defense_members')
    .delete()
    .eq('template_id', templateId);

  if (deleteError) throw new Error(deleteError.message);

  // Insert new members (if any)
  if (members.length > 0) {
    const rows = members.map((m) => ({
      template_id: templateId,
      character_id: m.character_id,
      position: m.position,
    }));

    const { error: insertError } = await supabase
      .from('enemy_defense_members')
      .insert(rows as never);

    if (insertError) throw new Error(insertError.message);
  }
}

export async function reorderStrategies(templateId: string, orderedIds: readonly string[]): Promise<void> {
  const updates = orderedIds.map((id, index) =>
    supabase
      .from('counter_strategies')
      .update({ priority: index } as never)
      .eq('id', id)
      .eq('template_id', templateId)
  );

  const results = await Promise.all(updates);

  const failed = results.find((r) => r.error);
  if (failed?.error) throw new Error(failed.error.message);
}
