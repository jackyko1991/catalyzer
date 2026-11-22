"""Run: crambin in 3D, the chosen residue in orange and its neighbours (from your neighbours) in blue."""

from pathlib import Path

import render as r
from answer import neighbours, read_atoms

PDB = (Path(__file__).parent / "data" / "1crn.pdb").read_text()


def run(p: dict) -> list:
    resnum, cutoff = int(p["residue"]), float(p["cutoff"])
    names = {(c, n): name for c, n, name, *_ in read_atoms(PDB)}
    near = neighbours(PDB, "A", resnum, cutoff)
    return [
        r.metric(
            (
                f"Residues within {cutoff:g} Å of {names[('A', resnum)]}{resnum}",
                f"距 {names[('A', resnum)]}{resnum} {cutoff:g} Å 以內的殘基",
            ),
            len(near),
        ),
        r.pdb3d(
            [{"pdb": PDB, "colour": "#9ca3af"}],
            (
                "Crambin (PDB 1CRN): the residue in orange, its neighbours in blue",
                "Crambin（PDB 1CRN）：所選殘基為橘色，鄰居為藍色",
            ),
            highlight=[{"resi": [resnum], "colour": "#c2410c"}, {"resi": [n for _, n in near], "colour": "#2563eb"}],
        ),
        r.table(
            [("Chain", "鏈"), ("Residue", "殘基"), ("Name", "名稱")],
            [[c, n, names[(c, n)]] for c, n in near],
            ("Neighbours", "鄰居"),
        ),
    ]
