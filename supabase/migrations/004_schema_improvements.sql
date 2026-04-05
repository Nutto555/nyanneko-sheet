-- Schema improvements: triggers, constraints, index deduplication

-- ============================================================
-- 1. Auto-update updated_at on characters and team_compositions
-- ============================================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_characters_updated_at
  BEFORE UPDATE ON characters
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_team_compositions_updated_at
  BEFORE UPDATE ON team_compositions
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_pets_updated_at
  BEFORE UPDATE ON pets
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_rings_updated_at
  BEFORE UPDATE ON rings
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- 2. Drop redundant index (UNIQUE already creates one)
-- ============================================================

DROP INDEX IF EXISTS idx_characters_slug;

-- ============================================================
-- 3. Composite index for common team member query
--    "give me all members of team X in slot order"
-- ============================================================

CREATE INDEX idx_team_members_team_position ON team_members(team_id, position);

-- Keep the single-column indexes: team_id alone is still useful
-- for EXISTS/count queries, character_id for "which teams use char X".

-- ============================================================
-- 4. NOT NULL on orphan-prone FK columns
-- ============================================================

ALTER TABLE character_skills
  ALTER COLUMN character_id SET NOT NULL;

ALTER TABLE equipment
  ALTER COLUMN character_id SET NOT NULL;

-- ============================================================
-- 5. CHECK constraints for controlled vocabularies
-- ============================================================

ALTER TABLE equipment
  ADD CONSTRAINT chk_equipment_slot CHECK (
    slot IN ('weapon', 'armor', 'accessory_1', 'accessory_2', 'jewel_1', 'jewel_2')
  );

ALTER TABLE team_compositions
  ADD CONSTRAINT chk_team_tier CHECK (
    tier IS NULL OR tier IN ('S', 'A', 'B', 'C')
  );

ALTER TABLE team_compositions
  ADD CONSTRAINT chk_team_category CHECK (
    category IN ('attack', 'defense_hybrid', 'defense_phy', 'defense_mage', 'defense_tank')
  );

ALTER TABLE characters
  ADD CONSTRAINT chk_character_role CHECK (
    role IS NULL OR role IN (
      'commander', 'hunter', 'holy_knight', 'goalkeeper', 'guardian',
      'assassin', 'avenger', 'shaman', 'balancer', 'all'
    )
  );

ALTER TABLE equipment_items
  ADD CONSTRAINT chk_equipment_item_slot CHECK (
    slot IS NULL OR slot IN ('weapon', 'armor', 'accessory', 'jewel')
  );
