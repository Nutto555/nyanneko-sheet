"""
fix-characters.py — Parse XLSX file with proper image anchoring to fix
character image assignments in seed-data.json.

The XLSX drawing XML contains exact cell anchor positions for each image,
which is far more reliable than the HTML export.

Layout per character group (BCDEF, HIJKL, NOPQR, TUVWX):
  B/H/N/T: character name
  C/I/O/U: character portrait (214x267)
  D/J/P/V: skill 2 (128x128, optional)
  E/K/Q/W: skill 1 (128x128)
  F/L/R/X: passive (128x128)

Usage:
  python scripts/fix-characters.py "path/to/spreadsheet.xlsx"
"""

import json
import os
import re
import struct
import sys
import zipfile
from xml.etree import ElementTree as ET

NS = {
    "xdr": "http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing",
    "a": "http://schemas.openxmlformats.org/drawingml/2006/main",
    "r": "http://schemas.openxmlformats.org/officeDocument/2006/relationships",
    "ss": "http://schemas.openxmlformats.org/spreadsheetml/2006/main",
}

# Thai name -> slug mapping
THAI_TO_SLUG = {
    "ไพร์": "fai", "ทากะ": "taka", "เฮฟเว่นเนีย": "heavenia", "จิน": "jin",
    "ไคล์": "kyle", "เซอิน": "shane", "เฟิงเยี่ยน": "feng-yan", "เรย์": "ray",
    "บรันซ์ & บรันเซล": "bnb", "บาลิสต้า": "ballista", "โซอี": "zoe",
    "จูล่ง": "zhao-yun", "คางูระ": "kagura", "พีดัม": "bidam",
    "สนิปเปอร์": "snipper", "ลีโอ": "leo", "ลิโป้": "lu-bu",
    "เอมิเลีย": "emilia", "จูพี้": "jupy", "โฮกิ้น": "hokin",
    "ไรอัน": "ryan", "ไป๋หลง": "bailong", "เสี่ยว": "xiao",
    "พยัคฆ์เมฆา": "byakko", "แรนด์กริด": "randgrid", "เจน": "jane",
    "โคลท์": "colt", "เมย์": "may", "แทโอ": "teo",
    "แบล็คโรส": "black-rose", "เดลโลนส์": "dellons", "แคทตี้": "catty",
    "จูริ": "juri", "เบลลีก้า": "bellika", "เอเรียล": "ariel",
    "คลีโอ": "cleo", "มิเลีย": "milia", "ลูลี่": "lully",
    "ซิลเวีย": "sylvia", "เฟรยา": "freyja", "เอสปาด้า": "espada",
    "เซร่า": "sera", "คิริเอล": "kiriel", "ยูชิน": "yushin",
    "โนโฮ": "noho", "ริน": "rin", "ปาสคาล": "pascal",
    "หลิงหลิง": "ling-ling", "ยอนฮี": "yeonhee", "เดซี่": "daisy",
    "ยูริ": "yuri", "เมลคีร์": "mercure", "มิโฮะ": "miho",
    "เบน": "ben", "ซิลเวสต้า": "silvesta", "เสี่ยวเฉียว": "xiao-qiao",
    "โจ๊กเกอร์": "joker", "วาเนสซา่": "vanessa", "วาเนสซ่า": "vanessa",
    "เรกินเลฟ": "reginleif", "เกลลิดัส": "gelidus", "เนีย": "nia",
    "วิคตอเรีย": "victoria", "เอลิเซีย": "elisia", "ชานชะเลอร์": "chancellor",
    "อสุรา": "asura", "พาลานอส": "pallanus", "ซีค": "sieg",
    "ลาเนีย": "lania", "ซุนหงอคง": "sun-wukong", "ไป๋เจียว": "baijiao",
    "กวนอู": "guan-yu", "ธรูด": "thrud", "คาร์ม่า": "karma",
    "ไอลีน": "eileen", "ราเชล": "rachel", "สไปค์": "spike",
    "เจฟ": "jave", "คริส": "kris", "เอซ": "ace",
    "ลูดี้": "rudy", "อารากอน": "aragon", "เฮเลเนีย": "hellenia",
    "อากีลา": "aquila", "ลุค": "luc", "อีวาน": "evan",
    "แร็ดกริด": "redgrid", "น๊อกซ์": "knox", "ลี": "lee",
    "โรซี่": "rosie", "เตียวเสี้ยน": "diaochan", "คาริน": "karin",
    "เพลตัน": "platin", "คารอน": "charon", "บิสกิต": "biscuit",
    "ลูซี่": "lucy", "อลิซ": "alice", "ยูอิ": "yui",
    "รีน่า": "reina", "โคลอี้": "chloe", "ออร์ลี่": "orly",
    "ซาร่า": "sarah",
}

SLUG_TO_NAME_EN = {
    "fai": "Fai", "kyle": "Kyle", "hokin": "Hokin", "ryan": "Ryan",
    "bailong": "Bailong", "baijiao": "Baijiao", "eileen": "Eileen",
    "rosie": "Rosie", "bnb": "BnB",
}


def get_image_size(filepath):
    """Get image dimensions."""
    with open(filepath, "rb") as f:
        header = f.read(24)
    if header[:4] == b"\x89PNG":
        w = struct.unpack(">I", header[16:20])[0]
        h = struct.unpack(">I", header[20:24])[0]
        return w, h
    return None, None


def img_path(filename):
    return f"/images/characters/{filename}"


def parse_xlsx(xlsx_path, images_dir):
    """Parse XLSX with proper drawing anchor positions."""
    with zipfile.ZipFile(xlsx_path) as z:
        # Read shared strings
        shared = []
        if "xl/sharedStrings.xml" in z.namelist():
            ss_root = ET.fromstring(z.read("xl/sharedStrings.xml"))
            for si in ss_root.findall("ss:si", NS):
                texts = [t.text or "" for t in si.findall(".//ss:t", NS)]
                shared.append("".join(texts))

        # Read cell values
        sheet = ET.fromstring(z.read("xl/worksheets/sheet1.xml"))
        cell_map = {}
        for row_el in sheet.findall(".//ss:row", NS):
            r = int(row_el.get("r", 0)) - 1
            for cell_el in row_el.findall("ss:c", NS):
                ref = cell_el.get("r", "")
                col_letters = re.match(r"([A-Z]+)", ref)
                if not col_letters:
                    continue
                col = 0
                for ch in col_letters.group(1):
                    col = col * 26 + (ord(ch) - ord("A") + 1)
                col -= 1

                v_el = cell_el.find("ss:v", NS)
                if v_el is None or v_el.text is None:
                    continue
                t = cell_el.get("t", "")
                val = shared[int(v_el.text)] if t == "s" else v_el.text
                if val.strip():
                    cell_map[(col, r)] = val.strip()

        # Read drawing anchors
        # Find drawing file
        sheet_rels_path = "xl/worksheets/_rels/sheet1.xml.rels"
        drawing_path = None
        if sheet_rels_path in z.namelist():
            sheet_rels = ET.fromstring(z.read(sheet_rels_path))
            for rel in sheet_rels:
                if "drawing" in rel.get("Target", "").lower():
                    drawing_path = "xl/" + rel.get("Target").replace("../", "")
                    break

        if not drawing_path:
            raise FileNotFoundError("No drawing found in XLSX")

        drawing = ET.fromstring(z.read(drawing_path))
        rels_path = drawing_path.replace("drawings/", "drawings/_rels/") + ".rels"
        rels = ET.fromstring(z.read(rels_path))

        rid_to_media = {}
        for rel in rels:
            target = rel.get("Target", "")
            rid_to_media[rel.get("Id")] = target.split("/")[-1]

        # Build anchor map: (col, row) -> media_filename
        anchor_map = {}
        xdr = NS["xdr"]
        a_ns = NS["a"]
        r_ns = NS["r"]

        for anchor_tag in ("oneCellAnchor", "twoCellAnchor"):
            for anchor in drawing.findall(f"{{{xdr}}}{anchor_tag}"):
                frm = anchor.find(f"{{{xdr}}}from")
                if frm is None:
                    continue
                col_el = frm.find(f"{{{xdr}}}col")
                row_el = frm.find(f"{{{xdr}}}row")
                if col_el is None or row_el is None:
                    continue
                col = int(col_el.text)
                row = int(row_el.text)

                pic = anchor.find(f"{{{xdr}}}pic")
                if pic is None:
                    continue
                blip = pic.find(f".//{{{a_ns}}}blip")
                if blip is None:
                    continue
                rid = blip.get(f"{{{r_ns}}}embed")
                media = rid_to_media.get(rid, "")
                if media:
                    anchor_map[(col, row)] = media

        # Copy media files to images_dir
        media_files = [n for n in z.namelist() if n.startswith("xl/media/")]
        for mf in media_files:
            fname = mf.split("/")[-1]
            dest = os.path.join(images_dir, fname)
            if not os.path.exists(dest):
                with open(dest, "wb") as out:
                    out.write(z.read(mf))

    # Group by character
    name_cols = [1, 7, 13, 19]
    # Image columns: portrait, skill2, skill1, passive
    img_col_groups = [
        (2, 3, 4, 5),
        (8, 9, 10, 11),
        (14, 15, 16, 17),
        (20, 21, 22, 23),
    ]

    characters = []
    all_rows = sorted(set(r for _, r in cell_map.keys()))

    for row in all_rows:
        for i, name_col in enumerate(name_cols):
            name = cell_map.get((name_col, row), "")
            if not name:
                continue

            slug = THAI_TO_SLUG.get(name)
            if not slug:
                print(f"  WARNING: No slug for '{name}' - skipping")
                continue

            portrait_col, skill2_col, skill1_col, passive_col = img_col_groups[i]

            portrait = anchor_map.get((portrait_col, row))
            skill2 = anchor_map.get((skill2_col, row))
            skill1 = anchor_map.get((skill1_col, row))
            passive = anchor_map.get((passive_col, row))

            characters.append({
                "name_th": name,
                "slug": slug,
                "char_img": portrait,
                "skill1_img": skill1,
                "skill2_img": skill2,
                "passive_img": passive,
            })

    return characters


def main():
    if len(sys.argv) < 2:
        print("Usage: python scripts/fix-characters.py <spreadsheet.xlsx>")
        sys.exit(1)

    xlsx_path = sys.argv[1]
    project_root = os.path.join(os.path.dirname(__file__), "..")
    images_dir = os.path.join(project_root, "public", "images", "characters")
    seed_path = os.path.join(os.path.dirname(__file__), "seed-data.json")

    print(f"Parsing XLSX: {xlsx_path}")
    sheet_chars = parse_xlsx(xlsx_path, images_dir)
    print(f"Found {len(sheet_chars)} characters\n")

    # Build lookup by slug (prefer เบน over บรันซ์ & บรันเซล for "ben")
    sheet_lookup = {}
    for c in sheet_chars:
        if c["slug"] not in sheet_lookup:
            sheet_lookup[c["slug"]] = c
        elif c["name_th"] == "เบน":
            sheet_lookup[c["slug"]] = c

    # Load seed data
    with open(seed_path, encoding="utf-8") as f:
        seed_data = json.load(f)

    existing_slugs = {c["slug"] for c in seed_data["characters"]}
    updated = 0
    added = 0

    for char in seed_data["characters"]:
        sc = sheet_lookup.get(char["slug"])
        if not sc:
            print(f"  SKIP: '{char['slug']}' not in spreadsheet")
            continue

        if sc["char_img"]:
            char["image_url"] = img_path(sc["char_img"])

        skills = []
        if sc["skill1_img"]:
            skills.append({
                "name": "Skill 1", "name_th": "\u0e2a\u0e01\u0e34\u0e25 1",
                "cooldown": "", "skill_order": 0,
                "icon_url": img_path(sc["skill1_img"]),
            })
        if sc["skill2_img"]:
            skills.append({
                "name": "Skill 2", "name_th": "\u0e2a\u0e01\u0e34\u0e25 2",
                "cooldown": "", "skill_order": 1,
                "icon_url": img_path(sc["skill2_img"]),
            })
        if sc["passive_img"]:
            skills.append({
                "name": "Passive", "name_th": "\u0e41\u0e1e\u0e2a\u0e0b\u0e35\u0e1f",
                "cooldown": "", "skill_order": len(skills),
                "icon_url": img_path(sc["passive_img"]),
            })
        char["skills"] = skills
        updated += 1

    # Add new characters
    for sc in sheet_chars:
        if sc["slug"] in existing_slugs or sc["slug"] in {c["slug"] for c in seed_data["characters"]}:
            continue
        name_en = SLUG_TO_NAME_EN.get(sc["slug"], sc["slug"].replace("-", " ").title())
        skills = []
        if sc["skill1_img"]:
            skills.append({"name": "Skill 1", "name_th": "\u0e2a\u0e01\u0e34\u0e25 1", "cooldown": "", "skill_order": 0, "icon_url": img_path(sc["skill1_img"])})
        if sc["skill2_img"]:
            skills.append({"name": "Skill 2", "name_th": "\u0e2a\u0e01\u0e34\u0e25 2", "cooldown": "", "skill_order": 1, "icon_url": img_path(sc["skill2_img"])})
        if sc["passive_img"]:
            skills.append({"name": "Passive", "name_th": "\u0e41\u0e1e\u0e2a\u0e0b\u0e35\u0e1f", "cooldown": "", "skill_order": len(skills), "icon_url": img_path(sc["passive_img"])})

        seed_data["characters"].append({
            "name_en": name_en, "name_th": sc["name_th"], "slug": sc["slug"],
            "role": "", "type": "",
            "image_url": img_path(sc["char_img"]) if sc["char_img"] else "",
            "notes": "", "skills": skills,
        })
        added += 1
        print(f"  NEW: {name_en} ({sc['name_th']})")

    with open(seed_path, "w", encoding="utf-8") as f:
        json.dump(seed_data, f, indent=2, ensure_ascii=False)

    print(f"\nDone! Updated {updated}, added {added}. Total: {len(seed_data['characters'])}")


if __name__ == "__main__":
    main()
