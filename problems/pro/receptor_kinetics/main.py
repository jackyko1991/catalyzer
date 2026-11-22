"""Run: work out k_off and k_on for a published ladder of engineered receptors, and see what the model predicts."""

import csv
from pathlib import Path

import render as r
from answer import off_rate, on_rate, signal_fraction

DATA = Path(__file__).parent / "data"
VARIANTS = list(csv.DictReader((DATA / "variants.csv").read_text(encoding="utf-8").splitlines()))
STRUCTURE = (DATA / "2bnr.pdb").read_text(encoding="utf-8")
# the two variants whose measured killing is the strongest (Hebeisen et al., Front Immunol 2022)
BEST_MEASURED = {"DMb", "TMb"}


def run(p: dict) -> list:
    steps, k_p = int(p["steps"]), float(p["k_p"])
    rows, names, kds, signals = [], [], [], []
    for v in VARIANTS:
        kd = float(v["kd_um"])
        if v["half_life_s"]:
            k_off = off_rate(float(v["half_life_s"]))
            how = "from t½"
        elif v["k_off_published"]:
            k_off = float(v["k_off_published"])
            how = "published"
        else:
            k_off = None
            how = "—"
        k_on = on_rate(k_off, kd) if k_off else None
        signal = signal_fraction(k_off, k_p, steps) if k_off else None
        rows.append(
            [
                v["name"] + (" ★" if v["name"] in BEST_MEASURED else ""),
                f"{kd:g}",
                v["half_life_s"] or "—",
                "—" if k_off is None else f"{k_off:.4f}",
                "—" if k_on is None else f"{k_on:.2e}",
                how,
                "—" if signal is None else f"{signal:.3f}",
            ]
        )
        if signal is not None:
            names.append(v["name"])
            kds.append(kd)
            signals.append(signal)
    return [
        r.metric(("Receptors", "受體數"), len(VARIANTS)),
        r.metric(
            ("Affinity range", "親和力範圍"),
            f"{max(float(v['kd_um']) for v in VARIANTS):g} → {min(float(v['kd_um']) for v in VARIANTS):g}",
            "µM",
        ),
        r.metric(("Strongest killer measured", "實測最強的殺手"), "DMβ, TMβ (1–2 µM)"),
        r.table(
            [
                ("Receptor", "受體"),
                ("K_D (µM)", "K_D（µM）"),
                ("t½ (s)", "t½（秒）"),
                ("k_off (1/s)", "k_off（1/秒）"),
                ("k_on (1/M/s)", "k_on（1/M/秒）"),
                ("k_off from", "k_off 來源"),
                ("Model signal", "模型訊號"),
            ],
            rows,
            ("★ = the strongest killers measured, in the middle of the ladder", "★ = 實測殺傷力最強者，位於階梯中段"),
        ),
        r.scatter(
            kds,
            signals,
            names,
            (
                f"What the model predicts: tighter is always better (N = {steps}, k_p = {k_p:g} /s)",
                f"模型的預測：越緊越好（N = {steps}，k_p = {k_p:g} /秒）",
            ),
            ("K_D (µM) — tighter to the left", "K_D（µM）—— 越左越緊"),
            ("Share of bound receptors that signal", "會發出訊號的已結合受體比例"),
        ),
        r.bars(
            [v["name"] for v in VARIANTS if v["half_life_s"]],
            [float(v["half_life_s"]) for v in VARIANTS if v["half_life_s"]],
            ("How long each one holds on (published dwell times)", "各自抓住目標多久（已發表的停留時間）"),
            unit="s",
        ),
        r.pdb3d(
            [{"pdb": STRUCTURE, "colour": "#9ca3af"}],
            (
                "The receptor on its target (PDB 2BNR): the peptide it reads is in orange",
                "受體與其標靶（PDB 2BNR）：它所讀取的胜肽為橘色",
            ),
            highlight=[{"resi": list(range(1, 10)), "chain": "C", "colour": "#c2410c"}],
        ),
        r.text(
            (
                "The model rises all the way to the tightest receptor; the measured killing does not. See the notes.",
                "模型一路上升到最緊的受體；實測的殺傷力卻不是如此。請看延伸知識。",
            )
        ),
    ]
