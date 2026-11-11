/**
 * QuickLens - Theme helpers ("system" | "light" | "dark")
 */

(() => {
  if (globalThis.QuickLensTheme) return;

  function resolve(pref) {
    if (pref === "light" || pref === "dark") return pref;
    const mq = globalThis.matchMedia && globalThis.matchMedia("(prefers-color-scheme: dark)");
    return mq && mq.matches ? "dark" : "light";
  }

  /** Apply to an extension page: sets <html data-theme="..."> and follows system changes */
  function applyToDocument(pref, doc = document) {
    const set = () => {
      doc.documentElement.setAttribute("data-theme", resolve(pref));
    };
    set();
    if (pref === "system" && globalThis.matchMedia) {
      globalThis.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", set);
    }
  }

  globalThis.QuickLensTheme = Object.freeze({ resolve, applyToDocument });
})();
