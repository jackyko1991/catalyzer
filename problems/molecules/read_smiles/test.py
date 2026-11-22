"""The contract for read_smiles. Read-only: your answer.py must make these pass."""

import pytest
from rdkit import Chem, RDLogger
from rdkit.Chem import rdMolDescriptors

from answer import molecular_formula

RDLogger.DisableLog("rdApp.*")  # invalid SMILES below would otherwise print warnings


def test_ethanol():
    assert molecular_formula("CCO") == {"C": 2, "H": 6, "O": 1}


def test_benzene_aromatic_lower_case():
    assert molecular_formula("c1ccccc1") == {"C": 6, "H": 6}


def test_hydrogens_in_brackets_count_too():
    assert molecular_formula("[NH4+]") == {"N": 1, "H": 4}


def test_no_hydrogens():
    assert molecular_formula("O=C=O") == {"C": 1, "O": 2}


def test_invalid_smiles_raises():
    with pytest.raises(ValueError):
        molecular_formula("C1CC")  # ring 1 is opened but never closed


@pytest.mark.parametrize(
    "smiles",
    [
        "Cn1cnc2c1c(=O)n(C)c(=O)n2C",  # caffeine
        "CC(=O)Oc1ccccc1C(=O)O",  # aspirin
        "CC(C)Cc1ccc(cc1)C(C)C(=O)O",  # ibuprofen
        "C[C@@H](C(=O)O)N",  # alanine
        "ClC(Cl)(Cl)Cl",  # carbon tetrachloride
    ],
)
def test_agrees_with_rdkit_formula(smiles):
    want: dict[str, int] = {}
    import re

    for el, n in re.findall(r"([A-Z][a-z]?)(\d*)", rdMolDescriptors.CalcMolFormula(Chem.MolFromSmiles(smiles))):
        want[el] = want.get(el, 0) + int(n or 1)
    assert molecular_formula(smiles) == want
