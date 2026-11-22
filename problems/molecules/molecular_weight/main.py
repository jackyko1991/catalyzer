"""Run: your molecular_weight, and how much each element contributes to it."""

import render as r
from answer import molecular_weight
from rdkit import Chem


def run(p: dict) -> list:
    mol = Chem.MolFromSmiles(p["smiles"])
    table = Chem.GetPeriodicTable()
    share: dict[str, float] = {}
    for atom in mol.GetAtoms():
        share[atom.GetSymbol()] = share.get(atom.GetSymbol(), 0.0) + table.GetAtomicWeight(atom.GetSymbol())
        if atom.GetTotalNumHs():
            share["H"] = share.get("H", 0.0) + atom.GetTotalNumHs() * table.GetAtomicWeight("H")
    return [
        r.metric(("Molecular weight", "分子量"), f"{molecular_weight(p['smiles']):.3f}", "g/mol"),
        r.svg(mol, ("The molecule", "分子結構")),
        r.mol3d(mol, ("In 3D, every atom whose mass is counted", "3D：每個被計入質量的原子")),
        r.bars(
            list(share),
            [round(v, 3) for v in share.values()],
            ("Mass from each element", "各元素貢獻的質量"),
            unit="g/mol",
        ),
    ]
