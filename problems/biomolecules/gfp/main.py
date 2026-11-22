"""Run: find the chromophore inside the barrel and show what holds it."""

from pathlib import Path

import render as r
from answer import barrel_strands, chromophore_pocket, find_chromophore

DATA = Path(__file__).parent / "data"
FAMOUS = {
    96: ("Arg96: holds the chromophore's charge", "Arg96：穩住發色團的電荷"),
    148: ("His148: hydrogen bond to the ring", "His148：與環形成氫鍵"),
    203: ("Thr203: sets the colour (T203Y makes YFP)", "Thr203：決定顏色（T203Y 變成 YFP）"),
    222: ("Glu222: the proton it takes decides which colour is absorbed", "Glu222：它接走的質子決定吸收哪種顏色"),
}


def run(p: dict) -> list:
    text = (DATA / f"{p['protein']}.pdb").read_text()
    chain, resnum, resname = find_chromophore(text)
    cutoff = float(p["cutoff"])
    pocket = chromophore_pocket(text, cutoff)
    parents = sorted(
        {ln[24:27].strip() for ln in text.splitlines() if ln.startswith("MODRES") and ln[12:15].strip() == resname}
    )
    notes = [r.text(FAMOUS[n], mono=False) for n, _ in pocket if n in FAMOUS]
    return [
        r.metric(("Chromophore", "發色團"), f"{resname} {resnum}"),
        r.metric(("Made from", "由哪些殘基形成"), ", ".join(parents)),
        r.metric(("Strands in the barrel", "桶狀結構的股數"), barrel_strands(text)),
        r.metric((f"Residues within {cutoff:g} Å", f"{cutoff:g} Å 以內的殘基"), len(pocket)),
        r.pdb3d(
            [{"pdb": text, "colour": "#9ca3af"}],
            (
                "The barrel (grey) with the chromophore inside it (orange) and the residues that touch it (blue)",
                "桶狀結構（灰）內的發色團（橘），以及接觸它的殘基（藍）",
            ),
            highlight=[
                {"resi": [n for n, _ in pocket], "colour": "#2563eb"},
                {"resi": [resnum], "colour": "#c2410c"},
            ],
        ),
        r.table(
            [("Residue", "殘基"), ("Name", "名稱")],
            [[n, name] for n, name in pocket],
            ("Everything that touches the chromophore", "所有接觸發色團的殘基"),
        ),
        *notes,
    ]
