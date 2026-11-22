"""The site's copy of the problem library is up to date, and the local runner answers. Run with `pixi run test`."""

from __future__ import annotations

from fastapi.testclient import TestClient

from catalyzer import export
from catalyzer.problems import load
from catalyzer.serve import app


def test_exported_json_is_current():
    assert export.OUT.is_file(), "run: pixi run export"
    assert export.OUT.read_text(encoding="utf-8") == export.render(), "problems changed; run: pixi run export"
    for p in export.problems_data():
        assert (export.FRONTEND / "public" / p["picture"]).is_file(), p["picture"]


def test_viewer_structures():
    import json

    from catalyzer import structures

    mols = json.loads((structures.OUT / "molecules.json").read_text(encoding="utf-8"))
    assert {m["id"] for m in mols} == set(structures.MOLECULES)
    for m in mols:
        assert "V2000" in m["molblock"] and len(m["name"]) == 2
    aligned, rmsd = structures.aligned_model(
        (structures.DATA / "AF-P01542-F1-model_v6.pdb").read_text(), (structures.DATA / "1crn.pdb").read_text()
    )
    assert 0.3 < rmsd < 0.6  # the rmsd problem's answer for crambin: 0.43 Å
    assert (structures.OUT / "AF-P01542-F1-model_v6.aligned.pdb").read_text() == aligned
    # after the fit the matching alpha carbons sit close together
    ca_model, ca_crystal = (
        structures._ca(aligned.splitlines()),
        structures._ca((structures.OUT / "1crn.pdb").read_text().splitlines()),
    )
    assert max(float(((ca_model[i] - ca_crystal[i]) ** 2).sum() ** 0.5) for i in ca_crystal) < 2.0


def test_runner_api():
    client = TestClient(app)
    assert client.get("/api/health").json()["ok"]
    problem = load("molecules/formal_charge")
    good = client.post("/api/run", json={"problem": problem.id, "code": problem.solution}).json()
    assert good["status"] == "passed" and good["tests"]
    bad = client.post("/api/run", json={"problem": problem.id, "code": "import os\n" + problem.solution}).json()
    assert bad["status"] == "rejected"
    assert client.post("/api/run", json={"problem": "../../etc", "code": ""}).status_code == 404


def test_runner_refuses_other_websites():
    client = TestClient(app)
    r = client.options(
        "/api/run",
        headers={"Origin": "https://evil.example", "Access-Control-Request-Method": "POST"},
    )
    assert r.headers.get("access-control-allow-origin") is None
    r = client.options(
        "/api/run",
        headers={"Origin": "http://localhost:5190", "Access-Control-Request-Method": "POST"},
    )
    assert r.headers.get("access-control-allow-origin") == "http://localhost:5190"
    # the published site (https) asking for the runner on this computer: Chrome's Private Network Access preflight
    r = client.options(
        "/api/run",
        headers={
            "Origin": "https://jackyko1991.github.io",
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "content-type",
            "Access-Control-Request-Private-Network": "true",
        },
    )
    assert r.status_code == 200
    assert r.headers.get("access-control-allow-origin") == "https://jackyko1991.github.io"
    assert r.headers.get("access-control-allow-private-network") == "true"
    # a form post (no CORS preflight) is not read as JSON, so it can't run code
    form = client.post(
        "/api/run", content='{"problem":"molecules/formal_charge","code":"x"}', headers={"content-type": "text/plain"}
    )
    assert form.status_code == 422
    # a page that rebinds its own domain name to 127.0.0.1 is refused by name
    assert client.get("/api/health", headers={"host": "evil.example"}).status_code == 400
