import numpy as np


def kabsch_rmsd(P: np.ndarray, Q: np.ndarray) -> float:
    """The RMSD between two (N, 3) arrays of matching points after the best rotation and translation of P onto Q.

    Raise ValueError if the shapes differ or are not (N, 3).
    """
    P = np.asarray(P, dtype=float)
    Q = np.asarray(Q, dtype=float)
    if P.shape != Q.shape or P.ndim != 2 or P.shape[1] != 3:
        raise ValueError("P and Q must both be (N, 3)")
    P = P - P.mean(axis=0)
    Q = Q - Q.mean(axis=0)
    U, S, Vt = np.linalg.svd(P.T @ Q)
    d = np.sign(np.linalg.det(U @ Vt))
    R = U @ np.diag([1.0, 1.0, d]) @ Vt
    return float(np.sqrt(((P @ R - Q) ** 2).sum(axis=1).mean()))


def _ca(pdb_text: str) -> dict[int, tuple[float, float, float]]:
    ca = {}
    for line in pdb_text.splitlines():
        if line.startswith("ATOM  ") and line[12:16].strip() == "CA" and line[21] == "A":
            ca[int(line[22:26])] = (float(line[30:38]), float(line[38:46]), float(line[46:54]))
    return ca


def ca_rmsd(model_pdb: str, experiment_pdb: str) -> float:
    """The Kabsch RMSD of the alpha carbons (CA) of chain A, paired by residue number, over the residues present
    in both files."""
    model, experiment = _ca(model_pdb), _ca(experiment_pdb)
    common = sorted(set(model) & set(experiment))
    return kabsch_rmsd(np.array([model[i] for i in common]), np.array([experiment[i] for i in common]))
