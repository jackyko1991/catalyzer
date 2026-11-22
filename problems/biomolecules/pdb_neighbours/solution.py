import numpy as np

# One atom: (chain, residue number, residue name, atom name, x, y, z)
Atom = tuple[str, int, str, str, float, float, float]


def read_atoms(pdb_text: str) -> list[Atom]:
    """The ATOM and HETATM records of a PDB file, in file order.

    The first atom of 1CRN is ("A", 1, "THR", "N", 17.047, 14.099, 3.625).
    """
    atoms = []
    for line in pdb_text.splitlines():
        if not line.startswith(("ATOM  ", "HETATM")):
            continue
        atoms.append(
            (
                line[21],
                int(line[22:26]),
                line[17:20].strip(),
                line[12:16].strip(),
                float(line[30:38]),
                float(line[38:46]),
                float(line[46:54]),
            )
        )
    return atoms


def neighbours(pdb_text: str, chain: str, resnum: int, cutoff: float = 4.0) -> list[tuple[str, int]]:
    """The other residues, as (chain, residue number) sorted, with any atom within cutoff Å of any atom of the
    given residue."""
    atoms = read_atoms(pdb_text)
    xyz = np.array([a[4:] for a in atoms])
    keys = [(a[0], a[1]) for a in atoms]
    mine = np.array([k == (chain, resnum) for k in keys])
    d = np.linalg.norm(xyz[mine][:, None, :] - xyz[None, :, :], axis=-1)
    close = (d <= cutoff).any(axis=0)
    return sorted({k for k, c in zip(keys, close) if c and k != (chain, resnum)})
