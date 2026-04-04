-- Security hardening: explicit write-denial for anon role
-- Anon users can only SELECT. All INSERT/UPDATE/DELETE require service_role.

-- characters
CREATE POLICY "Deny anon insert characters" ON characters
  FOR INSERT TO anon WITH CHECK (false);
CREATE POLICY "Deny anon update characters" ON characters
  FOR UPDATE TO anon USING (false);
CREATE POLICY "Deny anon delete characters" ON characters
  FOR DELETE TO anon USING (false);

-- character_skills
CREATE POLICY "Deny anon insert skills" ON character_skills
  FOR INSERT TO anon WITH CHECK (false);
CREATE POLICY "Deny anon update skills" ON character_skills
  FOR UPDATE TO anon USING (false);
CREATE POLICY "Deny anon delete skills" ON character_skills
  FOR DELETE TO anon USING (false);

-- equipment
CREATE POLICY "Deny anon insert equipment" ON equipment
  FOR INSERT TO anon WITH CHECK (false);
CREATE POLICY "Deny anon update equipment" ON equipment
  FOR UPDATE TO anon USING (false);
CREATE POLICY "Deny anon delete equipment" ON equipment
  FOR DELETE TO anon USING (false);

-- team_compositions
CREATE POLICY "Deny anon insert teams" ON team_compositions
  FOR INSERT TO anon WITH CHECK (false);
CREATE POLICY "Deny anon update teams" ON team_compositions
  FOR UPDATE TO anon USING (false);
CREATE POLICY "Deny anon delete teams" ON team_compositions
  FOR DELETE TO anon USING (false);

-- team_members
CREATE POLICY "Deny anon insert team_members" ON team_members
  FOR INSERT TO anon WITH CHECK (false);
CREATE POLICY "Deny anon update team_members" ON team_members
  FOR UPDATE TO anon USING (false);
CREATE POLICY "Deny anon delete team_members" ON team_members
  FOR DELETE TO anon USING (false);

-- Storage: deny anon write to character-images bucket
CREATE POLICY "Deny anon upload images" ON storage.objects
  FOR INSERT TO anon WITH CHECK (false);
CREATE POLICY "Deny anon update images" ON storage.objects
  FOR UPDATE TO anon USING (false);
CREATE POLICY "Deny anon delete images" ON storage.objects
  FOR DELETE TO anon USING (false);
