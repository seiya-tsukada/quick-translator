// chrome.* API + built-in Translator mock for rendering the extension outside Chrome.
(() => {
  const qs = new URLSearchParams(location.search);
  const lang = qs.get("lang") || "ja";
  const theme = qs.get("theme");
  const EXT_BASE = "/ext/";

  // ---- i18n (sync load of _locales) ----
  let messages = {};
  try {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", `${EXT_BASE}_locales/${lang}/messages.json`, false);
    xhr.send();
    messages = JSON.parse(xhr.responseText);
  } catch (e) { console.warn("[mock] i18n load failed", e); }

  function getMessage(key, subs) {
    const m = messages[key];
    if (!m) return "";
    const args = subs == null ? [] : Array.isArray(subs) ? subs.map(String) : [String(subs)];
    let out = m.message;
    if (m.placeholders) {
      for (const [name, ph] of Object.entries(m.placeholders)) {
        const val = ph.content.replace(/\$(\d)/g, (_, i) => args[i - 1] ?? "");
        out = out.replace(new RegExp(`\\$${name}\\$`, "gi"), val);
      }
    }
    return out.replace(/\$(\d)/g, (_, i) => args[i - 1] ?? "").replace(/\$\$/g, "$");
  }

  // ---- storage (localStorage-backed, shared across frames on same origin) ----
  function area(name) {
    const K = `qlmock:${name}`;
    const read = () => { try { return JSON.parse(localStorage.getItem(K) || "{}"); } catch { return {}; } };
    const write = (o) => { try { localStorage.setItem(K, JSON.stringify(o)); } catch { /* storage unavailable */ } };
    const wrap = (fn) => (...a) => {
      const cb = typeof a[a.length - 1] === "function" ? a.pop() : null;
      const r = fn(...a);
      if (cb) { cb(r); return; }
      return Promise.resolve(r);
    };
    return {
      get: wrap((keys) => {
        const all = read();
        if (keys == null) return all;
        if (typeof keys === "string") return keys in all ? { [keys]: all[keys] } : {};
        if (Array.isArray(keys)) return Object.fromEntries(keys.filter((k) => k in all).map((k) => [k, all[k]]));
        return Object.fromEntries(Object.entries(keys).map(([k, d]) => [k, k in all ? all[k] : d]));
      }),
      set: wrap((obj) => { write({ ...read(), ...obj }); }),
      remove: wrap((keys) => { const all = read(); [].concat(keys).forEach((k) => delete all[k]); write(all); }),
      clear: wrap(() => write({}))
    };
  }

  // Seed theme preference from URL
  if (theme) {
    try {
      const k = "qlmock:sync"; const o = JSON.parse(localStorage.getItem(k) || "{}");
      o.theme = theme; localStorage.setItem(k, JSON.stringify(o));
    } catch { /* storage unavailable */ }
  }

  // ---- fake translation ----
  const CANNED = {
    "The quick brown fox jumps over the lazy dog.": "素早い茶色のキツネがのろまな犬を飛び越える。",
    "Hello, world!": "こんにちは、世界！"
  };
  function fakeTranslate(text, target) {
    const t = text.trim();
    if (CANNED[t] && (target || "ja").startsWith("ja")) return CANNED[t];
    return `【モック翻訳 → ${target || "?"}】${t}`;
  }

  const listeners = [];
  const RUNTIME_ID = "mockextensionid0000000000000000";

  const chromeMock = {
    i18n: { getMessage, getUILanguage: () => lang },
    storage: { sync: area("sync"), local: area("local"), onChanged: { addListener() {} } },
    runtime: {
      id: RUNTIME_ID,
      getURL: (p) => location.origin + EXT_BASE + p,
      openOptionsPage: () => { (window.top || window).postMessage({ qlmock: "open", page: "options" }, "*"); return Promise.resolve(); },
      sendMessage: async (msg) => {
        await new Promise((r) => setTimeout(r, 500));
        switch (msg && msg.action) {
          case "QL_AI_TRANSLATE": return { ok: true, translatedText: fakeTranslate(msg.text, msg.targetLang) + (msg.tone ? `（${msg.tone}）` : "") };
          case "QL_VAULT_GET_STATUS": return { ok: true, status: { openai: true, deepl: false } };
          case "QL_OPEN_OPTIONS": return chromeMock.runtime.openOptionsPage();
          default: return { ok: true };
        }
      },
      onMessage: { addListener: (fn) => listeners.push(fn) },
      onInstalled: { addListener() {} },
      lastError: undefined
    },
    tabs: {
      query: async () => [{ id: 1 }],
      create: async ({ url }) => { window.open(url, "_blank"); },
      sendMessage: async () => ({ ok: true })
    },
    scripting: {
      // popup reads selection from the active tab → return the demo page's selection-like text
      executeScript: async () => [{ result: { text: qs.get("sel") || "", focused: true } }]
    },
    permissions: { contains: async () => true, request: async () => true, remove: async () => true },
    commands: { getAll: async () => [{ name: "translate-selection", shortcut: "Alt+T" }], onCommand: { addListener() {} } },
    contextMenus: { create() {}, removeAll(cb) { cb && cb(); }, onClicked: { addListener() {} } }
  };
  window.chrome = chromeMock;

  // Dispatch helper for the in-page HUD demo
  window.__qlmockDispatch = (request) =>
    listeners.forEach((fn) => fn(request, { id: RUNTIME_ID }, () => {}));

  // ---- Built-in Translator / LanguageDetector mock ----
  window.Translator = {
    availability: async () => "available",
    create: async ({ targetLanguage }) => ({
      translate: async (text) => { await new Promise((r) => setTimeout(r, 600)); return fakeTranslate(text, targetLanguage); },
      destroy() {}
    })
  };
  window.LanguageDetector = {
    availability: async () => "available",
    create: async () => ({
      detect: async (text) => [{ detectedLanguage: /[぀-ヿ一-鿿]/.test(text) ? "ja" : "en", confidence: 0.98 }],
      destroy() {}
    })
  };
})();
