import numpy as np


def find_chromophore(pdb_text: str) -> tuple[str, int, str]:
    """The chromophore the protein made from its own residues, as (chain, residue number, residue name).

    A PDB file records it as a modified residue (a MODRES line). Selenomethionine (MSE) is a labelling trick
    used for solving the structure, not a chromophore, so skip it.
    find_chromophore(gfp) == ("A", 66, "CRO")
    Raise ValueError if the file has no such residue.
    """
    raise NotImplementedError


def barrel_strands(pdb_text: str) -> int:
    """How many strands the file's largest beta sheet has: one SHEET line per strand, grouped by sheet id
    (columns 12-14). GFP's barrel has 11."""
    raise NotImplementedError


def chromophore_pocket(pdb_text: str, cutoff: float = 5.0) -> list[tuple[int, str]]:
    """The residues of the same chain with any atom within cutoff Å of any chromophore atom, as
    (residue number, residue name), sorted. Water (HOH) and the chromophore itself are left out."""
    raise NotImplementedError
