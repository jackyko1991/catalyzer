/**
 * Draws what a problem's main.py returns (catalyzer/render.py): headline numbers first, then 2D structures, 3D
 * views, charts, tables and text. 2D drawings are SVG made by RDKit; they are shown through <img> (a data URL), so
 * nothing in them can run as script, whoever wrote the code that produced them.
 */
import { RichText, useLang } from "@learnkit/web";
import MoleculeViewer, { type Highlight, type ViewerModel } from "./MoleculeViewer";

type Pair = [string, string] | null;
export type ResultItem =
  | { kind: "metric"; label: Pair; value: string; unit: string; good: boolean | null }
  | { kind: "svg"; title: Pair; svg: string }
  | { kind: "mol3d"; title: Pair; molblock: string }
  | { kind: "pdb3d"; title: Pair; models: { pdb: string; colour: string }[]; highlight: Highlight[] }
  | { kind: "table"; title: Pair; head: Pair[]; rows: (string | number)[][] }
  | { kind: "bars"; title: Pair; labels: string[]; values: number[]; limits: (number | null)[] | null; colours: string[] | null; unit: string; vertical: boolean }
  | { kind: "text"; title: Pair; body: Pair; mono: boolean }
  | { kind: "link"; title: Pair; url: string; text: string };

/** wide: the whole row; tall: two rows on the left (a structure, with smaller cards stacked beside it) */
function Card({ title, wide, tall, children }: { title: Pair; wide?: boolean; tall?: boolean; children: React.ReactNode }) {
  const { pick } = useLang();
  return (
    <figure className={`min-w-0 rounded-lg border border-gray-200 bg-white p-3 ${wide ? "@2xl:col-span-2" : ""} ${tall ? "@2xl:row-span-2" : ""}`}>
      {title && (
        <figcaption className="mb-2 text-sm font-medium text-gray-700">
          <RichText text={pick(title)} />
        </figcaption>
      )}
      {children}
    </figure>
  );
}

function Bars({ item }: { item: Extract<ResultItem, { kind: "bars" }> }) {
  const max = Math.max(...item.values, ...(item.limits ?? []).map((l) => l ?? 0), 1e-9);
  const colour = (i: number) => item.colours?.[i] ?? "var(--lk-accent)";
  if (item.vertical) {
    const n = item.values.length;
    return (
      <div>
        <div className="flex h-40 items-end gap-px" role="img" aria-label={item.labels.map((l, i) => `${l}: ${item.values[i]}`).join(", ")}>
          {item.values.map((v, i) => (
            <div key={i} className="min-w-0 flex-1 rounded-t-sm" style={{ height: `${(100 * v) / max}%`, background: colour(i) }} title={`${item.labels[i]}: ${v}${item.unit ? " " + item.unit : ""}`} />
          ))}
        </div>
        <div className="mt-1 flex justify-between text-xs text-gray-500">
          <span>{item.labels[0]}</span>
          <span>{n > 1 && item.labels[n - 1]}</span>
        </div>
      </div>
    );
  }
  return (
    <ul className="space-y-1.5">
      {item.values.map((v, i) => {
        const limit = item.limits?.[i];
        return (
          <li key={i} className="grid grid-cols-[minmax(0,9rem)_1fr_auto] items-center gap-2 text-xs">
            <span className="truncate text-gray-700" title={item.labels[i]}>
              {item.labels[i]}
            </span>
            <div className="relative h-3.5 rounded-full bg-gray-100">
              <div className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${Math.min(100, (100 * v) / max)}%`, background: colour(i) }} />
              {limit != null && <div className="absolute -inset-y-1 w-0.5 bg-red-600" style={{ left: `${Math.min(100, (100 * limit) / max)}%` }} />}
            </div>
            <span className="font-mono text-gray-600 tabular-nums">
              {Number.isInteger(v) ? v : v.toFixed(3)}
              {item.unit && ` ${item.unit}`}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

export default function ResultsView({ items }: { items: ResultItem[] }) {
  const { pick } = useLang();
  const metrics = items.filter((x) => x.kind === "metric");
  const rest = items.filter((x) => x.kind !== "metric");
  return (
    <div className="space-y-3" data-testid="results-view">
      {metrics.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {metrics.map((m, i) => (
            <div key={i} className="min-w-[8rem] rounded-lg border border-gray-200 bg-white px-3 py-2" data-testid="result-metric">
              <p className="text-xs text-gray-500">{m.label && pick(m.label)}</p>
              <p className={`text-lg font-semibold ${m.good === true ? "text-green-700" : m.good === false ? "text-red-700" : "text-gray-900"}`}>
                {m.value}
                {m.unit && <span className="ml-1 text-sm font-normal text-gray-500">{m.unit}</span>}
              </p>
            </div>
          ))}
        </div>
      )}
      <div className="@container">
      <div className="grid grid-flow-row-dense gap-3 @2xl:grid-cols-2">
        {rest.map((item, i) => {
          switch (item.kind) {
            case "svg":
              return (
                <Card key={i} title={item.title} tall>
                  <img src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(item.svg)}`} alt={item.title ? pick(item.title) : ""} className="mx-auto aspect-[23/16] w-full max-w-lg object-contain" data-testid="result-svg" />
                </Card>
              );
            case "mol3d":
              return (
                <Card key={i} title={item.title} tall>
                  <MoleculeViewer models={[{ data: item.molblock, format: "sdf", style: "stick", colour: "element" }]} label={item.title ? pick(item.title) : "3D"} height={300} />
                </Card>
              );
            case "pdb3d": {
              const models: ViewerModel[] = item.models.map((m) => ({
                data: m.pdb,
                format: "pdb",
                style: "cartoon",
                colour: m.colour === "plddt" || m.colour === "element" ? m.colour : { colour: m.colour },
              }));
              return (
                <Card key={i} title={item.title} wide>
                  <MoleculeViewer models={models} highlight={item.highlight} label={item.title ? pick(item.title) : "3D"} height={380} />
                </Card>
              );
            }
            case "table":
              return (
                <Card key={i} title={item.title}>
                  <div className="max-h-72 overflow-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="sticky top-0 bg-gray-50 text-gray-600">
                        <tr>{item.head.map((h, k) => <th key={k} className="px-2 py-1 font-medium">{h && pick(h)}</th>)}</tr>
                      </thead>
                      <tbody>
                        {item.rows.map((row, r) => (
                          <tr key={r} className="border-t border-gray-100">
                            {row.map((c, k) => (
                              <td key={k} className="px-2 py-1 font-mono text-gray-800">
                                {c}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              );
            case "bars":
              return (
                <Card key={i} title={item.title} wide={item.vertical}>
                  <Bars item={item} />
                </Card>
              );
            case "text":
              return (
                <Card key={i} title={item.title} wide={item.mono}>
                  {item.mono ? (
                    <pre className="max-h-72 overflow-auto font-mono text-xs leading-relaxed break-all whitespace-pre-wrap text-gray-800">{item.body && pick(item.body)}</pre>
                  ) : (
                    <p className="text-sm text-gray-700">{item.body && <RichText text={pick(item.body)} />}</p>
                  )}
                </Card>
              );
            case "link":
              return (
                <Card key={i} title={item.title} wide>
                  <a href={item.url} target="_blank" rel="noreferrer" className="font-mono text-xs break-all text-(--lk-accent) hover:underline" data-testid="result-link">
                    {item.text} ↗
                  </a>
                </Card>
              );
            default:
              return null;
          }
        })}
      </div>
      </div>
    </div>
  );
}
