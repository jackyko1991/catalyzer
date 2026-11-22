import math


def off_rate(half_life_s: float) -> float:
    """k_off (per second) from the dwell time: the complex falls apart with a half-life.

    off_rate(3.0) ≈ 0.231
    Raise ValueError if the half-life is not positive.
    """
    if half_life_s <= 0:
        raise ValueError("a dwell time is a positive number of seconds")
    return math.log(2) / half_life_s


def on_rate(k_off: float, kd_micromolar: float) -> float:
    """k_on (per molar per second) from k_off and K_D, with K_D given in micromolar.

    The published G50A receptor has k_off = 0.069 s⁻¹ and K_D = 4.62 µM, so k_on ≈ 1.49e4.
    """
    if kd_micromolar <= 0:
        raise ValueError("K_D is a positive concentration")
    return k_off / (kd_micromolar * 1e-6)


def signal_fraction(k_off: float, k_p: float = 1.0, steps: int = 3) -> float:
    """Kinetic proofreading: the share of bound receptors that survive N steps of rate k_p before signalling,

        fraction = (1 + k_off / k_p) ** (-steps)

    With steps = 0 every bound receptor signals at once (fraction 1).
    """
    if k_p <= 0 or steps < 0:
        raise ValueError("k_p is positive and the number of steps is not negative")
    return (1 + k_off / k_p) ** (-steps)
