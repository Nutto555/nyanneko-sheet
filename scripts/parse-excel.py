"""
Parse gvg-nyanneko.xlsx → team_builds for seed-data.json

Reads team compositions from the Excel sheets (Attack, Defense Phy/Mage/Tank/Hybrid)
and outputs a team_builds array compatible with seed.ts TeamBuild interface.

Usage: python3 scripts/parse-excel.py
"""

import json
import re
import os

import openpyxl

EXCEL_PATH = os.path.join(os.path.dirname(__file__), '..', 'public', 'data', 'gvg-nyanneko.xlsx')
SEED_PATH = os.path.join(os.path.dirname(__file__), 'seed-data.json')

# ---------------------------------------------------------------------------
# Nickname → slug mapping (verified against seed-data.json)
# ---------------------------------------------------------------------------
NICKNAME_TO_SLUG = {
    # English nicknames
    'lubu': 'lu-bu',
    'lu bu': 'lu-bu',
    'bnb': 'ben',  # BnB = Ben (เบน)
    'ben': 'ben',
    'amelia': 'emilia',  # Amelia in Excel = Emilia (เอมิเลีย)
    'emilia': 'emilia',
    'melia': 'emilia',
    'kagura': 'kagura',
    'freya': 'freyja',
    'freyja': 'freyja',
    'reginleif': 'reginleif',
    'regin': 'reginleif',
    'vanessa': 'vanessa',
    'vaness': 'vanessa',
    'diaochan': 'diaochan',
    'diao': 'diaochan',
    'sjw': 'zhao-yun',  # SJW = Zhao Yun (จูล่ง)
    'zhao yun': 'zhao-yun',
    'kyrielle': 'kiriel',  # Kyrielle in Excel = Kiriel (คิริเอล)
    'kiriel': 'kiriel',
    'wukong': 'sun-wukong',
    'wk': 'sun-wukong',
    'elysia': 'elisia',  # Elysia in Excel = Elisia (เอลิเซีย)
    'elisia': 'elisia',
    'radgrid': 'randgrid',  # Radgrid in Excel = Randgrid (แรนด์กริด)
    'randgrid': 'randgrid',
    'gelidus': 'gelidus',
    'ace': 'ace',
    'aragon': 'aragon',
    'pallanus': 'pallanus',
    'knox': 'knox',
    'trude': 'thrud',  # Trude in Excel = Thrud (ธรูด)
    'thrud': 'thrud',
    'kris': 'kris',
    'rosie': 'rosie',  # Not in seed data yet — will be flagged
    # Thai nicknames (from Excel headers and character name cells)
    'พาลานอส': 'pallanus',
    'อารากอน': 'aragon',
    'เอลิเซีย': 'elisia',
    'ลิโป้': 'lu-bu',
    'ลิง': 'sun-wukong',  # ลิง = monkey = Wukong
}


def get_cell(ws, row, col):
    """Get cell value, returning empty string if None."""
    val = ws.cell(row, col).value
    if val is None:
        return ''
    return str(val).strip()


def extract_names_from_text(text):
    """Extract character names from skill/speed order text."""
    if not text:
        return []

    text_lower = text.lower()
    found = []
    # Sort by length descending so longer names match first (e.g., 'reginleif' before 'regin')
    for nick in sorted(NICKNAME_TO_SLUG.keys(), key=len, reverse=True):
        if nick in text_lower:
            slug = NICKNAME_TO_SLUG[nick]
            if slug not in found:
                found.append(slug)
            # Remove matched name to avoid double-matching
            text_lower = text_lower.replace(nick, '')

    return found


def parse_speed_requirement(text):
    """Extract speed requirement from team header text."""
    if not text:
        return None

    # Match patterns like "spd > 250", "spd < 150", "270++", "Speed 240++"
    patterns = [
        r'spd\s*[>]\s*(\d+)',
        r'spd\s*[<]\s*(\d+)',
        r'speed\s*(\d+)\+\+',
        r'(\d+)\+\+',
    ]

    for pattern in patterns:
        m = re.search(pattern, text, re.IGNORECASE)
        if m:
            num = m.group(1)
            if '>' in text[:m.start() + 10] or 'fast' in text.lower():
                return f'{num}++'
            if '<' in text[:m.start() + 10] or 'slow' in text.lower():
                return f'< {num}'
            return f'{num}++'

    if 'slow' in text.lower():
        return '< 150'
    if 'fast' in text.lower():
        return '250++'

    return None


def slugify(text):
    """Create URL-safe slug from text."""
    text = text.lower().strip()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[\s_]+', '-', text)
    text = re.sub(r'-+', '-', text)
    return text[:80].strip('-')


# ---------------------------------------------------------------------------
# Sheet-specific team block definitions
# Each block: (header_row, stat_rows, skill_row, speed_row, stat_cols)
# stat_cols: list of (primary_col, secondary_col, target_col, notes_col) per slot
# ---------------------------------------------------------------------------

# Defense Phy: 3 character slots at cols (5-6), (11-12), (17-18)
# Target at cols 4, 10, 16
# Pattern repeats every ~22 rows. Headers at rows 3, 25, 47, 68, 90
DEFENSE_PHY_BLOCKS = [
    {'header_row': 3, 'stat1_row': 11, 'target_row': 15, 'stat2_row': 16, 'notes_row': 17, 'skill_row': 20, 'speed_row': 20},
    {'header_row': 25, 'stat1_row': 33, 'target_row': 37, 'stat2_row': 38, 'notes_row': 39, 'skill_row': 42, 'speed_row': 42},
    {'header_row': 47, 'stat1_row': 55, 'target_row': 59, 'stat2_row': 60, 'notes_row': 61, 'skill_row': 64, 'speed_row': 64},
    {'header_row': 68, 'stat1_row': 76, 'target_row': 80, 'stat2_row': 81, 'notes_row': 82, 'skill_row': 85, 'speed_row': 85},
    {'header_row': 90, 'stat1_row': 98, 'target_row': 102, 'stat2_row': 103, 'notes_row': 104, 'skill_row': 107, 'speed_row': 107},
]

# Defense Mage: same column layout as Phy
# Some blocks don't have a header at col 3 — use fallback_name from the skill/speed order text
DEFENSE_MAGE_BLOCKS = [
    {'header_row': 3, 'header2_row': 5, 'stat1_row': 13, 'target_row': 17, 'stat2_row': 18, 'notes_row': 19, 'skill_row': 22, 'speed_row': 22},
    {'header_row': 27, 'stat1_row': 35, 'target_row': 39, 'stat2_row': 40, 'notes_row': 41, 'skill_row': 44, 'speed_row': 44},
    {'header_row': 49, 'fallback_name': 'Mage Reginleif + Freya', 'stat1_row': 55, 'target_row': 59, 'stat2_row': 60, 'notes_row': 61, 'skill_row': 64, 'speed_row': 64},
    {'header_row': 69, 'fallback_name': 'Mage Reginleif + SJW', 'stat1_row': 75, 'target_row': 79, 'stat2_row': 80, 'notes_row': 81, 'skill_row': 84, 'speed_row': 84},
    {'header_row': 89, 'stat1_row': 95, 'target_row': 99, 'stat2_row': 100, 'notes_row': 101, 'skill_row': 104, 'speed_row': 104},
    {'header_row': 109, 'stat1_row': 117, 'target_row': 121, 'stat2_row': 122, 'notes_row': 123, 'skill_row': 126, 'speed_row': 126},
    {'header_row': 129, 'fallback_name': 'Mage Diaochan + Reginleif + Freya', 'stat1_row': 135, 'target_row': 139, 'stat2_row': 140, 'notes_row': 141, 'skill_row': 144, 'speed_row': 144},
    {'header_row': 150, 'stat1_row': 158, 'target_row': 162, 'stat2_row': 163, 'notes_row': 164, 'skill_row': 167, 'speed_row': 167},
    {'header_row': 173, 'stat1_row': 181, 'target_row': 185, 'stat2_row': 186, 'notes_row': 187, 'skill_row': 190, 'speed_row': 190},
]

# Defense Tank: same column layout, but some blocks lack headers (they continue context)
DEFENSE_TANK_BLOCKS = [
    {'header_row': 3, 'stat1_row': 11, 'target_row': 15, 'stat2_row': 16, 'notes_row': 17, 'skill_row': 20, 'speed_row': 20},
    {'header_row': 25, 'stat1_row': 33, 'target_row': None, 'stat2_row': 38, 'notes_row': 39, 'skill_row': 42, 'speed_row': 42},
    {'header_row': 47, 'fallback_name': 'Tank WK + Ace', 'stat1_row': 53, 'target_row': None, 'stat2_row': 58, 'notes_row': 59, 'skill_row': 62, 'speed_row': 62},
    {'header_row': 67, 'fallback_name': 'Aragon + Pallanus Counter', 'stat1_row': 73, 'target_row': None, 'stat2_row': 78, 'notes_row': 79, 'skill_row': 82, 'speed_row': 82},
    {'header_row': 89, 'fallback_name': 'Pallanus + Knox Slow Counter', 'stat1_row': 93, 'target_row': None, 'stat2_row': 98, 'notes_row': 99, 'skill_row': 102, 'speed_row': 102},
    {'header_row': 107, 'fallback_name': 'Gelidus + Trude + Ace', 'stat1_row': 113, 'target_row': None, 'stat2_row': 118, 'notes_row': 119, 'skill_row': 122, 'speed_row': 122},
]

# Attack: different column layout — slots at cols (8-9), (14-15), (20-21), target at 7, 13, 19
# Skill order at col 6, speed order at col 12
ATTACK_BLOCKS = [
    {'header_row': 3, 'stat1_row': 9, 'target_row': 13, 'stat2_row': 14, 'notes_row': 15,
     'skill_row': 18, 'speed_row': 18, 'skill_col': 6, 'speed_col': 12,
     'slot_cols': [(8, 9, 7, 15), (14, 15, 13, 15), (20, 21, 19, 15)]},
]

# Defense Hybrid: only 2 blocks, no skill/speed order
DEFENSE_HYBRID_BLOCKS = [
    {'header_row': 3, 'stat1_row': 11, 'target_row': None, 'stat2_row': 16, 'notes_row': None, 'skill_row': None, 'speed_row': None},
    {'header_row': 25, 'stat1_row': None, 'target_row': None, 'stat2_row': None, 'notes_row': None, 'skill_row': None, 'speed_row': None},
]

# Default slot columns for defense sheets: (primary_col, secondary_col) per slot
# Slot 0: cols 5,6  target: col 4
# Slot 1: cols 11,12  target: col 10
# Slot 2: cols 17,18  target: col 16
DEFAULT_SLOT_COLS = [
    (5, 6, 4, 17),   # slot 0: stat1=5, stat2=6, target=4, notes=17
    (11, 12, 10, 17), # slot 1: stat1=11, stat2=12, target=10, notes=17
    (17, 18, 16, 17), # slot 2: stat1=17, stat2=18, target=16, notes=17
]


def parse_team_block(ws, block, category, slot_cols=None):
    """Parse a single team block from a worksheet."""
    if slot_cols is None:
        slot_cols = DEFAULT_SLOT_COLS

    header = get_cell(ws, block['header_row'], 3)
    if not header and block.get('header2_row'):
        header = get_cell(ws, block['header2_row'], 3)

    # For Attack sheet, header is in col 2
    if not header:
        header = get_cell(ws, block['header_row'], 2)

    # Use fallback name if header cell is empty
    if not header:
        header = block.get('fallback_name', '')

    if not header:
        return None

    speed_req = parse_speed_requirement(header)

    # Get skill/speed order text
    skill_text = ''
    speed_text = ''
    skill_col = block.get('skill_col', 3)
    speed_col = block.get('speed_col', 9)
    if block.get('skill_row'):
        skill_text = get_cell(ws, block['skill_row'], skill_col)
        speed_text = get_cell(ws, block['speed_row'], speed_col)

    # Also check for explicit character name cells (e.g., Attack sub-teams)
    extra_names_text = ''
    for name_cell in block.get('name_cells', []):
        val = get_cell(ws, name_cell[0], name_cell[1])
        if val:
            extra_names_text += ' ' + val

    # Extract character names from skill + speed order text + explicit name cells
    combined_text = f"{skill_text} {speed_text} {header} {extra_names_text}"
    char_slugs = extract_names_from_text(combined_text)

    # Build member data from stat columns
    members = []
    for i, (s1_col, s2_col, tgt_col, notes_col_base) in enumerate(slot_cols):
        stat_primary = get_cell(ws, block['stat1_row'], s1_col) if block.get('stat1_row') else ''
        stat_secondary_1 = get_cell(ws, block['stat1_row'], s2_col) if block.get('stat1_row') else ''

        stat_primary_2 = get_cell(ws, block['stat2_row'], s1_col) if block.get('stat2_row') else ''
        stat_secondary_2 = get_cell(ws, block['stat2_row'], s2_col) if block.get('stat2_row') else ''

        target = get_cell(ws, block['target_row'], tgt_col) if block.get('target_row') else ''

        notes = get_cell(ws, block['notes_row'], s1_col) if block.get('notes_row') else ''

        # Use character slug if we have enough, otherwise use position placeholder
        slug = char_slugs[i] if i < len(char_slugs) else f'unknown-{i}'

        member = {
            'slug': slug,
            'position': i,
            'stat_primary': f"{stat_primary}/{stat_secondary_1}".strip('/') if stat_secondary_1 else stat_primary,
            'stat_secondary': f"{stat_primary_2}/{stat_secondary_2}".strip('/') if stat_secondary_2 else stat_primary_2,
        }
        if target:
            member['stat_target'] = target
        if notes:
            member['notes'] = notes.replace('\n', ' ')

        if stat_primary or stat_primary_2:  # Only add if there's actual stat data
            members.append(member)

    # Generate team name and slug
    speed_label = ''
    if speed_req:
        if '<' in (speed_req or ''):
            speed_label = 'Slow'
        else:
            speed_label = 'Fast'

    # Use first character names in the name
    char_names = [s.replace('-', ' ').title() for s in char_slugs[:2]]
    char_label = ' + '.join(char_names) if char_names else 'Team'

    block_idx = block.get('_index', 0)
    team_name = f"{header[:60]}"
    team_slug = slugify(f"{category}-{block_idx}-{header[:40]}")

    # Clean skill text
    skill_order = skill_text.replace('\n', ' ').strip() if skill_text else None
    speed_order = speed_text.replace('\n', ' ').strip() if speed_text else None

    build = {
        'name': team_name,
        'slug': team_slug,
        'category': category,
    }
    if speed_req:
        build['speed_requirement'] = speed_req
    if skill_order:
        build['skill_order'] = skill_order
    if speed_order:
        build['speed_order'] = speed_order
    if members:
        build['members'] = members

    return build


def main():
    print(f'Reading {EXCEL_PATH}...')
    wb = openpyxl.load_workbook(EXCEL_PATH, read_only=False, data_only=True)

    team_builds = []

    # Defense Phy
    print('\nParsing Defense Phy...')
    ws = wb['Defense Phy']
    for i, block in enumerate(DEFENSE_PHY_BLOCKS):
        block['_index'] = i
        build = parse_team_block(ws, block, 'defense_phy')
        if build:
            team_builds.append(build)
            print(f"  [{i}] {build['name'][:50]} — {len(build.get('members', []))} members")

    # Defense Mage
    print('\nParsing Defense Mage...')
    ws = wb['Defense Mage']
    for i, block in enumerate(DEFENSE_MAGE_BLOCKS):
        block['_index'] = i
        build = parse_team_block(ws, block, 'defense_mage')
        if build:
            team_builds.append(build)
            print(f"  [{i}] {build['name'][:50]} — {len(build.get('members', []))} members")

    # Defense Tank
    print('\nParsing Defense tank...')
    ws = wb['Defense tank']
    for i, block in enumerate(DEFENSE_TANK_BLOCKS):
        block['_index'] = i
        build = parse_team_block(ws, block, 'defense_tank')
        if build:
            team_builds.append(build)
            print(f"  [{i}] {build['name'][:50]} — {len(build.get('members', []))} members")

    # Attack — different column layout
    print('\nParsing Attack...')
    ws = wb['Attack']
    atk_slot_cols = [(8, 9, 7, 15), (14, 15, 13, 15), (20, 21, 19, 15)]
    for i, block in enumerate(ATTACK_BLOCKS):
        block['_index'] = i
        build = parse_team_block(ws, block, 'attack', slot_cols=atk_slot_cols)
        if build:
            team_builds.append(build)
            print(f"  [{i}] {build['name'][:50]} — {len(build.get('members', []))} members")

    # Also parse the sub-teams in Attack (rows 83+, 143+)
    # Row 83: เข้าบ้านลิโป้ (vs Lubu teams) — char names at R83 C12=Radgrid, C18=Trude
    # Row 143: Wukong team — char names at R143 C6=Wukong, C12=Radgrid, C18=เอลิเซีย
    atk_sub_blocks = [
        {'header_row': 83, 'stat1_row': 89, 'target_row': None, 'stat2_row': 94, 'notes_row': None,
         'skill_row': None, 'speed_row': None, '_index': 1,
         'name_cells': [(83, 12), (83, 18)]},
        {'header_row': 143, 'stat1_row': 149, 'target_row': 153, 'stat2_row': 154, 'notes_row': 155,
         'skill_row': None, 'speed_row': None, '_index': 2,
         'name_cells': [(143, 6), (143, 12), (143, 18)]},
    ]
    for block in atk_sub_blocks:
        build = parse_team_block(ws, block, 'attack', slot_cols=atk_slot_cols)
        if build:
            team_builds.append(build)
            print(f"  [sub] {build['name'][:50]} — {len(build.get('members', []))} members")

    # Defense Hybrid
    print('\nParsing Defense Hybrid...')
    ws = wb['Defense Hybrid']
    for i, block in enumerate(DEFENSE_HYBRID_BLOCKS):
        block['_index'] = i
        build = parse_team_block(ws, block, 'defense_hybrid')
        if build:
            team_builds.append(build)
            print(f"  [{i}] {build['name'][:50]} — {len(build.get('members', []))} members")

    wb.close()

    # Flag any unknown slugs
    print(f'\nTotal teams parsed: {len(team_builds)}')
    unknown = set()
    for build in team_builds:
        for m in build.get('members', []):
            if m['slug'].startswith('unknown-'):
                unknown.add(f"{build['name']}: position {m['position']}")
    if unknown:
        print(f'\n  WARNING: {len(unknown)} members with unknown character:')
        for u in sorted(unknown):
            print(f'    {u}')

    # Load existing seed data and add team_builds
    print(f'\nUpdating {SEED_PATH}...')
    with open(SEED_PATH) as f:
        seed_data = json.load(f)

    seed_data['team_builds'] = team_builds

    with open(SEED_PATH, 'w') as f:
        json.dump(seed_data, f, indent=2, ensure_ascii=False)

    print(f'Done! Added {len(team_builds)} team builds to seed-data.json')


if __name__ == '__main__':
    main()
