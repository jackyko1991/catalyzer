"""The contract for fluorophore. Read-only: your answer.py must make these pass.

The measured absorption maxima come from data/dyes.csv (every value cited in data/SOURCE.md).
"""

import csv
from pathlib import Path

import pytest
from rdkit import RDLogger

from answer import BOND, chain_length, fit_alpha, lambda_max

RDLogger.DisableLog("rdApp.*")

DYES = list(csv.DictReader((Path(__file__).parent / "data" / "dyes.csv").read_text(encoding="utf-8").splitlines()))
CY3 = next(d for d in DYES if d["name"] == "Cy3")
CY5 = next(d for d in DYES if d["name"] == "Cy5")


def test_chain_length_of_every_dye():
    """P is the number of carbons between the two nitrogens: 3, 5, 7 … as the dye's name says."""
    for dye in DYES:
        assert chain_length(dye["smiles"]) == int(dye["p"]), dye["name"]


def test_cy5_chain_is_one_vinylene_longer_than_cy3():
    assert chain_length(CY5["smiles"]) - chain_length(CY3["smiles"]) == 2


def test_not_a_dye_raises():
    with pytest.raises(ValueError):
        chain_length("CCO")  # no nitrogen at all
    with pytest.raises(ValueError):
        chain_length("C1CC")  # not valid SMILES


def test_the_box_formula():
    # worked by hand for p = 9, alpha = 0: N = 12, L = 12 × 1.39 Å
    length = 12 * BOND
    want = 8 * 9.1093837015e-31 * 2.99792458e8 * length**2 / (6.62607015e-34 * 13) * 1e9
    assert lambda_max(9) == pytest.approx(want, rel=1e-9)
    assert lambda_max(9) == pytest.approx(705.7, abs=1.0)


def test_longer_chain_absorbs_further_to_the_red():
    lambdas = [lambda_max(p) for p in (3, 5, 7, 9, 11)]
    assert lambdas == sorted(lambdas)
    # each extra -CH=CH- adds at least 100 nm in this model
    assert all(b - a > 100 for a, b in zip(lambdas, lambdas[1:]))


def test_the_end_correction_makes_it_longer():
    assert lambda_max(5, alpha=1.0) > lambda_max(5, alpha=0.0)
    assert lambda_max(5, alpha=0.0) == pytest.approx(453.0, abs=1.0)


def test_quinoline_44_series_needs_almost_no_end_correction():
    """The one series the plain particle in a box already fits: alpha comes out near zero."""
    series = [d for d in DYES if d["series"] == "quinoline44"]
    alpha = fit_alpha([int(d["p"]) for d in series], [float(d["lambda_max_nm"]) for d in series])
    assert 0.0 <= alpha < 0.15
    for dye in series:
        assert lambda_max(int(dye["p"]), alpha) == pytest.approx(float(dye["lambda_max_nm"]), rel=0.05), dye["name"]


def test_the_thiacyanines_need_a_real_end_correction():
    """Their end rings lengthen the box: alpha is clearly above zero, and then the fit is good."""
    series = [d for d in DYES if d["series"] == "thia"]
    alpha = fit_alpha([int(d["p"]) for d in series], [float(d["lambda_max_nm"]) for d in series])
    assert 0.3 < alpha < 1.2
    for dye in series:
        assert lambda_max(int(dye["p"]), alpha) == pytest.approx(float(dye["lambda_max_nm"]), rel=0.12), dye["name"]


def test_a_fitted_series_beats_the_uncorrected_model():
    series = [d for d in DYES if d["series"] == "quinoline22"]
    p = [int(d["p"]) for d in series]
    measured = [float(d["lambda_max_nm"]) for d in series]
    alpha = fit_alpha(p, measured)
    worse = sum((lambda_max(x, 0.0) - m) ** 2 for x, m in zip(p, measured))
    better = sum((lambda_max(x, alpha) - m) ** 2 for x, m in zip(p, measured))
    assert better < worse / 4
