"""The contract for translate. Read-only: your answer.py must make these pass."""

import random
import warnings

import pytest
from Bio import BiopythonWarning
from Bio.Seq import Seq

from answer import reverse_complement, translate

# Human insulin's coding sequence starts like this (the signal peptide MALWMRLLPLLALLALWGPDPAAA...)
INSULIN_START = "ATGGCCCTGTGGATGCGCCTCCTGCCCCTGCTGGCGCTGCTGGCCCTCTGGGGACCTGACCCAGCCGCAGCC"


def test_small_examples():
    assert reverse_complement("ATGC") == "GCAT"
    assert translate("ATGGCCTAA") == "MA"


def test_insulin_signal_peptide():
    assert translate(INSULIN_START) == "MALWMRLLPLLALLALWGPDPAAA"


def test_trailing_bases_are_ignored():
    assert translate("ATGGC") == "M"


def test_reverse_complement_twice_is_the_original():
    assert reverse_complement(reverse_complement(INSULIN_START)) == INSULIN_START


def test_not_dna_raises():
    with pytest.raises(ValueError):
        translate("ATGXYZ")
    with pytest.raises(ValueError):
        translate("AUGGCC")  # U is RNA


@pytest.mark.parametrize("seed", range(5))
def test_agrees_with_biopython(seed):
    rng = random.Random(seed)
    dna = "".join(rng.choice("ACGT") for _ in range(3 * rng.randint(5, 60) + rng.randint(0, 2)))
    with warnings.catch_warnings():
        warnings.simplefilter("ignore", BiopythonWarning)  # "partial codon" when the length is not a multiple of 3
        assert translate(dna) == str(Seq(dna).translate(to_stop=True))
    assert reverse_complement(dna) == str(Seq(dna).reverse_complement())
