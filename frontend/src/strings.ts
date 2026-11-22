/** UI strings: one row per key, [English, Traditional Chinese] (the order of LANGS). */
import type { Language, StringTable } from "@learnkit/web";

export const LANGS: Language[] = [
  { code: "en", name: "English" },
  { code: "zh-Hant", name: "繁體中文" },
];

export const STRINGS = {
  tagline: [
    "Molecular science in Python, learned by doing",
    "用 Python 學分子科學：動手做",
  ],
  "page.home": ["Home", "首頁"],
  "page.problems": ["Problems", "題庫"],
  "page.concept": ["Concept", "概念"],
  "page.skills": ["Coding Skills", "程式技巧"],
  "page.agents": ["AI agent", "AI 代理"],
  "page.reading": ["Further reading", "延伸閱讀"],
  "reading.books": ["Books & papers", "書籍與論文"],
  "tab.about": ["What Catalyzer does", "Catalyzer 能做什麼"],
  "tab.path": ["The path", "學習路線"],
  "tab.molecule": ["What a molecule is", "分子是什麼"],
  "tab.data": ["Molecules as data", "把分子變成資料"],
  "tab.pdb": ["Reading a structure file", "讀懂結構檔"],
  "tab.proteins": ["Proteins: sequence to function", "蛋白質：從序列到功能"],
  "tab.energy": ["Energy and shape", "能量與形狀"],
  "tab.quantum": ["Quantum chemistry", "量子化學"],
  "tab.ml": ["Machine learning", "機器學習"],
  "tab.ai": ["How AI designs molecules", "AI 如何設計分子"],
  "tab.history": ["History", "歷史"],
  "history.title": [
    "How molecules became something we can compute",
    "分子如何變成可以計算的東西",
  ],
  "history.intro": [
    "From Dalton's atoms in 1808 to AlphaFold 3 in 2024: two centuries of ideas behind every Catalyzer problem. The first two parts are the science an undergraduate learns; the last two are the data and the AI models a molecular designer uses today, and how they are checked.",
    "從 1808 年道耳頓的原子到 2024 年的 AlphaFold 3：每一道 Catalyzer 題目背後兩百年的想法。前兩部是大學生要學的科學；後兩部是今天做分子設計的人所用的資料與 AI 模型，以及如何檢查它們。",
  ],
  contents: ["On this page", "本頁內容"],
  timeline: ["Timeline", "時間軸"],
  "timeline.open": ["All events", "全部事件"],
  sources: ["Sources", "資料來源"],
  "coming.title": ["Coming soon", "即將推出"],
  "coming.history": ["Read the History", "閱讀歷史"],
  "agents.body": [
    "Connect your own AI assistant to Catalyzer: a skill that explains the problems, and an MCP server on your computer that runs the tests, so the assistant can check its own answers.",
    "把你自己的 AI 助理接上 Catalyzer：一個會解說題目的 skill，以及一個在你電腦上執行測試的 MCP 伺服器，讓助理可以檢查自己的答案。",
  ],
  "books.body": [
    "A reading list is on its way: textbooks for learning chemistry and biochemistry from scratch, the papers behind each History card, and the documentation of the open libraries (RDKit, Biopython, the PDB, AlphaFold DB).",
    "書單正在整理中：從零學化學與生物化學的教科書、每張歷史卡片背後的論文，以及開放函式庫的文件（RDKit、Biopython、PDB、AlphaFold DB）。",
  ],
  "footer.licence": ["Apache-2.0", "Apache-2.0"],
  coffee: ["Buy me a coffee", "請我喝杯咖啡"],
} satisfies StringTable;
