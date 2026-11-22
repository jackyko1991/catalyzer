from rdkit import Chem


def _read(smiles: str) -> Chem.Mol:
    mol = Chem.MolFromSmiles(smiles)
    if mol is None:
        raise ValueError(f"not a valid SMILES string: {smiles!r}")
    return mol


def bond_counts(smiles: str) -> dict[str, int]:
    """Count the bonds between written atoms by type: keys among "single", "double", "triple", "aromatic".

    bond_counts("CC=O") == {"single": 1, "double": 1}
    Raise ValueError if the string is not valid SMILES.
    """
    mol = _read(smiles)
    counts: dict[str, int] = {}
    for bond in mol.GetBonds():
        kind = str(bond.GetBondType()).lower()
        counts[kind] = counts.get(kind, 0) + 1
    return counts


def degrees(smiles: str) -> list[int]:
    """For each written atom, in order, the number of written atoms bonded to it.

    degrees("CC=O") == [1, 2, 1]
    """
    mol = _read(smiles)
    degree = [0] * mol.GetNumAtoms()
    for bond in mol.GetBonds():
        degree[bond.GetBeginAtomIdx()] += 1
        degree[bond.GetEndAtomIdx()] += 1
    return degree
