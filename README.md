# Catalyzer

Molecular science in Python, learned by doing: from atoms and bonds to checking AI-designed proteins. A code lab
in the learnkit series (with Tensorizer, Formalizer and Polyphonizer), in English and Traditional Chinese.

Each problem is a fixed test file (the contract) and a Python file whose function signatures are fixed: you write
the bodies, and the tests check them **on your own computer**. Two tracks:

- **from scratch** (undergraduate level): SMILES, atoms and bonds, molecular weight, formal charge, rings,
  Lipinski's rule of five, fingerprints, DNA → protein, sequence alignment, reading a PDB file;
- **professional**: read an AlphaFold model's confidence (pLDDT) and measure it against experiment (RMSD).

The site also has the History of the field (23 sourced cards), four "learn from scratch" pages, Coding Skills with a
3D molecule viewer (3Dmol.js), and a map of the open libraries, databases and AI models of molecular science.

## Run it

You need [pixi](https://pixi.sh) (it installs Python, RDKit, Biopython and the rest) and, for the site, Node.js 22+.

```sh
git clone --recurse-submodules https://github.com/jackyko1991/catalyzer
cd catalyzer
pixi run runner          # the local runner on http://127.0.0.1:8795: the site's "Check on my computer" uses it
pixi run check           # list the problems
pixi run check molecules/read_smiles answer.py   # check a file without the site
pixi run web             # the site on http://localhost:5173 (learnkit must be checked out: vendor/learnkit)
```

The runner listens on this computer only, answers only the published site and local development servers, and
reads every answer before running it (the **lock**: signatures unchanged, imports within the problem's list, no
`eval`, `open`, `os`, network…). It then runs pytest in a separate process with a timeout. It is a learning aid,
not a security sandbox: run code you trust.

## Layout

| Path | What |
| --- | --- |
| `problems/<track>/<name>/` | `meta.yaml` (text, lock, natural-language ↔ code mirror), `stub.py`, `solution.py`, `test.py`, `diagram.svg`, `i18n/zh-Hant.yaml`, `data/` (fixtures, sources in `data/SOURCE.md`) |
| `catalyzer/` | the lock (`checks.py`), the runner (`runner.py`, `serve.py`, `cli.py`), the site export (`export.py`, `structures.py`) |
| `frontend/` | the site (React, Vite, Tailwind); shared parts come from learnkit (`vendor/learnkit`, private submodule) |
| `frontend/src/skills/*.py` | the Coding Skills examples; their printed output is recorded in `*.out` and checked |
| `frontend/scripts/` | the generators of the History drawings and problem pictures |

## Tests

```sh
pixi run test     # every reference solution passes, every stub fails, the lock rejects edits; exports are current
pixi run lint
cd frontend && npm test && npm run build
```

After changing a problem: `pixi run export` (writes `frontend/src/generated/problems.json`, the pictures and the
viewer's structures). After changing a Coding Skills example: `pixi run python tests/test_skills.py`.

## Data and licences

Code: Apache-2.0. Photos on the History page: see `frontend/public/history/CREDITS.md`. Structure files: PDB
entry 1CRN (CC0) and the AlphaFold DB model AF-P01542-F1 (CC BY 4.0, © DeepMind Technologies Limited and
EMBL-EBI); see each problem's `data/SOURCE.md`.

## CI setup

`.github/workflows/pages.yml` builds and deploys the site. learnkit is private, so the repository needs the secret
`LEARNKIT_DEPLOY_KEY`: the private half of a read-only deploy key added to `jackyko1991/learnkit`.
