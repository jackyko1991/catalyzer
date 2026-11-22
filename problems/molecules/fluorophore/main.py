"""Run: predict the colour of a series of cyanine dyes from the length of their chain, and compare with experiment."""

import csv
from pathlib import Path

import render as r
from answer import chain_length, fit_alpha, lambda_max
from rdkit import Chem

DYES = list(csv.DictReader((Path(__file__).parent / "data" / "dyes.csv").read_text(encoding="utf-8").splitlines()))
SERIES = {
    "thia": ("Thiacyanines", "噻唑菁"),
    "quinoline44": ("Quinoline 4,4′", "喹啉 4,4′"),
    "quinoline22": ("Quinoline 2,2′", "喹啉 2,2′"),
    "cy": ("Cy3 and Cy5", "Cy3 與 Cy5"),
    "all": ("Every dye", "全部染料"),
}


def seen_colour(nm: float) -> str:
    """Roughly the colour the eye sees: the complement of the absorbed wavelength, as #rrggbb.

    A dye absorbing green looks red, and one absorbing red looks blue-green. Above 700 nm the absorption is in the
    near infrared, which the eye does not see at all, so the sample looks faintly coloured; draw it grey-blue.
    """
    if nm > 700:
        return "#64748b"
    hue = {400: 60.0, 450: 50.0, 500: 300.0, 550: 270.0, 600: 210.0, 650: 180.0, 700: 170.0}
    keys = sorted(hue)
    lo = max([k for k in keys if k <= nm], default=keys[0])
    hi = min([k for k in keys if k >= nm], default=keys[-1])
    h = hue[lo] if lo == hi else hue[lo] + (hue[hi] - hue[lo]) * (nm - lo) / (hi - lo)
    # HSL(h, 70%, 50%) as hex
    c, x = 0.7, 0.7 * (1 - abs(((h / 60) % 2) - 1))
    rgb = [(c, x, 0), (x, c, 0), (0, c, x), (0, x, c), (x, 0, c), (c, 0, x)][int(h // 60) % 6]
    return "#" + "".join(f"{round(255 * (v + 0.5 - c / 2)):02x}" for v in rgb)


def run(p: dict) -> list:
    rows_in = DYES if p["series"] == "all" else [d for d in DYES if d["series"] == p["series"]]
    alpha = float(p["alpha"])
    chain = [chain_length(d["smiles"]) for d in rows_in]
    measured = [float(d["lambda_max_nm"]) for d in rows_in]
    predicted = [lambda_max(c, alpha) for c in chain]
    best = fit_alpha(chain, measured)
    worst = max(abs(a - b) for a, b in zip(predicted, measured))
    rows = [
        [d["name"], c, f"{pred:.0f}", f"{m:.0f}", f"{pred - m:+.0f}", d["source"].split(" via ")[0]]
        for d, c, pred, m in zip(rows_in, chain, predicted, measured)
    ]
    return [
        r.metric(("End correction used", "使用的端點修正"), f"α = {alpha:g}"),
        r.metric(("Best α for this series", "此系列最佳 α"), f"{best:.2f}"),
        r.metric(("Worst error", "最大誤差"), f"{worst:.0f}", "nm", good=worst < 40),
        r.scatter(
            chain,
            measured,
            [d["name"].split(" (")[0] for d in rows_in],
            (
                f"Measured absorption against chain length (the line is the model, α = {alpha:g})",
                f"實測吸收峰對鏈長（線是模型，α = {alpha:g}）",
            ),
            ("Carbons between the two nitrogens, P", "兩個氮之間的碳數 P"),
            ("Absorption maximum (nm)", "吸收峰（nm）"),
        ),
        r.bars(
            [f"{d['name'].split(' (')[0]}  P={c}" for d, c in zip(rows_in, chain)],
            measured,
            ("Where each dye absorbs, in the colour the eye sees", "每個染料的吸收位置，以肉眼看到的顏色表示"),
            colours=[seen_colour(m) for m in measured],
            unit="nm",
        ),
        r.table(
            [("Dye", "染料"), ("P", "P"), ("Predicted (nm)", "預測（nm）"), ("Measured (nm)", "實測（nm）"), ("Error", "誤差"), ("Source", "來源")],
            rows,
            ("Prediction against experiment", "預測與實驗比較"),
        ),
        r.grid(
            [Chem.MolFromSmiles(d["smiles"]) for d in rows_in[:6]],
            [f"{d['name'].split(' (')[0]}  {d['lambda_max_nm']} nm" for d in rows_in[:6]],
            ("The dyes: the chain between the two nitrogens grows by one -CH=CH- each time", "這些染料：兩個氮之間的鏈每次增加一個 -CH=CH-"),
            per_row=2,
        ),
    ]
