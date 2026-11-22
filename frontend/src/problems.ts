/**
 * The problem library as the site sees it: generated from problems/ by `pixi run export` (never edit the JSON by
 * hand), plus the tracks and the Tensorizer problems that build the models used here.
 */
import type { L } from "@learnkit/web";
import data from "./generated/problems.json";

export interface Problem {
  id: string; // "<category>/<name>"
  category: "molecules" | "biomolecules" | "pro";
  level: "beginner" | "intermediate" | "pro";
  title: L;
  summary: L;
  notes: L | null;
  mirror: { text: L; code: string }[];
  uses: { library: string; api: string; url: string }[];
  imports: string[];
  forbidden: string[];
  stub: string;
  /** the working code the editor opens with */
  solution: string;
  /** turns the parameters into results (read-only) */
  main: string;
  params: Param[];
  /** results of the defaults, computed at export (public/) */
  results: string;
  test: string;
  picture: string;
}

export interface Param {
  id: string;
  type: "smiles" | "text" | "select" | "int" | "float";
  label: L;
  default: string | number;
  min?: number;
  max?: number;
  step?: number;
  /** [English name, Chinese name, value] */
  presets?: [string, string, string][];
  /** [English label, Chinese label, value] */
  options?: [string, string, string][];
}

export const PROBLEMS = data as unknown as Problem[];

/** a problem's address: #/problems/<name> (names are unique across categories) */
export const problemName = (p: Problem) => p.id.split("/")[1];
export const findProblem = (name: string | null) => PROBLEMS.find((p) => problemName(p) === name);

export const TRACKS: { id: Problem["category"]; title: L; intro: L }[] = [
  {
    id: "molecules",
    title: ["Small molecules", "小分子"],
    intro: [
      "Atoms, bonds and rings with RDKit: from a SMILES string to the numbers a medicinal chemist checks first.",
      "用 RDKit 處理原子、鍵與環：從一個 SMILES 字串，到藥物化學家最先檢查的那些數字。",
    ],
  },
  {
    id: "biomolecules",
    title: ["DNA and proteins", "DNA 與蛋白質"],
    intro: [
      "Sequences and structures: translate a gene, compare two proteins, read atoms from a PDB file.",
      "序列與結構：轉譯一個基因、比較兩個蛋白質、從 PDB 檔讀出原子。",
    ],
  },
  {
    id: "pro",
    title: ["Professional: check an AI model", "專業：檢查 AI 模型"],
    intro: [
      "An AlphaFold prediction is a hypothesis. Read its own confidence, then measure it against an experiment.",
      "AlphaFold 的預測是一個假說。先讀它自己的信心分數，再拿它和實驗比較。",
    ],
  },
];

export const LEVEL: Record<Problem["level"], L> = {
  beginner: ["Beginner", "入門"],
  intermediate: ["Intermediate", "進階"],
  pro: ["Professional", "專業"],
};
