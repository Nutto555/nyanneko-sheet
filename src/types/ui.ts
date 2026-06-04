/**
 * View-layer types: shapes used by UI components and pages.
 * These are distinct from DB row types in database.ts.
 */

import type { Character } from './database';

// ─── Shared variant types ──────────────────────────────────────────────────

export type BadgeVariant = 'primary' | 'secondary' | 'accent' | 'neutral';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export type CharacterPortraitSize = 'sm' | 'md' | 'lg' | 'xl';

export type StatVariant = 'atk' | 'def' | 'block' | 'crit' | 'spd' | 'neutral';

// ─── Team card ─────────────────────────────────────────────────────────────

/** Data for a single unit slot in a team card. */
export interface UnitSlotData {
  name_en: string;
  name_th?: string;
  image_url?: string | null;
  stat_primary?: string;
  stat_secondary?: string;
  stat_target?: string;
  notes?: string;
}

/** Data for a full team build card. */
export interface TeamCardData {
  title: string;
  speedTier?: string | null;
  units: UnitSlotData[];
  skillOrder?: string | null;
  speedOrder?: string | null;
  notes?: string | null;
}

// ─── Equipment legend ──────────────────────────────────────────────────────

/** One row in the Equipment Legend page — per-character skill gear guide. */
export interface EquipEntry {
  character: Character;
  team_context?: string;
  basic_attack?: string;
  skill_1?: string;
  skill_2?: string;
  passive?: string;
}

// ─── GVG mode page config ──────────────────────────────────────────────────

/** Configuration for one GVG mode page (attack / defense variants). */
export interface GvgModeConfig {
  category: string;
  title_en: string;
  title_th: string;
  description: string;
  icon: string;
}
