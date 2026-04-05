-- Game updates table: stores patch notes, developer notes, and meta changes
-- Written by the automated research-scout cron agent via service_role.
-- Anon users can only SELECT (public read, no write).

CREATE TABLE IF NOT EXISTS game_updates (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date        DATE NOT NULL,
  url         TEXT NOT NULL,
  title       TEXT NOT NULL,
  summary     TEXT NOT NULL,
  category    VARCHAR(20) NOT NULL,
  affects_gvg BOOLEAN NOT NULL DEFAULT false,
  tags        TEXT[] DEFAULT '{}',
  created_at  TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT chk_update_category CHECK (
    category IN ('patch', 'developer', 'meta', 'event', 'other')
  ),
  -- Prevent duplicate entries for the same source URL
  CONSTRAINT uq_update_url UNIQUE (url)
);

-- Fetch recent updates ordered by date (most common query)
CREATE INDEX idx_game_updates_date ON game_updates(date DESC);

-- Filter by category (used by the filter tabs in the UI)
CREATE INDEX idx_game_updates_category ON game_updates(category);

-- Filter GVG-impacting updates
CREATE INDEX idx_game_updates_affects_gvg ON game_updates(affects_gvg) WHERE affects_gvg = true;

-- GIN index for tag-based filtering (e.g. WHERE 'balance' = ANY(tags))
CREATE INDEX idx_game_updates_tags ON game_updates USING GIN (tags);

-- Enable RLS
ALTER TABLE game_updates ENABLE ROW LEVEL SECURITY;

-- Public can read all updates
CREATE POLICY "Public read game_updates" ON game_updates
  FOR SELECT USING (true);

-- Anon cannot write
CREATE POLICY "Deny anon insert game_updates" ON game_updates
  FOR INSERT TO anon WITH CHECK (false);

CREATE POLICY "Deny anon update game_updates" ON game_updates
  FOR UPDATE TO anon USING (false);

CREATE POLICY "Deny anon delete game_updates" ON game_updates
  FOR DELETE TO anon USING (false);
