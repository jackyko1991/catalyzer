from rdkit import Chem


def ring_info(smiles: str) -> dict:
    """{"ring_sizes": sizes of the smallest set of smallest rings, ascending, "aromatic_rings": how many are aromatic}

    ring_info("c1ccc2ccccc2c1") == {"ring_sizes": [6, 6], "aromatic_rings": 2}   # naphthalene
    Raise ValueError if the string is not valid SMILES.
    """
    mol = Chem.MolFromSmiles(smiles)
    if mol is None:
        raise ValueError(f"not a valid SMILES string: {smiles!r}")
    rings = mol.GetRingInfo().BondRings()
    sizes = sorted(len(ring) for ring in rings)
    aromatic = sum(all(mol.GetBondWithIdx(i).GetIsAromatic() for i in ring) for ring in rings)
    return {"ring_sizes": sizes, "aromatic_rings": aromatic}
