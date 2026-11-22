"""The contract for atoms_bonds. Read-only: your answer.py must make these pass."""

import pytest
from rdkit import RDLogger

from answer import bond_counts, degrees

RDLogger.DisableLog("rdApp.*")


def test_acetaldehyde():
    assert bond_counts("CC=O") == {"single": 1, "double": 1}
    assert degrees("CC=O") == [1, 2, 1]


def test_hydrogen_cyanide_triple_bond():
    assert bond_counts("C#N") == {"triple": 1}
    assert degrees("C#N") == [1, 1]


def test_benzene_bonds_are_aromatic():
    assert bond_counts("c1ccccc1") == {"aromatic": 6}
    assert degrees("c1ccccc1") == [2] * 6


def test_acetic_acid_branch():
    assert bond_counts("CC(=O)O") == {"single": 2, "double": 1}
    assert degrees("CC(=O)O") == [1, 3, 1, 1]


def test_single_atom_has_no_bonds():
    assert bond_counts("C") == {}
    assert degrees("C") == [0]


def test_handshake_sum_of_degrees_is_twice_the_bonds():
    for smi in ["CC(C)Cc1ccc(cc1)C(C)C(=O)O", "Cn1cnc2c1c(=O)n(C)c(=O)n2C", "C1CC2CCC1C2"]:
        assert sum(degrees(smi)) == 2 * sum(bond_counts(smi).values())


def test_invalid_smiles_raises():
    with pytest.raises(ValueError):
        bond_counts("C(C")
