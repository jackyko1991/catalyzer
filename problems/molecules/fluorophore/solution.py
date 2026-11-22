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
    mol = Chem.MolFromSmiles(smiles)
    if mol is None:
        raise ValueError(f"not a valid SMILES string: {smiles!r}")
    nitrogens = [a.GetIdx() for a in mol.GetAtoms() if a.GetSymbol() == "N"]
    if len(nitrogens) < 2:
        raise ValueError("a cyanine dye has two nitrogens")
    best: list[int] | None = None
    for start in nitrogens:
        # breadth-first search: the first time another nitrogen is reached is by a shortest path
        queue = [(start, [start])]
        seen = {start}
        while queue:
            here, path = queue.pop(0)
            if here != start and mol.GetAtomWithIdx(here).GetSymbol() == "N":
                if best is None or len(path) < len(best):
                    best = path
                break
            for neighbour in mol.GetAtomWithIdx(here).GetNeighbors():
                if neighbour.GetIdx() not in seen:
                    seen.add(neighbour.GetIdx())
                    queue.append((neighbour.GetIdx(), [*path, neighbour.GetIdx()]))
    if best is None:
        raise ValueError("the two nitrogens are not connected")
    return sum(mol.GetAtomWithIdx(i).GetSymbol() == "C" for i in best[1:-1])


def lambda_max(p: int, alpha: float = 0.0) -> float:
    """The absorption maximum in nanometres from the free-electron model (Kuhn):

    N = p + 3 electrons in a box of length L = (p + 3 + alpha) × BOND, and
    lambda = 8 m c L² / (h (N + 1)).
    """
    n_electrons = p + 3
    length = (p + 3 + alpha) * BOND
    lam = 8 * M_E * C * length**2 / (PLANCK * (n_electrons + 1))
    return lam * 1e9


def fit_alpha(chain_lengths: list[int], measured_nm: list[float]) -> float:
    """The end correction alpha that best fits a series: the value (0 ≤ alpha ≤ 3) that makes the predicted
    wavelengths closest to the measured ones in the least-squares sense.

    Search alpha on a fine grid; 0.001 is close enough.
    """
    grid = np.arange(0.0, 3.0005, 0.0005)
    error = [sum((lambda_max(p, a) - m) ** 2 for p, m in zip(chain_lengths, measured_nm)) for a in grid]
    return float(grid[int(np.argmin(error))])
