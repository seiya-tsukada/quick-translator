/**
 * QuickLens - Translation client for window contexts (content script, popup).
 * Wires the router to the two kinds of engines:
 *   - AI engines: request to the background service worker (which holds the decrypted key)
 *   - on-device engine: Chrome's built-in Translator API, run right here
 */

(() => {
  if (globalThis.QuickLensClient) return;

  const { ACTIONS } = globalThis.QUICKLENS_CONFIG;
  const { CODES, QuickLensError, fromPlain } = globalThis.QuickLensErrors;
  const Router = globalThis.QuickLensRouter;
  const Builtin = globalThis.QuickLensBuiltin;
  const Usage = globalThis.QuickLensUsage;

  async function aiTranslate({ engine, text, sourceLang, targetLang, tone }) {
    let res;
    try {
      res = await chrome.runtime.sendMessage({ action: ACTIONS.AI_TRANSLATE, engine, text, sourceLang, targetLang, tone });
    } catch (err) {
      throw new QuickLensError(CODES.UNKNOWN, (err && err.message) || "messaging failed");
    }
    if (!res || !res.ok) throw fromPlain(res && res.error);
    return { translatedText: res.translatedText };
  }

  /**
   * @param {{text: string, engine: string, tone: string, sourceLang: string, targetLang: string,
   *          onDownloadProgress?: Function, onChunkProgress?: Function}} p
   */
  async function translate({ text, engine, tone, sourceLang, targetLang, onDownloadProgress, onChunkProgress }) {
    const result = await Router.runTranslation({
      engine,
      tone,
      aiTranslate: (appliedTone) => aiTranslate({ engine, text, sourceLang, targetLang, tone: appliedTone }),
      freeTranslate: () => Builtin.translate(text, { sourceLang, targetLang, onDownloadProgress, onChunkProgress })
    });
    await Usage.recordTranslation();
    return result;
  }

  globalThis.QuickLensClient = Object.freeze({ translate });
})();
