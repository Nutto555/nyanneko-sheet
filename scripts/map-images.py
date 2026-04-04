"""
map-images.py — One-time script to map Excel images to character names.

Reads the hidden 'รูป의 사본' sheet from gvg-nyanneko.xlsx, cross-references
image anchor positions with cell character names, then copies renamed images
to public/images/characters/{slug}.webp.

Usage:
  python3 scripts/map-images.py [--xlsx PATH] [--out DIR] [--dry-run]

Defaults:
  --xlsx  gvg-nyanneko.xlsx  (project root)
  --out   public/images/characters
"""

import argparse
import json
import os
import re
import shutil
import zipfile
from pathlib import Path
from xml.etree import ElementTree as ET

# ---------------------------------------------------------------------------
# Thai name → English slug mapping (covers all known characters in the sheet)
# ---------------------------------------------------------------------------
THAI_TO_SLUG: dict[str, str] = {
    "ไพร์": "fai",
    "ทากะ": "taka",
    "เฮฟเว่นเนีย": "heavenia",
    "จิน": "jin",
    "ไคล์": "kyle",
    "เซอิน": "sein",
    "เฟิงเยี่ยน": "fengyian",
    "เรย์": "ray",
    "บรันซ์ & บรันเซล": "bnb",
    "บรันซ์": "bnb",
    "บาลิสต้า": "ballista",
    "โซอี": "zoe",
    "จูล่ง": "zhao-yun",
    "คางูระ": "kagura",
    "พีดัม": "pidum",
    "สนิปเปอร์": "sniper",
    "ลีโอ": "leo",
    "ลิโป้": "lubu",
    "เอมิเลีย": "amelia",
    "จูพี้": "juppie",
    "โฮกิ้น": "hokin",
    "ไรอัน": "ryan",
    "ไป๋หลง": "bailong",
    "เสี่ยว": "xiao",
    "พยัคฆ์เมฆา": "cloud-tiger",
    "เจน": "jane",
    "โคลท์": "colt",
    "เมย์": "may",
    "แทโอ": "teo",
    "แบล็คโรส": "black-rose",
    "เดลโลนส์": "dellons",
    "แคทตี้": "catty",
    "จูริ": "juri",
    "เบลลีก้า": "belleiga",
    "เอเรียล": "ariel",
    "คลีโอ": "cleo",
    "มิเลีย": "milia",
    "ลูลี่": "luly",
    "ซิลเวีย": "silvia",
    "เฟรยา": "freyja",
    "เอสปาด้า": "espada",
    "เซร่า": "sera",
    "คิริเอล": "kyrielle",
    "ยูชิน": "yushin",
    "โนโฮ": "noho",
    "ริน": "rin",
    "ปาสคาล": "pascal",
    "หลิงหลิง": "lingling",
    "ยอนฮี": "yeonhee",
    "เดซี่": "daisy",
    "ยูริ": "yuri",
    "เมลคีร์": "mercure",
    "มิโฮะ": "miho",
    "เบน": "ben",
    "ซิลเวสต้า": "silvesta",
    "เสี่ยวเฉียว": "xiaoqiao",
    "โจ๊กเกอร์": "joker",
    "วาเนสซ่า": "vanessa",
    "วาเนสซา่": "vanessa",
    "เรกินเลฟ": "reginleif",
    "เกลลิดัส": "gelidus",
    "เนีย": "nia",
    "วิคตอเรีย": "victoria",
    "เอลิเซีย": "elysia",
    "ชานชะเลอร์": "chandler",
    "อสุรา": "asura",
    "พาลานอส": "pallanus",
    "ซีค": "seek",
    "ลาเนีย": "lania",
    "ซุนหงอคง": "sun-wukong",
    "ไป๋เจียว": "baijiao",
    "กวนอู": "guanyu",
    "ธรูด": "trude",
    "คาร์ม่า": "karma",
    "ไอลีน": "eileen",
    "ราเชล": "rachel",
    "สไปค์": "spike",
    "เจฟ": "jave",
    "คริส": "kris",
    "เอซ": "ace",
    "ลูดี้": "rudy",
    "อารากอน": "aragon",
    "เฮเลเนีย": "helenia",
    "อากีลา": "aguila",
    "ลุค": "luke",
    "อีวาน": "ivan",
    "แร็ดกริด": "radgrid",
    "น๊อกซ์": "knox",
    "ลี": "lee",
    "โรซี่": "rosie",
    "เตียวเสี้ยน": "diaochan",
    "คาริน": "karin",
    "เพลตัน": "platin",
    "คารอน": "caron",
    "บิสกิต": "biscuit",
    "ลูซี่": "lucy",
    "อลิซ": "alice",
    "ยูอิ": "yui",
    "รีน่า": "reina",
    "โคลอี้": "chloe",
    "ออร์ลี่": "orly",
    "ซาร่า": "sara",
}

NS = {
    "xdr": "http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing",
    "a": "http://schemas.openxmlformats.org/drawingml/2006/main",
    "r": "http://schemas.openxmlformats.org/officeDocument/2006/relationships",
    "ss": "http://schemas.openxmlformats.org/spreadsheetml/2006/main",
}


def find_sheet_info(z: zipfile.ZipFile, sheet_name: str) -> tuple[str, str]:
    """Return (sheet_xml_path, drawing_xml_path) for the named sheet."""
    wb = ET.fromstring(z.read("xl/workbook.xml"))
    wb_rels = ET.fromstring(z.read("xl/_rels/workbook.xml.rels"))

    rid_to_target: dict[str, str] = {
        r.get("Id"): r.get("Target") for r in wb_rels
    }

    for sheet in wb.findall(".//ss:sheet", NS):
        if sheet.get("name") == sheet_name:
            rid = sheet.get("{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id")
            sheet_path = "xl/" + rid_to_target[rid]

            sheet_xml = ET.fromstring(z.read(sheet_path))
            rels_path = sheet_path.replace("worksheets/", "worksheets/_rels/") + ".rels"
            if rels_path not in z.namelist():
                raise FileNotFoundError(f"No rels for {sheet_path}")
            sheet_rels = ET.fromstring(z.read(rels_path))
            for rel in sheet_rels:
                if "drawing" in rel.get("Target", "").lower():
                    drawing_target = rel.get("Target")
                    drawing_path = "xl/" + drawing_target.replace("../", "")
                    return sheet_path, drawing_path

    raise ValueError(f"Sheet '{sheet_name}' not found or has no drawing")


def build_cell_map(z: zipfile.ZipFile, sheet_path: str) -> dict[tuple[int, int], str]:
    """Build (col-0indexed, row-0indexed) → cell-text map from a sheet."""
    sheet = ET.fromstring(z.read(sheet_path))

    # Read shared strings
    shared = []
    if "xl/sharedStrings.xml" in z.namelist():
        ss_root = ET.fromstring(z.read("xl/sharedStrings.xml"))
        for si in ss_root.findall("ss:si", NS):
            texts = [t.text or "" for t in si.findall(".//ss:t", NS)]
            shared.append("".join(texts))

    cell_map: dict[tuple[int, int], str] = {}
    for row_el in sheet.findall(".//ss:row", NS):
        r = int(row_el.get("r", 0)) - 1  # 0-indexed
        for cell_el in row_el.findall("ss:c", NS):
            ref = cell_el.get("r", "")
            col_letters = re.match(r"([A-Z]+)", ref)
            if not col_letters:
                continue
            col = 0
            for ch in col_letters.group(1):
                col = col * 26 + (ord(ch) - ord("A") + 1)
            col -= 1  # 0-indexed

            v_el = cell_el.find("ss:v", NS)
            if v_el is None or v_el.text is None:
                continue
            t = cell_el.get("t", "")
            if t == "s":
                val = shared[int(v_el.text)]
            else:
                val = v_el.text
            if val.strip():
                cell_map[(col, r)] = val.strip()

    return cell_map


def build_anchor_map(
    z: zipfile.ZipFile, drawing_path: str
) -> list[tuple[int, int, str]]:
    """Return list of (col-0idx, row-0idx, media_filename) from a drawing XML."""
    drawing = ET.fromstring(z.read(drawing_path))
    rels_path = drawing_path.replace("drawings/", "drawings/_rels/") + ".rels"
    rels = ET.fromstring(z.read(rels_path))
    rid_to_media: dict[str, str] = {}
    for rel in rels:
        target = rel.get("Target", "")
        rid_to_media[rel.get("Id")] = target.split("/")[-1]

    results: list[tuple[int, int, str]] = []
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
                results.append((col, row, media))

    return results


def main():
    parser = argparse.ArgumentParser(description="Map Excel images to character slugs")
    parser.add_argument("--xlsx", default="gvg-nyanneko.xlsx")
    parser.add_argument("--out", default="public/images/characters")
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    xlsx_path = Path(args.xlsx)
    out_dir = Path(args.out)

    if not xlsx_path.exists():
        print(f"ERROR: {xlsx_path} not found. Run from project root.")
        return

    out_dir.mkdir(parents=True, exist_ok=True)

    print(f"Reading {xlsx_path} ...")
    with zipfile.ZipFile(xlsx_path) as z:
        sheet_name = "รูป의 사본"
        sheet_path, drawing_path = find_sheet_info(z, sheet_name)
        print(f"  Sheet: {sheet_path}")
        print(f"  Drawing: {drawing_path}")

        cell_map = build_cell_map(z, sheet_path)
        anchors = build_anchor_map(z, drawing_path)

        # The gallery sheet has names in col B (index 1), col H (7), col N (13), col T (19)
        # Images are anchored at col-1 = left of name col, row matching name row
        # But the drawing uses col offsets 1,2,3,4 (0-idx) and row offsets for each character
        # Strategy: for each image anchor at (col, row), look up name at that (col, row)
        # with some nearby searching

        mapping: list[dict] = []
        unmatched: list[tuple] = []

        all_media = {name.split("/")[-1] for name in z.namelist() if "/media/" in name}

        for col, row, media in anchors:
            # Search the cell near the anchor for a Thai name
            name = None
            for dc, dr in [(0, 0), (1, 0), (0, 1), (0, -1), (-1, 0), (1, 1), (2, 0)]:
                candidate = cell_map.get((col + dc, row + dr))
                if candidate and candidate in THAI_TO_SLUG:
                    name = candidate
                    break

            slug = THAI_TO_SLUG.get(name) if name else None

            if slug and media in all_media:
                mapping.append({"slug": slug, "media": media, "col": col, "row": row, "name_th": name})
            else:
                unmatched.append((col, row, media, name))

        print(f"\nMatched: {len(mapping)}, Unmatched: {len(unmatched)}")

        # Extract and copy matched images
        copied = 0
        for m in mapping:
            src_media = f"xl/media/{m['media']}"
            ext = Path(m["media"]).suffix or ".png"
            dest = out_dir / f"{m['slug']}{ext}"

            if args.dry_run:
                print(f"  [DRY] {m['media']} ({m['col']},{m['row']}) → {dest.name}  [{m['name_th']}]")
            else:
                img_data = z.read(src_media)
                dest.write_bytes(img_data)
                print(f"  Wrote {dest.name}  [{m['name_th']}]")
                copied += 1

        if not args.dry_run:
            print(f"\nCopied {copied} images to {out_dir}/")

        if unmatched:
            print(f"\nUnmatched anchors (need manual check):")
            for col, row, media, name in unmatched[:20]:
                print(f"  col={col} row={row} media={media} name={name!r}")

        # Write JSON mapping for reference
        mapping_out = {"image_map": {m["slug"]: f"/images/characters/{m['slug']}.png" for m in mapping}}
        out_json = Path("scripts/image-map.json")
        if not args.dry_run:
            out_json.write_text(json.dumps(mapping_out, ensure_ascii=False, indent=2))
            print(f"\nWrote {out_json}")


if __name__ == "__main__":
    main()
