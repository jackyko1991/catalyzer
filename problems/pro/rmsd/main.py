"""Run: superpose AlphaFold's crambin on the crystal structure, your ca_rmsd, and the deviation residue by residue."""

from pathlib import Path

import numpy as np
import render as r
from answer import ca_rmsd

DATA = Path(__file__).parent / "data"
MODEL = (DATA / "AF-P01542-F1-model_v6.pdb").read_text()
CRYSTAL = (DATA / "1crn.pdb").read_text()


def _ca(text: str) -> dict[int, np.ndarray]:
    return {
        int(ln[22:26]): np.array([float(ln[30:38]), float(ln[38:46]), float(ln[46:54])])
        for ln in text.splitlines()
        if ln.startswith("ATOM  ") and ln[12:16].strip() == "CA"
    }


def run(p: dict) -> list:
    rmsd = ca_rmsd(MODEL, CRYSTAL)
    m, x = _ca(MODEL), _ca(CRYSTAL)
    common = sorted(set(m) & set(x))
    P, Q = np.array([m[i] for i in common]), np.array([x[i] for i in common])
    pc, qc = P.mean(0), Q.mean(0)
    U, _, Vt = np.linalg.svd((P - pc).T @ (Q - qc))
    R = U @ np.diag([1, 1, np.sign(np.linalg.det(U @ Vt))]) @ Vt
    moved = []
    for ln in MODEL.splitlines():  # move every atom of the model by the same fit, to draw the two together
        if ln.startswith(("ATOM  ", "HETATM")):
            xyz = (np.array([float(ln[30:38]), float(ln[38:46]), float(ln[46:54])]) - pc) @ R + qc
            ln = f"{ln[:30]}{xyz[0]:8.3f}{xyz[1]:8.3f}{xyz[2]:8.3f}{ln[54:]}"
        moved.append(ln)
    dev = np.linalg.norm((P - pc) @ R - (Q - qc), axis=1)
    worst = float(p["highlight"])
    return [
        r.metric(("CA RMSD, model vs crystal", "α 碳 RMSD，模型對晶體"), f"{rmsd:.2f}", "Å", good=rmsd < 1.0),
        r.pdb3d(
            [{"pdb": CRYSTAL, "colour": "#9ca3af"}, {"pdb": "\n".join(moved), "colour": "plddt"}],
            (
                "Crystal (grey) and the AlphaFold model (by pLDDT), superposed; residues off by more than the threshold in red",
                "晶體（灰）與 AlphaFold 模型（依 pLDDT）疊合；偏差超過門檻的殘基為紅色",
            ),
            highlight=[{"resi": [i for i, d in zip(common, dev) if d > worst], "colour": "#dc2626"}],
        ),
        r.bars(
            [str(i) for i in common],
            [round(float(d), 3) for d in dev],
            ("Distance of each CA after superposition", "疊合後每個 α 碳的距離"),
            colours=["#dc2626" if d > worst else "#c2410c" for d in dev],
            unit="Å",
            vertical=True,
        ),
    ]
