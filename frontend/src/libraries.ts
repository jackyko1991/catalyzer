/**
 * The open-library map: the open libraries, databases and AI models of molecular science, what each is for, its
 * licence (checked on the project's own licence page), and which Catalyzer problems use it. Like Formalizer's
 * Mathlib map, it shows where the problems sit in the wider open ecosystem.
 */
import type { L } from "@learnkit/web";
import { PROBLEMS, type Problem } from "./problems";

export type LibKind = "library" | "database" | "model";

export interface Lib {
  id: string;
  name: string;
  kind: LibKind;
  what: L;
  licence: string;
  url: string;
  /** names used in problems' meta.yaml `uses` (library field) */
  aliases?: string[];
}

export const KINDS: Record<LibKind, { label: L; colour: string }> = {
  library: { label: ["Python libraries", "Python 函式庫"], colour: "#047857" },
  database: { label: ["Databases", "資料庫"], colour: "#2563eb" },
  model: { label: ["AI models", "AI 模型"], colour: "#d97706" },
};

export const LIBS: Lib[] = [
  // libraries
  { id: "rdkit", name: "RDKit", kind: "library", licence: "BSD-3-Clause", url: "https://www.rdkit.org/docs/", what: ["Small molecules: read SMILES, find rings and substructures, descriptors, fingerprints, 3D conformers.", "小分子：讀取 SMILES、找環與子結構、描述子、分子指紋、3D 構形。"] },
  { id: "biopython", name: "Biopython", kind: "library", licence: "Biopython License Agreement (some files also BSD-3-Clause)", url: "https://biopython.org/", what: ["Sequences and structures: FASTA, translation, alignment, PDB and mmCIF parsing.", "序列與結構：FASTA、轉譯、比對、PDB 與 mmCIF 解析。"] },
  { id: "numpy", name: "NumPy", kind: "library", licence: "BSD-3-Clause", url: "https://numpy.org/doc/", what: ["Arrays of numbers: coordinates, distances, the SVD behind superposition.", "數值陣列：座標、距離、疊合背後的 SVD。"], aliases: ["numpy"] },
  { id: "pytorch", name: "PyTorch", kind: "library", licence: "BSD-3-Clause", url: "https://pytorch.org/docs/", what: ["Tensors and automatic gradients: the engine of the AI models (built step by step in Tensorizer).", "張量與自動微分：AI 模型的引擎（在 Tensorizer 中逐步建構）。"] },
  { id: "openmm", name: "OpenMM", kind: "library", licence: "MIT (CUDA and OpenCL platforms LGPL)", url: "https://openmm.org/", what: ["Molecular dynamics: move atoms by physics to relax and test a structure.", "分子動力學：依物理移動原子，鬆弛並檢驗結構。"] },
  { id: "3dmol", name: "3Dmol.js", kind: "library", licence: "BSD-3-Clause", url: "https://3dmol.org/", what: ["The 3D viewer on this site: molecules and proteins in a web page.", "本站的 3D 檢視器：在網頁中顯示分子與蛋白質。"] },
  { id: "openbabel", name: "Open Babel", kind: "library", licence: "GPL-2.0-only", url: "https://openbabel.org/", what: ["Converts between more than a hundred chemical file formats.", "在上百種化學檔案格式之間轉換。"] },
  // databases
  { id: "pdb", name: "Protein Data Bank", kind: "database", licence: "CC0 1.0", url: "https://www.rcsb.org/", what: ["Every experimentally solved structure of a protein or nucleic acid, free since 1971.", "所有以實驗解出的蛋白質與核酸結構，自 1971 年起免費開放。"] },
  { id: "uniprot", name: "UniProt", kind: "database", licence: "CC BY 4.0", url: "https://www.uniprot.org/", what: ["Protein sequences and what is known about them; its accession numbers name AlphaFold DB entries.", "蛋白質序列與相關知識；AlphaFold DB 的條目以它的編號命名。"] },
  { id: "pubchem", name: "PubChem", kind: "database", licence: "free to use; each data source may set its own terms", url: "https://pubchem.ncbi.nlm.nih.gov/", what: ["More than a hundred million chemical compounds and their measured properties (NCBI).", "超過一億個化合物及其量測性質（NCBI）。"] },
  { id: "chembl", name: "ChEMBL", kind: "database", licence: "CC BY-SA 3.0", url: "https://www.ebi.ac.uk/chembl/", what: ["Drug-like molecules and how strongly they act on protein targets, from the literature.", "類藥分子，以及文獻中它們對蛋白質標靶的作用強度。"] },
  { id: "afdb", name: "AlphaFold DB", kind: "database", licence: "CC BY 4.0", url: "https://alphafold.ebi.ac.uk/", what: ["Over 200 million predicted protein structures, each with pLDDT and PAE confidence.", "超過兩億個預測的蛋白質結構，每個都附 pLDDT 與 PAE 信心分數。"] },
  // models
  { id: "alphafold2", name: "AlphaFold 2", kind: "model", licence: "Apache-2.0 (code), CC BY 4.0 (weights)", url: "https://github.com/google-deepmind/alphafold", what: ["Predicts a protein's structure from its sequence and a multiple sequence alignment.", "從序列與多序列比對預測蛋白質結構。"] },
  { id: "alphafold3", name: "AlphaFold 3", kind: "model", licence: "Apache-2.0 (code); weights under non-commercial terms of use", url: "https://github.com/google-deepmind/alphafold3", what: ["Complexes of proteins with DNA, RNA, ligands and ions.", "蛋白質與 DNA、RNA、配體、離子組成的複合體。"] },
  { id: "colabfold", name: "ColabFold", kind: "model", licence: "MIT", url: "https://github.com/sokrypton/ColabFold", what: ["AlphaFold 2 made fast and easy to run, with a quick MSA server.", "讓 AlphaFold 2 執行得又快又簡單，附快速的 MSA 伺服器。"] },
  { id: "esm", name: "ESM / ESMFold", kind: "model", licence: "MIT (code); ESM Atlas data CC BY 4.0", url: "https://github.com/Biohub/esm-archive", what: ["Protein language models; ESMFold predicts structure from one sequence.", "蛋白質語言模型；ESMFold 只需一條序列就能預測結構。"] },
  { id: "rfdiffusion", name: "RFdiffusion", kind: "model", licence: "BSD-3-Clause (code and weights)", url: "https://github.com/RosettaCommons/RFdiffusion", what: ["Generates new protein backbones by diffusion.", "用擴散模型產生新的蛋白質骨架。"] },
  { id: "proteinmpnn", name: "ProteinMPNN", kind: "model", licence: "MIT", url: "https://github.com/dauparas/ProteinMPNN", what: ["Designs a sequence that should fold into a given backbone.", "為給定的骨架設計一條應該會摺成它的序列。"] },
  { id: "boltz", name: "Boltz", kind: "model", licence: "MIT", url: "https://github.com/jwohlwend/boltz", what: ["An open model for biomolecular complexes in the spirit of AlphaFold 3.", "一個開放的生物分子複合體模型，精神與 AlphaFold 3 相近。"] },
];

const ALIAS: Record<string, string> = { "Protein Data Bank": "pdb", "AlphaFold DB": "afdb", RDKit: "rdkit", Biopython: "biopython", numpy: "numpy" };

/** the problems that use a library (through meta.yaml `uses`, or an allowed import) */
export function problemsUsing(lib: Lib): Problem[] {
  return PROBLEMS.filter(
    (p) => p.uses.some((u) => ALIAS[u.library] === lib.id) || p.imports.some((m) => m.split(".")[0] === lib.id),
  );
}
