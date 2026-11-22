from rdkit import Chem
from rdkit.Chem import rdFingerprintGenerator


def morgan_bits(smiles: str, radius: int = 2, n_bits: int = 2048) -> set[int]:
    """The positions switched on in the molecule's Morgan fingerprint (rdFingerprintGenerator.GetMorganGenerator).

    Raise ValueError if the string is not valid SMILES.
    """
    mol = Chem.MolFromSmiles(smiles)
    if mol is None:
        raise ValueError(f"not a valid SMILES string: {smiles!r}")
    gen = rdFingerprintGenerator.GetMorganGenerator(radius=radius, fpSize=n_bits)
    return set(gen.GetFingerprint(mol).GetOnBits())


def tanimoto(a: set[int], b: set[int]) -> float:
    """|a ∩ b| / |a ∪ b|, and 0.0 when both sets are empty."""
    union = a | b
    return len(a & b) / len(union) if union else 0.0


def most_similar(query: str, library: list[str]) -> str:
    """The SMILES in library whose Morgan fingerprint is most similar (Tanimoto) to the query's."""
    q = morgan_bits(query)
    return max(library, key=lambda smi: tanimoto(q, morgan_bits(smi)))
