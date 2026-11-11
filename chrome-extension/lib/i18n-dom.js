/**
 * QuickLens - Apply chrome.i18n messages to extension pages.
 *   data-i18n=<messageKey>                     → textContent
 *   data-i18n-attr=<attr:messageKey;attr2:messageKey2>  → attributes
 */

(() => {
  if (globalThis.QuickLensI18n) return;

  function t(key, substitutions) {
    const msg = chrome.i18n.getMessage(key, substitutions);
    return msg || key;
  }

  function apply(root = document) {
    const lang = chrome.i18n.getUILanguage();
    if (root === document) document.documentElement.lang = lang.startsWith("ja") ? "ja" : "en";
    root.querySelectorAll("[data-i18n]").forEach((el) => {
      el.textContent = t(el.getAttribute("data-i18n"));
    });
    root.querySelectorAll("[data-i18n-attr]").forEach((el) => {
      el.getAttribute("data-i18n-attr")
        .split(";")
        .map((pair) => pair.trim())
        .filter(Boolean)
        .forEach((pair) => {
          const [attr, key] = pair.split(":").map((s) => s.trim());
          if (attr && key) el.setAttribute(attr, t(key));
        });
    });
  }

  function uiLocale() {
    return chrome.i18n.getUILanguage();
  }

  globalThis.QuickLensI18n = Object.freeze({ t, apply, uiLocale });
})();
