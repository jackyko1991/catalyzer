/**
 * Concept ▸ History: how molecules became something we can compute, from Dalton's atoms (1808) to the 2024 Nobel
 * Prize for protein design and structure prediction. Every card cites its sources. Text is [English, Traditional
 * Chinese (Taiwan)].
 */
import type { Era, TimelineCard } from "@learnkit/web";

export const ERAS: Era[] = [
  {
    id: "atoms",
    title: ["Atoms and bonds", "原子與鍵"],
    intro: [
      "Matter is made of atoms, and atoms join by sharing electrons. That one sentence took chemistry 130 years.",
      "物質由原子組成，原子靠共用電子結合在一起。這一句話，化學花了 130 年才說清楚。",
    ],
    colour: "sky",
    label: ["Part I", "第一部"],
    short: ["Atoms & bonds", "原子與鍵"],
  },
  {
    id: "life",
    title: ["Molecules of life", "生命的分子"],
    intro: [
      "DNA and proteins turned out to be molecules too: long chains with an exact order, folded into exact shapes.",
      "DNA 與蛋白質原來也是分子：順序精確的長鏈，摺疊成精確的形狀。",
    ],
    colour: "rose",
    label: ["Part II", "第二部"],
    short: ["Molecules of life", "生命的分子"],
  },
  {
    id: "data",
    title: ["Molecules as data", "把分子變成資料"],
    intro: [
      "Once a molecule can be written as a string or a graph, a computer can store, search and compare millions of them.",
      "一旦分子能寫成一串文字或一張圖，電腦就能儲存、搜尋、比較數以百萬計的分子。",
    ],
    colour: "violet",
    label: ["Part III", "第三部"],
    short: ["Molecules as data", "分子即資料"],
  },
  {
    id: "ai",
    title: ["AI designs molecules", "AI 設計分子"],
    intro: [
      "Models trained on that data now predict protein structures and propose new molecules, and their answers still have to be checked.",
      "用這些資料訓練的模型，現在能預測蛋白質結構、提出新的分子；而它們的答案仍然需要檢查。",
    ],
    colour: "amber",
    label: ["Part IV", "第四部"],
    short: ["AI designs", "AI 設計"],
  },
];

export const HISTORY: TimelineCard[] = [
  // ── Part I: atoms and bonds ──────────────────────────────────────────────────────────────────────────────────
  {
    id: "dalton",
    era: "atoms",
    year: "1808",
    image: {
      src: "history/dalton.webp",
      alt: ["Portrait of John Dalton by Thomas Phillips, 1835", "湯瑪斯・菲利普斯所繪的道耳頓肖像，1835 年"],
      credit: "Thomas Phillips · Public domain · Wikimedia Commons",
      creditUrl: "https://commons.wikimedia.org/wiki/File:John_Dalton_by_Thomas_Phillips,_1835.jpg",
    },
    title: ["Dalton: every element has its own atom", "道耳頓：每種元素都有自己的原子"],
    body: [
      [
        "John Dalton, a Manchester teacher, proposed in *A New System of Chemical Philosophy* that each element is made of identical atoms with their own weight, and that compounds form when atoms join in small whole-number ratios.",
        "曼徹斯特的教師約翰・道耳頓在《化學哲學新體系》中提出：每種元素由完全相同、各有固定重量的原子組成；化合物則是原子以簡單整數比結合而成。",
      ],
      [
        "His table of relative atomic weights (hydrogen = 1) is the ancestor of the number you add up in the **molecular weight** problem.",
        "他的相對原子量表（以氫為 1）就是你在**分子量**題目中要加總的那些數字的始祖。",
      ],
    ],
    sources: [
      { label: "John Dalton (Wikipedia)", url: "https://en.wikipedia.org/wiki/John_Dalton" },
      { label: "John Dalton (Science History Institute)", url: "https://www.sciencehistory.org/education/scientific-biographies/john-dalton/" },
    ],
  },
  {
    id: "kekule",
    era: "atoms",
    year: "1865",
    image: {
      src: "history/kekule.webp",
      alt: ["August Kekulé, photographed around 1890", "約 1890 年的奧古斯特・凱庫勒"],
      credit: "Unknown photographer · Public domain · Wikimedia Commons",
      creditUrl: "https://commons.wikimedia.org/wiki/File:Friedrich_August_Kekul%C3%A9_von_Stradonitz_(1890er).jpg",
    },
    title: ["Kekulé: carbon chains and the benzene ring", "凱庫勒：碳鏈與苯環"],
    body: [
      [
        "In 1858 August Kekulé argued, as Archibald Couper did independently the same year, that carbon makes four bonds and that carbon atoms link into chains: one of the first ideas of a molecule as a **graph** of atoms and bonds. In 1865 he proposed that the six carbons of benzene close into a **ring** with alternating single and double bonds.",
        "1858 年，奧古斯特・凱庫勒主張碳原子形成四個鍵，而且碳原子會連成鏈（同一年，阿奇博爾德・庫珀也獨立提出相同想法）：這是把分子看成由原子與鍵組成的**圖**的最早想法之一。1865 年，他提出苯的六個碳原子首尾相接成一個**環**，單鍵與雙鍵交替。",
      ],
      [
        "Benzene-like rings, whose $4n+2$ π electrons are shared all the way round (Hückel's rule), are called **aromatic**. SMILES writes them in lower case, as in benzene `c1ccccc1`.",
        "像苯這樣、$4n+2$ 個 π 電子在整個環上共用的環（休克耳規則），稱為**芳香**環。SMILES 用小寫字母表示它們，例如苯寫成 `c1ccccc1`。",
      ],
    ],
    sources: [
      { label: "August Kekulé (Wikipedia)", url: "https://en.wikipedia.org/wiki/August_Kekul%C3%A9" },
      { label: "Benzene: history (Wikipedia)", url: "https://en.wikipedia.org/wiki/Benzene#History" },
      { label: "Archibald Scott Couper (Wikipedia)", url: "https://en.wikipedia.org/wiki/Archibald_Scott_Couper" },
    ],
  },
  {
    id: "mendeleev",
    era: "atoms",
    year: "1869",
    image: {
      src: "history/mendeleev.webp",
      alt: ["Dmitri Mendeleev in 1899", "1899 年的德米特里・門得列夫"],
      credit: "Elena Mrozovskaya · Public domain · Wikimedia Commons",
      creditUrl: "https://commons.wikimedia.org/wiki/File:Mendeleev_Photographische_Gesellschaft.jpg",
    },
    title: ["Mendeleev's periodic table", "門得列夫的週期表"],
    body: [
      [
        "Dmitri Mendeleev arranged the known elements by atomic weight and saw their properties repeat periodically. He left gaps and predicted the elements that would fill them; gallium (1875), scandium (1879) and germanium (1886) were found with the properties he expected.",
        "德米特里・門得列夫把已知元素依原子量排列，發現它們的性質呈週期性重複。他在表中留下空位，並預言將填入的元素；後來發現的鎵（1875）、鈧（1879）、鍺（1886）都符合他的預期。",
      ],
      [
        "Every cheminformatics library still carries a periodic table: RDKit's tells you each element's mass and usual number of bonds.",
        "每個化學資訊函式庫裡都仍有一張週期表：RDKit 的週期表告訴你每個元素的質量與通常形成的鍵數。",
      ],
    ],
    sources: [
      { label: "Dmitri Mendeleev (Wikipedia)", url: "https://en.wikipedia.org/wiki/Dmitri_Mendeleev" },
      { label: "History of the periodic table (Wikipedia)", url: "https://en.wikipedia.org/wiki/History_of_the_periodic_table" },
    ],
  },
  {
    id: "lewis",
    era: "atoms",
    year: "1916",
    image: {
      src: "history/lewis.webp",
      alt: ["Gilbert N. Lewis in 1941", "1941 年的吉爾伯特・路易斯"],
      credit: "Johan Hagemeyer · CC BY 4.0 · Wikimedia Commons",
      creditUrl: "https://commons.wikimedia.org/wiki/File:Gilbert_Newton_Lewis_photo_by_Johan_Hagemeyer.jpg",
    },
    title: ["Lewis: a bond is a shared pair of electrons", "路易斯：鍵是一對共用的電子"],
    body: [
      [
        "In *The Atom and the Molecule* Gilbert N. Lewis proposed that a chemical bond is a **pair of electrons shared** by two atoms, and drew molecules with dots for electrons, the **Lewis structures** taught in every first chemistry course.",
        "吉爾伯特・路易斯在〈原子與分子〉一文中提出：化學鍵是兩個原子**共用的一對電子**；他用點代表電子來畫分子，也就是每一門化學入門課都會教的**路易斯結構**。",
      ],
      [
        "Comparing the electrons an atom owns in such a drawing (its lone-pair electrons plus half of its bonding electrons) with its valence electrons gives its **formal charge**, which you compute in one of the first problems.",
        "在這樣的圖中數一數一個原子「擁有」幾個電子（孤對電子，加上鍵結電子的一半），再與它的價電子數相比，就得到它的**形式電荷**；你會在前幾道題目中計算它。",
      ],
    ],
    sources: [
      { label: "G. N. Lewis, The Atom and the Molecule, J. Am. Chem. Soc. 38, 762 (1916)", url: "https://doi.org/10.1021/ja02261a002" },
      { label: "Lewis structure (Wikipedia)", url: "https://en.wikipedia.org/wiki/Lewis_structure" },
    ],
  },
  {
    id: "quantum-bond",
    era: "atoms",
    year: "1927",
    image: {
      src: "history/schrodinger.webp",
      alt: ["Erwin Schrödinger in 1933", "1933 年的埃爾溫・薛丁格"],
      credit: "Nobel Foundation · Public domain · Wikimedia Commons",
      creditUrl: "https://commons.wikimedia.org/wiki/File:Erwin_Schr%C3%B6dinger_(1933).jpg",
    },
    title: ["Quantum mechanics explains the bond", "量子力學解釋了化學鍵"],
    body: [
      [
        "A year after Erwin Schrödinger wrote his wave equation (1926), Walter Heitler and Fritz London used it to calculate why two hydrogen atoms bind into $\\mathrm{H_2}$: the shared electron pair lowers the energy. Lewis's picture now had a calculation behind it.",
        "在埃爾溫・薛丁格寫下波動方程式（1926）的隔年，沃爾特・海特勒與弗里茨・倫敦用它算出為什麼兩個氫原子會結合成 $\\mathrm{H_2}$：共用的電子對讓能量降低。路易斯的圖像從此有了計算作為根據。",
      ],
      [
        "This is the start of **quantum chemistry**. Tensorizer's `hartree_fock_h2` and `huckel_mo_theory` problems rebuild two classic methods of quantum chemistry in PyTorch.",
        "這是**量子化學**的開端。Tensorizer 的 `hartree_fock_h2` 與 `huckel_mo_theory` 題目，用 PyTorch 重建了量子化學的兩個經典方法。",
      ],
    ],
    sources: [
      { label: "W. Heitler & F. London, Z. Phys. 44, 455 (1927)", url: "https://doi.org/10.1007/BF01397394" },
      { label: "Valence bond theory: history (Wikipedia)", url: "https://en.wikipedia.org/wiki/Valence_bond_theory#History" },
      { label: "Schrödinger equation (Wikipedia)", url: "https://en.wikipedia.org/wiki/Schr%C3%B6dinger_equation" },
    ],
  },
  {
    id: "pauling",
    era: "atoms",
    year: "1939",
    image: {
      src: "history/pauling.webp",
      alt: ["Portrait of Linus Pauling", "萊納斯・鮑林的肖像"],
      credit: "Nobel Foundation · Public domain · Wikimedia Commons",
      creditUrl: "https://commons.wikimedia.org/wiki/File:Linus_Pauling_1962.jpg",
    },
    title: ["Pauling: The Nature of the Chemical Bond", "鮑林：《化學鍵的本質》"],
    body: [
      [
        "Linus Pauling's book gathered quantum mechanics into rules a chemist can use: **electronegativity**, **hybrid orbitals**, **resonance**, and the lengths and angles of bonds. This work earned him the 1954 Nobel Prize in Chemistry.",
        "萊納斯・鮑林的這本書把量子力學整理成化學家用得上的規則：**電負度**、**混成軌域**、**共振**，以及鍵的長度與角度。這些研究讓他獲得 1954 年諾貝爾化學獎。",
      ],
      [
        "In 1951 he and Robert Corey used the same rules to predict the **α-helix** and **β-sheet**, the two shapes you see in every protein ribbon drawing.",
        "1951 年，他與羅伯特・科里用同樣的規則預測了 **α 螺旋** 與 **β 摺板**：你在每一張蛋白質緞帶圖中都會看到的兩種形狀。",
      ],
    ],
    sources: [
      { label: "The Nature of the Chemical Bond (Wikipedia)", url: "https://en.wikipedia.org/wiki/The_Nature_of_the_Chemical_Bond" },
      { label: "Linus Pauling (Nobel Prize)", url: "https://www.nobelprize.org/prizes/chemistry/1954/pauling/facts/" },
    ],
  },
  // ── Part II: molecules of life ───────────────────────────────────────────────────────────────────────────────
  {
    id: "miescher",
    era: "life",
    year: "1869",
    image: {
      src: "history/miescher.webp",
      alt: ["Portrait of Friedrich Miescher (1844–1895)", "弗里德里希・米歇爾（1844–1895）的肖像"],
      credit: "Wellcome Collection · CC BY 4.0 · Wikimedia Commons",
      creditUrl: "https://commons.wikimedia.org/wiki/File:Johann_Friedrich_Miescher._Photograph._Wellcome_V0026860.jpg",
    },
    title: ["Miescher finds nuclein", "米歇爾發現核素"],
    body: [
      [
        "Working in Tübingen, the Swiss physician Friedrich Miescher isolated a new substance from the nuclei of white blood cells. He called it **nuclein**; it was rich in phosphorus and unlike any protein. Its main component is what we now call **DNA**.",
        "瑞士醫師弗里德里希・米歇爾在杜賓根，從白血球的細胞核中分離出一種新物質。他稱之為**核素**：含有大量的磷，與任何蛋白質都不同。它的主要成分，就是今天所說的 **DNA**。",
      ],
    ],
    sources: [
      { label: "Friedrich Miescher (Wikipedia)", url: "https://en.wikipedia.org/wiki/Friedrich_Miescher" },
      { label: "R. Dahm, Discovering DNA, Hum. Genet. 122, 565 (2008)", url: "https://doi.org/10.1007/s00439-007-0433-0" },
    ],
  },
  {
    id: "dna",
    era: "life",
    year: "1953",
    image: {
      src: "history/dna.webp",
      alt: ["Rosalind Franklin at a microscope in 1955", "1955 年在顯微鏡前的羅莎琳・富蘭克林"],
      credit: "MRC Laboratory of Molecular Biology · CC BY-SA 4.0 · Wikimedia Commons",
      creditUrl: "https://commons.wikimedia.org/wiki/File:Rosalind_Franklin.jpg",
    },
    title: ["The double helix", "雙螺旋"],
    body: [
      [
        "On 25 April 1953 *Nature* printed three papers on DNA: James Watson and Francis Crick's model of a **double helix**, and the X-ray evidence from Maurice Wilkins's group and from Rosalind Franklin and Raymond Gosling, whose Photo 51 showed the helix.",
        "1953 年 4 月 25 日，《自然》期刊刊出三篇關於 DNA 的論文：詹姆斯・華生與法蘭西斯・克里克的**雙螺旋**模型，以及莫里斯・威爾金斯團隊、羅莎琳・富蘭克林與雷蒙・葛斯林的 X 光證據；後兩人拍攝的「照片 51 號」顯示出螺旋的樣子。",
      ],
      [
        "The two strands pair A with T and G with C, so each strand spells out the other. Reading DNA three letters at a time into amino acids is the **DNA → protein** problem.",
        "兩股之間 A 與 T 配對、G 與 C 配對，因此一股就決定了另一股。把 DNA 每三個字母讀成一個胺基酸，就是**從 DNA 到蛋白質**這道題目。",
      ],
    ],
    sources: [
      { label: "Watson & Crick, Molecular Structure of Nucleic Acids, Nature 171, 737 (1953)", url: "https://doi.org/10.1038/171737a0" },
      { label: "Franklin & Gosling, Molecular Configuration in Sodium Thymonucleate, Nature 171, 740 (1953)", url: "https://doi.org/10.1038/171740a0" },
    ],
  },
  {
    id: "sanger",
    era: "life",
    year: "1955",
    image: {
      src: "history/sanger.webp",
      alt: ["Frederick Sanger in 1958", "1958 年的弗雷德里克・桑格"],
      credit: "Nobel Foundation · Public domain · Wikimedia Commons",
      creditUrl: "https://commons.wikimedia.org/wiki/File:Frederick_Sanger.jpg",
    },
    title: ["Sanger reads the sequence of insulin", "桑格讀出胰島素的序列"],
    body: [
      [
        "Frederick Sanger in Cambridge worked out the full order of the 51 amino acids in insulin's two chains. It proved that a protein is not a vague mixture but a chain with **one exact sequence**. He won the Nobel Prize in Chemistry in 1958, and a second in 1980 for a method of sequencing DNA.",
        "劍橋的弗雷德里克・桑格解出胰島素兩條鏈上全部 51 個胺基酸的順序。這證明蛋白質不是含糊的混合物，而是一條有**唯一確定序列**的鏈。他在 1958 年獲得諾貝爾化學獎，1980 年又因 DNA 定序方法再度獲獎。",
      ],
      [
        "A sequence is a string of one-letter codes. Comparing two of them, letter by letter, is the **sequence identity** problem.",
        "序列就是一串單字母代碼。逐字比較兩條序列，就是**序列相同度**這道題目。",
      ],
    ],
    sources: [
      { label: "Ryle, Sanger et al., The disulphide bonds of insulin, Biochem. J. 60, 541 (1955)", url: "https://doi.org/10.1042/bj0600541" },
      { label: "Frederick Sanger (Nobel Prize, 1958)", url: "https://www.nobelprize.org/prizes/chemistry/1958/sanger/facts/" },
      { label: "Frederick Sanger (Wikipedia)", url: "https://en.wikipedia.org/wiki/Frederick_Sanger" },
    ],
  },
  {
    id: "kendrew-perutz",
    era: "life",
    year: "1958–1960",
    image: {
      src: "history/kendrew-perutz.webp",
      alt: ["Kendrew's model of sperm-whale myoglobin (built 1965), its backbone traced by a yellow tube", "肯德魯的抹香鯨肌紅蛋白模型（1965 年製作），以黃色管子描出主鏈"],
      credit: "Daderot · CC0 · Wikimedia Commons",
      creditUrl: "https://commons.wikimedia.org/wiki/File:Myoglobin_protein_model,_created_by_Dr._John_Kendrew_and_technician_at_Cambridge_University,_1965_-_National_Museum_of_American_History_-_DSC00018.jpg",
    },
    title: ["The first protein structures", "最早的蛋白質結構"],
    body: [
      [
        "Using X-ray crystallography, John Kendrew solved the 3D structure of **myoglobin** (a first view in 1958, atomic detail in 1960) and Max Perutz that of **haemoglobin** (1960, at lower resolution). They shared the 1962 Nobel Prize in Chemistry.",
        "約翰・肯德魯用 X 光晶體學解出**肌紅蛋白**的 3D 結構（1958 年初見輪廓，1960 年看到原子細節），馬克斯・佩魯茲解出**血紅蛋白**的結構（1960，解析度較低）。兩人共同獲得 1962 年諾貝爾化學獎。",
      ],
      [
        "For the first time a protein (myoglobin) had coordinates: an $(x, y, z)$ for every atom. That is the kind of data you read in the **PDB file** problem.",
        "蛋白質（肌紅蛋白）第一次有了座標：每個原子都有一組 $(x, y, z)$。這正是你在 **PDB 檔** 題目中要讀的資料。",
      ],
    ],
    sources: [
      { label: "Kendrew et al., A Three-Dimensional Model of the Myoglobin Molecule, Nature 181, 662 (1958)", url: "https://doi.org/10.1038/181662a0" },
      { label: "Kendrew et al., Structure of Myoglobin, Nature 185, 422 (1960)", url: "https://doi.org/10.1038/185422a0" },
      { label: "Perutz et al., Structure of Haemoglobin, Nature 185, 416 (1960)", url: "https://doi.org/10.1038/185416a0" },
      { label: "The Nobel Prize in Chemistry 1962", url: "https://www.nobelprize.org/prizes/chemistry/1962/summary/" },
    ],
  },
  {
    id: "anfinsen",
    era: "life",
    year: "1961",
    image: {
      src: "history/anfinsen.webp",
      alt: ["Christian B. Anfinsen, NIH portrait, 1969", "克里斯蒂安・安芬森，NIH 肖像，1969 年"],
      credit: "Edward A. Hubbard, NIH · Public domain · Wikimedia Commons",
      creditUrl: "https://commons.wikimedia.org/wiki/File:Christian_B._Anfinsen,_NIH_portrait,_1969.jpg",
    },
    title: ["Anfinsen: the sequence decides the shape", "安芬森：序列決定形狀"],
    body: [
      [
        "Christian Anfinsen unfolded the enzyme ribonuclease with urea and a reducing agent, then removed them: the chain folded back by itself into its working shape. So the **sequence alone holds the information** for the 3D structure. He shared the 1972 Nobel Prize in Chemistry.",
        "克里斯蒂安・安芬森用尿素和還原劑讓核糖核酸酶展開，再把藥劑移除：這條鏈自己摺回了能運作的形狀。所以**序列本身就帶有** 3D 結構的全部資訊。他在 1972 年共同獲得諾貝爾化學獎。",
      ],
      [
        "This is the promise behind every structure-prediction program, AlphaFold included: from the letters, compute the shape.",
        "這正是每一個結構預測程式（包括 AlphaFold）背後的承諾：從字母算出形狀。",
      ],
    ],
    sources: [
      { label: "Anfinsen et al., The kinetics of formation of native ribonuclease, PNAS 47, 1309 (1961)", url: "https://doi.org/10.1073/pnas.47.9.1309" },
      { label: "Anfinsen's dogma (Wikipedia)", url: "https://en.wikipedia.org/wiki/Anfinsen%27s_dogma" },
    ],
  },
  {
    id: "pdb",
    era: "life",
    year: "1971",
    image: {
      src: "history/pdb.svg",
      alt: [
        "Lines of a PDB file, each ATOM record giving an atom's name, residue and x, y, z coordinates",
        "PDB 檔的幾行內容：每一筆 ATOM 紀錄寫著原子名稱、殘基與 x、y、z 座標",
      ],
      credit: "Drawing: Catalyzer",
    },
    title: ["The Protein Data Bank", "蛋白質資料庫（PDB）"],
    body: [
      [
        "Crystallographers founded the **Protein Data Bank** at Brookhaven National Laboratory with seven structures, so that every solved structure could be shared. It now holds more than 200,000, free to download.",
        "晶體學家在布魯克海文國家實驗室成立了**蛋白質資料庫**，起初只有七個結構，目的是讓每個解出的結構都能分享。現在它收錄超過二十萬個結構，全部可以免費下載。",
      ],
      [
        "Those structures, open to all, became the training data for AlphaFold fifty years later.",
        "這些向所有人開放的結構，在五十年後成了 AlphaFold 的訓練資料。",
      ],
    ],
    sources: [
      { label: "Protein Data Bank (Wikipedia)", url: "https://en.wikipedia.org/wiki/Protein_Data_Bank" },
      { label: "RCSB PDB: history", url: "https://www.rcsb.org/pages/about-us/history" },
    ],
  },
  // ── Part III: molecules as data ──────────────────────────────────────────────────────────────────────────────
  {
    id: "smiles",
    era: "data",
    year: "1988",
    image: {
      src: "history/smiles.svg",
      alt: [
        "The SMILES string CCO beside the ethanol molecule it describes: two carbons and an oxygen in a chain",
        "SMILES 字串 CCO 與它描述的乙醇分子：兩個碳與一個氧連成一條鏈",
      ],
      credit: "Drawing: Catalyzer",
    },
    title: ["SMILES: a molecule in one line of text", "SMILES：一行文字寫下一個分子"],
    body: [
      [
        "David Weininger published **SMILES**, a way to write a molecule's graph as a short string: `CCO` is ethanol, `c1ccccc1` is benzene, and parentheses mark branches. A computer can store it, search it and turn it back into the molecule.",
        "大衛・韋寧格發表了 **SMILES**：把分子的圖寫成一個短字串的方法。`CCO` 是乙醇，`c1ccccc1` 是苯，括號表示分支。電腦可以儲存它、搜尋它，再把它變回分子。",
      ],
      [
        "Reading a SMILES string is the very first Catalyzer problem.",
        "讀懂一個 SMILES 字串，就是 Catalyzer 的第一道題目。",
      ],
    ],
    sources: [
      { label: "D. Weininger, SMILES, a chemical language and information system, J. Chem. Inf. Comput. Sci. 28, 31 (1988)", url: "https://doi.org/10.1021/ci00057a005" },
      { label: "Simplified molecular-input line-entry system (Wikipedia)", url: "https://en.wikipedia.org/wiki/Simplified_Molecular_Input_Line_Entry_System" },
    ],
  },
  {
    id: "casp",
    era: "data",
    year: "1994",
    image: {
      src: "history/casp.svg",
      alt: [
        "A blind test: predicted structures are sealed before the experimental structure is released, then compared",
        "盲測：預測的結構先封存，實驗結構公布後再比較",
      ],
      credit: "Drawing: Catalyzer",
    },
    title: ["CASP: a blind test for structure prediction", "CASP：結構預測的盲測"],
    body: [
      [
        "John Moult and colleagues started **CASP**, the Critical Assessment of protein Structure Prediction. Every two years, groups predict structures that have been solved but not yet released; independent assessors then score the predictions against the experiment.",
        "約翰・莫爾特與同事創辦了 **CASP**（蛋白質結構預測關鍵評估）。每兩年，各團隊預測一批已經解出、但尚未公布的結構；再由獨立的評審把預測與實驗結果比較評分。",
      ],
      [
        "Nobody can tune to the answer, so CASP is where claims are checked. The idea of comparing a prediction with an experiment is the **RMSD** problem in the professional track.",
        "沒有人能事先對著答案調整，所以 CASP 是檢驗各種宣稱的地方。把預測與實驗比較的想法，就是專業路線中的 **RMSD** 題目。",
      ],
    ],
    sources: [
      { label: "Moult et al., A large-scale experiment to assess protein structure prediction methods, Proteins 23, ii (1995)", url: "https://doi.org/10.1002/prot.340230303" },
      { label: "CASP (Wikipedia)", url: "https://en.wikipedia.org/wiki/CASP" },
    ],
  },
  {
    id: "lipinski",
    era: "data",
    year: "1997",
    image: {
      src: "history/lipinski.svg",
      alt: [
        "Lipinski's four limits drawn as gauges: molecular weight, logP, hydrogen-bond donors and acceptors",
        "以儀表畫出的 Lipinski 四項上限：分子量、logP、氫鍵供體與受體",
      ],
      credit: "Drawing: Catalyzer",
    },
    title: ["Lipinski's rule of five", "利平斯基五規則"],
    body: [
      [
        "Christopher Lipinski at Pfizer looked at about 2,200 drug candidates that had reached clinical trials and found that poor absorption from a pill is more likely when a molecule breaks two or more of these limits: molecular weight 500, logP 5, 5 hydrogen-bond donors, 10 acceptors. All the numbers are multiples of five, hence the name.",
        "輝瑞的克里斯多福・利平斯基分析了約 2,200 個已進入臨床試驗的候選藥物，發現當一個分子超出下列兩項以上的上限時，口服吸收不良的可能性較高：分子量 500、logP 5、氫鍵供體 5 個、受體 10 個。這些數字都是 5 的倍數，因此得名。",
      ],
      [
        "It is a famous rule of thumb computed from data rather than from a single experiment, and it is still the first filter many pipelines apply. You implement it in one of the problems.",
        "它是一條著名的經驗法則，從大量資料、而非單一實驗中歸納而來，至今仍是許多流程的第一道篩選。你會在其中一道題目中實作它。",
      ],
    ],
    sources: [
      { label: "Lipinski et al., Adv. Drug Deliv. Rev. 23, 3 (1997)", url: "https://doi.org/10.1016/S0169-409X(96)00423-1" },
      { label: "Lipinski's rule of five (Wikipedia)", url: "https://en.wikipedia.org/wiki/Lipinski%27s_rule_of_five" },
    ],
  },
  {
    id: "rdkit",
    era: "data",
    year: "2006",
    image: {
      src: "history/rdkit.svg",
      alt: [
        "Three lines of Python with RDKit: read a SMILES string, then count its atoms and compute its weight",
        "三行使用 RDKit 的 Python：讀入 SMILES 字串，再數原子、算分子量",
      ],
      credit: "Drawing: Catalyzer",
    },
    title: ["RDKit goes open source", "RDKit 開放原始碼"],
    body: [
      [
        "Greg Landrum and colleagues had built **RDKit** at the company Rational Discovery; in June 2006 they released it as open source under the BSD licence. It reads SMILES, finds rings, computes descriptors and fingerprints, and draws molecules, all from Python.",
        "格雷格・蘭德朗與同事原本在 Rational Discovery 公司開發 **RDKit**；2006 年 6 月他們以 BSD 授權將它開放原始碼。它能讀取 SMILES、找出環、計算描述子與分子指紋、畫出分子，全都可以從 Python 呼叫。",
      ],
      [
        "Open-source, free software meant that a student and a pharmaceutical company could run the same code. Most Catalyzer problems use it.",
        "開放原始碼的自由軟體代表學生和藥廠可以執行同一份程式碼。Catalyzer 大多數題目都會用到它。",
      ],
    ],
    sources: [
      { label: "RDKit: history (RDKit documentation, 2019)", url: "https://github.com/rdkit/rdkit/blob/Release_2019_09/Docs/Book/Overview.md#history" },
      { label: "RDKit (Wikipedia)", url: "https://en.wikipedia.org/wiki/RDKit" },
    ],
  },
  {
    id: "chembl",
    era: "data",
    year: "2009",
    image: {
      src: "history/chembl.svg",
      alt: [
        "A table linking molecules to protein targets and measured activities",
        "一張把分子連到蛋白質標靶與量測活性的表格",
      ],
      credit: "Drawing: Catalyzer",
    },
    title: ["ChEMBL: millions of measured activities", "ChEMBL：數百萬筆量測到的活性"],
    body: [
      [
        "With funding from the Wellcome Trust, EMBL's European Bioinformatics Institute took over StARlite, a commercial database of drug-like molecules from the company Inpharmatica, and released it free as **ChEMBL**: which molecule was measured against which protein, and how strongly it acted.",
        "在惠康基金會的資助下，歐洲分子生物學實驗室的歐洲生物資訊研究所接手了 Inpharmatica 公司的商業類藥分子資料庫 StARlite，並以 **ChEMBL** 之名免費公開：哪個分子對哪個蛋白質做過量測、作用有多強。",
      ],
      [
        "Together with NCBI's PubChem (2004), it gave machine learning on molecules its training data.",
        "它與 NCBI 的 PubChem（2004）一起，為分子上的機器學習提供了訓練資料。",
      ],
    ],
    sources: [
      { label: "Gaulton et al., ChEMBL: a large-scale bioactivity database for drug discovery, Nucleic Acids Res. 40, D1100 (2012)", url: "https://doi.org/10.1093/nar/gkr777" },
      { label: "ChEMBL (Wikipedia)", url: "https://en.wikipedia.org/wiki/ChEMBL" },
      { label: "ChEMBL release 1 (EMBL-EBI FTP, 2009)", url: "https://ftp.ebi.ac.uk/pub/databases/chembl/ChEMBLdb/releases/chembl_01/" },
    ],
  },
  {
    id: "ecfp",
    era: "data",
    year: "2010",
    image: {
      src: "history/ecfp.svg",
      alt: [
        "A circular fingerprint: rings of growing radius around each atom are hashed into bits of a long bit string",
        "環形分子指紋：以每個原子為中心、半徑漸增的環境被雜湊成長位元串中的位元",
      ],
      credit: "Drawing: Catalyzer",
    },
    title: ["Circular fingerprints", "環形分子指紋"],
    body: [
      [
        "David Rogers and Mathew Hahn described **extended-connectivity fingerprints**: look at each atom's neighbourhood out to a few bonds, and set one bit in a long bit string for every neighbourhood found. Two molecules are compared by the share of bits they have in common, the **Tanimoto similarity**.",
        "大衛・羅傑斯與馬修・哈恩描述了**延伸連接性指紋**（ECFP）：以每個原子為中心，看它幾個鍵以內的鄰近環境，每找到一種環境，就在一長串位元中設定一個位元。兩個分子用共同位元所佔的比例來比較，這就是 **Tanimoto 相似度**。",
      ],
      [
        "Based on the Morgan algorithm of 1965, used in the Pipeline Pilot software since about 2000 and described in full in 2010, ECFPs became a standard input for similarity search and machine-learning models. RDKit calls them Morgan fingerprints.",
        "它以 1965 年的 Morgan 演算法為基礎，約從 2000 年起用於 Pipeline Pilot 軟體，2010 年才完整發表；ECFP 成為相似度搜尋與機器學習模型的標準輸入。RDKit 稱它為 Morgan 指紋。",
      ],
    ],
    sources: [
      { label: "Rogers & Hahn, Extended-Connectivity Fingerprints, J. Chem. Inf. Model. 50, 742 (2010)", url: "https://doi.org/10.1021/ci100050t" },
      { label: "H. L. Morgan, J. Chem. Doc. 5, 107 (1965)", url: "https://doi.org/10.1021/c160017a018" },
      { label: "RDKit: Morgan fingerprints", url: "https://www.rdkit.org/docs/GettingStartedInPython.html#morgan-fingerprints-circular-fingerprints" },
    ],
  },
  // ── Part IV: AI designs molecules ────────────────────────────────────────────────────────────────────────────
  {
    id: "alphafold2",
    era: "ai",
    year: "2020",
    image: {
      src: "history/alphafold2.svg",
      alt: [
        "A protein sequence enters a network that passes information between residue pairs and outputs a 3D structure",
        "蛋白質序列進入網路，網路在殘基對之間傳遞資訊，輸出 3D 結構",
      ],
      credit: "Drawing: Catalyzer",
    },
    title: ["AlphaFold 2 at CASP14", "CASP14 上的 AlphaFold 2"],
    body: [
      [
        "At CASP14, DeepMind's **AlphaFold 2** predicted many targets with accuracy competitive with experimental structures, a median score of 92.4 GDT out of 100. The method was published in *Nature* in July 2021 with its code.",
        "在 CASP14 中，DeepMind 的 **AlphaFold 2** 對許多目標的預測準確度可與實驗結構相比，GDT 分數中位數達 92.4（滿分 100）。方法於 2021 年 7 月連同程式碼發表在《自然》期刊。",
      ],
      [
        "It also says how sure it is: **pLDDT** per residue and the **predicted aligned error** (PAE) between pairs. Reading those numbers is where the professional track starts. Tensorizer's `mini_alphafold` rebuilds the core idea in PyTorch.",
        "它也會告訴你它有多確定：每個殘基的 **pLDDT**，以及每對殘基之間的**預測對齊誤差**（PAE）。讀懂這些數字，就是專業路線的起點。Tensorizer 的 `mini_alphafold` 用 PyTorch 重建了它的核心想法。",
      ],
    ],
    sources: [
      { label: "Jumper et al., Highly accurate protein structure prediction with AlphaFold, Nature 596, 583 (2021)", url: "https://doi.org/10.1038/s41586-021-03819-2" },
      { label: "AlphaFold: a solution to a 50-year-old grand challenge in biology (DeepMind, 2020)", url: "https://deepmind.google/blog/alphafold-a-solution-to-a-50-year-old-grand-challenge-in-biology/" },
    ],
  },
  {
    id: "afdb",
    era: "ai",
    year: "2021",
    image: {
      src: "history/afdb.svg",
      alt: [
        "A protein ribbon coloured by pLDDT: dark blue where the model is very confident, orange where it is not",
        "依 pLDDT 上色的蛋白質緞帶：模型非常有把握處為深藍色，沒把握處為橘色",
      ],
      credit: "Drawing: Catalyzer",
    },
    title: ["The AlphaFold Protein Structure Database", "AlphaFold 蛋白質結構資料庫"],
    body: [
      [
        "DeepMind and EMBL-EBI opened the **AlphaFold DB** in July 2021 with predictions for the human proteome and 20 other organisms. In July 2022 it grew to more than 200 million structures: nearly every protein known to UniProt.",
        "DeepMind 與 EMBL-EBI 在 2021 年 7 月開放 **AlphaFold DB**，收錄人類蛋白質體與另外 20 種生物的預測。2022 年 7 月擴充到超過兩億個結構：幾乎涵蓋 UniProt 已知的所有蛋白質。",
      ],
      [
        "A prediction is not an experiment. Its pages colour each residue by pLDDT, and the low-confidence parts are often floppy regions that have no single shape at all.",
        "預測不等於實驗。它的頁面依 pLDDT 為每個殘基上色；信心低的部分，往往是根本沒有固定形狀的鬆軟區域。",
      ],
    ],
    sources: [
      { label: "Varadi et al., AlphaFold Protein Structure Database, Nucleic Acids Res. 50, D439 (2022)", url: "https://doi.org/10.1093/nar/gkab1061" },
      { label: "AlphaFold Protein Structure Database", url: "https://alphafold.ebi.ac.uk/" },
    ],
  },
  {
    id: "esmfold",
    era: "ai",
    year: "2022",
    image: {
      src: "history/esmfold.svg",
      alt: [
        "A language model reads a protein sequence like a sentence and passes its understanding to a folding head",
        "語言模型像讀句子一樣讀蛋白質序列，再把理解交給摺疊模組",
      ],
      credit: "Drawing: Catalyzer",
    },
    title: ["Protein language models: ESMFold", "蛋白質語言模型：ESMFold"],
    body: [
      [
        "Meta AI trained **ESM-2**, a language model, on tens of millions of protein sequences, the way text models learn from sentences, and attached a folding head to make **ESMFold**. It predicts a structure from a single sequence, without searching for related sequences first, and was used to fold over 600 million metagenomic proteins.",
        "Meta AI 用數千萬條蛋白質序列訓練語言模型 **ESM-2**，就像文字模型從句子中學習；再接上一個摺疊模組，成為 **ESMFold**。它只需一條序列就能預測結構，不必先搜尋相關序列，並被用來預測超過六億個總體基因體（metagenomic）蛋白質的結構。",
      ],
      [
        "Tensorizer's `protein_language_model` and `coevolution_contacts` problems show the two sources of signal: the language model, and pairs of positions that mutate together.",
        "Tensorizer 的 `protein_language_model` 與 `coevolution_contacts` 題目展示了兩種訊號來源：語言模型，以及會一起突變的位置對。",
      ],
    ],
    sources: [
      { label: "Lin et al., Evolutionary-scale prediction of atomic-level protein structure with a language model, Science 379, 1123 (2023)", url: "https://doi.org/10.1126/science.ade2574" },
      { label: "ESM Metagenomic Atlas", url: "https://esmatlas.com/" },
    ],
  },
  {
    id: "rfdiffusion",
    era: "ai",
    year: "2022–2023",
    image: {
      src: "history/rfdiffusion.svg",
      alt: [
        "Design in three steps: diffusion turns noise into a backbone, ProteinMPNN writes a sequence for it, a structure predictor checks it",
        "三步驟設計：擴散模型把雜訊變成骨架，ProteinMPNN 為它寫出序列，結構預測器再檢查",
      ],
      credit: "Drawing: Catalyzer",
    },
    title: ["Designing new proteins: ProteinMPNN and RFdiffusion", "設計新蛋白質：ProteinMPNN 與 RFdiffusion"],
    body: [
      [
        "David Baker's lab turned prediction around. **RFdiffusion** starts from random noise and refines it step by step into a new protein backbone, like image generators do with pixels; **ProteinMPNN** then writes a sequence that should fold into that backbone.",
        "大衛・貝克的實驗室把預測反過來用。**RFdiffusion** 從隨機雜訊出發，一步步修正成一個新的蛋白質骨架，就像影像生成模型處理像素那樣；接著 **ProteinMPNN** 寫出一條應該會摺成那個骨架的序列。",
      ],
      [
        "The check: fold the new sequence with a structure predictor and see whether it lands on the design (low RMSD, high pLDDT), and finally make it in the lab. Many designs that pass on the computer still fail in the experiment.",
        "檢查方法：用結構預測器摺疊新序列，看它是否回到設計的形狀（RMSD 低、pLDDT 高），最後在實驗室裡把它做出來。很多在電腦上通過的設計，到了實驗仍然失敗。",
      ],
    ],
    sources: [
      { label: "Dauparas et al., Robust deep learning–based protein sequence design using ProteinMPNN, Science 378, 49 (2022)", url: "https://doi.org/10.1126/science.add2187" },
      { label: "Watson et al., De novo design of protein structure and function with RFdiffusion, Nature 620, 1089 (2023)", url: "https://doi.org/10.1038/s41586-023-06415-8" },
    ],
  },
  {
    id: "alphafold3",
    era: "ai",
    year: "2024",
    image: {
      src: "history/alphafold3.svg",
      alt: [
        "A protein, a strand of DNA and a small drug molecule predicted together as one complex",
        "蛋白質、一段 DNA 與一個小分子藥物被一起預測成一個複合體",
      ],
      credit: "Drawing: Catalyzer",
    },
    title: ["AlphaFold 3: whole complexes", "AlphaFold 3：整個複合體"],
    body: [
      [
        "**AlphaFold 3** (Google DeepMind and Isomorphic Labs, May 2024) predicts proteins together with DNA, RNA, small molecules and ions, using a diffusion model to place the atoms. Its code was released for academic use in November 2024, and open reproductions such as Boltz-1 followed.",
        "**AlphaFold 3**（Google DeepMind 與 Isomorphic Labs，2024 年 5 月）能把蛋白質與 DNA、RNA、小分子、離子一起預測，用擴散模型擺放原子。它的程式碼於 2024 年 11 月開放學術使用，隨後也出現了 Boltz-1 等開放的重現版本。",
      ],
      [
        "Where a drug binds a protein is a central question in drug discovery, so these models reach from Part I's atoms to Part II's proteins.",
        "藥物結合在蛋白質的哪裡，是藥物開發的核心問題之一；因此這些模型把第一部的原子和第二部的蛋白質連在一起。",
      ],
    ],
    sources: [
      { label: "Abramson et al., Accurate structure prediction of biomolecular interactions with AlphaFold 3, Nature 630, 493 (2024)", url: "https://doi.org/10.1038/s41586-024-07487-w" },
      { label: "AlphaFold 3 source code (GitHub)", url: "https://github.com/google-deepmind/alphafold3" },
    ],
  },
  {
    id: "nobel-2024",
    era: "ai",
    year: "2024",
    image: {
      src: "history/nobel-2024.webp",
      alt: ["David Baker, Demis Hassabis and John Jumper (from left) at the 2024 Nobel Prize conference", "大衛・貝克、德米斯・哈薩比斯與約翰・江珀（由左至右）在 2024 年諾貝爾獎會議"],
      credit: "Jennifer 8. Lee · CC BY-SA 4.0 · Wikimedia Commons",
      creditUrl: "https://commons.wikimedia.org/wiki/File:David_Baker,_Demis_Hassabis,_and_John_Jumper_at_2024_Nobel_Prize_Conference.jpg",
    },
    title: ["The Nobel Prize for protein design and prediction", "蛋白質設計與預測獲諾貝爾獎"],
    body: [
      [
        "On 9 October 2024 the Nobel Prize in Chemistry went half to **David Baker** \"for computational protein design\" and half jointly to **Demis Hassabis** and **John Jumper** \"for protein structure prediction\".",
        "2024 年 10 月 9 日，諾貝爾化學獎一半頒給 **大衛・貝克**，表彰「計算蛋白質設計」；另一半由 **德米斯・哈薩比斯** 與 **約翰・江珀** 共享，表彰「蛋白質結構預測」。",
      ],
      [
        "Anfinsen's promise of 1961, that the sequence decides the shape, had become a tool any lab can use, and the checking you learn here is part of using it well.",
        "安芬森在 1961 年的承諾（序列決定形狀）成了任何實驗室都能使用的工具；而你在這裡學的檢查方法，正是好好使用它的一部分。",
      ],
    ],
    sources: [
      { label: "The Nobel Prize in Chemistry 2024 (press release)", url: "https://www.nobelprize.org/prizes/chemistry/2024/press-release/" },
    ],
  },
];
