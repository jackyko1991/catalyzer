/** One "learn from scratch" page (concepts.ts): one sentence, then numbered sections, then the ideas in two languages. */
import { python } from "@codemirror/lang-python";
import { Callout, CodeBlock, Figure, go, P, Page, RichText, Section, Sources, Table, type L, useLang } from "@learnkit/web";
import type { ConceptPage as Concept, ConceptSection } from "./concepts";
import MoleculeViewer from "./MoleculeViewer";
import { findProblem } from "./problems";
import { useMolecules } from "./SkillsPage";

const PY = python();

export default function ConceptPage({ page, focus, scrollRoot }: { page: Concept; focus: string | null; scrollRoot: string }) {
  const { pick } = useLang();
  const sections = [
    ...page.sections.map((s) => ({ id: s.id, title: s.title })),
    { id: "mirror", title: ["In two languages: words and Python", "兩種語言：文字與 Python"] as L },
    { id: "sources", title: ["Sources", "資料來源"] as L },
  ];
  return (
    <Page id={page.id} scrollRoot={scrollRoot} focus={focus} sections={sections} title={page.title} intro={page.oneSentence} overline={["Learn from scratch", "從零開始學"]}>
      {page.sections.map((s, i) => (
        <Section key={s.id} page={page.id} id={s.id} n={i + 1} title={s.title}>
          <Body s={s} />
        </Section>
      ))}
      <Section page={page.id} id="mirror" n={page.sections.length + 1} title={sections[sections.length - 2].title}>
        <P t={["The same ideas said twice: once in words, once in code that runs (it is quoted from the tested examples in Coding Skills).", "同樣的想法說兩次：一次用文字，一次用可以執行的程式碼（引自「程式技巧」中經過測試的範例）。"]} />
        <ol className="mt-3 space-y-3">
          {page.mirror.map((m, i) => (
            <li key={i} className="grid gap-3 rounded-lg border border-gray-200 bg-white p-3 md:grid-cols-2">
              <p className="text-gray-700">
                <RichText text={pick(m.text)} />
              </p>
              <div className="min-w-0 overflow-x-auto text-sm">
                <CodeBlock code={m.code} language={PY} />
              </div>
            </li>
          ))}
        </ol>
      </Section>
      <Section page={page.id} id="sources" n={page.sections.length + 2} title={sections[sections.length - 1].title}>
        <Sources items={page.sources} />
      </Section>
    </Page>
  );
}

function Body({ s }: { s: ConceptSection }) {
  const { pick } = useLang();
  const mols = useMolecules();
  const caffeine = mols.find((m) => m.id === "caffeine");
  return (
    <>
      {s.paragraphs.map((p, i) => (
        <P key={i} t={p} />
      ))}
      {s.callout && (
        <div className="mt-3">
          <Callout kind={s.callout.kind} title={s.callout.title}>
            <RichText text={pick(s.callout.text)} />
          </Callout>
        </div>
      )}
      {s.figures?.map((f, i) =>
        "src" in f ? (
          <Figure key={i} caption={f.caption}>
            <img src={`${import.meta.env.BASE_URL}${f.src}`} alt={pick(f.caption)} className="mx-auto w-full max-w-lg" loading="lazy" />
          </Figure>
        ) : (
          <Figure key={i} caption={f.caption}>
            {f.viewer === "caffeine" ? (
              caffeine ? (
                <MoleculeViewer models={[{ data: caffeine.molblock, format: "sdf", style: "stick", colour: "element" }]} label={pick(f.caption)} height={300} />
              ) : (
                <div className="h-[300px] w-full" />
              )
            ) : (
              <MoleculeViewer
                models={[
                  f.viewer === "crambin"
                    ? { url: "structures/1crn.pdb", format: "pdb", style: "cartoon", colour: { colour: "#0f766e" } }
                    : { url: "structures/AF-P01542-F1-model_v6.aligned.pdb", format: "pdb", style: "cartoon", colour: "plddt" },
                ]}
                label={pick(f.caption)}
                height={300}
              />
            )}
          </Figure>
        ),
      )}
      {s.table && <Table head={s.table.head} rows={s.table.rows} />}
      {s.problems && (
        <p className="mt-3 flex flex-wrap items-center gap-2 text-sm text-gray-500">
          {pick(["Practise:", "練習："])}
          {s.problems.map((name) => {
            const p = findProblem(name)!;
            return (
              <button key={name} onClick={() => go("problems", name)} className="rounded-full bg-orange-50 px-3 py-0.5 text-orange-800 ring-1 ring-orange-200 hover:bg-orange-100">
                {pick(p.title)}
              </button>
            );
          })}
        </p>
      )}
    </>
  );
}
