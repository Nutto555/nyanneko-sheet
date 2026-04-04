# NyanNeko Sheet - Claude Project Guide

> This document is a comprehensive guide for any Claude session to continue building this project.
> **Game:** Seven Knights (7K) — a mobile RPG
> **Purpose:** Guild vs Guild (GvG) guide platform for the guild "NyanNeko"
> **Owner:** Nat (nnatchy on GitHub)

---

## Project Overview

NyanNeko Sheet is a web-based GvG guide platform that stores and displays:
- **25 characters** from Seven Knights with skills, stat recommendations, and images
- **6 team compositions** across categories: Attack, Defense Hybrid, Defense Phy, Defense Mage, Defense Tank
- **Strategy guides** for GvG warfare
- **Equipment/gear recommendations** per character

---

## Tech Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| Frontend | React 19 + TypeScript | SPA with Vite |
| Styling | Tailwind CSS v4 | Custom dark theme with purple/amber accents |
| Routing | React Router v7 | Nested routes under Layout |
| Backend/DB | Supabase (PostgreSQL) | Free tier, with Storage for images |
| Build Tool | Vite 8 | With @tailwindcss/vite plugin |

---

## Repository

- **GitHub:** https://github.com/nnatchy/nyanneko-sheet
- **Local path:** `C:\Users\Admin\Documents\GitHub\nyanneko-sheet`

---

## Project Structure

```
nyanneko-sheet/
├── public/
│   └── images/
│       └── characters/          # 49 character/equipment JPG images
│           └── cellImage_*.jpg
├── scripts/
│   ├── seed-data.json           # All 25 characters + 6 teams as JSON
│   └── seed.ts                  # Script to seed Supabase DB + upload images
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql  # Full DB schema with RLS policies
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Layout.tsx       # Main layout with Outlet
│   │   │   ├── Navbar.tsx       # Top navigation bar
│   │   │   └── Footer.tsx       # Site footer
│   │   ├── ui/
│   │   │   ├── Card.tsx         # Reusable card with hover effect
│   │   │   ├── Badge.tsx        # Label badge (primary/secondary/accent/neutral)
│   │   │   └── Button.tsx       # Button (primary/secondary/ghost, sm/md/lg)
│   │   └── common/              # (empty - for future shared components)
│   ├── hooks/
│   │   ├── useCharacters.ts     # useCharacters(), useCharacter(slug)
│   │   └── useTeams.ts          # useTeams()
│   ├── lib/
│   │   └── supabase.ts          # Supabase client + getImageUrl helper
│   ├── pages/
│   │   ├── Home.tsx             # Landing page with hero, stats, features
│   │   ├── Characters.tsx       # Character gallery with role filter + search
│   │   ├── CharacterDetail.tsx  # Single character view with skills
│   │   ├── Compositions.tsx     # Team comps with category filter
│   │   ├── Guides.tsx           # Strategy guides (placeholder content)
│   │   ├── TierList.tsx         # Tier list (placeholder)
│   │   └── About.tsx            # About page
│   ├── services/
│   │   ├── characters.ts        # Supabase queries + local fallback for characters
│   │   └── teams.ts             # Supabase queries + local fallback for teams
│   ├── types/
│   │   ├── database.ts          # Full Supabase DB types (Character, Skill, Team, etc.)
│   │   └── index.ts             # Nav types
│   ├── utils/                   # (empty - for future utilities)
│   ├── assets/                  # (empty)
│   ├── App.tsx                  # Router setup with all routes
│   ├── main.tsx                 # Entry point
│   └── index.css                # Tailwind imports + custom theme colors
├── .env.example                 # Template for Supabase credentials
├── .gitignore
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── vite.config.ts
└── README.md
```

---

## Database Schema (Supabase PostgreSQL)

### Tables

**characters**
- `id` UUID PK
- `name_en` VARCHAR(100) — English name (e.g., "Pallanus")
- `name_th` VARCHAR(100) — Thai name (e.g., "พาลานอส")
- `slug` VARCHAR(100) UNIQUE — URL slug (e.g., "pallanus")
- `role` VARCHAR(50) — "attack", "defense", "support", "tank"
- `type` VARCHAR(200) — Team type from Excel (e.g., "ทั่วไป", "ทีมสปีด")
- `image_url` TEXT — Path to character image
- `thumbnail_url` TEXT
- `notes` TEXT — Stat recommendations (e.g., "โจมตี 2700, อัตราคริ 78%-100%")
- `created_at`, `updated_at` TIMESTAMPTZ

**character_skills**
- `id` UUID PK
- `character_id` UUID FK → characters
- `name` VARCHAR(100) — "Basic Attack", "Skill 1", "Skill 2", "Passive"
- `name_th` VARCHAR(100) — Thai name
- `description` TEXT
- `cooldown` VARCHAR(20) — "⏳" (cooldown), "⛔" (unavailable), "★6" (requires 6-star)
- `skill_order` INT

**equipment**
- `id` UUID PK
- `character_id` UUID FK → characters
- `slot` VARCHAR(50) — "weapon", "armor", "accessory_1", etc.
- `stat_primary`, `stat_secondary` VARCHAR(100) — e.g., "ATK%", "DEF%", "HP%"
- `recommended_value` VARCHAR(100) — e.g., "90++"
- `notes` TEXT

**team_compositions**
- `id` UUID PK
- `name`, `slug` VARCHAR
- `category` VARCHAR(50) — "attack", "defense_hybrid", "defense_phy", "defense_mage", "defense_tank"
- `description`, `strategy_notes` TEXT
- `speed_requirement` VARCHAR(100) — e.g., "270++", "> 250", "< 150"
- `tier` VARCHAR(5) — "S", "A", "B", "C"

**team_members** (junction table)
- `team_id` UUID FK → team_compositions
- `character_id` UUID FK → characters
- `position` INT
- `role_in_team`, `gear_notes` TEXT

### RLS Policies
- All tables: public SELECT enabled
- Storage bucket `character-images`: public read

---

## Character Data (25 Characters)

All from the original Excel file `GvG NyanNeko.xlsx`:

| # | English | Thai | Role | Type |
|---|---------|------|------|------|
| 1 | Pallanus | พาลานอส | defense | ทั่วไป |
| 2 | Diaochan | เตียวเสี้ยน | attack | ทั่วไป |
| 3 | Zhao Yun | จูล่ง | attack | ทั่วไป |
| 4 | Fai | ไพร์ | support | ทั่วไป / ซัพพอร์ต |
| 5 | Rosie | โรซี่ | attack | ทีมสปีดเดธ (เบ็ดเสร็จ) |
| 6 | Juri | จูริ | attack | ทีมสปีด ดับสูญ (เกมเร็ว) |
| 7 | Gelidus | เกลลิดัส | tank | ทั่วไป |
| 8 | Milia | มิเลีย | attack | ทีมเวทดาเมจ / ทีมเวทโควิด |
| 9 | Rudy | ลูดี้ | tank | ทั่วไป |
| 10 | Eileen | ไอลีน | attack | ทั่วไป |
| 11 | Rachel | ราเชล | attack | ตีบอส |
| 12 | Dellons | เดลโลนส์ | support | แบกสปีดทีม |
| 13 | Spike | สไปค์ | tank | ทั่วไป |
| 14 | Jave | เจฟ | attack | ทั่วไป |
| 15 | Vanessa | วาเนสซ่า | attack | ทั่วไป |
| 16 | Kris | คริส | attack | เบ็ดเสร็จ |
| 17 | Silvesta | ซิลเวสต้า | attack | ทั่วไป |
| 18 | Mercure | เมลคีร์ | attack | สายเร็ว |
| 19 | Colt | โคลท์ | attack | ทีมสปีด |
| 20 | Platin | เพลตัน | attack | ทีมกาย / ทีมเวท |
| 21 | Freyja | เฟรยา | attack | ทั่วไป |
| 22 | Sun Wukong | ซุนหงอคง | attack | ทั่วไป |
| 23 | Ace | เอซ | support | ซัพพอร์ต |
| 24 | RIN | ริน | attack | ทั่วไป |
| 25 | Teo | แทโอ | attack | C6 ทีมสปีด |

---

## Team Compositions (6 Teams)

| Name | Category | Tier | Speed Req |
|------|----------|------|-----------|
| Physical Lubu | attack | S | 90++ |
| Defense Hybrid (Pallanus Fast) | defense_hybrid | A | 250+ |
| Defense Phy (Very Fast) | defense_phy | A | 250+ |
| Defense Mage | defense_mage | S | 270++ |
| Defense Tank (Slow Counter) | defense_tank | B | <150 |
| Defense Tank (Fast) | defense_tank | A | 250+ |

---

## Key Architecture Decisions

### Offline/Demo Mode
The services layer (`src/services/characters.ts`, `src/services/teams.ts`) has a **smart fallback system**:
- If `VITE_SUPABASE_URL` is not set, it reads from `scripts/seed-data.json` directly
- This means the app works without a Supabase connection (for local dev/demo)
- Once Supabase is connected, it automatically uses the real database

### Image Storage Strategy
- **Currently:** Images stored locally in `public/images/characters/` (49 JPGs)
- **When Supabase is set up:** The seed script uploads to Supabase Storage bucket `character-images`
- The `getImageUrl()` helper in `src/lib/supabase.ts` handles both local and Supabase URLs

### Tailwind Custom Colors (in `src/index.css`)
```
--color-primary: #7c3aed      (purple)
--color-primary-light: #a78bfa
--color-primary-dark: #5b21b6
--color-secondary: #f59e0b     (amber)
--color-secondary-light: #fbbf24
--color-accent: #ef4444        (red)
--color-dark: #1e1b2e          (dark background)
--color-dark-lighter: #2d2a3e
--color-dark-card: #252238
--color-surface: #1a1730
```

---

## How to Run

```bash
cd C:\Users\Admin\Documents\GitHub\nyanneko-sheet
npm install
npm run dev
# App runs at http://localhost:5173
```

---

## How to Set Up Supabase

1. Go to https://supabase.com and create a free project
2. In Supabase Dashboard → SQL Editor, run `supabase/migrations/001_initial_schema.sql`
3. Go to Settings → API, copy URL and anon key
4. Create `.env` file:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```
5. To seed data: set `SUPABASE_SERVICE_ROLE_KEY` env var, then run `npx tsx scripts/seed.ts`

---

## What's Been Done ✅

- [x] Project scaffolding (React + Vite + TypeScript + Tailwind)
- [x] Parsed all character data from Excel (25 characters, skills, stats)
- [x] Parsed team compositions from Excel (6 teams across 5 categories)
- [x] Extracted 49 character/equipment images from zip
- [x] Supabase database schema with 5 tables + RLS
- [x] Seed data JSON + seed script
- [x] Supabase client with offline fallback
- [x] All frontend pages: Home, Characters, CharacterDetail, Compositions, Guides, TierList, About
- [x] Reusable UI components: Card, Badge, Button
- [x] Layout with Navbar + Footer
- [x] Character search + role filtering
- [x] Team composition category filtering

---

## What Still Needs to Be Done 🔧

### High Priority
- [ ] **Connect to real Supabase** — Create project, run migration, seed data
- [ ] **Equipment page** — Display gear recommendations per character (data exists in Excel `EquipLegend` sheet columns for weapon/armor/accessory stats like ATK%, DEF%, HP%, BLOCK%, WKNESS%)
- [ ] **Map images to characters properly** — Current image mapping is approximate; verify each character's correct image from the HTML file
- [ ] **Mobile responsive navigation** — Hamburger menu is button-only, needs mobile drawer
- [ ] **Push to GitHub** — Project needs to be git init'd and pushed to the empty repo

### Medium Priority
- [ ] **Team members junction** — Link characters to team compositions (which characters go in which team)
- [ ] **Equipment detail per team context** — Different gear stats when character is in different teams (Attack sheet shows different stat priorities than Defense sheets)
- [ ] **Skill descriptions** — Currently skills only have names + cooldown icons; could extract more detail from Excel
- [ ] **Defense formation layouts** — The Defense sheets (Hybrid, Phy, Mage, Tank) have specific formation positions
- [ ] **Admin panel** — CRUD interface for managing characters, teams, guides (behind Supabase Auth)

### Nice to Have
- [ ] **Dark/Light theme toggle**
- [ ] **Thai/English language toggle** — Data already has both languages
- [ ] **Search across all content** — Global search
- [ ] **Tier List page** — Interactive drag-and-drop tier list builder
- [ ] **Deployment** — Deploy to Vercel/Netlify (just connect GitHub repo)
- [ ] **PWA support** — Offline access for mobile users during GvG
- [ ] **Discord integration** — Share compositions to Discord

---

## Original Data Sources

The data came from two uploaded files:
1. **`GvG NyanNeko.xlsx`** — Excel workbook with sheets:
   - `EquipLegend` — Main character database (25 chars, skills, stat recommendations, equipment)
   - `Attack` — Attack team compositions (Physical Lubu formation with skill rotations)
   - `Defense Hybrid` — Hybrid defense team (Pallanus fast, CC focus)
   - `Defense Phy` — Physical defense team (Very fast spd > 250)
   - `Defense Mage` — Mage defense (Speed 270++, CD/Sleep focus)
   - `Defense tank` — Tank defense (2 variations: slow counter vs fast)
   - `รวมรูปตัวละคร` — Character images reference (empty in data, images in cells)
   - Other sheets: copies/backups

2. **`GvG NyanNeko.zip`** — Contains:
   - `EquipLegend.html` — Exported HTML of the main sheet with embedded images
   - `resources/` — 49 JPG images of characters and equipment (cellImage_53149694_*.jpg)

---

## Excel Data Structure Notes

The Excel sheets are visually formatted (merged cells, images in cells, color coding) rather than tabular. Key patterns:
- **Character blocks** repeat every ~16 rows in EquipLegend
- Each block has: character name (Thai / English), 4 skills (Basic, Skill 1, Skill 2, Passive), cooldown icons, stat recommendations
- **Equipment columns** show stat types: ATK%, DEF%, HP%, BLOCK%, WKNESS% (Weakness), DTR% (Damage Taken Reduction), C.RATE% (Crit Rate), C.DMG% (Crit Damage)
- **Speed values** are important: "90++", "70-90", numbers indicate equipment speed targets
- **Team sheets** (Attack, Defense*) show formation layouts with character positions and gear stat priorities per position

---

## Notes for Claude

- The project is in the user's GitHub folder at `C:\Users\Admin\Documents\GitHub\nyanneko-sheet`
- The user's name is Nat, GitHub username is nnatchy
- The game is Seven Knights (Korean mobile RPG), GvG is the main competitive mode
- Thai language content is normal — this is a Thai gaming community tool
- The user prefers practical, working code over perfect architecture
- Always test with `npm run build` before saying something is done
