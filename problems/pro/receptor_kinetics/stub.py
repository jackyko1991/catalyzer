import math


def off_rate(half_life_s: float) -> float:
    """k_off (per second) from the dwell time: the complex falls apart with a half-life.

    off_rate(3.0) ≈ 0.231
    Raise ValueError if the half-life is not positive.
    """
    raise NotImplementedError


def on_rate(k_off: float, kd_micromolar: float) -> float:
    """k_on (per molar per second) from k_off and K_D, with K_D given in micromolar.

    The published G50A receptor has k_off = 0.069 s⁻¹ and K_D = 4.62 µM, so k_on ≈ 1.49e4.
    """
    raise NotImplementedError


def signal_fraction(k_off: float, k_p: float = 1.0, steps: int = 3) -> float:
    """Kinetic proofreading: the share of bound receptors that survive N steps of rate k_p before signalling,

        fraction = (1 + k_off / k_p) ** (-steps)

    With steps = 0 every bound receptor signals at once (fraction 1).
    """
    raise NotImplementedError
