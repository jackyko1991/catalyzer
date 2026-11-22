"""The contract for receptor_kinetics. Read-only: your answer.py must make these pass.

Every measured number comes from data/variants.csv, cited in data/SOURCE.md.
"""

import csv
from pathlib import Path

import pytest

from answer import off_rate, on_rate, signal_fraction

VARIANTS = {
    row["name"]: row
    for row in csv.DictReader(
        (Path(__file__).parent / "data" / "variants.csv").read_text(encoding="utf-8").splitlines()
    )
}


def test_dwell_time_to_off_rate():
    assert off_rate(3.0) == pytest.approx(0.2310, abs=1e-4)
    assert off_rate(553.0) == pytest.approx(0.001254, abs=1e-6)
    # ten times the dwell time is a tenth of the off-rate
    assert off_rate(30.0) == pytest.approx(off_rate(3.0) / 10)


def test_a_dwell_time_must_be_positive():
    with pytest.raises(ValueError):
        off_rate(0)
    with pytest.raises(ValueError):
        off_rate(-1)


def test_on_rate_reproduces_the_published_value():
    """G50A is the variant whose k_on and k_off were both published: 1.49e4 M⁻¹s⁻¹."""
    g50a = VARIANTS["G50A"]
    k_off, kd = float(g50a["k_off_published"]), float(g50a["kd_um"])
    assert on_rate(k_off, kd) == pytest.approx(float(g50a["k_on_published"]), rel=0.01)


def test_on_rates_of_this_family_are_all_about_the_same():
    """Engineering changed how long these receptors hold on, far more than how fast they find the target."""
    rates = [
        on_rate(off_rate(float(v["half_life_s"])), float(v["kd_um"])) for v in VARIANTS.values() if v["half_life_s"]
    ]
    assert len(rates) == 3
    assert all(8e3 < r < 1e5 for r in rates)
    assert max(rates) / min(rates) < 10  # within one order of magnitude …
    slowest = off_rate(float(VARIANTS["wild type"]["half_life_s"]))
    fastest = off_rate(float(VARIANTS["wtc51m"]["half_life_s"]))
    assert slowest / fastest > 100  # … while the off-rates differ by more than a hundredfold


def test_proofreading_rewards_holding_on():
    """Ten times slower release gives much more than ten times the signal: that is the discrimination."""
    slow, fast = signal_fraction(0.02), signal_fraction(0.2)
    assert slow / fast > 1.5
    assert signal_fraction(0.0) == 1.0
    assert signal_fraction(1.0, steps=0) == 1.0
    assert 0 < signal_fraction(10.0) < 0.01


def test_more_steps_discriminate_more_sharply():
    ratios = [signal_fraction(0.02, steps=n) / signal_fraction(0.2, steps=n) for n in (1, 3, 6)]
    assert ratios == sorted(ratios)


def test_the_model_says_tighter_is_always_better():
    """It is monotonic in affinity — and that is exactly where it stops agreeing with the experiment.

    Measured killing by these receptors peaks at the middle of the ladder (DMβ, TMβ; Hebeisen 2022), while the
    model below keeps rising all the way to the tightest receptor. The notes say why.
    """
    ladder = ["wild type", "DMb", "wtc51m"]
    k_offs = [off_rate(float(VARIANTS[name]["half_life_s"])) for name in ladder]
    predicted = [signal_fraction(k) for k in k_offs]
    assert predicted == sorted(predicted)
    assert predicted[-1] > 0.99  # the supraphysiologic receptor: every bound receptor signals
