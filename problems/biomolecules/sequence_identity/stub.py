def percent_identity(a: str, b: str) -> float:
    """Percent identity of two aligned sequences of equal length ("-" is a gap):
    100 × identical columns / columns where neither sequence has a gap (0.0 if there are none).

    percent_identity("MK-LV", "MKALI") == 75.0
    Raise ValueError if the lengths differ.
    """
    raise NotImplementedError


def needleman_wunsch(a: str, b: str, match: int = 1, mismatch: int = -1, gap: int = -2) -> int:
    """The score of the best global alignment of a and b (linear gap penalty)."""
    raise NotImplementedError
