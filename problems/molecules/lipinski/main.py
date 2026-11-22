"""Run: the four numbers of the rule of five against their limits, and your verdict."""

import render as r
from answer import LIMITS, lipinski_violations, passes_rule_of_five
from rdkit import Chem
from rdkit.Chem import Crippen, Descriptors, Lipinski


def run(p: dict) -> list:
    mol = Chem.MolFromSmiles(p["smiles"])
    values = {
        "MW": Descriptors.MolWt(mol),
        "logP": Crippen.MolLogP(mol),
        "HBD": Lipinski.NumHDonors(mol),
        "HBA": Lipinski.NumHAcceptors(mol),
    }
    broken = lipinski_violations(p["smiles"])
    ok = passes_rule_of_five(p["smiles"])
    # each bar as a share of its limit, so the four fit one scale; the label keeps the real value
    return [
        r.metric(("Rule of five", "五規則"), "passes · 通過" if ok else "fails · 未通過", good=ok),
        r.metric(("Limits broken", "超出的上限"), ", ".join(broken) or "–"),
        r.bars(
            [f"{k} = {v:.2f}" if isinstance(v, float) else f"{k} = {v}" for k, v in values.items()],
            [values[k] / LIMITS[k] for k in values],
            ("Each value as a share of its limit (red line = the limit)", "每個數值相對於上限的比例（紅線 = 上限）"),
            limits=[1.0] * 4,
            colours=["#dc2626" if k in broken else "#c2410c" for k in values],
        ),
        r.svg(mol, ("The molecule", "分子結構")),
        r.mol3d(mol, ("In 3D", "3D 結構")),
    ]
