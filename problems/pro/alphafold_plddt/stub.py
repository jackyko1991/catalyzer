import numpy as np


def afdb_model_url(uniprot: str, version: int = 6) -> str:
    """The download address of the AlphaFold DB model (PDB format) for a UniProt accession.

    afdb_model_url("P01542") == "https://alphafold.ebi.ac.uk/files/AF-P01542-F1-model_v6.pdb"
    """
    raise NotImplementedError


def plddt_per_residue(pdb_text: str) -> list[float]:
    """The pLDDT of each residue, in order: the B-factor column (61-66) of its CA atom."""
    raise NotImplementedError


def confidence_bands(plddt: list[float]) -> dict[str, int]:
    """How many residues fall in each band: "very_high" (> 90), "confident" (> 70), "low" (> 50), "very_low".
    All four keys are always present."""
    raise NotImplementedError
