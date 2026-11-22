from rdkit import Chem


def molecular_weight(smiles: str) -> float:
    """The average molecular weight in g/mol, hydrogens included.

    molecular_weight("O") ≈ 18.015
    Raise ValueError if the string is not valid SMILES.
    """
    mol = Chem.MolFromSmiles(smiles)
    if mol is None:
        raise ValueError(f"not a valid SMILES string: {smiles!r}")
    table = Chem.GetPeriodicTable()
    h_mass = table.GetAtomicWeight("H")
    total = 0.0
    for atom in mol.GetAtoms():
        total += table.GetAtomicWeight(atom.GetSymbol())
        total += atom.GetTotalNumHs() * h_mass
    return total
