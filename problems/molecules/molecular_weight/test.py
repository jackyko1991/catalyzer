"""The contract for molecular_weight. Read-only: your answer.py must make these pass."""

import pytest
from rdkit import Chem, RDLogger
from rdkit.Chem import Descriptors

from answer import molecular_weight

RDLogger.DisableLog("rdApp.*")


def test_water():
    assert molecular_weight("O") == pytest.approx(18.015, abs=1e-3)


def test_ethanol():
    assert molecular_weight("CCO") == pytest.approx(46.069, abs=1e-3)


@pytest.mark.parametrize(
    "smiles",
    [
        "c1ccccc1",
        "CC(=O)Oc1ccccc1C(=O)O",  # aspirin
        "Cn1cnc2c1c(=O)n(C)c(=O)n2C",  # caffeine
        "[NH4+]",
        "OC(=O)C(F)(F)F",  # trifluoroacetic acid
        "CC(C)Cc1ccc(cc1)C(C)C(=O)O",  # ibuprofen
        "[Na+].[Cl-]",
    ],
)
def test_agrees_with_rdkit(smiles):
    assert molecular_weight(smiles) == pytest.approx(Descriptors.MolWt(Chem.MolFromSmiles(smiles)), abs=1e-6)


def test_invalid_smiles_raises():
    with pytest.raises(ValueError):
        molecular_weight("not a molecule")
