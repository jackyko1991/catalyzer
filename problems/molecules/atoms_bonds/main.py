"""Run: the molecule as a graph, each atom labelled with the degree your function computes."""

import render as r
from answer import bond_counts, degrees
from rdkit import Chem


def run(p: dict) -> list:
    mol = Chem.MolFromSmiles(p["smiles"])
    deg = degrees(p["smiles"])
    counts = bond_counts(p["smiles"])
    adjacency = [
        [1 if mol.GetBondBetweenAtoms(i, j) else 0 for j in range(mol.GetNumAtoms())] for i in range(mol.GetNumAtoms())
    ]
    out = [
        r.svg(
            mol,
            ("Each atom's index and degree (index:degree)", "每個原子的編號與度（編號:度）"),
            notes={i: f"{i}:{d}" for i, d in enumerate(deg)},
        ),
        r.mol3d(mol, ("In 3D: the same graph, now with hydrogens and a shape", "3D：同一張圖，加上氫與形狀")),
        r.bars(list(counts), list(counts.values()), ("Bonds of each kind", "各種鍵的數目")),
        r.table(
            [("Atom", "原子"), ("Element", "元素"), ("Degree", "度")],
            [[i, a.GetSymbol(), deg[i]] for i, a in enumerate(mol.GetAtoms())],
            ("Degrees", "度"),
        ),
    ]
    if mol.GetNumAtoms() <= 16:
        out.append(
            r.table(
                [""] + [str(j) for j in range(mol.GetNumAtoms())],
                [[str(i), *row] for i, row in enumerate(adjacency)],
                ("Adjacency matrix A (1 = bonded)", "鄰接矩陣 A（1 = 相連）"),
            )
        )
    return out
