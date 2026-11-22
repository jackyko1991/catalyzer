"""The local runner: the site sends an answer, this checks it on your computer. `pixi run runner`.

It listens on 127.0.0.1 only (never the network) and accepts requests from the published site and from local
development servers. Every answer passes the lock (catalyzer.checks) before it runs, in a separate process with a
timeout (catalyzer.runner).
"""

from __future__ import annotations

import os
from typing import Literal

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from pydantic import BaseModel, Field

from . import __doc__ as about
from . import runner
from .problems import all_problems, load

PORT = int(os.environ.get("CATALYZER_PORT", 8795))
ORIGINS = ["https://jackyko1991.github.io"]
LOCAL_ORIGIN = r"http://(localhost|127\.0\.0\.1)(:\d+)?"


class RunRequest(BaseModel):
    problem: str = Field(max_length=200)
    code: str = Field(max_length=200_000)
    # run: main.py with the parameters (results to draw); test: the problem's tests
    mode: Literal["run", "test"] = "test"
    params: dict[str, str | int | float] = Field(default_factory=dict, max_length=20)


def create_app() -> FastAPI:
    app = FastAPI(title="Catalyzer runner", description=about)
    # only requests addressed to this computer by name (stops DNS-rebinding pages from reaching the runner)
    app.add_middleware(TrustedHostMiddleware, allowed_hosts=["127.0.0.1", "localhost", "testserver"])
    app.add_middleware(
        CORSMiddleware,
        allow_origins=ORIGINS,
        allow_origin_regex=LOCAL_ORIGIN,
        allow_methods=["GET", "POST"],
        allow_headers=["content-type"],
        # answer Chrome's Private Network Access preflight: the published https site asking for 127.0.0.1
        allow_private_network=True,
    )

    @app.get("/api/health")
    def health() -> dict:
        return {"ok": True, "problems": len(all_problems())}

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

    return app


app = create_app()

if __name__ == "__main__":
    import uvicorn

    print(f"Catalyzer runner on http://127.0.0.1:{PORT} (Ctrl+C to stop)")
    uvicorn.run(app, host="127.0.0.1", port=PORT)
