/**
 * QuickLens - Popup controller
 * On-device translation runs right here (the popup is a top-level extension page where the
 * Translator API is available); AI translation goes through the background service worker.
 */

document.addEventListener("DOMContentLoaded", async () => {
  const { DEFAULT_SETTINGS, ACTIONS, TIMING, QUICK_LANGUAGES, TONES, ENGINE_TONES, AI_ENGINES, DONATION_URL } =
    globalThis.QUICKLENS_CONFIG;
  const { CODES, messageKey, reasonKey } = globalThis.QuickLensErrors;
  const Lang = globalThis.QuickLensLanguages;
  const I18n = globalThis.QuickLensI18n;
  const Icons = globalThis.QuickLensIcons;
  const Theme = globalThis.QuickLensTheme;
  const Client = globalThis.QuickLensClient;
  const Usage = globalThis.QuickLensUsage;
  const t = I18n.t;

  const $ = (id) => document.getElementById(id);
  const engineSelect = $("engine-select");
  const engineHint = $("engine-hint");
  const langRow = $("lang-row");
  const toneRow = $("tone-row");
  const toneHint = $("tone-hint");
  const sourceInput = $("source-input");
  const charCount = $("char-count");
  const translateBtn = $("translate-btn");
  const translateSpinner = $("translate-spinner");
  const translateLabel = $("translate-label");
  const resultBody = $("result-body");
  const resultEngine = $("result-engine");
  const progress = $("progress");
  const notice = $("notice");
  const noticeText = $("notice-text");
  const resultActions = $("result-actions");
  const copyBtn = $("copy-btn");
  const copyLabel = $("copy-label");

  const settings = await chrome.storage.sync.get(DEFAULT_SETTINGS);
  Theme.applyToDocument(settings.theme);
  I18n.apply();

  let keyStatus = { gemini: false, openai: false, deepl: false };
  let output = "";
  let running = false;

  // ---------- Build controls ----------

  function buildLanguageControls() {
    langRow.innerHTML = "";
    QUICK_LANGUAGES.forEach((code) => {
      const b = document.createElement("button");
      b.className = "pill";
      b.type = "button";
      b.dataset.lang = code;
      b.textContent = Lang.nativeName(code);
      b.setAttribute("aria-pressed", String(settings.targetLang === code));
      b.addEventListener("click", () => setTargetLang(code));
      langRow.appendChild(b);
    });
    const more = document.createElement("select");
    more.className = "select more-select";
    more.setAttribute("aria-label", t("moreLanguages"));
    const first = document.createElement("option");
    first.value = "";
    first.textContent = t("moreLanguages");
    more.appendChild(first);
    Lang.codes().filter((c) => !QUICK_LANGUAGES.includes(c)).forEach((c) => {
      const o = document.createElement("option");
      o.value = c;
      o.textContent = Lang.nativeName(c);
      more.appendChild(o);
    });
    if (!QUICK_LANGUAGES.includes(settings.targetLang)) more.value = settings.targetLang;
    more.addEventListener("change", () => more.value && setTargetLang(more.value));
    langRow.appendChild(more);
  }

  function buildToneControls() {
    toneRow.innerHTML = "";
    TONES.forEach((tone) => {
      const b = document.createElement("button");
      b.className = "pill";
      b.type = "button";
      b.dataset.tone = tone;
      b.textContent = t(`tone_${tone}`);
      b.addEventListener("click", () => setTone(tone));
      toneRow.appendChild(b);
    });
  }

  function refreshLanguageUI() {
    langRow.querySelectorAll(".pill").forEach((p) => p.setAttribute("aria-pressed", String(p.dataset.lang === settings.targetLang)));
    const more = langRow.querySelector("select");
    more.value = QUICK_LANGUAGES.includes(settings.targetLang) ? "" : settings.targetLang;
  }

  function refreshToneUI() {
    const allowed = ENGINE_TONES[settings.engine] || ENGINE_TONES.free;
    toneRow.querySelectorAll(".pill").forEach((p) => {
      const ok = allowed.includes(p.dataset.tone);
      p.disabled = !ok;
      p.setAttribute("aria-pressed", String(ok && p.dataset.tone === settings.tone));
    });
    if (settings.engine === "free") {
      toneHint.textContent = t("toneHintFree");
      toneHint.hidden = false;
    } else if (!allowed.includes(settings.tone)) {
      toneHint.textContent = t("hudToneNotSupported", [t(`engine_${settings.engine}`)]);
      toneHint.hidden = false;
    } else {
      toneHint.hidden = true;
    }
  }

  function refreshEngineUI() {
    engineSelect.value = settings.engine;
    const needsKey = AI_ENGINES.includes(settings.engine) && !keyStatus[settings.engine];
    engineHint.hidden = !needsKey;
    if (needsKey) $("engine-hint-text").textContent = t("engineNoKeyHint", [t(`engine_${settings.engine}`)]);
    refreshToneUI();
  }

  async function save(patch) {
    Object.assign(settings, patch);
    await chrome.storage.sync.set(patch);
  }

  async function setTargetLang(code) {
    await save({ targetLang: code });
    refreshLanguageUI();
    if (sourceInput.value.trim()) translate();
  }

  async function setTone(tone) {
    await save({ tone });
    refreshToneUI();
    if (sourceInput.value.trim()) translate();
  }

  engineSelect.addEventListener("change", async () => {
    await save({ engine: engineSelect.value });
    refreshEngineUI();
  });

  const openOptions = () => chrome.runtime.openOptionsPage();
  $("open-options").addEventListener("click", openOptions);
  $("engine-hint-link").addEventListener("click", openOptions);

  // ---------- Result rendering ----------

  function setBusy(busy) {
    running = busy;
    translateBtn.disabled = busy;
    translateSpinner.hidden = !busy;
    translateLabel.textContent = busy ? t("translatingButton") : t("translateButton");
  }

  function showNotice(text) {
    noticeText.textContent = text || "";
    notice.hidden = !text;
  }

  function showResultActions(actions) {
    resultActions.innerHTML = "";
    resultActions.hidden = !actions.length;
    actions.forEach((a) => {
      const b = document.createElement("button");
      b.className = `btn ${a.primary ? "primary" : ""}`;
      b.type = "button";
      b.innerHTML = Icons.svg(a.icon, 13);
      b.append(a.label);
      b.addEventListener("click", a.onClick);
      resultActions.appendChild(b);
    });
  }

  function renderPlaceholder(key) {
    resultBody.textContent = t(key);
    resultBody.classList.add("placeholder");
    resultEngine.textContent = "";
    output = "";
  }

  function renderError(err) {
    const code = (err && err.code) || CODES.UNKNOWN;
    let text = t(messageKey(code));
    if (err && err.aiFailure) {
      text = `${t("hudAiFailedAlso", [t(`engine_${err.aiFailure.from}`), t(reasonKey(err.aiFailure.reason))])}\n${text}`;
    }
    resultBody.textContent = text;
    resultBody.classList.add("placeholder");
    output = "";
    const actions = [];
    if (code === CODES.MODEL_DOWNLOAD_REQUIRED) {
      actions.push({ icon: "download", label: t("hudDownloadAndContinue"), primary: true, onClick: () => translate() });
    }
    if (code !== CODES.MODEL_DOWNLOAD_REQUIRED && code !== CODES.NETWORK && code !== CODES.NO_SELECTION) {
      actions.push({ icon: "key", label: AI_ENGINES.includes(settings.engine) ? t("hudOpenSettings") : t("hudRegisterKey"), onClick: openOptions });
    }
    showResultActions(actions);
  }

  async function translate() {
    const text = sourceInput.value.trim();
    if (!text) {
      renderPlaceholder("resultEmpty");
      return;
    }
    if (running) return;
    setBusy(true);
    showNotice("");
    showResultActions([]);
    progress.hidden = true;
    resultBody.textContent = t("translatingButton");
    resultBody.classList.add("placeholder");

    try {
      const result = await Client.translate({
        text,
        engine: settings.engine,
        tone: settings.tone,
        sourceLang: settings.sourceLang,
        targetLang: settings.targetLang,
        onDownloadProgress: (f) => {
          const pct = Math.round(Math.max(0, Math.min(1, f)) * 100);
          progress.hidden = false;
          progress.firstElementChild.style.width = `${pct}%`;
          resultBody.textContent = t("hudDownloadingModel", [String(pct)]);
        },
        onChunkProgress: (d, n) => {
          if (n > 1) resultBody.textContent = t("hudTranslatingChunks", [String(d), String(n)]);
        }
      });
      output = result.translatedText;
      resultBody.textContent = output;
      resultBody.classList.remove("placeholder");
      resultEngine.textContent = `· ${t(`engine_${result.engineUsed}`)}`;
      if (result.fallback) {
        showNotice(t("hudFallbackNotice", [t(`engine_${result.fallback.from}`), t(reasonKey(result.fallback.reason))]));
        showResultActions([{ icon: "key", label: t("hudOpenSettings"), onClick: openOptions }]);
      } else if (result.toneAdjusted && AI_ENGINES.includes(result.engineUsed)) {
        showNotice(t("hudToneNotSupported", [t(`engine_${result.engineUsed}`)]));
      }
      refreshDonation();
    } catch (err) {
      renderError(err);
    } finally {
      progress.hidden = true;
      setBusy(false);
    }
  }

  translateBtn.addEventListener("click", translate);
  sourceInput.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      translate();
    }
  });
  sourceInput.addEventListener("input", () => { charCount.textContent = String(sourceInput.value.length); });
  $("clear-source").addEventListener("click", () => {
    sourceInput.value = "";
    charCount.textContent = "0";
    renderPlaceholder("resultPlaceholder");
    showNotice("");
    showResultActions([]);
    sourceInput.focus();
  });

  copyBtn.addEventListener("click", async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      copyLabel.textContent = t("hudCopied");
    } catch (_e) {
      copyLabel.textContent = t("hudCopyFailed");
    }
    setTimeout(() => { copyLabel.textContent = t("hudCopyShort"); }, TIMING.BUTTON_FEEDBACK);
  });

  $("speak-btn").addEventListener("click", () => {
    if (!output || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(output);
    u.lang = settings.targetLang;
    window.speechSynthesis.speak(u);
  });

  // ---------- Donation footer (only after N translations; dismiss = snooze) ----------

  async function refreshDonation() {
    const footer = $("donate-footer");
    try {
      const state = await Usage.getDonationState();
      footer.hidden = !state.show;
      if (state.show) $("donate-link").href = DONATION_URL;
    } catch (_e) {
      footer.hidden = true;
    }
  }

  $("donate-dismiss").addEventListener("click", async () => {
    await Usage.dismissDonationPrompt();
    $("donate-footer").hidden = true;
  });

  // ---------- Init ----------

  buildLanguageControls();
  buildToneControls();
  Icons.hydrate();
  try {
    const res = await chrome.runtime.sendMessage({ action: ACTIONS.VAULT_GET_STATUS });
    if (res && res.ok) keyStatus = res.status;
  } catch (_e) {
    // keep defaults
  }
  refreshEngineUI();
  refreshLanguageUI();
  renderPlaceholder("resultPlaceholder");
  refreshDonation();

  // Pick up the selection from the active tab (opening the popup grants activeTab).
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab && tab.id !== undefined) {
      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id, allFrames: true },
        func: () => {
          const s = window.getSelection();
          if (s && s.toString().trim()) return { text: s.toString().trim(), focused: document.hasFocus() };
          const a = document.activeElement;
          if (a && (a.tagName === "TEXTAREA" || a.tagName === "INPUT") && typeof a.selectionStart === "number") {
            return { text: a.value.substring(a.selectionStart, a.selectionEnd).trim(), focused: document.hasFocus() };
          }
          return { text: "", focused: false };
        }
      });
      const found = results.map((r) => r && r.result).filter((r) => r && r.text);
      const pick = found.find((r) => r.focused) || found[0];
      if (pick) {
        sourceInput.value = pick.text;
        charCount.textContent = String(pick.text.length);
        if (settings.autoTranslatePopup) translate();
      }
    }
  } catch (_e) {
    // Restricted page (chrome://, Web Store, etc.) — manual input still works.
  }
  sourceInput.focus();
});
