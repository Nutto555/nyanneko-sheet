/**
 * Seed script for NyanNeko Sheet database
 *
 * Usage:
 *   1. Create a Supabase project at https://supabase.com
 *   2. Run the SQL migration from supabase/migrations/001_initial_schema.sql
 *   3. Set environment variables: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
 *   4. Run: npx tsx scripts/seed.ts
 *
 * This script uses the SERVICE_ROLE key (not anon key) to bypass RLS.
 */

import { createClient } from '@supabase/supabase-js';
import seedData from './seed-data.json';
import * as fs from 'fs';
import * as path from 'path';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function uploadImages() {
  const imageDir = path.join(__dirname, '..', 'public', 'images', 'characters');
  const files = fs.readdirSync(imageDir).filter(f => f.endsWith('.jpg'));

  console.log(`Uploading ${files.length} images to Supabase Storage...`);

  for (const file of files) {
    const filePath = path.join(imageDir, file);
    const fileBuffer = fs.readFileSync(filePath);

    const { error } = await supabase.storage
      .from('character-images')
      .upload(`characters/${file}`, fileBuffer, {
        contentType: 'image/jpeg',
        upsert: true,
      });

    if (error) {
      console.error(`  Error uploading ${file}:`, error.message);
    } else {
      console.log(`  Uploaded: ${file}`);
    }
  }
}

async function seedCharacters() {
  console.log(`Seeding ${seedData.characters.length} characters...`);

  for (const char of seedData.characters) {
    // Insert character
    const { data: charData, error: charError } = await supabase
      .from('characters')
      .upsert({
        name_en: char.name_en,
        name_th: char.name_th,
        slug: char.slug,
        role: char.role,
        type: char.type,
        image_url: char.image_url,
        notes: char.notes || null,
      }, { onConflict: 'slug' })
      .select()
      .single();

    if (charError) {
      console.error(`  Error inserting ${char.name_en}:`, charError.message);
      continue;
    }

    console.log(`  Character: ${char.name_en}`);

    // Insert skills
    for (const skill of char.skills) {
      const { error: skillError } = await supabase
        .from('character_skills')
        .insert({
          character_id: charData.id,
          name: skill.name,
          name_th: skill.name_th,
          cooldown: skill.cooldown || null,
          skill_order: skill.skill_order,
        });

      if (skillError) {
        console.error(`    Skill error:`, skillError.message);
      }
    }
  }
}

async function seedTeams() {
  console.log(`Seeding ${seedData.team_compositions.length} team compositions...`);

  for (const team of seedData.team_compositions) {
    const { error } = await supabase
      .from('team_compositions')
      .upsert({
        name: team.name,
        slug: team.slug,
        category: team.category,
        description: team.description,
        strategy_notes: team.strategy_notes,
        speed_requirement: team.speed_requirement,
        tier: team.tier,
      }, { onConflict: 'slug' });

    if (error) {
      console.error(`  Error inserting ${team.name}:`, error.message);
    } else {
      console.log(`  Team: ${team.name}`);
    }
  }
}

async function main() {
  console.log('NyanNeko Sheet - Database Seed\n');

  await seedCharacters();
  await seedTeams();
  await uploadImages();

  console.log('\nDone!');
}

main().catch(console.error);
