-- Counter-strategy schema: four tables for conditional counter team lookup
-- Phase 1 migration — depends on 001_initial_schema.sql (characters, team_compositions)
-- and 004_schema_improvements.sql (set_updated_at function)

-- ============================================================
-- 1. enemy_defense_templates
--    Common/popular enemy defense compositions shown prominently
-- ============================================================

CREATE TABLE IF NOT EXISTS enemy_defense_templates (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name_en     VARCHAR(200) NOT NULL,              -- English display name
  name_th     VARCHAR(200),                       -- Thai translation (nullable, matches bilingual pattern)
  slug        VARCHAR(200) UNIQUE NOT NULL,       -- URL-friendly identifier
  description TEXT,                               -- optional prose description
  is_featured BOOLEAN DEFAULT FALSE,              -- supports featured gallery (Phase 4)
  sort_order  INT DEFAULT 0,                      -- admin-controlled display order
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 2. enemy_defense_members
--    Characters that make up an enemy_defense_template
--    Append-only join table: update = delete + reinsert, no updated_at
-- ============================================================

CREATE TABLE IF NOT EXISTS enemy_defense_members (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id  UUID NOT NULL REFERENCES enemy_defense_templates(id) ON DELETE CASCADE,
  character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  position     INT DEFAULT 0,                     -- slot ordering within the template
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(template_id, character_id)               -- a character appears at most once per template
);

-- ============================================================
-- 3. counter_strategies
--    Priority-ordered counter teams for a given enemy template
-- ============================================================

CREATE TABLE IF NOT EXISTS counter_strategies (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id     UUID NOT NULL REFERENCES enemy_defense_templates(id) ON DELETE CASCADE,
  counter_team_id UUID REFERENCES team_compositions(id) ON DELETE SET NULL,  -- nullable: stub before team is assigned
  priority        INT NOT NULL DEFAULT 0,          -- explicit integer; lower = try first (D-06)
  condition_note  TEXT,                            -- human-readable summary of when this strategy applies
  strategy_notes  TEXT,                            -- free text explanation (TEXT not JSONB per RESEARCH.md)
  is_active       BOOLEAN DEFAULT TRUE,            -- soft disable without data loss
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT chk_counter_priority CHECK (priority >= 0)
);

-- ============================================================
-- 4. strategy_conditions
--    Per-strategy predicates: which enemy characters must (or must not) appear
--    Append-only: conditions replaced wholesale (delete all + reinsert), no updated_at
-- ============================================================

CREATE TABLE IF NOT EXISTS strategy_conditions (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  strategy_id    UUID NOT NULL REFERENCES counter_strategies(id) ON DELETE CASCADE,
  character_id   UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,  -- enemy team character
  condition_type VARCHAR(50) NOT NULL,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT chk_condition_type CHECK (condition_type IN ('must_have', 'must_not_have')),
  UNIQUE(strategy_id, character_id, condition_type)  -- no duplicate predicates for same character+direction
);

-- ============================================================
-- 5. updated_at triggers
--    Reuse set_updated_at() from migration 004 — DO NOT recreate
-- ============================================================

CREATE TRIGGER trg_enemy_defense_templates_updated_at
  BEFORE UPDATE ON enemy_defense_templates
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_counter_strategies_updated_at
  BEFORE UPDATE ON counter_strategies
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- 6. Indexes
-- ============================================================

CREATE INDEX idx_enemy_defense_members_template  ON enemy_defense_members(template_id);
CREATE INDEX idx_enemy_defense_members_character ON enemy_defense_members(character_id);
CREATE INDEX idx_counter_strategies_template     ON counter_strategies(template_id);
CREATE INDEX idx_counter_strategies_template_priority ON counter_strategies(template_id, priority);
CREATE INDEX idx_strategy_conditions_strategy    ON strategy_conditions(strategy_id);
CREATE INDEX idx_strategy_conditions_character   ON strategy_conditions(character_id);

-- ============================================================
-- 7. Row Level Security — open read/write per D-07
--    Internal guild tool; auth tightening deferred to v2 AUTH-01
-- ============================================================

ALTER TABLE enemy_defense_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE enemy_defense_members   ENABLE ROW LEVEL SECURITY;
ALTER TABLE counter_strategies      ENABLE ROW LEVEL SECURITY;
ALTER TABLE strategy_conditions     ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read enemy_defense_templates" ON enemy_defense_templates FOR SELECT USING (true);
CREATE POLICY "Public read enemy_defense_members"   ON enemy_defense_members   FOR SELECT USING (true);
CREATE POLICY "Public read counter_strategies"      ON counter_strategies      FOR SELECT USING (true);
CREATE POLICY "Public read strategy_conditions"     ON strategy_conditions     FOR SELECT USING (true);

CREATE POLICY "Anon write enemy_defense_templates" ON enemy_defense_templates FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Anon write enemy_defense_members"   ON enemy_defense_members   FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Anon write counter_strategies"      ON counter_strategies      FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Anon write strategy_conditions"     ON strategy_conditions     FOR ALL TO anon USING (true) WITH CHECK (true);
