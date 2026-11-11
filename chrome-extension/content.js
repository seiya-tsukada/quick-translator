/**
 * QuickLens - In-page HUD (injected on demand into the top frame only)
 * Rendered inside a closed Shadow DOM so page CSS does not leak in and our CSS does not leak out.
 */

(() => {
  if (window.__quickLensInitialized) return;
  window.__quickLensInitialized = true;

  const { ACTIONS, TIMING, HUD, DEFAULT_SETTINGS, AI_ENGINES } = globalThis.QUICKLENS_CONFIG;
  const { CODES, messageKey, reasonKey } = globalThis.QuickLensErrors;
  const Icons = globalThis.QuickLensIcons;
  const Theme = globalThis.QuickLensTheme;
  const Client = globalThis.QuickLensClient;
  const Lang = globalThis.QuickLensLanguages;
  const Position = globalThis.QuickLensHudPosition;

  const t = (key, subs) => chrome.i18n.getMessage(key, subs) || key;

  let hostEl = null;
  let shadowRoot = null;
  let activeHudEl = null;
  let dismissTimer = null;
  let requestSeq = 0;

  // Where to return focus/selection when the HUD closes
  let restoreState = null;

  // ---------- Shadow DOM host ----------

  function ensureShadowContainer() {
    if (hostEl && shadowRoot && hostEl.isConnected) return shadowRoot;

    hostEl = document.createElement("quicklens-lens-host");
    hostEl.style.all = "initial";
    hostEl.style.position = "fixed";
    hostEl.style.zIndex = "2147483647";
    hostEl.style.pointerEvents = "none";

    shadowRoot = hostEl.attachShadow({ mode: "closed" });
    const style = document.createElement("style");
    style.textContent = getHudStyles();
    shadowRoot.appendChild(style);

    const container = document.createElement("div");
    container.id = "quicklens-root";
    shadowRoot.appendChild(container);

    (document.body || document.documentElement).appendChild(hostEl);
    return shadowRoot;
  }

  function getHudStyles() {
    return `
      * { box-sizing: border-box; margin: 0; padding: 0;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; }
      #quicklens-root { pointer-events: none; }
      .hud {
        --bg: #ffffff; --bar: #f1f5f9; --border: #d8dee8; --text: #0f172a; --muted: #475569;
        --accent: #0369a1; --accent-soft: rgba(3,105,161,.10); --ai: #7e22ce; --ai-soft: rgba(126,34,206,.10);
        --danger: #b91c1c; --warn-bg: #fef3c7; --warn-text: #78350f; --hover: #e2e8f0; --focus: #0284c7;
        pointer-events: auto; width: ${HUD.WIDTH}px; max-width: calc(100vw - ${HUD.MARGIN * 2}px);
        background: var(--bg); color: var(--text); border: 1px solid var(--border); border-radius: 14px;
        box-shadow: 0 18px 36px -8px rgba(15,23,42,.30); overflow: hidden;
        animation: pop .2s cubic-bezier(.16,1,.3,1) forwards;
      }
      .hud[data-theme="dark"] {
        --bg: #0f172a; --bar: #1e293b; --border: #334155; --text: #f8fafc; --muted: #94a3b8;
        --accent: #38bdf8; --accent-soft: rgba(56,189,248,.12); --ai: #c084fc; --ai-soft: rgba(192,132,252,.14);
        --danger: #fca5a5; --warn-bg: #422006; --warn-text: #fde68a; --hover: #334155; --focus: #38bdf8;
      }
      @media (prefers-reduced-motion: reduce) { .hud { animation: none; } }
      @keyframes pop { from { opacity: 0; transform: translateY(8px) scale(.98); } to { opacity: 1; transform: none; } }
      .hud.closing { opacity: 0; transition: opacity .18s ease; }
      .bar { display: flex; align-items: center; justify-content: space-between; gap: 8px;
             padding: 8px 10px 8px 12px; background: var(--bar); border-bottom: 1px solid var(--border); }
      .brand { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 700; color: var(--accent); }
      .brand.error { color: var(--danger); }
      .pills { display: flex; align-items: center; gap: 6px; min-width: 0; flex-wrap: wrap; }
      .pill { display: inline-flex; align-items: center; gap: 4px; font-size: 10.5px; font-weight: 600;
              padding: 2px 7px; border-radius: 999px; background: var(--accent-soft); color: var(--accent); }
      .pill.ai { background: var(--ai-soft); color: var(--ai); }
      .actions { display: flex; align-items: center; gap: 2px; flex-shrink: 0; }
      button { font: inherit; }
      .btn { background: transparent; border: 0; padding: 5px 7px; border-radius: 6px; color: var(--muted);
             font-size: 11.5px; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 4px; }
      .btn:hover { background: var(--hover); color: var(--text); }
      .btn:focus-visible, .link:focus-visible, .primary:focus-visible { outline: 2px solid var(--focus); outline-offset: 1px; }
      .body { padding: 12px 14px; max-height: 300px; overflow-y: auto; }
      .quote { font-size: 11.5px; color: var(--muted); line-height: 1.45; padding-left: 8px;
               border-left: 2px solid var(--accent); margin-bottom: 10px; word-break: break-word; }
      .content { font-size: 14px; line-height: 1.6; word-break: break-word; white-space: pre-wrap; }
      .notice { display: flex; gap: 6px; align-items: flex-start; font-size: 11.5px; line-height: 1.45;
                background: var(--warn-bg); color: var(--warn-text); padding: 7px 10px; border-radius: 8px; margin-bottom: 10px; }
      .notice svg { flex-shrink: 0; margin-top: 1px; }
      .loading { display: flex; flex-direction: column; gap: 8px; padding: 14px; font-size: 12.5px; color: var(--muted); }
      .loading-row { display: flex; align-items: center; gap: 10px; }
      .spinner { width: 15px; height: 15px; border: 2px solid var(--border); border-top-color: var(--accent);
                 border-radius: 50%; animation: spin .6s linear infinite; flex-shrink: 0; }
      @media (prefers-reduced-motion: reduce) { .spinner { animation-duration: 2s; } }
      @keyframes spin { to { transform: rotate(360deg); } }
      .progress { height: 4px; border-radius: 999px; background: var(--border); overflow: hidden; }
      .progress > div { height: 100%; background: var(--accent); width: 0; transition: width .2s ease; }
      .error-text { font-size: 12.5px; line-height: 1.55; }
      .error-actions { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 10px; }
      .primary { background: var(--accent); color: var(--bg); border: 0; border-radius: 7px; padding: 6px 12px;
                 font-size: 12px; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; }
      .link { background: transparent; border: 1px solid var(--border); color: var(--text); border-radius: 7px;
              padding: 5px 10px; font-size: 12px; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; }
      .footer { padding: 6px 12px; border-top: 1px solid var(--border); font-size: 10.5px; color: var(--muted);
                display: flex; justify-content: space-between; gap: 8px; }
      .sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
    `;
  }

  // ---------- Settings / placement ----------

  async function loadSettings() {
    try {
      return await chrome.storage.sync.get(DEFAULT_SETTINGS);
    } catch (_e) {
      return { ...DEFAULT_SETTINGS };
    }
  }

  function captureSelectionAnchor(selectionInTop) {
    const prevFocus = document.activeElement;
    let range = null;
    let rect = null;
    if (selectionInTop) {
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0 && sel.toString().trim()) {
        range = sel.getRangeAt(0).cloneRange();
        const r = range.getBoundingClientRect();
        rect = { left: r.left, top: r.top, right: r.right, bottom: r.bottom };
      } else if (prevFocus && typeof prevFocus.getBoundingClientRect === "function" &&
                 (prevFocus.tagName === "TEXTAREA" || prevFocus.tagName === "INPUT")) {
        const r = prevFocus.getBoundingClientRect();
        rect = { left: r.left, top: r.top, right: r.right, bottom: r.bottom };
      }
    }
    const inputSel = prevFocus && typeof prevFocus.selectionStart === "number"
      ? { start: prevFocus.selectionStart, end: prevFocus.selectionEnd } : null;
    return { prevFocus, range, rect, inputSel };
  }

  function placeHost(settings, anchor, hudEl) {
    const resetCorner = () => {
      hostEl.style.top = "auto";
      hostEl.style.left = "auto";
      hostEl.style.right = "24px";
      hostEl.style.bottom = "24px";
    };
    if (settings.hudPosition !== "selection" || !anchor || !anchor.rect) {
      resetCorner();
      return;
    }
    const hudHeight = hudEl ? hudEl.getBoundingClientRect().height || HUD.ESTIMATED_HEIGHT : HUD.ESTIMATED_HEIGHT;
    const pos = Position.computeNearSelection({
      rect: anchor.rect,
      viewport: { width: window.innerWidth, height: window.innerHeight },
      hudWidth: HUD.WIDTH,
      hudHeight,
      margin: HUD.MARGIN,
      gap: HUD.GAP_FROM_SELECTION
    });
    if (!pos) {
      resetCorner();
      return;
    }
    hostEl.style.right = "auto";
    hostEl.style.bottom = "auto";
    hostEl.style.left = `${pos.left}px`;
    hostEl.style.top = `${pos.top}px`;
  }

  // ---------- HUD lifecycle ----------

  function createHud(settings, labelKey) {
    const root = ensureShadowContainer().getElementById("quicklens-root");
    removeHudImmediately();
    const hud = document.createElement("div");
    hud.className = "hud";
    hud.setAttribute("role", "dialog");
    hud.setAttribute("aria-label", t(labelKey));
    hud.setAttribute("data-theme", Theme.resolve(settings.theme));
    root.appendChild(hud);
    activeHudEl = hud;

    // Pause auto-dismiss while the pointer or focus is inside
    hud.addEventListener("mouseenter", clearDismissTimer);
    hud.addEventListener("focusin", clearDismissTimer);
    return hud;
  }

  function clearDismissTimer() {
    if (dismissTimer) clearTimeout(dismissTimer);
    dismissTimer = null;
  }

  function scheduleDismiss(hud, duration) {
    clearDismissTimer();
    if (!(duration > 0)) return;
    dismissTimer = setTimeout(() => dismissCurrentHud(), duration);
    hud.addEventListener("mouseleave", () => {
      if (shadowRoot.activeElement) return; // keyboard user still inside
      clearDismissTimer();
      dismissTimer = setTimeout(() => dismissCurrentHud(), TIMING.HUD_RESUME_DISMISS);
    });
  }

  function removeHudImmediately() {
    clearDismissTimer();
    if (activeHudEl && activeHudEl.parentNode) activeHudEl.parentNode.removeChild(activeHudEl);
    activeHudEl = null;
  }

  function restoreFocusAndSelection() {
    const state = restoreState;
    restoreState = null;
    if (!state) return;
    try {
      const el = state.prevFocus;
      if (el && el !== document.body && el.isConnected && typeof el.focus === "function") {
        el.focus({ preventScroll: true });
        if (state.inputSel && typeof el.setSelectionRange === "function") {
          el.setSelectionRange(state.inputSel.start, state.inputSel.end);
        }
      }
      if (state.range) {
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(state.range);
      }
    } catch (_e) {
      // Page may have changed; nothing to restore.
    }
  }

  function dismissCurrentHud() {
    clearDismissTimer();
    if (!activeHudEl) return;
    const target = activeHudEl;
    const hadFocus = Boolean(shadowRoot && shadowRoot.activeElement);
    activeHudEl = null;
    requestSeq += 1; // cancel any in-flight render
    target.classList.add("closing");
    setTimeout(() => target.remove(), TIMING.HUD_CLOSE_ANIMATION);
    if (hadFocus) restoreFocusAndSelection();
    else restoreState = null;
  }

  window.addEventListener(
    "keydown",
    (e) => {
      if (e.key === "Escape" && activeHudEl) {
        e.stopPropagation();
        dismissCurrentHud();
      }
    },
    true
  );

  // ---------- Renderers ----------

  function escapeHTML(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function truncate(text, maxLength) {
    return text.length > maxLength ? `${text.slice(0, maxLength)}…` : text;
  }

  /**
   * Clipboard API first; some pages block it (e.g. Permissions-Policy), so fall back to
   * execCommand("copy") on a temporary textarea inside our shadow root (still within the click).
   */
  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (_e) {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.cssText = "position:fixed;opacity:0;pointer-events:none;left:0;top:0;";
      shadowRoot.appendChild(ta);
      ta.select();
      let ok = false;
      try {
        ok = document.execCommand("copy");
      } catch (_e2) {
        ok = false;
      }
      ta.remove();
      return ok;
    }
  }

  function engineLabel(engine) {
    return t(`engine_${engine}`);
  }

  function closeButtonHtml() {
    return `<button class="btn" data-act="close" aria-label="${escapeHTML(t("hudClose"))}" title="${escapeHTML(t("hudClose"))}">${Icons.svg("close")}</button>`;
  }

  function showLoading(settings, anchor, text, engine) {
    const hud = createHud(settings, "hudLoadingLabel");
    hud.setAttribute("aria-busy", "true");
    hud.innerHTML = `
      <div class="bar">
        <span class="brand">${Icons.svg("lens")}QuickLens</span>
        <div class="actions">${closeButtonHtml()}</div>
      </div>
      <div class="loading" role="status" aria-live="polite">
        <div class="loading-row">
          <div class="spinner" aria-hidden="true"></div>
          <div data-ref="status">${escapeHTML(t("hudTranslating", [truncate(text, HUD.LOADING_PREVIEW_LENGTH), engineLabel(engine)]))}</div>
        </div>
        <div class="progress" data-ref="progress" hidden><div></div></div>
      </div>`;
    hud.querySelector('[data-act="close"]').addEventListener("click", dismissCurrentHud);
    placeHost(settings, anchor, hud);
    return {
      setDownload(fraction) {
        const pct = Math.round(Math.max(0, Math.min(1, fraction)) * 100);
        hud.querySelector('[data-ref="status"]').textContent = t("hudDownloadingModel", [String(pct)]);
        const bar = hud.querySelector('[data-ref="progress"]');
        bar.hidden = false;
        bar.firstElementChild.style.width = `${pct}%`;
      },
      setChunks(done, total) {
        if (total <= 1) return;
        hud.querySelector('[data-ref="status"]').textContent = t("hudTranslatingChunks", [String(done), String(total)]);
      }
    };
  }

  function showResult(settings, anchor, originalText, result, focusHud) {
    const hud = createHud(settings, "hudResultLabel");
    const isAi = AI_ENGINES.includes(result.engineUsed);
    const notices = [];
    if (result.fallback) {
      notices.push(t("hudFallbackNotice", [engineLabel(result.fallback.from), t(reasonKey(result.fallback.reason))]));
    } else if (result.toneAdjusted && isAi) {
      notices.push(t("hudToneNotSupported", [engineLabel(result.engineUsed)]));
    }
    const toneLabel = isAi ? t(`tone_${result.tone}`) : "";

    hud.innerHTML = `
      <div class="bar">
        <div class="pills">
          <span class="brand">${Icons.svg("lens")}QuickLens</span>
          <span class="pill ${isAi ? "ai" : ""}">${Icons.svg(isAi ? "sparkles" : "device", 12)}${escapeHTML(engineLabel(result.engineUsed))}</span>
          ${toneLabel ? `<span class="pill">${escapeHTML(toneLabel)}</span>` : ""}
        </div>
        <div class="actions">
          <button class="btn" data-act="copy" aria-label="${escapeHTML(t("hudCopy"))}" title="${escapeHTML(t("hudCopy"))}">${Icons.svg("copy")}<span data-ref="copy-label">${escapeHTML(t("hudCopyShort"))}</span></button>
          <button class="btn" data-act="speak" aria-label="${escapeHTML(t("hudSpeak"))}" title="${escapeHTML(t("hudSpeak"))}">${Icons.svg("speaker")}</button>
          ${closeButtonHtml()}
        </div>
      </div>
      <div class="body">
        ${notices.map((n) => `<div class="notice" role="note">${Icons.svg("info", 13)}<span>${escapeHTML(n)}</span></div>`).join("")}
        ${result.fallback ? `<div class="error-actions" style="margin:-4px 0 10px"><button class="link" data-act="options">${Icons.svg("key", 13)}${escapeHTML(t("hudOpenSettings"))}</button></div>` : ""}
        <div class="quote"><span class="sr-only">${escapeHTML(t("hudOriginal"))}: </span>${escapeHTML(truncate(originalText, HUD.ORIGINAL_PREVIEW_LENGTH))}</div>
        <div class="content" aria-live="polite">${escapeHTML(result.translatedText)}</div>
      </div>
      <div class="footer">
        <span>${escapeHTML(t("hudTarget", [Lang.nativeName(settings.targetLang)]))}</span>
        <span>${escapeHTML(t("hudEscToClose"))}</span>
      </div>`;

    const copyBtn = hud.querySelector('[data-act="copy"]');
    copyBtn.addEventListener("click", async () => {
      const label = copyBtn.querySelector('[data-ref="copy-label"]');
      const copied = await copyText(result.translatedText);
      label.textContent = copied ? t("hudCopied") : t("hudCopyFailed");
      if (!copied) copyBtn.focus({ preventScroll: true });
      setTimeout(() => { label.textContent = t("hudCopyShort"); }, TIMING.BUTTON_FEEDBACK);
    });

    hud.querySelector('[data-act="speak"]').addEventListener("click", () => {
      if (!("speechSynthesis" in window)) return;
      window.speechSynthesis.cancel();
      const ut = new SpeechSynthesisUtterance(result.translatedText);
      ut.lang = settings.targetLang;
      window.speechSynthesis.speak(ut);
    });
    hud.querySelector('[data-act="close"]').addEventListener("click", dismissCurrentHud);
    const optBtn = hud.querySelector('[data-act="options"]');
    if (optBtn) optBtn.addEventListener("click", openOptions);

    placeHost(settings, anchor, hud);
    if (focusHud) copyBtn.focus({ preventScroll: true });
    else scheduleDismiss(hud, Number(settings.toastDuration));
  }

  function errorActionsFor(code) {
    const actions = [];
    if (code === CODES.MODEL_DOWNLOAD_REQUIRED) actions.push({ act: "retry", icon: "download", label: t("hudDownloadAndContinue"), primary: true });
    if ([CODES.AUTH, CODES.NO_KEY, CODES.PERMISSION_MISSING, CODES.QUOTA].includes(code)) {
      actions.push({ act: "options", icon: "key", label: t("hudOpenSettings") });
    }
    if ([CODES.BUILTIN_UNAVAILABLE, CODES.MODEL_UNAVAILABLE, CODES.UNSUPPORTED_LANG, CODES.DETECTION_FAILED].includes(code)) {
      actions.push({ act: "options", icon: "key", label: t("hudRegisterKey") });
    }
    return actions;
  }

  /**
   * @param {object} err plain {code, detail, aiFailure?}
   * @param {Function} [onRetry] used for MODEL_DOWNLOAD_REQUIRED (the click gives user activation)
   */
  function showError(settings, anchor, err, onRetry, focusHud) {
    const hud = createHud(settings, "hudErrorLabel");
    const code = (err && err.code) || CODES.UNKNOWN;
    const lines = [t(messageKey(code))];
    if (err && err.aiFailure) {
      lines.unshift(t("hudAiFailedAlso", [engineLabel(err.aiFailure.from), t(reasonKey(err.aiFailure.reason))]));
    }
    const actions = errorActionsFor(code);

    hud.innerHTML = `
      <div class="bar">
        ${code === CODES.MODEL_DOWNLOAD_REQUIRED
          ? `<span class="brand">${Icons.svg("download")}${escapeHTML(t("hudSetupTitle"))}</span>`
          : `<span class="brand error">${Icons.svg("alert")}${escapeHTML(t("hudErrorTitle"))}</span>`}
        <div class="actions">${closeButtonHtml()}</div>
      </div>
      <div class="body" role="${code === CODES.MODEL_DOWNLOAD_REQUIRED ? "status" : "alert"}">
        ${lines.map((l) => `<p class="error-text">${escapeHTML(l)}</p>`).join("")}
        ${actions.length ? `<div class="error-actions">${actions.map((a) =>
          `<button class="${a.primary ? "primary" : "link"}" data-act="${a.act}">${Icons.svg(a.icon, 13)}${escapeHTML(a.label)}</button>`).join("")}</div>` : ""}
      </div>`;

    hud.querySelector('[data-act="close"]').addEventListener("click", dismissCurrentHud);
    hud.querySelectorAll('[data-act="options"]').forEach((b) => b.addEventListener("click", openOptions));
    const retry = hud.querySelector('[data-act="retry"]');
    if (retry && onRetry) retry.addEventListener("click", onRetry);

    placeHost(settings, anchor, hud);
    const firstAction = hud.querySelector(".error-actions button") || hud.querySelector('[data-act="close"]');
    if (focusHud || retry) firstAction.focus({ preventScroll: true });
    // Errors that need an action stay open; others close after a while.
    if (!actions.length && !focusHud) scheduleDismiss(hud, TIMING.ERROR_HUD_DURATION);
  }

  function openOptions() {
    chrome.runtime.sendMessage({ action: ACTIONS.OPEN_OPTIONS }).catch(() => {});
    dismissCurrentHud();
  }

  // ---------- Translation flow ----------

  async function runInPage({ text, selectionInTop, viaShortcut }) {
    const seq = ++requestSeq;
    const settings = await loadSettings();
    const anchor = captureSelectionAnchor(selectionInTop);
    restoreState = anchor;

    const attempt = async (focusHud) => {
      const mySeq = ++requestSeq;
      const loading = showLoading(settings, anchor, text, settings.engine);
      try {
        const result = await Client.translate({
          text,
          engine: settings.engine,
          tone: settings.tone,
          sourceLang: settings.sourceLang,
          targetLang: settings.targetLang,
          onDownloadProgress: (f) => mySeq === requestSeq && loading.setDownload(f),
          onChunkProgress: (d, n) => mySeq === requestSeq && loading.setChunks(d, n)
        });
        if (mySeq !== requestSeq) return; // closed or superseded
        showResult(settings, anchor, text, result, focusHud);
      } catch (err) {
        if (mySeq !== requestSeq) return;
        const plain = { code: (err && err.code) || CODES.UNKNOWN, detail: err && err.detail, aiFailure: err && err.aiFailure };
        if (plain.code === CODES.UNKNOWN) console.warn("[QuickLens]", err);
        // The retry click provides the user activation needed to download the model.
        showError(settings, anchor, plain, () => attempt(true), focusHud);
      }
    };

    if (seq !== requestSeq) return;
    await attempt(viaShortcut);
  }

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (sender.id !== chrome.runtime.id) return false;
    if (request.action === ACTIONS.PING) {
      sendResponse({ ok: true });
      return false;
    }
    if (request.action === ACTIONS.TRANSLATE_IN_PAGE) {
      runInPage(request);
      sendResponse({ ok: true });
      return false;
    }
    if (request.action === ACTIONS.SHOW_ERROR_HUD) {
      loadSettings().then((settings) => {
        restoreState = captureSelectionAnchor(false);
        showError(settings, null, request.error || { code: CODES.UNKNOWN }, null, true);
      });
      sendResponse({ ok: true });
      return false;
    }
    return false;
  });
})();
