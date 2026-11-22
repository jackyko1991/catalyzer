/**
 * Concept ▸ learning from scratch: four short reference pages, each opening with one sentence, then illustrated
 * sections, with jargon explained where it first appears.
 */
import type { L } from "@learnkit/web";

export interface ConceptSection {
  id: string;
  title: L;
  paragraphs: L[];
  /** pictures under the text: drawings under public/, or 3D views of a molecule / crambin */
  figures?: ({ src: string; caption: L } | { viewer: "caffeine" | "crambin" | "crambin-plddt"; caption: L })[];
  /** a two-column table: [term, meaning] */
  table?: { head: [L, L]; rows: [L, L][] };
  callout?: { kind: "tip" | "note" | "warn"; title: L; text: L };
  /** problem names this section prepares for */
  problems?: string[];
}

export interface ConceptPage {
  id: "molecule" | "data" | "proteins" | "ai";
  title: L;
  oneSentence: L;
  sections: ConceptSection[];
  sources: { label: string; url: string }[];
}


export const CONCEPTS: ConceptPage[] = [
  {
    id: "molecule",
    title: ["What a molecule is", "分子是什麼"],
    oneSentence: [
      "A molecule is a few atoms held together because they share electrons, and its shape in space decides what it can do.",
      "分子是幾個原子，因為共用電子而結合在一起；它在空間中的形狀，決定了它能做什麼。",
    ],
    sections: [
      {
        id: "atoms",
        title: ["Atoms: a nucleus and its electrons", "原子：原子核與它的電子"],
        paragraphs: [
          [
            "An **atom** is a tiny positive nucleus with negative electrons around it. The number of protons in the nucleus decides the **element**: 1 is hydrogen (H), 6 carbon (C), 7 nitrogen (N), 8 oxygen (O). The periodic table lists them in that order, and elements in the same column behave alike.",
            "**原子**是一個很小、帶正電的原子核，周圍有帶負電的電子。原子核中的質子數決定了它是哪種**元素**：1 是氫（H）、6 是碳（C）、7 是氮（N）、8 是氧（O）。週期表就依這個順序排列，同一行的元素性質相近。",
          ],
          [
            "Only the outermost electrons, the **valence electrons**, take part in chemistry. Carbon has 4, nitrogen 5, oxygen 6. Atoms tend to share electrons until each has a full outer shell of 8 (2 for hydrogen): the **octet rule**.",
            "只有最外層的電子，也就是**價電子**，參與化學反應。碳有 4 個、氮有 5 個、氧有 6 個。原子傾向於共用電子，直到每個原子的外層都滿 8 個（氫是 2 個）：這就是**八隅律**。",
          ],
        ],
        figures: [{ src: "concepts/atom.svg", caption: ["Carbon: 6 protons in the nucleus, 2 inner electrons and 4 valence electrons, so it usually makes 4 bonds.", "碳：原子核中有 6 個質子，內層 2 個電子、價電子 4 個，所以通常形成 4 個鍵。"] }],
      },
      {
        id: "bonds",
        title: ["Bonds: shared pairs of electrons", "鍵：共用的電子對"],
        paragraphs: [
          [
            "A **covalent bond** is a pair of electrons shared by two atoms (Lewis, 1916). Two shared pairs make a **double bond**, three a **triple bond**. Counting them gives each atom its usual number of bonds: hydrogen 1, oxygen 2, nitrogen 3, carbon 4.",
            "**共價鍵**是兩個原子共用的一對電子（路易斯，1916）。共用兩對是**雙鍵**，三對是**參鍵**。數一數就得到每種原子通常的鍵數：氫 1、氧 2、氮 3、碳 4。",
          ],
          [
            "When an atom has more or fewer bonds than usual, it carries a **formal charge**: nitrogen with four bonds, as in ammonium $\\mathrm{NH_4^+}$, is $+1$. Bonds are short: about 1.54 Å for C–C, 1.34 Å for C=C (1 ångström, Å, is $10^{-10}$ m).",
            "當原子的鍵數比平常多或少，它就帶有**形式電荷**：像銨離子 $\\mathrm{NH_4^+}$ 中有四個鍵的氮，形式電荷是 $+1$。鍵很短：C–C 約 1.54 Å，C=C 約 1.34 Å（1 埃，Å，是 $10^{-10}$ 公尺）。",
          ],
        ],
        figures: [{ src: "concepts/bonds.svg", caption: ["One, two or three shared pairs: single, double and triple bonds, each shorter than the last.", "共用一對、兩對或三對電子：單鍵、雙鍵與參鍵，一個比一個短。"] }, { src: "problems/molecules/formal_charge.svg", caption: ["Formal charge is bookkeeping of electrons: ammonium's nitrogen is +1.", "形式電荷是電子的記帳：銨離子中的氮是 +1。"] }],
        problems: ["formal_charge", "atoms_bonds"],
      },
      {
        id: "shape",
        title: ["Shape: molecules are three-dimensional", "形狀：分子是立體的"],
        paragraphs: [
          [
            "Electron pairs push each other apart, so the bonds around an atom spread out in space: four bonds point to the corners of a tetrahedron (109.5° apart, as in methane), three lie flat (120°). A drawing on paper hides this; turn the caffeine below to see it.",
            "電子對彼此排斥，所以一個原子周圍的鍵會在空間中張開：四個鍵指向四面體的四個頂點（夾角 109.5°，如甲烷），三個鍵則平躺在一個平面上（120°）。紙上的圖會把這些藏起來；轉動下面的咖啡因看看。",
          ],
          [
            "Shape is why a drug fits its protein like a key in a lock, and why two molecules with the same atoms (**isomers**) can act completely differently.",
            "形狀就是藥物能像鑰匙配鎖一樣嵌進蛋白質的原因，也是為什麼兩個原子相同的分子（**異構物**）作用可能完全不同。",
          ],
        ],
        figures: [{ src: "concepts/shapes.svg", caption: ["Two, three or four bonds around an atom spread to 180°, 120° or 109.5°.", "原子周圍的兩個、三個或四個鍵，分別張開成 180°、120° 或 109.5°。"] }, { viewer: "caffeine", caption: ["Caffeine in 3D: flat rings (each ring atom has three bonds) with methyl groups sticking out.", "3D 的咖啡因：平面的環（每個環原子有三個鍵），甲基向外伸出。"] }],
      },
      {
        id: "rings",
        title: ["Rings and aromaticity", "環與芳香性"],
        paragraphs: [
          [
            "Atoms can close into **rings**. In benzene the six bonds are all the same length, between single and double: its six π electrons (electrons above and below the ring's plane) are shared all the way round. Such rings, with $4n+2$ π electrons (Hückel's rule), are **aromatic** and unusually stable.",
            "原子可以首尾相接形成**環**。苯的六個鍵長度都一樣，介於單鍵與雙鍵之間：它的六個 π 電子（位於環平面上下方的電子）在整個環上共用。這種擁有 $4n+2$ 個 π 電子的環（休克耳規則）是**芳香**環，特別穩定。",
          ],
        ],
        figures: [{ src: "problems/molecules/rings.svg", caption: ["Naphthalene has two aromatic rings; cyclohexane has one ring that is not aromatic.", "萘有兩個芳香環；環己烷有一個環，但不是芳香環。"] }],
        problems: ["rings"],
      },
    ],
    sources: [
      { label: "OpenStax Chemistry 2e, ch. 7: Chemical Bonding and Molecular Geometry", url: "https://openstax.org/books/chemistry-2e/pages/7-introduction" },
      { label: "G. N. Lewis, The Atom and the Molecule (1916)", url: "https://doi.org/10.1021/ja02261a002" },
    ],
  },
  {
    id: "data",
    title: ["Molecules as data", "把分子變成資料"],
    oneSentence: [
      "A computer can hold a molecule in three ways: as a line of text, as a graph of atoms and bonds, or as a list of atoms with positions in space.",
      "電腦可以用三種方式保存一個分子：一行文字、一張由原子與鍵組成的圖，或一串帶有空間位置的原子。",
    ],
    sections: [
      {
        id: "text",
        title: ["Text: SMILES", "文字：SMILES"],
        paragraphs: [
          [
            "**SMILES** writes a molecule's atoms in order, with bonds between neighbours: `CCO` is ethanol, `=` is a double bond, parentheses are branches, digits open and close rings, lower case is aromatic. Hydrogens are left out and worked out from each atom's usual number of bonds.",
            "**SMILES** 依序寫出分子的原子，相鄰原子之間有鍵：`CCO` 是乙醇，`=` 是雙鍵，括號是分支，數字表示環的開與合，小寫表示芳香。氫原子省略不寫，依每個原子通常的鍵數推算出來。",
          ],
          [
            "One molecule can be written many ways, so libraries compute a **canonical** SMILES, the same string however you started: that is how millions of molecules are searched and compared.",
            "一個分子有很多種寫法，所以函式庫會算出**標準化**的 SMILES：不論從哪種寫法出發，都得到同一個字串。數以百萬計的分子就是這樣被搜尋與比較的。",
          ],
        ],
        figures: [{ src: "history/smiles.svg", caption: ["CCO is ethanol; c1ccccc1 is benzene.", "CCO 是乙醇；c1ccccc1 是苯。"] }],
        problems: ["read_smiles"],
      },
      {
        id: "graph",
        title: ["Graph: atoms are points, bonds are lines", "圖：原子是點，鍵是線"],
        paragraphs: [
          [
            "Mathematically a molecule is a **graph**: points (atoms) joined by lines (bonds), each labelled. An atom's **degree** is how many lines touch it. The graph can be stored as an **adjacency matrix** $A$, with $A_{ij} = 1$ when atoms $i$ and $j$ are bonded; graph neural networks work on exactly this matrix.",
            "從數學上看，分子是一張**圖**：由線（鍵）連起來的點（原子），每個都帶有標記。原子的**度**是碰到它的線的數目。這張圖可以存成**鄰接矩陣** $A$：原子 $i$ 與 $j$ 相連時 $A_{ij} = 1$；圖神經網路處理的正是這個矩陣。",
          ],
          [
            "A **fingerprint** summarises the graph as a set of numbers, one per small neighbourhood of atoms, so two molecules can be compared by how many they share (**Tanimoto similarity**).",
            "**分子指紋**把圖濃縮成一組數字，每種小範圍的原子鄰近環境對應一個，於是兩個分子可以用共有的數字多寡來比較（**Tanimoto 相似度**）。",
          ],
        ],
        figures: [{ src: "concepts/adjacency.svg", caption: ["The graph of acetaldehyde and its adjacency matrix: a 1 wherever two atoms are bonded.", "乙醛的圖與它的鄰接矩陣：兩個原子相連的地方就是 1。"] }],
        problems: ["atoms_bonds", "similarity"],
      },
      {
        id: "coordinates",
        title: ["Coordinates: atoms in space", "座標：空間中的原子"],
        paragraphs: [
          [
            "The third way lists every atom with its position $(x, y, z)$ in ångströms. Small molecules use the mol (SDF) format; proteins use **PDB** files, one line per atom, or the newer **mmCIF**. Positions come from experiments (X-ray crystallography, cryo-electron microscopy, NMR), from physics, or now from AI models.",
            "第三種方式列出每個原子與它的位置 $(x, y, z)$，單位是埃。小分子用 mol（SDF）格式；蛋白質用 **PDB** 檔（每個原子一行），或較新的 **mmCIF**。位置來自實驗（X 光晶體學、冷凍電子顯微鏡、核磁共振）、物理計算，或現在的 AI 模型。",
          ],
        ],
        figures: [{ src: "history/pdb.svg", caption: ["A PDB file: one ATOM line per atom, with x, y, z.", "PDB 檔：每個原子一行 ATOM，附 x、y、z。"] }],
        table: {
          head: [["Form", "形式"], ["Good for", "適合做什麼"]],
          rows: [
            [["SMILES (text)", "SMILES（文字）"], ["storing, searching, sharing millions of molecules", "儲存、搜尋、分享數百萬個分子"]],
            [["graph", "圖"], ["counting, rings, fingerprints, graph neural networks", "計數、找環、分子指紋、圖神經網路"]],
            [["3D coordinates", "3D 座標"], ["shape, distances, docking, comparing a prediction with an experiment", "形狀、距離、對接、比較預測與實驗"]],
          ],
        },
        problems: ["pdb_neighbours"],
      },
    ],
    sources: [
      { label: "D. Weininger, SMILES (1988)", url: "https://doi.org/10.1021/ci00057a005" },
      { label: "RDKit: Getting Started in Python", url: "https://www.rdkit.org/docs/GettingStartedInPython.html" },
      { label: "PDB-101: Introduction to PDB data", url: "https://pdb101.rcsb.org/learn/guide-to-understanding-pdb-data/introduction" },
    ],
  },
  {
    id: "proteins",
    title: ["Proteins: sequence to structure to function", "蛋白質：從序列到結構到功能"],
    oneSentence: [
      "A protein is a chain of amino acids whose order is written in a gene; the chain folds into one shape, and the shape does the job.",
      "蛋白質是一條胺基酸鏈，順序寫在基因裡；這條鏈摺成一種形狀，而形狀決定它做什麼工作。",
    ],
    sections: [
      {
        id: "sequence",
        title: ["Sequence: from DNA to amino acids", "序列：從 DNA 到胺基酸"],
        paragraphs: [
          [
            "DNA is a string of four letters (A, C, G, T). A gene is read three letters at a time; each triplet, a **codon**, names one of 20 **amino acids**, and three of the 64 codons mean stop. The protein is the resulting chain, written as a string of one-letter codes such as `MALWMRLLPLL…` (the start of human insulin).",
            "DNA 是由四個字母（A、C、G、T）組成的字串。基因每次讀三個字母；每個三聯體叫做**密碼子**，代表 20 種**胺基酸**之一，而 64 個密碼子中有 3 個表示終止。得到的鏈就是蛋白質，寫成一串單字母代碼，例如 `MALWMRLLPLL…`（人類胰島素的開頭）。",
          ],
        ],
        figures: [{ src: "problems/biomolecules/translate.svg", caption: ["ATG GCC TAA: methionine, alanine, stop.", "ATG GCC TAA：甲硫胺酸、丙胺酸、終止。"] }],
        problems: ["translate", "sequence_identity"],
      },
      {
        id: "structure",
        title: ["Structure: the chain folds", "結構：鏈會摺疊"],
        paragraphs: [
          [
            "The chain does not stay a string. Parts of it coil into **α-helices** and line up into **β-sheets** (secondary structure), and these pack into one compact 3D shape (tertiary structure). Anfinsen showed in 1961 that the sequence alone holds the information for that shape.",
            "這條鏈不會一直保持成一條線。其中一些部分盤成 **α 螺旋**、排成 **β 摺板**（二級結構），再緊密堆疊成一個 3D 形狀（三級結構）。安芬森在 1961 年證明：序列本身就帶有這個形狀的全部資訊。",
          ],
          [
            "Experiments find the shape: X-ray crystallography, cryo-electron microscopy and NMR. Every result goes into the Protein Data Bank, free for everyone; the ribbon below is crambin (PDB 1CRN).",
            "形狀靠實驗找出：X 光晶體學、冷凍電子顯微鏡與核磁共振。每個結果都存進蛋白質資料庫，免費提供給所有人；下面的緞帶是 crambin（PDB 1CRN）。",
          ],
        ],
        figures: [{ src: "concepts/protein-levels.svg", caption: ["Sequence, then helices and sheets, then one compact fold, and the fold makes a pocket that does the job.", "先是序列，再是螺旋與摺板，接著是緊密的摺疊，而摺疊形成執行工作的口袋。"] }, { viewer: "crambin", caption: ["Crambin: 46 amino acids folded into two helices and a small sheet, held by three disulphide bridges.", "Crambin：46 個胺基酸摺成兩個螺旋與一個小摺板，由三個雙硫鍵固定。"] }],
        problems: ["pdb_neighbours"],
      },
      {
        id: "function",
        title: ["Function: the shape does the job", "功能：形狀決定工作"],
        paragraphs: [
          [
            "Enzymes speed up reactions in a **pocket** where the right atoms meet; antibodies grip a target by their shape; haemoglobin changes shape when it carries oxygen. To understand or change a function you look at which residues are close in space, even when they are far apart in the sequence.",
            "酵素在一個**口袋**中讓正確的原子相遇，加速反應；抗體靠形狀抓住目標；血紅蛋白攜帶氧氣時會改變形狀。要了解或改變功能，就要看哪些殘基在空間中彼此靠近，即使它們在序列上相距很遠。",
          ],
        ],
        callout: { kind: "tip", title: ["Residue", "殘基"], text: ["One amino acid inside a chain is called a **residue**: what remains of it after joining the chain.", "鏈中的一個胺基酸稱為**殘基**：它加入鏈之後剩下的部分。"] },
        figures: [{ src: "problems/biomolecules/pdb_neighbours.svg", caption: ["The residues within 4 Å of Cys16, including its disulphide partner Cys26.", "距 Cys16 4 Å 以內的殘基，包括它的雙硫鍵夥伴 Cys26。"] }],
      },
    ],
    sources: [
      { label: "OpenStax Biology 2e, ch. 3.4: Proteins", url: "https://openstax.org/books/biology-2e/pages/3-4-proteins" },
      { label: "PDB-101: Guide to understanding PDB data", url: "https://pdb101.rcsb.org/learn/guide-to-understanding-pdb-data/introduction" },
    ],
  },
  {
    id: "ai",
    title: ["How AI designs molecules", "AI 如何設計分子"],
    oneSentence: [
      "AI models learn from known structures to predict new ones and to propose new molecules, and every answer they give is a hypothesis to be checked.",
      "AI 模型從已知結構中學習，用來預測新的結構、提出新的分子；而它們給出的每個答案，都是需要檢查的假說。",
    ],
    sections: [
      {
        id: "predict",
        title: ["Predict: from sequence to structure", "預測：從序列到結構"],
        paragraphs: [
          [
            "**AlphaFold 2** reads a sequence together with related sequences from other species (a **multiple sequence alignment**): positions that mutate together are probably in contact. A network refines a table of residue pairs and then places the atoms. Language models such as ESMFold learn similar signals from one sequence alone.",
            "**AlphaFold 2** 讀入一條序列，加上其他物種中的相關序列（**多序列比對**）：會一起突變的位置，很可能彼此接觸。網路反覆修正一張殘基對的表，再擺放原子。ESMFold 這類語言模型，則只從一條序列學到類似的訊號。",
          ],
        ],
        figures: [{ src: "history/alphafold2.svg", caption: ["Sequence → residue pairs → 3D structure with a confidence per residue.", "序列 → 殘基對 → 附每個殘基信心分數的 3D 結構。"] }],
      },
      {
        id: "generate",
        title: ["Generate: design something new", "生成：設計新東西"],
        paragraphs: [
          [
            "Generative models run prediction backwards. **RFdiffusion** starts from random noise and refines it into a new backbone; **ProteinMPNN** writes a sequence for it. For small molecules, models propose new SMILES strings or graphs with the properties asked for.",
            "生成模型把預測反過來做。**RFdiffusion** 從隨機雜訊出發，逐步修正成新的骨架；**ProteinMPNN** 為它寫出序列。對小分子，模型會提出具有指定性質的新 SMILES 字串或圖。",
          ],
        ],
        figures: [{ src: "history/rfdiffusion.svg", caption: ["Generate a backbone, write a sequence, refold to check.", "生成骨架、寫出序列、重新摺疊來檢查。"] }],
      },
      {
        id: "check",
        title: ["Check: four questions to ask every result", "檢查：每個結果都要問的四個問題"],
        paragraphs: [
          [
            "A model always gives an answer, even when it should not. Before trusting one, a professional asks four questions, from cheapest to most convincing.",
            "模型總會給出答案，即使它不該給。在相信之前，專業人士會問四個問題，從最便宜的到最有說服力的。",
          ],
        ],
        figures: [{ src: "concepts/check-ladder.svg", caption: ["Four questions, from the cheapest check to the most convincing one.", "四個問題，從最便宜的檢查到最有說服力的一個。"] }, { viewer: "crambin-plddt", caption: ["Crambin as AlphaFold predicted it, coloured by pLDDT: almost all dark blue (very high).", "AlphaFold 預測的 crambin，依 pLDDT 上色：幾乎全是深藍（非常高）。"] }],
        table: {
          head: [["Question", "問題"], ["How to check", "怎麼檢查"]],
          rows: [
            [["1. Is the model sure?", "1. 模型有把握嗎？"], ["**pLDDT** (0–100, per residue) for the local shape; **PAE** (predicted aligned error, in Å) for how parts sit relative to each other.", "看局部形狀的 **pLDDT**（0–100，每個殘基一個）；看各部分相對位置的 **PAE**（預測對齊誤差，單位 Å）。"]],
            [["2. Does it obey physics?", "2. 它符合物理嗎？"], ["No atoms overlapping, sensible bond lengths and angles; relax it with molecular dynamics (OpenMM) and see whether it holds.", "原子沒有重疊、鍵長與鍵角合理；用分子動力學（OpenMM）鬆弛，看它是否維持住。"]],
            [["3. Does it agree with what is known?", "3. 它和已知的一致嗎？"], ["Compare with an experimental structure (**RMSD** after superposition), or with related proteins.", "和實驗結構比較（疊合後的 **RMSD**），或和相關的蛋白質比較。"]],
            [["4. Does it work?", "4. 它真的有效嗎？"], ["Only an experiment decides: make the protein or molecule and measure it.", "只有實驗能決定：把蛋白質或分子做出來，實際量測。"]],
          ],
        },
        problems: ["alphafold_plddt", "rmsd"],
      },
    ],
    sources: [
      { label: "Jumper et al., AlphaFold (Nature 2021)", url: "https://doi.org/10.1038/s41586-021-03819-2" },
      { label: "AlphaFold DB: FAQ on pLDDT and PAE", url: "https://alphafold.ebi.ac.uk/faq" },
      { label: "Watson et al., RFdiffusion (Nature 2023)", url: "https://doi.org/10.1038/s41586-023-06415-8" },
    ],
  },
];
