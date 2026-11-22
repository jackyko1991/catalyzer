/**
 * Live search of the public databases, straight from the browser (each allows it: CORS *):
 * - PubChem: names (autocomplete), CIDs or SMILES → compounds with formula and mass; 2D image and 3D conformer;
 * - RCSB PDB: full-text search → entries with title, method, resolution, year; the structure file for 3D;
 * - UniProt (reviewed entries) → AlphaFold DB models; the model file for 3D.
 * Results have the same shape as the curated Library entries, so the page shows both alike.
 */
import type { LibraryEntry } from "./LibraryPage";

const PUG = "https://pubchem.ncbi.nlm.nih.gov/rest/pug";
const json = async (url: string, init?: RequestInit) => {
  const r = await fetch(url, init);
  if (!r.ok) throw new Error(`${r.status} ${url}`);
  return r.json();
};

export type LiveEntry = Omit<LibraryEntry, "code" | "licence" | "licence_url"> & { live: true };

const looksLikeSmiles = (q: string) => !/\s/.test(q) && /[=#()[\]@\\/]|[a-z][0-9]|^[CNOS][CNOScnos0-9()=#]+$/.test(q) && q.length > 2;

interface Props {
  CID: number;
  Title?: string;
  SMILES?: string;
  MolecularFormula?: string;
  MolecularWeight?: string;
}

const molecule = (p: Props): LiveEntry => ({
  live: true,
  kind: "molecules",
  key: `cid:${p.CID}`,
  id: `CID ${p.CID}`,
  name: [p.Title ?? `CID ${p.CID}`, p.Title ?? `CID ${p.CID}`],
  detail: `${p.MolecularFormula ?? ""} · ${Number(p.MolecularWeight ?? 0).toFixed(2)} g/mol`,
  url: `https://pubchem.ncbi.nlm.nih.gov/compound/${p.CID}`,
  smiles: p.SMILES,
});

/** compounds matching a name, a CID or a SMILES string (up to 8) */
export async function searchPubChem(q: string, signal?: AbortSignal): Promise<LiveEntry[]> {
  const props = "property/Title,SMILES,MolecularFormula,MolecularWeight/JSON";
  let cids: number[] = [];
  if (/^\d+$/.test(q)) cids = [Number(q)];
  else if (looksLikeSmiles(q)) {
    const d = await json(`${PUG}/compound/smiles/cids/JSON`, { method: "POST", body: new URLSearchParams({ smiles: q }), signal });
    cids = (d.IdentifierList?.CID ?? []).filter((c: number) => c > 0);
  } else {
    const names: string[] = (await json(`https://pubchem.ncbi.nlm.nih.gov/rest/autocomplete/compound/${encodeURIComponent(q)}/json?limit=8`, { signal })).dictionary_terms?.compound ?? [];
    // one lookup per name, three at a time (PubChem asks for at most five requests a second)
    for (let i = 0; i < names.length && cids.length < 8; i += 3) {
      const found = await Promise.all(
        names.slice(i, i + 3).map((n) => json(`${PUG}/compound/name/${encodeURIComponent(n)}/cids/JSON`, { signal }).then((d) => d.IdentifierList?.CID?.[0] as number | undefined, () => undefined)),
      );
      for (const c of found) if (c && !cids.includes(c)) cids.push(c);
    }
  }
  if (!cids.length) return [];
  const d = await json(`${PUG}/compound/cid/${cids.slice(0, 8).join(",")}/${props}`, { signal });
  return (d.PropertyTable?.Properties ?? []).map(molecule);
}

/** PDB entries matching words or an id (up to 10) */
export async function searchPDB(q: string, signal?: AbortSignal): Promise<LiveEntry[]> {
  let ids: string[];
  if (/^\d[a-z0-9]{3}$/i.test(q)) ids = [q.toUpperCase()];
  else {
    const query = { query: { type: "terminal", service: "full_text", parameters: { value: q } }, return_type: "entry", request_options: { paginate: { start: 0, rows: 10 } } };
    const d = await json(`https://search.rcsb.org/rcsbsearch/v2/query?json=${encodeURIComponent(JSON.stringify(query))}`, { signal }).catch(() => ({ result_set: [] }));
    ids = (d.result_set ?? []).map((x: { identifier: string }) => x.identifier);
  }
  if (!ids.length) return [];
  const gql = `{entries(entry_ids:${JSON.stringify(ids)}){rcsb_id struct{title} exptl{method} rcsb_entry_info{resolution_combined deposited_atom_count} rcsb_accession_info{initial_release_date}}}`;
  const d = await json(`https://data.rcsb.org/graphql?query=${encodeURIComponent(gql)}`, { signal });
  return (d.data?.entries ?? []).filter(Boolean).map(
    (e: { rcsb_id: string; struct?: { title?: string }; exptl?: { method?: string }[]; rcsb_entry_info?: { resolution_combined?: number[]; deposited_atom_count?: number }; rcsb_accession_info?: { initial_release_date?: string } }): LiveEntry => {
      const res = e.rcsb_entry_info?.resolution_combined?.[0];
      const title = e.struct?.title ?? e.rcsb_id;
      return {
        live: true,
        kind: "structures",
        key: `pdb:${e.rcsb_id}`,
        id: `PDB ${e.rcsb_id}`,
        name: [title, title],
        detail: [e.exptl?.[0]?.method?.toLowerCase(), res ? `${res} Å` : null, e.rcsb_accession_info?.initial_release_date?.slice(0, 4), e.rcsb_entry_info?.deposited_atom_count ? `${e.rcsb_entry_info.deposited_atom_count} atoms` : null].filter(Boolean).join(" · "),
        url: `https://www.rcsb.org/structure/${e.rcsb_id}`,
      };
    },
  );
}

/** AlphaFold DB models of reviewed UniProt proteins matching words or an accession (up to 10) */
export async function searchAlphaFold(q: string, signal?: AbortSignal): Promise<LiveEntry[]> {
  const query = /^[A-Z][0-9][A-Z0-9]{3}[0-9]([A-Z0-9]{4})?$/i.test(q) ? `accession:${q.toUpperCase()}` : `(${q}) AND reviewed:true`;
  const d = await json(`https://rest.uniprot.org/uniprotkb/search?query=${encodeURIComponent(query)}&size=10&fields=accession,protein_name,organism_name,length`, { signal });
  return (d.results ?? []).map(
    (r: { primaryAccession: string; proteinDescription?: { recommendedName?: { fullName?: { value?: string } }; submissionNames?: { fullName?: { value?: string } }[] }; organism?: { scientificName?: string }; sequence?: { length?: number } }): LiveEntry => {
      const name = r.proteinDescription?.recommendedName?.fullName?.value ?? r.proteinDescription?.submissionNames?.[0]?.fullName?.value ?? r.primaryAccession;
      return {
        live: true,
        kind: "predictions",
        key: `afdb:${r.primaryAccession}`,
        id: `UniProt ${r.primaryAccession}`,
        name: [name, name],
        detail: `${r.organism?.scientificName ?? ""} · ${r.sequence?.length ?? "?"} aa`,
        url: `https://alphafold.ebi.ac.uk/entry/${r.primaryAccession}`,
      };
    },
  );
}

/** what the 3D viewer shows for an entry: the file text and its format */
export async function structureFor(e: Pick<LibraryEntry, "kind" | "key">): Promise<{ data: string; format: "pdb" | "sdf" }> {
  const [kind, id] = e.key.split(":");
  if (kind === "cid") {
    const sdf = await fetch(`${PUG}/compound/cid/${id}/SDF?record_type=3d`);
    if (sdf.ok) return { data: await sdf.text(), format: "sdf" };
    const flat = await fetch(`${PUG}/compound/cid/${id}/SDF`); // no 3D conformer (e.g. large or flexible): the 2D one
    return { data: await flat.text(), format: "sdf" };
  }
  if (kind === "pdb") {
    const r = await fetch(`https://files.rcsb.org/download/${id}.pdb`);
    if (!r.ok) throw new Error(`${id}: no PDB-format file (very large entries come only as mmCIF)`);
    return { data: await r.text(), format: "pdb" };
  }
  const entry = (await json(`https://alphafold.ebi.ac.uk/api/prediction/${id}`))[0];
  return { data: await (await fetch(entry.pdbUrl)).text(), format: "pdb" };
}

/** the 2D picture of a compound (PubChem's drawing) */
export const pubchemImage = (key: string) => (key.startsWith("cid:") ? `${PUG}/compound/cid/${key.slice(4)}/PNG?image_size=300x300` : null);
