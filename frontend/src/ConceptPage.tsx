/** One "learn from scratch" page (concepts.ts): one sentence, then numbered, illustrated sections, then sources. */
import { Callout, Figure, go, P, Page, RichText, Section, Sources, Table, useLang } from "@learnkit/web";
import type { ConceptPage as Concept, ConceptSection } from "./concepts";
import MoleculeViewer from "./MoleculeViewer";
import { findProblem } from "./problems";
import { useMolecules } from "./SkillsPage";

export default function ConceptPage({ page, focus, scrollRoot }: { page: Concept; focus: string | null; scrollRoot: string }) {
  const sections = [
    ...page.sections.map((s) => ({ id: s.id, title: s.title })),
  ];
  return (
    <Page id={page.id} scrollRoot={scrollRoot} focus={focus} sections={sections} title={page.title} intro={page.oneSentence} overline={page.id === "about" ? ["Concept", "概念"] : ["Learn from scratch", "從零開始學"]}>
      {page.sections.map((s, i) => (
        <Section key={s.id} page={page.id} id={s.id} n={i + 1} title={s.title}>
          <Body s={s} />
        </Section>
      ))}
      {page.note && <Note note={page.note} />}
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
      {s.sources.length > 0 && (
        <div className="mt-4 border-t border-gray-100 pt-3">
          <Sources items={s.sources} />
        </div>
      )}
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

function Note({ note }: { note: { title: readonly [string, string]; text: readonly [string, string] } }) {
  const { pick } = useLang();
  return (
    <details className="rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-600" data-testid="concept-note">
      <summary className="cursor-pointer text-gray-700">{pick(note.title)} ↓</summary>
      <p className="mt-2 leading-relaxed">
        <RichText text={pick(note.text)} />
      </p>
    </details>
  );
}
