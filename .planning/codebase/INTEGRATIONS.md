# External Integrations

**Analysis Date:** 2026-04-06

## APIs & External Services

**Supabase (Primary Backend):**
- Service: Supabase PostgreSQL database, authentication, and storage
  - SDK/Client: @supabase/supabase-js 2.101.1
  - Public Key (Anon): `VITE_SUPABASE_ANON_KEY` - Safe to expose in browser
  - Service Role Key: `SUPABASE_SERVICE_ROLE_KEY` - Server/seed scripts only, never expose in browser

**Game Data APIs:**
- External data sources are parsed and stored locally (Excel-to-JSON via Python scripts)
- No real-time external game APIs integrated; data is seeded into Supabase

## Data Storage

**Databases:**
- **PostgreSQL** (via Supabase)
  - Connection: `VITE_SUPABASE_URL` environment variable
  - Client: @supabase/supabase-js client
  - Schema location: `supabase/migrations/` (6 migrations total)
  - Tables: characters, character_skills, equipment, equipment_sets, equipment_items, pets, rings, team_compositions, team_members, game_updates

**File Storage:**
- **Supabase Storage** - Character images and asset hosting
  - Bucket: `character-images`
  - Access: Public URLs via `getImageUrl()` helper in `src/lib/supabase.ts`
  - Fallback: Local `/images/` directory for development/fallback

**Caching:**
- None - Direct Supabase queries with client-side React state management
- Seed data cached in `scripts/seed-data.json` as source of truth

## Authentication & Identity

**Auth Provider:**
- Custom - Uses Supabase authentication infrastructure
  - Implementation: Supabase auth is configured but minimal auth flows in current codebase
  - Admin panel exists (`src/pages/Admin.tsx`) suggesting future auth requirements
  - Service role key used for admin operations (seed, bulk updates)

## Monitoring & Observability

**Error Tracking:**
- None detected - Uses console.error in development mode

**Logs:**
- Development: console.error in services when Supabase queries fail
- Production: Errors logged to browser console (no backend logging)
- Seed script: Console logging for upsert operations and migration status

## CI/CD & Deployment

**Hosting:**
- Vercel - Serverless deployment platform
  - Config: `vercel.json` with security headers, cache policies
  - Build: `npm run build` (tsc + vite build)
  - Health checks: HTTP/HTTPS redirects, asset caching

**CI Pipeline:**
- None detected - Manual deployment via Vercel

**Local Development Build:**
- Makefile-driven: `make dev`, `make build`, `make seed`
- TypeScript compilation before Vite build

## Environment Configuration

**Required env vars (Browser - VITE_ prefix):**
- `VITE_SUPABASE_URL` - Supabase project URL (https://your-project-id.supabase.co)
- `VITE_SUPABASE_ANON_KEY` - Public anon key from Supabase project settings

**Required env vars (Server/Scripts - no VITE_ prefix):**
- `SUPABASE_SERVICE_ROLE_KEY` - Admin key for seeding and bulk operations
  - Used by: `scripts/seed.ts`
  - Never expose in browser or commit to git

**Secrets location:**
- Development: `.env.local` (git-ignored)
- Environment: Set via Vercel project settings in dashboard
- Template: `.env.example`

## Webhooks & Callbacks

**Incoming:**
- None detected

**Outgoing:**
- None detected - All data flows are pull-based (app queries Supabase)

## Database Schema

**Core Tables:**

1. **characters** - Game character metadata
   - Fields: id, name_en, name_th, slug, role, type, image_url, thumbnail_url, notes, created_at, updated_at
   - Seeding: Upsert by slug (idempotent)

2. **character_skills** - Character abilities
   - Fields: id, character_id, name, name_th, cooldown, skill_order, icon_url, created_at
   - Relationship: Many-to-one with characters

3. **team_compositions** - GvG team builds/strategies
   - Fields: id, name, slug, category, description, strategy_notes, speed_requirement, tier, created_at, updated_at
   - Relationship: One-to-many with team_members

4. **team_members** - Characters in a team composition
   - Fields: id, team_id, character_id, position, gear_notes, created_at
   - Relationships: Belongs to team_compositions and characters

5. **equipment**, **equipment_sets**, **equipment_items** - Gear system
   - Equipment sets with items and slots
   - Used for strategy planning and gear optimization

6. **pets**, **rings** - Additional game items
   - Metadata for character builds

7. **game_updates** - Patch notes and updates
   - Fields: id, title, description, date, category, affects_gvg, created_at
   - Categories: balance_changes, new_features, bug_fixes, etc.

**Security:**
- Row-level security (RLS) disabled (development/demo app)
- All tables are read-only from public API
- Write access restricted to service role (admin only)

## Seed Data

**Source:**
- `scripts/seed-data.json` - Authoritative source for all game data (128KB)
- Generated from: Excel parsing via `scripts/parse-excel.py`

**Seeding Process:**
- Location: `scripts/seed.ts` (TypeScript, runs with Node.js)
- Command: `npm run seed`
- Behavior: Idempotent upserts (safe to run multiple times)
- Process: Characters → Skills → Equipment → Teams → Team Members → Game Updates

**Data Fallback:**
- If Supabase not configured (no VITE_SUPABASE_URL), app falls back to local seed-data.json
- See: `src/services/characters.ts`, `src/services/teams.ts`, etc. for `isSupabaseConfigured()` checks

---

*Integration audit: 2026-04-06*
