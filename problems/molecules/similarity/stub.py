from rdkit import Chem
from rdkit.Chem import rdFingerprintGenerator


def morgan_bits(smiles: str, radius: int = 2, n_bits: int = 2048) -> set[int]:
    """The positions switched on in the molecule's Morgan fingerprint (rdFingerprintGenerator.GetMorganGenerator).

    Raise ValueError if the string is not valid SMILES.
    """
    raise NotImplementedError


def tanimoto(a: set[int], b: set[int]) -> float:
    """|a ∩ b| / |a ∪ b|, and 0.0 when both sets are empty."""
    raise NotImplementedError


def most_similar(query: str, library: list[str]) -> str:
    """The SMILES in library whose Morgan fingerprint is most similar (Tanimoto) to the query's."""
    raise NotImplementedError
