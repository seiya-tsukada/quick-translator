/**
 * QuickLens - Error codes and classification
 * Errors are categorised by cause so the UI can show a specific message and next step.
 */

(() => {
  if (globalThis.QuickLensErrors) return;

  const CODES = Object.freeze({
    AUTH: "AUTH", // invalid / revoked API key
    QUOTA: "QUOTA", // rate limit or usage quota exceeded
    NETWORK: "NETWORK", // offline, DNS, timeout, 5xx
    TOO_LONG: "TOO_LONG", // input or output too long
    UNSUPPORTED_LANG: "UNSUPPORTED_LANG", // language pair not supported by the engine
    NO_KEY: "NO_KEY", // AI engine selected but no key saved
    PERMISSION_MISSING: "PERMISSION_MISSING", // optional host permission not granted
    BUILTIN_UNAVAILABLE: "BUILTIN_UNAVAILABLE", // Translator API missing (old Chrome / mobile / unsupported context)
    MODEL_DOWNLOAD_REQUIRED: "MODEL_DOWNLOAD_REQUIRED", // model must be downloaded and needs a user click
    MODEL_UNAVAILABLE: "MODEL_UNAVAILABLE", // device cannot run / download the model
    DETECTION_FAILED: "DETECTION_FAILED", // could not detect the source language
    NO_SELECTION: "NO_SELECTION",
    UNKNOWN: "UNKNOWN"
  });

  class QuickLensError extends Error {
    constructor(code, detail = "") {
      super(detail ? `${code}: ${detail}` : code);
      this.name = "QuickLensError";
      this.code = CODES[code] ? code : CODES.UNKNOWN;
      this.detail = detail;
    }
  }

  /** Serialise for chrome.runtime messaging */
  function toPlain(err) {
    if (err && err.code && CODES[err.code]) return { code: err.code, detail: String(err.detail || "") };
    return { code: CODES.UNKNOWN, detail: String((err && err.message) || err || "") };
  }

  function fromPlain(plain) {
    return new QuickLensError(plain && plain.code, plain && plain.detail);
  }

  /** Map a thrown fetch error (TypeError, AbortError, TimeoutError) to NETWORK */
  function classifyFetchFailure(err) {
    if (err && err.code && CODES[err.code]) return err;
    const name = err && err.name;
    const detail = name === "TimeoutError" || name === "AbortError" ? "timeout" : String((err && err.message) || "");
    return new QuickLensError(CODES.NETWORK, detail);
  }

  /**
   * Classify an HTTP error response from an AI provider.
   * @param {"openai"|"deepl"} provider
   * @param {number} status
   * @param {string} bodyText raw response body (may be JSON)
   */
  function classifyHttpError(provider, status, bodyText = "") {
    const body = String(bodyText || "");
    const lower = body.toLowerCase();
    const detail = `HTTP ${status}`;

    if (status === 401) return new QuickLensError(CODES.AUTH, detail);
    if (status === 403) {
      // OpenAI 403 = unsupported region; others = permission / key problem
      if (provider === "openai" && lower.includes("country")) return new QuickLensError(CODES.UNKNOWN, `${detail} (region)`);
      return new QuickLensError(CODES.AUTH, detail);
    }
    if (status === 429 || status === 456 || status === 529) return new QuickLensError(CODES.QUOTA, detail);
    if (status === 402) return new QuickLensError(CODES.QUOTA, detail);
    if (status === 413 || status === 414) return new QuickLensError(CODES.TOO_LONG, detail);
    if (status === 400) {
      if (lower.includes("context_length") || lower.includes("too long") || lower.includes("maximum context")) {
        return new QuickLensError(CODES.TOO_LONG, detail);
      }
      if (provider === "deepl" && (lower.includes("target_lang") || lower.includes("source_lang"))) {
        return new QuickLensError(CODES.UNSUPPORTED_LANG, detail);
      }
      return new QuickLensError(CODES.UNKNOWN, detail);
    }
    if (status === 408 || status >= 500) return new QuickLensError(CODES.NETWORK, detail);
    return new QuickLensError(CODES.UNKNOWN, detail);
  }

  /** i18n message key for an error code (see _locales) */
  function messageKey(code) {
    return `error_${CODES[code] ? code : CODES.UNKNOWN}`;
  }

  /** Short reason label key used in "X failed, showing free engine (reason: ...)" */
  function reasonKey(code) {
    return `reason_${CODES[code] ? code : CODES.UNKNOWN}`;
  }

  globalThis.QuickLensErrors = Object.freeze({
    CODES,
    QuickLensError,
    toPlain,
    fromPlain,
    classifyFetchFailure,
    classifyHttpError,
    messageKey,
    reasonKey
  });
})();
