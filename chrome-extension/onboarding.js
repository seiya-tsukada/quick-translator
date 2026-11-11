/**
 * QuickLens - First-run onboarding page (opened from runtime.onInstalled)
 */

document.addEventListener("DOMContentLoaded", async () => {
  const { DEFAULT_SETTINGS, COMMAND_TRANSLATE, DONATION_URL } = globalThis.QUICKLENS_CONFIG;
  const { messageKey } = globalThis.QuickLensErrors;
  const I18n = globalThis.QuickLensI18n;
  const Builtin = globalThis.QuickLensBuiltin;
  const t = I18n.t;
  const $ = (id) => document.getElementById(id);

  const settings = await chrome.storage.sync.get(DEFAULT_SETTINGS);
  globalThis.QuickLensTheme.applyToDocument(settings.theme);
  I18n.apply();
  globalThis.QuickLensIcons.hydrate();

  try {
    const commands = await chrome.commands.getAll();
    const cmd = commands.find((c) => c.name === COMMAND_TRANSLATE);
    $("shortcut-current").textContent = (cmd && cmd.shortcut) || t("shortcutNotSet");
  } catch (_e) {
    $("shortcut-current").textContent = t("shortcutNotSet");
  }

  // Download the on-device models ahead of time. The click provides the user activation
  // that Chrome requires before a model download.
  const status = $("prepare-status");
  const bar = $("prepare-progress");
  if (!Builtin.hasTranslatorApi()) {
    $("prepare-btn").disabled = true;
    status.textContent = t(messageKey("BUILTIN_UNAVAILABLE"));
  }
  $("prepare-btn").addEventListener("click", async () => {
    const btn = $("prepare-btn");
    btn.disabled = true;
    status.textContent = t("preparing");
    const ui = I18n.uiLocale().toLowerCase();
    const source = ui.startsWith("ja") ? "en" : "ja";
    try {
      await Builtin.prepare({
        sourceLang: source === settings.targetLang ? "en" : source,
        targetLang: settings.targetLang,
        onDownloadProgress: (f) => {
          bar.hidden = false;
          bar.firstElementChild.style.width = `${Math.round(f * 100)}%`;
        }
      });
      status.textContent = t("prepareDone");
    } catch (err) {
      status.textContent = t(messageKey(err && err.code));
      btn.disabled = false;
    }
  });

  $("open-options").addEventListener("click", () => chrome.runtime.openOptionsPage());

  if (DONATION_URL) {
    $("donate").hidden = false;
    $("donate-link").href = DONATION_URL;
  }
});
