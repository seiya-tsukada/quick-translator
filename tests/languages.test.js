import { test } from "node:test";
import assert from "node:assert/strict";
import { loadExtension, CORE } from "./helpers.js";

const g = loadExtension(CORE);
const L = g.QuickLensLanguages;
const { LANGUAGES } = g.QUICKLENS_CONFIG;

test("every supported language has prompt names and engine codes", () => {
  for (const [code, lang] of Object.entries(LANGUAGES)) {
    assert.ok(lang.nameEn && lang.nameJa && lang.nativeName, code);
    assert.ok(lang.builtin, `${code} builtin`);
    assert.ok(lang.deeplTarget && lang.deeplSource, `${code} deepl`);
  }
});

test("promptName converts codes to names (never a bare code)", () => {
  assert.equal(L.promptName("ja"), "Japanese (日本語)");
  assert.equal(L.promptName("en"), "English (English)");
  assert.equal(L.promptName("zh-CN"), "Simplified Chinese (简体中文)");
  assert.equal(L.promptName("auto"), null);
  assert.equal(L.promptName("xx"), null);
});

test("displayName follows the UI locale", () => {
  assert.equal(L.displayName("ja", "ja"), "日本語");
  assert.equal(L.displayName("ja", "en-US"), "Japanese");
  assert.equal(L.displayName("ko", "ja-JP"), "韓国語");
});

test("DeepL code mapping", () => {
  assert.equal(L.toDeeplTarget("zh-CN"), "ZH-HANS");
  assert.equal(L.toDeeplTarget("zh-TW"), "ZH-HANT");
  assert.equal(L.toDeeplTarget("en"), "EN-US");
  assert.equal(L.toDeeplTarget("pt"), "PT-BR");
  assert.equal(L.toDeeplSource("zh-CN"), "ZH");
  assert.equal(L.toDeeplSource("en"), "EN");
  assert.equal(L.toDeeplSource("auto"), null);
});

test("Translator API code mapping", () => {
  assert.equal(L.toBuiltin("zh-CN"), "zh");
  assert.equal(L.toBuiltin("zh-TW"), "zh-Hant");
  assert.equal(L.toBuiltin("ja"), "ja");
});

test("detected language tags are normalised", () => {
  assert.equal(L.normalizeDetected("zh-Hant-TW"), "zh-Hant");
  assert.equal(L.normalizeDetected("zh-CN"), "zh");
  assert.equal(L.normalizeDetected("zh"), "zh");
  assert.equal(L.normalizeDetected("pt-BR"), "pt");
  assert.equal(L.normalizeDetected("en"), "en");
  assert.equal(L.normalizeDetected("und"), null);
  assert.equal(L.normalizeDetected(""), null);
});
