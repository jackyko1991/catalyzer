"""Run: the Lewis bookkeeping of a molecule, atom by atom, with your formal_charge and total_charge."""

import render as r
from answer import formal_charge, total_charge
from rdkit import Chem

# Each molecule: its SMILES (charges written in) and its Lewis structure, one (element, lone-pair e⁻, bonding e⁻)
# per atom in the SMILES order, hydrogens last.
MOLECULES = {
    "ammonium": ("[NH4+]", [("N", 0, 8)] + [("H", 0, 2)] * 4),
    "hydroxide": ("[OH-]", [("O", 6, 2), ("H", 0, 2)]),
    "water": ("O", [("O", 4, 4), ("H", 0, 2), ("H", 0, 2)]),
    "carbon_monoxide": ("[C-]#[O+]", [("C", 2, 6), ("O", 2, 6)]),
    "nitromethane": ("C[N+](=O)[O-]", [("C", 0, 8), ("N", 0, 8), ("O", 4, 4), ("O", 6, 2)] + [("H", 0, 2)] * 3),
    "nitrate": ("[O-][N+](=O)[O-]", [("O", 6, 2), ("N", 0, 8), ("O", 4, 4), ("O", 6, 2)]),
}


def run(p: dict) -> list:
    smiles, atoms = MOLECULES[p["molecule"]]
    rows = [[el, lone, bonding, f"{formal_charge(el, lone, bonding):+d}"] for el, lone, bonding in atoms]
    total = total_charge(atoms)
    mol = Chem.MolFromSmiles(smiles)
    return [
        r.metric(("Charge of the whole molecule", "整個分子的電荷"), f"{total:+d}"),
        r.svg(mol, ("As RDKit draws it, charges written in the SMILES", "RDKit 畫出的結構，電荷寫在 SMILES 中")),
        r.mol3d(mol, ("In 3D", "3D 結構")),
        r.table(
            [("Atom", "原子"), ("Lone-pair e⁻", "孤對電子"), ("Bonding e⁻", "鍵結電子"), ("Formal charge", "形式電荷")],
            rows,
            ("FC = valence e⁻ − lone-pair e⁻ − ½ bonding e⁻", "FC = 價電子 − 孤對電子 − ½ 鍵結電子"),
        ),
    ]
