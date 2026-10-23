/**
 * QuickLens - 共通定義ファイル
 * background / content / popup / options / crypto-vault から参照される定数を一元管理します。
 * クラシックスクリプトとして複数回読み込まれても安全なよう、globalThis へ代入する形にしています。
 */

globalThis.QUICKLENS_CONFIG = Object.freeze({
  // chrome.storage.sync に保存するユーザー設定の初期値
  DEFAULT_SETTINGS: Object.freeze({
    engine: "free", // "free" | "gemini" | "openai" | "deepl"
    tone: "natural", // "natural" | "business" | "summary" | "breakdown"
    targetLang: "ja",
    sourceLang: "auto",
    autoTranslatePopup: true,
    toastDuration: 10000,
    position: "floating"
  }),

  CONTEXT_MENU: Object.freeze({
    ID: "quicklens-translate-selection",
    TITLE: "QuickLens で読み解く (「%s」)"
  }),

  // background <-> content / popup 間のメッセージ種別
  ACTIONS: Object.freeze({
    SHOW_LOADING_HUD: "SHOW_LOADING_HUD",
    SHOW_TRANSLATION_HUD: "SHOW_TRANSLATION_HUD",
    SHOW_ERROR_HUD: "SHOW_ERROR_HUD",
    GET_SELECTED_TEXT: "GET_SELECTED_TEXT",
    EXECUTE_TRANSLATION: "EXECUTE_TRANSLATION",
    VAULT_SAVE_KEY: "VAULT_SAVE_KEY",
    VAULT_GET_STATUS: "VAULT_GET_STATUS"
  }),

  // 動的注入時に読み込むコンテンツスクリプト（manifest.json の content_scripts と揃える）
  CONTENT_SCRIPT_FILES: Object.freeze(["config.js", "content.js"]),

  API: Object.freeze({
    FREE_TRANSLATE_URL: "https://translate.googleapis.com/translate_a/single",
    GEMINI_BASE_URL: "https://generativelanguage.googleapis.com/v1beta/models",
    GEMINI_MODEL: "gemini-2.5-flash",
    GEMINI_MAX_OUTPUT_TOKENS: 1024,
    OPENAI_CHAT_URL: "https://api.openai.com/v1/chat/completions",
    OPENAI_MODEL: "gpt-4o-mini",
    TEMPERATURE: 0.3
  }),

  VAULT: Object.freeze({
    STORAGE_KEY: "quicklens_secure_vault",
    DEVICE_SALT_KEY: "quicklens_device_salt",
    SECRET_PREFIX: "quicklens_secret_",
    FALLBACK_EXTENSION_ID: "quicklens-default-id",
    SALT_BYTES: 16,
    IV_BYTES: 12,
    PBKDF2_ITERATIONS: 100000,
    PBKDF2_HASH: "SHA-256",
    AES_KEY_LENGTH: 256
  }),

  // 各種タイミング (ms)
  TIMING: Object.freeze({
    REINJECT_RETRY_DELAY: 120,
    HUD_RESUME_DISMISS: 3500,
    ERROR_HUD_DURATION: 5000,
    HUD_CLOSE_ANIMATION: 180,
    BUTTON_FEEDBACK: 1500,
    OPTIONS_SAVE_TOAST: 2000
  }),

  HUD: Object.freeze({
    LOADING_PREVIEW_LENGTH: 25,
    ORIGINAL_PREVIEW_LENGTH: 90
  }),

  TONE_LABELS: Object.freeze({
    natural: "自然な訳",
    business: "ビジネス敬語",
    summary: "要約",
    breakdown: "解説つき"
  }),

  ENGINE_BADGE_LABELS: Object.freeze({
    free: "無料モード",
    gemini: "Gemini AI",
    openai: "OpenAI"
  })
});
