-- Open writes for all users (anon included).
-- This is an internal guild tool — no auth required.
-- Drops the deny-write policies from 003_security_hardening and allows anon writes.

-- characters: drop deny, allow write
DROP POLICY IF EXISTS "Deny anon insert characters" ON characters;
DROP POLICY IF EXISTS "Deny anon update characters" ON characters;
DROP POLICY IF EXISTS "Deny anon delete characters" ON characters;
CREATE POLICY "Anon write characters" ON characters FOR ALL TO anon USING (true) WITH CHECK (true);

-- character_skills
DROP POLICY IF EXISTS "Deny anon insert skills" ON character_skills;
DROP POLICY IF EXISTS "Deny anon update skills" ON character_skills;
DROP POLICY IF EXISTS "Deny anon delete skills" ON character_skills;
CREATE POLICY "Anon write skills" ON character_skills FOR ALL TO anon USING (true) WITH CHECK (true);

-- equipment
DROP POLICY IF EXISTS "Deny anon insert equipment" ON equipment;
DROP POLICY IF EXISTS "Deny anon update equipment" ON equipment;
DROP POLICY IF EXISTS "Deny anon delete equipment" ON equipment;
CREATE POLICY "Anon write equipment" ON equipment FOR ALL TO anon USING (true) WITH CHECK (true);

-- team_compositions
DROP POLICY IF EXISTS "Deny anon insert teams" ON team_compositions;
DROP POLICY IF EXISTS "Deny anon update teams" ON team_compositions;
DROP POLICY IF EXISTS "Deny anon delete teams" ON team_compositions;
CREATE POLICY "Anon write teams" ON team_compositions FOR ALL TO anon USING (true) WITH CHECK (true);

-- team_members
DROP POLICY IF EXISTS "Deny anon insert team_members" ON team_members;
DROP POLICY IF EXISTS "Deny anon update team_members" ON team_members;
DROP POLICY IF EXISTS "Deny anon delete team_members" ON team_members;
CREATE POLICY "Anon write team_members" ON team_members FOR ALL TO anon USING (true) WITH CHECK (true);

-- pets
DROP POLICY IF EXISTS "Deny anon insert pets" ON pets;
DROP POLICY IF EXISTS "Deny anon update pets" ON pets;
DROP POLICY IF EXISTS "Deny anon delete pets" ON pets;
CREATE POLICY "Anon write pets" ON pets FOR ALL TO anon USING (true) WITH CHECK (true);

-- rings
DROP POLICY IF EXISTS "Deny anon insert rings" ON rings;
DROP POLICY IF EXISTS "Deny anon update rings" ON rings;
DROP POLICY IF EXISTS "Deny anon delete rings" ON rings;
CREATE POLICY "Anon write rings" ON rings FOR ALL TO anon USING (true) WITH CHECK (true);

-- equipment_sets
DROP POLICY IF EXISTS "Deny anon insert equipment_sets" ON equipment_sets;
DROP POLICY IF EXISTS "Deny anon update equipment_sets" ON equipment_sets;
DROP POLICY IF EXISTS "Deny anon delete equipment_sets" ON equipment_sets;
CREATE POLICY "Anon write equipment_sets" ON equipment_sets FOR ALL TO anon USING (true) WITH CHECK (true);

-- equipment_items
DROP POLICY IF EXISTS "Deny anon insert equipment_items" ON equipment_items;
DROP POLICY IF EXISTS "Deny anon update equipment_items" ON equipment_items;
DROP POLICY IF EXISTS "Deny anon delete equipment_items" ON equipment_items;
CREATE POLICY "Anon write equipment_items" ON equipment_items FOR ALL TO anon USING (true) WITH CHECK (true);

-- game_updates (keep deny — only cron agent should write via service_role)
-- NOT opening game_updates to anon writes
