/**
 * Problems: a library of runnable molecular problems, laid out as Tensorizer's problem page.
 *
 * Wide screens, filling the window, each column full height and scrolling on its own (the owner's rule: no sparse
 * parameters column; the results get a whole column, because molecules need space):
 *   library (folds away to a thin rail; search with "/", tracks folding open to their problems)
 *   | the problem (title, badges, summary, picture, the open libraries it uses, the same idea on a sister site)
 *   | the code (parameters, Run and Test in one toolbar; answer.py opening with working code, main.py and test.py
 *     read-only; the terminal folded under it)
 *   | the feedback, in tabs: all results, the 2D structures, 3D, charts and tables, the tests.
 * Phones and tablets: a problem picker, then tabs Problem · Code · Results.
 *
 * Before anyone runs anything, the results are those of the default parameters, computed when the site was built.
 * Run and Test go to the local runner (`pixi run runner`): the code runs on the reader's own computer.
 */
import { python } from "@codemirror/lang-python";
import { EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { CodeBlock, go, ProblemPicture, RelatedProblems, RichText, routeHash, useLang } from "@learnkit/web";
import CodeMirror from "@uiw/react-codemirror";
import { useEffect, useMemo, useRef, useState } from "react";
import { findProblem, LEVEL, type Param, type Problem, PROBLEMS, problemName, TRACKS } from "./problems";
import ResultsView, { type ResultItem } from "./ResultsView";
import WorkspacePage from "./WorkspacePage";
import { GuideWindow, markSolved, TutorialBar } from "./tutorial";
import { loadDraft, RUNNER, runAnswer, type RunResult, runnerAlive, saveDraft } from "./runner";

const PY = python();
const READ_ONLY = [EditorState.readOnly.of(true), EditorView.editable.of(false)];
const asset = (p: string) => `${import.meta.env.BASE_URL}${p}`;
const LAST = "catalyzer.problem";

const LEVEL_DOT: Record<Problem["level"], string> = { beginner: "bg-green-500", intermediate: "bg-amber-500", pro: "bg-red-500" };
const LEVEL_TEXT: Record<Problem["level"], string> = { beginner: "text-green-700", intermediate: "text-amber-700", pro: "text-red-700" };

type PhoneTab = "problem" | "code" | "results";

/** the left column's two tabs (as Formalizer's Problems | Research, Tensorizer's Problems | Workspace) */
export function LeftTabs({ current }: { current: "problems" | "workspace" }) {
  const { pick } = useLang();
  const last = () => {
    try {
      return localStorage.getItem(LAST);
    } catch {
      return null;
    }
  };
  return (
    <div role="tablist" className="grid flex-1 grid-cols-2 gap-1 rounded-lg bg-gray-100 p-1" data-testid="left-tabs">
      {(["problems", "workspace"] as const).map((id) => (
        <button
          key={id}
          role="tab"
          aria-selected={current === id}
          onClick={() => (id === "workspace" ? go("problems", "workspace") : go("problems", last() ?? problemName(PROBLEMS[0])))}
          data-testid={`left-tab-${id}`}
          className={`rounded-md px-2 py-1 text-xs font-medium transition ${current === id ? "bg-(--lk-accent) text-white shadow-sm" : "text-gray-600 hover:bg-gray-200 hover:text-gray-900"}`}
        >
          {id === "problems" ? pick(["Problems", "題目"]) : pick(["Workspace", "工作區"])}
        </button>
      ))}
    </div>
  );
}

export default function ProblemsPage({ name }: { name: string | null }) {
  if (name === "workspace") return <WorkspacePage leftTabs={<LeftTabs current="workspace" />} />;
  return <ProblemView name={name} />;
}

function ProblemView({ name }: { name: string | null }) {
  const { pick } = useLang();
  const remembered = (() => {
    try {
      return localStorage.getItem(LAST);
    } catch {
      return null;
    }
  })();
  const problem = findProblem(name) ?? findProblem(remembered) ?? PROBLEMS[0];
  const current = problemName(problem);
  // the address always names the open problem (no new history entry)
  useEffect(() => {
    if (name !== current) history.replaceState(null, "", routeHash("problems", current));
    try {
      localStorage.setItem(LAST, current);
    } catch {
      /* private window */
    }
  }, [name, current]);

  const [tab, setTab] = useState<PhoneTab>("problem");
  const [libraryOpen, setLibraryOpen] = useState(() => {
    try {
      return localStorage.getItem("catalyzer.library") !== "closed";
    } catch {
      return true;
    }
  });
  const toggleLibrary = () =>
    setLibraryOpen((o) => {
      try {
        localStorage.setItem("catalyzer.library", o ? "closed" : "open");
      } catch {
        /* private window */
      }
      return !o;
    });
  const tabs: { id: PhoneTab; label: [string, string] }[] = [
    { id: "problem", label: ["Problem", "題目"] },
    { id: "code", label: ["Code", "程式碼"] },
    { id: "results", label: ["Results", "結果"] },
  ];

  return (
    <div className="flex flex-col bg-white xl:h-full xl:min-h-0 xl:flex-row" data-testid="problem-view">
      {/* phones and tablets: pick a problem, then a tab */}
      <div className="space-y-2 border-b border-gray-200 p-3 xl:hidden">
        <LeftTabs current="problems" />
        <select
          value={current}
          onChange={(e) => go("problems", e.target.value)}
          className="w-full rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm"
          aria-label={pick(["Problem", "題目"])}
          data-testid="problem-select"
        >
          {TRACKS.map((track) => (
            <optgroup key={track.id} label={pick(track.title)}>
              {PROBLEMS.filter((p) => p.category === track.id).map((p) => (
                <option key={p.id} value={problemName(p)}>
                  {pick(p.title)}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>
      <div className="sticky top-0 z-10 flex border-b border-gray-200 bg-white xl:hidden" role="tablist">
        {tabs.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 py-2.5 text-sm font-medium ${tab === t.id ? "border-b-2 border-(--lk-accent) text-(--lk-accent)" : "text-gray-500"}`}
            data-testid={`phone-tab-${t.id}`}
          >
            {pick(t.label)}
          </button>
        ))}
      </div>

      {libraryOpen ? (
        <aside className="hidden w-56 shrink-0 flex-col border-r border-gray-200 bg-white xl:flex xl:min-h-0" data-testid="library">
          <Library selected={current} onClose={toggleLibrary} />
        </aside>
      ) : (
        <button
          onClick={toggleLibrary}
          className="hidden w-8 shrink-0 flex-col items-center gap-2 border-r border-gray-200 bg-gray-50 py-3 text-xs text-gray-500 hover:text-(--lk-accent) xl:flex"
          title={pick(["Show the problem list", "顯示題目清單"])}
          data-testid="library-open"
        >
          »<span className="[writing-mode:vertical-rl]">{pick(["Problems", "題目"])}</span>
        </button>
      )}

      <section className={`${tab === "problem" ? "flex" : "hidden xl:flex"} min-w-0 flex-col border-r border-gray-200 xl:min-h-0 xl:w-[22%] xl:shrink-0 xl:overflow-y-auto`}>
        <ProblemHeader problem={problem} />
      </section>

      <Workbench key={problem.id} problem={problem} phoneTab={tab} onRun={() => setTab((t) => (t === "code" ? "results" : t))} />
      <GuideWindow problemId={problem.id} onPhoneTab={setTab} />
    </div>
  );
}

// ── the library ────────────────────────────────────────────────────────────────────────────────────────────────────

const fold = (s: string) => s.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();

function Library({ selected, onClose }: { selected: string; onClose: () => void }) {
  const { pick } = useLang();
  const track = findProblem(selected)?.category;
  const [open, setOpen] = useState<Set<string>>(() => new Set(TRACKS.map((t) => t.id)));
  useEffect(() => {
    if (track) setOpen((s) => (s.has(track) ? s : new Set(s).add(track)));
  }, [track]);
  const [query, setQuery] = useState("");
  const box = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      const typing = (e.target as HTMLElement).closest("input, textarea, select, [contenteditable=true], .cm-editor");
      if (e.key === "/" && !typing) {
        e.preventDefault();
        box.current?.focus();
      }
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, []);
  const words = fold(query).split(/\s+/).filter(Boolean);
  const hits = words.length
    ? PROBLEMS.filter((p) => {
        const text = fold([...p.title, ...p.summary, p.id, ...p.uses.map((u) => `${u.library} ${u.api}`)].join(" "));
        return words.every((w) => text.includes(w));
      })
    : null;

  const item = (p: Problem) => {
    const here = problemName(p) === selected;
    return (
      <li key={p.id}>
        <button
          onClick={() => go("problems", problemName(p))}
          aria-current={here ? "page" : undefined}
          className={`flex w-full items-start gap-2 rounded-md px-2 py-1.5 text-left text-sm leading-snug ${here ? "bg-orange-50 font-medium text-(--lk-accent)" : "text-gray-700 hover:bg-gray-50"}`}
          data-testid={`library-item-${problemName(p)}`}
        >
          <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${LEVEL_DOT[p.level]}`} />
          <RichText text={pick(p.title)} />
        </button>
      </li>
    );
  };

  return (
    <>
      <div className="flex shrink-0 items-center gap-1.5 border-b border-gray-100 p-2">
        <LeftTabs current="problems" />
        <button onClick={onClose} className="rounded px-1.5 py-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700" title={pick(["Hide the problem list", "隱藏題目清單"])} data-testid="library-close">
          «
        </button>
      </div>
      <div className="shrink-0 border-b border-gray-100 p-2">
        <div className="relative">
          <input
            ref={box}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={pick(["Search problems", "搜尋題目"])}
            className="w-full rounded-md border border-gray-300 py-1.5 pr-7 pl-2.5 text-sm focus:border-(--lk-accent) focus:outline-none"
            data-testid="library-search"
          />
          <kbd className="pointer-events-none absolute top-1.5 right-2 rounded border border-gray-200 px-1 text-xs text-gray-400">/</kbd>
        </div>
      </div>
      <nav className="min-h-0 flex-1 overflow-y-auto p-2" aria-label={pick(["Problems", "題目"])}>
        {hits ? (
          <ul className="space-y-0.5">{hits.length ? hits.map(item) : <li className="px-2 py-1.5 text-sm text-gray-500">{pick(["No problem matches.", "沒有符合的題目。"])}</li>}</ul>
        ) : (
          TRACKS.map((t) => {
            const list = PROBLEMS.filter((p) => p.category === t.id);
            const isOpen = open.has(t.id);
            return (
              <div key={t.id} className="mb-1">
                <button
                  onClick={() => setOpen((s) => (s.has(t.id) ? (s.delete(t.id), new Set(s)) : new Set(s).add(t.id)))}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between rounded-md px-2 py-2 text-left font-medium text-gray-900 hover:bg-gray-50"
                >
                  <span>{pick(t.title)}</span>
                  <span className="text-xs text-gray-400">
                    {list.length} {isOpen ? "▾" : "›"}
                  </span>
                </button>
                {isOpen && <ul className="space-y-0.5">{list.map(item)}</ul>}
              </div>
            );
          })
        )}
      </nav>
    </>
  );
}

// ── the problem ────────────────────────────────────────────────────────────────────────────────────────────────────

function ProblemHeader({ problem }: { problem: Problem }) {
  const { pick } = useLang();
  const track = TRACKS.find((t) => t.id === problem.category)!;
  return (
    <div className="space-y-3 px-5 py-4" data-testid="problem-header">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-gray-900">
          <RichText text={pick(problem.title)} />
        </h1>
        <div className="mt-1.5 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-orange-50 px-2.5 py-0.5 text-xs font-medium text-(--lk-accent)">{pick(track.title)}</span>
          <span className={`flex items-center gap-1.5 rounded-full border border-gray-200 px-2.5 py-0.5 text-xs font-medium ${LEVEL_TEXT[problem.level]}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${LEVEL_DOT[problem.level]}`} />
            {pick(LEVEL[problem.level])}
          </span>
        </div>
        <div className="mt-2">
          <TutorialBar problemId={problem.id} />
        </div>
      </div>
      <p className="text-sm leading-relaxed text-gray-600">
        <RichText text={pick(problem.summary)} />
      </p>
      <ProblemPicture src={asset(problem.picture)} alt={pick(problem.title)} />
      {problem.uses.length > 0 && (
        <ul className="flex flex-wrap gap-1.5" data-testid="uses">
          {problem.uses.map((u) => (
            <li key={u.api}>
              <a href={u.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white px-2.5 py-0.5 text-xs text-gray-700 hover:border-(--lk-accent) hover:text-(--lk-accent)">
                <span className="text-gray-400">{u.library}</span>
                <code>{u.api}</code> ↗
              </a>
            </li>
          ))}
        </ul>
      )}
      {problem.notes && (
        <p className="rounded-lg bg-gray-50 p-3 text-sm leading-relaxed text-gray-700" data-testid="notes">
          <RichText text={pick(problem.notes)} />
        </p>
      )}
      <RelatedProblems site="catalyzer" id={problemName(problem)} />
    </div>
  );
}

// ── parameters ─────────────────────────────────────────────────────────────────────────────────────────────────────

type Values = Record<string, string | number>;

function ParamField({ p, value, onChange }: { p: Param; value: string | number; onChange: (v: string | number) => void }) {
  const { pick } = useLang();
  const box = "rounded-md border border-gray-300 bg-white px-2 py-1 text-sm focus:border-(--lk-accent) focus:outline-none";
  return (
    <label className={`flex min-w-0 items-center gap-1.5 ${p.type === "smiles" || p.type === "text" ? "flex-1 basis-80" : ""}`} data-testid={`param-${p.id}`}>
      <span className="shrink-0 text-xs font-medium text-gray-600">{pick(p.label)}</span>
      {p.type === "select" ? (
        <select value={String(value)} onChange={(e) => onChange(e.target.value)} className={box}>
          {p.options!.map(([en, zh, v]) => (
            <option key={v} value={v}>
              {pick([en, zh])}
            </option>
          ))}
        </select>
      ) : p.type === "int" || p.type === "float" ? (
        <>
          <input type="range" min={p.min} max={p.max} step={p.step} value={Number(value)} onChange={(e) => onChange(p.type === "int" ? parseInt(e.target.value) : parseFloat(e.target.value))} className="w-24 accent-(--lk-accent)" />
          <span className="w-8 font-mono text-xs text-gray-700">{value}</span>
        </>
      ) : (
        <>
          {p.presets && (
            <select value={p.presets.find((x) => x[2] === value)?.[2] ?? ""} onChange={(e) => e.target.value && onChange(e.target.value)} className={`max-w-[9rem] shrink-0 ${box}`} aria-label={pick(["Examples", "範例"])}>
              <option value="">{pick(["Your own…", "自訂…"])}</option>
              {p.presets.map(([en, zh, v]) => (
                <option key={v} value={v}>
                  {pick([en, zh])}
                </option>
              ))}
            </select>
          )}
          <input value={String(value)} onChange={(e) => onChange(e.target.value)} spellCheck={false} className={`min-w-0 flex-1 font-mono text-xs ${box}`} />
        </>
      )}
    </label>
  );
}

// ── the code, the parameters and the results ──────────────────────────────────────────────────────────────────────

/** the feedback column's tabs: everything, or one kind of result, or the tests */
type Pane = "all" | "2d" | "3d" | "data" | "tests";

function Workbench({ problem, phoneTab, onRun }: { problem: Problem; phoneTab: PhoneTab; onRun: () => void }) {
  const { pick } = useLang();
  const defaults = useMemo(() => Object.fromEntries(problem.params.map((p) => [p.id, p.default])) as Values, [problem]);
  // Tensorizer's order: the tests (written first), what a run does, then the functions themselves
  const [file, setFile] = useState<"answer" | "main" | "test">("test");
  const [wrap, setWrap] = useState(() => {
    try {
      return localStorage.getItem("catalyzer.wrap") !== "off";
    } catch {
      return true;
    }
  });
  const toggleWrap = () =>
    setWrap((w) => {
      try {
        localStorage.setItem("catalyzer.wrap", w ? "off" : "on");
      } catch {
        /* private window */
      }
      return !w;
    });
  const [code, setCode] = useState(() => loadDraft(problem.id) ?? problem.solution);
  const [values, setValues] = useState<Values>(defaults);
  const [alive, setAlive] = useState<boolean | null>(null);
  const [busy, setBusy] = useState<"run" | "test" | null>(null);
  const [pane, setPane] = useState<Pane>("all");
  const [shown, setShown] = useState<{ items: ResultItem[]; live: boolean } | null>(null);
  const [run, setRun] = useState<RunResult | null>(null);
  const [tests, setTests] = useState<RunResult | null>(null);
  const [needRunner, setNeedRunner] = useState(false);

  useEffect(() => {
    const ctl = new AbortController();
    runnerAlive(ctl.signal).then((ok) => !ctl.signal.aborted && setAlive(ok));
    fetch(asset(problem.results), { signal: ctl.signal })
      .then((r) => r.json())
      .then((items) => setShown((s) => s ?? { items, live: false }))
      .catch(() => {});
    return () => ctl.abort();
  }, [problem]);

  const edited = code !== problem.solution;
  const download = useMemo(() => `data:text/x-python;charset=utf-8,${encodeURIComponent(code)}`, [code]);
  const setCodeAndSave = (v: string) => {
    setCode(v);
    saveDraft(problem.id, v === problem.solution ? null : v);
  };

  const go_ = async (mode: "run" | "test") => {
    setBusy(mode);
    setNeedRunner(false);
    try {
      const r = await runAnswer(problem.id, code, mode, values);
      setAlive(true);
      if (mode === "run") {
        setRun(r);
        if (r.status === "done") setShown({ items: r.results, live: true });
        setPane("all");
      } else {
        setTests(r);
        setPane("tests");
        if (r.status === "passed") markSolved(problem.id);
      }
      onRun();
    } catch {
      const ok = await runnerAlive();
      setAlive(ok);
      setNeedRunner(!ok);
      setPane("all");
      onRun();
    } finally {
      setBusy(null);
    }
  };

  const codeVisible = phoneTab === "code" ? "flex" : "hidden xl:flex";
  const resultsVisible = phoneTab === "results" ? "flex" : "hidden xl:flex";
  const editorText = file === "answer" ? code : file === "main" ? problem.main : problem.test;
  const [terminalOpen, setTerminalOpen] = useState(false);
  // the feedback tabs offered: only the kinds this problem's results have
  const items = shown?.items ?? [];
  const kindsOf: Record<Exclude<Pane, "all" | "tests">, ResultItem["kind"][]> = { "2d": ["svg"], "3d": ["mol3d", "pdb3d"], data: ["table", "bars", "text", "link"] };
  const panes: { id: Pane; label: [string, string] }[] = [
    { id: "all", label: ["Results", "結果"] },
    ...(items.some((x) => x.kind === "svg") ? [{ id: "2d" as const, label: ["Structure", "結構"] as [string, string] }] : []),
    ...(items.some((x) => x.kind === "mol3d" || x.kind === "pdb3d") ? [{ id: "3d" as const, label: ["3D", "3D"] as [string, string] }] : []),
    ...(items.some((x) => kindsOf.data.includes(x.kind)) ? [{ id: "data" as const, label: ["Tables", "表格"] as [string, string] }] : []),
    { id: "tests", label: ["Tests", "測試"] },
  ];
  const visible = pane === "all" || pane === "tests" ? items : items.filter((x) => x.kind === "metric" || kindsOf[pane].includes(x.kind));

  return (
    <>
      {/* the code: parameters and Run in one toolbar, the files, the terminal folded below */}
      <section className={`${codeVisible} min-w-0 flex-1 flex-col border-r border-gray-200 xl:min-h-0`} data-testid="workbench">
        <div className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-2 border-b border-gray-200 bg-gray-50/80 px-3 py-2" data-testid="parameters">
          <button onClick={() => go_("run")} disabled={busy !== null} className="shrink-0 rounded-md bg-(--lk-accent) px-4 py-1.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50" data-testid="run">
            ▶ {busy === "run" ? pick(["Running…", "執行中…"]) : pick(["Run", "執行"])}
          </button>
          {problem.params.map((p) => (
            <ParamField key={p.id} p={p} value={values[p.id]} onChange={(v) => setValues((s) => ({ ...s, [p.id]: v }))} />
          ))}
          <button onClick={() => go_("test")} disabled={busy !== null} className="shrink-0 rounded-md border border-(--lk-accent) bg-white px-3 py-1 text-sm font-medium text-(--lk-accent) hover:bg-orange-50 disabled:opacity-50" data-testid="test">
            ✓ {busy === "test" ? pick(["Testing…", "測試中…"]) : pick(["Tests", "測試"])}
          </button>
          <button onClick={() => setValues(defaults)} className="shrink-0 text-xs text-gray-500 hover:text-(--lk-accent)">
            {pick(["Defaults", "預設值"])}
          </button>
          <span className="flex shrink-0 items-center gap-1.5 text-xs text-gray-500" data-testid="runner-status" title={alive ? pick(["runner connected", "執行器已連線"]) : pick(["no runner on this computer", "這台電腦上沒有執行器"])}>
            <span className={`h-2 w-2 rounded-full ${alive ? "bg-green-500" : alive === false ? "bg-gray-300" : "bg-amber-300"}`} />
            {alive ? pick(["runner", "執行器"]) : alive === false ? pick(["no runner", "無執行器"]) : "…"}
          </span>
        </div>
        <div className="flex shrink-0 items-end gap-1 overflow-x-auto border-b border-gray-200 bg-gray-50 px-2 pt-1.5" role="tablist">
          {(
            [
              ["test", "0. test.py"],
              ["main", "1. main.py"],
              ["answer", "2. answer.py"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              role="tab"
              aria-selected={file === id}
              onClick={() => setFile(id)}
              className={`rounded-t-md border border-b-0 px-3 py-1 font-mono text-sm ${file === id ? "border-gray-200 bg-white text-gray-900" : "border-transparent text-gray-500 hover:text-gray-800"}`}
              data-testid={`file-${id}`}
            >
              {label}
              {id === "answer" && edited && <span className="ml-1 text-(--lk-accent)">●</span>}
            </button>
          ))}
          <span className="mb-1 ml-auto flex shrink-0 gap-3 pl-2 text-xs text-gray-500">
            <button onClick={toggleWrap} aria-pressed={wrap} className={wrap ? "text-(--lk-accent)" : "hover:text-(--lk-accent)"} title={pick(["Wrap long lines", "長行自動換行"])} data-testid="wrap">
              ↩ {pick(["Wrap", "換行"])}
            </button>
          {file === "answer" && (
            <>
              {edited && (
                <button onClick={() => setCodeAndSave(problem.solution)} className="hover:text-(--lk-accent)" data-testid="restore">
                  {pick(["Restore", "還原"])}
                </button>
              )}
              <button onClick={() => setCodeAndSave(problem.stub)} className="hover:text-(--lk-accent)" data-testid="blank">
                {pick(["Start from blank", "從空白開始"])}
              </button>
              <a href={download} download="answer.py" className="hover:text-(--lk-accent)">
                {pick(["Download", "下載"])}
              </a>
            </>
          )}
          </span>
        </div>
        <div className="h-[55vh] min-h-0 overflow-hidden text-sm xl:h-auto xl:flex-1">
          <CodeMirror
            key={file}
            value={editorText}
            height="100%"
            className="h-full"
            extensions={[PY, ...(wrap ? [EditorView.lineWrapping] : []), ...(file === "answer" ? [] : READ_ONLY)]}
            onChange={file === "answer" ? setCodeAndSave : undefined}
            basicSetup={{ foldGutter: false }}
            aria-label={file === "answer" ? pick(["Python code", "Python 程式碼"]) : `${file}.py`}
          />
        </div>
        <div className="shrink-0 border-t border-gray-200 bg-gray-50">
          <button onClick={() => setTerminalOpen((o) => !o)} className="flex w-full items-center gap-1.5 px-3 py-1.5 text-xs font-semibold tracking-wide text-gray-500 uppercase hover:text-gray-800" data-testid="terminal-toggle">
            {terminalOpen ? "▾" : "▸"} {pick(["Terminal", "終端機"])}
          </button>
          {terminalOpen && (
            <pre className="max-h-48 overflow-auto border-t border-gray-200 bg-white px-3 py-2 font-mono text-xs whitespace-pre-wrap text-gray-800" data-testid="terminal">
              {run?.output || tests?.output || pick(["Run or test to see the program's output here.", "執行或測試後，程式的輸出會顯示在這裡。"])}
            </pre>
          )}
        </div>
      </section>

      {/* the feedback, full height, in tabs */}
      <section className={`${resultsVisible} min-w-0 flex-col xl:min-h-0 xl:w-[36%] xl:shrink-0`} data-testid="results-column">
        <div className="flex h-9 shrink-0 items-center gap-1 overflow-x-auto border-b border-gray-200 bg-gray-50 px-2" role="tablist">
          {panes.map(({ id, label }) => (
            <button
              key={id}
              role="tab"
              aria-selected={pane === id}
              onClick={() => setPane(id)}
              className={`shrink-0 rounded px-2.5 py-1 text-xs font-semibold tracking-wide uppercase ${pane === id ? "bg-white text-gray-900 ring-1 ring-gray-200" : "text-gray-500 hover:text-gray-800"}`}
              data-testid={`pane-${id}`}
            >
              {pick(label)}
              {id === "tests" && tests && (
                <span className={`ml-1 ${tests.status === "passed" ? "text-green-700" : "text-red-700"}`}>
                  {tests.tests.filter((t) => t.passed).length}/{tests.tests.length || "–"}
                </span>
              )}
            </button>
          ))}
          {pane !== "tests" && shown && (
            <span className="ml-auto shrink-0 truncate pl-2 text-xs text-gray-500" data-testid="results-source">
              {shown.live ? pick(["your run", "你的執行結果"]) : pick(["defaults, precomputed", "預設參數，已預先算好"])}
            </span>
          )}
        </div>
        <div className="min-h-[24rem] flex-1 overflow-y-auto bg-gray-50/60 p-3">
          {needRunner && <RunnerHelp problem={problem} />}
          {pane !== "tests" && (
            <>
              {run && run.status !== "done" && <RunProblem result={run} />}
              {shown ? <ResultsView items={visible} /> : <p className="text-sm text-gray-500">…</p>}
            </>
          )}
          {pane === "tests" && (tests ? <Tests result={tests} /> : <p className="text-sm text-gray-500">{pick(["Press “Tests”: each test comes back as a chip here.", "按「測試」：每個測試都會在這裡顯示成一個標籤。"])}</p>)}
        </div>
      </section>
    </>
  );
}

function RunProblem({ result }: { result: RunResult }) {
  const { pick } = useLang();
  return (
    <div className="mb-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800" data-testid="run-problem">
      <p className="font-medium">{result.status === "rejected" ? pick(["The code breaks a rule, so it did not run:", "程式碼違反規則，所以沒有執行："]) : pick(["The run stopped with an error:", "執行時發生錯誤而停止："])}</p>
      <ul className="mt-1 list-disc pl-5 font-mono text-xs">
        {result.problems.map((p) => (
          <li key={p}>{p}</li>
        ))}
      </ul>
      <p className="mt-1 text-xs text-red-700">{pick(["The results below are from before; the terminal under the code has the full message.", "下方是先前的結果；程式碼下方的終端機有完整訊息。"])}</p>
    </div>
  );
}

function RunnerHelp({ problem }: { problem: Problem }) {
  const { pick } = useLang();
  const cmd = `git clone --recurse-submodules https://github.com/jackyko1991/catalyzer\ncd catalyzer\npixi run runner`;
  return (
    <div className="mb-3 space-y-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-gray-700" data-testid="runner-help">
      <p className="font-medium text-gray-900">{pick(["Run it on your computer", "在你的電腦上執行"])}</p>
      <p>
        <RichText
          text={pick([
            `The local runner runs the code on your own computer, so it stays there. Install [pixi](https://pixi.sh), start the runner (it listens on ${RUNNER} only), then press Run again:`,
            `本機執行器在你自己的電腦上執行程式碼，所以程式碼留在你的電腦上。安裝 [pixi](https://pixi.sh)，啟動執行器（它只在 ${RUNNER} 上接聽），再按一次「執行」：`,
          ])}
        />
      </p>
      <div className="text-xs">
        <CodeBlock code={cmd} />
      </div>
      <p className="text-gray-500">
        <RichText text={pick([`Or test a file without the site: \`pixi run check ${problem.id} answer.py\`.`, `或者不經過網站測試檔案：\`pixi run check ${problem.id} answer.py\`。`])} />
      </p>
    </div>
  );
}

function Tests({ result }: { result: RunResult }) {
  const { pick } = useLang();
  const passed = result.tests.filter((t) => t.passed).length;
  const head =
    result.status === "passed"
      ? pick([`All ${result.tests.length} tests pass.`, `全部 ${result.tests.length} 個測試通過。`])
      : result.status === "failed"
        ? pick([`${passed} of ${result.tests.length} tests pass.`, `${result.tests.length} 個測試中通過 ${passed} 個。`])
        : result.status === "rejected"
          ? pick(["The code breaks a rule, so the tests did not run:", "程式碼違反規則，所以測試沒有執行："])
          : pick(["The tests could not finish:", "測試無法完成："]);
  return (
    <div data-testid="results">
      <p className={`font-medium ${result.status === "passed" ? "text-green-700" : "text-gray-900"}`} data-testid="results-head">
        {result.status === "passed" ? "✓ " : ""}
        {head}
      </p>
      {result.problems.length > 0 && (
        <ul className="mt-2 list-disc pl-5 text-sm text-red-800">
          {result.problems.map((p) => (
            <li key={p}>
              <RichText text={p} />
            </li>
          ))}
        </ul>
      )}
      {result.tests.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-2">
          {result.tests.map((t) => (
            <li
              key={t.name}
              title={t.message || undefined}
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${t.passed ? "bg-green-50 text-green-800 ring-green-200" : "bg-red-50 text-red-800 ring-red-200"}`}
            >
              {t.passed ? "✓" : "✗"} {t.name.replace(/^test_/, "").replace(/_/g, " ")}
            </li>
          ))}
        </ul>
      )}
      {result.tests.some((t) => !t.passed && t.message) && (
        <details className="mt-3 text-sm">
          <summary className="cursor-pointer text-gray-600">{pick(["What went wrong", "哪裡出錯了"])}</summary>
          <pre className="mt-2 max-h-60 overflow-auto rounded bg-white p-3 text-xs whitespace-pre-wrap text-gray-800">
            {result.tests
              .filter((t) => !t.passed)
              .map((t) => `${t.name}\n${t.message}`)
              .join("\n\n")}
          </pre>
        </details>
      )}
    </div>
  );
}
