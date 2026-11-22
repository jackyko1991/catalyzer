"""The contract for lipinski. Read-only: your answer.py must make these pass."""

import pytest
from rdkit import RDLogger

from answer import lipinski_violations, passes_rule_of_five

RDLogger.DisableLog("rdApp.*")

ASPIRIN = "CC(=O)Oc1ccccc1C(=O)O"
CAFFEINE = "Cn1cnc2c1c(=O)n(C)c(=O)n2C"
# a long alkane: light enough, but very oily (logP far above 5)
TRIACONTANE = "C" * 30
# a hexapeptide of serines: many N-H and O-H donors and many acceptors
SER6 = "N[C@@H](CO)C(=O)N[C@@H](CO)C(=O)N[C@@H](CO)C(=O)N[C@@H](CO)C(=O)N[C@@H](CO)C(=O)N[C@@H](CO)C(=O)O"


def test_aspirin_breaks_nothing():
    assert lipinski_violations(ASPIRIN) == []
    assert passes_rule_of_five(ASPIRIN)


def test_caffeine_breaks_nothing():
    assert lipinski_violations(CAFFEINE) == []


def test_one_broken_limit_still_passes():
    assert lipinski_violations(TRIACONTANE) == ["logP"]
    assert passes_rule_of_five(TRIACONTANE)


def test_peptide_breaks_several_in_order():
    v = lipinski_violations(SER6)
    assert v == ["MW", "HBD", "HBA"]
    assert not passes_rule_of_five(SER6)


def test_invalid_smiles_raises():
    with pytest.raises(ValueError):
        lipinski_violations("C(")
