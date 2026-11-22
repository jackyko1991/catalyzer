"""Write the problem library as data for the static site: frontend/src/generated/problems.json, and each problem's
picture as frontend/public/problems/<category>/<name>.svg. `pixi run export` (run it after changing a problem;
tests/test_export.py fails while the JSON is out of date).
"""

from __future__ import annotations

import json
import shutil
from pathlib import Path

from . import library, runner, structures
from .problems import all_problems

FRONTEND = Path(__file__).resolve().parent.parent / "frontend"
OUT = FRONTEND / "src" / "generated" / "problems.json"
PICTURES = FRONTEND / "public" / "problems"
RESULTS = FRONTEND / "public" / "results"
LIBRARY = FRONTEND / "src" / "generated" / "library.json"
WORKSPACE = FRONTEND / "src" / "generated" / "workspace.json"


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
                "solution": p.solution,
                "main": (p.path / "main.py").read_text(encoding="utf-8"),
                "params": [
                    {
                        **q,
                        "label": list(q["label"]),
                        **({"presets": [list(x) for x in q["presets"]]} if "presets" in q else {}),
                        **({"options": [list(x) for x in q["options"]]} if "options" in q else {}),
                    }
                    for q in p.meta.get("params") or []
                ],
                "results": f"results/{p.id.split('/')[1]}.json",
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
    RESULTS.mkdir(parents=True, exist_ok=True)
    for p in all_problems():  # what the live site shows before anyone runs anything: the defaults, run once
        r = runner.run_main(p, p.solution)
        assert r.status == "done", (p.id, r.problems, r.output)
        text = json.dumps(r.results, ensure_ascii=False) + "\n"
        (RESULTS / f"{p.id.split('/')[1]}.json").write_text(text, encoding="utf-8", newline="\n")
    print(f"wrote {len(all_problems())} default results to frontend/public/results")
    templates = Path(__file__).with_name("templates")
    workspace = {
        "templates": [
            {
                "id": "calculator",
                "title": ["Molecule calculator", "分子計算機"],
                "code": (templates / "calculator.py").read_text(encoding="utf-8"),
            },
            {
                "id": "similarity",
                "title": ["Similarity matrix", "相似度矩陣"],
                "code": (templates / "similarity.py").read_text(encoding="utf-8"),
            },
        ],
        "molecules": (templates / "molecules.smi").read_text(encoding="utf-8"),
        # the Library's code for any PDB entry or AlphaFold model found by live search: @ID@, @EN@, @ZH@ filled in
        "structure": library._structure_code({"id": "@ID@", "name": ["@EN@", "@ZH@"]}),
        "prediction": library._prediction_code({"uniprot": "@ID@", "name": ["@EN@", "@ZH@"]}),
    }
    WORKSPACE.write_text(json.dumps(workspace, ensure_ascii=False, indent=1) + "\n", encoding="utf-8", newline="\n")
    lib = library.entries()
    LIBRARY.write_text(json.dumps(lib, ensure_ascii=False, indent=1) + "\n", encoding="utf-8", newline="\n")
    print(f"wrote {LIBRARY.relative_to(FRONTEND.parent)} ({len(lib)} entries)")
    rmsd = structures.main()
    print(f"wrote frontend/public/structures (crambin model on crystal: CA RMSD {rmsd:.3f} Å)")


if __name__ == "__main__":
    main()
