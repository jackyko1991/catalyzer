"""Molecule calculator: the properties of every molecule you put in.

Add molecules in the Molecules tab (paste SMILES, one per line with an optional name; drop .smi, .csv or .sdf
files; or add them from the Library). Change run() to compute anything else RDKit knows.
"""

import render as r
from data import molecules
from rdkit.Chem import Crippen, Descriptors, Lipinski, rdMolDescriptors


def run():
    mols = molecules()
    if not mols:
        return [r.text(("No molecules yet: add some in the Molecules tab.", "還沒有分子：請在「分子」分頁中加入。"))]
    rows, names, weight, logp = [], [], [], []
    for name, mol in mols:
        mw, lp = Descriptors.MolWt(mol), Crippen.MolLogP(mol)
        hbd, hba = Lipinski.NumHDonors(mol), Lipinski.NumHAcceptors(mol)
        broken = sum([mw > 500, lp > 5, hbd > 5, hba > 10])
        rows.append(
            [
                name,
                rdMolDescriptors.CalcMolFormula(mol),
                f"{mw:.1f}",
                f"{lp:.2f}",
                hbd,
                hba,
                f"{rdMolDescriptors.CalcTPSA(mol):.1f}",
                rdMolDescriptors.CalcNumRotatableBonds(mol),
                "yes" if broken <= 1 else "no",
            ]
        )
        names.append(name)
        weight.append(mw)
        logp.append(lp)
    return [
        r.metric(("Molecules", "分子數"), len(mols)),
        r.metric(("Pass the rule of five", "通過五規則"), sum(row[-1] == "yes" for row in rows)),
        r.table(
            ["Name", "Formula", "MW", "logP", "HBD", "HBA", "TPSA (Å²)", "Rotatable bonds", "Rule of five"],
            rows,
            ("Properties (computed by RDKit)", "性質（由 RDKit 計算）"),
        ),
        r.scatter(
            weight,
            logp,
            names,
            (
                "Molecular weight against logP; shaded: MW ≤ 500 and logP ≤ 5",
                "分子量對 logP；陰影：MW ≤ 500 且 logP ≤ 5",
            ),
            ("Molecular weight (g/mol)", "分子量（g/mol）"),
            ("logP", "logP"),
            box=(500, 5),
        ),
        r.grid(
            [m for _, m in mols[:12]],
            [n for n, _ in mols[:12]],
            ("The molecules (first 12)", "分子（前 12 個）"),
            per_row=4,
        ),
    ]
