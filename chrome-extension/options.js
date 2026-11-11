/**
 * QuickLens - Options page
 * Settings are saved immediately on change. API keys are stored on this device only.
 */

document.addEventListener("DOMContentLoaded", async () => {
  const { DEFAULT_SETTINGS, TIMING, AI_ENGINES, PROVIDER_ORIGINS, PROVIDER_LINKS, COMMAND_TRANSLATE, SHORTCUTS_PAGE_URL, DONATION_URL } =
    globalThis.QUICKLENS_CONFIG;
  const Lang = globalThis.QuickLensLanguages;
  const I18n = globalThis.QuickLensI18n;
  const Icons = globalThis.QuickLensIcons;
  const Theme = globalThis.QuickLensTheme;
  const Vault = globalThis.VaultCrypto;
  const t = I18n.t;
  const $ = (id) => document.getElementById(id);

  const settings = globalThis.QuickLensSettings.normalize(await chrome.storage.sync.get(DEFAULT_SETTINGS));
  Theme.applyToDocument(settings.theme);
  I18n.apply();
  Icons.hydrate();

  // ---------- Generic settings ----------

  function fillLanguageSelect(select, includeAuto) {
    select.innerHTML = "";
    if (includeAuto) {
      const o = document.createElement("option");
      o.value = "auto";
      o.textContent = t("sourceAuto");
      select.appendChild(o);
    }
    Lang.codes().forEach((code) => {
      const o = document.createElement("option");
      o.value = code;
      o.textContent = `${Lang.nativeName(code)} — ${Lang.displayName(code, I18n.uiLocale())}`;
      select.appendChild(o);
    });
  }

  fillLanguageSelect($("opt-target"), false);
  fillLanguageSelect($("opt-source"), true);

  const bindings = [
    { el: $("opt-target"), key: "targetLang" },
    { el: $("opt-source"), key: "sourceLang" },
    { el: $("opt-engine"), key: "engine" },
    { el: $("opt-tone"), key: "tone" },
    { el: $("opt-position"), key: "hudPosition" },
    { el: $("opt-theme"), key: "theme" },
    { el: $("opt-duration"), key: "toastDuration", parse: (v) => parseInt(v, 10) },
    { el: $("opt-autotranslate"), key: "autoTranslatePopup", checkbox: true }
  ];

  function showSaved() {
    const toast = $("save-toast");
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), TIMING.OPTIONS_SAVE_TOAST);
  }

  function render() {
    bindings.forEach(({ el, key, checkbox }) => {
      if (checkbox) el.checked = Boolean(settings[key]);
      else el.value = String(settings[key]);
    });
  }

  bindings.forEach(({ el, key, parse, checkbox }) => {
    el.addEventListener("change", async () => {
      const value = checkbox ? el.checked : parse ? parse(el.value) : el.value;
      settings[key] = value;
      await chrome.storage.sync.set({ [key]: value });
      if (key === "theme") Theme.applyToDocument(value);
      showSaved();
    });
  });
  render();

  $("reset-btn").addEventListener("click", async () => {
    if (!confirm(t("resetConfirm"))) return;
    Object.assign(settings, DEFAULT_SETTINGS);
    await chrome.storage.sync.set({ ...DEFAULT_SETTINGS });
    Theme.applyToDocument(settings.theme);
    render();
    showSaved();
  });

  // ---------- API keys (BYOK) ----------

  const providersEl = $("providers");
  const template = $("provider-template");
  const placeholders = { openai: "sk-…", deepl: "xxxxxxxx-…:fx" };

  async function refreshKeyStatus(provider, statusEl, message, isError) {
    const status = await Vault.getApiKeyStatus();
    if (message) {
      statusEl.textContent = message;
    } else {
      statusEl.textContent = status[provider] ? t("keySaved") : t("keyNotSaved");
    }
    statusEl.className = `key-status ${isError ? "err" : status[provider] ? "ok" : ""}`;
    return status[provider];
  }

  AI_ENGINES.forEach((provider) => {
    const node = template.content.cloneNode(true);
    const ref = (name) => node.querySelector(`[data-ref="${name}"]`);
    const input = ref("input");
    const saveBtn = ref("save");
    const removeBtn = ref("remove");
    const statusEl = ref("status");
    const id = `key-${provider}`;
    input.id = id;
    ref("label").setAttribute("for", id);
    ref("label").textContent = t(`keyLabel_${provider}`);
    input.placeholder = placeholders[provider];
    saveBtn.textContent = t("keySave");
    removeBtn.textContent = t("keyRemove");
    ref("get-key").href = PROVIDER_LINKS[provider].keys;
    ref("get-key").textContent = t("keyGetLink");
    ref("privacy").href = PROVIDER_LINKS[provider].privacy;
    ref("privacy").textContent = t("keyProviderPrivacy");

    saveBtn.addEventListener("click", () => {
      const key = input.value.trim();
      if (!key) {
        refreshKeyStatus(provider, statusEl, t("keyEmpty"), true);
        return;
      }
      // permissions.request() must run inside the user gesture → call it before any await.
      chrome.permissions.request({ origins: [...PROVIDER_ORIGINS[provider]] }).then(async (granted) => {
        if (!granted) {
          refreshKeyStatus(provider, statusEl, t("keyPermissionDenied"), true);
          return;
        }
        await Vault.saveEncryptedApiKey(provider, key);
        input.value = "";
        await refreshKeyStatus(provider, statusEl);
        if (settings.engine === "free") {
          settings.engine = provider;
          await chrome.storage.sync.set({ engine: provider });
          render();
        }
      }).catch((err) => refreshKeyStatus(provider, statusEl, String(err && err.message), true));
    });

    removeBtn.addEventListener("click", async () => {
      await Vault.removeApiKey(provider);
      try {
        await chrome.permissions.remove({ origins: [...PROVIDER_ORIGINS[provider]] });
      } catch (_e) {
        // already removed
      }
      if (settings.engine === provider) {
        settings.engine = "free";
        await chrome.storage.sync.set({ engine: "free" });
        render();
      }
      refreshKeyStatus(provider, statusEl, t("keyRemoved"));
    });

    providersEl.appendChild(node);
    refreshKeyStatus(provider, statusEl);
  });

  // ---------- Shortcut ----------

  try {
    const commands = await chrome.commands.getAll();
    const cmd = commands.find((c) => c.name === COMMAND_TRANSLATE);
    $("shortcut-current").textContent = (cmd && cmd.shortcut) || t("shortcutNotSet");
  } catch (_e) {
    $("shortcut-current").textContent = t("shortcutNotSet");
  }
  $("open-shortcuts").addEventListener("click", () => {
    chrome.tabs.create({ url: SHORTCUTS_PAGE_URL });
  });

  // ---------- Donation (settings page bottom) ----------

  if (DONATION_URL) {
    $("donate-section").hidden = false;
    $("donate-link").href = DONATION_URL;
  }

  // Deep link: options.html#keys scrolls to the key section
  if (location.hash === "#keys") $("sec-keys").scrollIntoView();
});
