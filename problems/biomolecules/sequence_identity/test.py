"""The contract for sequence_identity. Read-only: your answer.py must make these pass."""

import random

import pytest
from Bio import Align

from answer import needleman_wunsch, percent_identity

# Human and horse haemoglobin alpha chains (UniProt P69905 and P01958, without the initial methionine)
HUMAN_HBA = "VLSPADKTNVKAAWGKVGAHAGEYGAEALERMFLSFPTTKTYFPHFDLSHGSAQVKGHGKKVADALTNAVAHVDDMPNALSALSDLHAHKLRVDPVNFKLLSHCLLVTLAAHLPAEFTPAVHASLDKFLASVSTVLTSKYR"
HORSE_HBA = "VLSAADKTNVKAAWSKVGGHAGEYGAEALERMFLGFPTTKTYFPHFDLSHGSAQVKAHGKKVGDALTLAVGHLDDLPGALSNLSDLHAHKLRVDPVNFKLLSHCLLSTLAVHLPNDFTPAVHASLDKFLSSVSTVLTSKYR"


def test_small_example():
    assert percent_identity("MK-LV", "MKALI") == 75.0


def test_identical_and_gaps_only():
    assert percent_identity("ACDE", "ACDE") == 100.0
    assert percent_identity("--", "AC") == 0.0


def test_unequal_lengths_raise():
    with pytest.raises(ValueError):
        percent_identity("ABC", "AB")


def test_human_vs_horse_haemoglobin_alpha():
    # same length, no gaps needed: 17 differences in 141 residues
    assert len(HUMAN_HBA) == len(HORSE_HBA) == 141
    assert percent_identity(HUMAN_HBA, HORSE_HBA) == pytest.approx(100 * 124 / 141)


def _biopython_score(a, b, match=1, mismatch=-1, gap=-2):
    aligner = Align.PairwiseAligner(mode="global", match_score=match, mismatch_score=mismatch)
    aligner.open_gap_score = aligner.extend_gap_score = gap
    return aligner.score(a, b)


def test_needleman_wunsch_small():
    assert needleman_wunsch("GATTACA", "GCATGCU") == _biopython_score("GATTACA", "GCATGCU")
    assert needleman_wunsch("", "ABC") == -6
    assert needleman_wunsch("ABC", "ABC") == 3


@pytest.mark.parametrize("seed", range(6))
def test_needleman_wunsch_agrees_with_biopython(seed):
    rng = random.Random(seed)
    a = "".join(rng.choice("ACDEFGHIKLMNPQRSTVWY") for _ in range(rng.randint(5, 40)))
    b = "".join(rng.choice("ACDEFGHIKLMNPQRSTVWY") for _ in range(rng.randint(5, 40)))
    scores = dict(match=rng.randint(1, 3), mismatch=-rng.randint(0, 2), gap=-rng.randint(1, 3))
    assert needleman_wunsch(a, b, **scores) == _biopython_score(a, b, **scores)
