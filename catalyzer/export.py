"""Write the problem library as data for the static site: frontend/src/generated/problems.json, and each problem's
picture as frontend/public/problems/<category>/<name>.svg. `pixi run export` (run it after changing a problem;
tests/test_export.py fails while the JSON is out of date).
"""

from __future__ import annotations

import json
import shutil
from pathlib import Path

from . import structures
from .problems import all_problems

FRONTEND = Path(__file__).resolve().parent.parent / "frontend"
OUT = FRONTEND / "src" / "generated" / "problems.json"
PICTURES = FRONTEND / "public" / "problems"


def problems_data() -> list[dict]:
    data = []
    for p in all_problems():
        m, zh = p.meta, p.i18n.get("zh-Hant", {})
        data.append(
            {
                "id": p.id,
                "category": m["category"],
                "level": m["level"],
                "title": [m["title"], zh.get("title", m["title"])],
                "summary": [m["summary"].strip(), zh.get("summary", m["summary"]).strip()],
                "notes": [m["notes"].strip(), zh["notes"].strip()] if "notes" in m else None,
                "mirror": [
                    {"text": [s["text"], zt], "code": s["code"]}
                    for s, zt in zip(m["mirror"], zh.get("mirror", [s["text"] for s in m["mirror"]]), strict=True)
                ],
                "uses": m["uses"],
                "imports": p.allowed_imports,
                "forbidden": p.forbidden_names,
                "stub": p.stub,
                "test": p.test,
                "picture": f"problems/{p.id}.svg",
            }
        )
    return data


def render() -> str:
    return json.dumps(problems_data(), ensure_ascii=False, indent=1) + "\n"


def main() -> None:
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(render(), encoding="utf-8", newline="\n")
    for p in all_problems():
        target = PICTURES / f"{p.id}.svg"
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy(p.path / "diagram.svg", target)
    print(f"wrote {OUT.relative_to(FRONTEND.parent)} and {len(all_problems())} pictures")
    rmsd = structures.main()
    print(f"wrote frontend/public/structures (crambin model on crystal: CA RMSD {rmsd:.3f} Å)")


if __name__ == "__main__":
    main()
