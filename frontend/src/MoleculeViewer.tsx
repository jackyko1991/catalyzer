/**
 * A 3D molecule viewer with a choice of rendering: proteins as a ribbon, sticks, space-filling spheres, lines or a
 * molecular surface, coloured by element, along the chain (rainbow, N → C), by secondary structure, or by
 * AlphaFold's confidence (pLDDT, kept in the B-factor column); small molecules as ball-and-stick, sticks,
 * space-filling or lines. 3Dmol.js (BSD-3) is loaded on first use, so it stays out of the main bundle. Changing the
 * rendering keeps the view where the reader left it.
 */
import { useLang } from "@learnkit/web";
import { useEffect, useRef, useState } from "react";

export type ViewStyle = "cartoon" | "stick";
export type Colouring = "element" | "plddt" | { colour: string };

export interface ViewerModel {
  /** file under public/ (e.g. "structures/1crn.pdb") or inline data */
  url?: string;
  data?: string;
  format: "pdb" | "sdf";
  /** how it is drawn at first; the reader can change it */
  style: ViewStyle;
  colour: Colouring;
}

/** AlphaFold DB's four confidence colours */
export const PLDDT_BANDS: { min: number; colour: string; label: readonly [string, string] }[] = [
  { min: 90, colour: "#0053d6", label: ["Very high (> 90)", "非常高（> 90）"] },
  { min: 70, colour: "#65cbf3", label: ["Confident (70–90)", "有信心（70–90）"] },
  { min: 50, colour: "#ffdb13", label: ["Low (50–70)", "低（50–70）"] },
  { min: -1, colour: "#ff7d45", label: ["Very low (< 50)", "非常低（< 50）"] },
];
const plddtColour = (b: number) => PLDDT_BANDS.find((band) => b > band.min)!.colour;

type Render = "cartoon" | "ballstick" | "stick" | "sphere" | "line" | "surface";
type Paint = "given" | "element" | "spectrum" | "ss" | "plddt";

const RENDER_LABEL: Record<Render, readonly [string, string]> = {
  cartoon: ["Ribbon", "緞帶"],
  ballstick: ["Ball and stick", "球棍"],
  stick: ["Sticks", "棍狀"],
  sphere: ["Space-filling", "空間填充"],
  line: ["Lines", "線條"],
  surface: ["Surface", "分子表面"],
};
const PAINT_LABEL: Record<Paint, readonly [string, string]> = {
  given: ["As shown", "預設"],
  element: ["By element", "依元素"],
  spectrum: ["Along the chain (N → C)", "沿著鏈（N → C）"],
  ss: ["Helix, sheet, loop", "螺旋、摺板、環圈"],
  plddt: ["Confidence (pLDDT)", "信心分數（pLDDT）"],
};
const SS_COLOUR: Record<string, string> = { h: "#db2777", s: "#d97706" };

type ThreeDmol = typeof import("3dmol");
let loading: Promise<ThreeDmol> | null = null;
const load3Dmol = () => (loading ??= import("3dmol"));

const text = async (m: ViewerModel) => m.data ?? (await (await fetch(`${import.meta.env.BASE_URL}${m.url}`)).text());

interface Atom {
  b: number;
  resi: number;
  ss?: string;
  elem: string;
}

/** a hue (0–360°) at 75% saturation and 50% lightness as #rrggbb (3Dmol does not read hsl()) */
function hueHex(h: number): string {
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const c = 0.5 - 0.375 * Math.max(-1, Math.min(k - 3, 9 - k, 1));
    return Math.round(255 * c).toString(16).padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

/** a 3Dmol colour spec for one model */
function colourSpec(paint: Paint, m: ViewerModel, resiRange: [number, number]) {
  const given = paint === "given" ? m.colour : null;
  if (paint === "element" || given === "element") return { colorscheme: "Jmol" };
  if (paint === "plddt" || given === "plddt") return { colorfunc: (a: Atom) => plddtColour(a.b) };
  if (paint === "spectrum") {
    const [lo, hi] = resiRange;
    return { colorfunc: (a: Atom) => hueHex(240 - (240 * (a.resi - lo)) / Math.max(1, hi - lo)) };
  }
  if (paint === "ss") return { colorfunc: (a: Atom) => SS_COLOUR[a.ss ?? ""] ?? "#9ca3af" };
  return { color: (given as { colour: string }).colour };
}

function styleSpec(render: Render, colour: object) {
  switch (render) {
    case "cartoon":
      return { cartoon: { ...colour, thickness: 0.6 } };
    case "ballstick":
      return { stick: { ...colour, radius: 0.15 }, sphere: { ...colour, scale: 0.25 } };
    case "stick":
      return { stick: { ...colour, radius: 0.2 } };
    case "sphere":
      return { sphere: { ...colour } };
    case "line":
      return { line: { ...colour } };
    case "surface": // a faint ribbon inside, the surface added on top
      return { cartoon: { ...colour, opacity: 0.5 } };
  }
}

/** residues drawn as coloured sticks over the first model (e.g. a residue and its neighbours) */
export interface Highlight {
  resi: number[];
  colour: string;
  /** only this chain, when the same numbers appear in several */
  chain?: string;
}

export default function MoleculeViewer({ models, height = 360, label, highlight = [] }: { models: ViewerModel[]; height?: number; label: string; highlight?: Highlight[] }) {
  const { pick } = useLang();
  const box = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<{ clear: () => void; getView: () => number[]; setView: (v: number[]) => void } | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const protein = models.some((m) => m.format === "pdb");
  const hasPlddt = models.some((m) => m.colour === "plddt");
  const renders: Render[] = protein ? ["cartoon", "stick", "sphere", "line", "surface"] : ["ballstick", "stick", "sphere", "line"];
  const paints: Paint[] = protein ? ["given", "element", "spectrum", "ss", ...(hasPlddt ? (["plddt"] as const) : [])] : ["element"];
  const first: Render = models[0]?.style === "cartoon" ? "cartoon" : "ballstick";
  const [render, setRender] = useState<Render>(first);
  const [paint, setPaint] = useState<Paint>(protein ? "given" : "element");
  const dataKey = JSON.stringify([models.map((m) => [m.url ?? m.data?.length, m.style, m.colour]), highlight]);

  useEffect(() => {
    let cancelled = false;
    const keepView = viewerRef.current?.getView();
    (async () => {
      const $3Dmol = await load3Dmol();
      const files = await Promise.all(models.map(text));
      if (cancelled || !box.current) return;
      viewerRef.current?.clear();
      box.current.innerHTML = "";
      const v = $3Dmol.createViewer(box.current, { backgroundColor: "white", antialias: true });
      viewerRef.current = v as never;
      models.forEach((m, i) => {
        const model = v.addModel(files[i], m.format);
        const atoms = model.selectedAtoms({}) as unknown as Atom[];
        const resi = atoms.map((a) => a.resi);
        const colour = colourSpec(paint, m, [Math.min(...resi), Math.max(...resi)]);
        model.setStyle({}, styleSpec(render, colour) as never);
        if (render === "surface") v.addSurface($3Dmol.SurfaceType.VDW, { opacity: 0.85, ...colour } as never, { model } as never);
        if (i === 0)
          for (const h of highlight)
            if (h.resi.length) v.addStyle({ model, resi: h.resi, ...(h.chain ? { chain: h.chain } : {}) } as never, { stick: { color: h.colour, radius: 0.25 }, cartoon: { color: h.colour } } as never);
      });
      if (keepView) v.setView(keepView as never);
      else v.zoomTo();
      v.render();
      if (!cancelled) setState("ready");
    })().catch(() => !cancelled && setState("error"));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataKey, render, paint]);

  useEffect(
    () => () => {
      viewerRef.current?.clear();
      viewerRef.current = null;
    },
    [],
  );

  return (
    <div className="w-full" data-testid="molecule-viewer-box">
      <div className="relative w-full overflow-hidden rounded-lg border border-gray-200 bg-white" style={{ height }} data-testid="molecule-viewer" data-state={state}>
        <div ref={box} className="absolute inset-0" role="img" aria-label={label} />
        {state !== "ready" && (
          <p className="absolute inset-0 flex items-center justify-center text-sm text-gray-500">
            {state === "loading" ? pick(["Loading the 3D viewer…", "正在載入 3D 檢視器…"]) : pick(["The 3D viewer could not start in this browser.", "這個瀏覽器無法啟動 3D 檢視器。"])}
          </p>
        )}
        {state === "ready" && (
      <div className="absolute top-2 right-2 z-10 flex max-w-[calc(100%-1rem)] flex-wrap items-center justify-end gap-1.5 rounded-md bg-white/85 p-1 text-xs text-gray-600 shadow-sm ring-1 ring-gray-200 backdrop-blur-sm" data-testid="viewer-controls">
          <label className="flex items-center gap-1" title={pick(["Draw as", "畫成"])}>
            <span className="sr-only">{pick(["Draw as", "畫成"])}</span>
            <select value={render} onChange={(e) => setRender(e.target.value as Render)} className="rounded border border-gray-200 bg-white px-1 py-0.5" data-testid="viewer-style">
              {renders.map((r) => (
                <option key={r} value={r}>
                  {pick(RENDER_LABEL[r])}
                </option>
              ))}
            </select>
          </label>
          {paints.length > 1 && (
            <label className="flex items-center gap-1" title={pick(["Colour", "顏色"])}>
              <span className="sr-only">{pick(["Colour", "顏色"])}</span>
              <select value={paint} onChange={(e) => setPaint(e.target.value as Paint)} className="rounded border border-gray-200 bg-white px-1 py-0.5" data-testid="viewer-colour">
                {paints.map((p) => (
                  <option key={p} value={p}>
                    {pick(PAINT_LABEL[p])}
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>
        )}
        {paint === "ss" && (
            <span className="pointer-events-none absolute bottom-2 left-2 flex items-center gap-2 rounded bg-white/85 px-1.5 py-0.5 text-xs text-gray-600">
              <span className="flex items-center gap-1">
                <span className="h-2.5 w-2.5 rounded-sm" style={{ background: SS_COLOUR.h }} />
                {pick(["helix", "螺旋"])}
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2.5 w-2.5 rounded-sm" style={{ background: SS_COLOUR.s }} />
                {pick(["sheet", "摺板"])}
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2.5 w-2.5 rounded-sm bg-gray-400" />
                {pick(["loop", "環圈"])}
              </span>
            </span>
          )}
        {state === "ready" && (
          <p className="pointer-events-none absolute right-2 bottom-2 rounded bg-white/80 px-1.5 text-xs text-gray-500">{pick(["drag to turn · scroll to zoom", "拖曳旋轉 · 滾動縮放"])}</p>
        )}
      </div>
    </div>
  );
}
