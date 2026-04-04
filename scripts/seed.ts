/**
 * Seed script for NyanNeko Sheet database
 *
 * Usage:
 *   1. Create a Supabase project at https://supabase.com
 *   2. Run the SQL migration from supabase/migrations/001_initial_schema.sql
 *   3. Set environment variables: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
 *   4. Run: npm run seed
 *
 * This script is IDEMPOTENT — safe to run multiple times.
 * All inserts use upsert (ON CONFLICT DO UPDATE), so re-running restores data.
 * The JSON files are the source of truth. The DB is a queryable cache.
 */

import { createClient } from '@supabase/supabase-js';
import seedData from './seed-data.json';
import * as fs from 'fs';
import * as path from 'path';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  console.error('   Set them in .env.local or export them before running.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// ---------------------------------------------------------------------------
// Characters + skills (idempotent via slug conflict)
// ---------------------------------------------------------------------------
async function seedCharacters() {
  console.log(`\n👤 Seeding ${seedData.characters.length} characters...`);

  for (const char of seedData.characters) {
    const { data: charData, error: charError } = await supabase
      .from('characters')
      .upsert(
        {
          name_en: char.name_en,
          name_th: char.name_th,
          slug: char.slug,
          role: char.role,
          type: char.type,
          image_url: char.image_url,
          notes: char.notes || null,
        },
        { onConflict: 'slug' }
      )
      .select()
      .single();

    if (charError) {
      console.error(`  ❌ ${char.name_en}: ${charError.message}`);
      continue;
    }
    console.log(`  ✓ ${char.name_en} (${char.name_th})`);

    // Delete + re-insert skills for this character (simpler than upsert on composite key)
    await supabase.from('character_skills').delete().eq('character_id', charData.id);

    for (const skill of char.skills) {
      const { error: skillError } = await supabase.from('character_skills').insert({
        character_id: charData.id,
        name: skill.name,
        name_th: skill.name_th,
        cooldown: skill.cooldown || null,
        skill_order: skill.skill_order,
      });
      if (skillError) console.error(`    skill error: ${skillError.message}`);
    }
  }
}

// ---------------------------------------------------------------------------
// Team builds (from team_builds array — richer than team_compositions)
// ---------------------------------------------------------------------------
interface TeamBuildMember {
  slug: string;
  position: number;
  stat_primary: string;
  stat_secondary?: string;
  stat_target?: string;
  notes?: string;
}

interface TeamBuild {
  name: string;
  slug: string;
  category: string;
  speed_requirement?: string;
  skill_order?: string;
  speed_order?: string;
  strategy_notes?: string;
  description?: string;
  tier?: string;
  members?: TeamBuildMember[];
}

async function seedTeamBuilds() {
  const builds: TeamBuild[] = (seedData as Record<string, unknown>).team_builds as TeamBuild[] || [];
  if (builds.length === 0) {
    console.log('\n⚠️  No team_builds found in seed-data.json');
    return;
  }

  console.log(`\n⚔️  Seeding ${builds.length} team builds...`);

  for (const build of builds) {
    // Compose strategy_notes from skill_order + speed_order
    const composedNotes = [
      build.skill_order ? `Skill: ${build.skill_order}` : '',
      build.speed_order ? `Speed order: ${build.speed_order}` : '',
      build.strategy_notes || '',
    ]
      .filter(Boolean)
      .join('\n');

    const { data: teamData, error: teamError } = await supabase
      .from('team_compositions')
      .upsert(
        {
          name: build.name,
          slug: build.slug,
          category: build.category,
          description: build.description || null,
          strategy_notes: composedNotes || null,
          speed_requirement: build.speed_requirement || null,
          tier: build.tier || null,
        },
        { onConflict: 'slug' }
      )
      .select()
      .single();

    if (teamError) {
      console.error(`  ❌ ${build.name}: ${teamError.message}`);
      continue;
    }
    console.log(`  ✓ ${build.name}`);

    if (!build.members?.length) continue;

    // Delete existing members and re-insert
    await supabase.from('team_members').delete().eq('team_id', teamData.id);

    for (const member of build.members) {
      // Look up character ID by slug
      const { data: charData } = await supabase
        .from('characters')
        .select('id')
        .eq('slug', member.slug)
        .single();

      if (!charData) {
        console.warn(`    ⚠️  Character slug '${member.slug}' not found — skipping`);
        continue;
      }

      // Store stat info as JSON in gear_notes
      const gearNotes = JSON.stringify({
        stat_primary: member.stat_primary,
        stat_secondary: member.stat_secondary,
        stat_target: member.stat_target,
        notes: member.notes,
      });

      const { error: memberError } = await supabase.from('team_members').insert({
        team_id: teamData.id,
        character_id: charData.id,
        position: member.position,
        gear_notes: gearNotes,
      });

      if (memberError) console.error(`    member error: ${memberError.message}`);
    }
  }
}

// ---------------------------------------------------------------------------
// Legacy team_compositions (keep for backward compat — upsert only)
// ---------------------------------------------------------------------------
async function seedLegacyTeams() {
  const comps = seedData.team_compositions;
  if (!comps?.length) return;
  console.log(`\n🔄 Upserting ${comps.length} legacy team_compositions...`);

  for (const team of comps) {
    const { error } = await supabase.from('team_compositions').upsert(
      {
        name: team.name,
        slug: team.slug,
        category: team.category,
        description: team.description,
        strategy_notes: team.strategy_notes,
        speed_requirement: team.speed_requirement,
        tier: team.tier,
      },
      { onConflict: 'slug' }
    );
    if (error) console.error(`  ❌ ${team.name}: ${error.message}`);
    else console.log(`  ✓ ${team.name}`);
  }
}

// ---------------------------------------------------------------------------
// Optional: upload images to Supabase Storage
// (Only needed if you want images served from Supabase instead of /public/)
// ---------------------------------------------------------------------------
async function uploadImages(dir = 'public/images/characters') {
  const imageDir = path.resolve(dir);
  if (!fs.existsSync(imageDir)) {
    console.log(`\n📷 Image dir not found: ${imageDir} — skipping upload`);
    return;
  }

  const files = fs.readdirSync(imageDir).filter((f) => /\.(jpg|jpeg|png|webp)$/i.test(f));
  if (files.length === 0) return;

  console.log(`\n📷 Uploading ${files.length} images to Supabase Storage...`);

  for (const file of files) {
    const filePath = path.join(imageDir, file);
    const fileBuffer = fs.readFileSync(filePath);
    const ext = path.extname(file).slice(1).toLowerCase();
    const contentType = ext === 'webp' ? 'image/webp' : ext === 'png' ? 'image/png' : 'image/jpeg';

    const { error } = await supabase.storage
      .from('character-images')
      .upload(`characters/${file}`, fileBuffer, { contentType, upsert: true });

    if (error) console.error(`  ❌ ${file}: ${error.message}`);
    else console.log(`  ✓ ${file}`);
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  const uploadImgs = process.argv.includes('--upload-images');

  console.log('🐱 NyanNeko Sheet — Database Seed');
  console.log('══════════════════════════════════');

  await seedCharacters();
  await seedTeamBuilds();
  await seedLegacyTeams();

  if (uploadImgs) {
    await uploadImages();
  } else {
    console.log('\n💡 Tip: Run with --upload-images to also upload to Supabase Storage.');
    console.log('   (Images in /public/ are served by Vite/Vercel CDN without uploading.)');
  }

  console.log('\n✅ Done!');
}

main().catch((e) => {
  console.error('\n❌ Seed failed:', e);
  process.exit(1);
});
