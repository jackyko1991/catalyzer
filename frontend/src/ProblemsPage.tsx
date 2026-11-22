/**
 * Problems: the workbench, laid out as Tensorizer's (and Formalizer's) problem page.
 *
 * Wide screens: three columns filling the window, each scrolling on its own:
 *   library (search, the three tracks folding open to their problems by level, the Tensorizer models)
 *   | the problem (title, badges, summary, picture, links; then Steps / The lock / Notes)
 *   | the code (answer.py and the read-only test.py) over the results and the terminal.
 * Phones and tablets: a problem picker, then tabs Problem · Steps · Code · Results.
 *
 * A problem is read in Feynman order: one paragraph, its picture, the steps in words; the code of each step only on
 * request (natural language ↔ code); then the reader's own answer, checked on their computer by the local runner.
 */
import { python } from "@codemirror/lang-python";
import { EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { CodeBlock, go, ProblemPicture, RichText, routeHash, useLang } from "@learnkit/web";
import CodeMirror from "@uiw/react-codemirror";
import { useEffect, useMemo, useRef, useState } from "react";
import { findProblem, LEVEL, type Problem, PROBLEMS, problemName, TENSORIZER_LINKS, tensorizerFor, tensorizerUrl, TRACKS } from "./problems";
import { loadDraft, RUNNER, runAnswer, type RunResult, runnerAlive, saveDraft } from "./runner";

const PY = python();
const READ_ONLY = [EditorState.readOnly.of(true), EditorView.editable.of(false)];
const asset = (p: string) => `${import.meta.env.BASE_URL}${p}`;
const LAST = "catalyzer.problem";

const LEVEL_DOT: Record<Problem["level"], string> = { beginner: "bg-green-500", intermediate: "bg-amber-500", pro: "bg-red-500" };
const LEVEL_TEXT: Record<Problem["level"], string> = { beginner: "text-green-700", intermediate: "text-amber-700", pro: "text-red-700" };

type PhoneTab = "problem" | "steps" | "code" | "results";

export default function ProblemsPage({ name }: { name: string | null }) {
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
  const show = (t: PhoneTab) => (tab === t ? "" : "hidden xl:flex");
  const tabs: { id: PhoneTab; label: [string, string] }[] = [
    { id: "problem", label: ["Problem", "題目"] },
    { id: "steps", label: ["Steps", "步驟"] },
    { id: "code", label: ["Code", "程式碼"] },
    { id: "results", label: ["Results", "結果"] },
  ];

  return (
    <div className="flex flex-col bg-white xl:h-full xl:min-h-0 xl:flex-row" data-testid="problem-view">
      {/* phones and tablets: pick a problem, then a tab */}
      <div className="space-y-2 border-b border-gray-200 p-3 xl:hidden">
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

      {/* 1. the library (wide screens only; phones use the picker) */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-gray-200 bg-white xl:flex xl:min-h-0" data-testid="library">
        <Library selected={current} />
      </aside>

      {/* 2. the problem */}
      <section className="flex min-w-0 flex-col border-r border-gray-200 xl:min-h-0 xl:w-[34%] xl:shrink-0 xl:overflow-y-auto">
        <div className={`${show("problem")} flex-col`}>
          <ProblemHeader problem={problem} />
        </div>
        <div className={`${show("steps")} flex-col xl:flex-1`}>
          <ProblemTabs key={problem.id} problem={problem} />
        </div>
      </section>

      {/* 3. the code, the results and the terminal */}
      <Workbench key={problem.id} problem={problem} phoneTab={tab} onRan={() => setTab((t) => (t === "code" ? "results" : t))} />
    </div>
  );
}

// ── 1. library ─────────────────────────────────────────────────────────────────────────────────────────────────────

const fold = (s: string) => s.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();

function Library({ selected }: { selected: string }) {
  const { pick } = useLang();
  const track = findProblem(selected)?.category;
  const [open, setOpen] = useState<Set<string>>(() => new Set(track ? [track] : [TRACKS[0].id]));
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
          className={`w-full rounded-md px-2 py-1.5 text-left text-sm leading-snug ${here ? "bg-orange-50 font-medium text-(--lk-accent)" : "text-gray-700 hover:bg-gray-50"}`}
          data-testid={`library-item-${problemName(p)}`}
        >
          <RichText text={pick(p.title)} />
        </button>
      </li>
    );
  };

  return (
    <>
      <div className="shrink-0 border-b border-gray-100 p-3">
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
                {isOpen &&
                  (["beginner", "intermediate", "pro"] as const).map((lv) => {
                    const inLevel = list.filter((p) => p.level === lv);
                    if (!inLevel.length) return null;
                    return (
                      <div key={lv} className="ml-2 border-l border-gray-100 pl-2">
                        <p className={`mt-1 flex items-center gap-1.5 px-2 text-xs font-semibold tracking-wide uppercase ${LEVEL_TEXT[lv]}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${LEVEL_DOT[lv]}`} />
                          {pick(LEVEL[lv])}
                        </p>
                        <ul className="space-y-0.5">{inLevel.map(item)}</ul>
                      </div>
                    );
                  })}
              </div>
            );
          })
        )}
        <div className="mt-4 border-t border-gray-100 px-2 pt-3" data-testid="tensorizer-links">
          <p className="text-xs font-semibold tracking-wide text-gray-500 uppercase">{pick(["Build the model in Tensorizer", "在 Tensorizer 中建構模型"])}</p>
          <ul className="mt-1.5 space-y-2">
            {TENSORIZER_LINKS.map((l) => (
              <li key={l.id}>
                <a href={tensorizerUrl(l.id)} target="_blank" rel="noreferrer" className="text-sm text-gray-700 hover:text-(--lk-accent)">
                  {pick(l.title)} ↗
                </a>
                <span className="mt-0.5 flex flex-wrap gap-1">
                  {l.problems.map((n) => (
                    <button
                      key={n}
                      onClick={() => go("problems", n)}
                      className={`rounded px-1.5 text-xs ring-1 ${n === selected ? "bg-orange-50 text-orange-800 ring-orange-200" : "text-gray-500 ring-gray-200 hover:text-(--lk-accent)"}`}
                    >
                      {pick(findProblem(n)!.title)}
                    </button>
                  ))}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </>
  );
}

// ── 2. the problem ─────────────────────────────────────────────────────────────────────────────────────────────────

function ProblemHeader({ problem }: { problem: Problem }) {
  const { pick } = useLang();
  const track = TRACKS.find((t) => t.id === problem.category)!;
  const related = tensorizerFor(problemName(problem));
  return (
    <div className="border-b border-gray-200 px-5 py-4" data-testid="problem-header">
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
      <p className="mt-2 text-sm leading-relaxed text-gray-600">
        <RichText text={pick(problem.summary)} />
      </p>
      <div className="mt-3">
        <ProblemPicture src={asset(problem.picture)} alt={pick(problem.title)} />
      </div>
      {problem.uses.length > 0 && (
        <ul className="mt-2 space-y-0.5 text-center text-sm">
          {problem.uses.map((u) => (
            <li key={u.api}>
              <a href={u.url} target="_blank" rel="noreferrer" className="text-(--lk-accent) hover:underline">
                {u.library}: <code>{u.api}</code> ↗
              </a>
            </li>
          ))}
        </ul>
      )}
      {related.length > 0 && (
        <div className="mt-3 rounded-lg border border-blue-100 bg-blue-50/50 p-3" data-testid="problem-tensorizer">
          <p className="text-xs font-semibold tracking-wide text-blue-800 uppercase">{pick(["Build the model in Tensorizer", "在 Tensorizer 中建構模型"])}</p>
          <ul className="mt-1 space-y-1">
            {related.map((l) => (
              <li key={l.id} className="text-sm">
                <a href={tensorizerUrl(l.id)} target="_blank" rel="noreferrer" className="font-medium text-blue-800 hover:underline">
                  {pick(l.title)} ↗
                </a>
                <span className="block text-gray-600">{pick(l.why)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function ProblemTabs({ problem }: { problem: Problem }) {
  const { pick } = useLang();
  const [tab, setTab] = useState<"steps" | "lock" | "notes">("steps");
  const [showCode, setShowCode] = useState(false);
  const tabs = [
    { id: "steps" as const, label: ["Steps", "步驟"] as [string, string] },
    { id: "lock" as const, label: ["The lock", "鎖定規則"] as [string, string] },
    ...(problem.notes ? [{ id: "notes" as const, label: ["Good to know", "延伸知識"] as [string, string] }] : []),
  ];
  return (
    <div className="flex-1 space-y-3 bg-gray-50/60 p-5">
      <div role="tablist" className="flex gap-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={`rounded-md px-3 py-1 text-sm ${tab === t.id ? "bg-white font-medium text-gray-900 shadow-sm ring-1 ring-gray-200" : "text-gray-500 hover:text-gray-800"}`}
          >
            {pick(t.label)}
          </button>
        ))}
      </div>
      {tab === "steps" && (
        <div data-testid="mirror">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs text-gray-500">
              {pick(["Write each step yourself before you look: words and code say the same thing.", "看答案之前先自己寫：文字與程式碼說的是同一件事。"])}
            </p>
            <button
              onClick={() => setShowCode((v) => !v)}
              className="rounded-md border border-gray-300 bg-white px-2.5 py-1 text-xs text-gray-700 hover:border-(--lk-accent) hover:text-(--lk-accent)"
              data-testid="mirror-toggle"
            >
              {showCode ? pick(["Hide the code", "隱藏程式碼"]) : pick(["Show the code", "顯示程式碼"])}
            </button>
          </div>
          <ol className="mt-3 space-y-2">
            {problem.mirror.map((step, i) => (
              <li key={i} className="rounded-lg border border-gray-200 bg-white p-3">
                <div className="flex gap-2.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-orange-50 text-xs font-semibold text-orange-800">{i + 1}</span>
                  <p className="text-sm text-gray-700">
                    <RichText text={pick(step.text)} />
                  </p>
                </div>
                {showCode && (
                  <div className="mt-2 overflow-x-auto text-xs">
                    <CodeBlock code={step.code} language={PY} />
                  </div>
                )}
              </li>
            ))}
          </ol>
        </div>
      )}
      {tab === "lock" && (
        <ul className="space-y-2 text-sm text-gray-700" data-testid="lock">
          <li>{pick(["Function names, parameters and type hints stay exactly as given: the tests call them so.", "函式名稱、參數與型別提示必須保持原樣：測試就是這樣呼叫它們的。"])}</li>
          <li>
            {pick(["Imports allowed:", "允許匯入："])}{" "}
            {problem.imports.length ? problem.imports.map((m) => <code key={m} className="mr-1 rounded bg-gray-100 px-1">{m}</code>) : pick(["standard maths only", "僅限標準數學模組"])}
          </li>
          {problem.forbidden.length > 0 && (
            <li>
              {pick(["Not allowed (they would do the work for you):", "不允許（它們會替你完成題目）："])}{" "}
              {problem.forbidden.map((m) => (
                <code key={m} className="mr-1 rounded bg-red-50 px-1 text-red-800">
                  {m}
                </code>
              ))}
            </li>
          )}
          <li className="text-gray-500">{pick(["No files, network or other programs: eval, open, os and the like are refused before anything runs.", "不能使用檔案、網路或其他程式：eval、open、os 之類的東西在執行之前就會被拒絕。"])}</li>
        </ul>
      )}
      {tab === "notes" && problem.notes && (
        <p className="text-sm leading-relaxed text-gray-700" data-testid="notes">
          <RichText text={pick(problem.notes)} />
        </p>
      )}
    </div>
  );
}

// ── 3. the code ────────────────────────────────────────────────────────────────────────────────────────────────────

type Phase = { kind: "idle" } | { kind: "running" } | { kind: "done"; result: RunResult } | { kind: "offline" } | { kind: "failed"; message: string };

function Workbench({ problem, phoneTab, onRan }: { problem: Problem; phoneTab: PhoneTab; onRan: () => void }) {
  const { pick } = useLang();
  const [file, setFile] = useState<"answer" | "test">("answer");
  const [code, setCode] = useState(() => loadDraft(problem.id) ?? problem.stub);
  const [phase, setPhase] = useState<Phase>({ kind: "idle" });
  const [alive, setAlive] = useState<boolean | null>(null);
  const [pane, setPane] = useState<"results" | "terminal">("results");
  useEffect(() => {
    const ctl = new AbortController();
    runnerAlive(ctl.signal).then((ok) => !ctl.signal.aborted && setAlive(ok));
    return () => ctl.abort();
  }, []);
  const edited = code !== problem.stub;
  const download = useMemo(() => `data:text/x-python;charset=utf-8,${encodeURIComponent(code)}`, [code]);

  const run = async () => {
    setPhase({ kind: "running" });
    try {
      const result = await runAnswer(problem.id, code);
      setPhase({ kind: "done", result });
      setAlive(true);
      setPane("results");
    } catch (e) {
      const offline = !(await runnerAlive());
      setAlive(!offline);
      setPhase(offline ? { kind: "offline" } : { kind: "failed", message: String(e) });
    }
    onRan();
  };

  const codeVisible = phoneTab === "code" ? "" : "hidden xl:flex";
  const resultsVisible = phoneTab === "results" ? "" : "hidden xl:flex";
  return (
    <section className="flex min-w-0 flex-1 flex-col xl:min-h-0" data-testid="workbench">
      <div className={`${codeVisible} min-h-0 flex-col xl:flex-1`}>
        <div className="flex shrink-0 items-end gap-1 overflow-x-auto border-b border-gray-200 bg-gray-50 px-2 pt-2" role="tablist">
          {(
            [
              ["answer", "answer.py"],
              ["test", "test.py"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              role="tab"
              aria-selected={file === id}
              onClick={() => setFile(id)}
              className={`rounded-t-md border border-b-0 px-3 py-1.5 font-mono text-sm ${file === id ? "border-gray-200 bg-white text-gray-900" : "border-transparent text-gray-500 hover:text-gray-800"}`}
              data-testid={`file-${id}`}
            >
              {label}
              {id === "answer" && edited && <span className="ml-1 text-(--lk-accent)">●</span>}
            </button>
          ))}
        </div>
        <div className="flex h-8 shrink-0 items-center justify-between gap-3 border-b border-gray-100 px-3 text-xs text-gray-500">
          <span className="truncate">
            {file === "answer"
              ? pick(["your answer: fill in the function bodies (kept in this browser only)", "你的答案：填寫函式內容（只保存在這個瀏覽器中）"])
              : pick(["the contract, written first (read-only)", "先寫好的規格（唯讀）"])}
          </span>
          <span className="flex shrink-0 items-center gap-1.5" data-testid="runner-status">
            <span className={`h-2 w-2 rounded-full ${alive ? "bg-green-500" : alive === false ? "bg-gray-300" : "bg-amber-300"}`} />
            {alive ? pick(["runner connected", "執行器已連線"]) : alive === false ? pick(["no runner on this computer", "這台電腦上沒有執行器"]) : "…"}
          </span>
        </div>
        <div className="h-[60vh] min-h-0 overflow-hidden text-sm xl:h-auto xl:flex-1">
          {file === "answer" ? (
            <CodeMirror
              value={code}
              height="100%"
              className="h-full"
              extensions={[PY]}
              onChange={(v) => {
                setCode(v);
                saveDraft(problem.id, v === problem.stub ? null : v);
              }}
              basicSetup={{ foldGutter: false }}
              aria-label={pick(["Python answer", "Python 答案"])}
            />
          ) : (
            <CodeMirror value={problem.test} height="100%" className="h-full" extensions={[PY, ...READ_ONLY]} basicSetup={{ foldGutter: false }} />
          )}
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2 border-t border-gray-200 bg-gray-50 px-3 py-2">
          <button
            onClick={run}
            disabled={phase.kind === "running"}
            className="rounded-md bg-(--lk-accent) px-4 py-1.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
            data-testid="run"
          >
            ▶ {phase.kind === "running" ? pick(["Checking…", "檢查中…"]) : pick(["Check on my computer", "在我的電腦上檢查"])}
          </button>
          <a href={download} download="answer.py" className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 hover:border-(--lk-accent)">
            {pick(["Download answer.py", "下載 answer.py"])}
          </a>
          {edited && (
            <button
              onClick={() => {
                setCode(problem.stub);
                saveDraft(problem.id, null);
                setPhase({ kind: "idle" });
              }}
              className="px-2 py-1.5 text-sm text-gray-500 hover:text-red-700"
            >
              {pick(["Start again", "重新開始"])}
            </button>
          )}
        </div>
      </div>

      <div className={`${resultsVisible} min-h-0 flex-col border-t border-gray-200 xl:h-[38%] xl:shrink-0`}>
        <div className="flex h-9 shrink-0 items-center gap-1 border-b border-gray-200 bg-gray-50 px-2" role="tablist">
          {(
            [
              ["results", ["Results", "結果"]],
              ["terminal", ["Terminal", "終端機"]],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              role="tab"
              aria-selected={pane === id}
              onClick={() => setPane(id)}
              className={`rounded px-2.5 py-1 text-xs font-semibold tracking-wide uppercase ${pane === id ? "bg-white text-gray-900 ring-1 ring-gray-200" : "text-gray-500 hover:text-gray-800"}`}
            >
              {pick(label)}
            </button>
          ))}
        </div>
        <div className="min-h-[12rem] flex-1 overflow-y-auto p-3">
          {pane === "terminal" ? (
            <pre className="font-mono text-xs whitespace-pre-wrap text-gray-800" data-testid="terminal">
              {phase.kind === "done" ? phase.result.output || pick(["(no output)", "（沒有輸出）"]) : pick(["Run the checks to see pytest's output here.", "執行檢查後，pytest 的輸出會顯示在這裡。"])}
            </pre>
          ) : phase.kind === "done" ? (
            <Results result={phase.result} />
          ) : phase.kind === "failed" ? (
            <p className="text-sm text-red-700">{phase.message}</p>
          ) : phase.kind === "offline" || alive === false ? (
            <RunnerHelp problem={problem} />
          ) : (
            <p className="text-sm text-gray-500">{pick(["Write your answer, then press Check: each test comes back as a chip here.", "寫好答案後按「檢查」：每個測試都會在這裡顯示成一個標籤。"])}</p>
          )}
        </div>
      </div>
    </section>
  );
}

function RunnerHelp({ problem }: { problem: Problem }) {
  const { pick } = useLang();
  const cmd = `git clone --recurse-submodules https://github.com/jackyko1991/catalyzer\ncd catalyzer\npixi run runner`;
  return (
    <div className="space-y-2 text-sm text-gray-700" data-testid="runner-help">
      <p className="font-medium text-gray-900">{pick(["Run the checks on your computer", "在你的電腦上執行檢查"])}</p>
      <p>
        <RichText
          text={pick([
            `Your code runs on your own computer, never on a server. Install [pixi](https://pixi.sh), start the runner (it listens on ${RUNNER} only), then press Check again:`,
            `你的程式碼在你自己的電腦上執行，絕不會在伺服器上執行。安裝 [pixi](https://pixi.sh)，啟動執行器（它只在 ${RUNNER} 上接聽），再按一次「檢查」：`,
          ])}
        />
      </p>
      <div className="text-xs">
        <CodeBlock code={cmd} />
      </div>
      <p className="text-gray-500">
        <RichText text={pick([`Or without the site: \`pixi run check ${problem.id} answer.py\`.`, `或者不經過網站：\`pixi run check ${problem.id} answer.py\`。`])} />
      </p>
    </div>
  );
}

function Results({ result }: { result: RunResult }) {
  const { pick } = useLang();
  const passed = result.tests.filter((t) => t.passed).length;
  const head =
    result.status === "passed"
      ? pick([`All ${result.tests.length} tests pass.`, `全部 ${result.tests.length} 個測試通過。`])
      : result.status === "failed"
        ? pick([`${passed} of ${result.tests.length} tests pass.`, `${result.tests.length} 個測試中通過 ${passed} 個。`])
        : result.status === "rejected"
          ? pick(["The answer breaks the lock, so the tests did not run:", "答案違反了鎖定規則，所以測試沒有執行："])
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
          <pre className="mt-2 max-h-60 overflow-auto rounded bg-gray-50 p-3 text-xs whitespace-pre-wrap text-gray-800">
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
