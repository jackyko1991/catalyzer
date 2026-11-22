"""Data for workspace code: your own molecules, and public structures downloaded once and kept on this computer.

    from data import molecules, fetch_pdb, fetch_alphafold, fetch_smiles
    for name, mol in molecules():           # every molecule you pasted or dropped in (.smi, .csv, .sdf)
    crambin = fetch_pdb("1CRN")             # text of the PDB file (RCSB PDB, CC0)
    model = fetch_alphafold("P69905")       # text of the AlphaFold DB model (CC BY 4.0)
    smiles = fetch_smiles(2519)             # PubChem CID 2519, caffeine

Copied next to the code when the runner runs a workspace script. Files are cached in the folder named by
CATALYZER_CACHE (default ~/.cache/catalyzer), so a second run works offline. Only these three public services are
contacted.
"""

from __future__ import annotations

import json
import os
import re
import urllib.request
from pathlib import Path

HOSTS = ("files.rcsb.org", "alphafold.ebi.ac.uk", "pubchem.ncbi.nlm.nih.gov")
CACHE = Path(os.environ.get("CATALYZER_CACHE") or Path.home() / ".cache" / "catalyzer")
AGENT = {"User-Agent": "catalyzer/0.1 (+https://github.com/jackyko1991/catalyzer)"}


def _get(url: str) -> bytes:
    host = url.split("/")[2]
    if host not in HOSTS:
        raise ValueError(f"{host} is not one of the public sources this helper uses: {', '.join(HOSTS)}")
    with urllib.request.urlopen(urllib.request.Request(url, headers=AGENT), timeout=60) as r:
        return r.read()


def _cached(name: str, url: str) -> str:
    path = CACHE / name
    if not path.is_file():
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(_get(url))
    return path.read_text(encoding="utf-8")


def fetch_pdb(pdb_id: str) -> str:
    """The PDB-format file of an entry of the Protein Data Bank (e.g. "1CRN")."""
    if not re.fullmatch(r"[0-9][A-Za-z0-9]{3}", pdb_id):
        raise ValueError(f"not a PDB id: {pdb_id!r}")
    return _cached(f"pdb/{pdb_id.upper()}.pdb", f"https://files.rcsb.org/download/{pdb_id.upper()}.pdb")


def fetch_alphafold(uniprot: str) -> str:
    """The AlphaFold DB model (latest version, PDB format) of a UniProt accession (e.g. "P69905")."""
    if not re.fullmatch(r"[A-Z0-9]{6,10}", uniprot):
        raise ValueError(f"not a UniProt accession: {uniprot!r}")
    path = CACHE / "afdb" / f"{uniprot}.pdb"
    if not path.is_file():
        entry = json.loads(_get(f"https://alphafold.ebi.ac.uk/api/prediction/{uniprot}"))[0]
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(_get(entry["pdbUrl"]))
    return path.read_text(encoding="utf-8")


def molecules(folder: str | Path = ".") -> list[tuple[str, object]]:
    """Every molecule in the input files beside the script, as (name, RDKit Mol), in file order:
    .smi / .txt (one "SMILES [name]" per line; # starts a comment), .csv (a column called smiles, and a name
    column if there is one) and .sdf. Lines that are not valid SMILES are skipped with a warning."""
    import csv

    from rdkit import Chem, RDLogger

    RDLogger.DisableLog("rdApp.*")
    out: list[tuple[str, object]] = []
    for path in sorted(Path(folder).iterdir()):
        suffix = path.suffix.lower()
        if suffix in (".smi", ".txt"):
            rows = []
            for k, line in enumerate(path.read_text(encoding="utf-8").splitlines(), 1):
                line = line.split("#", 1)[0].strip()
                if line:
                    smi, _, name = line.partition(" ")
                    rows.append((name.strip() or f"{path.stem} {k}", smi))
        elif suffix == ".csv":
            reader = csv.DictReader(path.read_text(encoding="utf-8").splitlines())
            cols = {c.lower().strip(): c for c in reader.fieldnames or []}
            if "smiles" not in cols:
                print(f"{path.name}: no 'smiles' column, skipped")
                continue
            name_col = cols.get("name") or cols.get("id")
            rows = [((r.get(name_col) or "").strip() if name_col else "", r[cols["smiles"]]) for r in reader]
            rows = [(n or f"{path.stem} {k}", s) for k, (n, s) in enumerate(rows, 1)]
        elif suffix == ".sdf":
            for k, mol in enumerate(Chem.SDMolSupplier(str(path)), 1):
                if mol is not None:
                    out.append((mol.GetProp("_Name") or f"{path.stem} {k}", mol))
            continue
        else:
            continue
        for name, smi in rows:
            mol = Chem.MolFromSmiles(smi.strip())
            if mol is None:
                print(f"{path.name}: {name}: not a valid SMILES string ({smi!r}), skipped")
            else:
                out.append((name, mol))
    return out


def fetch_smiles(cid: int) -> str:
    """The SMILES of a PubChem compound (by its CID)."""
    url = f"https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/{int(cid)}/property/SMILES/JSON"
    return json.loads(_cached(f"pubchem/{int(cid)}.json", url))["PropertyTable"]["Properties"][0]["SMILES"]
