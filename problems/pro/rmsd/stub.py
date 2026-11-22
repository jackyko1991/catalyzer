import numpy as np


def kabsch_rmsd(P: np.ndarray, Q: np.ndarray) -> float:
    """The RMSD between two (N, 3) arrays of matching points after the best rotation and translation of P onto Q.

    Raise ValueError if the shapes differ or are not (N, 3).
    """
    raise NotImplementedError


def ca_rmsd(model_pdb: str, experiment_pdb: str) -> float:
    """The Kabsch RMSD of the alpha carbons (CA) of chain A, paired by residue number, over the residues present
    in both files."""
    raise NotImplementedError
