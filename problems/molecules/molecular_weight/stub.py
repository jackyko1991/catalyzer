from rdkit import Chem


def molecular_weight(smiles: str) -> float:
    """The average molecular weight in g/mol, hydrogens included.

    molecular_weight("O") ≈ 18.015
    Raise ValueError if the string is not valid SMILES.
    """
    raise NotImplementedError
