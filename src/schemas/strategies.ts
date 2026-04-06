import { z } from 'zod';

// ─── Enemy Defense Template schemas ─────────────────────────────

export const createTemplateSchema = z.object({
  name_en: z.string().min(1).max(200),
  name_th: z.string().max(200).nullable().optional(),
  slug: z.string().min(1).max(200),
  description: z.string().nullable().optional(),
  is_featured: z.boolean().optional(),
  sort_order: z.number().int().optional(),
});

export const updateTemplateSchema = z.object({
  name_en: z.string().min(1).max(200).optional(),
  name_th: z.string().max(200).nullable().optional(),
  slug: z.string().min(1).max(200).optional(),
  description: z.string().nullable().optional(),
  is_featured: z.boolean().optional(),
  sort_order: z.number().int().optional(),
});

// ─── Counter Strategy schemas ───────────────────────────────────

export const createStrategySchema = z.object({
  template_id: z.string().uuid(),
  counter_team_id: z.string().uuid().nullable().optional(),
  priority: z.number().int().min(0),
  condition_note: z.string().nullable().optional(),
  strategy_notes: z.string().nullable().optional(),
  is_active: z.boolean().optional(),
});

export const updateStrategySchema = z.object({
  template_id: z.string().uuid().optional(),
  counter_team_id: z.string().uuid().nullable().optional(),
  priority: z.number().int().min(0).optional(),
  condition_note: z.string().nullable().optional(),
  strategy_notes: z.string().nullable().optional(),
  is_active: z.boolean().optional(),
});

// ─── Strategy Conditions schema ─────────────────────────────────

export const addConditionsSchema = z.array(
  z.object({
    strategy_id: z.string().uuid(),
    character_id: z.string().uuid(),
    condition_type: z.enum(['must_have', 'must_not_have']),
  })
);

// ─── Inferred types for consumers ───────────────────────────────

export type CreateTemplateInput = z.infer<typeof createTemplateSchema>;
export type UpdateTemplateInput = z.infer<typeof updateTemplateSchema>;
export type CreateStrategyInput = z.infer<typeof createStrategySchema>;
export type UpdateStrategyInput = z.infer<typeof updateStrategySchema>;
export type AddConditionsInput = z.infer<typeof addConditionsSchema>;
