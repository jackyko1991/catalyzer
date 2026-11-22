"""Public data for workspace code: download a structure or a molecule once, keep it on this computer.

    from data import fetch_pdb, fetch_alphafold, fetch_smiles
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


def fetch_smiles(cid: int) -> str:
    """The SMILES of a PubChem compound (by its CID)."""
    url = f"https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/{int(cid)}/property/SMILES/JSON"
    return json.loads(_cached(f"pubchem/{int(cid)}.json", url))["PropertyTable"]["Properties"][0]["SMILES"]
