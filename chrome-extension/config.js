/**
 * QuickLens - Shared configuration
 * Constants referenced from background / content / popup / options / onboarding.
 * Loaded as a classic script (possibly more than once), so we assign onto globalThis.
 */

(() => {
  if (globalThis.QUICKLENS_CONFIG) return;

  const freezeDeep = (obj) => {
    Object.values(obj).forEach((v) => {
      if (v && typeof v === "object" && !Object.isFrozen(v)) freezeDeep(v);
    });
    return Object.freeze(obj);
  };

  globalThis.QUICKLENS_CONFIG = freezeDeep({
    // Initial values of user settings stored in chrome.storage.sync
    DEFAULT_SETTINGS: {
      engine: "free", // "free" | "gemini" | "openai" | "deepl"
      tone: "natural", // "natural" | "business" | "summary" | "breakdown"
      targetLang: "ja",
      sourceLang: "auto",
      autoTranslatePopup: true,
      toastDuration: 10000,
      hudPosition: "selection", // "selection" | "corner"
      theme: "system" // "system" | "light" | "dark"
    },

    ENGINES: ["free", "gemini", "openai", "deepl"],
    AI_ENGINES: ["gemini", "openai", "deepl"],
    TONES: ["natural", "business", "summary", "breakdown"],

    // Which tones each engine can honour. Others are disabled in the UI.
    ENGINE_TONES: {
      free: ["natural"],
      gemini: ["natural", "business", "summary", "breakdown"],
      openai: ["natural", "business", "summary", "breakdown"],
      deepl: ["natural", "business"]
    },

    CONTEXT_MENU_ID: "quicklens-translate-selection",
    COMMAND_TRANSLATE: "translate-selection",
    SHORTCUTS_PAGE_URL: "chrome://extensions/shortcuts",

    // Messages between background <-> content / popup / options
    ACTIONS: {
      PING: "QL_PING",
      TRANSLATE_IN_PAGE: "QL_TRANSLATE_IN_PAGE",
      SHOW_ERROR_HUD: "QL_SHOW_ERROR_HUD",
      AI_TRANSLATE: "QL_AI_TRANSLATE",
      OPEN_OPTIONS: "QL_OPEN_OPTIONS",
      VAULT_GET_STATUS: "QL_VAULT_GET_STATUS"
    },

    // Files injected on demand via chrome.scripting (order matters)
    CONTENT_SCRIPT_FILES: [
      "config.js",
      "lib/errors.js",
      "lib/languages.js",
      "lib/text-chunker.js",
      "lib/router.js",
      "lib/usage.js",
      "lib/icons.js",
      "lib/builtin-translator.js",
      "lib/translate-client.js",
      "lib/theme.js",
      "lib/hud-position.js",
      "content.js"
    ],

    /**
     * Supported languages.
     * - nameEn / nameJa: used in AI prompts (never put raw codes like "ja" in prompts)
     * - nativeName: shown in language pickers
     * - builtin: BCP 47 code for Chrome's Translator API (null = unsupported)
     * - deeplTarget / deeplSource: DeepL codes (null = unsupported)
     */
    LANGUAGES: {
      ja: { nameEn: "Japanese", nameJa: "日本語", nativeName: "日本語", builtin: "ja", deeplTarget: "JA", deeplSource: "JA" },
      en: { nameEn: "English", nameJa: "英語", nativeName: "English", builtin: "en", deeplTarget: "EN-US", deeplSource: "EN" },
      "zh-CN": { nameEn: "Simplified Chinese", nameJa: "中国語（簡体字）", nativeName: "简体中文", builtin: "zh", deeplTarget: "ZH-HANS", deeplSource: "ZH" },
      "zh-TW": { nameEn: "Traditional Chinese", nameJa: "中国語（繁体字）", nativeName: "繁體中文", builtin: "zh-Hant", deeplTarget: "ZH-HANT", deeplSource: "ZH" },
      ko: { nameEn: "Korean", nameJa: "韓国語", nativeName: "한국어", builtin: "ko", deeplTarget: "KO", deeplSource: "KO" },
      es: { nameEn: "Spanish", nameJa: "スペイン語", nativeName: "Español", builtin: "es", deeplTarget: "ES", deeplSource: "ES" },
      fr: { nameEn: "French", nameJa: "フランス語", nativeName: "Français", builtin: "fr", deeplTarget: "FR", deeplSource: "FR" },
      de: { nameEn: "German", nameJa: "ドイツ語", nativeName: "Deutsch", builtin: "de", deeplTarget: "DE", deeplSource: "DE" },
      it: { nameEn: "Italian", nameJa: "イタリア語", nativeName: "Italiano", builtin: "it", deeplTarget: "IT", deeplSource: "IT" },
      pt: { nameEn: "Portuguese", nameJa: "ポルトガル語", nativeName: "Português", builtin: "pt", deeplTarget: "PT-BR", deeplSource: "PT" },
      ru: { nameEn: "Russian", nameJa: "ロシア語", nativeName: "Русский", builtin: "ru", deeplTarget: "RU", deeplSource: "RU" }
    },
    // Quick-pick languages shown as pills in the popup
    QUICK_LANGUAGES: ["ja", "en", "zh-CN", "ko", "es"],

    // DeepL tone handling: DeepL has no "tone"; "business" maps to formality.
    // prefer_* values do not fail for target languages without formality support.
    DEEPL_FORMALITY_BY_TONE: {
      natural: null,
      business: "prefer_more"
    },

    API: {
      REQUEST_TIMEOUT_MS: 30000,
      AI_MAX_INPUT_CHARS: 20000,
      TEMPERATURE: 0.3,

      GEMINI_BASE_URL: "https://generativelanguage.googleapis.com/v1beta/models",
      // gemini-2.5-flash is deprecated (requests auto-route to 3.5 Flash-Lite from 2026-12-01).
      GEMINI_MODEL: "gemini-3.5-flash-lite",
      GEMINI_MAX_OUTPUT_TOKENS: 8192,
      // Gemini 3+: thinkingLevel. Gemini 2.5: thinkingBudget (thinkingLevel errors on 2.5).
      GEMINI_THINKING_LEVEL: "MINIMAL",
      GEMINI_25_THINKING_BUDGET: 0,

      OPENAI_CHAT_URL: "https://api.openai.com/v1/chat/completions",
      OPENAI_MODEL: "gpt-6-luna",
      OPENAI_MAX_COMPLETION_TOKENS: 8192,
      OPENAI_REASONING_EFFORT: "low", // set to null to omit

      DEEPL_FREE_URL: "https://api-free.deepl.com/v2/translate",
      DEEPL_PRO_URL: "https://api.deepl.com/v2/translate",
      DEEPL_FREE_KEY_SUFFIX: ":fx"
    },

    // Origins requested via optional_host_permissions when a key is saved
    PROVIDER_ORIGINS: {
      gemini: ["https://generativelanguage.googleapis.com/*"],
      openai: ["https://api.openai.com/*"],
      deepl: ["https://api-free.deepl.com/*", "https://api.deepl.com/*"]
    },

    PROVIDER_LINKS: {
      gemini: { keys: "https://aistudio.google.com/apikey", privacy: "https://ai.google.dev/gemini-api/terms" },
      openai: { keys: "https://platform.openai.com/api-keys", privacy: "https://openai.com/policies/privacy-policy/" },
      deepl: { keys: "https://www.deepl.com/your-account/keys", privacy: "https://www.deepl.com/privacy" }
    },

    // On-device built-in translation (Chrome Translator / Language Detector API)
    BUILTIN: {
      CHUNK_MAX_CHARS: 1000,
      DETECT_SAMPLE_CHARS: 1000,
      DETECT_MIN_CONFIDENCE: 0.5,
      // availability() should answer quickly; guard against a promise that never settles
      AVAILABILITY_TIMEOUT_MS: 10000
    },

    VAULT: {
      STORAGE_KEY: "quicklens_secure_vault",
      DEVICE_SALT_KEY: "quicklens_device_salt",
      SECRET_PREFIX: "quicklens_secret_",
      FALLBACK_EXTENSION_ID: "quicklens-default-id",
      SALT_BYTES: 16,
      IV_BYTES: 12,
      PBKDF2_ITERATIONS: 100000,
      PBKDF2_HASH: "SHA-256",
      AES_KEY_LENGTH: 256
    },

    // Donation (the only monetisation). Leave DONATION_URL empty to hide every donation link.
    DONATION_URL: "",
    DONATION_PROMPT_THRESHOLD: 50,
    DONATION_SNOOZE_DAYS: 90,

    // chrome.storage.local keys (never synced, never sent anywhere)
    LOCAL_KEYS: {
      TRANSLATION_COUNT: "quicklens_translation_count",
      DONATION_DISMISSED_AT: "quicklens_donation_dismissed_at"
    },

    // Timings (ms)
    TIMING: {
      HUD_RESUME_DISMISS: 3500,
      ERROR_HUD_DURATION: 8000,
      HUD_CLOSE_ANIMATION: 180,
      BUTTON_FEEDBACK: 1500,
      OPTIONS_SAVE_TOAST: 2000
    },

    HUD: {
      LOADING_PREVIEW_LENGTH: 25,
      ORIGINAL_PREVIEW_LENGTH: 90,
      WIDTH: 380,
      MARGIN: 12,
      GAP_FROM_SELECTION: 8,
      ESTIMATED_HEIGHT: 220
    }
  });
})();
