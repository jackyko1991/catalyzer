// Generates each problem's picture, problems/<category>/<name>/diagram.svg (then `pixi run export` copies them
// into the site). Run from frontend/: node scripts/problem-drawings.mjs ../problems
// Numbers drawn are real: aspirin's descriptors from RDKit, crambin's pLDDT from AF-P01542-F1-model_v6, the
// crambin CA RMSD from problems/pro/rmsd (0.43 Å).
import { writeFileSync } from "node:fs";
import { EM, EMBG, MONO, arrow, atom, circle, esc, helix, hexagon, line, path, rect, smooth, svg, t } from "./svgkit.mjs";

const ROOT = process.argv[2];
const files = {};
const head = (s) => t(24, 40, s, { size: 14, bold: true, fill: "#111827" });
const foot = (s, y = 278) => t(240, y, s, { anchor: "middle", fill: "#6b7280", size: 12.5 });
const H = (x, y) => circle(x, y, 10, "#fff", "#9ca3af", 1.5) + t(x, y + 4, "H", { anchor: "middle", fill: "#6b7280", size: 11 });

// read_smiles: CCO with its implicit hydrogens drawn, and the formula
{
  let b = head("CCO: the hydrogens you don't see");
  b += rect(28, 70, 92, 46, "#fff", "#d1d5db") + t(74, 100, "CCO", { mono: true, size: 20, anchor: "middle", bold: true, fill: "#111827" });
  b += arrow(128, 93, 160, 93);
  const C1 = [210, 140], C2 = [290, 140], O = [370, 140];
  b += line(...C1, ...C2, "#374151", 3) + line(...C2, ...O, "#374151", 3);
  for (const [dx, dy] of [[-34, 0], [0, -34], [0, 34]]) b += line(C1[0], C1[1], C1[0] + dx, C1[1] + dy, "#9ca3af", 1.5) + H(C1[0] + dx, C1[1] + dy);
  for (const [dx, dy] of [[0, -34], [0, 34]]) b += line(C2[0], C2[1], C2[0] + dx, C2[1] + dy, "#9ca3af", 1.5) + H(C2[0] + dx, C2[1] + dy);
  b += line(O[0], O[1], O[0] + 34, O[1], "#9ca3af", 1.5) + H(O[0] + 34, O[1]);
  b += atom(...C1, "C") + atom(...C2, "C") + atom(...O, "O");
  b += t(210, 205, "3 H", { anchor: "middle", fill: "#6b7280", size: 12 }) + t(290, 205, "2 H", { anchor: "middle", fill: "#6b7280", size: 12 }) + t(390, 172, "1 H", { anchor: "middle", fill: "#6b7280", size: 12 });
  b += rect(150, 222, 180, 34, EMBG, EM) + t(240, 245, "C₂H₆O  {C: 2, H: 6, O: 1}", { anchor: "middle", fill: EM, bold: true, size: 13 });
  files["molecules/read_smiles"] = svg("Ethanol from the SMILES string CCO, drawn with its six implicit hydrogens, giving the formula C2H6O", b);
}

// atoms_bonds: acetaldehyde as a graph, bond types and degrees
{
  let b = head("CC=O as a graph: points, lines, degrees");
  const P = [[120, 150], [240, 150], [360, 150]];
  b += line(...P[0], ...P[1], "#374151", 3);
  b += line(P[1][0], 145, P[2][0], 145, "#374151", 3) + line(P[1][0], 155, P[2][0], 155, "#374151", 3);
  b += atom(...P[0], "C") + atom(...P[1], "C") + atom(...P[2], "O");
  b += t(180, 136, "single", { anchor: "middle", fill: "#6b7280", size: 12 }) + t(300, 134, "double", { anchor: "middle", fill: "#6b7280", size: 12 });
  ["1", "2", "1"].forEach((d, i) => (b += rect(P[i][0] - 16, 186, 32, 26, EMBG, "none", { rx: 13 }) + t(P[i][0], 204, d, { anchor: "middle", fill: EM, bold: true })));
  b += t(240, 236, "degree = lines touching the atom", { anchor: "middle", fill: EM, size: 12.5 });
  b += foot("sum of degrees = 2 × bonds (each line has two ends)");
  files["molecules/atoms_bonds"] = svg("Acetaldehyde CC=O as a graph: a single and a double bond, atom degrees 1, 2, 1", b);
}

// molecular_weight: water's masses added
{
  let b = head("Add the masses: water, H₂O");
  const O = [240, 130];
  b += line(...O, 180, 175, "#374151", 3) + line(...O, 300, 175, "#374151", 3);
  b += atom(...O, "O") + atom(180, 175, "H") + atom(300, 175, "H");
  b += t(240, 102, "15.999", { anchor: "middle", mono: true, fill: "#b91c1c" });
  b += t(150, 205, "1.008", { anchor: "middle", mono: true, fill: "#6b7280" }) + t(330, 205, "1.008", { anchor: "middle", mono: true, fill: "#6b7280" });
  b += rect(110, 222, 260, 34, EMBG, EM) + t(240, 245, "1.008 + 15.999 + 1.008 = 18.015 g/mol", { anchor: "middle", fill: EM, bold: true, size: 13 });
  b += foot("average atomic masses from the periodic table");
  files["molecules/molecular_weight"] = svg("Water drawn with the average mass of each atom, adding up to 18.015 grams per mole", b);
}

// formal_charge: ammonium's nitrogen bookkeeping
{
  let b = head("Formal charge: NH₄⁺");
  const N = [140, 150];
  for (const [dx, dy] of [[-60, 0], [60, 0], [0, -60], [0, 60]]) b += line(...N, N[0] + dx, N[1] + dy, "#374151", 3) + atom(N[0] + dx, N[1] + dy, "H");
  b += atom(...N, "N");
  b += t(190, 92, "+", { size: 22, bold: true, fill: "#b91c1c" });
  const rows = [["valence electrons V", "5"], ["lone-pair electrons L", "0"], ["bonding electrons B", "8"]];
  rows.forEach(([k, v], i) => (b += t(250, 100 + i * 28, k, { size: 13 }) + t(440, 100 + i * 28, v, { mono: true, anchor: "end", bold: true })));
  b += line(250, 176, 440, 176, "#d1d5db", 1.5);
  b += t(250, 202, "FC = V − L − B/2", { mono: true, size: 13 }) + t(250, 228, "   = 5 − 0 − 4 = +1", { mono: true, size: 13, fill: EM, bold: true });
  b += foot("each bond's two electrons are shared: the atom owns half");
  files["molecules/formal_charge"] = svg("Ammonium NH4+: nitrogen has 5 valence electrons, no lone pairs and 8 bonding electrons, so its formal charge is +1", b);
}

// rings: naphthalene and cyclohexane
{
  let b = head("Rings: sizes and aromaticity");
  const r = 36, dx = r * Math.cos(Math.PI / 6);
  b += hexagon(120 - dx, 140, r) + hexagon(120 + dx, 140, r);
  b += t(120, 210, "naphthalene", { anchor: "middle", bold: true });
  b += t(120, 230, "sizes [6, 6] · 2 aromatic", { anchor: "middle", fill: EM, size: 12.5 });
  b += hexagon(350, 140, r, "#374151", false);
  b += t(350, 210, "cyclohexane", { anchor: "middle", bold: true });
  b += t(350, 230, "sizes [6] · 0 aromatic", { anchor: "middle", fill: "#6b7280", size: 12.5 });
  b += foot("aromatic: every bond of the ring is aromatic (4n+2 π electrons)");
  files["molecules/rings"] = svg("Naphthalene, two fused aromatic six-membered rings, beside cyclohexane, one non-aromatic six-membered ring", b);
}

// lipinski: aspirin's four numbers against the limits
{
  let b = head("Aspirin against the rule of five");
  const rows = [["molecular weight", 180.16, 500, "180.2"], ["logP", 1.31, 5, "1.31"], ["H-bond donors", 1, 5, "1"], ["H-bond acceptors", 3, 10, "3"]];
  rows.forEach(([name, v, lim, s], i) => {
    const y = 70 + i * 48;
    b += t(28, y + 16, name, { size: 13 });
    b += rect(170, y, 220, 22, "#e5e7eb", "none", { rx: 11 }) + rect(170, y, Math.max(22, 220 * (v / lim) * 0.8), 22, EM, "none", { rx: 11 });
    b += line(346, y - 4, 346, y + 26, "#b91c1c", 2);
    b += t(178, y + 16, s, { mono: true, fill: "#fff", size: 12, bold: true });
    b += t(400, y + 16, `≤ ${lim}`, { mono: true, fill: "#b91c1c", bold: true });
  });
  b += foot("0 limits broken: passes (values from RDKit)", 272);
  files["molecules/lipinski"] = svg("Aspirin's molecular weight 180.2, logP 1.31, 1 hydrogen-bond donor and 3 acceptors, all under Lipinski's limits", b);
}

// similarity: two bit sets as overlapping circles
{
  let b = head("Tanimoto: shared bits ÷ bits in either");
  b += circle(190, 145, 78, "rgba(4,120,87,0.15)", EM, 2) + circle(290, 145, 78, "rgba(37,99,235,0.15)", "#2563eb", 2);
  b += t(150, 150, "A only", { anchor: "middle", fill: EM, size: 12.5 }) + t(330, 150, "B only", { anchor: "middle", fill: "#1d4ed8", size: 12.5 });
  b += t(240, 140, "A ∩ B", { anchor: "middle", bold: true }) + t(240, 158, "shared", { anchor: "middle", fill: "#6b7280", size: 11.5 });
  b += t(150, 60, "caffeine's bits", { fill: EM, size: 12, anchor: "middle" }) + t(330, 60, "theophylline's bits", { fill: "#1d4ed8", size: 12, anchor: "middle" });
  b += rect(120, 236, 240, 30, "#fff", "#d1d5db") + t(240, 256, "T = |A ∩ B| / |A ∪ B|", { anchor: "middle", mono: true, bold: true });
  files["molecules/similarity"] = svg("Two fingerprints as overlapping sets; Tanimoto similarity is the shared part divided by the whole", b);
}

// translate: DNA codons into amino acids, with the partner strand
{
  let b = head("DNA → protein, three letters at a time");
  const codons = ["ATG", "GCC", "TAA"], aa = [["M", "Met"], ["A", "Ala"], ["stop", ""]];
  const pair = { A: "T", T: "A", G: "C", C: "G" };
  codons.forEach((c, i) => {
    const x = 70 + i * 120;
    b += rect(x, 104, 96, 34, i === 2 ? "#fee2e2" : "#fff", i === 2 ? "#b91c1c" : "#d1d5db") + t(x + 48, 127, c, { mono: true, size: 17, anchor: "middle", bold: true });
    b += t(x + 48, 88, [...c].map((ch) => pair[ch]).join(""), { mono: true, size: 14, anchor: "middle", fill: "#9ca3af" });
    b += arrow(x + 48, 144, x + 48, 172);
    b += rect(x + 18, 180, 60, 34, i === 2 ? "#fee2e2" : EMBG, "none", { rx: 17 }) + t(x + 48, 202, aa[i][0], { anchor: "middle", bold: true, fill: i === 2 ? "#b91c1c" : EM });
    if (aa[i][1]) b += t(x + 48, 232, aa[i][1], { anchor: "middle", fill: "#6b7280", size: 12 });
  });
  b += t(32, 92, "partner", { fill: "#9ca3af", size: 11 });
  b += foot("ATGGCCTAA → \"MA\"");
  files["biomolecules/translate"] = svg("The DNA ATGGCCTAA read as codons ATG, GCC, TAA: methionine, alanine, stop", b);
}

// sequence_identity: an alignment with matches marked, and the DP recurrence
{
  let b = head("Line them up, count the agreements");
  const a = "MK-LV", c = "MKALI";
  [...a].forEach((ch, i) => {
    const x = 90 + i * 40;
    const same = ch === c[i];
    const gap = ch === "-" || c[i] === "-";
    b += rect(x - 15, 78, 30, 30, gap ? "#f3f4f6" : "#fff", "#d1d5db", { rx: 6 }) + t(x, 99, ch, { mono: true, anchor: "middle", bold: true, size: 15 });
    b += rect(x - 15, 138, 30, 30, "#fff", "#d1d5db", { rx: 6 }) + t(x, 159, c[i], { mono: true, anchor: "middle", bold: true, size: 15 });
    b += t(x, 128, gap ? " " : same ? "|" : "·", { mono: true, anchor: "middle", fill: same ? EM : "#9ca3af", bold: true, size: 15 });
  });
  b += t(170, 196, "3 identical of 4 gap-free columns", { anchor: "middle", fill: EM, size: 12.5 });
  b += t(170, 214, "= 75% identity", { anchor: "middle", fill: EM, size: 12.5, bold: true });
  // DP cell
  const gx = 320, gy = 80, s = 44;
  b += rect(gx, gy, s, s, "#f3f4f6", "#d1d5db", { rx: 4 }) + rect(gx + s, gy, s, s, "#f3f4f6", "#d1d5db", { rx: 4 }) + rect(gx, gy + s, s, s, "#f3f4f6", "#d1d5db", { rx: 4 });
  b += rect(gx + s, gy + s, s, s, EMBG, EM, { rx: 4 }) + t(gx + s * 1.5, gy + s * 1.5 + 5, "F", { anchor: "middle", bold: true, fill: EM });
  b += arrow(gx + s * 0.6, gy + s * 0.6, gx + s * 1.25, gy + s * 1.25, EM) + arrow(gx + s * 1.5, gy + s * 0.7, gx + s * 1.5, gy + s * 1.18) + arrow(gx + s * 0.7, gy + s * 1.5, gx + s * 1.18, gy + s * 1.5);
  b += t(gx + s, 214, "best of three moves", { anchor: "middle", fill: "#6b7280", size: 12 });
  b += foot("Needleman–Wunsch: the bottom-right cell is the best score", 260);
  files["biomolecules/sequence_identity"] = svg("Two aligned sequences, MK-LV over MKALI, with matches marked, beside a Needleman-Wunsch table cell taking the best of three moves", b);
}

// pdb_neighbours: a residue, its 4 Å shell, and the residues inside it
{
  let b = head("Who is within 4 Å of Cys16?");
  let seed = 11;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  b += circle(240, 155, 92, "rgba(4,120,87,0.08)", EM, 1.5);
  b += line(240, 155, 240, 247, EM, 1.5) + t(248, 236, "4 Å", { fill: EM, size: 12, bold: true });
  const inside = ["12", "13", "14", "15", "17", "18", "19", "21", "26"];
  inside.forEach((n, i) => {
    const a = (i / inside.length) * Math.PI * 2 + 0.3, r = 52 + rnd() * 26;
    const x = 240 + r * Math.cos(a), y = 155 + r * Math.sin(a);
    b += circle(x, y, 12, n === "26" ? "#fef3c7" : "#dbeafe", n === "26" ? "#b45309" : "#2563eb") + t(x, y + 4, n, { anchor: "middle", size: 10.5, bold: true, fill: "#1f2937" });
  });
  for (const [x, y] of [[70, 110], [96, 210], [400, 210], [420, 140], [130, 70]]) b += circle(x, y, 7, "#e5e7eb");
  b += t(70, 236, "farther away", { anchor: "middle", fill: "#9ca3af", size: 11 });
  b += circle(240, 155, 16, "#fde68a", "#b45309", 2) + t(240, 160, "16", { anchor: "middle", bold: true, size: 12 });
  b += t(370, 70, "Cys26: its", { fill: "#b45309", size: 12 }) + t(370, 86, "disulphide partner", { fill: "#b45309", size: 12 });
  b += foot("crambin (PDB 1CRN): 9 residues touch Cys16");
  files["biomolecules/pdb_neighbours"] = svg("Residue Cys16 of crambin with a 4 angstrom shell around it and the nine residues inside it, Cys26 among them", b);
}

// alphafold_plddt: crambin's real per-residue pLDDT as bars coloured by band
{
  const P = [89.94, 91.94, 95.38, 95.94, 95.19, 95.06, 94.94, 95.88, 96.19, 95.12, 96.31, 96.94, 96.31, 95.94, 97.19, 97.06, 96.5, 96.69, 95.44, 94.75, 94.69, 95.62, 94.81, 95.12, 96.25, 97.25, 95.88, 95.5, 94.88, 95.25, 94.81, 95.69, 94.56, 94.56, 93.38, 91.25, 87.12, 86.62, 90.25, 92.12, 89.25, 88.25, 88.25, 90.44, 83.94, 75.44];
  const col = (p) => (p > 90 ? "#0053d6" : p > 70 ? "#65cbf3" : p > 50 ? "#ffdb13" : "#ff7d45");
  let b = head("Crambin's AlphaFold model: pLDDT per residue");
  const x0 = 50, y0 = 230, w = 8.6, scale = 1.6;
  for (const v of [50, 70, 90]) b += line(x0, y0 - v * scale, x0 + 46 * w, y0 - v * scale, "#e5e7eb", 1) + t(x0 - 6, y0 - v * scale + 4, String(v), { anchor: "end", size: 10.5, fill: "#9ca3af" });
  P.forEach((p, i) => (b += rect(x0 + i * w + 0.8, y0 - p * scale, w - 1.6, p * scale, col(p), "none", { rx: 1.5 })));
  b += line(x0, y0, x0 + 46 * w, y0, "#9ca3af", 1);
  b += t(x0, y0 + 16, "1", { size: 10.5, fill: "#6b7280" }) + t(x0 + 46 * w, y0 + 16, "46", { size: 10.5, fill: "#6b7280", anchor: "end" });
  const leg = [["#0053d6", "> 90"], ["#65cbf3", "> 70"], ["#ffdb13", "> 50"], ["#ff7d45", "≤ 50"]];
  leg.forEach(([c, s], i) => (b += rect(60 + i * 90, 260, 14, 14, c, "none", { rx: 3 }) + t(80 + i * 90, 272, s, { size: 11.5 })));
  b += t(456, 272, "mean 93.5", { anchor: "end", size: 12, bold: true, fill: "#0053d6" });
  files["pro/alphafold_plddt"] = svg("Bar chart of the pLDDT of each of crambin's 46 residues in its AlphaFold model, mostly above 90, ending at 75 at the C-terminus", b);
}

// rmsd: two curves superposed, with the deviations
{
  let b = head("Superpose, then measure: RMSD");
  const base = [[60, 170], [100, 120], [140, 160], [180, 110], [220, 150], [260, 100], [300, 140], [340, 110], [380, 160], [420, 130]];
  const off = [[0, 8], [4, -6], [-3, 10], [5, 6], [-4, -8], [3, 9], [-5, 5], [4, -7], [-3, 9], [6, -4]];
  const model = base.map(([x, y], i) => [x + off[i][0], y + off[i][1]]);
  b += path(smooth(base), "#0f766e", 4) + path(smooth(model), "#0053d6", 3, "none", " stroke-dasharray='7 5'");
  base.forEach((p, i) => (b += line(...p, ...model[i], "#b91c1c", 1.5) + circle(...p, 3.5, "#0f766e") + circle(...model[i], 3.5, "#0053d6")));
  b += rect(40, 196, 14, 4, "#0f766e", "none", { rx: 2 }) + t(60, 202, "crystal 1CRN", { size: 12 });
  b += rect(170, 196, 14, 4, "#0053d6", "none", { rx: 2 }) + t(190, 202, "AlphaFold model", { size: 12 });
  b += line(310, 198, 324, 198, "#b91c1c", 2) + t(330, 202, "deviation", { size: 12 });
  b += rect(80, 222, 320, 32, "#fff", "#d1d5db") + t(240, 243, "RMSD = √(mean of squared deviations)", { anchor: "middle", mono: true, size: 12.5 });
  b += foot("crambin, alpha carbons: 0.43 Å", 280);
  files["pro/rmsd"] = svg("A predicted backbone laid over the crystal structure with the deviation between matching atoms drawn; for crambin the RMSD is 0.43 angstroms", b);
}

for (const [id, s] of Object.entries(files)) writeFileSync(`${ROOT}/${id}/diagram.svg`, s);
console.log(Object.keys(files).length, "pictures");
// silence unused-import lint in editors
void [MONO, esc, helix];
