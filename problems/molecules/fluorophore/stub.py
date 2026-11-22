import numpy as np
from rdkit import Chem

# Physical constants (SI) and the average bond length along a conjugated chain, 1.39 Å.
PLANCK = 6.62607015e-34
M_E = 9.1093837015e-31
C = 2.99792458e8
BOND = 1.39e-10


def chain_length(smiles: str) -> int:
    """P: the number of carbons on the shortest path between the dye's two nitrogens.

    Walk the molecule yourself (RDKit's GetShortestPath is not allowed here).
    chain_length("CCN1/C(=C/C2=[N+](C3=CC=CC=C3C=C2)CC)/C=CC4=CC=CC=C41") == 3
    Raise ValueError if the string is not valid SMILES or has fewer than two nitrogens.
    """
    raise NotImplementedError


def lambda_max(p: int, alpha: float = 0.0) -> float:
    """The absorption maximum in nanometres from the free-electron model (Kuhn):

    N = p + 3 electrons in a box of length L = (p + 3 + alpha) × BOND, and
    lambda = 8 m c L² / (h (N + 1)).
    """
    raise NotImplementedError


def fit_alpha(chain_lengths: list[int], measured_nm: list[float]) -> float:
    """The end correction alpha that best fits a series: the value (0 ≤ alpha ≤ 3) that makes the predicted
    wavelengths closest to the measured ones in the least-squares sense.

    Search alpha on a fine grid; 0.001 is close enough.
    """
    raise NotImplementedError
