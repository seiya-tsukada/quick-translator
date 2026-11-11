/**
 * QuickLens - On-device translation with Chrome's built-in Translator API and Language Detector API.
 *
 * Runs in window contexts only (content script in the top frame, popup, onboarding page).
 * Per developer.chrome.com these APIs are NOT available in Web Workers, and are available
 * by default only to top-level windows and same-origin iframes — so the extension service
 * worker never calls them.
 *
 * Model download: when availability() is "downloadable"/"downloading", create() requires
 * user activation. We always try create(); if Chrome rejects it for lack of activation we
 * throw MODEL_DOWNLOAD_REQUIRED and the UI shows a button (a click provides activation).
 */

(() => {
  if (globalThis.QuickLensBuiltin) return;

  const { BUILTIN } = globalThis.QUICKLENS_CONFIG;
  const { CODES, QuickLensError } = globalThis.QuickLensErrors;
  const Lang = globalThis.QuickLensLanguages;
  const Chunker = globalThis.QuickLensChunker;

  const translatorCache = new Map(); // "src>tgt" -> Translator
  let detectorPromise = null;

  function hasTranslatorApi() {
    return typeof globalThis.Translator !== "undefined";
  }

  function hasDetectorApi() {
    return typeof globalThis.LanguageDetector !== "undefined";
  }

  function hasActivation() {
    const ua = globalThis.navigator && globalThis.navigator.userActivation;
    return Boolean(ua && ua.isActive);
  }

  /** availability() with a timeout → MODEL_UNAVAILABLE instead of hanging forever */
  function availabilityWithTimeout(promise, label) {
    let timer;
    const timeout = new Promise((_, reject) => {
      timer = setTimeout(
        () => reject(new QuickLensError(CODES.MODEL_UNAVAILABLE, `${label}.availability() timed out`)),
        BUILTIN.AVAILABILITY_TIMEOUT_MS
      );
    });
    return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
  }

  function monitorWith(onProgress) {
    return (m) => {
      m.addEventListener("downloadprogress", (e) => {
        if (onProgress) onProgress(typeof e.loaded === "number" ? e.loaded : 0);
      });
    };
  }

  /** Map create() failures to our error codes */
  function mapCreateError(err) {
    const name = err && err.name;
    if (name === "NotAllowedError") return new QuickLensError(CODES.MODEL_DOWNLOAD_REQUIRED, err.message);
    if (name === "NotSupportedError") return new QuickLensError(CODES.UNSUPPORTED_LANG, err.message);
    if (name === "NetworkError") return new QuickLensError(CODES.NETWORK, err.message);
    if (name === "OperationError" || name === "QuotaExceededError") {
      return new QuickLensError(CODES.MODEL_UNAVAILABLE, err.message);
    }
    return new QuickLensError(CODES.UNKNOWN, (err && err.message) || String(err));
  }

  async function getDetector(onProgress) {
    if (!hasDetectorApi()) throw new QuickLensError(CODES.BUILTIN_UNAVAILABLE, "LanguageDetector");
    if (!detectorPromise) {
      detectorPromise = (async () => {
        const availability = await availabilityWithTimeout(globalThis.LanguageDetector.availability(), "LanguageDetector");
        if (availability === "unavailable") throw new QuickLensError(CODES.MODEL_UNAVAILABLE, "LanguageDetector");
        try {
          return await globalThis.LanguageDetector.create({ monitor: monitorWith(onProgress) });
        } catch (err) {
          throw mapCreateError(err);
        }
      })();
      detectorPromise.catch(() => {
        detectorPromise = null;
      });
    }
    return detectorPromise;
  }

  /** @returns {Promise<string>} Translator-API language code, e.g. "en", "zh-Hant" */
  async function detectLanguage(text, onProgress) {
    const detector = await getDetector(onProgress);
    const sample = String(text).slice(0, BUILTIN.DETECT_SAMPLE_CHARS);
    const results = await detector.detect(sample);
    const top = results && results[0];
    const code = top && Lang.normalizeDetected(top.detectedLanguage);
    if (!code || top.confidence < BUILTIN.DETECT_MIN_CONFIDENCE) {
      throw new QuickLensError(CODES.DETECTION_FAILED, top ? `${top.detectedLanguage} ${top.confidence}` : "");
    }
    return code;
  }

  async function getTranslator(sourceLanguage, targetLanguage, onProgress) {
    const key = `${sourceLanguage}>${targetLanguage}`;
    if (translatorCache.has(key)) return translatorCache.get(key);

    const availability = await availabilityWithTimeout(
      globalThis.Translator.availability({ sourceLanguage, targetLanguage }),
      "Translator"
    );
    if (availability === "unavailable") {
      throw new QuickLensError(CODES.UNSUPPORTED_LANG, `${sourceLanguage}→${targetLanguage}`);
    }
    let translator;
    try {
      translator = await globalThis.Translator.create({
        sourceLanguage,
        targetLanguage,
        monitor: monitorWith(onProgress)
      });
    } catch (err) {
      throw mapCreateError(err);
    }
    translatorCache.set(key, translator);
    return translator;
  }

  /**
   * Translate on-device.
   * @param {string} text
   * @param {{sourceLang: string, targetLang: string,
   *          onDownloadProgress?: (fraction: number) => void,
   *          onChunkProgress?: (done: number, total: number) => void}} opts
   *   sourceLang/targetLang are QuickLens codes ("auto", "ja", "zh-CN", ...)
   * @returns {Promise<{translatedText: string, detectedLang?: string, sameLanguage?: boolean}>}
   */
  async function translate(text, { sourceLang, targetLang, onDownloadProgress, onChunkProgress } = {}) {
    if (!hasTranslatorApi()) throw new QuickLensError(CODES.BUILTIN_UNAVAILABLE, "Translator");

    const target = Lang.toBuiltin(targetLang);
    if (!target) throw new QuickLensError(CODES.UNSUPPORTED_LANG, String(targetLang));

    let source;
    if (!sourceLang || sourceLang === "auto") {
      source = await detectLanguage(text, onDownloadProgress);
    } else {
      source = Lang.toBuiltin(sourceLang);
      if (!source) throw new QuickLensError(CODES.UNSUPPORTED_LANG, String(sourceLang));
    }

    if (Lang.isSameBuiltinLanguage(source, target)) {
      return { translatedText: text, detectedLang: source, sameLanguage: true };
    }

    const translator = await getTranslator(source, target, onDownloadProgress);
    const translatedText = await Chunker.translateInChunks(
      text,
      BUILTIN.CHUNK_MAX_CHARS,
      (chunk) => translator.translate(chunk),
      onChunkProgress
    );
    return { translatedText, detectedLang: source };
  }

  /**
   * Prepare models ahead of time (called from a click handler, e.g. onboarding).
   */
  async function prepare({ sourceLang, targetLang, onDownloadProgress }) {
    if (!hasTranslatorApi()) throw new QuickLensError(CODES.BUILTIN_UNAVAILABLE, "Translator");
    if (hasDetectorApi()) await getDetector(onDownloadProgress);
    const source = Lang.toBuiltin(sourceLang);
    const target = Lang.toBuiltin(targetLang);
    if (source && target && !Lang.isSameBuiltinLanguage(source, target)) {
      await getTranslator(source, target, onDownloadProgress);
    }
  }

  globalThis.QuickLensBuiltin = Object.freeze({
    translate,
    prepare,
    detectLanguage,
    hasTranslatorApi,
    hasDetectorApi,
    hasActivation
  });
})();
