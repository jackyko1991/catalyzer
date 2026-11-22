"""Check an answer from the command line: `pixi run check molecules/read_smiles my_answer.py`.

Without a file, it lists the problems; with a problem but no file, it prints the stub to start from.
"""

from __future__ import annotations

import sys
from pathlib import Path

from . import runner
from .problems import all_problems, load


def main(argv: list[str]) -> int:
    if not argv:
        for p in all_problems():
            print(f"{p.id:32} {p.meta['level']:13} {p.meta['title']}")
        return 0
    try:
        problem = load(argv[0])
    except KeyError:
        print(f"no problem {argv[0]!r}; run without arguments for the list", file=sys.stderr)
        return 2
    if len(argv) == 1:
        print(problem.stub, end="")
        return 0
    result = runner.run(problem, Path(argv[1]).read_text(encoding="utf-8"))
    for msg in result.problems:
        print(f"✗ {msg}")
    for t in result.tests:
        print(f"{'✓' if t.passed else '✗'} {t.name}")
        if not t.passed and t.message:
            print("    " + t.message.splitlines()[0][:200])
    print(f"\n{result.status}")
    return 0 if result.status == "passed" else 1


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
