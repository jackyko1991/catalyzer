import {
  go,
  READING_TABS,
  RichText,
  routeHash,
  SeriesPage,
  seriesText,
  Shell,
  Timeline,
  useLang,
  useRoute,
  type ShellPage,
} from "@learnkit/web";
import { ERAS, HISTORY } from "./history";
import ConceptPage from "./ConceptPage";
import { CONCEPTS } from "./concepts";
import HomePage from "./HomePage";
import LibraryPage from "./LibraryPage";
import ProblemsPage from "./ProblemsPage";
import SkillsPage, { SKILL_TAB_TITLES, SKILL_TABS } from "./SkillsPage";
import { STRINGS } from "./strings";

const REPO_URL = "https://github.com/jackyko1991/catalyzer";
const SCROLL = "cz-scroll";
const HOME = "home";
/** Concept's sub-pages: learning from scratch, then History (the only one built so far) */
const CONCEPT_TABS = [
  "about",
  "path",
  "molecule",
  "data",
  "pdb",
  "proteins",
  "energy",
  "quantum",
  "ml",
  "ai",
  "history",
] as const;
/** Further reading: books & papers, then the learnkit series (Code labs, Explorables) */
const READING = ["books", "labs", "explorables"] as const;

export default function App() {
  const { t, lang, pick } = useLang();
  const route = useRoute(HOME);
  const pages: ShellPage[] = [
    { id: "problems", label: t("page.problems") },
    { id: "library", label: pick(["Library", "資料庫"]) },
    {
      id: "concept",
      label: t("page.concept"),
      tabs: CONCEPT_TABS.map((id) => ({ id, label: t(`tab.${id}`) })),
      defaultTab: "about",
    },
    {
      id: "skills",
      label: t("page.skills"),
      tabs: SKILL_TABS.map((id) => ({ id, label: pick(SKILL_TAB_TITLES[id]) })),
      defaultTab: "viewer",
    },
    { id: "agents", label: t("page.agents") },
    {
      id: "reading",
      label: t("page.reading"),
      tabs: READING.map((id) => ({
        id,
        label:
          id === "books"
            ? t("reading.books")
            : seriesText(READING_TABS[id], lang),
      })),
      defaultTab: "books",
    },
  ];
  const concept = route.page === "concept";
  const conceptTab = CONCEPT_TABS.includes(route.tab as never)
    ? route.tab!
    : "about";

  return (
    <Shell
      brand={{
        name: (
          <>
            Cataly<span className="text-orange-200">zer</span>
          </>
        ),
        tagline: t("tagline"),
        logo: `${import.meta.env.BASE_URL}favicon.svg`,
        home: () => go(HOME),
      }}
      pages={pages}
      route={route}
      scrollId={SCROLL}
      footer={
        <>
          <a
            href="https://buymeacoffee.com/jackyko1991"
            target="_blank"
            rel="noreferrer"
            className="rounded-full bg-yellow-300 px-2.5 py-0.5 font-medium text-gray-900 hover:bg-yellow-400"
          >
            ☕ {t("coffee")}
          </a>
          <span>{t("footer.licence")}</span>
          <a
            href={REPO_URL}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 hover:text-gray-900"
          >
            <svg
              viewBox="0 0 16 16"
              className="h-3.5 w-3.5"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
            </svg>
            GitHub
          </a>
        </>
      }
    >
      {concept && conceptTab === "history" ? (
        <HistoryPage section={route.section} />
      ) : concept ? (
        <ConceptPage
          key={conceptTab}
          page={CONCEPTS.find((c) => c.id === conceptTab)!}
          focus={route.section}
          scrollRoot={SCROLL}
        />
      ) : route.page === "workspace" ? (
        <ProblemsPage name="workspace" />
      ) : route.page === "library" ? (
        <LibraryPage />
      ) : route.page === "problems" ? (
        <ProblemsPage name={route.tab} />
      ) : route.page === "skills" ? (
        <SkillsPage
          key={route.tab}
          tab={route.tab ?? "viewer"}
          section={route.section}
          scrollRoot={SCROLL}
        />
      ) : route.page === "agents" ? (
        <Coming title={t("page.agents")} body={t("agents.body")} />
      ) : route.page === "reading" &&
        (route.tab === "labs" || route.tab === "explorables") ? (
        <SeriesPage
          key={route.tab}
          kind={route.tab === "labs" ? "lab" : "explorable"}
          current="catalyzer"
          lang={lang}
          onOther={() =>
            go("reading", route.tab === "labs" ? "explorables" : "labs")
          }
        />
      ) : route.page === "reading" ? (
        <Coming title={t("reading.books")} body={t("books.body")} />
      ) : (
        <HomePage />
      )}
    </Shell>
  );
}

function HistoryPage({ section }: { section: string | null }) {
  const { t } = useLang();
  return (
    <div data-testid="history-page">
      <Timeline
        eras={ERAS}
        cards={HISTORY}
        scrollRoot={SCROLL}
        focus={section}
        labels={{
          contents: STRINGS.timeline,
          sources: STRINGS.sources,
          open: STRINGS["timeline.open"],
        }}
        // keep the address shareable without a new history entry (no hashchange, so no re-render)
        onPick={(id) =>
          history.replaceState(null, "", routeHash("concept", "history", id))
        }
        header={
          <>
            <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
              {t("history.title")}
            </h1>
            <p className="mt-3 text-gray-600">
              <RichText text={t("history.intro")} />
            </p>
          </>
        }
      />
    </div>
  );
}

/** A page still being built: what it will hold, and a way to the History */
function Coming({ title, body }: { title: string; body: string }) {
  const { t } = useLang();
  return (
    <div
      className="mx-auto max-w-2xl px-5 py-16 text-center"
      data-testid="coming"
    >
      <p className="text-sm font-medium tracking-wide text-(--lk-accent) uppercase">
        {t("coming.title")}
      </p>
      <h1 className="mt-2 text-2xl font-semibold text-gray-900">{title}</h1>
      <p className="mt-4 text-left text-gray-600">
        <RichText text={body} />
      </p>
      <button
        onClick={() => go("concept", "history")}
        className="mt-6 rounded-md bg-(--lk-accent) px-4 py-2 text-sm font-medium text-white hover:opacity-90"
      >
        {t("coming.history")} →
      </button>
    </div>
  );
}
