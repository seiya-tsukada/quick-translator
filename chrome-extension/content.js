/**
 * QuickLens - Isolated Content Script with Shadow DOM
 * Gmail、GitHub、SPA等の特殊なCSS・CSP環境下でも100%崩れないShadow DOM完全隔離設計
 */

(() => {
  if (window.__quickLensInitialized) return;
  window.__quickLensInitialized = true;

  // ホスト要素とShadowRootの参照
  let hostEl = null;
  let shadowRoot = null;
  let activeHudEl = null;
  let dismissTimer = null;

  // Shadow DOMホストの作成・確保
  function ensureShadowContainer() {
    if (hostEl && shadowRoot) return shadowRoot;

    hostEl = document.createElement("quicklens-lens-host");
    hostEl.style.all = "initial"; // ページの全CSS継承を遮断
    hostEl.style.position = "fixed";
    hostEl.style.bottom = "24px";
    hostEl.style.right = "24px";
    hostEl.style.zIndex = "2147483647"; // 最前面
    hostEl.style.pointerEvents = "none";

    // Closed Shadow Root でページ側からの侵入を遮断
    shadowRoot = hostEl.attachShadow({ mode: "closed" });

    // スタイルシートを直接挿入
    const style = document.createElement("style");
    style.textContent = getHudStyles();
    shadowRoot.appendChild(style);

    const container = document.createElement("div");
    container.id = "quicklens-root";
    shadowRoot.appendChild(container);

    (document.body || document.documentElement).appendChild(hostEl);
    return shadowRoot;
  }

  // Shadow DOM用の隔離スタイル
  function getHudStyles() {
    return `
      * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      }
      #quicklens-root {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 10px;
        pointer-events: none;
      }
      .quicklens-hud {
        pointer-events: auto;
        width: 380px;
        max-width: calc(100vw - 48px);
        background: #0f172a;
        color: #f8fafc;
        border: 1px solid #334155;
        border-radius: 16px;
        box-shadow: 0 20px 35px -5px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.08);
        overflow: hidden;
        animation: quicklens-pop 0.22s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        backdrop-filter: blur(12px);
      }
      @keyframes quicklens-pop {
        from { opacity: 0; transform: translateY(14px) scale(0.96); }
        to { opacity: 1; transform: translateY(0) scale(1); }
      }
      .quicklens-hud.closing {
        opacity: 0;
        transform: translateY(8px) scale(0.96);
        transition: all 0.18s ease;
      }
      .quicklens-bar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 9px 14px;
        background: #1e293b;
        border-bottom: 1px solid #334155;
      }
      .quicklens-brand {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.03em;
        color: #38bdf8;
      }
      .quicklens-pill {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        font-size: 10px;
        font-weight: 600;
        padding: 2px 7px;
        border-radius: 9999px;
        background: rgba(56, 189, 248, 0.12);
        color: #38bdf8;
        border: 1px solid rgba(56, 189, 248, 0.25);
      }
      .quicklens-pill.ai {
        background: rgba(168, 85, 247, 0.15);
        color: #c084fc;
        border-color: rgba(168, 85, 247, 0.3);
      }
      .quicklens-actions {
        display: flex;
        align-items: center;
        gap: 4px;
      }
      .quicklens-btn {
        background: transparent;
        border: none;
        padding: 4px 6px;
        border-radius: 6px;
        color: #94a3b8;
        font-size: 11px;
        font-weight: 500;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 4px;
        transition: all 0.15s ease;
      }
      .quicklens-btn:hover {
        background: #334155;
        color: #f8fafc;
      }
      .quicklens-btn.close:hover {
        background: #7f1d1d;
        color: #fca5a5;
      }
      .quicklens-body {
        padding: 14px;
        max-height: 280px;
        overflow-y: auto;
      }
      .quicklens-quote {
        font-size: 11px;
        color: #94a3b8;
        line-height: 1.45;
        padding-left: 8px;
        border-left: 2px solid #3b82f6;
        margin-bottom: 10px;
        word-break: break-word;
      }
      .quicklens-content {
        font-size: 13.5px;
        line-height: 1.6;
        color: #f8fafc;
        font-weight: 450;
        word-break: break-word;
        white-space: pre-wrap;
      }
      .quicklens-loading {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 16px 14px;
        font-size: 12px;
        color: #cbd5e1;
      }
      .quicklens-spinner {
        width: 15px;
        height: 15px;
        border: 2px solid #334155;
        border-top-color: #38bdf8;
        border-radius: 50%;
        animation: quicklens-spin 0.6s linear infinite;
      }
      @keyframes quicklens-spin {
        to { transform: rotate(360deg); }
      }
      .quicklens-footer {
        padding: 6px 14px;
        background: #090d16;
        border-top: 1px solid #1e293b;
        font-size: 10px;
        color: #64748b;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
    `;
  }

  // ローディングHUDの表示
  function showLoadingHud(text) {
    const root = ensureShadowContainer().getElementById("quicklens-root");
    dismissCurrentHud();

    const hud = document.createElement("div");
    hud.className = "quicklens-hud";
    activeHudEl = hud;

    const preview = text.length > 25 ? text.slice(0, 25) + "..." : text;

    hud.innerHTML = `
      <div class="quicklens-bar">
        <div class="quicklens-brand">
          <span>⚡ QuickLens</span>
        </div>
      </div>
      <div class="quicklens-loading">
        <div class="quicklens-spinner"></div>
        <div>解析中: 「${escapeHTML(preview)}」</div>
      </div>
    `;

    root.appendChild(hud);
  }

  // 翻訳結果HUDの表示
  function showTranslationHud(originalText, translatedText, targetLang, engineUsed, tone, duration = 10000) {
    const root = ensureShadowContainer().getElementById("quicklens-root");
    dismissCurrentHud();

    const hud = document.createElement("div");
    hud.className = "quicklens-hud";
    activeHudEl = hud;

    const isAi = engineUsed === "gemini" || engineUsed === "openai";
    const engineLabel = isAi ? (engineUsed === "gemini" ? "✨ Gemini AI" : "🧠 OpenAI") : "🆓 無料エンジン";
    const toneLabels = {
      natural: "自然な訳",
      business: "ビジネス敬語",
      summary: "要約",
      breakdown: "解説つき"
    };
    const toneLabel = toneLabels[tone] || "標準";

    const originalPreview = originalText.length > 90 ? originalText.slice(0, 90) + "..." : originalText;

    hud.innerHTML = `
      <div class="quicklens-bar">
        <div style="display: flex; align-items: center; gap: 6px;">
          <span class="quicklens-brand">⚡ QuickLens</span>
          <span class="quicklens-pill ${isAi ? "ai" : ""}">${engineLabel}</span>
          <span class="quicklens-pill">${toneLabel}</span>
        </div>
        <div class="quicklens-actions">
          <button class="quicklens-btn" id="ql-copy" title="翻訳文をコピー">
            📋 コピー
          </button>
          <button class="quicklens-btn" id="ql-speak" title="音声再生">
            🔊
          </button>
          <button class="quicklens-btn close" id="ql-close" title="閉じる (Esc)">
            ✕
          </button>
        </div>
      </div>
      <div class="quicklens-body">
        <div class="quicklens-quote">原文: ${escapeHTML(originalPreview)}</div>
        <div class="quicklens-content">${escapeHTML(translatedText)}</div>
      </div>
      <div class="quicklens-footer">
        <span>ターゲット: ${targetLang.toUpperCase()}</span>
        <span>Escで閉じる</span>
      </div>
    `;

    root.appendChild(hud);

    // コピーイベント
    const copyBtn = hud.querySelector("#ql-copy");
    copyBtn?.addEventListener("click", () => {
      navigator.clipboard.writeText(translatedText).then(() => {
        copyBtn.textContent = "✓ 完了";
        setTimeout(() => { if (copyBtn) copyBtn.textContent = "📋 コピー"; }, 1500);
      });
    });

    // 音声イベント
    const speakBtn = hud.querySelector("#ql-speak");
    speakBtn?.addEventListener("click", () => {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        const ut = new SpeechSynthesisUtterance(translatedText);
        ut.lang = targetLang;
        window.speechSynthesis.speak(ut);
      }
    });

    // 閉じるイベント
    const closeBtn = hud.querySelector("#ql-close");
    closeBtn?.addEventListener("click", () => dismissCurrentHud());

    // タイマー管理
    if (duration > 0) {
      dismissTimer = setTimeout(() => dismissCurrentHud(), duration);
      hud.addEventListener("mouseenter", () => clearTimeout(dismissTimer));
      hud.addEventListener("mouseleave", () => {
        dismissTimer = setTimeout(() => dismissCurrentHud(), 3500);
      });
    }
  }

  function showErrorHud(message) {
    const root = ensureShadowContainer().getElementById("quicklens-root");
    dismissCurrentHud();

    const hud = document.createElement("div");
    hud.className = "quicklens-hud";
    activeHudEl = hud;

    hud.innerHTML = `
      <div class="quicklens-bar">
        <span class="quicklens-brand" style="color: #ef4444;">⚠️ QuickLens エラー</span>
        <button class="quicklens-btn close" id="ql-close">✕</button>
      </div>
      <div class="quicklens-body" style="font-size: 12px; color: #fca5a5;">
        ${escapeHTML(message)}
      </div>
    `;

    root.appendChild(hud);
    hud.querySelector("#ql-close")?.addEventListener("click", () => dismissCurrentHud());
    setTimeout(() => dismissCurrentHud(), 5000);
  }

  function dismissCurrentHud() {
    if (dismissTimer) clearTimeout(dismissTimer);
    if (!activeHudEl) return;
    activeHudEl.classList.add("closing");
    const target = activeHudEl;
    activeHudEl = null;
    setTimeout(() => {
      if (target && target.parentNode) target.parentNode.removeChild(target);
    }, 180);
  }

  // Escキーで閉じる
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && activeHudEl) {
      dismissCurrentHud();
    }
  });

  // 多層的テキスト抽出（Gmail、入力欄、contenteditable対応）
  function extractPageSelection() {
    // 1. 標準セレクション
    const sel = window.getSelection();
    if (sel && sel.toString().trim()) {
      return sel.toString().trim();
    }

    // 2. アクティブなinput / textarea内の選択テキスト
    const active = document.activeElement;
    if (active && (active.tagName === "TEXTAREA" || active.tagName === "INPUT")) {
      const start = active.selectionStart;
      const end = active.selectionEnd;
      if (typeof start === "number" && typeof end === "number" && start !== end) {
        return active.value.substring(start, end).trim();
      }
    }

    return "";
  }

  function escapeHTML(str) {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // メッセージハンドラー
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "SHOW_LOADING_HUD") {
      showLoadingHud(request.text || "");
      sendResponse({ status: "ok" });
    } else if (request.action === "SHOW_TRANSLATION_HUD") {
      showTranslationHud(
        request.originalText,
        request.translatedText,
        request.targetLang,
        request.engineUsed,
        request.tone,
        request.duration
      );
      sendResponse({ status: "ok" });
    } else if (request.action === "SHOW_ERROR_HUD") {
      showErrorHud(request.errorMessage);
      sendResponse({ status: "ok" });
    } else if (request.action === "GET_SELECTED_TEXT") {
      const text = extractPageSelection();
      sendResponse({ selectionText: text });
    }
    return true;
  });
})();
