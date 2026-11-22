"""The problem library: problems/<category>/<name>/ holds

- meta.yaml: title, summary, level, the allowed imports and forbidden names (the lock), the natural-language ↔ code
  mirror, and the open libraries it uses;
- stub.py: the functions to write, signatures fixed (what the reader starts from);
- solution.py: a reference answer (tests/test_problems.py checks it passes);
- test.py: the contract, read-only; it imports the answer as `answer`;
- diagram.svg: the problem's picture; data/: fixture files the tests read (licences in data/SOURCE.md);
- i18n/zh-Hant.yaml: the Traditional Chinese text.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parent.parent / "problems"
CATEGORIES = ("molecules", "biomolecules", "pro")


@dataclass
class Problem:
    id: str  # "<category>/<name>"
    path: Path
    meta: dict
    i18n: dict[str, dict] = field(default_factory=dict)

    @property
    def stub(self) -> str:
        return (self.path / "stub.py").read_text(encoding="utf-8")

    @property
    def solution(self) -> str:
        return (self.path / "solution.py").read_text(encoding="utf-8")

    @property
    def test(self) -> str:
        return (self.path / "test.py").read_text(encoding="utf-8")

    @property
    def allowed_imports(self) -> list[str]:
        return list(self.meta.get("imports") or [])

    @property
    def forbidden_names(self) -> list[str]:
        return list(self.meta.get("forbidden") or [])


def load(problem_id: str) -> Problem:
    path = (ROOT / problem_id).resolve()
    if ROOT not in path.parents or not (path / "meta.yaml").is_file():
        raise KeyError(problem_id)
    meta = yaml.safe_load((path / "meta.yaml").read_text(encoding="utf-8"))
    i18n = {f.stem: yaml.safe_load(f.read_text(encoding="utf-8")) for f in sorted((path / "i18n").glob("*.yaml"))}
    return Problem(problem_id, path, meta, i18n)


def all_problems() -> list[Problem]:
    found = [load(f"{p.parent.parent.name}/{p.parent.name}") for p in ROOT.glob("*/*/meta.yaml")]
    return sorted(found, key=lambda p: (CATEGORIES.index(p.meta["category"]), p.meta.get("order", 99), p.id))
