import numpy as np

# One atom: (chain, residue number, residue name, atom name, x, y, z)
Atom = tuple[str, int, str, str, float, float, float]


def read_atoms(pdb_text: str) -> list[Atom]:
    """The ATOM and HETATM records of a PDB file, in file order.

    The first atom of 1CRN is ("A", 1, "THR", "N", 17.047, 14.099, 3.625).
    """
    raise NotImplementedError


def neighbours(pdb_text: str, chain: str, resnum: int, cutoff: float = 4.0) -> list[tuple[str, int]]:
    """The other residues, as (chain, residue number) sorted, with any atom within cutoff Å of any atom of the
    given residue."""
    raise NotImplementedError
