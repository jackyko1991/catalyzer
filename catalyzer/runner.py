"""Run a problem's tests against an answer, on the reader's own computer.

The answer is checked first (catalyzer.checks: signatures, imports, forbidden names); only then is it copied with
test.py and the problem's data/ into a fresh temporary folder and pytest runs there in a separate process, with a
wall-clock timeout and, on Linux and macOS, CPU-time, memory and file-size limits. Each test comes back as a chip:
its name, passed or failed, and the first lines of the failure.
"""

from __future__ import annotations

import json
import os
import shutil
import subprocess
import sys
import tempfile
import xml.etree.ElementTree as ET
from dataclasses import asdict, dataclass, field
from pathlib import Path

from .checks import check_answer
from .problems import Problem

TIMEOUT_S = float(os.environ.get("CATALYZER_TIMEOUT", 60))
CPU_S = int(os.environ.get("CATALYZER_CPU_S", 60))
MEMORY_MB = int(os.environ.get("CATALYZER_MEMORY_MB", 2048))
MAX_MESSAGE = 1200


@dataclass
class TestResult:
    name: str
    passed: bool
    message: str = ""


@dataclass
class RunResult:
    """status: passed (every test), failed (some test), done (a run of main.py, with results), rejected (the static
    check), error (timeout, crash)"""

    status: str
    tests: list[TestResult] = field(default_factory=list)
    problems: list[str] = field(default_factory=list)
    output: str = ""
    results: list[dict] = field(default_factory=list)

    def to_json(self) -> dict:
        return asdict(self)


def _limits() -> None:  # pragma: no cover - runs in the child process
    import resource

    resource.setrlimit(resource.RLIMIT_CPU, (CPU_S, CPU_S))
    resource.setrlimit(resource.RLIMIT_FSIZE, (50_000_000, 50_000_000))
    resource.setrlimit(resource.RLIMIT_CORE, (0, 0))
    if sys.platform.startswith("linux"):
        mem = MEMORY_MB * 1024 * 1024
        resource.setrlimit(resource.RLIMIT_AS, (mem, mem))


def _parse_junit(path: Path) -> list[TestResult]:
    results = []
    for case in ET.parse(path).getroot().iter("testcase"):
        bad = case.find("failure")
        if bad is None:
            bad = case.find("error")
        skipped = case.find("skipped") is not None
        msg = "" if bad is None else (bad.get("message") or "") + "\n" + (bad.text or "")
        results.append(TestResult(case.get("name", "?"), bad is None and not skipped, msg.strip()[:MAX_MESSAGE]))
    return results


def _env() -> dict[str, str]:
    return {k: v for k, v in os.environ.items() if k in ("PATH", "SYSTEMROOT", "TEMP", "TMP", "HOME", "LANG")}


def _exec(cmd: list[str], work: Path, timeout: float) -> subprocess.CompletedProcess:
    return subprocess.run(
        cmd,
        cwd=work,
        env=_env(),
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
        timeout=timeout,
        preexec_fn=_limits if os.name == "posix" else None,
    )


def _prepare(work: Path, problem: Problem, source: str) -> None:
    (work / "answer.py").write_text(source, encoding="utf-8")
    shutil.copy(problem.path / "test.py", work / "test.py")
    if (problem.path / "main.py").is_file():
        shutil.copy(problem.path / "main.py", work / "main.py")
        shutil.copy(Path(__file__).parent / "render.py", work / "render.py")
    if (problem.path / "data").is_dir():
        shutil.copytree(problem.path / "data", work / "data")


def _lock(problem: Problem, source: str):
    """the answer keeps the stub's functions, imports only what the problem allows, and uses no back doors"""
    return check_answer(source, problem.stub, problem.allowed_imports)


def run(problem: Problem, source: str, timeout: float = TIMEOUT_S) -> RunResult:
    """the problem's tests against the answer"""
    check = _lock(problem, source)
    if not check.ok:
        return RunResult("rejected", problems=check.problems)

    with tempfile.TemporaryDirectory(prefix="catalyzer-") as tmp:
        work = Path(tmp)
        _prepare(work, problem, source)
        # -I (isolated) ignores PYTHON* variables and the user's site-packages, and leaves the current folder off
        # sys.path; the boot line puts the work folder (answer.py) back first.
        boot = "import sys; sys.path.insert(0, '.'); import pytest; sys.exit(pytest.main(sys.argv[1:]))"
        args = ["-q", "-p", "no:cacheprovider", "--junitxml=report.xml", "-o", "junit_family=xunit1", "test.py"]
        try:
            proc = _exec([sys.executable, "-I", "-c", boot, *args], work, timeout)
        except subprocess.TimeoutExpired:
            return RunResult("error", problems=[f"the tests took longer than {timeout:.0f} s and were stopped"])
        output = (proc.stdout + proc.stderr)[-8000:]
        report = work / "report.xml"
        if not report.exists():
            return RunResult("error", problems=["the tests could not run"], output=output)
        tests = _parse_junit(report)
        if not tests:
            return RunResult("error", problems=["no tests were collected (does answer.py import?)"], output=output)
        status = "passed" if all(t.passed for t in tests) else "failed"
        return RunResult(status, tests, output=output)


def default_params(problem: Problem) -> dict:
    return {p["id"]: p["default"] for p in problem.meta.get("params") or []}


def run_main(problem: Problem, source: str, params: dict | None = None, timeout: float = TIMEOUT_S) -> RunResult:
    """Run the problem's main.py with the answer and the parameters: status "done" with `results` (what the site
    draws: 2D and 3D structures, charts, tables), or "rejected" / "error" with the reason and the console."""
    check = _lock(problem, source)
    if not check.ok:
        return RunResult("rejected", problems=check.problems)
    values = {**default_params(problem), **(params or {})}
    with tempfile.TemporaryDirectory(prefix="catalyzer-") as tmp:
        work = Path(tmp)
        _prepare(work, problem, source)
        (work / "params.json").write_text(json.dumps(values), encoding="utf-8")
        boot = (
            "import sys, json; sys.path.insert(0, '.'); import main; "
            "out = main.run(json.load(open('params.json', encoding='utf-8'))); "
            "json.dump(out, open('results.json', 'w', encoding='utf-8'))"
        )
        try:
            proc = _exec([sys.executable, "-I", "-c", boot], work, timeout)
        except subprocess.TimeoutExpired:
            return RunResult("error", problems=[f"the run took longer than {timeout:.0f} s and was stopped"])
        output = (proc.stdout + proc.stderr)[-8000:]
        if proc.returncode != 0 or not (work / "results.json").is_file():
            last = [ln for ln in output.strip().splitlines() if ln.strip()][-1:] or ["the run failed"]
            return RunResult("error", problems=last, output=output)
        results = json.loads((work / "results.json").read_text(encoding="utf-8"))
        return RunResult("done", output=output, results=results)


CACHE = Path(os.environ.get("CATALYZER_CACHE") or Path.home() / ".cache" / "catalyzer")
INPUT_SUFFIXES = (".smi", ".txt", ".csv", ".sdf", ".pdb", ".cif", ".fasta")
MAX_INPUT_BYTES = 20_000_000


def run_script(source: str, inputs: dict[str, str] | None = None, timeout: float = TIMEOUT_S) -> RunResult:
    """Run a workspace script: the reader's own code, defining run() -> results to draw, with the reader's input
    files (molecules.smi, a .csv, an .sdf…) beside it. It runs like a problem (a fresh folder, a separate
    process, a timeout), with render.py and data.py next to it; data.py reads the input files and may download
    public structures (RCSB PDB, AlphaFold DB, PubChem) into the cache. The server only calls this for a paired
    page (serve.py)."""
    try:
        compile(source, "workspace.py", "exec")
    except SyntaxError as e:
        return RunResult("rejected", problems=[f"syntax error on line {e.lineno}: {e.msg}"])
    inputs = inputs or {}
    for name in inputs:
        if Path(name).name != name or not name.lower().endswith(INPUT_SUFFIXES) or name.startswith("."):
            return RunResult(
                "rejected", problems=[f"input file {name!r}: a plain name ending in {', '.join(INPUT_SUFFIXES)}"]
            )
    if sum(len(t) for t in inputs.values()) > MAX_INPUT_BYTES:
        return RunResult("rejected", problems=["the input files are larger than 20 MB together"])
    with tempfile.TemporaryDirectory(prefix="catalyzer-ws-") as tmp:
        work = Path(tmp)
        (work / "workspace.py").write_text(source, encoding="utf-8")
        for name, text in inputs.items():
            (work / name).write_text(text, encoding="utf-8")
        shutil.copy(Path(__file__).parent / "render.py", work / "render.py")
        shutil.copy(Path(__file__).parent / "data.py", work / "data.py")
        boot = (
            "import sys, json; sys.path.insert(0, '.'); import workspace; "
            "out = workspace.run(); "
            "json.dump(out, open('results.json', 'w', encoding='utf-8'))"
        )
        env = {**_env(), "CATALYZER_CACHE": str(CACHE)}
        for k in ("USERPROFILE", "HTTPS_PROXY", "HTTP_PROXY", "NO_PROXY", "SSL_CERT_FILE"):  # downloads need these
            if k in os.environ:
                env[k] = os.environ[k]
        try:
            proc = subprocess.run(
                [sys.executable, "-I", "-c", boot],
                cwd=work,
                env=env,
                capture_output=True,
                text=True,
                encoding="utf-8",
                errors="replace",
                timeout=timeout,
                preexec_fn=_limits if os.name == "posix" else None,
            )
        except subprocess.TimeoutExpired:
            return RunResult("error", problems=[f"the run took longer than {timeout:.0f} s and was stopped"])
        output = (proc.stdout + proc.stderr)[-8000:]
        if proc.returncode != 0 or not (work / "results.json").is_file():
            last = [ln for ln in output.strip().splitlines() if ln.strip()][-1:] or ["the run failed"]
            return RunResult("error", problems=last, output=output)
        results = json.loads((work / "results.json").read_text(encoding="utf-8"))
        return RunResult("done", output=output, results=results)
