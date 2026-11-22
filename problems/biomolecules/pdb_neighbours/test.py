"""The contract for pdb_neighbours. Read-only: your answer.py must make these pass."""

from pathlib import Path

import pytest
from Bio.PDB import NeighborSearch, PDBParser

from answer import neighbours, read_atoms

PDB = Path(__file__).parent / "data" / "1crn.pdb"
TEXT = PDB.read_text()
STRUCTURE = PDBParser(QUIET=True).get_structure("1crn", PDB)


def test_first_and_count():
    atoms = read_atoms(TEXT)
    assert len(atoms) == 327
    assert atoms[0] == ("A", 1, "THR", "N", 17.047, 14.099, 3.625)
    assert atoms[-1][:4] == ("A", 46, "ASN", "OXT")


def test_coordinates_match_biopython():
    bio = [
        (a.get_parent().get_parent().id, a.get_parent().id[1], a.get_id(), *map(float, a.coord))
        for a in STRUCTURE.get_atoms()
    ]
    mine = read_atoms(TEXT)
    assert [(c, r, n) for c, r, _, n, *_ in mine] == [(c, r, n) for c, r, n, *_ in bio]
    for m, b in zip(mine, bio):
        assert m[4:] == pytest.approx(tuple(b[3:]), abs=1e-3)


def _biopython_neighbours(resnum, cutoff):
    atoms = list(STRUCTURE.get_atoms())
    search = NeighborSearch(atoms)
    res = STRUCTURE[0]["A"][resnum]
    found = set()
    for atom in res:
        for other in search.search(atom.coord, cutoff):
            r = other.get_parent()
            found.add((r.get_parent().id, r.id[1]))
    found.discard(("A", resnum))
    return sorted(found)


@pytest.mark.parametrize("resnum, cutoff", [(3, 4.0), (16, 4.0), (26, 3.5), (40, 5.0), (1, 4.0)])
def test_neighbours_agree_with_biopython(resnum, cutoff):
    assert neighbours(TEXT, "A", resnum, cutoff) == _biopython_neighbours(resnum, cutoff)


def test_disulphide_partner_is_a_neighbour():
    # crambin's cysteines pair up: Cys3-Cys40, Cys4-Cys32, Cys16-Cys26
    assert ("A", 40) in neighbours(TEXT, "A", 3)
    assert ("A", 26) in neighbours(TEXT, "A", 16)
