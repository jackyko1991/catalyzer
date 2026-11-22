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
import { type LiveEntry, pubchemImage, searchAlphaFold, searchPDB, searchPubChem, structureFor } from "./liveSearch";
import MoleculeViewer from "./MoleculeViewer";
import { addMolecule, addScript, liveCode } from "./workspace";

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
const LICENCE: Record<LibraryEntry["kind"], [string, string]> = {
  molecules: ["PubChem: free to use; each depositor may set its own terms", "https://pubchem.ncbi.nlm.nih.gov/docs/data-sources"],
  structures: ["PDB: CC0 1.0", "https://www.wwpdb.org/about/usage-policies"],
  predictions: ["AlphaFold DB: CC BY 4.0", "https://alphafold.ebi.ac.uk/faq"],
};
const KINDS: { id: LibraryEntry["kind"]; label: [string, string]; source: string; colour: string }[] = [
  { id: "molecules", label: ["Molecules", "分子"], source: "PubChem", colour: "bg-orange-50 text-orange-800 ring-orange-200" },
  { id: "structures", label: ["Experimental structures", "實驗結構"], source: "Protein Data Bank", colour: "bg-teal-50 text-teal-800 ring-teal-200" },
  { id: "predictions", label: ["AI predictions", "AI 預測"], source: "AlphaFold DB", colour: "bg-blue-50 text-blue-800 ring-blue-200" },
];
/** case, accents and British / American spelling (haemoglobin = hemoglobin) do not matter */
const fold = (s: string) => s.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().replace(/haem/g, "hem").replace(/oe/g, "e");


type AnyEntry = LibraryEntry | LiveEntry;
type Live = { state: "idle" } | { state: "loading" } | { state: "done"; byKind: Record<LibraryEntry["kind"], LiveEntry[] | string> };

export default function LibraryPage() {
  const { pick } = useLang();
  const [kind, setKind] = useState<LibraryEntry["kind"] | "all">("all");
  const [query, setQuery] = useState("");
  const [live, setLive] = useState<Live>({ state: "idle" });
  const shown = useMemo(() => {
    const words = fold(query).split(/\s+/).filter(Boolean);
    return LIBRARY.filter((e) => (kind === "all" || e.kind === kind) && words.every((w) => fold([...e.name, e.id, e.detail, e.smiles ?? ""].join(" ")).includes(w)));
  }, [kind, query]);

  const searchLive = async () => {
    const q = query.trim();
    if (q.length < 2) return;
    setLive({ state: "loading" });
    const settle = async (f: () => Promise<LiveEntry[]>) => {
      try {
        return await f();
      } catch {
        return pick(["The search did not answer; try again in a moment.", "搜尋沒有回應；請稍後再試。"]);
      }
    };
    const [molecules, structures, predictions] = await Promise.all([settle(() => searchPubChem(q)), settle(() => searchPDB(q)), settle(() => searchAlphaFold(q))]);
    setLive({ state: "done", byKind: { molecules, structures, predictions } });
  };

  return (
    <div className="mx-auto max-w-6xl px-5 pt-8 pb-16" data-testid="library-page">
      <h1 className="text-3xl font-semibold tracking-tight text-gray-900">{pick(["Library", "資料庫"])}</h1>
      <p className="mt-3 max-w-3xl text-gray-600">
        <RichText
          text={pick([
            "Public molecular data to work with: compounds from PubChem, experimental structures from the Protein Data Bank, and AI predictions from the AlphaFold DB. Search the curated list below, or the databases themselves, live. Look at any entry in 2D and 3D, add molecules to your [Workspace](#/problems/workspace), or open a structure there as a script.",
            "可以拿來動手的公開分子資料：PubChem 的化合物、蛋白質資料庫的實驗結構，以及 AlphaFold DB 的 AI 預測。搜尋下方精選的清單，或直接即時搜尋資料庫本身。任何一筆都能看 2D 與 3D，可以把分子加入你的[工作區](#/problems/workspace)，或把結構當成程式在那裡開啟。",
          ])}
        />
      </p>

      <form
        className="mt-6 flex flex-wrap items-center gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          searchLive();
        }}
      >
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={pick(["Name, formula, SMILES, PDB id, UniProt accession…", "名稱、分子式、SMILES、PDB 編號、UniProt 編號…"])}
          className="w-full max-w-md rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-(--lk-accent) focus:outline-none"
          data-testid="library-search"
        />
        <button type="submit" disabled={query.trim().length < 2 || live.state === "loading"} className="rounded-md bg-(--lk-accent) px-3 py-1.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-40" data-testid="library-live">
          {live.state === "loading" ? pick(["Searching…", "搜尋中…"]) : pick(["Search the databases", "搜尋資料庫"])}
        </button>
        <span className="text-xs text-gray-500">PubChem · RCSB PDB · UniProt / AlphaFold DB</span>
      </form>

      {live.state !== "idle" && (
        <section className="mt-6" data-testid="library-live-results">
          <h2 className="text-lg font-semibold text-gray-900">
            {pick(["Live results", "即時搜尋結果"])} <span className="text-sm font-normal text-gray-500">“{query.trim()}”</span>
          </h2>
          {live.state === "loading" ? (
            <p className="mt-2 text-sm text-gray-500">{pick(["Asking PubChem, the PDB and UniProt…", "正在查詢 PubChem、PDB 與 UniProt…"])}</p>
          ) : (
            KINDS.map((k) => {
              const found = live.byKind[k.id];
              return (
                <div key={k.id} className="mt-3">
                  <p className="text-sm font-medium text-gray-700">
                    {pick(k.label)} <span className="text-xs font-normal text-gray-400">{k.source}</span>
                  </p>
                  {typeof found === "string" ? (
                    <p className="mt-1 text-sm text-red-700">{found}</p>
                  ) : found.length === 0 ? (
                    <p className="mt-1 text-sm text-gray-500">{pick(["Nothing found.", "沒有找到。"])}</p>
                  ) : (
                    <ul className="mt-1 divide-y divide-gray-100 rounded-lg border border-gray-200 bg-white">
                      {found.map((e) => (
                        <EntryRow key={e.key} e={e} />
                      ))}
                    </ul>
                  )}
                </div>
              );
            })
          )}
        </section>
      )}

      <section className="mt-8">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="mr-2 text-lg font-semibold text-gray-900">{pick(["Curated", "精選"])}</h2>
          {(["all", ...KINDS.map((k) => k.id)] as const).map((k) => (
            <button
              key={k}
              onClick={() => setKind(k)}
              aria-pressed={kind === k}
              className={`rounded-full px-3 py-1 text-sm ring-1 ${kind === k ? "bg-gray-900 text-white ring-gray-900" : "bg-white text-gray-700 ring-gray-300 hover:ring-(--lk-accent)"}`}
              data-testid={`library-kind-${k}`}
            >
              {k === "all" ? pick(["All", "全部"]) : pick(KINDS.find((x) => x.id === k)!.label)} <span className="text-xs opacity-60">{k === "all" ? LIBRARY.length : LIBRARY.filter((e) => e.kind === k).length}</span>
            </button>
          ))}
        </div>
        <ul className="mt-3 divide-y divide-gray-100 rounded-lg border border-gray-200 bg-white" data-testid="library-list">
          {shown.map((e) => (
            <EntryRow key={e.key} e={e} />
          ))}
          {shown.length === 0 && <li className="p-4 text-sm text-gray-500">{pick(["Nothing in the curated list matches; try “Search the databases”.", "精選清單中沒有符合的項目；試試「搜尋資料庫」。"])}</li>}
        </ul>
        <p className="mt-3 text-xs text-gray-500">
          {pick(["Curated list fetched on 22 November 2026 from the PubChem, RCSB PDB and AlphaFold DB APIs.", "精選清單於 2026 年 11 月 22 日從 PubChem、RCSB PDB 與 AlphaFold DB 的 API 取得。"])}
        </p>
      </section>
    </div>
  );
}

/** one entry: what it is, where it comes from, 2D and 3D on demand, and what to do with it */
function EntryRow({ e }: { e: AnyEntry }) {
  const { pick } = useLang();
  const k = KINDS.find((x) => x.id === e.kind)!;
  const [view, setView] = useState<"none" | "2d" | "3d" | "code">("none");
  const [model, setModel] = useState<{ data: string; format: "pdb" | "sdf" } | string | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const image = pubchemImage(e.key);
  const code = "code" in e ? e.code : e.kind === "molecules" ? null : liveCode(e.kind, e.key.split(":")[1], e.name[0]);
  const licence = LICENCE[e.kind];

  const show3d = async () => {
    setView(view === "3d" ? "none" : "3d");
    if (!model) {
      try {
        setModel(await structureFor(e));
      } catch (err) {
        setModel(String(err));
      }
    }
  };
  const btn = (active: boolean) => `rounded-md border px-2.5 py-1 text-xs ${active ? "border-(--lk-accent) text-(--lk-accent)" : "border-gray-300 text-gray-700 hover:border-(--lk-accent)"}`;

  return (
    <li className="p-3" data-testid={`library-entry-${e.key}`}>
      <div className="flex flex-wrap items-start gap-x-3 gap-y-2">
        <span className={`mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-xs ring-1 ${k.colour}`}>{k.source}</span>
        <div className="min-w-0 flex-1">
          <p className="font-medium text-gray-900">
            {pick(e.name)}{" "}
            <a href={e.url} target="_blank" rel="noreferrer" className="ml-1 font-mono text-sm font-normal text-(--lk-accent) hover:underline">
              {e.id} ↗
            </a>
          </p>
          <p className="mt-0.5 text-sm text-gray-600">{e.detail}</p>
          {e.smiles && (
            <p className="mt-0.5 truncate font-mono text-xs text-gray-400" title={e.smiles}>
              {e.smiles}
            </p>
          )}
        </div>
        <div className="flex shrink-0 flex-wrap gap-1.5">
          {image && (
            <button onClick={() => setView(view === "2d" ? "none" : "2d")} className={btn(view === "2d")} data-testid={`library-2d-${e.key}`}>
              2D
            </button>
          )}
          <button onClick={show3d} className={btn(view === "3d")} data-testid={`library-3d-${e.key}`}>
            3D
          </button>
          {code && (
            <button onClick={() => setView(view === "code" ? "none" : "code")} className={btn(view === "code")}>
              {pick(["Code", "程式碼"])}
            </button>
          )}
          {e.kind === "molecules" && e.smiles ? (
            <button
              onClick={() => setDone(addMolecule(e.smiles!, e.name[0]) ? pick(["Added to your molecules", "已加入你的分子"]) : pick(["Already in your molecules", "已經在你的分子中"]))}
              className="rounded-md bg-(--lk-accent) px-2.5 py-1 text-xs font-medium text-white hover:opacity-90"
              data-testid={`library-add-${e.key}`}
            >
              ＋ {pick(["My molecules", "我的分子"])}
            </button>
          ) : (
            code && (
              <button
                onClick={() => {
                  addScript(`${e.id}: ${e.name[0]}`.slice(0, 60), code);
                  setDone(pick(["Opened in your workspace", "已在你的工作區開啟"]));
                }}
                className="rounded-md bg-(--lk-accent) px-2.5 py-1 text-xs font-medium text-white hover:opacity-90"
                data-testid={`library-open-${e.key}`}
              >
                ＋ {pick(["Workspace", "工作區"])}
              </button>
            )
          )}
        </div>
      </div>
      {done && (
        <p className="mt-1 text-right text-xs text-green-700">
          ✓ {done} · <a href="#/problems/workspace" className="underline">{pick(["go to the Workspace", "前往工作區"])}</a>
        </p>
      )}
      {view === "2d" && image && <img src={image} alt={pick(e.name)} className="mt-3 h-56 w-56 rounded border border-gray-100 bg-white object-contain" loading="lazy" />}
      {view === "3d" && (
        <div className="mt-3">
          {model === null ? (
            <p className="text-sm text-gray-500">{pick(["Downloading…", "下載中…"])}</p>
          ) : typeof model === "string" ? (
            <p className="text-sm text-red-700">{model}</p>
          ) : (
            <MoleculeViewer
              models={[{ data: model.data, format: model.format, style: model.format === "sdf" ? "stick" : "cartoon", colour: e.kind === "predictions" ? "plddt" : model.format === "sdf" ? "element" : { colour: "#0f766e" } }]}
              label={pick(e.name)}
              height={340}
            />
          )}
        </div>
      )}
      {view === "code" && code && (
        <div className="mt-3 space-y-2">
          <div className="overflow-x-auto text-sm">
            <CodeBlock code={code} title={`${e.key.replace(":", "_")}.py`} language={PY} />
          </div>
          <p className="text-xs text-gray-500">
            {pick(["Licence", "授權"])}:{" "}
            <a href={licence[1]} target="_blank" rel="noreferrer" className="hover:underline">
              {licence[0]} ↗
            </a>
          </p>
        </div>
      )}
    </li>
  );
}
