"""Run: rank a small library of drugs by your Tanimoto similarity to a query molecule."""

import render as r
from answer import morgan_bits, most_similar, tanimoto
from rdkit import Chem

LIBRARY = {
    "aspirin": "CC(=O)Oc1ccccc1C(=O)O",
    "salicylic acid": "OC(=O)c1ccccc1O",
    "ibuprofen": "CC(C)Cc1ccc(cc1)C(C)C(=O)O",
    "naproxen": "COc1ccc2cc(ccc2c1)C(C)C(=O)O",
    "paracetamol": "CC(=O)Nc1ccc(O)cc1",
    "caffeine": "Cn1cnc2c1c(=O)n(C)c(=O)n2C",
    "theophylline": "Cn1c2nc[nH]c2c(=O)n(C)c1=O",
    "theobromine": "Cn1cnc2c1c(=O)[nH]c(=O)n2C",
    "nicotine": "CN1CCCC1c1cccnc1",
}


def run(p: dict) -> list:
    query = p["query"]
    q = morgan_bits(query, radius=int(p["radius"]))
    library = {name: smi for name, smi in LIBRARY.items() if Chem.CanonSmiles(smi) != Chem.CanonSmiles(query)}
    scores = sorted(
        ((tanimoto(q, morgan_bits(smi, radius=int(p["radius"]))), name) for name, smi in library.items()), reverse=True
    )
    best = (
        next(name for name, smi in library.items() if smi == most_similar(query, list(library.values())))
        if int(p["radius"]) == 2
        else scores[0][1]
    )
    top = scores[:6]
    return [
        r.metric(("Most similar", "最相似"), best),
        r.mol3d(Chem.MolFromSmiles(query), ("The query molecule in 3D", "查詢分子的 3D 結構")),
        r.bars(
            [name for _, name in scores],
            [round(s, 3) for s, _ in scores],
            (
                f"Tanimoto similarity to the query (radius {p['radius']})",
                f"與查詢分子的 Tanimoto 相似度（半徑 {p['radius']}）",
            ),
        ),
        r.grid(
            [Chem.MolFromSmiles(query)] + [Chem.MolFromSmiles(library[n]) for _, n in top[:5]],
            ["query"] + [f"{n}  {s:.2f}" for s, n in top[:5]],
            ("The query and its nearest neighbours", "查詢分子與最相近的分子"),
        ),
    ]
