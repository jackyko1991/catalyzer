/**
 * A 3D molecule viewer: small molecules as balls and sticks, proteins as ribbons (cartoon), coloured by element,
 * by AlphaFold's confidence (pLDDT, stored in the B-factor column) or in one colour per model. 3Dmol.js (BSD-3) is
 * loaded on first use, so it stays out of the main bundle; the viewer shows a still message until it is ready.
 */
import { useLang } from "@learnkit/web";
import { useEffect, useRef, useState } from "react";

export type ViewStyle = "stick" | "cartoon";
export type Colouring = "element" | "plddt" | { colour: string };

export interface ViewerModel {
  /** file under public/ (e.g. "structures/1crn.pdb") or inline data */
  url?: string;
  data?: string;
  format: "pdb" | "sdf";
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

type ThreeDmol = typeof import("3dmol");
let loading: Promise<ThreeDmol> | null = null;
const load3Dmol = () => (loading ??= import("3dmol"));

const text = async (m: ViewerModel) => m.data ?? (await (await fetch(`${import.meta.env.BASE_URL}${m.url}`)).text());

export default function MoleculeViewer({ models, height = 360, label }: { models: ViewerModel[]; height?: number; label: string }) {
  const { pick } = useLang();
  const box = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const key = JSON.stringify(models.map((m) => [m.url ?? m.data?.length, m.style, m.colour]));

  useEffect(() => {
    let cancelled = false;
    let viewer: { clear: () => void } | null = null;
    setState("loading");
    (async () => {
      const $3Dmol = await load3Dmol();
      const files = await Promise.all(models.map(text));
      if (cancelled || !box.current) return;
      box.current.innerHTML = "";
      const v = $3Dmol.createViewer(box.current, { backgroundColor: "white", antialias: true });
      viewer = v;
      models.forEach((m, i) => {
        const model = v.addModel(files[i], m.format);
        const colour =
          m.colour === "element"
            ? { colorscheme: "default" }
            : m.colour === "plddt"
              ? { colorfunc: (atom: { b: number }) => plddtColour(atom.b) }
              : { color: m.colour.colour };
        const style = m.style === "cartoon" ? { cartoon: { ...colour, thickness: 0.6 } } : { stick: { ...colour, radius: 0.15 }, sphere: { ...colour, scale: 0.25 } };
        model.setStyle({}, style as never);
      });
      v.zoomTo();
      v.render();
      if (!cancelled) setState("ready");
    })().catch(() => !cancelled && setState("error"));
    return () => {
      cancelled = true;
      viewer?.clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return (
    <div className="relative w-full overflow-hidden rounded-lg border border-gray-200 bg-white" style={{ height }} data-testid="molecule-viewer" data-state={state}>
      <div ref={box} className="absolute inset-0" role="img" aria-label={label} />
      {state !== "ready" && (
        <p className="absolute inset-0 flex items-center justify-center text-sm text-gray-500">
          {state === "loading" ? pick(["Loading the 3D viewer…", "正在載入 3D 檢視器…"]) : pick(["The 3D viewer could not start in this browser.", "這個瀏覽器無法啟動 3D 檢視器。"])}
        </p>
      )}
      {state === "ready" && (
        <p className="pointer-events-none absolute right-2 bottom-2 rounded bg-white/80 px-1.5 text-xs text-gray-500">
          {pick(["drag to turn · scroll to zoom", "拖曳旋轉 · 滾動縮放"])}
        </p>
      )}
    </div>
  );
}
