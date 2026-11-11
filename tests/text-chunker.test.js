import { test } from "node:test";
import assert from "node:assert/strict";
import { loadExtension } from "./helpers.js";

const { QuickLensChunker: C } = loadExtension(["lib/text-chunker.js"]);
const identity = async (s) => s;

function longEnglish(paragraphs, sentencesPer) {
  const paras = [];
  for (let p = 0; p < paragraphs; p++) {
    const s = [];
    for (let i = 0; i < sentencesPer; i++) s.push(`Paragraph ${p} sentence ${i} talks about extensions and translation quality.`);
    paras.push(s.join(" "));
  }
  return paras.join("\n\n");
}

test("every chunk respects maxChars", () => {
  const text = longEnglish(6, 20);
  assert.ok(text.length > 3000);
  for (const chunk of C.chunkText(text, 500)) assert.ok(chunk.length <= 500, `chunk of ${chunk.length}`);
});

test("identity translation round-trips English text with line structure (3000+ chars)", async () => {
  const text = `  Title line\n\n${longEnglish(5, 15)}\r\n- bullet one\n- bullet two\n\n\nEnd.  `;
  assert.ok(text.length > 3000);
  const out = await C.translateInChunks(text, 400, identity);
  assert.equal(out, text);
});

test("identity translation round-trips Japanese text without inserting spaces", async () => {
  const para = "これは拡張機能のテストです。長い文章でも改行構造を保ちます！本当に？".repeat(40);
  const text = `${para}\n${para}`;
  const out = await C.translateInChunks(text, 300, identity);
  assert.equal(out, text);
  assert.ok(C.chunkText(text, 300).every((c) => c.length <= 300));
});

test("a single sentence longer than maxChars is hard-split", async () => {
  const text = "x".repeat(2500);
  const chunks = C.chunkText(text, 1000);
  assert.deepEqual([...chunks].map((c) => c.length), [1000, 1000, 500]);
  assert.equal(await C.translateInChunks(text, 1000, identity), text);
});

test("paragraph separators are kept verbatim around translated chunks", async () => {
  const out = await C.translateInChunks("a\n\nb\nc", 100, async (s) => s.toUpperCase());
  assert.equal(out, "A\n\nB\nC");
});

test("translation that drops the inter-sentence space gets it back", async () => {
  const text = "One. Two. Three.";
  const out = await C.translateInChunks(text, 6, async (s) => s.trim());
  assert.equal(out, "One. Two. Three.");
});

test("progress callback reports done/total", async () => {
  const calls = [];
  await C.translateInChunks("a\nb\nc", 10, identity, (d, n) => calls.push([d, n]));
  assert.deepEqual(calls, [[1, 3], [2, 3], [3, 3]]);
});

test("empty and whitespace-only input", async () => {
  assert.equal(await C.translateInChunks("", 10, identity), "");
  assert.equal(await C.translateInChunks(" \n ", 10, identity), " \n ");
});
