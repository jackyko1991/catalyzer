"""The problem library keeps its promises: run with `pixi run test`.

- every reference solution passes its own test.py, and every stub fails every test;
- the lock (catalyzer.checks) accepts the stub and the solution, and rejects an edited signature, an import outside
  the allowed list, each forbidden name, and Python's back doors;
- every problem is complete in English and Traditional Chinese, and its natural-language ↔ code mirror quotes the
  reference solution exactly.
"""

from __future__ import annotations

import re

import pytest

from catalyzer import runner
from catalyzer.checks import check_answer, stub_signatures
from catalyzer.problems import CATEGORIES, all_problems

PROBLEMS = all_problems()
IDS = [p.id for p in PROBLEMS]


def test_library_size():
    assert len(PROBLEMS) >= 12
    assert {p.meta["category"] for p in PROBLEMS} == set(CATEGORIES)


@pytest.mark.parametrize("problem", PROBLEMS, ids=IDS)
def test_reference_solution_passes(problem):
    result = runner.run(problem, problem.solution)
    assert result.status == "passed", (result.problems, [t for t in result.tests if not t.passed], result.output)


@pytest.mark.parametrize("problem", PROBLEMS, ids=IDS)
def test_stub_fails_every_test(problem):
    result = runner.run(problem, problem.stub)
    assert result.status == "failed", (result.status, result.problems, result.output)
    assert not [t.name for t in result.tests if t.passed]


@pytest.mark.parametrize("problem", PROBLEMS, ids=IDS)
def test_lock_accepts_stub_and_solution(problem):
    for source in (problem.stub, problem.solution):
        check = check_answer(source, problem.stub, problem.allowed_imports, problem.forbidden_names)
        assert check.ok, check.problems


@pytest.mark.parametrize("problem", PROBLEMS, ids=IDS)
def test_lock_rejects_an_edited_signature(problem):
    name = next(iter(stub_signatures(problem.stub)))
    edited = re.sub(rf"def {name}\(", f"def {name}(extra, ", problem.solution, count=1)
    check = check_answer(edited, problem.stub, problem.allowed_imports, problem.forbidden_names)
    assert not check.ok and "signature" in check.problems[0]
    renamed = re.sub(rf"def {name}\(", f"def {name}_renamed(", problem.solution, count=1)
    assert not check_answer(renamed, problem.stub, problem.allowed_imports, problem.forbidden_names).ok


@pytest.mark.parametrize("problem", PROBLEMS, ids=IDS)
def test_lock_rejects_imports_and_back_doors(problem):
    def rejected(extra: str) -> bool:
        source = extra + "\n" + problem.solution
        return not check_answer(source, problem.stub, problem.allowed_imports, problem.forbidden_names).ok

    for bad in ["import os", "import subprocess", "import socket", "from urllib import request", "import requests"]:
        assert rejected(bad), bad
    for door in [
        "_x = eval('1')",
        "_x = open('f')",
        "_x = __import__('os')",
        "_x = getattr(int, 'real')",
        "_x = ().__class__",
    ]:
        assert rejected(door), door


@pytest.mark.parametrize("problem", PROBLEMS, ids=IDS)
def test_text_is_complete_in_both_languages(problem):
    meta, zh = problem.meta, problem.i18n.get("zh-Hant")
    for key in ("title", "category", "level", "order", "summary", "mirror", "uses"):
        assert key in meta, key
    assert meta["level"] in ("beginner", "intermediate", "pro")
    assert zh and zh["title"].strip() and zh["summary"].strip()
    assert len(zh["mirror"]) == len(meta["mirror"])
    assert ("notes" in meta) == ("notes" in zh)
    for u in meta["uses"]:
        assert u["url"].startswith("https://"), u


def _lines(text: str) -> list[str]:
    return [line.strip() for line in text.splitlines() if line.strip()]


@pytest.mark.parametrize("problem", PROBLEMS, ids=IDS)
def test_mirror_quotes_the_solution(problem):
    solution = _lines(problem.solution)
    for step in problem.meta["mirror"]:
        assert step["text"].strip()
        code = _lines(step["code"])
        starts = [i for i in range(len(solution)) if solution[i : i + len(code)] == code]
        assert starts, f"mirror code not found in solution.py:\n{step['code']}"


@pytest.mark.parametrize("problem", PROBLEMS, ids=IDS)
def test_has_a_picture(problem):
    svg = problem.path / "diagram.svg"
    assert svg.is_file(), f"{problem.id}: no diagram.svg"
    assert "<title>" in svg.read_text(encoding="utf-8")


def test_runner_reports_a_timeout():
    problem = next(p for p in PROBLEMS if p.id == "biomolecules/translate")
    slow = problem.solution.replace(
        '    if set(dna) - set("ACGT"):', '    while True:\n        pass\n    if set(dna) - set("ACGT"):'
    )
    result = runner.run(problem, slow, timeout=5)
    assert result.status == "error" and "longer than" in result.problems[0]


RENDER_KINDS = {"svg", "mol3d", "pdb3d", "table", "bars", "scatter", "metric", "text", "link"}


@pytest.mark.parametrize("problem", PROBLEMS, ids=IDS)
def test_main_runs_and_draws(problem):
    """Run with the defaults gives results the site can draw; every parameter has a label and a default."""
    for q in problem.meta["params"]:
        assert q["type"] in ("smiles", "text", "select", "int", "float") and len(q["label"]) == 2 and "default" in q, q
    result = runner.run_main(problem, problem.solution)
    assert result.status == "done", (result.problems, result.output)
    assert result.results and {r["kind"] for r in result.results} <= RENDER_KINDS
    for r in result.results:
        if r.get("title"):
            assert len(r["title"]) == 2 and all(r["title"]), r["title"]
    # every problem draws its molecule: a 2D structure or a 3D view
    assert {r["kind"] for r in result.results} & {"svg", "mol3d", "pdb3d"}


@pytest.mark.parametrize("problem", PROBLEMS, ids=IDS)
def test_main_on_the_stub_reports_an_error(problem):
    result = runner.run_main(problem, problem.stub)
    assert result.status == "error" and "NotImplementedError" in result.output
