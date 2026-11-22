/** Home: what Catalyzer is in one paragraph, and where each kind of reader starts. */
import { go, RichText, type L, useLang } from "@learnkit/web";
import { PROBLEMS } from "./problems";

const asset = (p: string) => `${import.meta.env.BASE_URL}${p}`;

const STARTS: { title: L; text: L; picture: string; to: [string, string?] }[] = [
  {
    title: ["Learn from scratch", "從零開始學"],
    text: ["What a molecule is, how a computer holds one, how proteins fold, and how AI designs molecules: four short pages, then the problems.", "分子是什麼、電腦如何保存分子、蛋白質如何摺疊、AI 如何設計分子：先讀四篇短文，再做題目。"],
    picture: "problems/molecules/read_smiles.svg",
    to: ["concept", "molecule"],
  },
  {
    title: ["Solve problems", "解題"],
    text: [`${PROBLEMS.length} problems from reading a SMILES string to measuring an AlphaFold model against experiment, checked by tests on your own computer.`, `${PROBLEMS.length} 道題目，從讀懂一個 SMILES 字串，到拿 AlphaFold 模型和實驗比對，由測試在你自己的電腦上檢查。`],
    picture: "problems/molecules/lipinski.svg",
    to: ["problems"],
  },
  {
    title: ["Check an AI model (professional)", "檢查 AI 模型（專業）"],
    text: ["Read pLDDT, superpose a prediction on a crystal structure, and see both in 3D.", "讀懂 pLDDT、把預測疊到晶體結構上，並在 3D 中同時檢視兩者。"],
    picture: "problems/pro/alphafold_plddt.svg",
    to: ["skills", "viewer"],
  },
  {
    title: ["History", "歷史"],
    text: ["From Dalton's atoms in 1808 to the 2024 Nobel Prize for protein design and structure prediction.", "從 1808 年道耳頓的原子，到 2024 年蛋白質設計與結構預測的諾貝爾獎。"],
    picture: "history/afdb.svg",
    to: ["concept", "history"],
  },
];

export default function HomePage() {
  const { pick } = useLang();
  return (
    <div className="mx-auto max-w-5xl px-5 pt-10 pb-16" data-testid="home">
      <h1 className="text-4xl font-semibold tracking-tight text-gray-900">
        Cataly<span className="text-(--lk-accent)">zer</span>
      </h1>
      <p className="mt-2 text-lg text-gray-700">{pick(["Molecular science in Python, learned by doing", "用 Python 學分子科學：動手做"])}</p>
      <p className="mt-4 max-w-3xl text-gray-600">
        <RichText
          text={pick([
            "A molecule is a graph of atoms and bonds, a protein is a string of letters that folds into a shape, and an AI model's prediction is something you can measure. Catalyzer teaches all three by writing Python that tests check, for two kinds of reader: someone learning chemistry and biomolecules from scratch, and a professional who designs molecules with AlphaFold-like models and must check what they produce.",
            "分子是一張由原子與鍵組成的圖，蛋白質是一串會摺疊成形狀的字母，而 AI 模型的預測是可以量測的東西。Catalyzer 用「寫 Python、讓測試檢查」的方式教這三件事，寫給兩種讀者：從零開始學化學與生物分子的人，以及用類 AlphaFold 模型設計分子、必須檢查模型產出的專業人士。",
          ])}
        />
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {STARTS.map((s) => (
          <button
            key={s.title[0]}
            onClick={() => go(...s.to)}
            className="group flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white text-left shadow-sm transition hover:border-(--lk-accent) hover:shadow"
            data-testid={`start-${s.to.join("-")}`}
          >
            <img src={asset(s.picture)} alt="" className="aspect-[8/5] w-full border-b border-gray-100 object-cover" loading="lazy" />
            <div className="p-4">
              <h2 className="font-semibold text-gray-900 group-hover:text-(--lk-accent)">{pick(s.title)} →</h2>
              <p className="mt-1 text-sm text-gray-600">{pick(s.text)}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
