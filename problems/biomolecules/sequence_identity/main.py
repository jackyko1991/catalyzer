"""Run: align two proteins, score them with your needleman_wunsch, measure the identity of the alignment, and see
where the differences are: on the 3D structure for human vs horse haemoglobin α, as a dot plot otherwise."""

from pathlib import Path

import render as r
from answer import needleman_wunsch, percent_identity
from Bio import Align

HUMAN_HBA = "VLSPADKTNVKAAWGKVGAHAGEYGAEALERMFLSFPTTKTYFPHFDLSHGSAQVKGHGKKVADALTNAVAHVDDMPNALSALSDLHAHKLRVDPVNFKLLSHCLLVTLAAHLPAEFTPAVHASLDKFLASVSTVLTSKYR"
MODEL = (Path(__file__).parent / "data" / "AF-P69905-F1-model_v6.pdb").read_text()


def dot_plot(a: str, b: str, size: int = 360) -> str:
    """An SVG dot plot: a dot where letter i of a equals letter j of b; matching stretches show as diagonals."""
    n, m = len(a), len(b)
    s = size / max(n, m)
    dots = "".join(
        f"<rect x='{j * s:.2f}' y='{i * s:.2f}' width='{max(s, 1):.2f}' height='{max(s, 1):.2f}' fill='#c2410c'/>"
        for i, x in enumerate(a)
        for j, y in enumerate(b)
        if x == y
    )
    w, h = m * s, n * s
    return (
        f"<svg xmlns='http://www.w3.org/2000/svg' viewBox='-30 -20 {w + 40:.0f} {h + 30:.0f}'>"
        f"<rect width='{w:.2f}' height='{h:.2f}' fill='#fff' stroke='#d1d5db'/>{dots}"
        f"<text x='{w / 2:.0f}' y='-6' font-size='11' text-anchor='middle' fill='#6b7280'>B →</text>"
        f"<text x='-8' y='{h / 2:.0f}' font-size='11' text-anchor='end' fill='#6b7280'>A ↓</text></svg>"
    )


def run(p: dict) -> list:
    a, b = "".join(p["a"].split()).upper(), "".join(p["b"].split()).upper()
    score = needleman_wunsch(a, b, match=1, mismatch=-1, gap=-2)
    # the alignment itself (the path through the table), from Biopython with the same scores, to show it
    aligner = Align.PairwiseAligner(mode="global", match_score=1, mismatch_score=-1)
    aligner.open_gap_score = aligner.extend_gap_score = -2
    best = aligner.align(a, b)[0]
    top, bottom = best[0], best[1]
    marks = "".join("|" if x == y and x != "-" else " " for x, y in zip(top, bottom))
    lines = []
    for i in range(0, len(top), 60):
        lines += [top[i : i + 60], marks[i : i + 60], bottom[i : i + 60], ""]
    out = [
        r.metric(("Needleman–Wunsch score", "Needleman–Wunsch 分數"), score),
        r.metric(("Identity", "相同度"), f"{percent_identity(top, bottom):.1f}", "%"),
    ]
    if a == HUMAN_HBA:
        # positions of A that differ from B, as residue numbers of the model (it starts with Met 1)
        differ, k = [], 0
        for x, y in zip(top, bottom):
            if x != "-":
                k += 1
                if x != y:
                    differ.append(k + 1)
        out.append(
            r.pdb3d(
                [{"pdb": MODEL, "colour": "#d1d5db"}],
                (
                    "Human haemoglobin α (AlphaFold model): the residues that differ in B, in orange",
                    "人類血紅蛋白 α（AlphaFold 模型）：與 B 不同的殘基為橘色",
                ),
                highlight=[{"resi": differ, "colour": "#c2410c"}],
            )
        )
    else:
        out.append(
            {
                "kind": "svg",
                "title": ["Dot plot: a dot wherever the letters agree", "點圖：字母相同處畫一個點"],
                "svg": dot_plot(a, b),
            }
        )
    out.append(
        r.text("\n".join(lines), ("The best global alignment (| = identical)", "最佳全域比對（| = 相同）"), mono=True)
    )
    return out
