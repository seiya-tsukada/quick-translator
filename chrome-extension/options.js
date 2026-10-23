/**
 * QuickLens - Options Controller
 */

document.addEventListener("DOMContentLoaded", () => {
  const engineSelect = document.getElementById("opt-engine");
  const toneSelect = document.getElementById("opt-tone");
  const toastDurationSelect = document.getElementById("opt-toast-duration");
  const saveBtn = document.getElementById("save-btn");
  const resetBtn = document.getElementById("reset-btn");
  const saveToast = document.getElementById("save-toast");

  const { DEFAULT_SETTINGS, TIMING } = self.QUICKLENS_CONFIG;

  // オプション画面で扱う設定項目のみの初期値
  const DEFAULTS = {
    engine: DEFAULT_SETTINGS.engine,
    tone: DEFAULT_SETTINGS.tone,
    targetLang: DEFAULT_SETTINGS.targetLang,
    toastDuration: DEFAULT_SETTINGS.toastDuration
  };

  chrome.storage.sync.get(DEFAULTS, (items) => {
    engineSelect.value = items.engine || DEFAULTS.engine;
    toneSelect.value = items.tone || DEFAULTS.tone;
    toastDurationSelect.value = String(items.toastDuration || DEFAULTS.toastDuration);
  });

  saveBtn.addEventListener("click", () => {
    chrome.storage.sync.set({
      engine: engineSelect.value,
      tone: toneSelect.value,
      toastDuration: parseInt(toastDurationSelect.value, 10)
    }, () => {
      saveToast.classList.add("show");
      setTimeout(() => saveToast.classList.remove("show"), TIMING.OPTIONS_SAVE_TOAST);
    });
  });

  resetBtn.addEventListener("click", () => {
    if (confirm("設定を初期値に戻しますか？")) {
      chrome.storage.sync.set(DEFAULTS, () => location.reload());
    }
  });
});
