import type { ResultItem } from "./ResultsView";

/** The local runner (`pixi run runner`, catalyzer/serve.py): it checks an answer on the reader's own computer. */

export const RUNNER = "http://127.0.0.1:8795";

export interface TestResult {
  name: string;
  passed: boolean;
  message: string;
}

export interface RunResult {
  /** passed: every test; failed: some test; done: a run with results; rejected: the lock; error: timeout or crash */
  status: "passed" | "failed" | "done" | "rejected" | "error";
  tests: TestResult[];
  problems: string[];
  output: string;
  results: ResultItem[];
}

/** null when no runner answers on this computer */
export async function runnerAlive(signal?: AbortSignal): Promise<boolean> {
  try {
    const r = await fetch(`${RUNNER}/api/health`, { signal });
    return r.ok;
  } catch {
    return false;
  }
}

/** mode "run": main.py with the parameters (results to draw); "test": the problem's tests */
export async function runAnswer(problem: string, code: string, mode: "run" | "test" = "test", params: Record<string, string | number> = {}): Promise<RunResult> {
  const r = await fetch(`${RUNNER}/api/run`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ problem, code, mode, params }),
  });
  if (!r.ok) throw new Error(`runner answered ${r.status}`);
  return r.json();
}

/** the reader's draft for a problem, kept in this browser only */
const key = (id: string) => `catalyzer.code.${id}`;
export function loadDraft(id: string): string | null {
  try {
    return localStorage.getItem(key(id));
  } catch {
    return null;
  }
}
export function saveDraft(id: string, code: string | null) {
  try {
    if (code === null) localStorage.removeItem(key(id));
    else localStorage.setItem(key(id), code);
  } catch {
    /* private window: drafts are not kept */
  }
}

/** the runner's health as seen by this page: null if no runner answers; paired if the pairing code matches */
export async function runnerStatus(pairing: string, signal?: AbortSignal): Promise<{ paired: boolean } | null> {
  try {
    const r = await fetch(`${RUNNER}/api/health`, { signal, headers: pairing ? { "x-catalyzer-pairing": pairing } : {} });
    return r.ok ? { paired: Boolean((await r.json()).paired) } : null;
  } catch {
    return null;
  }
}

/** run a workspace script with its input files; throws "not paired" on 403 */
export async function runScript(code: string, inputs: Record<string, string>, pairing: string): Promise<RunResult> {
  const r = await fetch(`${RUNNER}/api/script`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-catalyzer-pairing": pairing },
    body: JSON.stringify({ code, inputs }),
  });
  if (r.status === 403) throw new Error("not paired");
  if (!r.ok) throw new Error(`runner answered ${r.status}`);
  return r.json();
}
