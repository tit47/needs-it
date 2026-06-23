import json
from pathlib import Path
import pyxlsb.biff12 as biff12
from pyxlsb import open_workbook

root = Path(__file__).resolve().parents[1]
xlsb_candidates = [
    root / "data" / "seo-metiers.xlsb",
    root.parent / "Documents" / "seo-metiers.xlsb",
]
out_file = root / "data" / "seo-metiers.json"

def cell_value(v):
    if v is None:
        return None
    if isinstance(v, float) and v == int(v):
        return int(v)
    return v

def parse_sheet(sheet, stringtable):
    sheet._reader.seek(sheet._data_offset, 0)
    row_num = -1
    cells = {}
    for item in sheet._reader:
        if item[0] == biff12.ROW:
            row_num = item[1].r
            cells.setdefault(row_num, {})
        elif biff12.BLANK <= item[0] <= biff12.FORMULA_BOOLERR:
            v = item[1].v
            if item[0] == biff12.STRING and stringtable is not None:
                v = stringtable[v]
            cells[row_num][item[1].c] = cell_value(v)
        elif item[0] == biff12.SHEETDATA_END:
            break
    if not cells:
        return [], []
    max_col = max(max(r.keys()) for r in cells.values())
    ordered_rows = []
    for r in sorted(cells):
        ordered_rows.append([cells[r].get(c) for c in range(max_col + 1)])
    headers = [str(h) if h is not None else f"col_{i}" for i, h in enumerate(ordered_rows[0])]
    records = []
    for row in ordered_rows[1:]:
        if not any(v is not None and v != "" for v in row):
            continue
        records.append({headers[i]: row[i] if i < len(row) else None for i in range(len(headers))})
    return headers, records

xlsb = next((path for path in xlsb_candidates if path.exists()), None)
if xlsb is None:
    raise FileNotFoundError(
        "seo-metiers.xlsb introuvable. Placez-le dans data/ ou Documents/."
    )

out_file.parent.mkdir(parents=True, exist_ok=True)
with open_workbook(xlsb) as wb:
    with wb.get_sheet(1) as sheet:
        headers, records = parse_sheet(sheet, wb.stringtable)

payload = {"headers": headers, "row_count": len(records), "records": records}
out_file.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
print(f"Generated {len(records)} records -> {out_file}")
