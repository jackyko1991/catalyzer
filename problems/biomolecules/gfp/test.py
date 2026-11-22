"""The contract for gfp. Read-only: your answer.py must make these pass."""

from pathlib import Path

import pytest

from answer import barrel_strands, chromophore_pocket, find_chromophore

DATA = Path(__file__).parent / "data"
GFP = (DATA / "1ema.pdb").read_text()
MCHERRY = (DATA / "2h5q.pdb").read_text()


def test_the_chromophore_of_gfp():
    """GFP's chromophore is one fused residue, CRO 66, made from three of the protein's own residues."""
    assert find_chromophore(GFP) == ("A", 66, "CRO")


def test_the_chromophore_of_mcherry():
    """mCherry makes a different one, CH6, at the same place in the chain."""
    assert find_chromophore(MCHERRY) == ("A", 66, "CH6")


def test_selenomethionine_is_not_a_chromophore():
    """1EMA also has MSE residues (a trick for solving the structure); they must not be mistaken for it."""
    assert "MODRES 1EMA MSE" in GFP
    assert find_chromophore(GFP)[2] != "MSE"


def test_a_file_without_one_raises():
    with pytest.raises(ValueError):
        find_chromophore("ATOM      1  N   MET A   1      11.104   6.134  -6.504  1.00  0.00           N\n")


def test_the_barrel_has_eleven_strands():
    assert barrel_strands(GFP) == 11
    assert barrel_strands(MCHERRY) >= 11  # the same fold; this file lists a few more strands in its sheet
    assert barrel_strands("") == 0


def test_the_pocket_holds_the_residues_that_tune_the_colour():
    pocket = chromophore_pocket(GFP)
    assert (96, "ARG") in pocket and (222, "GLU") in pocket  # the pair that keeps the chromophore charged
    assert (148, "HIS") in pocket and (203, "THR") in pocket  # S65T's neighbours, which set the colour
    assert len(pocket) == 26


def test_the_chromophore_itself_and_water_are_left_out():
    pocket = chromophore_pocket(GFP)
    assert not any(name in ("CRO", "HOH") for _, name in pocket)
    assert (66, "CRO") not in pocket


def test_a_wider_cutoff_finds_more():
    small = chromophore_pocket(GFP, 4.0)
    big = chromophore_pocket(GFP, 6.0)
    assert set(small) < set(big)
    assert len(chromophore_pocket(MCHERRY, 5.0)) > 10


def test_the_chromophore_is_buried():
    """Every side of it touches the protein: the barrel wraps it, which is why it glows."""
    pocket = chromophore_pocket(GFP, 6.0)
    assert len(pocket) >= 30
    assert max(n for n, _ in pocket) - min(n for n, _ in pocket) > 150  # residues from all along the chain
