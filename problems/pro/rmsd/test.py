"""The contract for rmsd. Read-only: your answer.py must make these pass."""

from pathlib import Path

import numpy as np
import pytest
from Bio.PDB import PDBParser
from Bio.SVDSuperimposer import SVDSuperimposer

from answer import ca_rmsd, kabsch_rmsd

DATA = Path(__file__).parent / "data"
MODEL = (DATA / "AF-P01542-F1-model_v6.pdb").read_text()
CRYSTAL = (DATA / "1crn.pdb").read_text()


def _rotation(rng):
    q = rng.normal(size=4)
    a, b, c, d = q / np.linalg.norm(q)
    return np.array(
        [
            [a * a + b * b - c * c - d * d, 2 * (b * c - a * d), 2 * (b * d + a * c)],
            [2 * (b * c + a * d), a * a - b * b + c * c - d * d, 2 * (c * d - a * b)],
            [2 * (b * d - a * c), 2 * (c * d + a * b), a * a - b * b - c * c + d * d],
        ]
    )


def test_same_points_moved_and_turned_have_zero_rmsd():
    rng = np.random.default_rng(0)
    P = rng.normal(size=(20, 3)) * 5
    Q = P @ _rotation(rng).T + np.array([3.0, -7.0, 12.0])
    assert kabsch_rmsd(P, Q) == pytest.approx(0.0, abs=1e-9)


def test_a_mirror_image_is_not_the_same():
    # a chiral set of points and its mirror image cannot be superposed by a rotation
    P = np.array([[0, 0, 0], [1, 0, 0], [0, 1, 0], [0, 0, 1], [1, 1, 1.5]], dtype=float)
    assert kabsch_rmsd(P, P * np.array([1, 1, -1])) > 0.1


@pytest.mark.parametrize("seed", range(4))
def test_agrees_with_biopython(seed):
    rng = np.random.default_rng(seed)
    P = rng.normal(size=(15, 3)) * 4
    Q = P @ _rotation(rng).T + rng.normal(size=(15, 3))
    sup = SVDSuperimposer()
    sup.set(Q, P)
    sup.run()
    assert kabsch_rmsd(P, Q) == pytest.approx(sup.get_rms(), abs=1e-9)


def test_shapes_checked():
    with pytest.raises(ValueError):
        kabsch_rmsd(np.zeros((4, 3)), np.zeros((5, 3)))
    with pytest.raises(ValueError):
        kabsch_rmsd(np.zeros((4, 2)), np.zeros((4, 2)))


def test_alphafold_vs_crystal():
    parser = PDBParser(QUIET=True)
    m = parser.get_structure("m", DATA / "AF-P01542-F1-model_v6.pdb")[0]["A"]
    x = parser.get_structure("x", DATA / "1crn.pdb")[0]["A"]
    common = sorted({r.id[1] for r in m} & {r.id[1] for r in x})
    sup = SVDSuperimposer()
    sup.set(np.array([x[i]["CA"].coord for i in common], float), np.array([m[i]["CA"].coord for i in common], float))
    sup.run()
    got = ca_rmsd(MODEL, CRYSTAL)
    assert got == pytest.approx(sup.get_rms(), abs=1e-3)
    assert got < 1.0  # crambin is predicted to well under an ångström
