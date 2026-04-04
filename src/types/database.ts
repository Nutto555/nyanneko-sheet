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

// Extended types with joins
export interface CharacterWithSkills extends Character {
  character_skills: CharacterSkill[];
}

export interface TeamWithMembers extends TeamComposition {
  team_members: (TeamMember & { characters: Character })[];
}
