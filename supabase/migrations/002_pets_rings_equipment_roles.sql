-- Migration 002: Add pets, rings, equipment sets, and update role system
-- NyanNeko Sheet - GvG Guide Platform

-- ============================================================
-- 1. Update character roles to proper 10-class system
-- ============================================================
-- Old: 'attack', 'defense', 'support', 'tank'
-- New: 'commander', 'hunter', 'holy_knight', 'goalkeeper', 'guardian',
--      'assassin', 'avenger', 'shaman', 'balancer', 'all'

ALTER TABLE characters
  ALTER COLUMN role TYPE VARCHAR(50);

-- Add icon_url to character_skills if not exists
ALTER TABLE character_skills ADD COLUMN IF NOT EXISTS icon_url TEXT;

-- ============================================================
-- 2. Pets table
-- ============================================================
CREATE TABLE IF NOT EXISTS pets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name_en VARCHAR(100) NOT NULL,
  name_th VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  stars INT DEFAULT 7,              -- star rating (most are 7-star)
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 3. Equipment Sets table (เซต)
-- ============================================================
CREATE TABLE IF NOT EXISTS equipment_sets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name_en VARCHAR(100) NOT NULL,
  name_th VARCHAR(100),
  slug VARCHAR(100) UNIQUE NOT NULL,
  icon_url TEXT,                     -- the set icon image
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 4. Equipment Items table (individual pieces)
-- ============================================================
-- Drop the old character-specific equipment table concept
-- New equipment is standalone items that can belong to sets
CREATE TABLE IF NOT EXISTS equipment_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name_en VARCHAR(100) NOT NULL,
  name_th VARCHAR(100),
  slug VARCHAR(100) UNIQUE NOT NULL,
  set_id UUID REFERENCES equipment_sets(id) ON DELETE SET NULL,
  slot VARCHAR(50),                  -- 'weapon', 'armor', 'accessory'
  image_url TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 5. Rings table
-- ============================================================
CREATE TABLE IF NOT EXISTS rings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name_en VARCHAR(100) NOT NULL,
  name_th VARCHAR(100),
  slug VARCHAR(100) UNIQUE NOT NULL,
  stars INT DEFAULT 7,
  image_url TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 6. Indexes
-- ============================================================
CREATE INDEX idx_pets_slug ON pets(slug);
CREATE INDEX idx_equipment_sets_slug ON equipment_sets(slug);
CREATE INDEX idx_equipment_items_slug ON equipment_items(slug);
CREATE INDEX idx_equipment_items_set ON equipment_items(set_id) WHERE set_id IS NOT NULL;
CREATE INDEX idx_rings_slug ON rings(slug);

-- ============================================================
-- 7. RLS policies
-- ============================================================
ALTER TABLE pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE rings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read pets" ON pets FOR SELECT USING (true);
CREATE POLICY "Public read equipment_sets" ON equipment_sets FOR SELECT USING (true);
CREATE POLICY "Public read equipment_items" ON equipment_items FOR SELECT USING (true);
CREATE POLICY "Public read rings" ON rings FOR SELECT USING (true);
