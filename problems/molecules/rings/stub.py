from rdkit import Chem


def ring_info(smiles: str) -> dict:
    """{"ring_sizes": sizes of the smallest set of smallest rings, ascending, "aromatic_rings": how many are aromatic}

    ring_info("c1ccc2ccccc2c1") == {"ring_sizes": [6, 6], "aromatic_rings": 2}   # naphthalene
    Raise ValueError if the string is not valid SMILES.
    """
    raise NotImplementedError
