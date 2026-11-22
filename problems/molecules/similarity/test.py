"""The contract for similarity. Read-only: your answer.py must make these pass."""

import pytest
from rdkit import Chem, DataStructs, RDLogger
from rdkit.Chem import rdFingerprintGenerator

from answer import morgan_bits, most_similar, tanimoto

RDLogger.DisableLog("rdApp.*")

ASPIRIN = "CC(=O)Oc1ccccc1C(=O)O"
SALICYLIC_ACID = "OC(=O)c1ccccc1O"
CAFFEINE = "Cn1cnc2c1c(=O)n(C)c(=O)n2C"
THEOPHYLLINE = "Cn1c2nc[nH]c2c(=O)n(C)c1=O"
IBUPROFEN = "CC(C)Cc1ccc(cc1)C(C)C(=O)O"


def test_tanimoto_by_hand():
    assert tanimoto({1, 2, 3}, {2, 3, 4}) == pytest.approx(2 / 4)
    assert tanimoto({1}, {1}) == 1.0
    assert tanimoto({1}, {2}) == 0.0
    assert tanimoto(set(), set()) == 0.0


def test_fingerprint_matches_rdkit():
    mol = Chem.MolFromSmiles(CAFFEINE)
    fp = rdFingerprintGenerator.GetMorganGenerator(radius=2, fpSize=2048).GetFingerprint(mol)
    assert morgan_bits(CAFFEINE) == set(fp.GetOnBits())


def test_radius_and_size_are_used():
    # radius 0 sees single atoms only, so it finds fewer distinct neighbourhoods than radius 2
    assert len(morgan_bits(CAFFEINE, radius=0)) < len(morgan_bits(CAFFEINE, radius=2))
    assert max(morgan_bits(IBUPROFEN, n_bits=64)) < 64


@pytest.mark.parametrize("a, b", [(ASPIRIN, SALICYLIC_ACID), (CAFFEINE, THEOPHYLLINE), (ASPIRIN, IBUPROFEN)])
def test_tanimoto_agrees_with_rdkit(a, b):
    gen = rdFingerprintGenerator.GetMorganGenerator(radius=2, fpSize=2048)
    want = DataStructs.TanimotoSimilarity(
        gen.GetFingerprint(Chem.MolFromSmiles(a)), gen.GetFingerprint(Chem.MolFromSmiles(b))
    )
    assert tanimoto(morgan_bits(a), morgan_bits(b)) == pytest.approx(want)


def test_most_similar_finds_the_relative():
    library = [IBUPROFEN, THEOPHYLLINE, SALICYLIC_ACID]
    assert most_similar(CAFFEINE, library) == THEOPHYLLINE
    assert most_similar(ASPIRIN, library) == SALICYLIC_ACID
