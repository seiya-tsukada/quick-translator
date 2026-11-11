/**
 * QuickLens - Local usage counter and donation prompt decision
 * The translation count lives only in chrome.storage.local and is never sent anywhere.
 */

(() => {
  if (globalThis.QuickLensUsage) return;

  const { LOCAL_KEYS, DONATION_URL, DONATION_PROMPT_THRESHOLD, DONATION_SNOOZE_DAYS } = globalThis.QUICKLENS_CONFIG;
  const DAY_MS = 24 * 60 * 60 * 1000;

  /**
   * Pure decision function (unit-tested).
   * @param {{count: number, dismissedAt: number|null|undefined, now: number,
   *          url?: string, threshold?: number, snoozeDays?: number}} p
   */
  function shouldShowDonationPrompt({
    count,
    dismissedAt,
    now,
    url = DONATION_URL,
    threshold = DONATION_PROMPT_THRESHOLD,
    snoozeDays = DONATION_SNOOZE_DAYS
  }) {
    if (!url) return false;
    if (!(Number(count) >= threshold)) return false;
    if (dismissedAt && now - Number(dismissedAt) < snoozeDays * DAY_MS) return false;
    return true;
  }

  async function recordTranslation() {
    try {
      const key = LOCAL_KEYS.TRANSLATION_COUNT;
      const current = await chrome.storage.local.get(key);
      await chrome.storage.local.set({ [key]: (Number(current[key]) || 0) + 1 });
    } catch (_e) {
      // Counting is best-effort; never break a translation because of it.
    }
  }

  async function getDonationState(now = Date.now()) {
    const items = await chrome.storage.local.get([LOCAL_KEYS.TRANSLATION_COUNT, LOCAL_KEYS.DONATION_DISMISSED_AT]);
    const count = Number(items[LOCAL_KEYS.TRANSLATION_COUNT]) || 0;
    const dismissedAt = items[LOCAL_KEYS.DONATION_DISMISSED_AT] || null;
    return { count, dismissedAt, show: shouldShowDonationPrompt({ count, dismissedAt, now }) };
  }

  async function dismissDonationPrompt(now = Date.now()) {
    await chrome.storage.local.set({ [LOCAL_KEYS.DONATION_DISMISSED_AT]: now });
  }

  globalThis.QuickLensUsage = Object.freeze({
    shouldShowDonationPrompt,
    recordTranslation,
    getDonationState,
    dismissDonationPrompt
  });
})();
