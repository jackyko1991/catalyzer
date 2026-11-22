"""The contract for rings. Read-only: your answer.py must make these pass."""

import pytest
from rdkit import RDLogger

from answer import ring_info

RDLogger.DisableLog("rdApp.*")


@pytest.mark.parametrize(
    "name, smiles, sizes, aromatic",
    [
        ("ethanol (no ring)", "CCO", [], 0),
        ("benzene", "c1ccccc1", [6], 1),
        ("benzene written with alternating bonds", "C1=CC=CC=C1", [6], 1),
        ("cyclohexane", "C1CCCCC1", [6], 0),
        ("naphthalene", "c1ccc2ccccc2c1", [6, 6], 2),
        ("indole", "c1ccc2[nH]ccc2c1", [5, 6], 2),
        ("cyclooctatetraene (8 π electrons: not aromatic)", "C1=CC=CC=CC=C1", [8], 0),
        ("cyclopropane", "C1CC1", [3], 0),
        ("aspirin", "CC(=O)Oc1ccccc1C(=O)O", [6], 1),
        ("ibuprofen", "CC(C)Cc1ccc(cc1)C(C)C(=O)O", [6], 1),
    ],
)
def test_rings(name, smiles, sizes, aromatic):
    assert ring_info(smiles) == {"ring_sizes": sizes, "aromatic_rings": aromatic}, name


def test_invalid_smiles_raises():
    with pytest.raises(ValueError):
        ring_info("c1cccc1x")
