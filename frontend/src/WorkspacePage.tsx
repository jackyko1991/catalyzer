/**
 * Workspace (#/workspace): a molecular calculator. Put molecules in (paste SMILES, drop .smi/.csv/.sdf files, add
 * them from the Library), write or pick a script whose run() computes over them, press Run: the script runs on
 * the reader's computer through the paired runner and its results are drawn (tables, charts, 2D and 3D).
 *
 * Wide screens: three full-height columns, as the Problems page: scripts and inputs | the editor with a one-line
 * toolbar | the results. Everything is kept in this browser (workspace.ts).
 */
import { python } from "@codemirror/lang-python";
import { EditorView } from "@codemirror/view";
import { CodeBlock, RichText, useLang } from "@learnkit/web";
import CodeMirror from "@uiw/react-codemirror";
import { type ReactNode, useEffect, useMemo, useState } from "react";
import ResultsView from "./ResultsView";
import { RUNNER, type RunResult, runnerStatus, runScript } from "./runner";
import { loadPairing, loadWorkspace, newId, savePairing, saveWorkspace, TEMPLATES, type WorkspaceState } from "./workspace";

const PY = python();
const INPUT_TYPES = ".smi,.txt,.csv,.sdf,.pdb,.cif,.fasta";
type Doc = { kind: "script"; id: string } | { kind: "molecules" } | { kind: "file"; name: string };

const countMolecules = (smi: string) => smi.split("\n").filter((l) => l.split("#")[0].trim()).length;

export default function WorkspacePage({ leftTabs }: { leftTabs?: ReactNode }) {
  const { pick } = useLang();
  const [ws, setWs] = useState<WorkspaceState>(loadWorkspace);
  const [doc, setDoc] = useState<Doc>({ kind: "script", id: ws.current });
  const [pairing, setPairing] = useState(loadPairing);
  const [status, setStatus] = useState<{ paired: boolean } | null | undefined>(undefined);
  const [busy, setBusy] = useState(false);
  const [run, setRun] = useState<RunResult | null>(null);
  const [tab, setTab] = useState<"inputs" | "code" | "results">("code");
  const [wrap, setWrap] = useState(true);

  const update = (f: (w: WorkspaceState) => WorkspaceState) =>
    setWs((w) => {
      const next = f(w);
      saveWorkspace(next);
      return next;
    });
  // pick up molecules or scripts added from the Library in another tab
  useEffect(() => {
    const onStorage = (e: StorageEvent) => e.key === "catalyzer.workspace" && setWs(loadWorkspace());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);
  useEffect(() => {
    const ctl = new AbortController();
    runnerStatus(pairing, ctl.signal).then((s) => !ctl.signal.aborted && setStatus(s));
    return () => ctl.abort();
  }, [pairing]);

  const script = ws.scripts.find((s) => s.id === (doc.kind === "script" ? doc.id : ws.current)) ?? ws.scripts[0];
  const text = doc.kind === "script" ? script.code : doc.kind === "molecules" ? ws.molecules : (ws.files[doc.name] ?? "");
  const setText = (v: string) =>
    update((w) =>
      doc.kind === "script"
        ? { ...w, scripts: w.scripts.map((s) => (s.id === script.id ? { ...s, code: v } : s)) }
        : doc.kind === "molecules"
          ? { ...w, molecules: v }
          : { ...w, files: { ...w.files, [doc.name]: v } },
    );
  const openScript = (id: string) => {
    update((w) => ({ ...w, current: id }));
    setDoc({ kind: "script", id });
    setTab("code");
  };
  const newScript = (templateId: string) => {
    const t = TEMPLATES.find((x) => x.id === templateId)!;
    const s = { id: newId(), title: pick(t.title), code: t.code };
    update((w) => ({ ...w, scripts: [...w.scripts, s], current: s.id }));
    setDoc({ kind: "script", id: s.id });
  };
  const addFiles = async (list: FileList | null) => {
    if (!list) return;
    const added: Record<string, string> = {};
    for (const f of Array.from(list)) {
      const name = f.name.replace(/[^\w.-]/g, "_");
      added[name.toLowerCase() === "molecules.smi" ? `molecules-${newId()}.smi` : name] = await f.text();
    }
    update((w) => ({ ...w, files: { ...w.files, ...added } }));
  };

  const go = async () => {
    setBusy(true);
    try {
      const r = await runScript(script.code, { "molecules.smi": ws.molecules, ...ws.files }, pairing);
      setRun(r);
      setStatus({ paired: true });
      setTab("results");
    } catch (e) {
      setStatus(String(e).includes("not paired") ? { paired: false } : await runnerStatus(pairing));
    } finally {
      setBusy(false);
    }
  };

  const nMol = useMemo(() => countMolecules(ws.molecules), [ws.molecules]);
  const show = (t: typeof tab) => (tab === t ? "flex" : "hidden xl:flex");

  return (
    <div className="flex flex-col bg-white xl:h-full xl:min-h-0 xl:flex-row" data-testid="workspace-page">
      {leftTabs && <div className="flex border-b border-gray-200 p-3 xl:hidden">{leftTabs}</div>}
      <div className="sticky top-0 z-10 flex border-b border-gray-200 bg-white xl:hidden" role="tablist">
        {(
          [
            ["inputs", ["Scripts & molecules", "程式與分子"]],
            ["code", ["Code", "程式碼"]],
            ["results", ["Results", "結果"]],
          ] as const
        ).map(([id, label]) => (
          <button key={id} role="tab" aria-selected={tab === id} onClick={() => setTab(id)} className={`flex-1 py-2.5 text-sm font-medium ${tab === id ? "border-b-2 border-(--lk-accent) text-(--lk-accent)" : "text-gray-500"}`}>
            {pick(label)}
          </button>
        ))}
      </div>

      {/* scripts and inputs */}
      <aside className={`${show("inputs")} flex-col border-r border-gray-200 xl:min-h-0 xl:w-60 xl:shrink-0 xl:overflow-y-auto`} data-testid="workspace-side">
        {leftTabs && <div className="hidden border-b border-gray-100 p-2 xl:flex">{leftTabs}</div>}
        <div className="border-b border-gray-100 p-3">
          <p className="text-xs font-semibold tracking-wide text-gray-500 uppercase">{pick(["Scripts", "程式"])}</p>
          <ul className="mt-2 space-y-0.5">
            {ws.scripts.map((s) => (
              <li key={s.id} className="group flex items-center gap-1">
                <button
                  onClick={() => openScript(s.id)}
                  className={`min-w-0 flex-1 truncate rounded-md px-2 py-1.5 text-left text-sm ${doc.kind === "script" && doc.id === s.id ? "bg-orange-50 font-medium text-(--lk-accent)" : "text-gray-700 hover:bg-gray-50"}`}
                  data-testid="workspace-script"
                >
                  {s.title}
                </button>
                <button
                  onClick={() => {
                    const t = prompt(pick(["Rename", "重新命名"]), s.title);
                    if (t?.trim()) update((w) => ({ ...w, scripts: w.scripts.map((x) => (x.id === s.id ? { ...x, title: t.trim() } : x)) }));
                  }}
                  className="hidden px-1 text-xs text-gray-400 group-hover:block hover:text-gray-700"
                  title={pick(["Rename", "重新命名"])}
                >
                  ✎
                </button>
                {ws.scripts.length > 1 && (
                  <button
                    onClick={() =>
                      update((w) => {
                        const scripts = w.scripts.filter((x) => x.id !== s.id);
                        return { ...w, scripts, current: scripts[0].id };
                      })
                    }
                    className="hidden px-1 text-xs text-gray-400 group-hover:block hover:text-red-700"
                    title={pick(["Delete", "刪除"])}
                  >
                    ✕
                  </button>
                )}
              </li>
            ))}
          </ul>
          <select value="" onChange={(e) => e.target.value && newScript(e.target.value)} className="mt-2 w-full rounded-md border border-gray-300 bg-white px-2 py-1 text-sm" data-testid="workspace-new">
            <option value="">{pick(["＋ New script from…", "＋ 從範本新增程式…"])}</option>
            {TEMPLATES.map((t) => (
              <option key={t.id} value={t.id}>
                {pick(t.title)}
              </option>
            ))}
          </select>
        </div>
        <div className="p-3">
          <p className="text-xs font-semibold tracking-wide text-gray-500 uppercase">{pick(["Inputs", "輸入"])}</p>
          <ul className="mt-2 space-y-0.5 font-mono text-sm">
            <li>
              <button onClick={() => (setDoc({ kind: "molecules" }), setTab("code"))} className={`w-full rounded-md px-2 py-1.5 text-left ${doc.kind === "molecules" ? "bg-orange-50 text-(--lk-accent)" : "text-gray-700 hover:bg-gray-50"}`} data-testid="workspace-molecules">
                molecules.smi <span className="font-sans text-xs text-gray-400">({nMol})</span>
              </button>
            </li>
            {Object.keys(ws.files).map((name) => (
              <li key={name} className="group flex items-center gap-1">
                <button onClick={() => (setDoc({ kind: "file", name }), setTab("code"))} className={`min-w-0 flex-1 truncate rounded-md px-2 py-1.5 text-left ${doc.kind === "file" && doc.name === name ? "bg-orange-50 text-(--lk-accent)" : "text-gray-700 hover:bg-gray-50"}`}>
                  {name}
                </button>
                <button
                  onClick={() => {
                    update((w) => {
                      const files = { ...w.files };
                      delete files[name];
                      return { ...w, files };
                    });
                    if (doc.kind === "file" && doc.name === name) setDoc({ kind: "molecules" });
                  }}
                  className="hidden px-1 text-xs text-gray-400 group-hover:block hover:text-red-700"
                  title={pick(["Remove", "移除"])}
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
          <label
            className="mt-2 flex cursor-pointer flex-col items-center gap-1 rounded-md border border-dashed border-gray-300 px-2 py-3 text-center text-xs text-gray-500 hover:border-(--lk-accent)"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              addFiles(e.dataTransfer.files);
            }}
          >
            {pick(["Drop or choose files", "拖放或選擇檔案"])}
            <span className="text-gray-400">.smi .csv .sdf .pdb .cif .fasta</span>
            <input type="file" multiple accept={INPUT_TYPES} className="hidden" onChange={(e) => addFiles(e.target.files)} data-testid="workspace-files" />
          </label>
          <p className="mt-2 text-xs text-gray-400">
            <RichText text={pick(["Add molecules from the [Library](#/library) too. Everything stays in this browser.", "也可以從[資料庫](#/library)加入分子。所有內容只保存在這個瀏覽器中。"])} />
          </p>
        </div>
      </aside>

      {/* the editor */}
      <section className={`${show("code")} min-w-0 flex-1 flex-col border-r border-gray-200 xl:min-h-0`} data-testid="workspace-editor">
        <div className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-2 border-b border-gray-200 bg-gray-50/80 px-3 py-2">
          <button onClick={go} disabled={busy || !status?.paired} className="rounded-md bg-(--lk-accent) px-4 py-1.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50" data-testid="workspace-run">
            ▶ {busy ? pick(["Running…", "執行中…"]) : pick(["Run", "執行"])} <span className="font-normal opacity-80">{script.title}</span>
          </button>
          <span className="text-xs text-gray-500">{pick([`on ${nMol} molecules + ${Object.keys(ws.files).length} files`, `對 ${nMol} 個分子 + ${Object.keys(ws.files).length} 個檔案`])}</span>
          <button onClick={() => setWrap((w) => !w)} aria-pressed={wrap} className={`ml-auto text-xs ${wrap ? "text-(--lk-accent)" : "text-gray-500"}`}>
            ↩ {pick(["Wrap", "換行"])}
          </button>
          <span className="flex items-center gap-1.5 text-xs text-gray-500" data-testid="workspace-status">
            <span className={`h-2 w-2 rounded-full ${status?.paired ? "bg-green-500" : status ? "bg-amber-400" : status === null ? "bg-gray-300" : "bg-amber-200"}`} />
            {status?.paired ? pick(["paired", "已配對"]) : status ? pick(["not paired", "未配對"]) : status === null ? pick(["no runner", "無執行器"]) : "…"}
          </span>
        </div>
        <div className="flex h-8 shrink-0 items-center border-b border-gray-100 px-3 font-mono text-xs text-gray-500">
          {doc.kind === "script" ? `${script.title} · workspace.py` : doc.kind === "molecules" ? pick(["molecules.smi · one SMILES per line, then an optional name", "molecules.smi · 每行一個 SMILES，後面可加名稱"]) : doc.name}
        </div>
        <div className="h-[60vh] min-h-0 overflow-hidden text-sm xl:h-auto xl:flex-1">
          <CodeMirror key={doc.kind === "script" ? doc.id : doc.kind === "file" ? doc.name : "molecules"} value={text} height="100%" className="h-full" extensions={[...(doc.kind === "script" ? [PY] : []), ...(wrap ? [EditorView.lineWrapping] : [])]} onChange={setText} basicSetup={{ foldGutter: false }} data-testid="workspace-code" />
        </div>
      </section>

      {/* the results */}
      <section className={`${show("results")} min-w-0 flex-col xl:min-h-0 xl:w-[40%] xl:shrink-0`} data-testid="workspace-results">
        <div className="flex h-9 shrink-0 items-center border-b border-gray-200 bg-gray-50 px-3 text-xs font-semibold tracking-wide text-gray-500 uppercase">{pick(["Results", "結果"])}</div>
        <div className="min-h-[24rem] flex-1 overflow-y-auto bg-gray-50/60 p-3">
          {status === null ? (
            <WorkspaceHelp />
          ) : status && !status.paired ? (
            <Pairing
              onPair={(code) => {
                savePairing(code);
                setPairing(code);
              }}
            />
          ) : null}
          {run && run.status !== "done" && (
            <div className="mb-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800" data-testid="workspace-error">
              <p className="font-medium">{pick(["The script stopped with an error:", "程式執行時發生錯誤："])}</p>
              <pre className="mt-1 font-mono text-xs whitespace-pre-wrap">{run.problems.join("\n")}</pre>
              {run.output && (
                <details className="mt-1 text-xs">
                  <summary className="cursor-pointer">{pick(["Full output", "完整輸出"])}</summary>
                  <pre className="mt-1 max-h-60 overflow-auto whitespace-pre-wrap">{run.output}</pre>
                </details>
              )}
            </div>
          )}
          {run?.status === "done" ? (
            <>
              <ResultsView items={run.results} />
              {run.output.trim() && (
                <details className="mt-3 text-xs text-gray-600">
                  <summary className="cursor-pointer">{pick(["What the script printed", "程式印出的內容"])}</summary>
                  <pre className="mt-1 max-h-60 overflow-auto whitespace-pre-wrap">{run.output}</pre>
                </details>
              )}
            </>
          ) : (
            status?.paired && !run && <p className="text-sm text-gray-500">{pick(["Press Run: the results of run() appear here.", "按「執行」：run() 的結果會顯示在這裡。"])}</p>
          )}
        </div>
      </section>
    </div>
  );
}

function Pairing({ onPair }: { onPair: (code: string) => void }) {
  const { pick } = useLang();
  const [code, setCode] = useState("");
  return (
    <form
      className="mb-3 space-y-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-gray-700"
      onSubmit={(e) => {
        e.preventDefault();
        if (code.trim()) onPair(code.trim());
      }}
      data-testid="pairing"
    >
      <p className="font-medium text-gray-900">{pick(["Pair this page with your runner", "把這個頁面與你的執行器配對"])}</p>
      <p>
        {pick([
          "A workspace script is your own code, so the runner only runs it for a page you have paired. Enter the pairing code it printed when it started (it stays the same; this browser remembers it).",
          "工作區的程式是你自己的程式碼，所以執行器只替你配對過的頁面執行。輸入它啟動時印出的配對碼（配對碼不會改變；這個瀏覽器會記住它）。",
        ])}
      </p>
      <div className="flex gap-2">
        <input value={code} onChange={(e) => setCode(e.target.value)} placeholder={pick(["pairing code", "配對碼"])} className="w-40 rounded-md border border-gray-300 bg-white px-2 py-1 font-mono text-sm" data-testid="pairing-code" />
        <button type="submit" className="rounded-md bg-(--lk-accent) px-3 py-1 text-sm font-medium text-white" data-testid="pairing-submit">
          {pick(["Pair", "配對"])}
        </button>
      </div>
    </form>
  );
}

function WorkspaceHelp() {
  const { pick } = useLang();
  return (
    <div className="mb-3 space-y-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-gray-700" data-testid="workspace-help">
      <p className="font-medium text-gray-900">{pick(["Start the runner on your computer", "在你的電腦上啟動執行器"])}</p>
      <p>
        <RichText
          text={pick([
            `The local runner runs the code on your own computer, so it stays there. Install [pixi](https://pixi.sh), start the runner (it listens on ${RUNNER} only) and enter the pairing code it prints:`,
            `本機執行器在你自己的電腦上執行程式碼，所以程式碼留在你的電腦上。安裝 [pixi](https://pixi.sh)，啟動執行器（它只在 ${RUNNER} 上接聽），再輸入它印出的配對碼：`,
          ])}
        />
      </p>
      <div className="text-xs">
        <CodeBlock code={`git clone --recurse-submodules https://github.com/jackyko1991/catalyzer\ncd catalyzer\npixi run runner`} />
      </div>
    </div>
  );
}
