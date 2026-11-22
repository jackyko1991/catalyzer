// Shared drawing helpers for the site's SVG pictures (History cards, problem pictures): 480 × 300, one style.
export const SANS = "ui-sans-serif,system-ui,-apple-system,Segoe UI,sans-serif";
export const MONO = "ui-monospace,SFMono-Regular,Menlo,monospace";
export const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
export const t = (x, y, s, o = {}) =>
  `<text x='${x}' y='${y}' font-size='${o.size ?? 13}' fill='${o.fill ?? "#374151"}' font-family='${o.mono ? MONO : SANS}' text-anchor='${o.anchor ?? "start"}' font-weight='${o.bold ? 600 : "normal"}'>${esc(s)}</text>`;
export const rect = (x, y, w, h, fill, stroke = "none", o = {}) =>
  `<rect x='${x}' y='${y}' width='${w}' height='${h}' rx='${o.rx ?? 10}' fill='${fill}' stroke='${stroke}' stroke-width='${o.sw ?? 1.5}'${o.dash ? ` stroke-dasharray='${o.dash}'` : ""}/>`;
export const line = (x1, y1, x2, y2, stroke = "#6b7280", sw = 2) =>
  `<line x1='${x1}' y1='${y1}' x2='${x2}' y2='${y2}' stroke='${stroke}' stroke-width='${sw}' stroke-linecap='round'/>`;
export const circle = (cx, cy, r, fill, stroke = "none", sw = 1.5) =>
  `<circle cx='${cx}' cy='${cy}' r='${r}' fill='${fill}' stroke='${stroke}' stroke-width='${sw}'/>`;
export const path = (d, stroke, sw = 2, fill = "none", extra = "") =>
  `<path d='${d}' fill='${fill}' stroke='${stroke}' stroke-width='${sw}' stroke-linecap='round' stroke-linejoin='round'${extra}/>`;
export const arrow = (x1, y1, x2, y2, c = "#6b7280") => {
  const a = Math.atan2(y2 - y1, x2 - x1), h = 8;
  const p1 = [x2 - h * Math.cos(a - 0.45), y2 - h * Math.sin(a - 0.45)];
  const p2 = [x2 - h * Math.cos(a + 0.45), y2 - h * Math.sin(a + 0.45)];
  return line(x1, y1, x2, y2, c, 2) + `<path d='M${x2},${y2} L${p1} L${p2} Z' fill='${c}'/>`;
};
export const svg = (title, body) =>
  `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 480 300' width='480' height='300' role='img'><title>${esc(title)}</title>${rect(0, 0, 480, 300, "#f8fafc", "none", { rx: 14 })}${body}</svg>`;
export const EM = "#047857", EMBG = "#d1fae5";
export const atom = (x, y, el) => {
  const col = { C: ["#e5e7eb", "#374151"], O: ["#fee2e2", "#b91c1c"], N: ["#dbeafe", "#1d4ed8"], H: ["#fff", "#6b7280"] }[el];
  return circle(x, y, 15, col[0], col[1], 2) + t(x, y + 5, el, { anchor: "middle", fill: col[1], bold: true, size: 14 });
};
export const hexagon = (cx, cy, r, stroke = "#374151", aromatic = true) => {
  const pts = [...Array(6)].map((_, i) => [cx + r * Math.cos((Math.PI / 3) * i - Math.PI / 2), cy + r * Math.sin((Math.PI / 3) * i - Math.PI / 2)]);
  return path(`M${pts.map((p) => p.map((v) => v.toFixed(1)).join(",")).join(" L")} Z`, stroke, 2.2) + (aromatic ? circle(cx, cy, r * 0.55, "none", stroke, 1.6) : "");
};
// A smooth wavy "ribbon" through given points (Catmull-Rom → cubic Bézier)
export const smooth = (pts) => {
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] ?? p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1.map((v) => v.toFixed(1))} ${c2.map((v) => v.toFixed(1))} ${p2}`;
  }
  return d;
};
export const helix = (x0, y0, x1, turns, amp) => {
  const pts = [];
  for (let i = 0; i <= turns * 4; i++) pts.push([x0 + ((x1 - x0) * i) / (turns * 4), y0 + [0, -amp, 0, amp][i % 4]]);
  return pts;
};

