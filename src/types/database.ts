export interface Database {
  public: {
    Tables: {
      characters: {
        Row: Character;
        Insert: Omit<Character, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Character, 'id'>>;
      };
      character_skills: {
        Row: CharacterSkill;
        Insert: Omit<CharacterSkill, 'id' | 'created_at'>;
        Update: Partial<Omit<CharacterSkill, 'id'>>;
      };
      equipment: {
        Row: Equipment;
        Insert: Omit<Equipment, 'id' | 'created_at'>;
        Update: Partial<Omit<Equipment, 'id'>>;
      };
      pets: {
        Row: Pet;
        Insert: Omit<Pet, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Pet, 'id'>>;
      };
      rings: {
        Row: Ring;
        Insert: Omit<Ring, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Ring, 'id'>>;
      };
      equipment_sets: {
        Row: EquipmentSet;
        Insert: Omit<EquipmentSet, 'id' | 'created_at'>;
        Update: Partial<Omit<EquipmentSet, 'id'>>;
      };
      equipment_items: {
        Row: EquipmentItem;
        Insert: Omit<EquipmentItem, 'id' | 'created_at'>;
        Update: Partial<Omit<EquipmentItem, 'id'>>;
      };
      team_compositions: {
        Row: TeamComposition;
        Insert: Omit<TeamComposition, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<TeamComposition, 'id'>>;
      };
      team_members: {
        Row: TeamMember;
        Insert: Omit<TeamMember, 'id' | 'created_at'>;
        Update: Partial<Omit<TeamMember, 'id'>>;
      };
      game_updates: {
        Row: GameUpdate;
        Insert: Omit<GameUpdate, 'id' | 'created_at'>;
        Update: Partial<Omit<GameUpdate, 'id'>>;
      };
      enemy_defense_templates: {
        Row: EnemyDefenseTemplate;
        Insert: Omit<EnemyDefenseTemplate, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<EnemyDefenseTemplate, 'id'>>;
      };
      enemy_defense_members: {
        Row: EnemyDefenseMember;
        Insert: Omit<EnemyDefenseMember, 'id' | 'created_at'>;
        Update: Partial<Omit<EnemyDefenseMember, 'id'>>;
      };
      counter_strategies: {
        Row: CounterStrategy;
        Insert: Omit<CounterStrategy, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<CounterStrategy, 'id'>>;
      };
      strategy_conditions: {
        Row: StrategyCondition;
        Insert: Omit<StrategyCondition, 'id' | 'created_at'>;
        Update: Partial<Omit<StrategyCondition, 'id'>>;
      };
    };
  };
}

// ============================================================
// Character types
// ============================================================

export type CharacterRole =
  | 'commander'    // ผู้บัญชาการ
  | 'hunter'       // ผู้ไล่ล่า
  | 'holy_knight'  // อัศวินศักดิ์สิทธิ์
  | 'goalkeeper'   // นายประตู
  | 'guardian'     // ผู้พิทักษ์
  | 'assassin'     // นักฆ่า
  | 'avenger'      // ผู้ล้างแค้น
  | 'shaman'       // หมอผี
  | 'balancer'     // ผู้ปรับสมดุล
  | 'all';         // ทั้งหมด

export const ROLE_INFO: Record<CharacterRole, { name_en: string; name_th: string }> = {
  commander:   { name_en: 'Commander',    name_th: 'ผู้บัญชาการ' },
  hunter:      { name_en: 'Hunter',       name_th: 'ผู้ไล่ล่า' },
  holy_knight: { name_en: 'Holy Knight',  name_th: 'อัศวินศักดิ์สิทธิ์' },
  goalkeeper:  { name_en: 'Goalkeeper',   name_th: 'นายประตู' },
  guardian:    { name_en: 'Guardian',     name_th: 'ผู้พิทักษ์' },
  assassin:    { name_en: 'Assassin',     name_th: 'นักฆ่า' },
  avenger:     { name_en: 'Avenger',      name_th: 'ผู้ล้างแค้น' },
  shaman:      { name_en: 'Shaman',       name_th: 'หมอผี' },
  balancer:    { name_en: 'Balancer',     name_th: 'ผู้ปรับสมดุล' },
  all:         { name_en: 'All',          name_th: 'ทั้งหมด' },
};

export interface Character {
  id: string;
  name_en: string;
  name_th: string;
  slug: string;
  role: CharacterRole | null;
  type: string | null;
  image_url: string | null;
  thumbnail_url: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CharacterSkill {
  id: string;
  character_id: string;
  name: string;
  name_th: string | null;
  description: string | null;
  cooldown: string | null;
  icon_url: string | null;
  skill_order: number;
  created_at: string;
}

// ============================================================
// Pet types
// ============================================================

export interface Pet {
  id: string;
  name_en: string;
  name_th: string;
  slug: string;
  stars: number;
  description: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

// ============================================================
// Ring types
// ============================================================

export interface Ring {
  id: string;
  name_en: string;
  name_th: string | null;
  slug: string;
  stars: number;
  image_url: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
}

// ============================================================
// Equipment types
// ============================================================

export interface EquipmentSet {
  id: string;
  name_en: string;
  name_th: string | null;
  slug: string;
  icon_url: string | null;
  description: string | null;
  created_at: string;
}

export interface EquipmentItem {
  id: string;
  name_en: string;
  name_th: string | null;
  slug: string;
  set_id: string | null;
  slot: string | null;
  image_url: string | null;
  description: string | null;
  created_at: string;
}

export interface EquipmentSetWithItems extends EquipmentSet {
  equipment_items: EquipmentItem[];
}

// ============================================================
// Legacy equipment (character-specific gear recommendations)
// ============================================================

export interface Equipment {
  id: string;
  character_id: string;
  slot: string;
  stat_primary: string | null;
  stat_secondary: string | null;
  recommended_value: string | null;
  notes: string | null;
  created_at: string;
}

// ============================================================
// Team types
// ============================================================

export interface TeamComposition {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string | null;
  strategy_notes: string | null;
  speed_requirement: string | null;
  tier: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface TeamMember {
  id: string;
  team_id: string;
  character_id: string;
  position: number;
  role_in_team: string | null;
  gear_notes: string | null;
  created_at: string;
}

// ============================================================
// Counter-strategy types
// ============================================================

export type ConditionType = 'must_have' | 'must_not_have';

export interface EnemyDefenseTemplate {
  id: string;
  name_en: string;
  name_th: string | null;
  slug: string;
  description: string | null;
  is_featured: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface EnemyDefenseMember {
  id: string;
  template_id: string;
  character_id: string;
  position: number;
  created_at: string;
}

export interface CounterStrategy {
  id: string;
  template_id: string;
  counter_team_id: string | null;
  priority: number;
  condition_note: string | null;
  strategy_notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface StrategyCondition {
  id: string;
  strategy_id: string;
  character_id: string;
  condition_type: ConditionType;
  created_at: string;
}

// ============================================================
// Extended types with joins
// ============================================================

export interface CharacterWithSkills extends Character {
  character_skills: CharacterSkill[];
}

export interface TeamWithMembers extends TeamComposition {
  team_members: (TeamMember & { characters: Character })[];
}

export interface EnemyDefenseTemplateWithMembers extends EnemyDefenseTemplate {
  enemy_defense_members: (EnemyDefenseMember & { characters: Character })[];
}

export interface CounterStrategyWithConditions extends CounterStrategy {
  strategy_conditions: (StrategyCondition & { characters: Character })[];
  team_compositions: TeamComposition | null;
}

// ============================================================
// Game updates (written by research-scout cron agent)
// ============================================================

export type UpdateCategory = 'patch' | 'developer' | 'meta' | 'event' | 'other';

export interface GameUpdate {
  id: string;
  date: string;         // ISO date string (DATE column → string in JS)
  url: string;
  title: string;
  summary: string;
  category: UpdateCategory;
  affects_gvg: boolean;
  tags: string[];
  created_at: string;
}
