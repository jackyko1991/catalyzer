"""The local runner: the site sends code, this runs it on your computer. `pixi run runner`.

It listens on 127.0.0.1 only (never the network) and accepts requests from the published site and from local
development servers (CORS, trusted host names). Two kinds of run:

- a problem (/api/run): the answer passes the lock (catalyzer.checks) first, then the problem's main.py or tests
  run in a separate process with a timeout (catalyzer.runner);
- a workspace script (/api/script): the reader's own code, unrestricted, so it also needs the **pairing code**.
  The runner keeps one in the cache folder (CATALYZER_CACHE, default ~/.cache/catalyzer/pairing) and prints it at
  start; the reader pastes it into the Workspace page once. A page that has not been paired (another website, a
  stray local page) cannot run code here. `pixi run runner --new-pairing` makes a new code (unpairs every browser).
"""

from __future__ import annotations

import hmac
import os
import secrets
import sys
from typing import Literal

from fastapi import FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from pydantic import BaseModel, Field

from . import __doc__ as about
from . import runner
from .problems import all_problems, load

PORT = int(os.environ.get("CATALYZER_PORT", 8795))
ORIGINS = ["https://jackyko1991.github.io"]
LOCAL_ORIGIN = r"http://(localhost|127\.0\.0\.1)(:\d+)?"
PAIRING_FILE = runner.CACHE / "pairing"


class RunRequest(BaseModel):
    problem: str = Field(max_length=200)
    code: str = Field(max_length=200_000)
    # run: main.py with the parameters (results to draw); test: the problem's tests
    mode: Literal["run", "test"] = "test"
    params: dict[str, str | int | float] = Field(default_factory=dict, max_length=20)


class ScriptRequest(BaseModel):
    code: str = Field(max_length=200_000)
    # the reader's input files: name -> text (molecules.smi, a .csv, an .sdf, a .pdb…)
    inputs: dict[str, str] = Field(default_factory=dict, max_length=10)


def pairing_code(new: bool = False) -> str:
    """The code a page must present to run workspace scripts; made once and kept in the cache folder."""
    if new or not PAIRING_FILE.is_file():
        PAIRING_FILE.parent.mkdir(parents=True, exist_ok=True)
        PAIRING_FILE.write_text(secrets.token_hex(4), encoding="utf-8")
        try:
            os.chmod(PAIRING_FILE, 0o600)
        except OSError:
            pass
    return PAIRING_FILE.read_text(encoding="utf-8").strip()


def create_app(code: str | None = None) -> FastAPI:
    expected = code or pairing_code()
    paired = lambda given: bool(given) and hmac.compare_digest(given, expected)  # noqa: E731

    app = FastAPI(title="Catalyzer runner", description=about)
    # only requests addressed to this computer by name (stops DNS-rebinding pages from reaching the runner)
    app.add_middleware(TrustedHostMiddleware, allowed_hosts=["127.0.0.1", "localhost", "testserver"])
    app.add_middleware(
        CORSMiddleware,
        allow_origins=ORIGINS,
        allow_origin_regex=LOCAL_ORIGIN,
        allow_methods=["GET", "POST"],
        allow_headers=["content-type", "x-catalyzer-pairing"],
        # answer Chrome's Private Network Access preflight: the published https site asking for 127.0.0.1
        allow_private_network=True,
    )

    @app.get("/api/health")
    def health(x_catalyzer_pairing: str | None = Header(default=None)) -> dict:
        return {"ok": True, "problems": len(all_problems()), "paired": paired(x_catalyzer_pairing)}

    @app.get("/api/problems")
    def problems() -> list[dict]:
        return [{"id": p.id, "title": p.meta["title"], "level": p.meta["level"]} for p in all_problems()]

    @app.post("/api/run")
    def run(req: RunRequest) -> dict:
        try:
            problem = load(req.problem)
        except KeyError:
            raise HTTPException(404, f"no problem {req.problem!r}") from None
        if req.mode == "run":
            return runner.run_main(problem, req.code, req.params).to_json()
        return runner.run(problem, req.code).to_json()

    @app.post("/api/script")
    def script(req: ScriptRequest, x_catalyzer_pairing: str | None = Header(default=None)) -> dict:
        """a workspace script: the reader's own code, run on this computer, for a paired page only"""
        if not paired(x_catalyzer_pairing):
            raise HTTPException(403, "this page is not paired with the runner: enter the pairing code it printed")
        return runner.run_script(req.code, req.inputs).to_json()

    return app


app = create_app()

if __name__ == "__main__":
    import uvicorn

    code = pairing_code(new="--new-pairing" in sys.argv)
    print(f"Catalyzer runner on http://127.0.0.1:{PORT} (Ctrl+C to stop)")
    print(f"Workspace pairing code: {code}  (enter it once on the Workspace page; it stays the same next time)")
    uvicorn.run(create_app(code), host="127.0.0.1", port=PORT)
