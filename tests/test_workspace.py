"""The Workspace: the templates run on the default molecules, input files are read in every format, and only a
paired page may run a script. Run with `pixi run test`."""

from __future__ import annotations

from pathlib import Path

from fastapi.testclient import TestClient

from catalyzer import runner
from catalyzer.serve import create_app

TEMPLATES = Path(runner.__file__).with_name("templates")
MOLECULES = (TEMPLATES / "molecules.smi").read_text(encoding="utf-8")


def test_calculator_on_the_default_molecules():
    r = runner.run_script((TEMPLATES / "calculator.py").read_text(encoding="utf-8"), {"molecules.smi": MOLECULES})
    assert r.status == "done", (r.problems, r.output)
    kinds = [x["kind"] for x in r.results]
    assert {"table", "scatter", "svg"} <= set(kinds)
    assert r.results[0]["value"] == "8"
    table = next(x for x in r.results if x["kind"] == "table")
    aspirin = next(row for row in table["rows"] if row[0] == "aspirin")
    assert aspirin[1] == "C9H8O4" and aspirin[2] == "180.2"


def test_similarity_template():
    r = runner.run_script((TEMPLATES / "similarity.py").read_text(encoding="utf-8"), {"molecules.smi": MOLECULES})
    assert r.status == "done", (r.problems, r.output)
    nearest = {row[0]: row[1] for row in r.results[2]["rows"]}
    assert nearest["aspirin"] in {"ibuprofen", "paracetamol"}


def test_molecules_from_every_kind_of_file():
    code = (
        "import render as r\nfrom data import molecules\n\n"
        "def run():\n    return [r.text(', '.join(n for n, _ in molecules()))]\n"
    )
    sdf = (
        "ethanol\n  RDKit\n\n  3  2  0  0  0  0  0  0  0  0999 V2000\n"
        + "".join(f"    0.0000    0.0000    0.0000 {e}   0  0  0  0  0  0  0  0  0  0  0  0\n" for e in ("C", "C", "O"))
        + "  1  2  1  0\n  2  3  1  0\nM  END\n$$$$\n"
    )
    inputs = {
        "a.smi": "CCO ethanol\n# a comment\nnot_smiles broken\nc1ccccc1\n",
        "b.csv": "id,SMILES\nwater,O\n,CC\n",
        "c.sdf": sdf,
    }
    r = runner.run_script(code, inputs)
    assert r.status == "done", (r.problems, r.output)
    assert r.results[0]["body"][0] == "ethanol, a 4, water, b 2, ethanol"
    assert "not a valid SMILES" in r.output


def test_inputs_must_be_plain_data_files():
    for bad in ("../x.smi", ".hidden.smi", "x.py", "sub/x.csv"):
        assert runner.run_script("def run():\n    return []\n", {bad: "C"}).status == "rejected", bad


def test_a_broken_script_reports_its_error():
    r = runner.run_script("def run():\n    raise RuntimeError('oops')\n")
    assert r.status == "error" and "oops" in r.problems[0]
    assert runner.run_script("def run(:\n").status == "rejected"


def test_only_a_paired_page_runs_scripts():
    client = TestClient(create_app(code="s3cret"))
    body = {"code": "def run():\n    return []\n"}
    assert client.post("/api/script", json=body).status_code == 403
    assert client.post("/api/script", json=body, headers={"x-catalyzer-pairing": "wrong"}).status_code == 403
    ok = client.post("/api/script", json=body, headers={"x-catalyzer-pairing": "s3cret"})
    assert ok.status_code == 200 and ok.json()["status"] == "done"
    assert client.get("/api/health", headers={"x-catalyzer-pairing": "s3cret"}).json()["paired"] is True
    assert client.get("/api/health").json()["paired"] is False
    # the pairing header is allowed through CORS for the site, so the browser may send it
    pre = client.options(
        "/api/script",
        headers={
            "Origin": "https://jackyko1991.github.io",
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "content-type,x-catalyzer-pairing",
        },
    )
    assert pre.status_code == 200
