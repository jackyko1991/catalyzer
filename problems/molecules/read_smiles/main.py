"""Run: read a SMILES string with your molecular_formula, draw the molecule in 2D and 3D."""

import render as r
from answer import molecular_formula
from rdkit import Chem


def hill(counts: dict[str, int]) -> list[str]:
    """Hill order: carbon, then hydrogen, then the rest alphabetically (alphabetical if there is no carbon)."""
    if "C" in counts:
        return ["C"] + (["H"] if "H" in counts else []) + sorted(e for e in counts if e not in ("C", "H"))
    return sorted(counts)


def run(p: dict) -> list:
    counts = molecular_formula(p["smiles"])
    order = hill(counts)
    formula = "".join(f"{e}{counts[e] if counts[e] > 1 else ''}" for e in order)
    mol = Chem.MolFromSmiles(p["smiles"])
    return [
        r.metric(("Molecular formula", "分子式"), formula),
        r.svg(mol, ("The molecule in 2D (hydrogens on carbon not drawn)", "2D 結構（碳上的氫不畫出）")),
        r.table(
            [("Element", "元素"), ("Atoms", "原子數")],
            [[e, counts[e]] for e in order],
            ("Atoms of each element", "各元素的原子數"),
        ),
        r.mol3d(mol, ("In 3D, every hydrogen added", "3D 結構，加上所有的氫")),
    ]
