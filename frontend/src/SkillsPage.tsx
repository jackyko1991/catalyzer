/**
 * Coding Skills: short guides to the tools, each in Feynman order (one sentence, a picture, then the details). The
 * code shown is real: frontend/src/skills/*.py run in tests/test_skills.py and print exactly the output shown.
 */
import { python } from "@codemirror/lang-python";
import { CodeBlock, Graph3D, type G3Link, type G3Node, go, P, Page, RichText, Section, type L, useLang } from "@learnkit/web";
import { useEffect, useMemo, useState } from "react";
import { KINDS, type LibKind, LIBS, problemsUsing } from "./libraries";
import MoleculeViewer, { PLDDT_BANDS } from "./MoleculeViewer";
import { type Problem, problemName, PROBLEMS, TENSORIZER_LINKS, tensorizerUrl } from "./problems";
import biopythonCode from "./skills/biopython_basics.py?raw";
import biopythonOut from "./skills/biopython_basics.out?raw";
import rdkitCode from "./skills/rdkit_basics.py?raw";
import rdkitOut from "./skills/rdkit_basics.out?raw";
import structuresCode from "./skills/structures_basics.py?raw";
import structuresOut from "./skills/structures_basics.out?raw";

export const SKILL_TABS = ["viewer", "rdkit", "biopython", "structures", "map", "pytorch"] as const;
export const SKILL_TAB_TITLES: Record<(typeof SKILL_TABS)[number], L> = {
  viewer: ["3D viewer", "3D 檢視器"],
  rdkit: ["RDKit basics", "RDKit 入門"],
  biopython: ["Biopython basics", "Biopython 入門"],
  structures: ["Reading structures", "讀取結構檔"],
  map: ["Open-library map", "開放函式庫地圖"],
  pytorch: ["PyTorch on molecules", "在分子上用 PyTorch"],
};

const PY = python();

export default function SkillsPage({ tab, section, scrollRoot }: { tab: string; section: string | null; scrollRoot: string }) {
  switch (tab) {
    case "rdkit":
      return (
        <SnippetPage
          id="rdkit"
          scrollRoot={scrollRoot}
          focus={section}
          title={SKILL_TAB_TITLES.rdkit}
          intro={[
            "RDKit turns a line of text into a molecule you can question: how many atoms, which rings, how heavy, how similar to another. Seven moves cover most of what the small-molecule problems need.",
            "RDKit 把一行文字變成可以提問的分子：有幾個原子、哪些環、多重、和另一個分子多像。七個動作就涵蓋了小分子題目需要的大部分功夫。",
          ]}
          code={rdkitCode}
          out={rdkitOut}
          lib="rdkit"
        />
      );
    case "biopython":
      return (
        <SnippetPage
          id="biopython"
          scrollRoot={scrollRoot}
          focus={section}
          title={SKILL_TAB_TITLES.biopython}
          intro={[
            "Biopython treats DNA and proteins as strings that know their biology: a DNA sequence can be translated, a FASTA file read, two proteins aligned with a substitution matrix.",
            "Biopython 把 DNA 與蛋白質當成懂得生物學的字串：DNA 序列可以轉譯、FASTA 檔可以讀取、兩個蛋白質可以用取代矩陣比對。",
          ]}
          code={biopythonCode}
          out={biopythonOut}
          lib="biopython"
        />
      );
    case "structures":
      return (
        <SnippetPage
          id="structures"
          scrollRoot={scrollRoot}
          focus={section}
          title={SKILL_TAB_TITLES.structures}
          intro={[
            "A structure file is a list of atoms with $x, y, z$ positions. Biopython reads it into a tree (model, chain, residue, atom); from there distances, neighbours, confidence and RMSD are a few lines each. The files are the viewer's: [1crn.pdb](structures/1crn.pdb) and [its AlphaFold model](structures/AF-P01542-F1-model_v6.aligned.pdb). The newer mmCIF format is read the same way with `MMCIFParser`.",
            "結構檔是一串帶有 $x, y, z$ 位置的原子。Biopython 把它讀成一棵樹（模型、鏈、殘基、原子）；接著距離、鄰居、信心分數與 RMSD 各只需幾行。檔案就是檢視器用的那些：[1crn.pdb](structures/1crn.pdb) 與[它的 AlphaFold 模型](structures/AF-P01542-F1-model_v6.aligned.pdb)。較新的 mmCIF 格式用 `MMCIFParser` 以同樣方式讀取。",
          ]}
          code={structuresCode}
          out={structuresOut}
          lib="pdb"
        />
      );
    case "map":
      return <LibraryMap />;
    case "pytorch":
      return <PyTorchPage scrollRoot={scrollRoot} focus={section} />;
    default:
      return <ViewerPage scrollRoot={scrollRoot} focus={section} />;
  }
}

function ProblemLinks({ problems }: { problems: Problem[] }) {
  const { pick } = useLang();
  if (!problems.length) return null;
  return (
    <ul className="mt-2 flex flex-wrap gap-2">
      {problems.map((p) => (
        <li key={p.id}>
          <button onClick={() => go("problems", problemName(p))} className="rounded-full bg-emerald-50 px-3 py-1 text-sm text-emerald-800 ring-1 ring-emerald-200 hover:bg-emerald-100">
            {pick(p.title)}
          </button>
        </li>
      ))}
    </ul>
  );
}

// ── 3D viewer ──────────────────────────────────────────────────────────────────────────────────────────────────────

interface Mol {
  id: string;
  name: L;
  smiles: string;
  molblock: string;
}

export function useMolecules() {
  const [mols, setMols] = useState<Mol[]>([]);
  useEffect(() => {
    let live = true;
    fetch(`${import.meta.env.BASE_URL}structures/molecules.json`)
      .then((r) => r.json())
      .then((m) => live && setMols(m));
    return () => {
      live = false;
    };
  }, []);
  return mols;
}

const CRYSTAL = "structures/1crn.pdb";
const MODEL = "structures/AF-P01542-F1-model_v6.aligned.pdb";

function PlddtLegend() {
  const { pick } = useLang();
  return (
    <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
      {PLDDT_BANDS.map((b) => (
        <li key={b.colour} className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-sm" style={{ background: b.colour }} />
          {pick(b.label)}
        </li>
      ))}
    </ul>
  );
}

function ViewerPage({ scrollRoot, focus }: { scrollRoot: string; focus: string | null }) {
  const { pick } = useLang();
  const mols = useMolecules();
  const [molId, setMolId] = useState("caffeine");
  const mol = mols.find((m) => m.id === molId);
  const sections = [
    { id: "molecules", title: ["Small molecules: balls and sticks", "小分子：球棍模型"] as L },
    { id: "protein", title: ["A protein as a ribbon", "把蛋白質畫成緞帶"] as L },
    { id: "confidence", title: ["Colour by confidence (pLDDT)", "依信心分數（pLDDT）上色"] as L },
    { id: "check", title: ["Prediction on top of experiment", "把預測疊在實驗上"] as L },
  ];
  return (
    <Page
      id="viewer"
      scrollRoot={scrollRoot}
      focus={focus}
      sections={sections}
      title={SKILL_TAB_TITLES.viewer}
      intro={[
        "A molecule is a set of atoms at positions in space. The viewer draws those positions so you can turn them with the mouse: atoms and bonds for a small molecule, a ribbon along the backbone for a protein.",
        "分子是一組位於空間中某些位置的原子。檢視器把這些位置畫出來，讓你用滑鼠轉動：小分子畫成原子與鍵，蛋白質則沿著主鏈畫成緞帶。",
      ]}
    >
      <Section page="viewer" id="molecules" n={1} title={sections[0].title}>
        <P t={["Each ball is an atom, coloured by element (grey carbon, white hydrogen, red oxygen, blue nitrogen); each stick is a bond. SMILES has no coordinates, so RDKit generated these 3D shapes (ETKDG, then a force-field relaxation), as in step 7 of RDKit basics.", "每顆球是一個原子，依元素上色（灰色碳、白色氫、紅色氧、藍色氮）；每根棍子是一個鍵。SMILES 沒有座標，所以這些 3D 形狀是 RDKit 產生的（ETKDG，再以力場鬆弛），就像「RDKit 入門」的第 7 步。"]} />
        <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label={pick(["Molecule", "分子"])}>
          {mols.map((m) => (
            <button
              key={m.id}
              onClick={() => setMolId(m.id)}
              aria-pressed={m.id === molId}
              className={`rounded-full px-3 py-1 text-sm ring-1 ${m.id === molId ? "bg-(--lk-accent) text-white ring-(--lk-accent)" : "bg-white text-gray-700 ring-gray-300 hover:ring-(--lk-accent)"}`}
            >
              {pick(m.name)}
            </button>
          ))}
        </div>
        <div className="mt-3">
          {mol ? (
            <MoleculeViewer models={[{ data: mol.molblock, format: "sdf", style: "stick", colour: "element" }]} label={pick(mol.name)} />
          ) : (
            <div className="h-[360px] rounded-lg border border-gray-200 bg-white" />
          )}
          {mol && (
            <p className="mt-2 text-sm text-gray-500">
              SMILES <code className="rounded bg-gray-100 px-1">{mol.smiles}</code>
            </p>
          )}
        </div>
      </Section>
      <Section page="viewer" id="protein" n={2} title={sections[1].title}>
        <P t={["Crambin, a 46-residue protein from seeds, as solved by X-ray crystallography (PDB 1CRN). Drawing every atom would hide the fold, so the ribbon follows the backbone: coils are α-helices, flat arrows are β-strands.", "Crambin 是種子中一個 46 個殘基的蛋白質，以 X 光晶體學解出（PDB 1CRN）。把每個原子都畫出來會遮住摺疊，所以緞帶沿著主鏈走：螺旋是 α 螺旋，扁平的箭頭是 β 股。"]} />
        <div className="mt-3">
          <MoleculeViewer models={[{ url: CRYSTAL, format: "pdb", style: "cartoon", colour: { colour: "#0f766e" } }]} label="crambin 1CRN" />
        </div>
      </Section>
      <Section page="viewer" id="confidence" n={3} title={sections[2].title}>
        <P t={["The same protein as AlphaFold predicted it (AlphaFold DB, AF-P01542-F1), coloured by the model's own confidence per residue. Almost all of it is dark blue: the model is very sure. Only the last residue, at the free end of the chain, is less certain.", "同一個蛋白質，這次是 AlphaFold 的預測（AlphaFold DB，AF-P01542-F1），依模型對每個殘基的信心上色。幾乎全部都是深藍色：模型非常有把握。只有鏈尾自由端的最後一個殘基比較不確定。"]} />
        <div className="mt-3">
          <MoleculeViewer models={[{ url: MODEL, format: "pdb", style: "cartoon", colour: "plddt" }]} label="AlphaFold model of crambin coloured by pLDDT" />
          <PlddtLegend />
        </div>
      </Section>
      <Section page="viewer" id="check" n={4} title={sections[3].title}>
        <P t={["Grey is the crystal structure, coloured is the prediction, laid on top of it by the best rotation (the Kabsch fit you write in the RMSD problem). The alpha carbons sit on average 0.43 Å apart, less than the width of one atom.", "灰色是晶體結構，彩色是預測，以最佳旋轉疊在上面（就是你在 RMSD 題目中寫的 Kabsch 擬合）。α 碳平均只相距 0.43 Å，比一個原子的寬度還小。"]} />
        <div className="mt-3">
          <MoleculeViewer
            models={[
              { url: CRYSTAL, format: "pdb", style: "cartoon", colour: { colour: "#9ca3af" } },
              { url: MODEL, format: "pdb", style: "cartoon", colour: "plddt" },
            ]}
            label="AlphaFold model superposed on the crystal structure of crambin"
          />
        </div>
        <ProblemLinks problems={PROBLEMS.filter((p) => p.category === "pro")} />
      </Section>
    </Page>
  );
}

// ── tested snippets ────────────────────────────────────────────────────────────────────────────────────────────────

function SnippetPage({ id, title, intro, code, out, lib, scrollRoot, focus }: { id: string; title: L; intro: L; code: string; out: string; lib: string; scrollRoot: string; focus: string | null }) {
  const { pick } = useLang();
  const libInfo = LIBS.find((l) => l.id === lib)!;
  const sections = [
    { id: "code", title: ["The code", "程式碼"] as L },
    { id: "output", title: ["What it prints", "它印出的結果"] as L },
    { id: "problems", title: ["Where you use it", "在哪裡用到"] as L },
  ];
  return (
    <Page id={id} scrollRoot={scrollRoot} focus={focus} sections={sections} title={title} intro={intro}>
      <Section page={id} id="code" n={1} title={sections[0].title}>
        <P t={["Run it yourself: `pixi run python` in the Catalyzer folder has every library installed. The numbered comments are the steps.", "自己執行看看：在 Catalyzer 資料夾中，`pixi run python` 已裝好所有函式庫。編號的註解就是各個步驟。"]} />
        <div className="mt-3 overflow-x-auto text-sm">
          <CodeBlock code={code} language={PY} />
        </div>
      </Section>
      <Section page={id} id="output" n={2} title={sections[1].title}>
        <P t={["Exactly this: the site's tests run the code above and compare its output with what is shown here.", "就是這樣：網站的測試會執行上面的程式碼，並把輸出和這裡顯示的內容比較。"]} />
        <pre className="mt-3 overflow-x-auto rounded-lg bg-gray-900 p-4 text-sm text-gray-100" data-testid="snippet-output">
          {out}
        </pre>
      </Section>
      <Section page={id} id="problems" n={3} title={sections[2].title}>
        <p className="text-gray-700">
          <a href={libInfo.url} target="_blank" rel="noreferrer" className="font-medium text-(--lk-accent) hover:underline">
            {libInfo.name} ↗
          </a>{" "}
          <span className="text-sm text-gray-500">({libInfo.licence})</span>
          {" · "}
          {pick(libInfo.what)}
        </p>
        <ProblemLinks problems={problemsUsing(libInfo)} />
      </Section>
    </Page>
  );
}

// ── open-library map ───────────────────────────────────────────────────────────────────────────────────────────────

function LibraryMap() {
  const { pick } = useLang();
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<LibKind | "all">("all");
  const [sel, setSel] = useState<number | null>(null);
  const shown = LIBS.filter(
    (l) => (kind === "all" || l.kind === kind) && (query.trim() === "" || `${l.name} ${l.what.join(" ")} ${l.licence}`.toLowerCase().includes(query.trim().toLowerCase())),
  );

  // graph: libraries/databases/models, the problems, and problem → library links
  const { nodes, links } = useMemo(() => {
    const nodes: G3Node[] = LIBS.map((l, i) => ({ id: i, label: l.name, color: KINDS[l.kind].colour, val: 3 + problemsUsing(l).length * 2 }));
    const links: G3Link[] = [];
    PROBLEMS.forEach((p, j) => {
      const id = LIBS.length + j;
      nodes.push({ id, label: pick(p.title), color: "#9ca3af", val: 2 });
      LIBS.forEach((l, i) => problemsUsing(l).includes(p) && links.push({ source: id, target: i, color: "#d1d5db" }));
    });
    // amber links: a model stands on the data it was trained on or serves, and on the library it is built with; a library reads the data
    const at = (x: string) => LIBS.findIndex((l) => l.id === x);
    for (const [a, b] of [["alphafold2", "pdb"], ["alphafold2", "uniprot"], ["afdb", "alphafold2"], ["afdb", "uniprot"], ["esm", "uniprot"], ["alphafold3", "pdb"], ["boltz", "pdb"], ["rfdiffusion", "pdb"], ["proteinmpnn", "pdb"], ["colabfold", "alphafold2"], ["rdkit", "numpy"], ["openmm", "numpy"], ["pytorch", "numpy"], ["esm", "pytorch"], ["boltz", "pytorch"], ["rfdiffusion", "pytorch"], ["3dmol", "pdb"], ["3dmol", "afdb"], ["biopython", "pdb"], ["biopython", "uniprot"], ["rdkit", "chembl"], ["rdkit", "pubchem"], ["openbabel", "pubchem"], ["openmm", "pdb"]])
      links.push({ source: at(a), target: at(b), color: "#fcd34d" });
    return { nodes, links };
  }, [pick]);

  const selected = sel !== null && sel < LIBS.length ? LIBS[sel] : null;
  const selectedProblem = sel !== null && sel >= LIBS.length ? PROBLEMS[sel - LIBS.length] : null;

  return (
    <div className="mx-auto max-w-6xl px-5 pt-8 pb-16" data-testid="library-map">
      <h1 className="text-3xl font-semibold tracking-tight text-gray-900">{pick(SKILL_TAB_TITLES.map)}</h1>
      <p className="mt-3 max-w-3xl text-gray-600">
        <RichText
          text={pick([
            "Molecular science runs on open software and open data. Each point is a library (green), a database (blue) or an AI model (orange), bigger when more problems use it; grey points are Catalyzer's problems, joined to what they use, and amber lines show what reads or was trained on what. Every licence was checked on the project's own licence page.",
            "分子科學建立在開放的軟體與資料上。每個點是一個函式庫（綠）、資料庫（藍）或 AI 模型（橘），被越多題目用到就越大；灰色的點是 Catalyzer 的題目，連到它們所用的東西；琥珀色的線表示誰讀取誰、誰以誰的資料訓練。每項授權都在該專案自己的授權頁面上核對過。",
          ])}
        />
      </p>
      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <Graph3D
          nodes={nodes}
          links={links}
          focus={sel}
          onSelect={setSel}
          height={440}
          arrows={false}
          testId="library-3d"
          hint={["click a point", "點選一個點"]}
          card={(i) => <span className="text-sm">{nodes[i]?.label}</span>}
          side={null}
        />
        <div className="min-w-0 rounded-lg border border-gray-200 bg-white p-4" data-testid="library-detail">
          {selected ? (
            <>
              <p className="text-xs font-medium tracking-wide uppercase" style={{ color: KINDS[selected.kind].colour }}>
                {pick(KINDS[selected.kind].label)}
              </p>
              <h2 className="mt-1 text-xl font-semibold text-gray-900">{selected.name}</h2>
              <p className="mt-2 text-gray-700">{pick(selected.what)}</p>
              <p className="mt-2 text-sm text-gray-500">
                {pick(["Licence", "授權"])}: {selected.licence}
              </p>
              <a href={selected.url} target="_blank" rel="noreferrer" className="mt-2 inline-block text-sm text-(--lk-accent) hover:underline">
                {pick(["Documentation", "文件"])} ↗
              </a>
              <ProblemLinks problems={problemsUsing(selected)} />
            </>
          ) : selectedProblem ? (
            <>
              <p className="text-xs font-medium tracking-wide text-gray-500 uppercase">{pick(["Problem", "題目"])}</p>
              <h2 className="mt-1 text-xl font-semibold text-gray-900">{pick(selectedProblem.title)}</h2>
              <ProblemLinks problems={[selectedProblem]} />
            </>
          ) : (
            <p className="text-sm text-gray-500">{pick(["Click a point in the map, or a row below.", "點選地圖中的一個點，或下面的一列。"])}</p>
          )}
        </div>
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-2">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={pick(["Search libraries, databases, models…", "搜尋函式庫、資料庫、模型…"])}
          className="w-full max-w-sm rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-(--lk-accent) focus:outline-none"
          data-testid="library-search"
        />
        {(["all", "library", "database", "model"] as const).map((k) => (
          <button
            key={k}
            onClick={() => setKind(k)}
            aria-pressed={kind === k}
            className={`rounded-full px-3 py-1 text-sm ring-1 ${kind === k ? "bg-gray-900 text-white ring-gray-900" : "bg-white text-gray-700 ring-gray-300"}`}
          >
            {k === "all" ? pick(["All", "全部"]) : pick(KINDS[k].label)}
          </button>
        ))}
      </div>
      <div className="mt-3 overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-3 py-2 font-medium">{pick(["Name", "名稱"])}</th>
              <th className="px-3 py-2 font-medium">{pick(["What it does", "用途"])}</th>
              <th className="px-3 py-2 font-medium">{pick(["Licence", "授權"])}</th>
              <th className="px-3 py-2 font-medium">{pick(["Problems", "題目"])}</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((l) => (
              <tr key={l.id} className="cursor-pointer border-t border-gray-100 hover:bg-emerald-50/40" onClick={() => setSel(LIBS.indexOf(l))} data-testid={`library-row-${l.id}`}>
                <td className="px-3 py-2 font-medium whitespace-nowrap">
                  <span className="mr-2 inline-block h-2.5 w-2.5 rounded-full" style={{ background: KINDS[l.kind].colour }} />
                  <a href={l.url} target="_blank" rel="noreferrer" className="hover:text-(--lk-accent) hover:underline" onClick={(e) => e.stopPropagation()}>
                    {l.name}
                  </a>
                </td>
                <td className="px-3 py-2 text-gray-700">{pick(l.what)}</td>
                <td className="px-3 py-2 text-gray-500">{l.licence}</td>
                <td className="px-3 py-2 text-gray-700">{problemsUsing(l).length || "–"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── PyTorch on molecules ───────────────────────────────────────────────────────────────────────────────────────────

function PyTorchPage({ scrollRoot, focus }: { scrollRoot: string; focus: string | null }) {
  const { pick } = useLang();
  const sections = [
    { id: "idea", title: ["Two sites, one workflow", "兩個網站，一套流程"] as L },
    { id: "build", title: ["Build it in Tensorizer", "在 Tensorizer 中建構"] as L },
  ];
  return (
    <Page
      id="pytorch"
      scrollRoot={scrollRoot}
      focus={focus}
      sections={sections}
      title={SKILL_TAB_TITLES.pytorch}
      intro={[
        "Every AI model in molecular science is tensors and gradients. Tensorizer, a sister lab, builds small versions of them from scratch in PyTorch; Catalyzer uses the full-size tools on real molecules and checks what they produce.",
        "分子科學中的每個 AI 模型，都是張量與梯度。姊妹站 Tensorizer 用 PyTorch 從零建構它們的小型版本；Catalyzer 則把完整的工具用在真實分子上，並檢查它們的產出。",
      ]}
    >
      <Section page="pytorch" id="idea" n={1} title={sections[0].title}>
        <P t={["In Tensorizer you see inside: a molecule's graph becomes an adjacency tensor, a protein's contacts a distance map, and a few einsums do the work. Here you stand outside: you read a model's output (pLDDT, coordinates) and test it against experiment, as a professional must.", "在 Tensorizer 中，你看見模型內部：分子的圖變成鄰接張量，蛋白質的接觸變成距離圖，幾個 einsum 就完成工作。在這裡，你站在外面：讀取模型的輸出（pLDDT、座標），並拿它和實驗比對，就像專業人士必須做的那樣。"]} />
      </Section>
      <Section page="pytorch" id="build" n={2} title={sections[1].title}>
        <ul className="grid gap-3 sm:grid-cols-2">
          {TENSORIZER_LINKS.map((l) => (
            <li key={l.id}>
              <a href={tensorizerUrl(l.id)} target="_blank" rel="noreferrer" className="block h-full rounded-lg border border-gray-200 bg-white p-3 hover:border-(--lk-accent)">
                <span className="font-medium text-gray-900">{pick(l.title)} ↗</span>
                <span className="mt-0.5 block text-sm text-gray-600">{pick(l.why)}</span>
              </a>
            </li>
          ))}
        </ul>
      </Section>
    </Page>
  );
}
