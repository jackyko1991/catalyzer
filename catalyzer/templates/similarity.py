"""Similarity matrix: how alike every pair of your molecules is (Morgan fingerprints, Tanimoto similarity).

Add molecules in the Molecules tab. 1.00 on the diagonal; above about 0.4 two molecules usually share a scaffold.
"""

import render as r
from data import molecules
from rdkit import DataStructs
from rdkit.Chem import rdFingerprintGenerator


def run():
    mols = molecules()
    if len(mols) < 2:
        return [r.text(("Add at least two molecules in the Molecules tab.", "請在「分子」分頁中加入至少兩個分子。"))]
    gen = rdFingerprintGenerator.GetMorganGenerator(radius=2, fpSize=2048)
    fps = [gen.GetFingerprint(m) for _, m in mols]
    names = [n for n, _ in mols]
    sim = [DataStructs.BulkTanimotoSimilarity(f, fps) for f in fps]
    nearest = []
    for i, row in enumerate(sim):
        j = max((k for k in range(len(row)) if k != i), key=lambda k: row[k])
        nearest.append([names[i], names[j], f"{row[j]:.2f}"])
    return [
        r.metric(("Molecules", "分子數"), len(mols)),
        r.table(
            ["", *names],
            [[names[i], *[f"{v:.2f}" for v in row]] for i, row in enumerate(sim)],
            ("Tanimoto similarity", "Tanimoto 相似度"),
        ),
        r.table(
            ["Molecule", "Nearest", "Similarity"],
            nearest,
            ("Each molecule's nearest neighbour", "每個分子最相似的另一個"),
        ),
    ]
