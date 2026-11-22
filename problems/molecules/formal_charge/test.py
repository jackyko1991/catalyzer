"""The contract for formal_charge. Read-only: your answer.py must make these pass."""

import pytest
from rdkit import Chem

from answer import formal_charge, total_charge


def test_ammonium_nitrogen():
    assert formal_charge("N", 0, 8) == 1


def test_water_oxygen_is_neutral():
    assert formal_charge("O", 4, 4) == 0


def test_carbon_monoxide():
    # :C≡O: — each atom has one lone pair and a triple bond (6 bonding electrons)
    assert formal_charge("C", 2, 6) == -1
    assert formal_charge("O", 2, 6) == 1


def test_hydroxide():
    assert total_charge([("O", 6, 2), ("H", 0, 2)]) == -1


def test_nitromethane_is_neutral_overall():
    # CH3-NO2: N has four bonds (one double), one O is double-bonded, the other single-bonded with 3 lone pairs
    atoms = [("C", 0, 8), ("H", 0, 2), ("H", 0, 2), ("H", 0, 2), ("N", 0, 8), ("O", 4, 4), ("O", 6, 2)]
    assert [formal_charge(*a) for a in atoms][4:] == [1, 0, -1]
    assert total_charge(atoms) == 0


def test_agrees_with_rdkit_charges():
    # RDKit reads the charges written in SMILES; the Lewis bookkeeping must give the same numbers
    mol = Chem.MolFromSmiles("C[N+](=O)[O-]")
    assert [a.GetFormalCharge() for a in mol.GetAtoms()] == [0, 1, 0, -1]
    assert [formal_charge("C", 0, 8), formal_charge("N", 0, 8), formal_charge("O", 4, 4), formal_charge("O", 6, 2)] == [
        0,
        1,
        0,
        -1,
    ]


def test_odd_bonding_electrons_rejected():
    with pytest.raises(ValueError):
        formal_charge("C", 0, 7)
