"""Run: every ring of the molecule, aromatic ones in orange, others in blue, and your ring_info."""

import render as r
from answer import ring_info
from rdkit import Chem


def run(p: dict) -> list:
    mol = Chem.MolFromSmiles(p["smiles"])
    info = ring_info(p["smiles"])
    atoms, bonds, rows = {}, {}, []
    for ring in mol.GetRingInfo().BondRings():
        aromatic = all(mol.GetBondWithIdx(i).GetIsAromatic() for i in ring)
        colour = r.ORANGE if aromatic else r.BLUE
        for i in ring:
            b = mol.GetBondWithIdx(i)
            bonds[i] = colour
            atoms[b.GetBeginAtomIdx()] = colour
            atoms[b.GetEndAtomIdx()] = colour
        rows.append([len(ring), "yes · 是" if aromatic else "no · 否"])
    return [
        r.metric(("Aromatic rings", "芳香環"), info["aromatic_rings"]),
        r.metric(("Ring sizes", "環的大小"), ", ".join(map(str, info["ring_sizes"])) or "–"),
        r.svg(
            mol,
            ("Aromatic rings in orange, other rings in blue", "芳香環為橘色，其他環為藍色"),
            highlight=atoms,
            bond_highlight=bonds,
        ),
        r.mol3d(mol, ("In 3D: aromatic rings lie flat", "3D：芳香環是平的")),
        r.table(
            [("Ring size", "環的大小"), ("Aromatic", "芳香")],
            rows,
            ("The smallest set of smallest rings", "最小環集合"),
        ),
    ]
