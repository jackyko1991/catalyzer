/** One "learn from scratch" page (concepts.ts): one sentence, then numbered, illustrated sections, then sources. */
import { Callout, Figure, go, type L, P, Page, RichText, Section, Sources, Table, useLang } from "@learnkit/web";
import { type ConceptPage as Concept, type ConceptSection, STAGE_COUNT, STAGES } from "./concepts";
import MoleculeViewer from "./MoleculeViewer";
import { findProblem } from "./problems";
import { useMolecules } from "./SkillsPage";

const RECAP_TITLE: L = ["Recap, and where to go next", "回顧，以及接下來去哪裡"];

export default function ConceptPage({ page, focus, scrollRoot }: { page: Concept; focus: string | null; scrollRoot: string }) {
  const { pick } = useLang();
  const stage = STAGES[page.id];
  // the overline says where this page sits on the path, so ten tabs read as one route rather than ten leaflets
  const overline: L = stage
    ? [`Stage ${stage.n} of ${STAGE_COUNT} · ${stage.title[0]}`, `第 ${stage.n} 階段（共 ${STAGE_COUNT}）· ${stage.title[1]}`]
    : page.id === "about"
      ? ["Concept", "概念"]
      : ["Learn from scratch", "從零開始學"];
  const sections = [...page.sections.map((s) => ({ id: s.id, title: s.title })), ...(page.recap ? [{ id: "recap", title: RECAP_TITLE }] : [])];
  return (
    <Page id={page.id} scrollRoot={scrollRoot} focus={focus} sections={sections} title={page.title} intro={page.oneSentence} overline={overline}>
      {page.sections.map((s, i) => (
        <Section key={s.id} page={page.id} id={s.id} n={i + 1} title={s.title}>
          <Body s={s} />
        </Section>
      ))}
      {page.recap && (
        <Section page={page.id} id="recap" n={page.sections.length + 1} title={RECAP_TITLE}>
          <Recap page={page} />
        </Section>
      )}
      {page.note && <Note note={page.note} />}
      {stage && (
        <p className="text-center text-xs text-gray-500">
          <RichText text={pick(["The whole path: [from school chemistry to research](#/concept/path).", "完整路線：[從中學化學到研究](#/concept/path)。"])} />
        </p>
      )}
    </Page>
  );
}

/** Closes the page: every section's takeaway in order, the mistakes that undo them, then where to go next. */
function Recap({ page }: { page: Concept }) {
  const { pick } = useLang();
  return (
    <>
      <ol className="space-y-2" data-testid="recap-points">
        {page.sections.map((s, i) => (
          <li key={s.id} className="flex gap-3">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-600">{i + 1}</span>
            <span>
              <RichText text={pick(s.takeaway)} />
            </span>
          </li>
        ))}
      </ol>
      {page.recap!.mistakes.map((m, i) => (
        <div key={i} className="mt-3">
          <Callout kind="warn" title={m.title}>
            <RichText text={pick(m.text)} />
          </Callout>
        </div>
      ))}
      <p className="mt-3 border-t border-gray-100 pt-3">
        <RichText text={pick(page.recap!.next)} />
      </p>
    </>
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
      {/* the section lands on one sentence, then sends the reader to run something; the citations come last */}
      <p className="mt-4 border-l-2 border-(--lk-accent) bg-orange-50/50 py-1.5 pl-3 text-gray-800" data-testid="takeaway">
        <span className="mr-1.5 text-[11px] font-semibold tracking-wide text-(--lk-accent) uppercase">{pick(["In short", "一句話"])}</span>
        <RichText text={pick(s.takeaway)} />
      </p>
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
      {s.sources.length > 0 && (
        <div className="mt-4 border-t border-gray-100 pt-3">
          <Sources items={s.sources} />
        </div>
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
