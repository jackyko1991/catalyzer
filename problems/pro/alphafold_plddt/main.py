"""Run: the AlphaFold model of crambin coloured by the pLDDT your function reads, and the four confidence bands."""

from pathlib import Path

import render as r
from answer import afdb_model_url, confidence_bands, plddt_per_residue

MODEL = (Path(__file__).parent / "data" / "AF-P01542-F1-model_v6.pdb").read_text()
BAND = [(90, "#0053d6"), (70, "#65cbf3"), (50, "#ffdb13"), (-1, "#ff7d45")]


def run(p: dict) -> list:
    plddt = plddt_per_residue(MODEL)
    bands = confidence_bands(plddt)
    colour = [next(c for lo, c in BAND if v > lo) for v in plddt]
    return [
        r.metric(("Mean pLDDT", "平均 pLDDT"), f"{sum(plddt) / len(plddt):.1f}"),
        r.pdb3d([{"pdb": MODEL, "colour": "plddt"}], ("Coloured by pLDDT", "依 pLDDT 上色")),
        r.bars(
            [str(i + 1) for i in range(len(plddt))],
            plddt,
            ("pLDDT of each residue", "每個殘基的 pLDDT"),
            colours=colour,
            vertical=True,
        ),
        r.table(
            [("Band", "等級"), ("Residues", "殘基數")],
            [
                ["very high (> 90)", bands["very_high"]],
                ["confident (> 70)", bands["confident"]],
                ["low (> 50)", bands["low"]],
                ["very low", bands["very_low"]],
            ],
            ("Confidence bands", "信心等級"),
        ),
        r.link(afdb_model_url(p["uniprot"]), ("Where this kind of file comes from", "這類檔案的下載網址")),
    ]
