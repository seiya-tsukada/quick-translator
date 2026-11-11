/**
 * QuickLens - Translation router
 * Chooses the engine and, when an AI engine fails, falls back to the on-device engine
 * while reporting WHY (the UI must show it — never switch silently).
 *
 * Pure orchestration: the actual engines are injected, which keeps this unit-testable.
 */

(() => {
  if (globalThis.QuickLensRouter) return;

  const { AI_ENGINES, ENGINE_TONES } = globalThis.QUICKLENS_CONFIG;
  const { CODES, QuickLensError } = globalThis.QuickLensErrors;

  // Errors where falling back to the on-device engine cannot help the user
  const NO_FALLBACK = new Set([CODES.NO_SELECTION]);

  function toError(err) {
    if (err && err.code && CODES[err.code]) return err;
    return new QuickLensError(CODES.UNKNOWN, String((err && err.message) || err || ""));
  }

  /** Tone that the engine will actually apply (e.g. DeepL can't summarise) */
  function effectiveTone(engine, tone) {
    const allowed = ENGINE_TONES[engine] || ENGINE_TONES.free;
    return allowed.includes(tone) ? tone : "natural";
  }

  /**
   * @param {object} p
   * @param {string} p.engine "free" | "gemini" | "openai" | "deepl"
   * @param {string} p.tone
   * @param {(tone: string) => Promise<{translatedText: string}>} p.aiTranslate
   * @param {() => Promise<{translatedText: string}>} p.freeTranslate
   * @returns {Promise<{translatedText: string, engineUsed: string, tone: string,
   *   requestedTone: string, toneAdjusted: boolean, fallback: null | {from: string, reason: string}}>}
   * On total failure throws a QuickLensError; if the AI attempt failed first, `err.aiFailure`
   * holds { from, reason }.
   */
  async function runTranslation({ engine, tone, aiTranslate, freeTranslate }) {
    const useAi = AI_ENGINES.includes(engine);

    if (useAi) {
      const appliedTone = effectiveTone(engine, tone);
      let aiError;
      try {
        const res = await aiTranslate(appliedTone);
        return {
          translatedText: res.translatedText,
          engineUsed: engine,
          tone: appliedTone,
          requestedTone: tone,
          toneAdjusted: appliedTone !== tone,
          fallback: null
        };
      } catch (err) {
        aiError = toError(err);
      }
      if (NO_FALLBACK.has(aiError.code)) throw aiError;

      const fallback = { from: engine, reason: aiError.code };
      try {
        const res = await freeTranslate();
        return {
          translatedText: res.translatedText,
          engineUsed: "free",
          tone: "natural",
          requestedTone: tone,
          toneAdjusted: tone !== "natural",
          fallback
        };
      } catch (freeErr) {
        const e = toError(freeErr);
        e.aiFailure = fallback;
        throw e;
      }
    }

    const res = await freeTranslate();
    return {
      translatedText: res.translatedText,
      engineUsed: "free",
      tone: "natural",
      requestedTone: tone,
      toneAdjusted: tone !== "natural",
      fallback: null
    };
  }

  globalThis.QuickLensRouter = Object.freeze({ runTranslation, effectiveTone });
})();
