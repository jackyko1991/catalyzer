"""Run: translate a DNA sequence codon by codon with your translate, draw the peptide it codes for, and show the
partner strand."""

import render as r
from answer import CODON_TABLE, reverse_complement, translate
from rdkit import Chem


def run(p: dict) -> list:
    dna = "".join(p["dna"].split()).upper()
    protein = translate(dna)
    codons = [dna[i : i + 3] for i in range(0, len(dna) - 2, 3)]
    rows = []
    for k, c in enumerate(codons[: len(protein) + 1]):
        aa = CODON_TABLE[c]
        rows.append([k + 1, c, "stop" if aa == "*" else aa])
    out = [
        r.metric(("Protein", "蛋白質"), protein or "–"),
        r.metric(("Length", "長度"), len(protein), "aa"),
    ]
    if protein:
        # the first residues as a molecule: amino acids joined by peptide bonds
        head = Chem.MolFromSequence(protein[:4])
        out.append(
            r.svg(
                head,
                (
                    f"The first amino acids, {protein[:4]}, joined by peptide bonds",
                    f"開頭的胺基酸 {protein[:4]}，以胜肽鍵相連",
                ),
            )
        )
        out.append(
            r.mol3d(
                Chem.MolFromSequence(protein[:8]),
                (
                    f"The first {min(8, len(protein))} amino acids in 3D: one possible shape of the chain, not the folded protein",
                    f"前 {min(8, len(protein))} 個胺基酸的 3D：鏈的一種可能形狀，不是摺疊後的蛋白質",
                ),
            )
        )
    out += [
        r.table(
            [("Codon #", "密碼子"), ("DNA", "DNA"), ("Amino acid", "胺基酸")],
            rows,
            ("Read three letters at a time", "每次讀三個字母"),
        ),
        r.text(reverse_complement(dna), ("Partner strand (reverse complement)", "配對股（反向互補）"), mono=True),
    ]
    return out
