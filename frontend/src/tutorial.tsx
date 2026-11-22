/**
 * Tutorial mode (引導模式), as Formalizer's: the problem page looks the same with it on or off; one floating Guide
 * window does the explaining, step by step, pointing at the part of the page it talks about (a pulsing outline):
 *
 *   question → tests → code → run → check   (then a celebration when every test passes)
 *
 * Back · Next · Skip move through the steps; × ("don't show the guide again") hides it on every problem until
 * 🧭 Guide turns it back on. Progress per problem is kept in this browser (localStorage). Phones: a bottom sheet.
 */
import { RichText, useLang } from "@learnkit/web";
import { useEffect, useLayoutEffect, useState, useSyncExternalStore } from "react";

type L = readonly [string, string];

// ── progress ───────────────────────────────────────────────────────────────────────────────────────────────────────

export interface TutorialProgress {
  /** the mode is on (the default) */
  on: boolean;
  /** the guide's step per problem (0 … STEPS.length; STEPS.length = done) */
  step: Record<string, number>;
  /** problems whose tests all passed in tutorial mode */
  solved: string[];
  /** "don't show the guide again" */
  guideOff: boolean;
}

const KEY = "catalyzer.tutorial";
const EMPTY: TutorialProgress = { on: true, step: {}, solved: [], guideOff: false };
const listeners = new Set<() => void>();
let cached: TutorialProgress | null = null;

function read(): TutorialProgress {
  if (cached) return cached;
  try {
    cached = { ...EMPTY, ...JSON.parse(localStorage.getItem(KEY) ?? "{}") };
  } catch {
    cached = { ...EMPTY };
  }
  return cached!;
}

export function updateTutorial(f: (p: TutorialProgress) => TutorialProgress) {
  cached = f(read());
  try {
    localStorage.setItem(KEY, JSON.stringify(cached));
  } catch {
    /* private window: progress lasts for this visit */
  }
  listeners.forEach((l) => l());
}

export function useTutorial(): TutorialProgress {
  return useSyncExternalStore(
    (l) => (listeners.add(l), () => listeners.delete(l)),
    read,
    read,
  );
}

/** a passing test run, reported by the problem page: the last step is done and the problem is solved */
export function markSolved(problemId: string) {
  updateTutorial((p) => (p.on ? { ...p, solved: [...new Set([...p.solved, problemId])], step: { ...p.step, [problemId]: STEPS.length } } : p));
}

// ── the steps ──────────────────────────────────────────────────────────────────────────────────────────────────────

export interface GuideStep {
  id: string;
  title: L;
  text: L;
  /** what the step points at (data-testid), most precise first */
  target: string[];
  /** on phones, the tab that shows the target */
  phoneTab: "problem" | "code" | "results";
}

export const STEPS: GuideStep[] = [
  {
    id: "question",
    title: ["The question", "問題"],
    text: [
      "Start here: what does this problem ask? Read the short summary and look at the picture. Words in **bold** are the ideas you are about to compute.",
      "從這裡開始：這道題在問什麼？讀一下簡短的說明，看看圖。**粗體**的字，就是你接下來要計算的想法。",
    ],
    target: ["problem-header"],
    phoneTab: "problem",
  },
  {
    id: "tests",
    title: ["The tests come first", "先看測試"],
    text: [
      "**0. test.py** says what a right answer must do, before any code exists: each `def test_…` is one promise, such as \"water weighs 18.015\". Open it and read one or two.",
      "**0. test.py** 在任何程式碼出現之前，先說明正確答案必須做到什麼：每個 `def test_…` 就是一個承諾，例如「水的分子量是 18.015」。打開它，讀一兩個。",
    ],
    target: ["file-test"],
    phoneTab: "code",
  },
  {
    id: "code",
    title: ["The code that answers", "回答問題的程式碼"],
    text: [
      "**2. answer.py** holds the functions the tests call. They already work, so you can read how. Want to try yourself? **Start from blank** empties them; **Restore** brings the working version back.",
      "**2. answer.py** 裡是測試會呼叫的函式。它們已經能正常運作，你可以看看是怎麼寫的。想自己試試看？**從空白開始**會清空它們；**還原**會把能運作的版本找回來。",
    ],
    target: ["file-answer"],
    phoneTab: "code",
  },
  {
    id: "run",
    title: ["Run it", "執行看看"],
    text: [
      "Choose a molecule (or type your own) and press **▶ Run**. The runner calls your functions, and the answer is drawn on the right: structures in 2D and 3D, tables, charts.",
      "選一個分子（或輸入你自己的），按下 **▶ 執行**。執行器會呼叫你的函式，答案就畫在右邊：2D 與 3D 結構、表格、圖表。",
    ],
    target: ["parameters"],
    phoneTab: "code",
  },
  {
    id: "check",
    title: ["Check it", "檢查答案"],
    text: [
      "Press **✓ Tests**: every promise in test.py is checked, one chip each. All green means your code is right. Change something in answer.py and run the tests again to see one turn red.",
      "按下 **✓ 測試**：test.py 裡的每個承諾都會被檢查，每個一個標籤。全部變綠，代表你的程式碼是對的。在 answer.py 裡改一點東西，再執行一次測試，看看哪一個變紅。",
    ],
    target: ["test"],
    phoneTab: "results",
  },
];

const DONE_TEXT: L = [
  "🎉 Every test passes. Try another molecule, break the code on purpose and fix it, or open the next problem.",
  "🎉 所有測試都通過了。換一個分子試試、故意把程式碼改壞再修好，或者打開下一道題。",
];

// ── the bar in the problem's header ───────────────────────────────────────────────────────────────────────────────

export function TutorialBar({ problemId }: { problemId: string }) {
  const { pick } = useLang();
  const p = useTutorial();
  const step = p.step[problemId] ?? 0;
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs" data-testid="tutorial-bar">
      <button
        type="button"
        role="switch"
        aria-checked={p.on}
        onClick={() => updateTutorial((q) => ({ ...q, on: !q.on }))}
        className="flex items-center gap-1.5 text-gray-600 hover:text-gray-900"
        data-testid="tutorial-switch"
      >
        <span className={`relative inline-block h-4 w-7 rounded-full transition ${p.on ? "bg-(--lk-accent)" : "bg-gray-300"}`}>
          <span className={`absolute top-0.5 h-3 w-3 rounded-full bg-white shadow transition ${p.on ? "left-3.5" : "left-0.5"}`} />
        </span>
        {pick(["Tutorial mode", "引導模式"])}
      </button>
      {p.on && (p.guideOff || step >= STEPS.length) && (
        <button
          onClick={() => updateTutorial((q) => ({ ...q, guideOff: false, step: { ...q.step, [problemId]: step >= STEPS.length ? 0 : step } }))}
          className="text-(--lk-accent) hover:underline"
          data-testid="tutorial-guide"
        >
          🧭 {pick(["Guide", "引導"])}
        </button>
      )}
      {p.on && p.solved.includes(problemId) && <span className="text-green-700">✓ {pick(["solved", "已完成"])}</span>}
    </div>
  );
}

// ── the floating Guide window ──────────────────────────────────────────────────────────────────────────────────────

const OUTLINE = "cz-guide-target";

/** the element a step points at, if it is on screen */
function targetOf(step: GuideStep): HTMLElement | null {
  for (const id of step.target) {
    const el = [...document.querySelectorAll<HTMLElement>(`[data-testid="${id}"]`)].find((e) => e.offsetParent !== null);
    if (el) return el;
  }
  return null;
}

export function GuideWindow({ problemId, onPhoneTab }: { problemId: string; onPhoneTab: (t: GuideStep["phoneTab"]) => void }) {
  const { pick } = useLang();
  const p = useTutorial();
  const step = p.step[problemId] ?? 0;
  const done = step >= STEPS.length;
  const solved = p.solved.includes(problemId);
  const visible = p.on && !p.guideOff && (!done || solved);
  const current = done ? STEPS[STEPS.length - 1] : STEPS[step];
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const phone = typeof window !== "undefined" && window.innerWidth < 1280;

  const go = (n: number) => updateTutorial((q) => ({ ...q, step: { ...q.step, [problemId]: Math.max(0, Math.min(STEPS.length, n)) } }));

  // on phones, show the tab where the step's target lives
  useEffect(() => {
    if (visible && phone) onPhoneTab(current.phoneTab);
  }, [visible, phone, current, onPhoneTab]);

  // outline the target, and place the window beside it (never over it)
  useLayoutEffect(() => {
    if (!visible) return;
    let el: HTMLElement | null = null;
    const place = () => {
      el?.classList.remove(OUTLINE);
      el = targetOf(current);
      if (!el) return setPos(null);
      if (!done) el.classList.add(OUTLINE);
      if (phone) return setPos(null);
      const r = el.getBoundingClientRect();
      const W = 320, H = 210, gap = 14;
      const right = r.right + gap + W < window.innerWidth;
      const left = right ? r.right + gap : r.left - gap - W >= 0 ? r.left - gap - W : Math.max(8, Math.min(window.innerWidth - W - 8, r.left));
      const top = right || r.left - gap - W >= 0 ? Math.max(64, Math.min(window.innerHeight - H - 8, r.top)) : Math.min(window.innerHeight - H - 8, r.bottom + gap);
      setPos({ top, left });
    };
    place();
    window.addEventListener("resize", place);
    const t = window.setInterval(place, 800); // the layout can change (tabs, results arriving)
    return () => {
      window.removeEventListener("resize", place);
      window.clearInterval(t);
      el?.classList.remove(OUTLINE);
    };
  }, [visible, current, done, phone]);

  if (!visible) return null;
  const box = phone
    ? "fixed inset-x-2 bottom-12 z-40"
    : "fixed z-40 w-80";
  return (
    <div
      className={`${box} rounded-xl border border-orange-200 bg-white shadow-xl ring-1 ring-black/5`}
      style={!phone && pos ? { top: pos.top, left: pos.left } : !phone ? { right: 16, bottom: 56 } : undefined}
      role="dialog"
      aria-label={pick(["Guide", "引導"])}
      data-testid="guide-window"
    >
      <div className="flex items-center gap-2 rounded-t-xl border-b border-orange-100 bg-orange-50 px-3 py-1.5 text-xs">
        <span className="font-semibold text-(--lk-accent)">🧭 {pick(["Guide", "引導"])}</span>
        <span className="truncate text-gray-700">{done ? pick(["Done", "完成"]) : pick(current.title)}</span>
        <span className="ml-auto flex gap-1" aria-hidden>
          {STEPS.map((s, i) => (
            <span key={s.id} className={`h-1.5 w-1.5 rounded-full ${i < step || done ? "bg-(--lk-accent)" : i === step ? "bg-orange-300" : "bg-gray-200"}`} />
          ))}
        </span>
        <button onClick={() => updateTutorial((q) => ({ ...q, guideOff: true }))} className="px-1 text-gray-400 hover:text-gray-700" title={pick(["Don't show the guide again", "不再顯示引導"])} data-testid="guide-close">
          ×
        </button>
      </div>
      <p className="px-3 py-2.5 text-sm leading-relaxed text-gray-700" data-testid="guide-text">
        <RichText text={pick(done ? DONE_TEXT : current.text)} />
      </p>
      <div className="flex items-center gap-2 border-t border-gray-100 px-3 py-1.5 text-xs">
        {done ? (
          <button onClick={() => go(0)} className="text-gray-500 hover:text-gray-800">
            ↺ {pick(["Start the tour again", "重新導覽"])}
          </button>
        ) : (
          <>
            <button onClick={() => go(step - 1)} disabled={step === 0} className="text-gray-500 hover:text-gray-800 disabled:opacity-30" data-testid="guide-back">
              ‹ {pick(["Back", "上一步"])}
            </button>
            <button onClick={() => go(STEPS.length)} className="text-gray-400 hover:text-gray-700">
              {pick(["Skip", "略過"])}
            </button>
            {step < STEPS.length - 1 && (
              <button onClick={() => go(step + 1)} className="ml-auto rounded-md bg-(--lk-accent) px-3 py-1 font-medium text-white hover:opacity-90" data-testid="guide-next">
                {pick(["Next", "下一步"])} ›
              </button>
            )}
            {step === STEPS.length - 1 && <span className="ml-auto text-gray-500">{pick(["press ✓ Tests", "按 ✓ 測試"])}</span>}
          </>
        )}
      </div>
    </div>
  );
}
