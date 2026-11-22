// Generates the Concept pages' illustrations into public/concepts/ (480 × 300, the site's drawing style).
// Run from frontend/: node scripts/concept-drawings.mjs public/concepts
// Numbers drawn are textbook values: valence electrons, bond lengths (H2 0.74 Å, O2 1.21 Å, N2 1.10 Å), angles.
import { mkdirSync, writeFileSync } from "node:fs";
import {
  EM,
  EMBG,
  arrow,
  atom,
  circle,
  helix,
  hexagon,
  line,
  path,
  rect,
  smooth,
  svg,
  t,
} from "./svgkit.mjs";

const OUT = process.argv[2];
mkdirSync(OUT, { recursive: true });
const files = {};
const head = (s) => t(24, 40, s, { size: 14, bold: true, fill: "#111827" });
const foot = (s, y = 282) =>
  t(240, y, s, { anchor: "middle", fill: "#6b7280", size: 12.5 });
const e = (x, y, c = "#2563eb") => circle(x, y, 4, c);

// 1. an atom: carbon's nucleus, shells and valence electrons; Lewis dots of H, C, N, O
{
  let b = head("An atom: a nucleus and its electrons");
  const cx = 118,
    cy = 160;
  b +=
    circle(cx, cy, 82, "none", EM, 1.5) +
    circle(cx, cy, 44, "none", "#9ca3af", 1.5);
  b +=
    circle(cx, cy, 20, "#fee2e2", "#b91c1c", 2) +
    t(cx, cy - 2, "6 p", {
      anchor: "middle",
      size: 11,
      bold: true,
      fill: "#b91c1c",
    }) +
    t(cx, cy + 11, "6 n", { anchor: "middle", size: 11, fill: "#6b7280" });
  for (const a of [0, Math.PI])
    b += e(cx + 44 * Math.cos(a), cy + 44 * Math.sin(a), "#6b7280");
  for (const a of [0.5, 2.1, 3.7, 5.3])
    b += e(cx + 82 * Math.cos(a), cy + 82 * Math.sin(a), EM);
  b += t(cx, 66, "carbon", { anchor: "middle", bold: true });
  b +=
    circle(46, 258, 4, "#6b7280") +
    t(56, 262, "2 inner", { size: 11.5, fill: "#6b7280" });
  b +=
    circle(118, 258, 4, EM) +
    t(128, 262, "4 valence", { size: 11.5, fill: EM, bold: true });
  // Lewis dots: one electron per side first, then pairs
  b += t(355, 66, "valence electrons → usual bonds", {
    anchor: "middle",
    size: 12,
    fill: "#6b7280",
  });
  const lewis = [
    ["H", 1, 1],
    ["C", 4, 4],
    ["N", 5, 3],
    ["O", 6, 2],
  ];
  const sides = [
    [0, -1],
    [1, 0],
    [0, 1],
    [-1, 0],
  ];
  lewis.forEach(([el, v, bonds], i) => {
    const x = 270 + (i % 2) * 120,
      y = 118 + Math.floor(i / 2) * 84;
    b += t(x, y + 8, el, {
      anchor: "middle",
      size: 22,
      bold: true,
      fill: "#111827",
    });
    const count = [0, 0, 0, 0];
    for (let k = 0; k < v; k++) count[k % 4]++;
    sides.forEach(([sx, sy], k) => {
      const n = count[k];
      for (let j = 0; j < n; j++) {
        const off = n === 2 ? (j ? 5 : -5) : 0;
        b += e(x + sx * 19 + (sy ? off : 0), y + sy * 19 + (sx ? off : 0), EM);
      }
    });
    b += t(x + 30, y + 5, `${v} → ${bonds}`, { size: 12, fill: "#374151" });
  });
  b += foot("atoms share electrons until each has 8 around it (hydrogen: 2)");
  files["atom.svg"] = svg(
    "A carbon atom: a nucleus of 6 protons and 6 neutrons, 2 inner electrons and 4 valence electrons; Lewis dots for hydrogen, carbon, nitrogen and oxygen with their usual numbers of bonds",
    b,
  );
}

// 2. bonds: shared pairs, single, double, triple, with lengths
{
  let b = head("A bond is a shared pair of electrons");
  const rows = [
    ["H", "H", 1, "single", "H₂ 0.74 Å"],
    ["O", "O", 2, "double", "O₂ 1.21 Å"],
    ["N", "N", 3, "triple", "N₂ 1.10 Å"],
  ];
  rows.forEach(([a1, a2, n, name, len], i) => {
    const y = 90 + i * 70,
      x1 = 110,
      x2 = 210;
    b += atom(x1, y, a1) + atom(x2, y, a2);
    for (let k = 0; k < n; k++) {
      const dy = (k - (n - 1) / 2) * 14;
      b +=
        rect(144, y + dy - 6, 32, 12, EMBG, EM, { rx: 6, sw: 1 }) +
        e(153, y + dy, EM) +
        e(167, y + dy, EM);
    }
    b += t(250, y - 2, `${name}: ${n} shared pair${n > 1 ? "s" : ""}`, {
      size: 13,
      bold: true,
    });
    b += t(250, y + 16, len, { size: 12, fill: "#6b7280" });
  });
  b += foot(
    "more shared pairs: a shorter, stronger bond (C–C 1.54 Å, C=C 1.34 Å)",
  );
  files["bonds.svg"] = svg(
    "Single, double and triple bonds drawn as one, two and three shared electron pairs: H2 0.74 Å, O2 1.21 Å, N2 1.10 Å",
    b,
  );
}

// 3. shapes: linear, trigonal planar, tetrahedral
{
  let b = head("Electron pairs push apart: the shapes of molecules");
  // linear CO2
  b +=
    line(40, 150, 140, 150, "#374151", 3) +
    atom(40, 150, "O") +
    atom(90, 150, "C") +
    atom(140, 150, "O");
  b +=
    t(90, 200, "linear, 180°", { anchor: "middle", bold: true }) +
    t(90, 218, "CO₂", { anchor: "middle", fill: "#6b7280", size: 12 });
  // trigonal planar formaldehyde
  const c2 = [240, 160];
  b +=
    line(...c2, 240, 105, "#374151", 3) +
    line(...c2, 195, 186, "#374151", 3) +
    line(...c2, 285, 186, "#374151", 3);
  b +=
    atom(240, 105, "O") +
    atom(195, 186, "H") +
    atom(285, 186, "H") +
    atom(...c2, "C");
  b += t(262, 222 - 70, "120°", { size: 11, fill: "#b45309" });
  b +=
    t(240, 222, "trigonal, 120°", { anchor: "middle", bold: true }) +
    t(240, 240, "formaldehyde", {
      anchor: "middle",
      fill: "#6b7280",
      size: 12,
    });
  // tetrahedral methane: one bond towards you (wedge), one away (hashed)
  const c3 = [390, 150];
  b += line(...c3, 390, 94, "#374151", 3) + line(...c3, 340, 182, "#374151", 3);
  b += `<path d='M390,150 L428,192 L438,182 Z' fill='#374151'/>`;
  {
    const [dx, dy] = [56, -14],
      L = Math.hypot(dx, dy),
      ux = dx / L,
      uy = dy / L;
    for (let k = 1; k <= 5; k++) {
      const px = 390 + ux * k * 9,
        py = 150 + uy * k * 9,
        w = 1 + k * 1.3;
      b += line(
        px - uy * w,
        py + ux * w,
        px + uy * w,
        py - ux * w,
        "#374151",
        1.5,
      );
    }
  }
  b +=
    atom(390, 94, "H") +
    atom(340, 182, "H") +
    atom(436, 192, "H") +
    atom(448, 136, "H") +
    atom(...c3, "C");
  b +=
    t(390, 222, "tetrahedral, 109.5°", { anchor: "middle", bold: true }) +
    t(390, 240, "methane (wedge: towards you)", {
      anchor: "middle",
      fill: "#6b7280",
      size: 12,
    });
  b += foot("shape decides what a molecule can bind: a key and its lock");
  files["shapes.svg"] = svg(
    "Three molecular shapes: linear carbon dioxide at 180 degrees, trigonal formaldehyde at 120 degrees and tetrahedral methane at 109.5 degrees",
    b,
  );
}

// 4. a graph as an adjacency matrix
{
  let b = head("A molecule's graph as a matrix");
  const P = [
    [70, 150],
    [150, 150],
    [230, 150],
  ];
  b +=
    line(...P[0], ...P[1], "#374151", 3) +
    line(150, 145, 230, 145, "#374151", 3) +
    line(150, 155, 230, 155, "#374151", 3);
  ["C", "C", "O"].forEach(
    (el, i) =>
      (b +=
        atom(...P[i], el) +
        t(P[i][0], 185, String(i), {
          anchor: "middle",
          fill: "#6b7280",
          size: 12,
          bold: true,
        })),
  );
  b += t(150, 105, "CC=O", { anchor: "middle", mono: true, bold: true });
  const A = [
    [0, 1, 0],
    [1, 0, 1],
    [0, 1, 0],
  ];
  const x0 = 300,
    y0 = 95,
    s = 40;
  for (let i = 0; i < 3; i++) {
    b += t(x0 - 14, y0 + i * s + 25, String(i), {
      anchor: "middle",
      fill: "#6b7280",
      size: 12,
      bold: true,
    });
    b += t(x0 + i * s + 20, y0 - 8, String(i), {
      anchor: "middle",
      fill: "#6b7280",
      size: 12,
      bold: true,
    });
    for (let j = 0; j < 3; j++) {
      b += rect(
        x0 + j * s,
        y0 + i * s,
        s - 4,
        s - 4,
        A[i][j] ? EMBG : "#fff",
        A[i][j] ? EM : "#d1d5db",
        { rx: 4 },
      );
      b += t(x0 + j * s + 18, y0 + i * s + 25, String(A[i][j]), {
        anchor: "middle",
        mono: true,
        bold: true,
        fill: A[i][j] ? EM : "#9ca3af",
      });
    }
  }
  b += t(x0 + 58, 240, "A_ij = 1 when atoms i and j are bonded", {
    anchor: "middle",
    size: 12,
    fill: EM,
  });
  b += foot("each row adds up to the atom's degree: 1, 2, 1");
  files["adjacency.svg"] = svg(
    "Acetaldehyde CC=O with atoms numbered 0, 1, 2 beside its 3 by 3 adjacency matrix, with ones where atoms are bonded",
    b,
  );
}

// 5. a protein's levels: sequence → helix and sheet → fold → pocket
{
  let b = head("From sequence to function");
  const letters = "MKTAYIAK";
  [...letters].forEach((ch, i) => {
    const x = 34 + (i % 4) * 22,
      y = 90 + Math.floor(i / 4) * 24;
    b +=
      circle(x, y, 10, "#fff", "#9ca3af") +
      t(x, y + 4, ch, { anchor: "middle", mono: true, size: 11, bold: true });
  });
  b +=
    t(66, 165, "sequence", { anchor: "middle", bold: true, size: 12.5 }) +
    t(66, 182, "(1°)", { anchor: "middle", fill: "#6b7280", size: 11 });
  b += arrow(118, 110, 138, 110);
  b += path(smooth(helix(150, 92, 210, 3, 12)), "#2563eb", 4);
  for (const y of [126, 142])
    b += `<path d='M150,${y} L198,${y} L198,${y - 5} L210,${y + 2} L198,${y + 9} L198,${y + 4} L150,${y + 4} Z' fill='#d97706'/>`;
  b +=
    t(180, 182, "helix and sheet", {
      anchor: "middle",
      bold: true,
      size: 12.5,
    }) + t(180, 199, "(2°)", { anchor: "middle", fill: "#6b7280", size: 11 });
  b += arrow(226, 110, 246, 110);
  b += path(
    smooth([
      [262, 140],
      [258, 100],
      ...helix(266, 92, 316, 2, 10),
      [334, 110],
      [322, 148],
      [290, 152],
      [276, 128],
      [300, 120],
    ]),
    "#2563eb",
    5,
  );
  b +=
    t(296, 182, "fold", { anchor: "middle", bold: true, size: 12.5 }) +
    t(296, 199, "(3°)", { anchor: "middle", fill: "#6b7280", size: 11 });
  b += arrow(346, 110, 366, 110);
  b += path(
    "M380,80 Q420,60 452,86 Q470,118 452,150 Q420,170 392,150 Q414,128 402,112 Q396,96 380,80 Z",
    "#2563eb",
    2,
    "#dbeafe",
  );
  b += hexagon(418, 118, 11, "#b45309");
  b +=
    t(420, 182, "function", { anchor: "middle", bold: true, size: 12.5 }) +
    t(420, 199, "a pocket binds", {
      anchor: "middle",
      fill: "#6b7280",
      size: 11,
    });
  b += foot("the sequence alone holds the shape (Anfinsen, 1961)", 250);
  files["protein-levels.svg"] = svg(
    "A protein in four steps: a sequence of letters, helices and sheets, a compact fold, and a pocket where a small molecule binds",
    b,
  );
}

// 6. checking an AI result: four steps, cheapest to most convincing
{
  let b = head("Checking an AI result: four questions");
  const steps = [
    ["1", "Is the model sure?", "pLDDT, PAE"],
    ["2", "Does it obey physics?", "clashes, MD"],
    ["3", "Does it match what is known?", "RMSD"],
    ["4", "Does it work?", "make, measure"],
  ];
  steps.forEach(([n, q, how], i) => {
    const x = 30 + i * 108,
      h = 60 + i * 34,
      y = 250 - h;
    b += rect(x, y, 96, h, i === 3 ? EM : EMBG, EM, { rx: 8 });
    b += t(x + 48, y + 22, n, {
      anchor: "middle",
      bold: true,
      size: 15,
      fill: i === 3 ? "#fff" : EM,
    });
    const words = q.split(" ");
    const mid = Math.ceil(words.length / 2);
    b += t(x + 48, y - 26, words.slice(0, mid).join(" "), {
      anchor: "middle",
      size: 11.5,
      bold: true,
    });
    b += t(x + 48, y - 11, words.slice(mid).join(" "), {
      anchor: "middle",
      size: 11.5,
      bold: true,
    });
    b += t(x + 48, y + 42, how, {
      anchor: "middle",
      size: 11,
      fill: i === 3 ? "#fff" : "#374151",
    });
  });
  b +=
    arrow(40, 270, 440, 270, "#9ca3af") +
    t(240, 290, "cheaper → more convincing", {
      anchor: "middle",
      size: 12,
      fill: "#6b7280",
    });
  files["check-ladder.svg"] = svg(
    "Four steps of checking an AI result as rising steps: model confidence, physics, agreement with experiment, and a real experiment",
    b,
  );
}

// the path: four stages from school chemistry to research
{
  let b = head("From school chemistry to research");
  const stages = [
    [["Read &", "compute"], "SMILES, properties, similarity", EMBG],
    [["Structures"], "PDB files, pockets, geometry", "#dbeafe"],
    [["Energy &", "quantum"], "force fields, DFT, colour", "#ede9fe"],
    [["Machine", "learning"], "models, honest tests, design", "#fef3c7"],
  ];
  stages.forEach(([name, what, colour], i) => {
    const w = 104,
      x = 24 + i * 112,
      h = 62 + i * 26,
      y = 236 - h;
    b += rect(x, y, w, h, colour, EM, { rx: 8 });
    b += t(x + w / 2, y + 20, String(i + 1), {
      anchor: "middle",
      bold: true,
      fill: EM,
      size: 14,
    });
    name.forEach(
      (word, k) =>
        (b += t(x + w / 2, y + 36 + k * 14, word, {
          anchor: "middle",
          size: 11.5,
          bold: true,
        })),
    );
    what
      .split(", ")
      .forEach(
        (word, k) =>
          (b += t(x + w / 2, 262 + k * 13, word, {
            anchor: "middle",
            size: 10,
            fill: "#4b5563",
          })),
      );
  });
  b += arrow(24, 248, 456, 248, "#9ca3af");
  b += t(24, 62, "school chemistry", { size: 11.5, fill: "#6b7280" });
  b += t(456, 62, "research", { anchor: "end", size: 11.5, fill: "#6b7280" });
  files["path.svg"] = svg(
    "Four stages: reading and computing molecules, structures, energy and quantum chemistry, and machine learning",
    b,
  );
}

// energy landscape: minimisation and conformers
{
  let b = head("Shape costs energy");
  const x0 = 46,
    x1 = 440,
    base = 236,
    top = 72;
  const f = (u) =>
    0.55 + 0.42 * Math.sin(u * 7.6 + 1.1) + 0.2 * Math.sin(u * 3.1) - 0.3 * u;
  const vals = [...Array(61)].map((_, k) => f(k / 60));
  const lo = Math.min(...vals),
    hi = Math.max(...vals);
  const yOf = (u) => base - ((f(u) - lo) / (hi - lo)) * (base - top);
  const at = (u) => [x0 + u * (x1 - x0), yOf(u)];
  const pts = [...Array(61)].map((_, k) => at(k / 60));
  b += path(smooth(pts), "#374151", 2.5);
  b += line(x0, base + 10, x1, base + 10, "#9ca3af", 1.5);
  b += t(
    (x0 + x1) / 2,
    base + 28,
    "the shape of the molecule (one twist of one bond)",
    { anchor: "middle", size: 11.5, fill: "#6b7280" },
  );
  b += t(26, (base + top) / 2, "energy", {
    anchor: "middle",
    size: 11.5,
    fill: "#6b7280",
  });
  const findMin = (from) => {
    let best = from;
    for (let k = 0; k <= 60; k++) {
      const u = k / 60;
      if (Math.abs(u - from) < 0.22 && f(u) < f(best)) best = u;
    }
    return best;
  };
  const start = 0.33,
    end = findMin(start);
  b += circle(...at(start), 7, "#9ca3af");
  b += arrow(
    at(start)[0] + 6,
    at(start)[1] + 6,
    at(end)[0] - 6,
    at(end)[1] - 8,
    EM,
  );
  b += circle(...at(end), 8, EM);
  b += t(at(start)[0] - 6, at(start)[1] - 14, "a first guess", {
    anchor: "end",
    size: 11,
    fill: "#6b7280",
  });
  b += t(at(end)[0] + 14, at(end)[1] - 10, "the nearest minimum", {
    size: 11,
    fill: EM,
    bold: true,
  });
  [0.08, 0.62, 0.86].forEach(
    (u) => (b += circle(...at(u), 6, "#fff", "#374151", 2)),
  );
  b += t(x1, top + 4, "other shapes it also takes", {
    anchor: "end",
    size: 11.5,
    fill: "#374151",
  });
  b += foot("minimisation walks downhill; molecular dynamics explores", 282);
  files["energy.svg"] = svg(
    "An energy landscape with several minima: a first guess rolls downhill into the nearest one, and other minima are other shapes the molecule can take",
    b,
  );
}

// quantum methods: cost against accuracy
{
  let b = head("Quantum chemistry: cost against what it answers");
  const rows = [
    ["Hückel", "a graph's eigenvalues", "atoms: thousands", "#d1fae5"],
    ["Force field", "no electrons at all", "atoms: millions", "#d1fae5"],
    ["Hartree-Fock", "electrons, averaged", "atoms: hundreds", "#dbeafe"],
    ["DFT", "electrons + correlation", "atoms: hundreds", "#ede9fe"],
    ["TD-DFT", "excited states: colour", "atoms: tens to hundreds", "#fde68a"],
    ["Coupled cluster", "the reference answer", "atoms: tens", "#fecaca"],
  ];
  rows.forEach(([name, what, size, colour], i) => {
    const y = 64 + i * 34;
    b +=
      rect(24, y, 120, 26, colour, "none", { rx: 6 }) +
      t(84, y + 18, name, { anchor: "middle", size: 12, bold: true });
    b += t(156, y + 18, what, { size: 12, fill: "#374151" });
    b += t(456, y + 18, size, { anchor: "end", size: 11.5, fill: "#6b7280" });
  });
  b +=
    arrow(14, 60, 14, 262, "#9ca3af") +
    t(8, 160, "more expensive", {
      anchor: "middle",
      size: 10.5,
      fill: "#6b7280",
    });
  b += foot("pick the cheapest method that can answer your question", 282);
  files["methods.svg"] = svg(
    "A ladder of methods from Hückel and force fields through Hartree-Fock and DFT to coupled cluster, with what each answers and how large a system it can treat",
    b,
  );
}

// honest testing: random split against scaffold split
{
  let b = head("The test that lies, and the test that does not");
  const draw = (x0, title, mixed) => {
    b += t(x0 + 96, 72, title, { anchor: "middle", size: 12.5, bold: true });
    let seed = mixed ? 5 : 11;
    const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    for (let k = 0; k < 36; k++) {
      const col = k % 6,
        row = Math.floor(k / 6);
      const x = x0 + col * 32,
        y = 92 + row * 26;
      // three scaffold families, drawn as three shapes
      const family = mixed ? k % 3 : Math.floor(k / 12);
      const test = mixed ? rnd() < 0.3 : family === 2;
      const colour = ["#2563eb", "#c2410c", "#0f766e"][family];
      b += test
        ? rect(x, y, 18, 18, "#fff", colour, { rx: 4, sw: 2.5 })
        : rect(x, y, 18, 18, colour, "none", { rx: 4 });
    }
  };
  draw(28, "random split", true);
  draw(272, "by scaffold", false);
  b += t(124, 258, "the same scaffolds on both sides:", {
    anchor: "middle",
    size: 11.5,
    fill: "#b91c1c",
  });
  b += t(124, 274, "the score flatters the model", {
    anchor: "middle",
    size: 11.5,
    fill: "#b91c1c",
  });
  b += t(368, 258, "new scaffolds held out:", {
    anchor: "middle",
    size: 11.5,
    fill: EM,
  });
  b += t(368, 274, "the score you can believe", {
    anchor: "middle",
    size: 11.5,
    fill: EM,
  });
  b +=
    rect(232, 118, 16, 16, "#374151", "none", { rx: 3 }) +
    t(240, 148, "train", { anchor: "middle", size: 11, fill: "#6b7280" });
  b +=
    rect(232, 168, 16, 16, "#fff", "#374151", { rx: 3, sw: 2.5 }) +
    t(240, 198, "test", { anchor: "middle", size: 11, fill: "#6b7280" });
  files["splits.svg"] = svg(
    "Two ways to split molecules for testing: a random split leaves the same scaffolds on both sides, while a scaffold split holds whole families out",
    b,
  );
}

for (const [name, s] of Object.entries(files))
  writeFileSync(`${OUT}/${name}`, s);
console.log(Object.keys(files).length, "concept pictures");
