-- NyanNeko Sheet - GvG Guide Platform Database Schema

-- Characters table
CREATE TABLE IF NOT EXISTS characters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name_en VARCHAR(100) NOT NULL,
  name_th VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  role VARCHAR(50),           -- e.g., 'attack', 'defense', 'support', 'tank'
  type VARCHAR(200),          -- team type from Excel (e.g., 'ทั่วไป', 'ซัพพอร์ต')
  image_url TEXT,             -- Supabase Storage URL or local path
  thumbnail_url TEXT,
  notes TEXT,                 -- stat recommendations from Excel
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Character skills
CREATE TABLE IF NOT EXISTS character_skills (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  character_id UUID REFERENCES characters(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,        -- 'Basic Attack', 'Skill 1', 'Skill 2', 'Passive'
  name_th VARCHAR(100),
  description TEXT,
  cooldown VARCHAR(20),              -- '⏳', '⛔', '★6', etc.
  skill_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Equipment / Gear sets
CREATE TABLE IF NOT EXISTS equipment (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  character_id UUID REFERENCES characters(id) ON DELETE CASCADE,
  slot VARCHAR(50) NOT NULL,          -- 'weapon', 'armor', 'accessory_1', 'accessory_2', 'jewel_1', 'jewel_2'
  stat_primary VARCHAR(100),          -- e.g., 'ATK%', 'DEF%', 'HP%'
  stat_secondary VARCHAR(100),
  recommended_value VARCHAR(100),     -- e.g., '90++', '70-90'
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Team compositions
CREATE TABLE IF NOT EXISTS team_compositions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  slug VARCHAR(200) UNIQUE NOT NULL,
  category VARCHAR(50) NOT NULL,      -- 'attack', 'defense_hybrid', 'defense_phy', 'defense_mage', 'defense_tank'
  description TEXT,
  strategy_notes TEXT,
  speed_requirement VARCHAR(100),     -- e.g., '270++', '> 250'
  tier VARCHAR(5),                    -- 'S', 'A', 'B', 'C'
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Junction: characters in team compositions
CREATE TABLE IF NOT EXISTS team_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID REFERENCES team_compositions(id) ON DELETE CASCADE,
  character_id UUID REFERENCES characters(id) ON DELETE CASCADE,
  position INT DEFAULT 0,             -- slot position in the team
  role_in_team VARCHAR(100),          -- specific role for this team
  gear_notes TEXT,                    -- gear-specific notes for this team context
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(team_id, character_id, position)
);

-- Indexes for performance
CREATE INDEX idx_characters_slug ON characters(slug);
CREATE INDEX idx_characters_role ON characters(role);
CREATE INDEX idx_team_compositions_category ON team_compositions(category);
CREATE INDEX idx_team_members_team ON team_members(team_id);
CREATE INDEX idx_team_members_character ON team_members(character_id);
CREATE INDEX idx_character_skills_character ON character_skills(character_id);
CREATE INDEX idx_equipment_character ON equipment(character_id);

-- Enable Row Level Security (public read, admin write)
ALTER TABLE characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE character_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_compositions ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "Public read characters" ON characters FOR SELECT USING (true);
CREATE POLICY "Public read skills" ON character_skills FOR SELECT USING (true);
CREATE POLICY "Public read equipment" ON equipment FOR SELECT USING (true);
CREATE POLICY "Public read teams" ON team_compositions FOR SELECT USING (true);
CREATE POLICY "Public read team_members" ON team_members FOR SELECT USING (true);

-- Storage bucket for character images
INSERT INTO storage.buckets (id, name, public)
VALUES ('character-images', 'character-images', true)
ON CONFLICT (id) DO NOTHING;

-- Public read policy for storage
CREATE POLICY "Public read images" ON storage.objects
FOR SELECT USING (bucket_id = 'character-images');
