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
  test: string;
  picture: string;
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

const TENSORIZER = "https://jackyko1991.github.io/tensorizer/#/";
/** Build the model in Tensorizer (PyTorch), use it on real molecules here. `problems`: the Catalyzer problems it
 *  connects to (shown both ways: under each problem, and under each Tensorizer link). */
export const TENSORIZER_LINKS: { id: string; title: L; why: L; problems: string[] }[] = [
  {
    id: "biophysics/mini_alphafold",
    title: ["AlphaFold in miniature", "迷你 AlphaFold"],
    why: ["From a distance map to a 3D fold: the idea inside the models you check in the professional track.", "從距離圖到 3D 摺疊：專業路線中你所檢查的模型，其核心想法。"],
    problems: ["alphafold_plddt", "rmsd", "pdb_neighbours"],
  },
  {
    id: "bioinformatics/protein_language_model",
    title: ["A tiny protein language model", "迷你蛋白質語言模型"],
    why: ["How ESM-style models learn contacts from sequences alone.", "ESM 這類模型如何只從序列學到接觸。"],
    problems: ["translate", "alphafold_plddt"],
  },
  {
    id: "bioinformatics/coevolution_contacts",
    title: ["Contacts from coevolution", "從共演化找接觸"],
    why: ["Positions that mutate together touch in 3D: the signal before deep learning.", "一起突變的位置在 3D 中相鄰：深度學習之前的訊號。"],
    problems: ["sequence_identity", "pdb_neighbours"],
  },
  {
    id: "bioinformatics/sequence_alignment",
    title: ["Sequence alignment as tensor updates", "以張量更新做序列比對"],
    why: ["The Needleman–Wunsch table of the alignment problem, filled a whole anti-diagonal at a time.", "比對題目中的 Needleman–Wunsch 表格，一次填滿一整條反對角線。"],
    problems: ["sequence_identity"],
  },
  {
    id: "chemistry/molecular_gnn",
    title: ["A graph neural network for molecules", "分子的圖神經網路"],
    why: ["The atoms-and-bonds graph of the first problems, fed to a neural network.", "把前幾題的原子與鍵之圖，交給神經網路。"],
    problems: ["atoms_bonds", "similarity", "rings"],
  },
  {
    id: "physchem/hartree_fock_h2",
    title: ["Hartree–Fock for H₂", "H₂ 的 Hartree–Fock"],
    why: ["The quantum chemistry behind a bond, in a minimal basis.", "化學鍵背後的量子化學，用最小基底計算。"],
    problems: ["formal_charge"],
  },
  {
    id: "chemistry/huckel_mo_theory",
    title: ["Hückel molecular orbitals", "休克耳分子軌域"],
    why: ["Why benzene is aromatic, from the eigenvalues of its graph.", "從圖的特徵值看出苯為什麼是芳香的。"],
    problems: ["rings", "atoms_bonds"],
  },
];
/** the Tensorizer models behind a problem */
export const tensorizerFor = (name: string) => TENSORIZER_LINKS.filter((l) => l.problems.includes(name));
export const tensorizerUrl = (id: string) => TENSORIZER + id;
