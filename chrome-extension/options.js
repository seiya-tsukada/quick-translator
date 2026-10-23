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

  const DEFAULTS = {
    engine: "free",
    tone: "natural",
    targetLang: "ja",
    toastDuration: 10000
  };

  chrome.storage.sync.get(DEFAULTS, (items) => {
    engineSelect.value = items.engine || "free";
    toneSelect.value = items.tone || "natural";
    toastDurationSelect.value = String(items.toastDuration || 10000);
  });

  saveBtn.addEventListener("click", () => {
    chrome.storage.sync.set({
      engine: engineSelect.value,
      tone: toneSelect.value,
      toastDuration: parseInt(toastDurationSelect.value, 10)
    }, () => {
      saveToast.classList.add("show");
      setTimeout(() => saveToast.classList.remove("show"), 2000);
    });
  });

  resetBtn.addEventListener("click", () => {
    if (confirm("設定を初期値に戻しますか？")) {
      chrome.storage.sync.set(DEFAULTS, () => location.reload());
    }
  });
});
