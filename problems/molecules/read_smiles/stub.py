from rdkit import Chem


def molecular_formula(smiles: str) -> dict[str, int]:
    """Count the atoms of each element in the molecule, hydrogens included.

    molecular_formula("CCO") == {"C": 2, "H": 6, "O": 1}
    Raise ValueError if the string is not valid SMILES.
    """
    raise NotImplementedError
