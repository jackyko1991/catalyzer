/**
 * Problems: the index (three tracks, then the Tensorizer models behind them) and one problem's page. A problem is
 * read in Feynman order: one paragraph, its picture, the steps in words; the code of each step only on request
 * (natural language ↔ code), then the reader's own answer, checked on their computer by the local runner.
 */
import { python } from "@codemirror/lang-python";
import { Callout, CodeBlock, go, ProblemPicture, RichText, useLang } from "@learnkit/web";
import CodeMirror from "@uiw/react-codemirror";
import { useEffect, useMemo, useState } from "react";
import { findProblem, LEVEL, type Problem, PROBLEMS, problemName, TENSORIZER_LINKS, TRACKS, tensorizerUrl } from "./problems";
import { loadDraft, RUNNER, runAnswer, type RunResult, runnerAlive, saveDraft } from "./runner";

const PY = python();
const asset = (p: string) => `${import.meta.env.BASE_URL}${p}`;

export default function ProblemsPage({ name }: { name: string | null }) {
  const problem = findProblem(name);
  return problem ? <ProblemView key={problem.id} problem={problem} /> : <ProblemIndex />;
}

function LevelBadge({ level }: { level: Problem["level"] }) {
  const { pick } = useLang();
  const tone =
    level === "pro" ? "bg-amber-50 text-amber-800 ring-amber-200" : level === "intermediate" ? "bg-sky-50 text-sky-800 ring-sky-200" : "bg-emerald-50 text-emerald-800 ring-emerald-200";
  return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ring-1 ${tone}`}>{pick(LEVEL[level])}</span>;
}

function ProblemIndex() {
  const { pick } = useLang();
  return (
    <div className="mx-auto max-w-5xl px-5 pt-8 pb-16" data-testid="problems-index">
      <h1 className="text-3xl font-semibold tracking-tight text-gray-900">{pick(["Problems", "題庫"])}</h1>
      <p className="mt-3 max-w-3xl text-gray-600">
        <RichText
          text={pick([
            "Each problem is a fixed test file (the contract) and a Python file whose function signatures are fixed: you write the bodies, and the tests check them on your own computer. Read the steps in words first; the code for each step is there when you want it.",
            "每一題都有一個固定的測試檔（也就是規格），和一個函式簽名已固定的 Python 檔：你寫出函式內容，測試在你自己的電腦上檢查它。先讀文字描述的步驟；需要時，每一步的程式碼都在那裡。",
          ])}
        />
      </p>
      {TRACKS.map((track) => (
        <section key={track.id} className="mt-10" data-testid={`track-${track.id}`}>
          <h2 className="text-xl font-semibold text-gray-900">{pick(track.title)}</h2>
          <p className="mt-1 text-sm text-gray-600">{pick(track.intro)}</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {PROBLEMS.filter((p) => p.category === track.id).map((p) => (
              <button
                key={p.id}
                onClick={() => go("problems", problemName(p))}
                className="group flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white text-left shadow-sm transition hover:border-(--lk-accent) hover:shadow"
                data-testid={`problem-card-${problemName(p)}`}
              >
                <img src={asset(p.picture)} alt="" className="aspect-[8/5] w-full border-b border-gray-100 object-cover" loading="lazy" />
                <div className="flex flex-1 flex-col gap-2 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-medium text-gray-900 group-hover:text-(--lk-accent)">
                      <RichText text={pick(p.title)} />
                    </h3>
                    <LevelBadge level={p.level} />
                  </div>
                  <p className="line-clamp-3 text-sm text-gray-600">
                    <RichText text={pick(p.summary)} />
                  </p>
                </div>
              </button>
            ))}
          </div>
        </section>
      ))}
      <section className="mt-12 rounded-xl border border-gray-200 bg-white p-5" data-testid="tensorizer-links">
        <h2 className="text-xl font-semibold text-gray-900">{pick(["Build the model in Tensorizer", "在 Tensorizer 中建構模型"])}</h2>
        <p className="mt-1 text-sm text-gray-600">
          {pick([
            "Tensorizer, a sister lab, builds the models behind these tools from tensors in PyTorch. Build one there, then use the real thing on molecules here.",
            "姊妹站 Tensorizer 用 PyTorch 從張量開始，建構這些工具背後的模型。在那裡建一個，再回到這裡把真正的工具用在分子上。",
          ])}
        </p>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {TENSORIZER_LINKS.map((l) => (
            <li key={l.id}>
              <a href={tensorizerUrl(l.id)} target="_blank" rel="noreferrer" className="block rounded-lg border border-gray-100 p-3 hover:border-(--lk-accent)">
                <span className="font-medium text-gray-900">{pick(l.title)} ↗</span>
                <span className="mt-0.5 block text-sm text-gray-600">{pick(l.why)}</span>
                <code className="mt-1 block text-xs text-gray-400">{l.id}</code>
              </a>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function ProblemView({ problem }: { problem: Problem }) {
  const { pick } = useLang();
  const [showCode, setShowCode] = useState(false);
  const track = TRACKS.find((t) => t.id === problem.category)!;
  return (
    <div className="mx-auto max-w-5xl px-5 pt-6 pb-16" data-testid="problem-view">
      <button onClick={() => go("problems")} className="text-sm text-gray-500 hover:text-(--lk-accent)">
        ← {pick(["All problems", "所有題目"])}
      </button>
      <p className="mt-4 text-sm font-medium text-(--lk-accent)">{pick(track.title)}</p>
      <div className="mt-1 flex flex-wrap items-center gap-3">
        <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
          <RichText text={pick(problem.title)} />
        </h1>
        <LevelBadge level={problem.level} />
      </div>
      <p className="mt-4 text-gray-700">
        <RichText text={pick(problem.summary)} />
      </p>
      <div className="mt-4 max-w-xl">
        <ProblemPicture src={asset(problem.picture)} alt={pick(problem.title)} />
      </div>

      <section className="mt-10" data-testid="mirror">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-xl font-semibold text-gray-900">{pick(["The steps, in words", "用文字寫出的步驟"])}</h2>
          <button
            onClick={() => setShowCode((v) => !v)}
            className="rounded-md border border-gray-300 px-3 py-1 text-sm text-gray-700 hover:border-(--lk-accent) hover:text-(--lk-accent)"
            data-testid="mirror-toggle"
          >
            {showCode ? pick(["Hide the code", "隱藏程式碼"]) : pick(["Show the code for each step", "顯示每一步的程式碼"])}
          </button>
        </div>
        <p className="mt-1 text-sm text-gray-500">
          {pick([
            "Try writing each step yourself before you look: the words and the code say the same thing in two languages.",
            "看答案之前，先自己試著寫出每一步：文字與程式碼是用兩種語言說同一件事。",
          ])}
        </p>
        <ol className="mt-4 space-y-3">
          {problem.mirror.map((step, i) => (
            <li key={i} className={`grid gap-3 rounded-lg border border-gray-200 bg-white p-3 ${showCode ? "md:grid-cols-2" : ""}`}>
              <div className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-50 text-xs font-semibold text-orange-800">{i + 1}</span>
                <p className="text-gray-700">
                  <RichText text={pick(step.text)} />
                </p>
              </div>
              {showCode && (
                <div className="min-w-0 overflow-x-auto text-sm">
                  <CodeBlock code={step.code} language={PY} />
                </div>
              )}
            </li>
          ))}
        </ol>
      </section>

      {problem.notes && (
        <div className="mt-8">
          <Callout kind="note" title={["Good to know", "延伸知識"]}>
            <RichText text={pick(problem.notes)} />
          </Callout>
        </div>
      )}

      <Workbench problem={problem} />

      <section className="mt-10 grid gap-6 md:grid-cols-2">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">{pick(["The lock", "鎖定規則"])}</h2>
          <ul className="mt-2 space-y-1 text-sm text-gray-600">
            <li>{pick(["Function names, parameters and type hints stay exactly as given.", "函式名稱、參數與型別提示必須保持原樣。"])}</li>
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
          </ul>
        </div>
        {problem.uses.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{pick(["Open libraries and data used", "用到的開放函式庫與資料"])}</h2>
            <ul className="mt-2 space-y-1 text-sm">
              {problem.uses.map((u) => (
                <li key={u.api}>
                  <a href={u.url} target="_blank" rel="noreferrer" className="text-(--lk-accent) hover:underline">
                    {u.library}: <code>{u.api}</code> ↗
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <details className="mt-8 rounded-lg border border-gray-200 bg-white p-3" data-testid="contract">
        <summary className="cursor-pointer font-medium text-gray-900">{pick(["The contract: test.py (read-only)", "規格：test.py（唯讀）"])}</summary>
        <div className="mt-3 overflow-x-auto text-sm">
          <CodeBlock code={problem.test} title="test.py" language={PY} />
        </div>
      </details>
    </div>
  );
}

type Phase = { kind: "idle" } | { kind: "running" } | { kind: "done"; result: RunResult } | { kind: "offline" } | { kind: "failed"; message: string };

function Workbench({ problem }: { problem: Problem }) {
  const { pick } = useLang();
  const [code, setCode] = useState(() => loadDraft(problem.id) ?? problem.stub);
  const [phase, setPhase] = useState<Phase>({ kind: "idle" });
  const [alive, setAlive] = useState<boolean | null>(null);
  useEffect(() => {
    const ctl = new AbortController();
    runnerAlive(ctl.signal).then((ok) => !ctl.signal.aborted && setAlive(ok));
    return () => ctl.abort();
  }, []);
  const edited = code !== problem.stub;

  const run = async () => {
    setPhase({ kind: "running" });
    try {
      setPhase({ kind: "done", result: await runAnswer(problem.id, code) });
      setAlive(true);
    } catch (e) {
      const offline = !(await runnerAlive());
      setAlive(!offline);
      setPhase(offline ? { kind: "offline" } : { kind: "failed", message: String(e) });
    }
  };
  const download = useMemo(() => `data:text/x-python;charset=utf-8,${encodeURIComponent(code)}`, [code]);

  return (
    <section className="mt-10" data-testid="workbench">
      <h2 className="text-xl font-semibold text-gray-900">{pick(["Your answer", "你的答案"])}</h2>
      <p className="mt-1 text-sm text-gray-500">
        {pick(["Your draft is kept in this browser only.", "你的草稿只保存在這個瀏覽器中。"])}
      </p>
      <div className="mt-3 overflow-hidden rounded-lg border border-gray-300 text-sm">
        <CodeMirror
          value={code}
          extensions={[PY]}
          onChange={(v) => {
            setCode(v);
            saveDraft(problem.id, v === problem.stub ? null : v);
          }}
          basicSetup={{ foldGutter: false }}
          minHeight="12rem"
          aria-label={pick(["Python answer", "Python 答案"])}
        />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          onClick={run}
          disabled={phase.kind === "running"}
          className="rounded-md bg-(--lk-accent) px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
          data-testid="run"
        >
          {phase.kind === "running" ? pick(["Checking…", "檢查中…"]) : pick(["Check on my computer", "在我的電腦上檢查"])}
        </button>
        <a href={download} download="answer.py" className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:border-(--lk-accent)">
          {pick(["Download answer.py", "下載 answer.py"])}
        </a>
        {edited && (
          <button
            onClick={() => {
              setCode(problem.stub);
              saveDraft(problem.id, null);
              setPhase({ kind: "idle" });
            }}
            className="px-2 py-2 text-sm text-gray-500 hover:text-red-700"
          >
            {pick(["Start again", "重新開始"])}
          </button>
        )}
        <span className="ml-auto flex items-center gap-1.5 text-xs text-gray-500" data-testid="runner-status">
          <span className={`h-2 w-2 rounded-full ${alive ? "bg-emerald-500" : alive === false ? "bg-gray-300" : "bg-amber-300"}`} />
          {alive ? pick(["runner connected", "執行器已連線"]) : alive === false ? pick(["no runner on this computer", "這台電腦上沒有執行器"]) : "…"}
        </span>
      </div>
      {(phase.kind === "offline" || (alive === false && phase.kind === "idle")) && <RunnerHelp problem={problem} />}
      {phase.kind === "failed" && <p className="mt-3 text-sm text-red-700">{phase.message}</p>}
      {phase.kind === "done" && <Results result={phase.result} />}
    </section>
  );
}

function RunnerHelp({ problem }: { problem: Problem }) {
  const { pick } = useLang();
  const cmd = `git clone https://github.com/jackyko1991/catalyzer\ncd catalyzer\npixi run runner`;
  return (
    <div className="mt-4" data-testid="runner-help">
      <Callout kind="tip" title={["Run the checks on your computer", "在你的電腦上執行檢查"]}>
        <p>
          <RichText
            text={pick([
              `Your code runs on your own computer, never on a server. Install [pixi](https://pixi.sh), then start the runner (it listens on ${RUNNER} only) and press the button again:`,
              `你的程式碼在你自己的電腦上執行，絕不會在伺服器上執行。安裝 [pixi](https://pixi.sh)，啟動執行器（它只在 ${RUNNER} 上接聽），再按一次按鈕：`,
            ])}
          />
        </p>
        <div className="mt-2 text-sm">
          <CodeBlock code={cmd} />
        </div>
        <p className="mt-2">
          <RichText
            text={pick([
              `Or without the site: save your answer and run \`pixi run check ${problem.id} answer.py\`.`,
              `或者不經過網站：存下你的答案，執行 \`pixi run check ${problem.id} answer.py\`。`,
            ])}
          />
        </p>
      </Callout>
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
    <div className="mt-4 rounded-lg border border-gray-200 bg-white p-4" data-testid="results">
      <p className={`font-medium ${result.status === "passed" ? "text-emerald-700" : "text-gray-900"}`} data-testid="results-head">
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
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${t.passed ? "bg-emerald-50 text-emerald-800 ring-emerald-200" : "bg-red-50 text-red-800 ring-red-200"}`}
            >
              {t.passed ? "✓" : "✗"} {t.name.replace(/^test_/, "").replace(/_/g, " ")}
            </li>
          ))}
        </ul>
      )}
      {result.tests.some((t) => !t.passed && t.message) && (
        <details className="mt-3 text-sm">
          <summary className="cursor-pointer text-gray-600">{pick(["What went wrong", "哪裡出錯了"])}</summary>
          <pre className="mt-2 max-h-80 overflow-auto rounded bg-gray-50 p-3 text-xs whitespace-pre-wrap text-gray-800">
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
