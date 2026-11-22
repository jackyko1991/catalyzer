// Generates the History drawings in public/history (480 × 300, the style of Formalizer's). Run: node scripts/history-drawings.mjs public/history
import { writeFileSync } from "node:fs";
import { EM, EMBG, arrow, atom, circle, helix, hexagon, line, path, rect, smooth, svg, t, MONO, esc } from "./svgkit.mjs";
const OUT = process.argv[2];
const files = {};

// PDB file lines
{
  const rows = [
    ["ATOM", "1", "N", "MET", "A", "1", "27.340", "24.430", "2.614"],
    ["ATOM", "2", "CA", "MET", "A", "1", "26.266", "25.413", "2.842"],
    ["ATOM", "3", "C", "MET", "A", "1", "26.913", "26.639", "3.531"],
    ["ATOM", "4", "O", "MET", "A", "1", "27.886", "26.463", "4.263"],
    ["ATOM", "5", "N", "GLN", "A", "2", "26.335", "27.770", "3.258"],
  ];
  let b = t(24, 40, "A PDB file: one line per atom", { size: 14, bold: true, fill: "#111827" });
  b += rect(20, 56, 440, 150, "#fff", "#d1d5db");
  const cols = [32, 80, 108, 142, 182, 200, 236, 302, 368];
  b += rect(102, 64, 116, 134, EMBG, "none", { rx: 6 }) + rect(230, 64, 222, 134, "#e0f2fe", "none", { rx: 6 });
  rows.forEach((r, i) => r.forEach((v, j) => (b += t(cols[j], 86 + i * 25, v, { mono: true, size: 12.5, fill: j === 0 ? "#6b7280" : "#111827" }))));
  b += t(160, 232, "atom · residue · chain · number", { anchor: "middle", fill: EM, size: 12.5 });
  b += t(341, 232, "x, y, z in ångströms", { anchor: "middle", fill: "#0369a1", size: 12.5 });
  b += t(240, 272, "1971: 7 structures · today: more than 200,000, free to download", { anchor: "middle", size: 12.5, fill: "#6b7280" });
  files["pdb.svg"] = svg("Lines of a PDB file, each ATOM record giving an atom's name, residue and x, y, z coordinates", b);
}

// SMILES
{
  let b = t(24, 40, "SMILES: a molecule written as text", { size: 14, bold: true, fill: "#111827" });
  b += rect(30, 70, 120, 56, "#fff", "#d1d5db") + t(90, 106, "CCO", { mono: true, size: 24, anchor: "middle", fill: "#111827", bold: true });
  b += arrow(160, 98, 220, 98);
  b += line(260, 98, 320, 98, "#374151", 3) + line(320, 98, 380, 98, "#374151", 3);
  b += atom(260, 98, "C") + atom(320, 98, "C") + atom(380, 98, "O");
  b += t(320, 140, "ethanol", { anchor: "middle", fill: "#6b7280" });
  b += rect(30, 180, 120, 56, "#fff", "#d1d5db") + t(90, 216, "c1ccccc1", { mono: true, size: 18, anchor: "middle", fill: "#111827", bold: true });
  b += arrow(160, 208, 220, 208);
  b += hexagon(320, 208, 38);
  b += t(400, 212, "benzene", { fill: "#6b7280" });
  b += t(240, 280, "lower case = aromatic · digits open and close a ring", { anchor: "middle", fill: "#6b7280", size: 12 });
  files["smiles.svg"] = svg("The SMILES string CCO beside the ethanol molecule it describes, and c1ccccc1 beside benzene", b);
}

// CASP blind test
{
  let b = t(24, 40, "CASP: predict first, compare later", { size: 14, bold: true, fill: "#111827" });
  b += rect(28, 70, 130, 110, "#fff", "#d1d5db") + t(93, 96, "prediction", { anchor: "middle", bold: true });
  b += path(smooth([[48, 150], [70, 120], [92, 160], [114, 118], [138, 150]]), "#7c3aed", 4);
  b += rect(52, 186, 82, 24, "#ede9fe", "none", { rx: 12 }) + t(93, 202, "sealed", { anchor: "middle", fill: "#6d28d9", size: 12 });
  b += rect(322, 70, 130, 110, "#fff", "#d1d5db") + t(387, 96, "experiment", { anchor: "middle", bold: true });
  b += path(smooth([[342, 150], [364, 124], [386, 158], [408, 120], [432, 150]]), "#0f766e", 4);
  b += rect(346, 186, 82, 24, "#ccfbf1", "none", { rx: 12 }) + t(387, 202, "released", { anchor: "middle", fill: "#0f766e", size: 12 });
  b += arrow(168, 125, 222, 125) + arrow(312, 125, 258, 125);
  b += circle(240, 125, 18, EMBG, EM) + t(240, 130, "=?", { anchor: "middle", bold: true, fill: EM });
  b += t(240, 252, "independent assessors score how close the two are", { anchor: "middle", fill: "#6b7280", size: 12.5 });
  b += t(240, 274, "1994 · 1996 · 1998 · … every two years", { anchor: "middle", fill: "#6b7280", size: 12.5 });
  files["casp.svg"] = svg("A blind test: predicted structures are sealed before the experimental structure is released, then compared", b);
}

// Lipinski
{
  let b = t(24, 40, "Lipinski's rule of five: four limits", { size: 14, bold: true, fill: "#111827" });
  const rows = [
    ["molecular weight", "≤ 500", 0.62],
    ["logP (oily vs watery)", "≤ 5", 0.48],
    ["H-bond donors", "≤ 5", 0.4],
    ["H-bond acceptors", "≤ 10", 0.7],
  ];
  rows.forEach(([name, lim, v], i) => {
    const y = 74 + i * 50;
    b += t(30, y + 15, name, { size: 13 });
    b += rect(200, y, 200, 22, "#e5e7eb", "none", { rx: 11 }) + rect(200, y, 200 * v, 22, EM, "none", { rx: 11 });
    b += line(360, y - 4, 360, y + 26, "#b91c1c", 2);
    b += t(410, y + 16, lim, { mono: true, fill: "#b91c1c", bold: true });
  });
  b += t(240, 284, "break two or more: poor absorption is more likely", { anchor: "middle", fill: "#6b7280", size: 12.5 });
  files["lipinski.svg"] = svg("Lipinski's four limits drawn as gauges: molecular weight, logP, hydrogen-bond donors and acceptors", b);
}

// RDKit code
{
  let b = t(24, 40, "RDKit: chemistry from Python", { size: 14, bold: true, fill: "#111827" });
  b += rect(24, 58, 432, 156, "#1f2937", "none");
  const code = [
    [["from", "#c084fc"], [" rdkit ", "#e5e7eb"], ["import", "#c084fc"], [" Chem", "#e5e7eb"]],
    [["from", "#c084fc"], [" rdkit.Chem ", "#e5e7eb"], ["import", "#c084fc"], [" Descriptors", "#e5e7eb"]],
    [],
    [["mol = Chem.", "#e5e7eb"], ["MolFromSmiles", "#93c5fd"], ["(", "#e5e7eb"], ['"CCO"', "#86efac"], [")", "#e5e7eb"]],
    [["mol.", "#e5e7eb"], ["GetNumAtoms", "#93c5fd"], ["()", "#e5e7eb"], ["      # 3", "#9ca3af"]],
    [["Descriptors.", "#e5e7eb"], ["MolWt", "#93c5fd"], ["(mol)", "#e5e7eb"], ["  # 46.07", "#9ca3af"]],
  ];
  code.forEach((parts, i) => {
    b += `<text x='44' y='${88 + i * 22}' font-size='13' font-family='${MONO}' xml:space='preserve'>${parts.map(([s, c]) => `<tspan fill='${c}'>${esc(s)}</tspan>`).join("")}</text>`;
  });
  b += t(240, 250, "open source since 2006 (BSD licence)", { anchor: "middle", fill: "#6b7280", size: 12.5 });
  b += t(240, 272, "the same code for a student and for a drug company", { anchor: "middle", fill: "#6b7280", size: 12.5 });
  files["rdkit.svg"] = svg("Lines of Python with RDKit: read a SMILES string, then count its atoms and compute its weight", b);
}

// ChEMBL table
{
  let b = t(24, 40, "ChEMBL: molecule × target × measured activity", { size: 14, bold: true, fill: "#111827" });
  b += rect(24, 56, 432, 176, "#fff", "#d1d5db");
  b += rect(24, 56, 432, 32, "#f3f4f6", "none", { rx: 10 });
  const hdr = ["molecule", "target protein", "activity"];
  const xs = [40, 150, 350];
  hdr.forEach((h, i) => (b += t(xs[i], 77, h, { bold: true })));
  const rows = [
    ["aspirin", "cyclooxygenase-1", "IC50 (nM)"],
    ["caffeine", "adenosine A2A receptor", "Ki (nM)"],
    ["ibuprofen", "cyclooxygenase-2", "IC50 (nM)"],
    ["…", "…", "…"],
  ];
  rows.forEach((r, i) => r.forEach((v, j) => (b += t(xs[j], 114 + i * 32, v, { mono: j === 2, size: 12.5, fill: j === 2 ? EM : "#111827" }))));
  b += t(240, 266, "millions of measurements, each linked to its paper, free to download", { anchor: "middle", fill: "#6b7280", size: 12.5 });
  files["chembl.svg"] = svg("A table linking molecules to protein targets and measured activities", b);
}

// ECFP
{
  let b = t(24, 40, "A circular fingerprint", { size: 14, bold: true, fill: "#111827" });
  const P = [[70, 150], [120, 120], [170, 150], [220, 120], [170, 205]];
  b += circle(170, 150, 62, "#fef3c7", "#d97706", 1.5) + circle(170, 150, 32, "#fde68a", "#d97706", 1.5);
  [[0, 1], [1, 2], [2, 3], [2, 4]].forEach(([i, j]) => (b += line(...P[i], ...P[j], "#374151", 3)));
  b += atom(...P[0], "C") + atom(...P[1], "C") + atom(...P[2], "C") + atom(...P[3], "O") + atom(...P[4], "N");
  b += t(170, 240, "radius 0, 1, 2 around each atom", { anchor: "middle", fill: "#92400e", size: 12 });
  b += arrow(250, 150, 290, 150);
  const bits = "0100100000010010001000001";
  [...bits].forEach((c, i) => (b += rect(300 + (i % 5) * 30, 90 + Math.floor(i / 5) * 26, 24, 20, c === "1" ? EM : "#e5e7eb", "none", { rx: 4 })));
  b += t(372, 238, "each neighbourhood → one bit", { anchor: "middle", fill: EM, size: 12 });
  b += t(240, 280, "Tanimoto = shared bits ÷ bits in either", { anchor: "middle", fill: "#6b7280", size: 12.5 });
  files["ecfp.svg"] = svg("A circular fingerprint: neighbourhoods of growing radius around each atom are hashed into bits of a bit string", b);
}

// AlphaFold 2
{
  let b = t(24, 40, "AlphaFold 2: sequence → pairs → structure", { size: 14, bold: true, fill: "#111827" });
  b += rect(20, 110, 100, 40, "#fff", "#d1d5db") + t(70, 135, "MKTAYIAK…", { mono: true, anchor: "middle", size: 12 });
  b += t(70, 172, "sequence", { anchor: "middle", fill: "#6b7280", size: 12 });
  b += arrow(126, 130, 160, 130);
  for (let i = 0; i < 6; i++) for (let j = 0; j < 6; j++) b += rect(170 + i * 16, 82 + j * 16, 14, 14, `rgba(37,99,235,${(0.15 + 0.8 * Math.exp(-Math.abs(i - j) / 1.4)).toFixed(2)})`, "none", { rx: 2 });
  b += t(218, 196, "residue pairs", { anchor: "middle", fill: "#6b7280", size: 12 });
  b += t(218, 212, "(Evoformer)", { anchor: "middle", fill: "#9ca3af", size: 11 });
  b += arrow(276, 130, 310, 130);
  b += path(smooth([[320, 170], ...helix(330, 110, 400, 3, 16), [420, 150], [440, 175], [410, 190], [370, 180]]), "#0053d6", 6);
  b += t(390, 220, "3D structure + pLDDT", { anchor: "middle", fill: "#6b7280", size: 12 });
  b += t(240, 272, "CASP14 (2020): median 92.4 GDT out of 100", { anchor: "middle", fill: "#6b7280", size: 12.5 });
  files["alphafold2.svg"] = svg("A protein sequence enters a network that passes information between residue pairs and outputs a 3D structure", b);
}

// AFDB pLDDT colours
{
  let b = t(24, 40, "AlphaFold DB: colour shows confidence (pLDDT)", { size: 14, bold: true, fill: "#111827" });
  const segs = [
    ["#ff7d45", [[40, 210], [60, 170], [50, 140], [80, 120]]],
    ["#ffdb13", [[80, 120], [110, 100], [130, 130]]],
    ["#65cbf3", [[130, 130], [150, 160], [175, 150]]],
    ["#0053d6", [[175, 150], ...helix(185, 140, 300, 4, 22).slice(1), [320, 160]]],
    ["#65cbf3", [[320, 160], [345, 190], [370, 170]]],
    ["#ff7d45", [[370, 170], [395, 130], [420, 180], [445, 150]]],
  ];
  for (const [c, pts] of segs) b += path(smooth(pts), c, 7);
  const leg = [["#0053d6", "> 90 very high"], ["#65cbf3", "70–90 confident"], ["#ffdb13", "50–70 low"], ["#ff7d45", "< 50 very low"]];
  leg.forEach(([c, s], i) => (b += rect(28 + i * 110, 248, 16, 16, c, "none", { rx: 4 }) + t(50 + i * 110, 261, s, { size: 11.5 })));
  b += t(240, 288, "low-confidence ends are often floppy, with no single shape", { anchor: "middle", fill: "#6b7280", size: 12 });
  files["afdb.svg"] = svg("A protein ribbon coloured by pLDDT: dark blue where the model is very confident, orange where it is not", b);
}

// ESMFold
{
  let b = t(24, 40, "ESMFold: read the sequence like a sentence", { size: 14, bold: true, fill: "#111827" });
  const seq = "M K T A Y I A K Q R";
  b += t(30, 100, seq, { mono: true, size: 15, fill: "#111827" });
  b += t(30, 124, "one sequence, no search for relatives", { size: 12, fill: "#6b7280" });
  b += arrow(110, 140, 110, 168);
  b += rect(30, 176, 160, 50, "#ede9fe", "#7c3aed") + t(110, 198, "language model", { anchor: "middle", fill: "#6d28d9", bold: true }) + t(110, 216, "ESM-2", { anchor: "middle", fill: "#6d28d9", size: 12 });
  b += arrow(196, 201, 236, 201);
  b += rect(242, 176, 110, 50, EMBG, EM) + t(297, 205, "folding head", { anchor: "middle", fill: EM, bold: true });
  b += arrow(358, 201, 380, 201);
  b += path(smooth([[388, 230], ...helix(392, 190, 440, 2.5, 14), [448, 165], [425, 152]]), "#0053d6", 5);
  b += t(240, 276, "used to fold over 600 million metagenomic proteins", { anchor: "middle", fill: "#6b7280", size: 12.5 });
  files["esmfold.svg"] = svg("A language model reads a protein sequence like a sentence and passes its understanding to a folding head", b);
}

// RFdiffusion pipeline
{
  let b = t(24, 40, "Design: generate, write a sequence, check", { size: 14, bold: true, fill: "#111827" });
  // noise
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 26; i++) b += circle(40 + rnd() * 80, 80 + rnd() * 90, 3.5, "#9ca3af");
  b += t(80, 196, "noise", { anchor: "middle", fill: "#6b7280", size: 12 });
  b += arrow(128, 125, 160, 125);
  b += path(smooth([[170, 160], ...helix(176, 120, 240, 2.5, 18), [250, 150], [230, 170]]), "#2563eb", 5);
  b += t(210, 196, "backbone", { anchor: "middle", fill: "#6b7280", size: 12 });
  b += t(210, 212, "RFdiffusion", { anchor: "middle", fill: "#2563eb", size: 12, bold: true });
  b += arrow(262, 125, 294, 125);
  b += rect(300, 106, 84, 38, "#fff", "#d1d5db") + t(342, 130, "MSEEL…", { mono: true, anchor: "middle", size: 12 });
  b += t(342, 196, "sequence", { anchor: "middle", fill: "#6b7280", size: 12 });
  b += t(342, 212, "ProteinMPNN", { anchor: "middle", fill: "#2563eb", size: 12, bold: true });
  b += arrow(390, 125, 412, 125);
  b += circle(432, 125, 18, EMBG, EM) + t(432, 131, "✓?", { anchor: "middle", fill: EM, bold: true });
  b += t(426, 196, "refold:", { anchor: "middle", fill: "#6b7280", size: 12 });
  b += t(426, 212, "RMSD, pLDDT", { anchor: "middle", fill: EM, size: 12, bold: true });
  b += t(240, 266, "then make it in the lab: the final check", { anchor: "middle", fill: "#6b7280", size: 12.5 });
  files["rfdiffusion.svg"] = svg("Design in three steps: diffusion turns noise into a backbone, ProteinMPNN writes a sequence for it, a structure predictor checks it", b);
}

// AlphaFold 3 complex
{
  let b = t(24, 40, "AlphaFold 3: a whole complex at once", { size: 14, bold: true, fill: "#111827" });
  // DNA: two strands with rungs
  const n = 9;
  for (let i = 0; i < n; i++) {
    const x = 40 + i * 22, y1 = 150 + 24 * Math.sin(i * 0.8), y2 = 150 - 24 * Math.sin(i * 0.8);
    b += line(x, y1, x, y2, "#cbd5e1", 2);
  }
  const s1 = [...Array(n)].map((_, i) => [40 + i * 22, +(150 + 24 * Math.sin(i * 0.8)).toFixed(1)]);
  const s2 = [...Array(n)].map((_, i) => [40 + i * 22, +(150 - 24 * Math.sin(i * 0.8)).toFixed(1)]);
  b += path(smooth(s1), "#db2777", 4) + path(smooth(s2), "#9333ea", 4);
  b += t(128, 210, "DNA", { anchor: "middle", fill: "#9d174d", bold: true });
  // protein
  b += path(smooth([[250, 220], [262, 180], ...helix(268, 150, 360, 3, 20), [400, 190], [420, 230], [380, 250], [330, 240], [300, 215]]), "#0053d6", 6);
  b += t(380, 280, "protein", { anchor: "middle", fill: "#1e40af", bold: true });
  // ligand in pocket
  b += hexagon(340, 205, 16, "#b45309") + line(356, 205, 372, 205, "#b45309", 2.2);
  b += t(250, 100, "small molecule", { fill: "#b45309", bold: true, size: 12.5 });
  b += arrow(300, 106, 332, 186, "#b45309");
  b += t(240, 72, "+ RNA, ions, modified residues", { anchor: "middle", fill: "#6b7280", size: 12 });
  files["alphafold3.svg"] = svg("A protein, a strand of DNA and a small drug molecule predicted together as one complex", b);
}

for (const [name, s] of Object.entries(files)) writeFileSync(`${OUT}/${name}`, s);
console.log(Object.keys(files).join(" "));
