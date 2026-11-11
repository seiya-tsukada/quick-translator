/**
 * QuickLens - Manifest V3 background service worker
 *
 * Responsibilities:
 * - Entry points: context menu, keyboard command, install/onboarding.
 * - On-demand injection of the content script into the active tab (activeTab + scripting;
 *   no <all_urls> content script).
 * - AI translation with the user's own key (BYOK). On-device translation is NOT done here:
 *   the Translator API is not available in workers, so it runs in the page/popup.
 */

importScripts(
  "config.js",
  "lib/errors.js",
  "lib/languages.js",
  "lib/ai-engines.js",
  "crypto-vault.js"
);

const {
  DEFAULT_SETTINGS,
  CONTEXT_MENU_ID,
  COMMAND_TRANSLATE,
  ACTIONS,
  AI_ENGINES,
  REMOVED_ENGINES,
  PROVIDER_ORIGINS,
  CONTENT_SCRIPT_FILES
} = self.QUICKLENS_CONFIG;
const { CODES, QuickLensError, toPlain } = self.QuickLensErrors;

// ---------- Install / startup ----------

/**
 * Engine to switch to when the stored engine was removed (e.g. "gemini"):
 * the first remaining AI engine the user already has a key and permission for, else on-device.
 */
async function pickFallbackEngine() {
  try {
    const status = await self.VaultCrypto.getApiKeyStatus();
    for (const engine of AI_ENGINES) {
      if (status[engine] && (await hasProviderPermission(engine))) return engine;
    }
  } catch (err) {
    console.warn("[QuickLens] Could not check saved keys for fallback:", err && err.message);
  }
  return DEFAULT_SETTINGS.engine;
}

/** Delete keys saved for engines that no longer exist, so they don't linger on the device. */
async function purgeRemovedEngineKeys() {
  for (const engine of REMOVED_ENGINES) {
    try {
      await self.VaultCrypto.removeApiKey(engine);
    } catch (err) {
      console.warn(`[QuickLens] Could not remove the ${engine} key:`, err && err.message);
    }
  }
}

chrome.runtime.onInstalled.addListener(async (details) => {
  // Fill in defaults without overwriting the user's existing values; drop obsolete keys.
  const current = await chrome.storage.sync.get(null);
  const merged = { ...DEFAULT_SETTINGS };
  Object.keys(DEFAULT_SETTINGS).forEach((k) => {
    if (current[k] !== undefined) merged[k] = current[k];
  });
  if (REMOVED_ENGINES.includes(merged.engine)) merged.engine = await pickFallbackEngine();
  await chrome.storage.sync.set(self.QuickLensSettings.normalize(merged));
  if (current.position !== undefined) await chrome.storage.sync.remove("position");
  await purgeRemovedEngineKeys();

  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: CONTEXT_MENU_ID,
      title: chrome.i18n.getMessage("contextMenuTitle"),
      contexts: ["selection"]
    });
  });

  if (details.reason === chrome.runtime.OnInstalledReason.INSTALL) {
    chrome.tabs.create({ url: chrome.runtime.getURL("onboarding.html") });
  }
});

// ---------- Content script injection ----------

async function isInjected(tabId) {
  try {
    const res = await chrome.tabs.sendMessage(tabId, { action: ACTIONS.PING }, { frameId: 0 });
    return Boolean(res && res.ok);
  } catch (_e) {
    return false;
  }
}

/**
 * Make sure the HUD script is present in the top frame. The HUD always lives in the top
 * frame: it has room to render and the Translator API is available there by default
 * (cross-origin iframes would need the "translator" permissions policy).
 */
async function ensureContentScript(tabId) {
  if (await isInjected(tabId)) return true;
  try {
    await chrome.scripting.executeScript({
      target: { tabId, frameIds: [0] },
      files: [...CONTENT_SCRIPT_FILES]
    });
    return true;
  } catch (err) {
    console.warn("[QuickLens] Cannot inject into this page (restricted page?):", err && err.message);
    return false;
  }
}

async function sendToTopFrame(tabId, message) {
  if (!(await ensureContentScript(tabId))) return false;
  try {
    await chrome.tabs.sendMessage(tabId, message, { frameId: 0 });
    return true;
  } catch (err) {
    console.warn("[QuickLens] sendMessage failed:", err && err.message);
    return false;
  }
}

/** Runs in every frame we may access; returns the selection of that frame. */
function readSelectionInFrame() {
  let text = "";
  const sel = window.getSelection();
  if (sel && sel.toString().trim()) {
    text = sel.toString();
  } else {
    const a = document.activeElement;
    if (a && (a.tagName === "TEXTAREA" || a.tagName === "INPUT") && typeof a.selectionStart === "number") {
      text = a.value.substring(a.selectionStart, a.selectionEnd);
    }
  }
  return { text: text.trim(), isTop: window === window.top, focused: document.hasFocus() };
}

/**
 * Collect the selection from all frames the activeTab grant lets us access.
 * Frames we cannot access (e.g. some cross-origin iframes) are simply missing from the results.
 */
async function getSelectionFromTab(tabId) {
  let results = [];
  try {
    results = await chrome.scripting.executeScript({
      target: { tabId, allFrames: true },
      func: readSelectionInFrame
    });
  } catch (err) {
    console.warn("[QuickLens] Could not read selection:", err && err.message);
    return null;
  }
  const found = results.map((r) => r && r.result).filter((r) => r && r.text);
  if (!found.length) return { text: "", isTop: true };
  return found.find((r) => r.focused) || found.find((r) => r.isTop) || found[0];
}

async function startPageTranslation(tabId, { text, selectionInTop, viaShortcut }) {
  await sendToTopFrame(tabId, {
    action: ACTIONS.TRANSLATE_IN_PAGE,
    text,
    selectionInTop: Boolean(selectionInTop),
    viaShortcut: Boolean(viaShortcut)
  });
}

// ---------- Entry points ----------

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId !== CONTEXT_MENU_ID || !tab || tab.id === undefined) return;
  const text = (info.selectionText || "").trim();
  if (!text) return;
  // info.frameId is 0 (or undefined) when the selection is in the top frame.
  startPageTranslation(tab.id, { text, selectionInTop: !info.frameId, viaShortcut: false });
});

chrome.commands.onCommand.addListener(async (command, tab) => {
  if (command !== COMMAND_TRANSLATE) return;
  let targetTab = tab;
  if (!targetTab) [targetTab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!targetTab || targetTab.id === undefined) return;

  const selection = await getSelectionFromTab(targetTab.id);
  if (!selection) return; // restricted page
  if (!selection.text) {
    await sendToTopFrame(targetTab.id, { action: ACTIONS.SHOW_ERROR_HUD, error: { code: CODES.NO_SELECTION } });
    return;
  }
  startPageTranslation(targetTab.id, { text: selection.text, selectionInTop: selection.isTop, viaShortcut: true });
});

// ---------- AI translation (BYOK) ----------

async function hasProviderPermission(engine) {
  try {
    return await chrome.permissions.contains({ origins: [...PROVIDER_ORIGINS[engine]] });
  } catch (_e) {
    return false;
  }
}

async function handleAiTranslate({ engine, text, sourceLang, targetLang, tone }) {
  if (!AI_ENGINES.includes(engine)) throw new QuickLensError(CODES.UNKNOWN, `engine ${engine}`);
  const apiKey = await self.VaultCrypto.getDecryptedApiKey(engine);
  if (!apiKey) throw new QuickLensError(CODES.NO_KEY, engine);
  if (!(await hasProviderPermission(engine))) throw new QuickLensError(CODES.PERMISSION_MISSING, engine);
  return self.QuickLensAI.translate(engine, { text, sourceLang, targetLang, tone, apiKey });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (sender.id !== chrome.runtime.id) return false;

  if (request.action === ACTIONS.AI_TRANSLATE) {
    handleAiTranslate(request)
      .then((res) => sendResponse({ ok: true, translatedText: res.translatedText }))
      .catch((err) => sendResponse({ ok: false, error: toPlain(err) }));
    return true;
  }

  if (request.action === ACTIONS.VAULT_GET_STATUS) {
    self.VaultCrypto.getApiKeyStatus()
      .then((status) => sendResponse({ ok: true, status }))
      .catch((err) => sendResponse({ ok: false, error: toPlain(err) }));
    return true;
  }

  if (request.action === ACTIONS.OPEN_OPTIONS) {
    chrome.runtime.openOptionsPage();
    sendResponse({ ok: true });
    return false;
  }

  return false;
});
