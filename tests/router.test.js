import { test } from "node:test";
import assert from "node:assert/strict";
import { loadExtension, CORE } from "./helpers.js";

const g = loadExtension([...CORE, "lib/router.js"]);
const { runTranslation, effectiveTone } = g.QuickLensRouter;
const { QuickLensError, CODES } = g.QuickLensErrors;

const ok = (text) => async () => ({ translatedText: text });
const fail = (code) => async () => { throw new QuickLensError(code, "x"); };

test("free engine uses on-device translation only", async () => {
  let aiCalled = false;
  const r = await runTranslation({ engine: "free", tone: "natural", aiTranslate: async () => { aiCalled = true; }, freeTranslate: ok("こんにちは") });
  assert.equal(r.translatedText, "こんにちは");
  assert.equal(r.engineUsed, "free");
  assert.equal(r.fallback, null);
  assert.equal(aiCalled, false);
});

test("AI engine success returns AI result and applied tone", async () => {
  let toneSeen;
  const r = await runTranslation({
    engine: "gemini", tone: "business",
    aiTranslate: async (tone) => { toneSeen = tone; return { translatedText: "AI" }; },
    freeTranslate: ok("FREE")
  });
  assert.equal(r.translatedText, "AI");
  assert.equal(r.engineUsed, "gemini");
  assert.equal(toneSeen, "business");
  assert.equal(r.fallback, null);
});

test("AI failure falls back to on-device AND reports the reason", async () => {
  for (const code of [CODES.AUTH, CODES.QUOTA, CODES.NETWORK, CODES.TOO_LONG, CODES.UNSUPPORTED_LANG, CODES.NO_KEY]) {
    const r = await runTranslation({ engine: "openai", tone: "natural", aiTranslate: fail(code), freeTranslate: ok("FREE") });
    assert.equal(r.engineUsed, "free");
    assert.equal(r.translatedText, "FREE");
    assert.equal(r.fallback.from, "openai");
    assert.equal(r.fallback.reason, code);
  }
});

test("non-QuickLens errors are reported as UNKNOWN", async () => {
  const r = await runTranslation({ engine: "deepl", tone: "natural", aiTranslate: async () => { throw new Error("boom"); }, freeTranslate: ok("FREE") });
  assert.equal(r.fallback.reason, CODES.UNKNOWN);
});

test("when both fail, the on-device error is thrown with the AI failure attached", async () => {
  await assert.rejects(
    runTranslation({ engine: "gemini", tone: "natural", aiTranslate: fail(CODES.AUTH), freeTranslate: fail(CODES.BUILTIN_UNAVAILABLE) }),
    (err) => {
      assert.equal(err.code, CODES.BUILTIN_UNAVAILABLE);
      assert.equal(err.aiFailure.from, "gemini");
      assert.equal(err.aiFailure.reason, CODES.AUTH);
      return true;
    }
  );
});

test("free engine errors propagate as-is", async () => {
  await assert.rejects(
    runTranslation({ engine: "free", tone: "natural", aiTranslate: ok("x"), freeTranslate: fail(CODES.MODEL_DOWNLOAD_REQUIRED) }),
    (err) => err.code === CODES.MODEL_DOWNLOAD_REQUIRED && !err.aiFailure
  );
});

test("DeepL cannot summarise: tone is downgraded and flagged", async () => {
  let toneSeen;
  const r = await runTranslation({
    engine: "deepl", tone: "summary",
    aiTranslate: async (tone) => { toneSeen = tone; return { translatedText: "D" }; },
    freeTranslate: ok("F")
  });
  assert.equal(toneSeen, "natural");
  assert.equal(r.toneAdjusted, true);
  assert.equal(effectiveTone("deepl", "business"), "business");
  assert.equal(effectiveTone("free", "business"), "natural");
  assert.equal(effectiveTone("openai", "breakdown"), "breakdown");
});
