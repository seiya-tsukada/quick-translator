/**
 * QuickLens - Popup Controller
 * @license Apache-2.0
 */

document.addEventListener("DOMContentLoaded", async () => {
  // UI References
  const engineToggleBtn = document.getElementById("engine-toggle-btn");
  const engineBadgeText = document.getElementById("engine-badge-text");
  const vaultDrawer = document.getElementById("vault-drawer");
  const geminiKeyInput = document.getElementById("gemini-key-input");
  const saveGeminiBtn = document.getElementById("save-gemini-btn");
  const openaiKeyInput = document.getElementById("openai-key-input");
  const saveOpenaiBtn = document.getElementById("save-openai-btn");
  const chipFree = document.getElementById("chip-free");
  const chipGemini = document.getElementById("chip-gemini");
  const chipOpenai = document.getElementById("chip-openai");

  const langPills = document.querySelectorAll(".lang-pill");
  const moreLangSelect = document.getElementById("more-lang-select");
  const toneTabs = document.querySelectorAll(".tone-tab");

  const sourceInput = document.getElementById("source-input");
  const sourceCharCount = document.getElementById("source-char-count");
  const clearSourceBtn = document.getElementById("clear-source-btn");
  const detectedBadge = document.getElementById("detected-badge");

  const triggerBtn = document.getElementById("trigger-btn");
  const triggerSpinner = document.getElementById("trigger-spinner");
  const triggerText = document.getElementById("trigger-text");

  const canvasResult = document.getElementById("canvas-result");
  const canvasCopyBtn = document.getElementById("canvas-copy-btn");
  const canvasSpeakBtn = document.getElementById("canvas-speak-btn");

  let currentTargetLang = "ja";
  let currentTone = "natural";
  let currentEngine = "free";
  let currentTranslatedOutput = "";

  // 1. 設定の読み込み
  const settings = await chrome.storage.sync.get({
    engine: "free",
    tone: "natural",
    targetLang: "ja",
    autoTranslatePopup: true
  });

  currentTargetLang = settings.targetLang || "ja";
  currentTone = settings.tone || "natural";
  currentEngine = settings.engine || "free";

  updateLanguagePillsUI(currentTargetLang);
  updateToneTabsUI(currentTone);
  updateEngineUI(currentEngine);
  await refreshVaultStatus();

  // 2. アクティブタブからテキスト自動検出 (Gmail/GitHub/SPA完全対応)
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab && tab.id && !tab.url.startsWith("chrome://") && !tab.url.startsWith("edge://")) {
      chrome.tabs.sendMessage(tab.id, { action: "GET_SELECTED_TEXT" }, (response) => {
        if (chrome.runtime.lastError) {
          // コンテンツスクリプト未ロード時の安全なフォールバック
          chrome.scripting.executeScript(
            {
              target: { tabId: tab.id },
              func: () => {
                const s = window.getSelection();
                if (s && s.toString().trim()) return s.toString().trim();
                const a = document.activeElement;
                if (a && (a.tagName === "TEXTAREA" || a.tagName === "INPUT")) {
                  return a.value.substring(a.selectionStart, a.selectionEnd).trim();
                }
                return "";
              }
            },
            (results) => {
              if (results && results[0] && results[0].result) {
                applyDetectedText(results[0].result);
              }
            }
          );
        } else if (response && response.selectionText) {
          applyDetectedText(response.selectionText);
        }
      });
    }
  } catch (err) {
    console.log("[QuickLens] 自動検出スキップ:", err);
  }

  function applyDetectedText(text) {
    if (!text || !text.trim()) return;
    sourceInput.value = text.trim();
    updateCharCount();
    detectedBadge.textContent = "⚡ ページから自動検出";
    detectedBadge.style.color = "#38bdf8";

    if (settings.autoTranslatePopup) {
      executeInsight();
    }
  }

  function updateCharCount() {
    sourceCharCount.textContent = `${sourceInput.value.length}文字`;
  }

  sourceInput.addEventListener("input", updateCharCount);

  clearSourceBtn.addEventListener("click", () => {
    sourceInput.value = "";
    updateCharCount();
    canvasResult.textContent = "選択テキストを自動取得してここに表示します";
    canvasResult.classList.add("placeholder-hint");
    detectedBadge.textContent = "手動入力モード";
    detectedBadge.style.color = "#94a3b8";
    currentTranslatedOutput = "";
    sourceInput.focus();
  });

  // 言語ピルの切り替え
  function updateLanguagePillsUI(lang) {
    langPills.forEach((pill) => {
      if (pill.dataset.lang === lang) {
        pill.classList.add("active");
      } else {
        pill.classList.remove("active");
      }
    });
  }

  langPills.forEach((pill) => {
    pill.addEventListener("click", () => {
      currentTargetLang = pill.dataset.lang;
      updateLanguagePillsUI(currentTargetLang);
      chrome.storage.sync.set({ targetLang: currentTargetLang });
      if (sourceInput.value.trim()) executeInsight();
    });
  });

  moreLangSelect.addEventListener("change", () => {
    if (moreLangSelect.value) {
      currentTargetLang = moreLangSelect.value;
      updateLanguagePillsUI("");
      chrome.storage.sync.set({ targetLang: currentTargetLang });
      if (sourceInput.value.trim()) executeInsight();
    }
  });

  // 文体・トーン切り替え
  function updateToneTabsUI(tone) {
    toneTabs.forEach((tab) => {
      if (tab.dataset.tone === tone) {
        tab.classList.add("active");
      } else {
        tab.classList.remove("active");
      }
    });
  }

  toneTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      currentTone = tab.dataset.tone;
      updateToneTabsUI(currentTone);
      chrome.storage.sync.set({ tone: currentTone });
      if (sourceInput.value.trim()) executeInsight();
    });
  });

  // エンジンバッジ & 金庫ドロワー
  engineToggleBtn.addEventListener("click", () => {
    vaultDrawer.classList.toggle("open");
  });

  function updateEngineUI(engine) {
    currentEngine = engine;
    chrome.storage.sync.set({ engine: engine });

    chipFree.classList.remove("active", "ai");
    chipGemini.classList.remove("active", "ai");
    chipOpenai.classList.remove("active", "ai");

    if (engine === "gemini") {
      chipGemini.classList.add("active", "ai");
      engineBadgeText.textContent = "Gemini AI";
      engineToggleBtn.classList.add("ai");
    } else if (engine === "openai") {
      chipOpenai.classList.add("active", "ai");
      engineBadgeText.textContent = "OpenAI";
      engineToggleBtn.classList.add("ai");
    } else {
      chipFree.classList.add("active");
      engineBadgeText.textContent = "無料モード";
      engineToggleBtn.classList.remove("ai");
    }
  }

  chipFree.addEventListener("click", () => updateEngineUI("free"));
  chipGemini.addEventListener("click", () => updateEngineUI("gemini"));
  chipOpenai.addEventListener("click", () => updateEngineUI("openai"));

  // キー暗号化保存
  async function refreshVaultStatus() {
    const status = await self.VaultCrypto.getApiKeyStatus();
    if (status.hasGeminiKey) {
      geminiKeyInput.placeholder = "•••••••••••• (保存済み)";
    }
    if (status.hasOpenaiKey) {
      openaiKeyInput.placeholder = "•••••••••••• (保存済み)";
    }
  }

  saveGeminiBtn.addEventListener("click", async () => {
    const key = geminiKeyInput.value.trim();
    await self.VaultCrypto.saveEncryptedApiKey("gemini", key);
    saveGeminiBtn.textContent = "✓ 保存";
    geminiKeyInput.value = "";
    await refreshVaultStatus();
    updateEngineUI("gemini");
    setTimeout(() => { saveGeminiBtn.textContent = "保存"; }, 1500);
  });

  saveOpenaiBtn.addEventListener("click", async () => {
    const key = openaiKeyInput.value.trim();
    await self.VaultCrypto.saveEncryptedApiKey("openai", key);
    saveOpenaiBtn.textContent = "✓ 保存";
    openaiKeyInput.value = "";
    await refreshVaultStatus();
    updateEngineUI("openai");
    setTimeout(() => { saveOpenaiBtn.textContent = "保存"; }, 1500);
  });

  // 翻訳・読み解きメイン処理
  async function executeInsight() {
    const text = sourceInput.value.trim();
    if (!text) {
      canvasResult.textContent = "テキストを入力または選択してください";
      canvasResult.classList.add("placeholder-hint");
      return;
    }

    triggerBtn.disabled = true;
    triggerSpinner.style.display = "inline-block";
    triggerText.textContent = "読み解き中...";
    canvasResult.textContent = "解析中...";
    canvasResult.classList.remove("placeholder-hint");

    try {
      const response = await new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(
          {
            action: "EXECUTE_TRANSLATION",
            text: text,
            targetLang: currentTargetLang,
            tone: currentTone
          },
          (res) => {
            if (chrome.runtime.lastError) return reject(new Error(chrome.runtime.lastError.message));
            resolve(res);
          }
        );
      });

      if (response && response.success) {
        currentTranslatedOutput = response.translatedText;
        canvasResult.textContent = response.translatedText;
        canvasResult.classList.remove("placeholder-hint");
      } else {
        throw new Error(response ? response.error : "解析に失敗しました");
      }
    } catch (err) {
      console.error("[QuickLens] 実行失敗:", err);
      canvasResult.textContent = `⚠️ 取得エラー: ${err.message || "通信状況を確認してください"}`;
    } finally {
      triggerBtn.disabled = false;
      triggerSpinner.style.display = "none";
      triggerText.textContent = "読み解く (Ctrl+Enter)";
    }
  }

  triggerBtn.addEventListener("click", executeInsight);

  sourceInput.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      executeInsight();
    }
  });

  // コピー
  canvasCopyBtn.addEventListener("click", async () => {
    if (!currentTranslatedOutput) return;
    await navigator.clipboard.writeText(currentTranslatedOutput);
    canvasCopyBtn.textContent = "✓ 完了";
    setTimeout(() => { canvasCopyBtn.textContent = "📋 コピー"; }, 1500);
  });

  // 音声再生
  canvasSpeakBtn.addEventListener("click", () => {
    if (!currentTranslatedOutput || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(currentTranslatedOutput);
    utterance.lang = currentTargetLang;
    window.speechSynthesis.speak(utterance);
  });
});
