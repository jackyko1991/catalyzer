"""What a problem's main.py returns: a list of results the site draws (2D structures, 3D views, charts, tables,
numbers). Copied next to main.py when a problem runs, so main.py does `import render as r`.

Every label is a pair (English, Traditional Chinese). 2D drawings are SVG made by RDKit; 3D views carry the
molecule (mol block) or the structure (PDB text) for the site's 3Dmol viewer.
"""

from __future__ import annotations

import re

from rdkit import Chem
from rdkit.Chem import AllChem
from rdkit.Chem.Draw import rdMolDraw2D

Label = tuple[str, str]

ORANGE = (0.76, 0.25, 0.05)
BLUE = (0.15, 0.39, 0.92)
GREEN = (0.09, 0.64, 0.29)


def _label(x: Label | str | None) -> list[str] | None:
    if x is None:
        return None
    return [x, x] if isinstance(x, str) else list(x)


def _scalable(svg_text: str, width: int, height: int) -> str:
    """RDKit's SVG has a fixed width and height but no viewBox, so a browser crops it when it is shown smaller;
    give it a viewBox (and let the page size it), so the whole molecule always fits."""
    head_end = svg_text.index(">", svg_text.index("<svg"))
    head = svg_text[:head_end]

    head = re.sub(r"\s(width|height)='[^']*'", "", head)
    head = re.sub(r'\s(width|height)="[^"]*"', "", head)
    if "viewBox" not in head:
        head += f" viewBox='0 0 {width} {height}' preserveAspectRatio='xMidYMid meet'"
    return head + svg_text[head_end:]


def link(url: str, title: Label | str | None = None, text: str | None = None) -> dict:
    """A link (e.g. where a data file comes from)."""
    return {"kind": "link", "title": _label(title), "url": url, "text": text or url}


def svg(
    mol: Chem.Mol,
    title: Label | str | None = None,
    highlight: dict[int, tuple[float, float, float]] | None = None,
    bond_highlight: dict[int, tuple[float, float, float]] | None = None,
    notes: dict[int, str] | None = None,
    size: tuple[int, int] = (460, 320),
) -> dict:
    """A 2D drawing of a molecule; atoms (and bonds) coloured by index, optional notes beside atoms."""
    mol = Chem.Mol(mol)
    for i, note in (notes or {}).items():
        mol.GetAtomWithIdx(i).SetProp("atomNote", note)
    d = rdMolDraw2D.MolDraw2DSVG(*size)
    opts = d.drawOptions()
    opts.clearBackground = False
    opts.addStereoAnnotation = True
    highlight = highlight or {}
    bond_highlight = bond_highlight or {}
    rdMolDraw2D.PrepareAndDrawMolecule(
        d,
        mol,
        highlightAtoms=list(highlight),
        highlightAtomColors=highlight,
        highlightBonds=list(bond_highlight),
        highlightBondColors=bond_highlight,
    )
    d.FinishDrawing()
    return {"kind": "svg", "title": _label(title), "svg": _scalable(d.GetDrawingText(), *size)}


def grid(mols: list[Chem.Mol], legends: list[str], title: Label | str | None = None, per_row: int = 3) -> dict:
    """Several 2D drawings in a grid, each with a caption."""
    from rdkit.Chem import Draw

    rows = (len(mols) + per_row - 1) // per_row
    text = Draw.MolsToGridImage(mols, molsPerRow=per_row, subImgSize=(220, 180), legends=legends, useSVG=True)
    return {"kind": "svg", "title": _label(title), "svg": _scalable(text, 220 * per_row, 180 * rows)}


def mol3d(mol: Chem.Mol, title: Label | str | None = None) -> dict:
    """A small molecule in 3D: hydrogens added, coordinates from ETKDG (fixed seed), relaxed with MMFF."""
    m = Chem.AddHs(mol)
    params = AllChem.ETKDGv3()
    params.randomSeed = 42
    # long chains (peptides) embed reliably only from random starting coordinates
    params.useRandomCoords = m.GetNumAtoms() > 80
    if AllChem.EmbedMolecule(m, params) != 0:
        return text(("(no 3D coordinates could be generated for this molecule)", "（無法為這個分子產生 3D 座標）"))
    AllChem.MMFFOptimizeMolecule(m, maxIters=200 if params.useRandomCoords else 500)
    return {"kind": "mol3d", "title": _label(title), "molblock": Chem.MolToMolBlock(m)}


def pdb3d(
    models: list[dict],
    title: Label | str | None = None,
    highlight: list[dict] | None = None,
) -> dict:
    """A structure (or several superposed). models: [{"pdb": text, "colour": "plddt" | "element" | "#rrggbb"}];
    highlight: [{"resi": [numbers], "colour": "#rrggbb"}] drawn as sticks over the ribbon."""
    return {"kind": "pdb3d", "title": _label(title), "models": models, "highlight": highlight or []}


def table(head: list[Label | str], rows: list[list], title: Label | str | None = None) -> dict:
    return {"kind": "table", "title": _label(title), "head": [_label(h) for h in head], "rows": rows}


def bars(
    labels: list[str],
    values: list[float],
    title: Label | str | None = None,
    limits: list[float | None] | None = None,
    colours: list[str] | None = None,
    unit: str = "",
    vertical: bool = False,
) -> dict:
    """A bar chart; `limits` draws a red line per bar (e.g. Lipinski's limits)."""
    return {
        "kind": "bars",
        "title": _label(title),
        "labels": labels,
        "values": [float(v) for v in values],
        "limits": limits,
        "colours": colours,
        "unit": unit,
        "vertical": vertical,
    }


def metric(label: Label | str, value, unit: str = "", good: bool | None = None) -> dict:
    """One headline number or word; good=True/False colours it green/red."""
    return {"kind": "metric", "label": _label(label), "value": str(value), "unit": unit, "good": good}


def text(body: Label | str, title: Label | str | None = None, mono: bool = False) -> dict:
    return {"kind": "text", "title": _label(title), "body": _label(body), "mono": mono}
