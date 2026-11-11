/**
 * QuickLens - Language helpers (pure functions over QUICKLENS_CONFIG.LANGUAGES)
 */

(() => {
  if (globalThis.QuickLensLanguages) return;

  const { LANGUAGES } = globalThis.QUICKLENS_CONFIG;

  function isSupported(code) {
    return Object.prototype.hasOwnProperty.call(LANGUAGES, code);
  }

  /**
   * Name used inside AI prompts, e.g. "Japanese (日本語)".
   * Returns null for "auto" or unknown codes so callers never embed raw codes.
   */
  function promptName(code) {
    const lang = LANGUAGES[code];
    if (!lang) return null;
    return `${lang.nameEn} (${lang.nativeName})`;
  }

  /** Display name in the UI language ("ja" → Japanese names, anything else → English) */
  function displayName(code, uiLocale = "en") {
    const lang = LANGUAGES[code];
    if (!lang) return code;
    return String(uiLocale).toLowerCase().startsWith("ja") ? lang.nameJa : lang.nameEn;
  }

  function nativeName(code) {
    const lang = LANGUAGES[code];
    return lang ? lang.nativeName : code;
  }

  /** Code for Chrome's built-in Translator API */
  function toBuiltin(code) {
    const lang = LANGUAGES[code];
    return lang ? lang.builtin : null;
  }

  function toDeeplTarget(code) {
    const lang = LANGUAGES[code];
    return lang ? lang.deeplTarget : null;
  }

  function toDeeplSource(code) {
    if (!code || code === "auto") return null;
    const lang = LANGUAGES[code];
    return lang ? lang.deeplSource : null;
  }

  /**
   * Normalise a BCP 47 tag returned by the Language Detector to a code the
   * Translator API accepts, e.g. "zh-Hant-TW" → "zh-Hant", "pt-BR" → "pt", "zh-CN" → "zh".
   */
  function normalizeDetected(tag) {
    if (!tag || tag === "und") return null;
    const lower = String(tag).toLowerCase();
    if (lower.startsWith("zh")) {
      return lower.includes("hant") || lower.endsWith("-tw") || lower.endsWith("-hk") ? "zh-Hant" : "zh";
    }
    return lower.split("-")[0];
  }

  /** Same language ignoring script/region, e.g. "en" vs "en-US" */
  function isSameBuiltinLanguage(a, b) {
    if (!a || !b) return false;
    return String(a).toLowerCase() === String(b).toLowerCase();
  }

  globalThis.QuickLensLanguages = Object.freeze({
    isSupported,
    promptName,
    displayName,
    nativeName,
    toBuiltin,
    toDeeplTarget,
    toDeeplSource,
    normalizeDetected,
    isSameBuiltinLanguage,
    codes: () => Object.keys(LANGUAGES)
  });
})();
