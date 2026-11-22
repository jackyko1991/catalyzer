"""The Library: public molecular data a reader can open in the Workspace (catalyzer/library.json: PubChem
compounds, PDB entries and AlphaFold DB models, fetched from the sources' own APIs on the date in `fetched`).

`entries()` gives each one the starting code of its workspace item: a `run()` that draws it (2D and 3D for a
molecule; the structure for a PDB entry; the model coloured by pLDDT for a prediction) and computes a few numbers.
Molecules carry their SMILES in the code, so they run offline; structures are downloaded by data.py and cached.
"""

from __future__ import annotations

import json
from pathlib import Path

CATALOGUE = Path(__file__).with_name("library.json")

LICENCES = {
    "molecules": (
        "PubChem: free to use; each depositor may set its own terms",
        "https://pubchem.ncbi.nlm.nih.gov/docs/data-sources",
    ),
    "structures": ("PDB: CC0 1.0", "https://www.wwpdb.org/about/usage-policies"),
    "predictions": ("AlphaFold DB: CC BY 4.0", "https://alphafold.ebi.ac.uk/faq"),
}


def _molecule_code(m: dict) -> str:
    return f'''"""{m["name"][0]}: PubChem CID {m["cid"]} (https://pubchem.ncbi.nlm.nih.gov/compound/{m["cid"]})"""

import render as r
from rdkit import Chem
from rdkit.Chem import Crippen, Descriptors, Lipinski

SMILES = r"{m["smiles"]}"


def run():
    mol = Chem.MolFromSmiles(SMILES)
    return [
        r.metric(("Molecular weight", "分子量"), f"{{Descriptors.MolWt(mol):.2f}}", "g/mol"),
        r.metric(("logP", "logP"), f"{{Crippen.MolLogP(mol):.2f}}"),
        r.metric(("H-bond donors / acceptors", "氫鍵供體 / 受體"), f"{{Lipinski.NumHDonors(mol)}} / {{Lipinski.NumHAcceptors(mol)}}"),
        r.svg(mol, ("{m["name"][0]}", "{m["name"][1]}")),
        r.mol3d(mol, ("In 3D", "3D 結構")),
    ]
'''


def _structure_code(s: dict) -> str:
    return f'''"""{s["name"][0]}: PDB {s["id"]} (https://www.rcsb.org/structure/{s["id"]})"""

import render as r
from data import fetch_pdb  # downloads from RCSB the first time, then keeps a copy on your computer

PDB = fetch_pdb("{s["id"]}")


def run():
    atoms = [ln for ln in PDB.splitlines() if ln.startswith(("ATOM  ", "HETATM"))]
    chains = sorted({{ln[21] for ln in atoms}})
    residues = {{(ln[21], ln[22:27]) for ln in atoms if ln.startswith("ATOM  ")}}
    ligands = sorted({{ln[17:20].strip() for ln in atoms if ln.startswith("HETATM")}} - {{"HOH"}})
    return [
        r.metric(("Atoms", "原子"), len(atoms)),
        r.metric(("Chains", "鏈"), ", ".join(chains)),
        r.metric(("Residues", "殘基"), len(residues)),
        r.metric(("Other molecules", "其他分子"), ", ".join(ligands) or "–"),
        r.pdb3d([{{"pdb": PDB, "colour": "#0f766e"}}], ("{s["name"][0]}", "{s["name"][1]}")),
    ]
'''


def _prediction_code(p: dict) -> str:
    return f'''"""{p["name"][0]}: AlphaFold DB model of UniProt {p["uniprot"]} (https://alphafold.ebi.ac.uk/entry/{p["uniprot"]})"""

import render as r
from data import fetch_alphafold  # downloads from AlphaFold DB the first time, then keeps a copy

MODEL = fetch_alphafold("{p["uniprot"]}")


def run():
    plddt = [float(ln[60:66]) for ln in MODEL.splitlines() if ln.startswith("ATOM  ") and ln[12:16].strip() == "CA"]
    colour = ["#0053d6" if v > 90 else "#65cbf3" if v > 70 else "#ffdb13" if v > 50 else "#ff7d45" for v in plddt]
    return [
        r.metric(("Mean pLDDT", "平均 pLDDT"), f"{{sum(plddt) / len(plddt):.1f}}"),
        r.metric(("Residues below 50 (likely disordered)", "低於 50 的殘基（可能無序）"), sum(v <= 50 for v in plddt)),
        r.pdb3d([{{"pdb": MODEL, "colour": "plddt"}}], ("{p["name"][0]}, coloured by pLDDT", "{p["name"][1]}，依 pLDDT 上色")),
        r.bars([str(i + 1) for i in range(len(plddt))], plddt, ("pLDDT of each residue", "每個殘基的 pLDDT"), colours=colour, vertical=True),
    ]
'''


def entries() -> list[dict]:
    """Every catalogue entry, flattened, with its kind, source link, licence and workspace code."""
    cat = json.loads(CATALOGUE.read_text(encoding="utf-8"))
    out = []
    for m in cat["molecules"]:
        out.append(
            {
                "kind": "molecules",
                "key": f"cid:{m['cid']}",
                "id": f"CID {m['cid']}",
                "name": m["name"],
                "detail": f"{m['formula']} · {float(m['mw']):.2f} g/mol",
                "url": f"https://pubchem.ncbi.nlm.nih.gov/compound/{m['cid']}",
                "smiles": m["smiles"],
                "code": _molecule_code(m),
            }
        )
    for s in cat["structures"]:
        res = f" · {s['resolution']} Å" if s.get("resolution") else ""
        out.append(
            {
                "kind": "structures",
                "key": f"pdb:{s['id']}",
                "id": f"PDB {s['id']}",
                "name": s["name"],
                "detail": f"{s['method'].lower()}{res} · {s['released']} · {s['atoms']} atoms",
                "url": f"https://www.rcsb.org/structure/{s['id']}",
                "code": _structure_code(s),
            }
        )
    for p in cat["predictions"]:
        out.append(
            {
                "kind": "predictions",
                "key": f"afdb:{p['uniprot']}",
                "id": f"UniProt {p['uniprot']}",
                "name": p["name"],
                "detail": f"{p['organism']} · {p['length']} aa · mean pLDDT {p['mean_plddt']}",
                "url": f"https://alphafold.ebi.ac.uk/entry/{p['uniprot']}",
                "code": _prediction_code(p),
            }
        )
    for e in out:
        e["licence"], e["licence_url"] = LICENCES[e["kind"]]
    return out
