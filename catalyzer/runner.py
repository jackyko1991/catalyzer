"""Run a problem's tests against an answer, on the reader's own computer.

The answer is checked first (catalyzer.checks: signatures, imports, forbidden names); only then is it copied with
test.py and the problem's data/ into a fresh temporary folder and pytest runs there in a separate process, with a
wall-clock timeout and, on Linux and macOS, CPU-time, memory and file-size limits. Each test comes back as a chip:
its name, passed or failed, and the first lines of the failure.
"""

from __future__ import annotations

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
    """status: passed (every test), failed (some test), rejected (the static check), error (timeout, crash)"""

    status: str
    tests: list[TestResult] = field(default_factory=list)
    problems: list[str] = field(default_factory=list)
    output: str = ""

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


def run(problem: Problem, source: str, timeout: float = TIMEOUT_S) -> RunResult:
    check = check_answer(source, problem.stub, problem.allowed_imports, problem.forbidden_names)
    if not check.ok:
        return RunResult("rejected", problems=check.problems)

    with tempfile.TemporaryDirectory(prefix="catalyzer-") as tmp:
        work = Path(tmp)
        (work / "answer.py").write_text(source, encoding="utf-8")
        shutil.copy(problem.path / "test.py", work / "test.py")
        if (problem.path / "data").is_dir():
            shutil.copytree(problem.path / "data", work / "data")
        # -I (isolated) ignores PYTHON* variables and the user's site-packages, and leaves the current folder off
        # sys.path; the boot line puts the work folder (answer.py) back first.
        boot = "import sys; sys.path.insert(0, '.'); import pytest; sys.exit(pytest.main(sys.argv[1:]))"
        args = ["-q", "-p", "no:cacheprovider", "--junitxml=report.xml", "-o", "junit_family=xunit1", "test.py"]
        cmd = [sys.executable, "-I", "-c", boot, *args]
        env = {k: v for k, v in os.environ.items() if k in ("PATH", "SYSTEMROOT", "TEMP", "TMP", "HOME", "LANG")}
        try:
            proc = subprocess.run(
                cmd,
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
