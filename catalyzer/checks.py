"""The lock on a problem: before any test runs, the answer is read (never run) and must keep the stub's shape.

- every function in the stub is still there, with the same parameters, defaults and type hints (the tests call
  them exactly so);
- imports stay inside the problem's allowed list (plus a few harmless standard modules), so "compute the molecular
  weight" can't be answered by importing the function that already does it;
- names the problem forbids (such as `MolWt`) and Python's back doors (`eval`, `exec`, `__import__`, `getattr`,
  dunder attributes, `open`) are not used.

This is a learning aid, not a security sandbox: the runner only runs code on the reader's own computer.
"""

from __future__ import annotations

import ast
from dataclasses import dataclass, field

# Standard modules any answer may import: pure computation, no files, network or processes.
ALWAYS_ALLOWED = (
    "__future__",
    "math",
    "cmath",
    "statistics",
    "collections",
    "itertools",
    "functools",
    "operator",
    "typing",
    "dataclasses",
    "re",
    "string",
    "fractions",
    "decimal",
    "heapq",
    "bisect",
)
# Names no answer may use: they run or reach code the static check cannot see.
BACK_DOORS = frozenset(
    {
        "eval",
        "exec",
        "compile",
        "__import__",
        "importlib",
        "getattr",
        "setattr",
        "delattr",
        "globals",
        "locals",
        "vars",
        "open",
        "input",
        "breakpoint",
        "__builtins__",
        "exit",
        "quit",
    }
)


@dataclass
class CheckResult:
    ok: bool
    problems: list[str] = field(default_factory=list)


def _signature(fn: ast.FunctionDef) -> str:
    """A function's shape as text: parameters, defaults, type hints and return type (not its body)."""
    returns = f" -> {ast.unparse(fn.returns)}" if fn.returns else ""
    return f"{'async ' if isinstance(fn, ast.AsyncFunctionDef) else ''}def {fn.name}({ast.unparse(fn.args)}){returns}"


def stub_signatures(stub_source: str) -> dict[str, str]:
    """The top-level functions of a stub, by name, with their signatures."""
    tree = ast.parse(stub_source)
    return {n.name: _signature(n) for n in tree.body if isinstance(n, (ast.FunctionDef, ast.AsyncFunctionDef))}


def _allowed(name: str, allowed: tuple[str, ...]) -> bool:
    return any(name == a or name.startswith(a + ".") for a in allowed)


def check_answer(
    source: str,
    stub_source: str,
    allowed_imports: list[str] | tuple[str, ...] = (),
    forbidden_names: list[str] | tuple[str, ...] = (),
) -> CheckResult:
    """Read an answer and say what (if anything) breaks the problem's lock. Nothing is executed."""
    try:
        tree = ast.parse(source)
    except SyntaxError as e:
        return CheckResult(False, [f"syntax error on line {e.lineno}: {e.msg}"])

    problems: list[str] = []
    allowed = tuple(ALWAYS_ALLOWED) + tuple(allowed_imports)
    forbidden = BACK_DOORS | set(forbidden_names)

    # 1. the stub's functions, unchanged in shape
    want = stub_signatures(stub_source)
    have = {n.name: _signature(n) for n in tree.body if isinstance(n, (ast.FunctionDef, ast.AsyncFunctionDef))}
    for name, sig in want.items():
        if name not in have:
            problems.append(f"function `{name}` is missing (keep: `{sig}`)")
        elif have[name] != sig:
            problems.append(f"the signature of `{name}` changed: expected `{sig}`, found `{have[name]}`")

    # 2. imports and names
    for node in ast.walk(tree):
        if isinstance(node, ast.Import):
            for a in node.names:
                if not _allowed(a.name, allowed):
                    problems.append(f"line {node.lineno}: `import {a.name}` is not allowed in this problem")
                if a.name.split(".")[-1] in forbidden or (a.asname and a.asname in forbidden):
                    problems.append(f"line {node.lineno}: `{a.name}` is not allowed in this problem")
        elif isinstance(node, ast.ImportFrom):
            if node.level:
                problems.append(f"line {node.lineno}: relative imports are not allowed")
                continue
            for a in node.names:
                full = f"{node.module}.{a.name}"
                if a.name == "*":
                    problems.append(f"line {node.lineno}: `from {node.module} import *` is not allowed")
                elif not (_allowed(full, allowed) or _allowed(node.module or "", allowed)):
                    problems.append(
                        f"line {node.lineno}: `from {node.module} import {a.name}` is not allowed in this problem"
                    )
                elif a.name in forbidden or (a.asname and a.asname in forbidden):
                    problems.append(f"line {node.lineno}: `{a.name}` is not allowed in this problem")
        elif isinstance(node, ast.Name) and node.id in forbidden:
            problems.append(f"line {node.lineno}: `{node.id}` is not allowed in this problem")
        elif isinstance(node, ast.Attribute):
            if node.attr in forbidden:
                problems.append(f"line {node.lineno}: `.{node.attr}` is not allowed in this problem")
            elif node.attr.startswith("__") and node.attr.endswith("__"):
                problems.append(f"line {node.lineno}: double-underscore attributes (`{node.attr}`) are not allowed")
    # one message per distinct problem, in order
    return CheckResult(not problems, list(dict.fromkeys(problems)))
