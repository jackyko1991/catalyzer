from rdkit import Chem


def molecular_formula(smiles: str) -> dict[str, int]:
    """Count the atoms of each element in the molecule, hydrogens included.

    molecular_formula("CCO") == {"C": 2, "H": 6, "O": 1}
    Raise ValueError if the string is not valid SMILES.
    """
    mol = Chem.MolFromSmiles(smiles)
    if mol is None:
        raise ValueError(f"not a valid SMILES string: {smiles!r}")
    counts: dict[str, int] = {}
    for atom in mol.GetAtoms():
        counts[atom.GetSymbol()] = counts.get(atom.GetSymbol(), 0) + 1
        h = atom.GetTotalNumHs()
        if h:
            counts["H"] = counts.get("H", 0) + h
    return counts
