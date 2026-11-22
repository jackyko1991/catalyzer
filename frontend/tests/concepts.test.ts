// The Concept pages, the problem data and the open-library map hold together. Run: npm test
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";
import { CONCEPTS } from "../src/concepts.ts";
import problems from "../src/generated/problems.json" with { type: "json" };

const here = (p: string) => new URL(`../${p}`, import.meta.url);
const filled = (row: readonly string[]) => row.length === 2 && row.every((s) => s.trim().length > 0);
const lines = (s: string) => s.split("\n").map((l) => l.trim()).filter(Boolean);

test("every concept text is in English and Traditional Chinese", () => {
  for (const c of CONCEPTS) {
    assert.ok(filled(c.title) && filled(c.oneSentence), c.id);
    for (const s of c.sections) {
      assert.ok(filled(s.title), `${c.id}/${s.id}`);
      for (const p of s.paragraphs) assert.ok(filled(p), `${c.id}/${s.id}`);
      if (s.figure) assert.ok(filled(s.figure.caption), `${c.id}/${s.id} caption`);
      if (s.table) for (const r of [s.table.head, ...s.table.rows]) assert.ok(r.every(filled), `${c.id}/${s.id} table`);
      if (s.callout) assert.ok(filled(s.callout.title) && filled(s.callout.text));
    }
    for (const m of c.mirror) assert.ok(filled(m.text), `${c.id} mirror`);
    assert.ok(c.sources.length && c.sources.every((s) => s.url.startsWith("https://")), `${c.id} sources`);
  }
});

test("the natural-language ↔ code rows quote tested code exactly", () => {
  for (const c of CONCEPTS)
    for (const m of c.mirror) {
      const source = lines(readFileSync(here(m.from), "utf8"));
      const code = lines(m.code);
      const found = source.some((_, i) => code.every((l, k) => source[i + k] === l));
      assert.ok(found, `${c.id}: not in ${m.from}:\n${m.code}`);
    }
});

test("pictures exist and linked problems are real", () => {
  const names = new Set(problems.map((p) => p.id.split("/")[1]));
  for (const c of CONCEPTS)
    for (const s of c.sections) {
      if (s.figure && "src" in s.figure) assert.ok(existsSync(here(`public/${s.figure.src}`)), s.figure.src);
      for (const p of s.problems ?? []) assert.ok(names.has(p), `${c.id}/${s.id}: no problem ${p}`);
    }
});

test("problem data is complete in both languages", () => {
  assert.ok(problems.length >= 12);
  for (const p of problems) {
    assert.ok(filled(p.title) && filled(p.summary), p.id);
    assert.ok(p.mirror.length > 0 && p.mirror.every((m) => filled(m.text) && m.code.trim()), p.id);
    assert.ok(existsSync(here(`public/${p.picture}`)), p.picture);
  }
});
