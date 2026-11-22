from rdkit import Chem
from rdkit.Chem import Crippen, Descriptors, Lipinski

# The four limits of the rule of five, in the order the answer lists broken limits.
LIMITS = {"MW": 500, "logP": 5, "HBD": 5, "HBA": 10}


def lipinski_violations(smiles: str) -> list[str]:
    """The names of the limits the molecule breaks (value strictly above the limit), in the order of LIMITS.

    Use Descriptors.MolWt, Crippen.MolLogP, Lipinski.NumHDonors and Lipinski.NumHAcceptors.
    lipinski_violations("CC(=O)Oc1ccccc1C(=O)O") == []   # aspirin
    Raise ValueError if the string is not valid SMILES.
    """
    raise NotImplementedError


def passes_rule_of_five(smiles: str) -> bool:
    """True when the molecule breaks at most one limit."""
    raise NotImplementedError
