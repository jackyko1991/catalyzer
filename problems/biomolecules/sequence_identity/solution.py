def percent_identity(a: str, b: str) -> float:
    """Percent identity of two aligned sequences of equal length ("-" is a gap):
    100 × identical columns / columns where neither sequence has a gap (0.0 if there are none).

    percent_identity("MK-LV", "MKALI") == 75.0
    Raise ValueError if the lengths differ.
    """
    if len(a) != len(b):
        raise ValueError("aligned sequences must have the same length")
    both = [(x, y) for x, y in zip(a, b) if x != "-" and y != "-"]
    return 100.0 * sum(x == y for x, y in both) / len(both) if both else 0.0


def needleman_wunsch(a: str, b: str, match: int = 1, mismatch: int = -1, gap: int = -2) -> int:
    """The score of the best global alignment of a and b (linear gap penalty)."""
    n, m = len(a), len(b)
    F = [[0] * (m + 1) for _ in range(n + 1)]
    for i in range(1, n + 1):
        F[i][0] = i * gap
    for j in range(1, m + 1):
        F[0][j] = j * gap
    for i in range(1, n + 1):
        for j in range(1, m + 1):
            diag = F[i - 1][j - 1] + (match if a[i - 1] == b[j - 1] else mismatch)
            F[i][j] = max(diag, F[i - 1][j] + gap, F[i][j - 1] + gap)
    return F[n][m]
