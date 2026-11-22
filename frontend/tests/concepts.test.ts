// The Concept pages, the problem data and the open-library map hold together. Run: npm test
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { test } from "node:test";
import { CONCEPTS } from "../src/concepts.ts";
import problems from "../src/generated/problems.json" with { type: "json" };

const here = (p: string) => new URL(`../${p}`, import.meta.url);
const filled = (row: readonly string[]) => row.length === 2 && row.every((s) => s.trim().length > 0);

test("every concept text is in English and Traditional Chinese", () => {
  for (const c of CONCEPTS) {
    assert.ok(filled(c.title) && filled(c.oneSentence), c.id);
    for (const s of c.sections) {
      assert.ok(filled(s.title), `${c.id}/${s.id}`);
      for (const p of s.paragraphs) assert.ok(filled(p), `${c.id}/${s.id}`);
      for (const f of s.figures ?? []) assert.ok(filled(f.caption), `${c.id}/${s.id} caption`);
      if (s.table) for (const r of [s.table.head, ...s.table.rows]) assert.ok(r.every(filled), `${c.id}/${s.id} table`);
      if (s.callout) assert.ok(filled(s.callout.title) && filled(s.callout.text));
    }
    assert.ok(c.sources.length && c.sources.every((s) => s.url.startsWith("https://")), `${c.id} sources`);
  }
});

test("pictures exist and linked problems are real", () => {
  const names = new Set(problems.map((p) => p.id.split("/")[1]));
  for (const c of CONCEPTS)
    for (const s of c.sections) {
      for (const f of s.figures ?? []) if ("src" in f) assert.ok(existsSync(here(`public/${f.src}`)), f.src);
      assert.ok((s.figures ?? []).length > 0, `${c.id}/${s.id}: every concept section has a picture`);
      for (const p of s.problems ?? []) assert.ok(names.has(p), `${c.id}/${s.id}: no problem ${p}`);
    }
});

test("problem data is complete in both languages", () => {
  assert.ok(problems.length >= 12);
  for (const p of problems) {
    assert.ok(filled(p.title) && filled(p.summary), p.id);
    assert.ok(p.solution.trim() && p.main.trim() && p.params.length > 0, `${p.id}: runnable`);
    assert.ok(existsSync(here(`public/${p.results}`)), p.results);
    assert.ok(existsSync(here(`public/${p.picture}`)), p.picture);
  }
});

test("every Catalyzer problem in learnkit's interlinks exists, under its title", async () => {
  const { INTERLINKS } = await import("../../vendor/learnkit/web/src/interlinks.ts");
  const byName = new Map(problems.map((p) => [p.id.split("/")[1], p]));
  const refs = INTERLINKS.flatMap((l) => [l.a, l.b]).filter((r) => r.site === "catalyzer");
  assert.ok(refs.length > 0);
  for (const r of refs) {
    const p = byName.get(r.id);
    assert.ok(p, `no Catalyzer problem ${r.id}`);
    assert.deepEqual([r.title.en, r.title["zh-Hant"]], p.title, `${r.id}: title out of date in interlinks.ts`);
  }
});
