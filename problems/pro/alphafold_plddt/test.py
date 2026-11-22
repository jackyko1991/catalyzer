"""The contract for alphafold_plddt. Read-only: your answer.py must make these pass."""

from pathlib import Path

import numpy as np
import pytest
from Bio.PDB import PDBParser

from answer import afdb_model_url, confidence_bands, plddt_per_residue

MODEL = Path(__file__).parent / "data" / "AF-P01542-F1-model_v6.pdb"
TEXT = MODEL.read_text()


def test_url():
    assert afdb_model_url("P01542") == "https://alphafold.ebi.ac.uk/files/AF-P01542-F1-model_v6.pdb"
    assert afdb_model_url("P69905", version=4) == "https://alphafold.ebi.ac.uk/files/AF-P69905-F1-model_v4.pdb"


def test_one_value_per_residue():
    p = plddt_per_residue(TEXT)
    assert len(p) == 46
    assert p[:3] == [89.94, 91.94, 95.38]


def test_agrees_with_biopython_b_factors():
    s = PDBParser(QUIET=True).get_structure("af", MODEL)
    assert plddt_per_residue(TEXT) == pytest.approx([r["CA"].get_bfactor() for r in s.get_residues()])


def test_mean_is_the_database_global_score():
    # AlphaFold DB reports a global (mean) pLDDT of 93.5 for this model
    assert float(np.mean(plddt_per_residue(TEXT))) == pytest.approx(93.5, abs=0.05)


def test_bands_by_hand():
    assert confidence_bands([95, 90, 70.5, 70, 50, 10]) == {"very_high": 1, "confident": 2, "low": 1, "very_low": 2}
    assert confidence_bands([]) == {"very_high": 0, "confident": 0, "low": 0, "very_low": 0}


def test_bands_cover_the_model():
    bands = confidence_bands(plddt_per_residue(TEXT))
    assert sum(bands.values()) == 46
    assert bands["very_high"] > bands["confident"]  # a small, well-folded protein: mostly very high
