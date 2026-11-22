"""Start the local runner and the Vite dev server together; Ctrl+C stops both (as Formalizer's scripts/dev.py).

    pixi run dev        →  open http://localhost:5190  (runner on :8795)

- The runner restarts when catalyzer/ or problems/ change (watched here, not with uvicorn --reload, whose reloader can
  hang on Windows and keep serving old code). After changing a problem, `pixi run export` updates what the site shows.
- Vite updates the page live (React Fast Refresh).
- If either server crashes it is restarted (after printing its exit code).
"""

from __future__ import annotations

import os
import signal
import socket
import subprocess
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
NPM = "npm.cmd" if os.name == "nt" else "npm"
PORT = 5190  # Formalizer's dev server uses 5180, other learnkit sites 5173; the runner accepts any localhost port
RUNNER_PORT = 8795
WATCHED = [(ROOT / "catalyzer", "*.py"), (ROOT / "problems", "*.py"), (ROOT / "problems", "*.yaml")]

SERVERS = {
    "runner": {"args": [sys.executable, "-m", "catalyzer.serve"], "cwd": ROOT},
    # Vite takes the next port if this one is busy, and says so
    "web": {"args": [NPM, "run", "dev", "--", "--port", str(PORT)], "cwd": ROOT / "frontend"},
}


def start(name: str) -> subprocess.Popen:
    spec = SERVERS[name]
    return subprocess.Popen(spec["args"], cwd=spec["cwd"])


def stop(proc: subprocess.Popen) -> None:
    if proc.poll() is None:
        if os.name == "nt":  # the whole tree (npm starts node, the runner starts pytest)
            subprocess.run(["taskkill", "/PID", str(proc.pid), "/T", "/F"], capture_output=True, check=False)
        else:
            proc.terminate()
    try:
        proc.wait(timeout=10)
    except subprocess.TimeoutExpired:
        proc.kill()


def snapshot() -> dict[Path, float]:
    return {f: f.stat().st_mtime for d, pattern in WATCHED for f in d.rglob(pattern)}


def port_busy(port: int) -> bool:
    with socket.socket() as s:
        s.settimeout(0.5)
        return s.connect_ex(("127.0.0.1", port)) == 0


def main() -> None:
    signal.signal(signal.SIGTERM, lambda *_: (_ for _ in ()).throw(KeyboardInterrupt))  # kill: stop both, as Ctrl+C
    # the site imports @learnkit/web from the vendor/learnkit submodule; a plain clone leaves it empty and the page
    # renders nothing (Vite: "Failed to resolve import @learnkit/web")
    if not (ROOT / "vendor" / "learnkit" / "web" / "src" / "index.ts").is_file():
        print("[dev] vendor/learnkit is empty; checking out the submodule (git submodule update --init)", flush=True)
        subprocess.run(["git", "submodule", "update", "--init"], cwd=ROOT, check=True)
    if not (ROOT / "frontend" / "node_modules").is_dir():
        subprocess.run([NPM, "install", "--no-audit", "--no-fund"], cwd=ROOT / "frontend", check=True)
    if port_busy(RUNNER_PORT):  # a runner started by hand: use it, and leave it alone
        print(f"[dev] a runner is already on :{RUNNER_PORT}; using it (stop it to let dev restart it on changes)")
        del SERVERS["runner"]
    procs = {name: start(name) for name in SERVERS}
    seen = snapshot()
    print(f"\n  Catalyzer dev: http://localhost:{PORT}  (runner on :{RUNNER_PORT})  — Ctrl+C to stop\n", flush=True)
    try:
        while True:
            time.sleep(1)
            now = snapshot()
            if now != seen and "runner" in procs:
                seen = now
                print("\n[dev] runner or problem code changed — restarting the runner\n", flush=True)
                stop(procs["runner"])
                procs["runner"] = start("runner")
                continue
            for name, proc in procs.items():
                if proc.poll() is not None:
                    print(f"\n[dev] {name} exited with code {proc.returncode} — restarting in 2 s\n", flush=True)
                    time.sleep(2)
                    procs[name] = start(name)
    except KeyboardInterrupt:
        pass
    finally:
        for proc in procs.values():
            stop(proc)


if __name__ == "__main__":
    main()
