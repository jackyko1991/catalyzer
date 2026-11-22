"""The Coding Skills page shows real code and its real output: each frontend/src/skills/<name>.py runs, and what it
prints must equal <name>.out (the page shows both). Run with `pixi run test`; after changing a snippet, record its
output with `pixi run python tests/test_skills.py`.
"""

from __future__ import annotations

import subprocess
import sys
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parent.parent
SKILLS = ROOT / "frontend" / "src" / "skills"
STRUCTURES = ROOT / "frontend" / "public" / "structures"  # the structure snippets read the viewer's files
SNIPPETS = sorted(SKILLS.glob("*.py"))


def run(snippet: Path) -> str:
    proc = subprocess.run(
        [sys.executable, str(snippet)],
        cwd=STRUCTURES,
        capture_output=True,
        text=True,
        encoding="utf-8",
        timeout=120,
        env={"PYTHONIOENCODING": "utf-8", **{k: v for k, v in __import__("os").environ.items()}},
    )
    assert proc.returncode == 0, proc.stderr
    return proc.stdout


@pytest.mark.parametrize("snippet", SNIPPETS, ids=[s.stem for s in SNIPPETS])
def test_snippet_output_is_recorded(snippet):
    out = snippet.with_suffix(".out")
    assert out.is_file(), f"record it: pixi run python tests/test_skills.py ({out.name} missing)"
    assert run(snippet) == out.read_text(encoding="utf-8")


if __name__ == "__main__":
    for s in SNIPPETS:
        s.with_suffix(".out").write_text(run(s), encoding="utf-8", newline="\n")
        print("recorded", s.with_suffix(".out").name)
