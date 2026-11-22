from rdkit import Chem


def bond_counts(smiles: str) -> dict[str, int]:
    """Count the bonds between written atoms by type: keys among "single", "double", "triple", "aromatic".

    bond_counts("CC=O") == {"single": 1, "double": 1}
    Raise ValueError if the string is not valid SMILES.
    """
    raise NotImplementedError


def degrees(smiles: str) -> list[int]:
    """For each written atom, in order, the number of written atoms bonded to it.

    degrees("CC=O") == [1, 2, 1]
    """
    raise NotImplementedError
