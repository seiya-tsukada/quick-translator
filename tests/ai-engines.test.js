import { test } from "node:test";
import assert from "node:assert/strict";
import { loadExtension, CORE } from "./helpers.js";

const g = loadExtension([...CORE, "lib/ai-engines.js"]);
const AI = g.QuickLensAI;
const { CODES, classifyHttpError } = g.QuickLensErrors;

function fakeFetch(status, json, capture) {
  return async (url, init) => {
    capture.url = url;
    capture.init = init;
    capture.body = JSON.parse(init.body);
    return {
      ok: status >= 200 && status < 300,
      status,
      json: async () => json,
      text: async () => JSON.stringify(json)
    };
  };
}

test("system prompt uses language names, not codes", () => {
  const p = AI.buildSystemPrompt({ sourceLang: "en", targetLang: "ja", tone: "natural" });
  assert.match(p, /from English \(English\) into Japanese \(日本語\)/);
  assert.doesNotMatch(p, /\bja\b/);
  const auto = AI.buildSystemPrompt({ sourceLang: "auto", targetLang: "zh-CN", tone: "summary" });
  assert.match(auto, /detect the source language/);
  assert.match(auto, /Simplified Chinese/);
  assert.doesNotMatch(auto, /zh-CN/);
});

test("Gemini engine has been removed", () => {
  assert.equal(AI.ENGINES.gemini, undefined);
  assert.deepEqual(Object.keys(AI.ENGINES).sort(), ["deepl", "openai"]);
  assert.throws(() => AI.translate("gemini", { text: "a" }), (e) => e.code === CODES.UNKNOWN);
  assert.equal(g.QUICKLENS_CONFIG.API.GEMINI_MODEL, undefined);
});

test("OpenAI: bearer auth, source language in prompt", async () => {
  const cap = {};
  const res = await AI.ENGINES.openai({
    text: "Hola", sourceLang: "es", targetLang: "en", tone: "business", apiKey: "sk-test",
    fetchImpl: fakeFetch(200, { choices: [{ finish_reason: "stop", message: { content: " Hello " } }] }, cap)
  });
  assert.equal(res.translatedText, "Hello");
  assert.equal(cap.init.headers.Authorization, "Bearer sk-test");
  assert.match(cap.body.messages[0].content, /from Spanish \(Español\) into English/);
  assert.equal(cap.body.messages[1].content, "Hola");
});

test("DeepL: :fx keys go to api-free, others to api; auth header; code mapping; formality", async () => {
  assert.match(AI.deeplEndpoint("abc:fx"), /^https:\/\/api-free\.deepl\.com\//);
  assert.match(AI.deeplEndpoint("abc"), /^https:\/\/api\.deepl\.com\//);
  const cap = {};
  const res = await AI.ENGINES.deepl({
    text: "Hello", sourceLang: "en", targetLang: "zh-CN", tone: "business", apiKey: "k:fx",
    fetchImpl: fakeFetch(200, { translations: [{ text: "你好" }] }, cap)
  });
  assert.equal(res.translatedText, "你好");
  assert.equal(cap.init.headers.Authorization, "DeepL-Auth-Key k:fx");
  assert.equal(cap.body.target_lang, "ZH-HANS");
  assert.equal(cap.body.source_lang, "EN");
  assert.equal(cap.body.formality, "prefer_more");
  const natural = AI.buildDeepLRequest({ text: "a", sourceLang: "auto", targetLang: "ja", tone: "natural", apiKey: "k" });
  assert.equal(natural.body.formality, undefined);
  assert.equal(natural.body.source_lang, undefined);
});

test("HTTP errors are classified by cause", () => {
  assert.equal(classifyHttpError("openai", 401, "").code, CODES.AUTH);
  assert.equal(classifyHttpError("deepl", 403, "").code, CODES.AUTH);
  assert.equal(classifyHttpError("openai", 429, "").code, CODES.QUOTA);
  assert.equal(classifyHttpError("deepl", 456, "").code, CODES.QUOTA);
  assert.equal(classifyHttpError("deepl", 413, "").code, CODES.TOO_LONG);
  assert.equal(classifyHttpError("openai", 400, '{"error":{"code":"context_length_exceeded"}}').code, CODES.TOO_LONG);
  assert.equal(classifyHttpError("deepl", 400, "Value for 'target_lang' not supported.").code, CODES.UNSUPPORTED_LANG);
  assert.equal(classifyHttpError("openai", 503, "").code, CODES.NETWORK);
});

test("network failures and timeouts become NETWORK; oversize input is TOO_LONG before sending", async () => {
  await assert.rejects(
    AI.ENGINES.openai({ text: "a", sourceLang: "en", targetLang: "ja", tone: "natural", apiKey: "k",
      fetchImpl: async () => { throw new TypeError("Failed to fetch"); } }),
    (e) => e.code === CODES.NETWORK
  );
  let called = false;
  await assert.rejects(
    AI.ENGINES.openai({ text: "a".repeat(g.QUICKLENS_CONFIG.API.AI_MAX_INPUT_CHARS + 1), sourceLang: "en", targetLang: "ja",
      tone: "natural", apiKey: "k", fetchImpl: async () => { called = true; } }),
    (e) => e.code === CODES.TOO_LONG
  );
  assert.equal(called, false);
});
