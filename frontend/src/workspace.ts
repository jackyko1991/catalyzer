/**
 * The Workspace's contents, kept in this browser only (localStorage): the reader's scripts and their molecules.
 * A script is Python defining run() -> results (catalyzer/render.py); "molecules" is the text of molecules.smi
 * (SMILES and an optional name per line) that every script reads through data.molecules(), plus any files the
 * reader dropped in (.smi, .csv, .sdf, .pdb). Scripts run on the reader's computer through the paired runner.
 */
import data from "./generated/workspace.json";

export interface Script {
  id: string;
  title: string;
  code: string;
}

export interface WorkspaceState {
  scripts: Script[];
  current: string;
  /** molecules.smi */
  molecules: string;
  /** other input files: name -> text */
  files: Record<string, string>;
}

export const TEMPLATES = data.templates as { id: string; title: [string, string]; code: string }[];
const KEY = "catalyzer.workspace";
const PAIR = "catalyzer.pairing";

export const newId = () => Math.random().toString(36).slice(2, 10);

export function initialWorkspace(): WorkspaceState {
  const first = { id: newId(), title: TEMPLATES[0].title[0], code: TEMPLATES[0].code };
  return { scripts: [first], current: first.id, molecules: data.molecules, files: {} };
}

export function loadWorkspace(): WorkspaceState {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const ws = JSON.parse(raw) as WorkspaceState;
      if (ws.scripts?.length) return { ...ws, files: ws.files ?? {} };
    }
  } catch {
    /* private window or a broken entry: start fresh */
  }
  return initialWorkspace();
}

export function saveWorkspace(ws: WorkspaceState) {
  try {
    localStorage.setItem(KEY, JSON.stringify(ws));
  } catch {
    /* full or private: the workspace lives for this visit only */
  }
}

/** add a molecule line to the workspace (from the Library); returns false if it is already there */
export function addMolecule(smiles: string, name: string): boolean {
  const ws = loadWorkspace();
  const line = `${smiles} ${name.replace(/\s+/g, "_")}`;
  if (ws.molecules.split("\n").some((l) => l.trim().split(/\s+/)[0] === smiles)) return false;
  ws.molecules = ws.molecules.replace(/\n*$/, "\n") + line + "\n";
  saveWorkspace(ws);
  return true;
}

/** open code as a new script (from the Library) and make it the current one */
export function addScript(title: string, code: string) {
  const ws = loadWorkspace();
  const s = { id: newId(), title, code };
  ws.scripts.push(s);
  ws.current = s.id;
  saveWorkspace(ws);
}

/** the Library's code for a PDB entry or an AlphaFold model found by live search */
export function liveCode(kind: "structures" | "predictions", id: string, name: string): string {
  const tpl = kind === "structures" ? data.structure : data.prediction;
  const safe = name.replace(/["\\\n]/g, " ").slice(0, 120);
  return tpl.replaceAll("@ID@", id).replaceAll("@EN@", safe).replaceAll("@ZH@", safe);
}

export function loadPairing(): string {
  try {
    return localStorage.getItem(PAIR) ?? "";
  } catch {
    return "";
  }
}
export function savePairing(code: string) {
  try {
    localStorage.setItem(PAIR, code);
  } catch {
    /* private window */
  }
}
