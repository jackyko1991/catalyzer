/**
 * Concept ▸ learning from scratch: four short reference pages, each opening with one sentence, then illustrated
 * sections, with jargon explained where it first appears.
 */
import type { L } from "@learnkit/web";

/**
 * Where each page sits on the path (see the "path" page): the Concept tabs run in this order, so a reader who
 * follows them straight through walks the four stages from school chemistry to research.
 */
export const STAGES: Record<string, { n: number; title: L }> = {
  molecule: { n: 1, title: ["Read and compute", "讀懂與計算"] },
  data: { n: 1, title: ["Read and compute", "讀懂與計算"] },
  pdb: { n: 2, title: ["Structures", "結構"] },
  proteins: { n: 2, title: ["Structures", "結構"] },
  energy: { n: 3, title: ["Energy and quantum", "能量與量子"] },
  quantum: { n: 3, title: ["Energy and quantum", "能量與量子"] },
  ml: { n: 4, title: ["Machine learning", "機器學習"] },
  ai: { n: 4, title: ["Machine learning", "機器學習"] },
};
export const STAGE_COUNT = 4;

export interface ConceptSection {
  id: string;
  title: L;
  paragraphs: L[];
  /** pictures under the text: drawings under public/, or 3D views of a molecule / crambin */
  figures?: (
    | { src: string; caption: L }
    | { viewer: "caffeine" | "crambin" | "crambin-plddt"; caption: L }
  )[];
  /** a table, two columns or more: the head, then one row per entry */
  table?: { head: L[]; rows: L[][] };
  callout?: { kind: "tip" | "note" | "warn"; title: L; text: L };
  /** problem names this section prepares for */
  problems?: string[];
  /** the one sentence to carry away; gathered into the page's recap, so it must stand on its own */
  takeaway: L;
  /** shown at the bottom of the section's card */
  sources: { label: string; url: string }[];
}

export interface ConceptPage {
  id:
    | "about"
    | "path"
    | "molecule"
    | "data"
    | "pdb"
    | "proteins"
    | "energy"
    | "quantum"
    | "ml"
    | "ai";
  title: L;
  oneSentence: L;
  sections: ConceptSection[];
  /** closes the page: the section takeaways are gathered automatically, then these mistakes and where to go next */
  recap?: { mistakes: { title: L; text: L }[]; next: L };
  /** a small folded note under the sections (details for those who want them) */
  note?: { title: L; text: L };
}

export const CONCEPTS: ConceptPage[] = [
  {
    id: "about",
    title: ["What Catalyzer does", "Catalyzer 能做什麼"],
    oneSentence: [
      "A toolbox for reading, searching and computing real molecules with Python, from your browser.",
      "在瀏覽器裡用 Python 讀懂、搜尋並計算真實分子的工具箱。",
    ],
    sections: [
      {
        id: "practise",
        title: ["Practise first (Problems)", "先照著練（題庫）"],
        paragraphs: [
          [
            "Not sure how to handle molecules in code? Start with the small, ready-made problems: from reading a molecule written as a line of text, to measuring how far an AlphaFold prediction is from the real experimental structure.",
            "不知道怎麼用程式處理分子？這裡有現成的小題目：從讀懂寫成一行文字的分子，到量出 AlphaFold 預測的結構和真實實驗結構差多少。",
          ],
          [
            "Open one, change the code, press **Run** and see the result in 2D and 3D. Built-in tests tell you whether your change is still right.",
            "打開就能改程式碼，按下**執行**看 2D 與 3D 的結果，還有內建的測試幫你檢查對錯。",
          ],
        ],
        figures: [
          {
            src: "problems/molecules/read_smiles.svg",
            caption: [
              "The first problem: a molecule written as text, and the same molecule drawn.",
              "第一道題：寫成文字的分子，和同一個分子畫出來的樣子。",
            ],
          },
        ],
        problems: ["read_smiles", "rmsd"],
        sources: [
          {
            label: "RDKit, the chemistry library behind the problems",
            url: "https://www.rdkit.org/docs/",
          },
        ],
        takeaway: ["Problems are where you learn: the tests are written first and say what counts as correct, so you always know whether you are right.", "題目是你學習的地方：測試先寫好，說清楚什麼才算正確，所以你隨時知道自己對不對。"],
      },
      {
        id: "data",
        title: ["Get real data (Library)", "抓真實資料（資料庫）"],
        paragraphs: [
          [
            "Want to look at real drugs or proteins? Search PubChem, the Protein Data Bank or the AlphaFold database right here, and turn any 3D structure in the page; nothing to install.",
            "想看真實世界裡的藥物或蛋白質？直接在這裡搜尋 PubChem、蛋白質資料庫（PDB）或 AlphaFold 資料庫，在網頁上就能轉動 3D 結構，不用安裝任何軟體。",
          ],
          [
            "Found one you like? Send it to your Workspace with one click.",
            "看中哪一個，一鍵送進工作區。",
          ],
        ],
        figures: [
          {
            viewer: "crambin-plddt",
            caption: [
              "A protein from the AlphaFold database, in 3D.",
              "AlphaFold 資料庫中的一個蛋白質，以 3D 呈現。",
            ],
          },
        ],
        sources: [
          { label: "PubChem", url: "https://pubchem.ncbi.nlm.nih.gov/" },
          { label: "RCSB Protein Data Bank", url: "https://www.rcsb.org/" },
          {
            label: "AlphaFold Protein Structure Database",
            url: "https://alphafold.ebi.ac.uk/",
          },
        ],
        takeaway: ["The Library is where the molecules come from: real compounds, structures and predictions, searched live and taken into your own code.", "資料庫是分子的來源：真實的化合物、結構與預測，可即時搜尋，並帶進你自己的程式碼。"],
      },
      {
        id: "compute",
        title: ["Compute your own (Workspace)", "算你自己的（工作區）"],
        paragraphs: [
          [
            "Drop in your own list of molecules (as text or as files) and run a ready-made Python script over all of them at once: their basic chemical properties, and how similar they are to each other. Change the script to compute anything else.",
            "把你自己的分子清單（文字或檔案）丟進來，直接用內建的 Python 腳本一次算完全部：基本的化學性質，以及它們彼此有多相似。也能自己改寫腳本，擴充分析。",
          ],
        ],
        figures: [
          {
            src: "concepts/adjacency.svg",
            caption: [
              "Under the hood: a molecule as a picture, and the same molecule as numbers.",
              "背後的原理：分子是一張圖，也是一組數字。",
            ],
          },
        ],
        sources: [
          {
            label: "RDKit: the properties it can compute",
            url: "https://www.rdkit.org/docs/GettingStartedInPython.html#list-of-available-descriptors",
          },
        ],
        takeaway: ["The Workspace is where you compute your own: the same tools, your molecules, no problem to solve.", "工作區是你計算自己東西的地方：同樣的工具、你自己的分子，沒有題目要解。"],
      },
    ],
    recap: {
      mistakes: [
        { title: ["“It runs in the browser, so my data is safe.”", "「東西在瀏覽器裡跑，所以我的資料是安全的。」"], text: ["The page is only the screen. The computing happens wherever the runner is: on your own computer if you started it there, or on a server if you point the site at one. Where your molecules go depends on which runner you connect to, not on this site.", "頁面只是畫面。真正的計算發生在執行器所在的地方：你在自己電腦上啟動它，就在你的電腦；你把網站指向某台伺服器，就在那台伺服器。你的分子會去哪裡，取決於你連到哪個執行器，而不是取決於這個網站。"] },
      ],
      next: ["Next: [the path from school chemistry to research](#/concept/path), or go straight to the [Problems](#/problems/read_smiles).", "接下來：[從中學化學到研究的那條路](#/concept/path)，或直接前往[題庫](#/problems/read_smiles)。"],
    },
    note: {
      title: [
        "Want to run the code on your own computer? The local runner and privacy",
        "想在自己電腦上執行？本機執行器與隱私說明",
      ],
      text: [
        "Reading needs nothing: problems show results computed when the site was built. To run and change code, start the **runner** once with `pixi run runner` (install [pixi](https://pixi.sh) first); with this local runner your molecules and code stay on your computer. Problem code is checked before it runs (it may import only the libraries the problem allows); your own Workspace scripts run only for a page you have paired with the runner, using the code it prints.",
        "只是閱讀不需要任何準備：題目會顯示建置網站時算好的結果。想執行與修改程式碼，只要用 `pixi run runner` 啟動一次**執行器**（先安裝 [pixi](https://pixi.sh)）；使用本機執行器時，你的分子與程式碼都留在你的電腦上。題目的程式碼在執行前會先被檢查（只能匯入題目允許的函式庫）；工作區中你自己的程式，只替用執行器印出的配對碼配對過的頁面執行。",
      ],
    },
  },
  {
    id: "path",
    title: [
      "From school chemistry to research: a path",
      "從中學化學到研究：一條路",
    ],
    oneSentence: [
      "You already know what an atom and a bond are; from there to designing molecules with AI is four stages, and every one of them is a page here with problems to run.",
      "你已經知道原子和鍵是什麼；從那裡到用 AI 設計分子，中間有四個階段，每個階段在這裡都有一個頁面和可以執行的題目。",
    ],
    sections: [
      {
        id: "where",
        title: ["Where you are starting", "你從哪裡開始"],
        paragraphs: [
          [
            "School chemistry gives you atoms, bonds, formulas and reactions on paper. Computational chemistry keeps all of it and adds one move: **write the molecule down in a way a computer can hold**, then compute what you used to look up. Nothing you learned is thrown away; the periodic table, valence and Lewis structures all come back in the first stage, as code.",
            "中學化學給你紙上的原子、鍵、分子式與反應。計算化學保留這一切，只多做一件事：**把分子寫成電腦能保存的形式**，再把你以前用查表得到的東西算出來。你學過的都不會浪費；週期表、價數與路易斯結構，都會在第一階段以程式碼的形式回來。",
          ],
          [
            "You do not need to be able to program before you start. The first problems hand you working code and ask you to read it and change one line; by the fourth stage you are writing the script yourself in the Workspace.",
            "開始之前不需要會寫程式。最初的題目會直接給你能跑的程式碼，請你讀懂它、改一行；到了第四階段，你會在工作區裡自己寫整段程式。",
          ],
        ],
        figures: [
          {
            src: "concepts/atom.svg",
            caption: [
              "Where you start: atoms, electrons and the bonds they make. Everything after builds on this.",
              "你的起點：原子、電子以及它們形成的鍵。之後的一切都建立在這上面。",
            ],
          },
        ],
        sources: [
          {
            label: "OpenStax Chemistry 2e (free textbook)",
            url: "https://openstax.org/books/chemistry-2e/pages/1-introduction",
          },
          {
            label: "RDKit: Getting started in Python",
            url: "https://www.rdkit.org/docs/GettingStartedInPython.html",
          },
        ],
        takeaway: ["School chemistry is the whole starting point: computational chemistry only adds writing the molecule down so a computer can hold it.", "中學化學就是全部的起點：計算化學只多做一件事——把分子寫成電腦能保存的形式。"],
      },
      {
        id: "stages",
        title: ["The four stages", "四個階段"],
        paragraphs: [
          [
            "Each stage answers one question, needs only the stage before it, and ends with problems. Follow them in order if you are starting out; jump straight to stage 3 or 4 if you are already a chemist who wants the computing.",
            "每個階段回答一個問題，只需要前一個階段作為基礎，並以題目作結。如果你剛起步，就照順序走；如果你已經是化學人、只想補上計算的部分，直接跳到第三或第四階段。",
          ],
        ],
        table: {
          head: [
            ["Stage", "階段"],
            ["The question, and where to read it", "問題，以及在哪裡讀"],
            ["Problems to run", "可以執行的題目"],
          ],
          rows: [
            [
              ["**1. Read and compute**", "**1. 讀懂與計算**"],
              [
                "What *is* a molecule, to a computer? [What a molecule is](#/concept/molecule), [Molecules as data](#/concept/data).",
                "對電腦來說，分子究竟**是**什麼？[分子是什麼](#/concept/molecule)、[把分子變成資料](#/concept/data)。",
              ],
              [
                "[Read a SMILES string](#/problems/read_smiles), [Molecular weight](#/problems/molecular_weight), [Rings and aromaticity](#/problems/rings)",
                "[讀懂一個 SMILES 字串](#/problems/read_smiles)、[分子量](#/problems/molecular_weight)、[環與芳香性](#/problems/rings)",
              ],
            ],
            [
              ["**2. Structures**", "**2. 結構**"],
              [
                "Where do the coordinates come from, and what is in a structure file? [Reading a structure file](#/concept/pdb), [Proteins](#/concept/proteins).",
                "座標從哪裡來？結構檔裡有什麼？[讀懂結構檔](#/concept/pdb)、[蛋白質](#/concept/proteins)。",
              ],
              [
                "[A residue's neighbours](#/problems/pdb_neighbours), [From DNA to protein](#/problems/translate), [GFP](#/problems/gfp)",
                "[殘基的鄰居](#/problems/pdb_neighbours)、[從 DNA 到蛋白質](#/problems/translate)、[GFP](#/problems/gfp)",
              ],
            ],
            [
              ["**3. Energy and quantum chemistry**", "**3. 能量與量子化學**"],
              [
                "Why does a molecule take *that* shape, and where does its colour come from? [Energy, forces and shape](#/concept/energy), [Quantum chemistry](#/concept/quantum).",
                "分子為什麼是**那個**形狀？顏色從哪裡來？[能量、作用力與形狀](#/concept/energy)、[量子化學](#/concept/quantum)。",
              ],
              [
                "[Designing a dye](#/problems/fluorophore), [Atoms and bonds as a graph](#/problems/atoms_bonds), [Formal charge](#/problems/formal_charge)",
                "[設計染料](#/problems/fluorophore)、[把原子與鍵看成一張圖](#/problems/atoms_bonds)、[形式電荷](#/problems/formal_charge)",
              ],
            ],
            [
              ["**4. Machine learning and design**", "**4. 機器學習與設計**"],
              [
                "What can be learned from data, and how do you keep yourself honest? [Machine learning on molecules](#/concept/ml), [How AI designs molecules](#/concept/ai).",
                "從資料中能學到什麼？又該如何不自欺？[分子上的機器學習](#/concept/ml)、[AI 如何設計分子](#/concept/ai)。",
              ],
              [
                "[pLDDT](#/problems/alphafold_plddt), [RMSD against experiment](#/problems/rmsd), [Designing a receptor](#/problems/receptor_kinetics)",
                "[pLDDT](#/problems/alphafold_plddt)、[與實驗比較 RMSD](#/problems/rmsd)、[設計受體](#/problems/receptor_kinetics)",
              ],
            ],
          ],
        },
        figures: [
          {
            src: "concepts/path.svg",
            caption: [
              "The four stages: each one is a page, and each page ends in problems you run.",
              "四個階段：每個階段是一個頁面，每個頁面都以你能執行的題目作結。",
            ],
          },
        ],

        sources: [
          {
            label: "The Protein Data Bank's own teaching pages (PDB-101)",
            url: "https://pdb101.rcsb.org/",
          },
        ],
        takeaway: ["Four stages, each needing only the one before it: read and compute, structures, energy and quantum, machine learning.", "四個階段，每個只需要前一個作為基礎：讀懂與計算、結構、能量與量子、機器學習。"],
      },
      {
        id: "habit",
        title: ["The habit that carries you through", "貫穿全程的習慣"],
        paragraphs: [
          [
            "One thing is the same at every stage: **a number is worth only as much as its check**. A mass you cannot compare with a measurement, a structure you cannot compare with an experiment, a model score from a test set that leaked — all of them look like results and are not. Every problem here carries tests for that reason, and the last stage is about nothing else.",
            "每個階段都一樣的一件事是：**一個數字的價值，取決於它的檢查**。無法與量測比較的質量、無法與實驗比較的結構、來自已經洩漏的測試集的模型分數——它們看起來都像結果，其實不是。這裡每道題都帶著測試，正是為了這個；而最後一個階段談的也只有這件事。",
          ],
        ],
        figures: [
          {
            src: "concepts/check-ladder.svg",
            caption: [
              "The same four questions, from the cheapest check to the one that settles it.",
              "同樣的四個問題，從最便宜的檢查，到能一槌定音的那一個。",
            ],
          },
        ],
        sources: [
          {
            label:
              "CASP: the blind test that keeps structure prediction honest",
            url: "https://predictioncenter.org/",
          },
        ],
        takeaway: ["At every stage a number is worth only as much as its check, which is why every problem here carries tests.", "在每個階段，一個數字的價值都取決於它的檢查——這就是這裡每道題都帶著測試的原因。"],
      },
    ],
    recap: {
      mistakes: [
        { title: ["“I should finish all the reading first.”", "「我應該先把所有內容讀完。」"], text: ["The stages are made to be entered and left. Read one page, run its problems, and come back when the next one is needed. Nothing later depends on your having memorised anything earlier.", "這些階段本來就可以隨時進入、隨時離開。讀一頁、跑它的題目，需要下一頁時再回來。後面的內容不會要求你先背下前面的任何東西。"] },
      ],
      next: ["Start at stage one: [what a molecule is](#/concept/molecule), then [molecules as data](#/concept/data).", "從第一階段開始：[分子是什麼](#/concept/molecule)，接著是[把分子變成資料](#/concept/data)。"],
    },
  },
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
        figures: [
          {
            src: "concepts/atom.svg",
            caption: [
              "Carbon: 6 protons in the nucleus, 2 inner electrons and 4 valence electrons, so it usually makes 4 bonds.",
              "碳：原子核中有 6 個質子，內層 2 個電子、價電子 4 個，所以通常形成 4 個鍵。",
            ],
          },
        ],
        sources: [
          {
            label: "OpenStax Chemistry 2e, ch. 2: Atoms, Molecules, and Ions",
            url: "https://openstax.org/books/chemistry-2e/pages/2-introduction",
          },
        ],
        takeaway: ["An atom's outer electrons decide its chemistry: carbon has 4, nitrogen 5, oxygen 6, and they share until each has 8.", "原子的外層電子決定它的化學性質：碳 4 個、氮 5 個、氧 6 個，它們互相共用，直到各自湊滿 8 個。"],
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
        figures: [
          {
            src: "concepts/bonds.svg",
            caption: [
              "One, two or three shared pairs: single, double and triple bonds, each shorter than the last.",
              "共用一對、兩對或三對電子：單鍵、雙鍵與參鍵，一個比一個短。",
            ],
          },
          {
            src: "problems/molecules/formal_charge.svg",
            caption: [
              "Formal charge is bookkeeping of electrons: ammonium's nitrogen is +1.",
              "形式電荷是電子的記帳：銨離子中的氮是 +1。",
            ],
          },
        ],
        problems: ["formal_charge", "atoms_bonds"],
        sources: [
          {
            label:
              "OpenStax Chemistry 2e, ch. 7: Chemical Bonding and Molecular Geometry",
            url: "https://openstax.org/books/chemistry-2e/pages/7-introduction",
          },
          {
            label: "G. N. Lewis, The Atom and the Molecule (1916)",
            url: "https://doi.org/10.1021/ja02261a002",
          },
        ],
        takeaway: ["A bond is a shared pair of electrons; more shared pairs make a shorter, stronger bond.", "鍵就是共用的一對電子；共用的對數越多，鍵越短也越強。"],
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
        figures: [
          {
            src: "concepts/shapes.svg",
            caption: [
              "Two, three or four bonds around an atom spread to 180°, 120° or 109.5°.",
              "原子周圍的兩個、三個或四個鍵，分別張開成 180°、120° 或 109.5°。",
            ],
          },
          {
            viewer: "caffeine",
            caption: [
              "Caffeine in 3D: flat rings (each ring atom has three bonds) with methyl groups sticking out.",
              "3D 的咖啡因：平面的環（每個環原子有三個鍵），甲基向外伸出。",
            ],
          },
        ],
        sources: [
          {
            label:
              "OpenStax Chemistry 2e, 7.6: Molecular Structure and Polarity",
            url: "https://openstax.org/books/chemistry-2e/pages/7-6-molecular-structure-and-polarity",
          },
        ],
        takeaway: ["Electron pairs push apart, so the shape follows from the bonds, and the shape is what decides what a molecule can bind.", "電子對會互相推開，所以形狀由鍵決定；而形狀又決定這個分子能結合什麼。"],
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
        figures: [
          {
            src: "problems/molecules/rings.svg",
            caption: [
              "Naphthalene has two aromatic rings; cyclohexane has one ring that is not aromatic.",
              "萘有兩個芳香環；環己烷有一個環，但不是芳香環。",
            ],
          },
        ],
        problems: ["rings"],
        sources: [
          {
            label: "Aromaticity (Wikipedia)",
            url: "https://en.wikipedia.org/wiki/Aromaticity",
          },
        ],
        takeaway: ["A ring whose electrons are shared all the way round is aromatic: flat, unusually stable, and everywhere in drugs.", "電子在整個環上共用的環是芳香環：平坦、異常穩定，而且在藥物中無所不在。"],
      },
    ],
    recap: {
      mistakes: [
        { title: ["“A structural formula shows what the molecule looks like.”", "「結構式畫出來就是分子的樣子。」"], text: ["A drawing on paper is flat and a molecule is not. Two molecules with the same formula and the same bonds can still be mirror images that behave differently in the body.", "紙上的圖是平的，分子不是。兩個分子式相同、鍵也相同的分子，仍然可能互為鏡像，而在人體內表現完全不同。"] },
      ],
      next: ["Next: [how a computer holds all of this](#/concept/data), then practise on [Read a SMILES string](#/problems/read_smiles).", "接下來：[電腦如何保存這一切](#/concept/data)，然後用[讀懂一個 SMILES 字串](#/problems/read_smiles)練習。"],
    },
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
        figures: [
          {
            src: "history/smiles.svg",
            caption: [
              "CCO is ethanol; c1ccccc1 is benzene.",
              "CCO 是乙醇；c1ccccc1 是苯。",
            ],
          },
        ],
        problems: ["read_smiles"],
        sources: [
          {
            label: "D. Weininger, SMILES (1988)",
            url: "https://doi.org/10.1021/ci00057a005",
          },
        ],
        takeaway: ["SMILES is a molecule written as one line of text, which is why a database can hold millions of them and search them fast.", "SMILES 是把分子寫成一行文字，這就是資料庫能存放數百萬個分子並快速搜尋的原因。"],
      },
      {
        id: "graph",
        title: [
          "Graph: atoms are points, bonds are lines",
          "圖：原子是點，鍵是線",
        ],
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
        figures: [
          {
            src: "concepts/adjacency.svg",
            caption: [
              "The graph of acetaldehyde and its adjacency matrix: a 1 wherever two atoms are bonded.",
              "乙醛的圖與它的鄰接矩陣：兩個原子相連的地方就是 1。",
            ],
          },
        ],
        problems: ["atoms_bonds", "similarity"],
        sources: [
          {
            label: "RDKit: Getting Started in Python",
            url: "https://www.rdkit.org/docs/GettingStartedInPython.html",
          },
        ],
        takeaway: ["Inside a program a molecule is a graph: atoms as nodes, bonds as edges, and most properties are questions about that graph.", "在程式內部，分子是一張圖：原子是節點、鍵是邊；大多數性質，都是在問這張圖的問題。"],
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
        figures: [
          {
            src: "history/pdb.svg",
            caption: [
              "A PDB file: one ATOM line per atom, with x, y, z.",
              "PDB 檔：每個原子一行 ATOM，附 x、y、z。",
            ],
          },
        ],
        table: {
          head: [
            ["Form", "形式"],
            ["Good for", "適合做什麼"],
          ],
          rows: [
            [
              ["SMILES (text)", "SMILES（文字）"],
              [
                "storing, searching, sharing millions of molecules",
                "儲存、搜尋、分享數百萬個分子",
              ],
            ],
            [
              ["graph", "圖"],
              [
                "counting, rings, fingerprints, graph neural networks",
                "計數、找環、分子指紋、圖神經網路",
              ],
            ],
            [
              ["3D coordinates", "3D 座標"],
              [
                "shape, distances, docking, comparing a prediction with an experiment",
                "形狀、距離、對接、比較預測與實驗",
              ],
            ],
          ],
        },
        problems: ["pdb_neighbours"],
        sources: [
          {
            label: "PDB-101: Introduction to PDB data",
            url: "https://pdb101.rcsb.org/learn/guide-to-understanding-pdb-data/introduction",
          },
        ],
        takeaway: ["Coordinates are the third form: three numbers per atom, needed for anything about shape, distance or fit.", "座標是第三種形式：每個原子三個數字；任何關於形狀、距離或契合的問題都需要它。"],
      },
    ],
    recap: {
      mistakes: [
        { title: ["“One molecule, one SMILES string.”", "「一個分子只有一個 SMILES。」"], text: ["The same molecule can be written many ways, which is why programs compute a canonical form before comparing. Two different strings are not two different molecules.", "同一個分子可以有很多種寫法，所以程式在比較之前會先算出標準形式。兩個不同的字串，並不代表兩個不同的分子。"] },
      ],
      next: ["Next: coordinates in earnest, in [reading a structure file](#/concept/pdb); practise on [Atoms and bonds as a graph](#/problems/atoms_bonds).", "接下來：在[讀懂結構檔](#/concept/pdb)中正式處理座標；並用[把原子與鍵看成一張圖](#/problems/atoms_bonds)練習。"],
    },
  },
  {
    id: "pdb",
    title: ["Reading a structure file", "讀懂結構檔"],
    oneSentence: [
      "A structure file is a list of atoms with their positions, written in fixed columns; once you can read those columns you can ask a protein almost anything.",
      "結構檔就是一份原子清單，附上它們的位置，寫在固定的欄位裡；只要會讀這些欄位，你幾乎可以問蛋白質任何問題。",
    ],
    sections: [
      {
        id: "atom",
        title: ["The ATOM line, column by column", "ATOM 行，一欄一欄讀"],
        paragraphs: [
          [
            "The PDB format was designed for punched cards, so every field sits at a fixed column, not after a comma. That is why `line.split()` is the wrong way to read it and `line[30:38]` is the right one: a long atom name or a missing chain letter would shift the fields otherwise.",
            "PDB 格式是為打孔卡設計的，所以每個欄位都在固定的欄，而不是用逗號分隔。這就是為什麼 `line.split()` 是錯的讀法，而 `line[30:38]` 才是對的：否則一個很長的原子名稱、或缺少鏈的字母，就會讓欄位錯位。",
          ],
          [
            "After the three coordinates come two more numbers that readers often skip and should not: **occupancy** (how much of the time that atom is really there, usually 1.00) and the **B-factor**, how much the atom wobbles. A high B-factor means the position is uncertain, and in an AlphaFold model that same column holds the confidence (pLDDT) instead.",
            "三個座標之後還有兩個數字，常被略過但不該略過：**佔有率**（這個原子真正出現的比例，通常是 1.00），以及 **B 因子**，表示原子晃動得多厲害。B 因子高代表位置不確定；而在 AlphaFold 模型中，同一欄放的是信心分數（pLDDT）。",
          ],
        ],
        figures: [
          {
            src: "history/pdb.svg",
            caption: [
              "One line per atom: name, residue, chain, number, then x, y, z in ångströms.",
              "每個原子一行：名稱、殘基、鏈、編號，接著是以埃為單位的 x、y、z。",
            ],
          },
        ],
        table: {
          head: [
            ["Columns (Python slice)", "欄位（Python 切片）"],
            ["What it holds", "內容"],
          ],
          rows: [
            [
              ["`line[:6]`", "`line[:6]`"],
              [
                "`ATOM` for the protein itself, `HETATM` for everything else: ligands, metals, water",
                "`ATOM` 是蛋白質本身，`HETATM` 是其他一切：配體、金屬、水",
              ],
            ],
            [
              ["`line[12:16]`, `line[17:20]`", "`line[12:16]`、`line[17:20]`"],
              [
                "the atom's name (`CA` is the alpha carbon) and its residue (`CYS`)",
                "原子名稱（`CA` 是 α 碳）與所屬殘基（`CYS`）",
              ],
            ],
            [
              ["`line[16]`", "`line[16]`"],
              [
                "the alternate location: when an atom was seen in two places, both are listed, usually `A` and `B`. Take one, or you count atoms twice",
                "替代位置：某個原子被看到在兩個位置時，兩個都會列出，通常是 `A` 與 `B`。只取一個，否則原子會被算兩次",
              ],
            ],
            [
              ["`line[21]`, `line[22:26]`", "`line[21]`、`line[22:26]`"],
              [
                "the chain letter and the residue number — numbering often starts other than at 1, and may skip",
                "鏈的字母與殘基編號——編號常常不是從 1 開始，而且可能跳號",
              ],
            ],
            [
              [
                "`line[30:38]`, `[38:46]`, `[46:54]`",
                "`line[30:38]`、`[38:46]`、`[46:54]`",
              ],
              ["x, y, z in ångströms", "x、y、z，單位是埃"],
            ],
            [
              ["`line[54:60]`, `line[60:66]`", "`line[54:60]`、`line[60:66]`"],
              [
                "occupancy, and the B-factor (or pLDDT in a predicted model)",
                "佔有率，以及 B 因子（在預測模型中則是 pLDDT）",
              ],
            ],
          ],
        },
        problems: ["pdb_neighbours", "alphafold_plddt"],
        sources: [
          {
            label: "wwPDB: the PDB file format, section 3",
            url: "https://www.wwpdb.org/documentation/file-format-content/format33/sect3.html",
          },
          {
            label: "PDB-101: introduction to PDB data",
            url: "https://pdb101.rcsb.org/learn/guide-to-understanding-pdb-data/introduction",
          },
        ],
        takeaway: ["Read a PDB file by fixed columns, never by splitting on spaces, and the B-factor column holds pLDDT in a predicted model.", "讀 PDB 檔要用固定欄位，絕不能用空白切分；而在預測模型中，B 因子那一欄放的是 pLDDT。"],
      },
      {
        id: "rest",
        title: ["Everything above the atoms", "原子之外的其他內容"],
        paragraphs: [
          [
            "The lines before the coordinates are the ones that save you work. `SEQRES` gives the full sequence the crystallographers put in, including the residues that never showed up in the map; `HELIX` and `SHEET` give the secondary structure, already assigned; `MODRES` says which residues were modified (that is how you find GFP's chromophore); `LINK` records a chemical bond the geometry alone would not tell you, such as a drug covalently attached to a cysteine; `SSBOND` lists the disulphides.",
            "座標之前的那些行，能替你省下很多功夫。`SEQRES` 給出晶體學家放進去的完整序列，包括那些在電子密度圖中從未出現的殘基；`HELIX` 與 `SHEET` 給出已經指認好的二級結構；`MODRES` 說明哪些殘基被修飾過（這正是找出 GFP 發色團的方法）；`LINK` 記錄單憑幾何看不出來的化學鍵，例如共價接在半胱胺酸上的藥物；`SSBOND` 列出雙硫鍵。",
          ],
          [
            "The `REMARK` lines carry the experiment: how the structure was measured, at what resolution, and how well the model fits the data. An AlphaFold file carries its own REMARK saying it is a prediction, not a measurement.",
            "`REMARK` 行承載實驗本身：結構是怎麼測的、解析度多少、模型與數據吻合得多好。AlphaFold 的檔案也有自己的 REMARK，說明它是預測，而不是量測。",
          ],
        ],
        figures: [
          {
            viewer: "crambin",
            caption: [
              "Crambin, drawn from the file in this page's problems: the ribbon comes from HELIX and SHEET, the shape from the ATOM lines.",
              "Crambin，由本頁題目所用的檔案畫出：緞帶來自 HELIX 與 SHEET，形狀來自 ATOM 行。",
            ],
          },
        ],
        problems: ["gfp"],
        sources: [
          {
            label: "wwPDB format guide: all record types",
            url: "https://www.wwpdb.org/documentation/file-format",
          },
        ],
        takeaway: ["The lines above the atoms save you work: SEQRES, HELIX, MODRES and LINK say things the coordinates alone never would.", "原子之上的那些行能替你省事：SEQRES、HELIX、MODRES 與 LINK 說的，是單看座標永遠看不出來的事。"],
      },
      {
        id: "trust",
        title: ["Before you trust a structure", "在你相信一個結構之前"],
        paragraphs: [
          [
            "A structure is a model fitted to data, and some parts of it are better supported than others. Four cheap checks: the **resolution** (below about 2 Å you can see individual atoms; above 3 Å side chains are guesswork), the **R-free** (how well the model predicts data it was not fitted to — about 0.2 is healthy), **missing residues** (compare `SEQRES` with the residues that actually have coordinates: floppy loops often have none), and **what else is in the file** (a bound drug, or just the buffer and a cryoprotectant).",
            "結構是擬合到數據上的模型，其中某些部分比其他部分更有根據。四個便宜的檢查：**解析度**（約 2 Å 以下可以看到個別原子；3 Å 以上，側鏈多半是猜的）、**R-free**（模型對沒有拿來擬合的數據預測得多好——約 0.2 算健康）、**缺失的殘基**（把 `SEQRES` 和真正有座標的殘基比對：鬆軟的環常常完全沒有座標），以及**檔案裡還有什麼**（結合的藥物，或只是緩衝液與抗凍劑）。",
          ],
          [
            "The newer **mmCIF** format replaces the fixed columns with named fields, has no 99,999-atom limit and no single-letter chain limit, and is now the archive's primary format; very large structures are only available that way. Biopython reads it with `MMCIFParser` exactly as it reads PDB files.",
            "較新的 **mmCIF** 格式用具名欄位取代固定欄位，沒有 99,999 個原子的上限，也沒有鏈只能用單一字母的限制，現在已是檔案庫的主要格式；非常大的結構只有這種格式。Biopython 用 `MMCIFParser` 讀它，方式和讀 PDB 檔完全一樣。",
          ],
        ],
        figures: [
          {
            src: "problems/biomolecules/pdb_neighbours.svg",
            caption: [
              "What the columns buy you: everything within 4 Å of one residue.",
              "讀懂欄位能換來什麼：某個殘基 4 Å 以內的一切。",
            ],
          },
        ],
        problems: ["rmsd"],
        sources: [
          {
            label: "PDB-101: methods and validation",
            url: "https://pdb101.rcsb.org/learn/guide-to-understanding-pdb-data/methods-for-determining-structure",
          },
          { label: "wwPDB: the mmCIF format", url: "https://mmcif.wwpdb.org/" },
        ],
        takeaway: ["A structure is a model fitted to data: check the resolution, the R-free, what is missing, and what else is in the file.", "結構是擬合到數據上的模型：要檢查解析度、R-free、缺了什麼，以及檔案裡還有什麼。"],
      },
    ],
    recap: {
      mistakes: [
        { title: ["“Every atom of the protein is in the file.”", "「蛋白質的每個原子都在檔案裡。」"], text: ["Residues that moved too much to be seen have no coordinates at all, and hydrogens are usually absent. Compare SEQRES with what actually has coordinates before you count anything.", "動得太厲害而看不見的殘基根本沒有座標，氫原子通常也不存在。在你數任何東西之前，先把 SEQRES 和真正有座標的部分比對一遍。"] },
      ],
      next: ["Next: [proteins](#/concept/proteins) for what the fold does, or [energy and shape](#/concept/energy) for where coordinates come from when no one measured them.", "接下來：想知道摺疊有什麼用，看[蛋白質](#/concept/proteins)；想知道沒人量測時座標從哪來，看[能量與形狀](#/concept/energy)。"],
    },
  },
  {
    id: "proteins",
    title: [
      "Proteins: sequence to structure to function",
      "蛋白質：從序列到結構到功能",
    ],
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
        figures: [
          {
            src: "problems/biomolecules/translate.svg",
            caption: [
              "ATG GCC TAA: methionine, alanine, stop.",
              "ATG GCC TAA：甲硫胺酸、丙胺酸、終止。",
            ],
          },
        ],
        problems: ["translate", "sequence_identity"],
        sources: [
          {
            label: "Genetic code (Wikipedia)",
            url: "https://en.wikipedia.org/wiki/Genetic_code",
          },
        ],
        takeaway: ["A protein is a chain of twenty kinds of amino acid, and the order of that chain is written by a gene.", "蛋白質是由二十種胺基酸組成的鏈，而這條鏈的順序由基因寫成。"],
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
        figures: [
          {
            src: "concepts/protein-levels.svg",
            caption: [
              "Sequence, then helices and sheets, then one compact fold, and the fold makes a pocket that does the job.",
              "先是序列，再是螺旋與摺板，接著是緊密的摺疊，而摺疊形成執行工作的口袋。",
            ],
          },
          {
            viewer: "crambin",
            caption: [
              "Crambin: 46 amino acids folded into two helices and a small sheet, held by three disulphide bridges.",
              "Crambin：46 個胺基酸摺成兩個螺旋與一個小摺板，由三個雙硫鍵固定。",
            ],
          },
        ],
        problems: ["pdb_neighbours"],
        sources: [
          {
            label: "OpenStax Biology 2e, ch. 3.4: Proteins",
            url: "https://openstax.org/books/biology-2e/pages/3-4-proteins",
          },
          {
            label: "Anfinsen et al., PNAS 47, 1309 (1961)",
            url: "https://doi.org/10.1073/pnas.47.9.1309",
          },
        ],
        takeaway: ["The chain folds into helices and sheets and then into one shape, and the sequence alone is enough to decide it.", "這條鏈摺成螺旋與摺板，再摺成一個形狀；而光是序列本身就足以決定它。"],
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
        callout: {
          kind: "tip",
          title: ["Residue", "殘基"],
          text: [
            "One amino acid inside a chain is called a **residue**: what remains of it after joining the chain.",
            "鏈中的一個胺基酸稱為**殘基**：它加入鏈之後剩下的部分。",
          ],
        },
        figures: [
          {
            src: "problems/biomolecules/pdb_neighbours.svg",
            caption: [
              "The residues within 4 Å of Cys16, including its disulphide partner Cys26.",
              "距 Cys16 4 Å 以內的殘基，包括它的雙硫鍵夥伴 Cys26。",
            ],
          },
        ],
        sources: [
          {
            label: "OpenStax Biology 2e, ch. 3.4: Proteins",
            url: "https://openstax.org/books/biology-2e/pages/3-4-proteins",
          },
        ],
        takeaway: ["Function lives in a pocket: a few residues in the right places, which is why structure is worth computing at all.", "功能存在於口袋之中：幾個殘基落在對的位置——這正是結構值得計算的理由。"],
      },
    ],
    recap: {
      mistakes: [
        { title: ["“A predicted structure is a measured structure.”", "「預測出來的結構就等於量測到的結構。」"], text: ["A prediction is a model with a confidence attached, and low-confidence regions are often disordered rather than wrong. Read the pLDDT before using the coordinates.", "預測是附帶信心分數的模型；信心低的區域往往是本來就無序，而不是算錯了。在使用座標之前，先讀 pLDDT。"] },
      ],
      next: ["Next: [reading a structure file](#/concept/pdb) column by column, then [Is the model right?](#/problems/rmsd)", "接下來：逐欄[讀懂結構檔](#/concept/pdb)，然後是[模型對嗎？](#/problems/rmsd)"],
    },
  },
  {
    id: "energy",
    title: ["Energy, forces and shape", "能量、作用力與形狀"],
    oneSentence: [
      "A molecule takes the shape it does because every other shape costs more energy; computing that cost is what turns a drawing into a structure.",
      "分子之所以是現在這個形狀，是因為其他形狀都更耗能量；把這個代價算出來，就能把一張圖變成一個結構。",
    ],
    sections: [
      {
        id: "forcefield",
        title: [
          "What makes one shape cost more than another",
          "為什麼某個形狀比另一個更耗能量",
        ],
        paragraphs: [
          [
            "A **force field** is a formula for the energy of a shape, assembled from pieces a chemist would recognise: a bond stretched away from its natural length costs energy, so does an angle bent away from its natural value, twisting around a bond costs energy that rises and falls as it turns, atoms that come too close repel sharply, and distant atoms attract each other weakly or pull on each other's charges. Add them up and you have a number for any arrangement of the atoms.",
            "**力場**是一條計算某個形狀能量的公式，由化學家熟悉的幾個部分組成：鍵被拉離自然長度要花能量，鍵角被扳離自然角度也要，繞著鍵扭轉的能量會隨角度起伏，靠得太近的原子會強烈排斥，而遠處的原子之間則有微弱的吸引或電荷之間的作用力。把這些加起來，任何一種原子排列都有一個數字。",
          ],
          [
            "No electrons appear anywhere in that list, which is exactly why it is fast: millions of atoms are routine. It is also why a force field cannot tell you about anything the electrons do — a reaction, a colour, a bond breaking. That is the next page's job.",
            "這份清單裡完全沒有電子，這正是它快的原因：處理上百萬個原子是家常便飯。這也是為什麼力場無法告訴你任何與電子有關的事——反應、顏色、鍵的斷裂。那是下一頁的工作。",
          ],
        ],
        figures: [
          {
            src: "concepts/energy.svg",
            caption: [
              "The energy as one bond twists: deep valleys are the shapes the molecule actually takes.",
              "能量隨著某個鍵的扭轉而變化：深谷就是分子實際採取的形狀。",
            ],
          },
        ],
        sources: [
          {
            label: "RDKit: force fields (UFF and MMFF94)",
            url: "https://www.rdkit.org/docs/GettingStartedInPython.html#rdkit-molecular-force-fields",
          },
          {
            label: "OpenMM, a molecular dynamics engine",
            url: "https://openmm.org/",
          },
        ],
        takeaway: ["A force field is a formula for the energy of a shape, with no electrons in it: fast enough for millions of atoms, blind to anything the electrons decide.", "力場是一條計算形狀能量的公式，裡面沒有電子：快到能處理上百萬個原子，卻對電子決定的一切視而不見。"],
      },
      {
        id: "minimise",
        title: [
          "Walking downhill: how 3D coordinates are made",
          "往下走：3D 座標是怎麼來的",
        ],
        paragraphs: [
          [
            "A SMILES string has no coordinates at all. To get a 3D structure a program first *guesses* one — RDKit's ETKDG places the atoms using distance geometry plus rules learned from crystal structures — and then **minimises**: it computes the force on every atom (the slope of the energy) and moves them downhill until nothing pushes any more. That pair of steps is what produced every 3D molecule you have turned in this site's viewer.",
            "SMILES 字串完全沒有座標。要得到 3D 結構，程式會先**猜**一個——RDKit 的 ETKDG 用距離幾何，加上從晶體結構學到的規則來擺放原子——接著做**能量最小化**：算出每個原子受到的力（也就是能量的斜率），讓它們往下坡移動，直到沒有任何推力為止。本站檢視器中你轉動過的每個 3D 分子，都是這兩步做出來的。",
          ],
          [
            "Minimisation only ever finds the **nearest** valley, not the deepest one. A flexible molecule has many valleys — its **conformers** — and the honest way to work is to generate many starting guesses, minimise each, and keep the distinct ones. Which of them matters depends on temperature: at room temperature a shape costing about 6 kJ/mol more is roughly ten times rarer.",
            "能量最小化只會找到**最近**的谷底，而不是最深的那個。柔軟的分子有很多谷底——它的**構形**——所以誠實的做法是產生許多起始猜測、各自最小化，再保留彼此不同的那些。哪一個重要則取決於溫度：在室溫下，能量高出約 6 kJ/mol 的形狀，出現機率大約少十倍。",
          ],
        ],
        figures: [
          {
            viewer: "caffeine",
            caption: [
              "Caffeine's 3D shape, made exactly this way: guess, then minimise.",
              "咖啡因的 3D 形狀，就是這樣做出來的：先猜，再最小化。",
            ],
          },
        ],
        problems: ["read_smiles"],
        sources: [
          {
            label:
              "Riniker & Landrum, ETKDG, J. Chem. Inf. Model. 55, 2562 (2015)",
            url: "https://doi.org/10.1021/acs.jcim.5b00654",
          },
          {
            label: "RDKit: generating conformers",
            url: "https://www.rdkit.org/docs/GettingStartedInPython.html#working-with-3d-molecules",
          },
        ],
        takeaway: ["3D coordinates are made by guessing a shape and walking downhill, which finds the nearest valley and not the deepest one.", "3D 座標的做法是先猜一個形狀再往下坡走；這只會找到最近的谷底，而不是最深的那個。"],
      },
      {
        id: "dynamics",
        title: [
          "Letting it move: molecular dynamics",
          "讓它動起來：分子動力學",
        ],
        paragraphs: [
          [
            "Minimisation freezes a molecule at the bottom of one valley; real molecules are warm and never stop moving. **Molecular dynamics** takes the forces from the same force field and integrates Newton's equations, one tiny step at a time — a step must be about a femtosecond ($10^{-15}$ s), short enough to follow a hydrogen vibrating. Millions of steps make a few nanoseconds, which is enough to watch a side chain flip or water rearrange, and nowhere near enough to watch a protein fold.",
            "能量最小化把分子凍結在某個谷底；真實的分子是溫熱的，永遠停不下來。**分子動力學**用同一個力場給出的力，一步一步地積分牛頓方程式——每一步大約要是一飛秒（$10^{-15}$ 秒），短到足以追上氫原子的振動。數百萬步才累積出幾奈秒，這足以看到側鏈翻轉或水分子重排，但遠遠不足以看到蛋白質摺疊。",
          ],
          [
            "That gap between what you can simulate and what you want to know is the permanent problem of the field, and the reason machine learning arrived: a model trained on short simulations, or on experiments, can answer in milliseconds what would take a simulation a year.",
            "「能模擬的」與「想知道的」之間的這道落差，是這個領域長期的難題，也是機器學習登場的原因：一個用短模擬或實驗資料訓練出來的模型，能在毫秒內回答模擬要跑一年的問題。",
          ],
        ],
        figures: [
          {
            src: "concepts/shapes.svg",
            caption: [
              "Angles and distances a force field has to get right before anything moves.",
              "在任何東西開始運動之前，力場必須先算對的角度與距離。",
            ],
          },
        ],
        sources: [
          {
            label: "OpenMM user guide: running a simulation",
            url: "https://docs.openmm.org/latest/userguide/",
          },
          {
            label: "Lennard-Jones, Proc. R. Soc. A (the non-bonded term)",
            url: "https://doi.org/10.1098/rspa.1924.0082",
          },
        ],
        takeaway: ["Molecular dynamics follows the atoms in femtosecond steps, so you can watch a side chain move but never a protein fold.", "分子動力學以飛秒為步長追蹤原子，所以你看得到側鏈移動，卻永遠看不到蛋白質摺疊。"],
      },
    ],
    recap: {
      mistakes: [
        { title: ["“The minimised structure is the structure.”", "「能量最小化之後的結構就是那個結構。」"], text: ["Minimisation stops in the nearest valley, and a flexible molecule has many. Generate several conformers before claiming anything about shape.", "最小化只會停在最近的谷底，而柔軟的分子有很多谷底。在你對形狀下任何結論之前，先產生幾個構形。"] },
      ],
      next: ["Next: what a force field cannot see, in [quantum chemistry](#/concept/quantum).", "接下來：力場看不見的東西，在[量子化學](#/concept/quantum)。"],
    },
  },
  {
    id: "quantum",
    title: [
      "Quantum chemistry: where colour and reaction come from",
      "量子化學：顏色與反應從哪裡來",
    ],
    oneSentence: [
      "A force field knows nothing about electrons, so anything the electrons decide — colour, a bond breaking, a charge moving — needs a method that solves for them, and you choose the cheapest one that can answer your question.",
      "力場對電子一無所知，所以凡是由電子決定的事——顏色、鍵的斷裂、電荷的移動——都需要能把電子解出來的方法；而你要挑的，是能回答你問題的那個最便宜的方法。",
    ],
    sections: [
      {
        id: "why",
        title: [
          "Why electrons have to be solved for",
          "為什麼必須把電子解出來",
        ],
        paragraphs: [
          [
            "An electron is not a small ball with a position. What quantum mechanics gives you is a **wavefunction**, $\\psi$, whose square tells you where the electron is likely to be; the energy of a molecule is what you get from the Schrödinger equation $\\hat{H}\\psi = E\\psi$. Solved exactly it is only possible for the hydrogen atom, so every method below is a different honest approximation.",
            "電子不是一顆有位置的小球。量子力學給你的是**波函數** $\\psi$，它的平方告訴你電子可能出現在哪裡；分子的能量則來自薛丁格方程式 $\\hat{H}\\psi = E\\psi$。能精確求解的只有氫原子，所以下面每個方法，都是一種誠實的近似。",
          ],
          [
            "The hard part is that electrons repel one another, so each one's best place depends on where all the others are. **Hartree–Fock** cuts that knot by letting each electron feel only the average field of the rest; it gets most of the energy and misses the part that comes from electrons dodging each other, which is called **correlation**. Recovering that part, cheaply enough to be useful, is what the rest of the field does.",
            "困難之處在於電子彼此排斥，所以每個電子最好待的位置，取決於其他所有電子在哪裡。**Hartree–Fock** 的作法是讓每個電子只感受到其餘電子的平均場；這樣能算出大部分能量，卻漏掉電子彼此閃避所造成的那一部分，稱為**關聯**。如何用夠便宜的方式把這部分補回來，正是這個領域其餘工作的內容。",
          ],
        ],
        figures: [
          {
            src: "concepts/atom.svg",
            caption: [
              "The electrons a quantum method has to account for: the outer ones do the chemistry.",
              "量子方法必須處理的電子：外層的那些負責化學。",
            ],
          },
        ],
        sources: [
          {
            label:
              "Szabo & Ostlund, Modern Quantum Chemistry (the standard introduction)",
            url: "https://store.doverpublications.com/products/9780486691862",
          },
          {
            label: "Psi4, an open quantum chemistry program",
            url: "https://psicode.org/",
          },
        ],
        takeaway: ["Electrons repel one another, so every method is an approximation; Hartree-Fock averages that repulsion and misses correlation.", "電子彼此排斥，所以每個方法都是近似；Hartree-Fock 把這種排斥平均掉，因而漏掉了關聯。"],
      },
      {
        id: "dft",
        title: ["DFT: the method most papers use", "DFT：多數論文採用的方法"],
        paragraphs: [
          [
            "**Density functional theory** replaces the wavefunction of every electron with one object: the electron **density**, a number at each point in space. Hohenberg and Kohn proved that the density alone fixes the energy; Kohn and Sham turned that into equations you can actually solve. The catch is that the exact relation between density and energy is unknown, so you choose an approximation to it — a **functional**, with names like B3LYP or ωB97X-D — and different functionals give different answers.",
            "**密度泛函理論**用一個東西取代所有電子的波函數：電子**密度**，也就是空間中每一點的一個數字。Hohenberg 與 Kohn 證明了密度本身就決定能量；Kohn 與 Sham 再把它變成真的能求解的方程式。問題在於密度與能量之間的精確關係並不知道，所以你必須選一個近似——**泛函**，名字像 B3LYP 或 ωB97X-D——而不同的泛函會給出不同的答案。",
          ],
          [
            "That is why a DFT number is never quoted alone: a paper states the functional *and* the **basis set** (the set of functions the orbitals are built from, such as def2-TZVP). Two groups computing the same molecule with different choices can differ by more than the effect they are arguing about, which is why benchmarking against experiment, or against a more expensive method, is part of the work.",
            "這就是為什麼 DFT 的數字從不會單獨引用：論文會同時說明用了哪個泛函**和**哪組**基底函數**（用來組出軌域的函數集合，例如 def2-TZVP）。兩個研究團隊用不同選擇計算同一個分子，差距可能比他們正在爭論的效應還大——所以拿實驗、或拿更貴的方法來做基準比對，本身就是工作的一部分。",
          ],
          [
            "Colour needs one step more. The ground state alone cannot tell you what light a molecule absorbs; **TD-DFT** asks how the density responds to an oscillating field, and returns the excitation energies (the absorption wavelengths) with their **oscillator strengths** (how strongly each one absorbs). That is the real version of the dye problem on this site, where a particle in a box stands in for it.",
            "顏色還需要多一步。單靠基態無法告訴你分子吸收哪種光；**TD-DFT** 問的是密度對振盪電場如何反應，並回傳激發能（也就是吸收波長）與各自的**振子強度**（每個躍遷吸光的強弱）。本站染料題目用盒中粒子代替的，正是它的真實版本。",
          ],
        ],
        figures: [
          {
            src: "concepts/methods.svg",
            caption: [
              "The ladder of methods: what each one can answer, and how big a molecule it can still handle.",
              "方法的階梯：每個方法能回答什麼，以及還能處理多大的分子。",
            ],
          },
        ],
        problems: ["fluorophore", "rings"],
        sources: [
          {
            label: "Kohn & Sham, Phys. Rev. 140, A1133 (1965)",
            url: "https://doi.org/10.1103/PhysRev.140.A1133",
          },
          {
            label:
              "Runge & Gross, Phys. Rev. Lett. 52, 997 (1984) — time-dependent DFT",
            url: "https://doi.org/10.1103/PhysRevLett.52.997",
          },
        ],
        takeaway: ["DFT works from the electron density, so a DFT number means nothing without its functional and basis set; colour needs TD-DFT.", "DFT 從電子密度出發，所以沒有說明泛函與基底函數的 DFT 數字毫無意義；而顏色需要 TD-DFT。"],
      },
      {
        id: "choosing",
        title: [
          "Choosing a method is choosing what you can afford",
          "選方法，就是選你負擔得起什麼",
        ],
        paragraphs: [
          [
            "Cost rises steeply with the number of electrons: roughly as $N^3$–$N^4$ for DFT, and as $N^7$ for coupled cluster, the method people use as the reference answer. Doubling the molecule does not double the time. In practice that means a hierarchy: screen thousands of candidates with a force field or a learned model, keep tens for DFT, and take one or two to the expensive method or to the bench.",
            "成本隨電子數急遽上升：DFT 大約是 $N^3$–$N^4$，而被當作參考答案的耦合簇方法則是 $N^7$。分子大一倍，時間絕不只多一倍。實務上這代表一套層級：用力場或學習出來的模型篩選上千個候選，留下數十個做 DFT，再挑一兩個送進昂貴方法或實驗台。",
          ],
          [
            "One more thing a quantum calculation needs that a textbook rarely mentions: the molecule's **geometry**, and whether it is in a solvent. An energy is reported at a geometry, usually one the same method optimised; water or another solvent is added as a continuum model, and leaving it out can move a predicted absorption by tens of nanometres.",
            "量子計算還需要一件教科書很少提到的事：分子的**幾何結構**，以及它是否處在溶劑中。能量總是對應某個幾何結構，通常是同一個方法最佳化出來的；水或其他溶劑則以連續介質模型加入，而忽略它可能讓預測的吸收峰偏移數十奈米。",
          ],
        ],
        figures: [
          {
            src: "concepts/energy.svg",
            caption: [
              "The geometry an energy belongs to: the bottom of a valley, found before the expensive calculation starts.",
              "能量所屬的幾何結構：谷底，在昂貴的計算開始之前就要先找到。",
            ],
          },
        ],
        problems: ["formal_charge", "atoms_bonds"],
        sources: [
          {
            label: "Psi4 manual: methods and their scaling",
            url: "https://psicode.org/psi4manual/master/methods.html",
          },
          {
            label: "RDKit: molecules in and out of quantum programs",
            url: "https://www.rdkit.org/docs/GettingStartedInPython.html",
          },
        ],
        takeaway: ["Cost rises steeply with the number of electrons, so the work is a hierarchy: screen cheaply, keep a few, pay for those.", "成本隨電子數急遽上升，所以工作方式是一套層級：先便宜地篩選，留下少數幾個，再為它們付出代價。"],
      },
    ],
    recap: {
      mistakes: [
        { title: ["“DFT is the exact answer.”", "「DFT 算出來就是正確答案。」"], text: ["The exact relation between density and energy is unknown, so every DFT number carries the functional that approximated it. Quote the functional and the basis set, or the number cannot be reproduced.", "密度與能量之間的精確關係並不知道，所以每個 DFT 數字都帶著做近似的那個泛函。要寫出泛函與基底函數，否則這個數字無法被重現。"] },
      ],
      next: ["Next: what to do when even DFT is too slow, in [machine learning on molecules](#/concept/ml).", "接下來：當 DFT 也太慢時該怎麼辦，見[分子上的機器學習](#/concept/ml)。"],
    },
  },
  {
    id: "ml",
    title: ["Machine learning on molecules", "分子上的機器學習"],
    oneSentence: [
      "A model learns from the molecules you show it, so what matters is how you hand molecules to it, and whether your test is one it can pass by remembering rather than by learning.",
      "模型只從你給它看的分子學習，所以關鍵在於：你怎麼把分子交給它，以及你的測試，是不是它靠記憶而非靠學習就能通過的那種。",
    ],
    sections: [
      {
        id: "representation",
        title: ["How a molecule reaches a model", "分子如何進入模型"],
        paragraphs: [
          [
            "A model takes numbers, and there are three ways to give it a molecule. A **fingerprint** turns it into a fixed vector of bits, one per substructure present; it is fast, works with a few hundred examples, and is still the first thing to try. A **descriptor** list hands over computed properties — mass, logP, rings, charges — which is interpretable and weak at anything subtle. A **graph neural network** takes the atoms and bonds as they are and learns its own features by passing messages along the bonds; it wins when there is enough data, and overfits happily when there is not.",
            "模型吃的是數字，而把分子交給它有三種方式。**指紋**把分子變成固定長度的位元向量，每個位元代表一種子結構是否存在；它很快，幾百筆資料就能用，至今仍是第一個該試的方法。**描述符**清單交出的是算好的性質——質量、logP、環數、電荷——好解釋，但對細微的效應很無力。**圖神經網路**直接拿原子與鍵，沿著鍵傳遞訊息、自己學出特徵；資料夠多時它最強，資料不夠時它也會很樂意地過度擬合。",
          ],
          [
            "Newer work adds a fourth: a model **pre-trained** on millions of unlabelled molecules or protein sequences, then fine-tuned on your few hundred measurements. It is the same idea as a language model, and for proteins it is how structure prediction learned to work from sequence alone.",
            "較新的作法還有第四種：先用數百萬個沒有標註的分子或蛋白質序列做**預訓練**，再用你手上的幾百筆量測資料微調。這和語言模型是同一個想法；對蛋白質來說，這正是結構預測學會只靠序列就能運作的方式。",
          ],
        ],
        figures: [
          {
            src: "concepts/adjacency.svg",
            caption: [
              "What a graph network is given: the atoms, and which pairs are bonded.",
              "圖網路拿到的東西：原子，以及哪些原子對之間有鍵。",
            ],
          },
        ],
        problems: ["similarity", "atoms_bonds"],
        sources: [
          {
            label:
              "Yang et al., Chemprop, J. Chem. Inf. Model. 59, 3370 (2019)",
            url: "https://doi.org/10.1021/acs.jcim.9b00237",
          },
          {
            label: "RDKit: fingerprints and descriptors",
            url: "https://www.rdkit.org/docs/GettingStartedInPython.html#fingerprinting-and-molecular-similarity",
          },
        ],
        takeaway: ["Fingerprints work with hundreds of examples, graph networks need thousands, and both are only a way of handing the model a molecule.", "指紋在幾百筆資料下就能用，圖網路則需要上千筆；而兩者都只是把分子交給模型的方式。"],
      },
      {
        id: "splits",
        title: [
          "The test that lies, and the test that does not",
          "會騙人的測試，與不會騙人的測試",
        ],
        paragraphs: [
          [
            "Chemical datasets come in families: a paper publishes forty analogues of one scaffold, with the same core and different substituents. Split such a set at random and close relatives land on both sides, so the model can score well by recognising the scaffold it has already seen. The number looks excellent and means nothing for the molecule you actually want to make.",
            "化學資料集是成族出現的：一篇論文會發表同一個骨架的四十個類似物，核心相同、取代基不同。若把這樣的資料隨機切分，近親會同時落在兩邊，模型只要認出看過的骨架就能拿高分。數字很漂亮，對你真正想做的那個分子卻毫無意義。",
          ],
          [
            "A **scaffold split** (by Bemis–Murcko framework) puts whole families on one side only, so the test asks the question you care about: does this work on chemistry I have not seen? Scores drop, often a lot. That drop is information, not failure. For a time series — a project's own assay data — split by date instead, and for proteins split by sequence identity.",
            "**骨架切分**（依 Bemis–Murcko 骨架）會把整個家族只放到一邊，於是測試問的才是你在意的問題：這在我沒見過的化學上有用嗎？分數會下降，常常降很多。那個下降是資訊，不是失敗。對時間序列——例如某個專案自己的試驗資料——改以日期切分；對蛋白質，則以序列相同度切分。",
          ],
          [
            "Two more habits separate a usable model from a published number: report a **baseline** (a fingerprint and a random forest; if the deep model cannot beat it, say so), and report **uncertainty**, so the model can tell you when a molecule is outside what it has seen.",
            "還有兩個習慣，區分出堪用的模型與只是發表出來的數字：報告一個**基準線**（指紋加隨機森林；如果深度模型贏不過它，就要說出來），以及報告**不確定性**，讓模型能告訴你某個分子已經超出它見過的範圍。",
          ],
        ],
        figures: [
          {
            src: "concepts/splits.svg",
            caption: [
              "The same data, split two ways: only one of them tests what you want to know.",
              "同一份資料，兩種切分方式：只有其中一種，測的是你真正想知道的事。",
            ],
          },
        ],
        problems: ["similarity", "lipinski"],
        sources: [
          {
            label:
              "Bemis & Murcko, J. Med. Chem. 39, 2887 (1996) — molecular frameworks",
            url: "https://doi.org/10.1021/jm9602928",
          },
          {
            label: "Wu et al., MoleculeNet, Chem. Sci. 9, 513 (2018)",
            url: "https://doi.org/10.1039/C7SC02664A",
          },
        ],
        takeaway: ["A random split lets a model score well by recognising a scaffold it has seen; a scaffold split asks the question you actually care about.", "隨機切分會讓模型靠認出看過的骨架就拿高分；骨架切分問的，才是你真正在意的問題。"],
      },
      {
        id: "generate",
        title: [
          "Generating molecules, and checking them",
          "生成分子，以及檢查它們",
        ],
        paragraphs: [
          [
            "Models can also propose: a generative model samples new molecules aimed at a property, and for proteins **RFdiffusion** designs backbones that fold and bind, some of which have been made and shown to work. The failure mode is specific and common — a model optimised hard against a scoring function finds the places where the score is wrong rather than the places where the chemistry is good.",
            "模型也能提案：生成模型可以朝著某個性質採樣出新分子；對蛋白質而言，**RFdiffusion** 能設計出會摺疊、會結合的骨架，其中有些已經被做出來並證實有效。它的失敗模式很具體也很常見——當模型拚命朝著某個評分函數最佳化時，它找到的往往是評分出錯的地方，而不是化學真正好的地方。",
          ],
          [
            "So a generated molecule is a hypothesis, and the four questions on the first page are how you treat it: is the model sure (confidence), does it obey physics (no clashes, stable in a simulation), does it match what is known (compare with a measured structure), and does it work (make it and measure). Each answer costs more than the last, and only the last one settles anything.",
            "所以生成出來的分子是一個假設，而第一頁的那四個問題，就是對待它的方式：模型有把握嗎（信心分數）、它符合物理嗎（沒有原子互相穿插、在模擬中穩定）、它和已知的相符嗎（與量測結構比較）、它真的有用嗎（做出來並量測）。每個答案都比前一個更貴，而只有最後一個能一槌定音。",
          ],
        ],
        figures: [
          {
            src: "concepts/check-ladder.svg",
            caption: [
              "What to ask of anything a model proposes, cheapest first.",
              "對模型提出的任何東西該問的問題，從最便宜的開始。",
            ],
          },
        ],
        problems: ["alphafold_plddt", "rmsd"],
        sources: [
          {
            label: "Watson et al., RFdiffusion, Nature 620, 1089 (2023)",
            url: "https://doi.org/10.1038/s41586-023-06415-8",
          },
          {
            label: "CASP, the blind test of structure prediction",
            url: "https://predictioncenter.org/",
          },
        ],
        takeaway: ["A generated molecule is a hypothesis: optimised hard against a score, a model finds where the score is wrong.", "生成出來的分子是一個假設：當模型拚命朝著某個分數最佳化時，它找到的是分數出錯的地方。"],
      },
    ],
    recap: {
      mistakes: [
        { title: ["“The model scores 0.95, so it works.”", "「模型分數 0.95，所以它有用。」"], text: ["A score is a property of the split, not of the model. Ask how the test set was chosen before you believe any number, and compare against a fingerprint baseline.", "分數是切分方式的性質，不是模型的性質。在你相信任何數字之前，先問測試集是怎麼挑的，並且和指紋基準線比一比。"] },
      ],
      next: ["Next: [how AI designs molecules](#/concept/ai), and the four questions to ask of anything it proposes.", "接下來：[AI 如何設計分子](#/concept/ai)，以及該對它提出的任何東西問的四個問題。"],
    },
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
        figures: [
          {
            src: "history/alphafold2.svg",
            caption: [
              "Sequence → residue pairs → 3D structure with a confidence per residue.",
              "序列 → 殘基對 → 附每個殘基信心分數的 3D 結構。",
            ],
          },
        ],
        sources: [
          {
            label: "Jumper et al., AlphaFold (Nature 2021)",
            url: "https://doi.org/10.1038/s41586-021-03819-2",
          },
        ],
        takeaway: ["Prediction turned a decades-long experiment into an afternoon's computation, with a confidence score attached to every residue.", "預測把一個耗時數十年的實驗，變成一個下午的計算，而且每個殘基都附上信心分數。"],
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
        figures: [
          {
            src: "history/rfdiffusion.svg",
            caption: [
              "Generate a backbone, write a sequence, refold to check.",
              "生成骨架、寫出序列、重新摺疊來檢查。",
            ],
          },
        ],
        sources: [
          {
            label: "Watson et al., RFdiffusion (Nature 2023)",
            url: "https://doi.org/10.1038/s41586-023-06415-8",
          },
        ],
        takeaway: ["Design runs the prediction backwards: ask for a shape or a binder, and the model proposes sequences that should fold to it.", "設計是把預測反過來跑：你要一個形狀或一個結合者，模型就提出應該能摺成那樣的序列。"],
      },
      {
        id: "check",
        title: [
          "Check: four questions to ask every result",
          "檢查：每個結果都要問的四個問題",
        ],
        paragraphs: [
          [
            "A model always gives an answer, even when it should not. Before trusting one, a professional asks four questions, from cheapest to most convincing.",
            "模型總會給出答案，即使它不該給。在相信之前，專業人士會問四個問題，從最便宜的到最有說服力的。",
          ],
        ],
        figures: [
          {
            src: "concepts/check-ladder.svg",
            caption: [
              "Four questions, from the cheapest check to the most convincing one.",
              "四個問題，從最便宜的檢查到最有說服力的一個。",
            ],
          },
          {
            viewer: "crambin-plddt",
            caption: [
              "Crambin as AlphaFold predicted it, coloured by pLDDT: almost all dark blue (very high).",
              "AlphaFold 預測的 crambin，依 pLDDT 上色：幾乎全是深藍（非常高）。",
            ],
          },
        ],
        table: {
          head: [
            ["Question", "問題"],
            ["How to check", "怎麼檢查"],
          ],
          rows: [
            [
              ["1. Is the model sure?", "1. 模型有把握嗎？"],
              [
                "**pLDDT** (0–100, per residue) for the local shape; **PAE** (predicted aligned error, in Å) for how parts sit relative to each other.",
                "看局部形狀的 **pLDDT**（0–100，每個殘基一個）；看各部分相對位置的 **PAE**（預測對齊誤差，單位 Å）。",
              ],
            ],
            [
              ["2. Does it obey physics?", "2. 它符合物理嗎？"],
              [
                "No atoms overlapping, sensible bond lengths and angles; relax it with molecular dynamics (OpenMM) and see whether it holds.",
                "原子沒有重疊、鍵長與鍵角合理；用分子動力學（OpenMM）鬆弛，看它是否維持住。",
              ],
            ],
            [
              ["3. Does it agree with what is known?", "3. 它和已知的一致嗎？"],
              [
                "Compare with an experimental structure (**RMSD** after superposition), or with related proteins.",
                "和實驗結構比較（疊合後的 **RMSD**），或和相關的蛋白質比較。",
              ],
            ],
            [
              ["4. Does it work?", "4. 它真的有效嗎？"],
              [
                "Only an experiment decides: make the protein or molecule and measure it.",
                "只有實驗能決定：把蛋白質或分子做出來，實際量測。",
              ],
            ],
          ],
        },
        problems: ["alphafold_plddt", "rmsd"],
        sources: [
          {
            label: "AlphaFold DB: FAQ on pLDDT and PAE",
            url: "https://alphafold.ebi.ac.uk/faq",
          },
        ],
        takeaway: ["Four questions, cheapest first: is the model sure, does it obey physics, does it match what is known, and does it work.", "四個問題，從最便宜的開始：模型有把握嗎、符合物理嗎、和已知相符嗎、真的有用嗎。"],
      },
    ],
    recap: {
      mistakes: [
        { title: ["“The AI designed a drug.”", "「AI 設計出了一個藥。」"], text: ["A model proposes; experiments decide. Everything between the two — confidence, physics, agreement with what is known — narrows the list, and none of it replaces making the molecule.", "模型只是提案，決定的是實驗。兩者之間的一切——信心分數、物理、與已知的相符程度——都只是把清單縮短，沒有任何一項能取代真的把分子做出來。"] },
      ],
      next: ["Next: run the checks yourself on [pLDDT](#/problems/alphafold_plddt) and [RMSD](#/problems/rmsd).", "接下來：親手跑一次檢查——[pLDDT](#/problems/alphafold_plddt) 與 [RMSD](#/problems/rmsd)。"],
    },
  },
];
