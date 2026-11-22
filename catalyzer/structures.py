"""3D structures for the site's molecule viewer, written by `pixi run export` into frontend/public/structures/:

- molecules.json: a few small molecules with 3D coordinates (RDKit ETKDG conformer, MMFF-relaxed, fixed seed), as
  MDL mol blocks the viewer reads directly;
- 1crn.pdb: crambin's crystal structure (PDB 1CRN, CC0);
- AF-P01542-F1-model_v6.aligned.pdb: its AlphaFold DB model (CC BY 4.0), turned and moved onto the crystal by the
  Kabsch fit of the alpha carbons (the rmsd problem's method), so the two can be shown on top of each other.
"""

from __future__ import annotations

import json
import shutil
from pathlib import Path

import numpy as np
from rdkit import Chem
from rdkit.Chem import AllChem

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "frontend" / "public" / "structures"
DATA = ROOT / "problems" / "pro" / "rmsd" / "data"

# name: [English, Traditional Chinese], SMILES
MOLECULES = {
    "ethanol": (["Ethanol", "乙醇"], "CCO"),
    "benzene": (["Benzene", "苯"], "c1ccccc1"),
    "caffeine": (["Caffeine", "咖啡因"], "Cn1cnc2c1c(=O)n(C)c(=O)n2C"),
    "aspirin": (["Aspirin", "阿斯匹靈"], "CC(=O)Oc1ccccc1C(=O)O"),
    "ibuprofen": (["Ibuprofen", "布洛芬"], "CC(C)Cc1ccc(cc1)C(C)C(=O)O"),
}


def mol_block(smiles: str) -> str:
    mol = Chem.AddHs(Chem.MolFromSmiles(smiles))
    params = AllChem.ETKDGv3()
    params.randomSeed = 42
    if AllChem.EmbedMolecule(mol, params) != 0:
        raise RuntimeError(f"could not embed {smiles}")
    AllChem.MMFFOptimizeMolecule(mol)
    return Chem.MolToMolBlock(mol)


def _ca(lines: list[str]) -> dict[int, np.ndarray]:
    return {
        int(ln[22:26]): np.array([float(ln[30:38]), float(ln[38:46]), float(ln[46:54])])
        for ln in lines
        if ln.startswith("ATOM  ") and ln[12:16].strip() == "CA" and ln[21] == "A"
    }


def aligned_model(model_pdb: str, crystal_pdb: str) -> tuple[str, float]:
    """The model's lines with every atom moved by the Kabsch fit of matching CA atoms onto the crystal, and the
    CA RMSD after the fit."""
    m_lines, x_lines = model_pdb.splitlines(), crystal_pdb.splitlines()
    m, x = _ca(m_lines), _ca(x_lines)
    common = sorted(set(m) & set(x))
    P = np.array([m[i] for i in common])
    Q = np.array([x[i] for i in common])
    pc, qc = P.mean(axis=0), Q.mean(axis=0)
    U, _, Vt = np.linalg.svd((P - pc).T @ (Q - qc))
    d = np.sign(np.linalg.det(U @ Vt))
    R = U @ np.diag([1.0, 1.0, d]) @ Vt
    rmsd = float(np.sqrt((((P - pc) @ R - (Q - qc)) ** 2).sum(axis=1).mean()))
    out = []
    for ln in m_lines:
        if ln.startswith(("ATOM  ", "HETATM")):
            xyz = (np.array([float(ln[30:38]), float(ln[38:46]), float(ln[46:54])]) - pc) @ R + qc
            ln = f"{ln[:30]}{xyz[0]:8.3f}{xyz[1]:8.3f}{xyz[2]:8.3f}{ln[54:]}"
        out.append(ln)
    return "\n".join(out) + "\n", rmsd


def main() -> float:
    OUT.mkdir(parents=True, exist_ok=True)
    molecules = [
        {"id": k, "name": name, "smiles": smi, "molblock": mol_block(smi)} for k, (name, smi) in MOLECULES.items()
    ]
    text = json.dumps(molecules, ensure_ascii=False, indent=1) + "\n"
    (OUT / "molecules.json").write_text(text, encoding="utf-8", newline="\n")
    shutil.copy(DATA / "1crn.pdb", OUT / "1crn.pdb")  # unchanged, byte for byte
    aligned, rmsd = aligned_model((DATA / "AF-P01542-F1-model_v6.pdb").read_text(), (DATA / "1crn.pdb").read_text())
    (OUT / "AF-P01542-F1-model_v6.aligned.pdb").write_text(aligned, newline="\n")
    return rmsd


if __name__ == "__main__":
    print(f"crambin model on crystal: CA RMSD {main():.3f} Å")
