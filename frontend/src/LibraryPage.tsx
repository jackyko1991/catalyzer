/**
 * Library (#/library): public molecular data to work with: PubChem compounds, Protein Data Bank entries and
 * AlphaFold DB models (catalyzer/library.json, fetched from the sources' own APIs; generated/library.json adds the
 * starting code of each). Search, filter by kind, open the source, and take the code: it draws the entry in 2D/3D
 * and computes a few numbers. Each entry shows its source's licence.
 */
import { python } from "@codemirror/lang-python";
import { CodeBlock, RichText, useLang } from "@learnkit/web";
import { useMemo, useState } from "react";
import data from "./generated/library.json";

export interface LibraryEntry {
  kind: "molecules" | "structures" | "predictions";
  key: string;
  id: string;
  name: [string, string];
  detail: string;
  url: string;
  smiles?: string;
  code: string;
  licence: string;
  licence_url: string;
}

export const LIBRARY = data as unknown as LibraryEntry[];

const PY = python();
const KINDS: { id: LibraryEntry["kind"]; label: [string, string]; source: string; colour: string }[] = [
  { id: "molecules", label: ["Molecules", "分子"], source: "PubChem", colour: "bg-orange-50 text-orange-800 ring-orange-200" },
  { id: "structures", label: ["Experimental structures", "實驗結構"], source: "Protein Data Bank", colour: "bg-teal-50 text-teal-800 ring-teal-200" },
  { id: "predictions", label: ["AI predictions", "AI 預測"], source: "AlphaFold DB", colour: "bg-blue-50 text-blue-800 ring-blue-200" },
];
/** case, accents and British / American spelling (haemoglobin = hemoglobin) do not matter */
const fold = (s: string) => s.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().replace(/haem/g, "hem").replace(/oe/g, "e");

export default function LibraryPage() {
  const { pick } = useLang();
  const [kind, setKind] = useState<LibraryEntry["kind"] | "all">("all");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const shown = useMemo(() => {
    const words = fold(query).split(/\s+/).filter(Boolean);
    return LIBRARY.filter((e) => (kind === "all" || e.kind === kind) && words.every((w) => fold([...e.name, e.id, e.detail, e.smiles ?? ""].join(" ")).includes(w)));
  }, [kind, query]);

  return (
    <div className="mx-auto max-w-6xl px-5 pt-8 pb-16" data-testid="library-page">
      <h1 className="text-3xl font-semibold tracking-tight text-gray-900">{pick(["Library", "資料庫"])}</h1>
      <p className="mt-3 max-w-3xl text-gray-600">
        <RichText
          text={pick([
            "Public molecular data to work with: compounds from PubChem, experimental structures from the Protein Data Bank, and AI predictions from the AlphaFold DB. Each entry links to its source and comes with starting code that draws it in 2D or 3D and computes a few numbers; run it with `pixi run python` in the Catalyzer folder.",
            "可以拿來動手的公開分子資料：PubChem 的化合物、蛋白質資料庫的實驗結構，以及 AlphaFold DB 的 AI 預測。每一筆都連到原始來源，並附上起始程式碼：把它畫成 2D 或 3D，並算出幾個數字；在 Catalyzer 資料夾中用 `pixi run python` 執行。",
          ])}
        />
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={pick(["Search names, ids, formulas…", "搜尋名稱、編號、分子式…"])}
          className="w-full max-w-sm rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-(--lk-accent) focus:outline-none"
          data-testid="library-search"
        />
        {(["all", ...KINDS.map((k) => k.id)] as const).map((k) => (
          <button
            key={k}
            onClick={() => setKind(k)}
            aria-pressed={kind === k}
            className={`rounded-full px-3 py-1 text-sm ring-1 ${kind === k ? "bg-gray-900 text-white ring-gray-900" : "bg-white text-gray-700 ring-gray-300 hover:ring-(--lk-accent)"}`}
            data-testid={`library-kind-${k}`}
          >
            {k === "all" ? pick(["All", "全部"]) : pick(KINDS.find((x) => x.id === k)!.label)}{" "}
            <span className="text-xs opacity-60">{k === "all" ? LIBRARY.length : LIBRARY.filter((e) => e.kind === k).length}</span>
          </button>
        ))}
      </div>

      <ul className="mt-4 divide-y divide-gray-100 rounded-lg border border-gray-200 bg-white" data-testid="library-list">
        {shown.map((e) => {
          const k = KINDS.find((x) => x.id === e.kind)!;
          const isOpen = open === e.key;
          return (
            <li key={e.key} className="p-3" data-testid={`library-entry-${e.key}`}>
              <div className="flex flex-wrap items-start gap-x-3 gap-y-1">
                <span className={`mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-xs ring-1 ${k.colour}`}>{k.source}</span>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-900">
                    {pick(e.name)}{" "}
                    <a href={e.url} target="_blank" rel="noreferrer" className="ml-1 font-mono text-sm font-normal text-(--lk-accent) hover:underline">
                      {e.id} ↗
                    </a>
                  </p>
                  <p className="mt-0.5 text-sm text-gray-600">{e.detail}</p>
                  {e.smiles && <p className="mt-0.5 truncate font-mono text-xs text-gray-400" title={e.smiles}>{e.smiles}</p>}
                </div>
                <button
                  onClick={() => setOpen(isOpen ? null : e.key)}
                  aria-expanded={isOpen}
                  className="shrink-0 rounded-md border border-gray-300 px-3 py-1 text-sm text-gray-700 hover:border-(--lk-accent) hover:text-(--lk-accent)"
                  data-testid={`library-code-${e.key}`}
                >
                  {isOpen ? pick(["Hide the code", "隱藏程式碼"]) : pick(["Code", "程式碼"])}
                </button>
              </div>
              {isOpen && (
                <div className="mt-3 space-y-2">
                  <div className="overflow-x-auto text-sm">
                    <CodeBlock code={e.code} title={`${e.key.replace(":", "_")}.py`} language={PY} />
                  </div>
                  <p className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                    <a href={`data:text/x-python;charset=utf-8,${encodeURIComponent(e.code)}`} download={`${e.key.replace(":", "_")}.py`} className="text-(--lk-accent) hover:underline">
                      {pick(["Download .py", "下載 .py"])}
                    </a>
                    <button onClick={() => navigator.clipboard?.writeText(e.code)} className="text-(--lk-accent) hover:underline">
                      {pick(["Copy", "複製"])}
                    </button>
                    <span>
                      {pick(["Licence", "授權"])}:{" "}
                      <a href={e.licence_url} target="_blank" rel="noreferrer" className="hover:underline">
                        {e.licence} ↗
                      </a>
                    </span>
                  </p>
                </div>
              )}
            </li>
          );
        })}
        {shown.length === 0 && <li className="p-4 text-sm text-gray-500">{pick(["Nothing matches.", "沒有符合的項目。"])}</li>}
      </ul>
      <p className="mt-3 text-xs text-gray-500">
        {pick([
          "Catalogue fetched on 22 November 2026 from the PubChem, RCSB PDB and AlphaFold DB APIs.",
          "目錄於 2026 年 11 月 22 日從 PubChem、RCSB PDB 與 AlphaFold DB 的 API 取得。",
        ])}
      </p>
    </div>
  );
}
