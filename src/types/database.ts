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
  role: string | null;
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
// Extended types with joins
// ============================================================

export interface CharacterWithSkills extends Character {
  character_skills: CharacterSkill[];
}

export interface TeamWithMembers extends TeamComposition {
  team_members: (TeamMember & { characters: Character })[];
}
