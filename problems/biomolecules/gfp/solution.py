import numpy as np


def find_chromophore(pdb_text: str) -> tuple[str, int, str]:
    """The chromophore the protein made from its own residues, as (chain, residue number, residue name).

    A PDB file records it as a modified residue (a MODRES line). Selenomethionine (MSE) is a labelling trick
    used for solving the structure, not a chromophore, so skip it.
    find_chromophore(gfp) == ("A", 66, "CRO")
    Raise ValueError if the file has no such residue.
    """
    for line in pdb_text.splitlines():
        if line.startswith("MODRES") and line[12:15].strip() != "MSE":
            return line[16], int(line[18:22]), line[12:15].strip()
    raise ValueError("no modified residue in this file: it has no chromophore of its own")


def barrel_strands(pdb_text: str) -> int:
    """How many strands the file's largest beta sheet has: one SHEET line per strand, grouped by sheet id
    (columns 12-14). GFP's barrel has 11."""
    sheets: dict[str, int] = {}
    for line in pdb_text.splitlines():
        if line.startswith("SHEET"):
            sheets[line[11:14]] = sheets.get(line[11:14], 0) + 1
    return max(sheets.values(), default=0)


def _atoms(pdb_text: str) -> list[tuple[str, int, str, float, float, float]]:
    """(chain, residue number, residue name, x, y, z) for every atom, ignoring alternate positions after the first"""
    return [
        (line[21], int(line[22:26]), line[17:20].strip(), float(line[30:38]), float(line[38:46]), float(line[46:54]))
        for line in pdb_text.splitlines()
        if line.startswith(("ATOM  ", "HETATM")) and line[16] in " A"
    ]


def chromophore_pocket(pdb_text: str, cutoff: float = 5.0) -> list[tuple[int, str]]:
    """The residues of the same chain with any atom within cutoff Å of any chromophore atom, as
    (residue number, residue name), sorted. Water (HOH) and the chromophore itself are left out."""
    chain, resnum, resname = find_chromophore(pdb_text)
    atoms = _atoms(pdb_text)
    xyz = np.array([a[3:] for a in atoms])
    is_chromophore = np.array([a[0] == chain and a[1] == resnum and a[2] == resname for a in atoms])
    distances = np.linalg.norm(xyz[is_chromophore][:, None, :] - xyz[None, :, :], axis=-1)
    close = (distances <= cutoff).any(axis=0)
    found = {(a[1], a[2]) for a, near in zip(atoms, close) if near and a[0] == chain and a[2] not in (resname, "HOH")}
    return sorted(found)
