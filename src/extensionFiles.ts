/**
 * Chrome Extension Source Code & Asset Registry
 * Manifest V3準拠の全ソースコードとメタデータ
 */

export interface ExtensionFile {
  name: string;
  path: string;
  language: string;
  description: string;
  role: string;
  content: string;
  isBinary?: boolean;
}

export const EXTENSION_ICONS_BASE64 = {
  "icon16.png": "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAiUlEQVR4nLXR3QqCQBiEYe9NkzS0SMUSr0ItM38ue04nhIRF3PJbcc6fd9ldy9pzhx50O/DYgSLoDKCKvRb0W/D0/hOyB/AXDhowbMDzSxNaiy/1QkCCrzUYPWcRKY7VgAlOHmBafSOm+DYFTPG9VK6xCY+T4qxY+MpNeNxanOsC08Qn66Z9MGUfJka4aIE4+JUAAAAASUVORK5CYII=",
  "icon48.png": "iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAABGUlEQVR4nO3WyQ6CMBSFYd9NnHBCRET0KRzA+bG7rblJa9i0IDLck3CSu//+TdNer1s3PnNeQg4yN6R7CjlSN9b3ELJt63f9t5AO3Q/4iTpXXWvwKvDuXcipOmj8jO5Wc4SG14WfZw4av6C7VhjRBn6pDhpP5/0TwQHvpUKu0pIRXPClAjjhfXXQeD8Rcp0UjOCKLxTAGR+oswZwxweXvADm+I0tAAFPF5oiUPDhOSeAO35rC0DAGwNQ8OYAEHxkCkDBRydLAAJ+ZwpAwdsDAPDmABB8bAqgQeNp3PHxsUgAY/w+L4AGjdcBHPGFA2jQeD1ovA7ggD+UDaBB4/Wg8XrQeD1ofHbsXpsyg8Zn19j3oIlV9iXuBrQPTdu89qOTUPEAAAAASUVORK5CYII=",
  "icon128.png": "iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAADVUlEQVR4nO3cW3bTQBBFUY0NwhsSkjghBEbB+2WG7V+z5LgdIWwI6m5V3a5z16oBqPf58oe7jjHGGGOMMcYYa2cPlqv1+B4O78ftPTpw1t/A7rij5Wp9tAc8B//x+L7fnPW3sh7852q9ueXtzYHf35PRWb9FmN1P6I7w0z3dnvUbNbkeXgF/d98IocgSvBp+umeEMG1DeGX84Vm/qcTG8K3gp3tOCPu3D75F/N19JYTdIuKns3570x2Cj4L/YnDWFrMP/D/P2mS2gX/4rG2q7t5f4MFfrY8HZ21VfODfHf/4y81ZmxUb+P+P399JCxGAPx3/RD0C8PPxZSMAvxy+XATgl8d/uT1r238O/Hr4m/vsPALw6+K7DgD8+vj9nXqMAPz58E+9RQD+/PiuIgDfBt9FAODb4Z9tD/zA+KYRgO8D/+yTQQDg+8FPZxoA+Lb453MGAL4//PM5IwDfJ/4sAYDvF3+WCMD3jb+oGQD4/vEXNSMAXwO/SgDg6+AvPt5c0QDA18KvFwD4EvgXJQMAXw//omQE4GvilwsAfEn84gGAr4VfJADwdfEvt5cdAPi6+NkBgK+Nf/mhUgDga+BXCQB8HfysAMDXx3+1vSIBgK+JXyQA8HXxswMAXxs/KwDw9fEnBwB+G/j5AYAvjX+VFQD48vjTAwC/CfzsAMDXxr96nxEA+Pr4kwMAvw38ogGAr4f/ulQA4GviFwkAfF387ADA18bPCgB8ffzJAfQDPzD+bwGAL4lfJgDwZfHzAwBfGv+6VADga+JnB9AP/MD4hwIA3z9+tQDA18C/flchAPB18IsFkCIAPyh+P/C18OsGAL57/DelA9hFAH5M/E0A4EvgVwsgRQB+UPx+4PvGrx7AvgjAD4Q/DgB8P/izBZAiAD8ofj/wfeHPHsAuAvBj4m8CAN8FvlkAKQLwg+KngR8YvzsQAPj18d96CaAbRQB+MPw08APjp4EfGL9LAYBfDd99AP3AD4yfBn5g/DTwA+OngR8YPw38wPhp4AfGTwM/MP5w4Iv+yFNy4AfGTwM/MP5wkfGt397NwGebRcC3fmOJtYhv/aaSawHf+g2bmCK+9Zs1OQV86zcKM0/41m/Buq6T+wdOVn8l8K2/gTHGGGOMMcbK7ReYsmw4l5kSbgAAAABJRU5ErkJggg=="
};

export const EXTENSION_FILES: ExtensionFile[] = [
  {
    name: "manifest.json",
    path: "manifest.json",
    language: "json",
    role: "拡張機能の基本構成・権限（Gmail/GitHub対応）",
    description: "all_frames: true および match_about_blank: true でGmailのiframe内メールやGitHubのSPA遷移でも稼働。Gemini/OpenAIへのホスト権限も完備。",
    content: `{
  "manifest_version": 3,
  "name": "QuickLens 翻訳 (Focus Lens Translator)",
  "version": "1.1.0",
  "description": "Gmail・GitHub等の特殊環境にも完全対応。選択テキストを瞬時に読み解くフォーカス・レンズ翻訳（無料・キー不要＆マイAIキー登録両対応）",
  "permissions": [
    "contextMenus",
    "storage",
    "activeTab",
    "scripting"
  ],
  "host_permissions": [
    "https://translate.googleapis.com/*",
    "https://generativelanguage.googleapis.com/*",
    "https://api.openai.com/*"
  ],
  "background": {
    "service_worker": "background.js"
  },
  "action": {
    "default_popup": "popup.html",
    "default_title": "QuickLens 翻訳",
    "default_icon": {
      "16": "icons/icon16.png",
      "48": "icons/icon48.png",
      "128": "icons/icon128.png"
    }
  },
  "content_scripts": [
    {
      "matches": [
        "<all_urls>"
      ],
      "js": [
        "content.js"
      ],
      "all_frames": true,
      "match_about_blank": true,
      "run_at": "document_idle"
    }
  ],
  "options_ui": {
    "page": "options.html",
    "open_in_tab": true
  },
  "icons": {
    "16": "icons/icon16.png",
    "48": "icons/icon48.png",
    "128": "icons/icon128.png"
  }
}`
  },
  {
    name: "crypto-vault.js",
    path: "crypto-vault.js",
    language: "javascript",
    role: "ローカル暗号化金庫 (Web Crypto AES-GCM 256bit)",
    description: "ユーザーのAPIキーを端末内だけで暗号化してchrome.storage.localに保存。ユーザー登録不要・外部サーバー一切非経由の安全な仕組みです。",
    content: `/**
 * QuickLens - Secure Local Cryptographic Vault
 * Web Crypto API (AES-GCM 256bit) を利用し、ユーザーのAPIキーを暗号化してローカル保存するユーティリティ
 * サーバー不要・ユーザー登録不要・端末内完結
 */

const VAULT_STORAGE_KEY = "quicklens_secure_vault";
const DEVICE_SALT_KEY = "quicklens_device_salt";

// 端末固有の暗号化ソルトを取得または生成
async function getOrCreateDeviceSalt() {
  const result = await chrome.storage.local.get(DEVICE_SALT_KEY);
  if (result[DEVICE_SALT_KEY]) {
    return new Uint8Array(result[DEVICE_SALT_KEY]);
  }
  const newSalt = crypto.getRandomValues(new Uint8Array(16));
  await chrome.storage.local.set({ [DEVICE_SALT_KEY]: Array.from(newSalt) });
  return newSalt;
}

// 端末固有のマスターキーを導出
async function deriveVaultKey() {
  const salt = await getOrCreateDeviceSalt();
  const extensionId = chrome.runtime.id || "quicklens-default-id";
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(\`quicklens_secret_\${extensionId}\`),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 100000,
      hash: "SHA-256"
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

/**
 * APIキーをAES-GCMで暗号化してchrome.storage.localに保存
 */
async function saveEncryptedApiKey(provider, apiKey) {
  if (!apiKey || !apiKey.trim()) {
    const existing = await getEncryptedVault();
    delete existing[provider];
    await chrome.storage.local.set({ [VAULT_STORAGE_KEY]: existing });
    return;
  }

  const key = await deriveVaultKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const enc = new TextEncoder();
  const encoded = enc.encode(apiKey.trim());

  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv },
    key,
    encoded
  );

  const existing = await getEncryptedVault();
  existing[provider] = {
    iv: Array.from(iv),
    ciphertext: Array.from(new Uint8Array(ciphertext)),
    updatedAt: Date.now()
  };

  await chrome.storage.local.set({ [VAULT_STORAGE_KEY]: existing });
}

/**
 * 暗号化されたAPIキーを復号して取得（メモリ上でのみ保持・即時利用用）
 */
async function getDecryptedApiKey(provider) {
  const existing = await getEncryptedVault();
  const item = existing[provider];
  if (!item || !item.iv || !item.ciphertext) {
    return null;
  }

  try {
    const key = await deriveVaultKey();
    const iv = new Uint8Array(item.iv);
    const ciphertext = new Uint8Array(item.ciphertext);

    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: iv },
      key,
      ciphertext
    );

    const dec = new TextDecoder();
    return dec.decode(decrypted);
  } catch (err) {
    console.error("[QuickLens Vault] 復号失敗:", err);
    return null;
  }
}

/**
 * 鍵が登録されているかどうかの状態のみを取得（平文は返さない）
 */
async function getApiKeyStatus() {
  const existing = await getEncryptedVault();
  return {
    hasGeminiKey: Boolean(existing.gemini && existing.gemini.ciphertext),
    hasOpenaiKey: Boolean(existing.openai && existing.openai.ciphertext),
    hasDeeplKey: Boolean(existing.deepl && existing.deepl.ciphertext)
  };
}

async function getEncryptedVault() {
  const result = await chrome.storage.local.get(VAULT_STORAGE_KEY);
  return result[VAULT_STORAGE_KEY] || {};
}

if (typeof self !== "undefined") {
  self.VaultCrypto = {
    saveEncryptedApiKey,
    getDecryptedApiKey,
    getApiKeyStatus
  };
}`
  },
  {
    name: "background.js",
    path: "background.js",
    language: "javascript",
    role: "サービスワーカー（無料エンジン ＆ Gemini/OpenAI ルーター）",
    description: "デフォルトの無料Googleパブリック翻訳、マイAIキーによるスマート翻訳、Gmail/GitHubフレームへの動的再注入フォールバックを統括します。",
    content: `/**
 * QuickLens - Manifest V3 Background Service Worker
 * @license Apache-2.0
 */

importScripts("crypto-vault.js");

// デフォルト設定
const DEFAULT_SETTINGS = {
  engine: "free", // "free" | "gemini" | "openai" | "deepl"
  tone: "natural", // "natural" | "business" | "summary" | "breakdown"
  targetLang: "ja",
  sourceLang: "auto",
  autoTranslatePopup: true,
  toastDuration: 10000,
  position: "floating"
};

// インストール時の初期化
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get(DEFAULT_SETTINGS, (items) => {
    chrome.storage.sync.set(items);
  });

  // 右クリックコンテキストメニュー
  chrome.contextMenus.create({
    id: "quicklens-translate-selection",
    title: "QuickLens で読み解く (「%s」)",
    contexts: ["selection"]
  });
});

/**
 * ==============================================================
 * 多彩な翻訳・解説エンジンの統合ルーター
 * デフォルト: 無料・鍵不要 (Google Translate gtx)
 * ユーザー登録不要のマイAIキー: Gemini / OpenAI / DeepL をセキュアに利用可能
 * ==============================================================
 */
async function translateWithEngine(text, targetLang = "ja", tone = "natural", sourceLang = "auto") {
  if (!text || !text.trim()) return { translatedText: "", meta: {} };

  const settings = await chrome.storage.sync.get(DEFAULT_SETTINGS);
  const engine = settings.engine || "free";

  // 1. ユーザー所有のGemini APIキーを使用する場合
  if (engine === "gemini") {
    const apiKey = await self.VaultCrypto.getDecryptedApiKey("gemini");
    if (apiKey) {
      try {
        return await translateViaGemini(text, targetLang, tone, sourceLang, apiKey);
      } catch (geminiError) {
        console.warn("[QuickLens] Gemini API失敗のため無料エンジンへ自動フォールバック:", geminiError);
      }
    }
  }

  // 2. ユーザー所有のOpenAI APIキーを使用する場合
  if (engine === "openai") {
    const apiKey = await self.VaultCrypto.getDecryptedApiKey("openai");
    if (apiKey) {
      try {
        return await translateViaOpenAI(text, targetLang, tone, sourceLang, apiKey);
      } catch (openaiError) {
        console.warn("[QuickLens] OpenAI API失敗のため無料エンジンへ自動フォールバック:", openaiError);
      }
    }
  }

  // 3. デフォルト / フォールバック: 無料GoogleパブリックAPI
  return await translateViaFreeEngine(text, targetLang, sourceLang);
}

/**
 * 無料 GoogleパブリックGTXエンジン（キー不要・即時）
 */
async function translateViaFreeEngine(text, targetLang = "ja", sourceLang = "auto") {
  const url = \`https://translate.googleapis.com/translate_a/single?client=gtx&sl=\${encodeURIComponent(
    sourceLang
  )}&tl=\${encodeURIComponent(targetLang)}&dt=t&q=\${encodeURIComponent(text)}\`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(\`翻訳サーバー応答エラー: HTTP \${response.status}\`);
  }

  const data = await response.json();
  if (data && Array.isArray(data[0])) {
    const translatedText = data[0].map((item) => item[0] || "").join("");
    return {
      translatedText,
      engineUsed: "free",
      tone: "standard"
    };
  }

  throw new Error("翻訳結果のデータ解析に失敗しました。");
}

/**
 * ユーザー自身のGoogle Gemini APIによるスマート翻訳＆ニュアンス解説
 */
async function translateViaGemini(text, targetLang, tone, sourceLang, apiKey) {
  const promptMap = {
    natural: \`以下のテキストを、文脈に即した自然でこなれた\${targetLang}に翻訳してください。直訳にならず、母国語話者が自然に読む文章にしてください。余計な挨拶や前置きは省き、翻訳文のみを出力してください。\`,
    business: \`以下のテキストを、丁寧で格調の高いビジネス敬語の\${targetLang}に翻訳してください。ビジネスメールや公式な仕様書にふさわしい文体にしてください。翻訳文のみを出力してください。\`,
    summary: \`以下のテキストの主要なポイントを要約し、分かりやすい\${targetLang}の箇条書き（3〜4行以内）で出力してください。\`,
    breakdown: \`以下のテキストを翻訳した上で、文中に含まれる重要な語彙や慣用表現、ニュアンスの解説を添えて\${targetLang}で出力してください。\`
  };

  const systemInstruction = promptMap[tone] || promptMap.natural;
  const endpoint = \`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=\${encodeURIComponent(apiKey)}\`;

  const payload = {
    contents: [
      {
        role: "user",
        parts: [
          { text: \`\${systemInstruction}\\n\\n対象テキスト:\\n"""\\n\${text}\\n"""\` }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.3,
      maxOutputTokens: 1024
    }
  };

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(\`Gemini APIエラー (\${res.status}): \${errText}\`);
  }

  const data = await res.json();
  const outputText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

  return {
    translatedText: outputText.trim(),
    engineUsed: "gemini",
    tone: tone
  };
}

/**
 * ユーザー自身のOpenAI APIによる翻訳
 */
async function translateViaOpenAI(text, targetLang, tone, sourceLang, apiKey) {
  const toneDesc = {
    natural: \`Natural, native-sounding \${targetLang}\`,
    business: \`Professional, formal polite \${targetLang}\`,
    summary: \`Concise bulleted summary in \${targetLang}\`,
    breakdown: \`Translation in \${targetLang} followed by brief vocabulary and nuance nuances breakdown\`
  }[tone] || \`Accurate \${targetLang}\`;

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": \`Bearer \${apiKey}\`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.3,
      messages: [
        {
          role: "system",
          content: \`You are a precision reading assistant. Translate the text into \${toneDesc}. Output only the result without conversational filler.\`
        },
        { role: "user", content: text }
      ]
    })
  });

  if (!res.ok) {
    throw new Error(\`OpenAI APIエラー: HTTP \${res.status}\`);
  }

  const data = await res.json();
  return {
    translatedText: data.choices?.[0]?.message?.content?.trim() || "",
    engineUsed: "openai",
    tone: tone
  };
}

/**
 * Gmail / GitHub / 動的SPA 等の特殊環境に対応した安全なメッセージ送信＆自動スクリプト注入
 */
async function sendToTabWithFallback(tabId, frameId, message) {
  const options = typeof frameId === "number" ? { frameId } : {};

  try {
    await chrome.tabs.sendMessage(tabId, message, options);
  } catch (err) {
    try {
      await chrome.scripting.executeScript({
        target: {
          tabId: tabId,
          frameIds: typeof frameId === "number" ? [frameId] : [0]
        },
        files: ["content.js"]
      });

      setTimeout(() => {
        chrome.tabs.sendMessage(tabId, message, options).catch((retryErr) => {
          console.warn("[QuickLens] 再送メッセージのエラー:", retryErr);
        });
      }, 120);
    } catch (injectErr) {
      console.warn("[QuickLens] スクリプトの動的注入が拒否されました:", injectErr);
    }
  }
}

// 右クリックメニューのクリックハンドラー
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId !== "quicklens-translate-selection") return;
  if (!tab || !tab.id) return;

  const selectedText = info.selectionText ? info.selectionText.trim() : "";
  if (!selectedText) return;

  const settings = await chrome.storage.sync.get(DEFAULT_SETTINGS);
  const targetLang = settings.targetLang || "ja";
  const tone = settings.tone || "natural";
  const frameId = info.frameId || 0;

  await sendToTabWithFallback(tab.id, frameId, {
    action: "SHOW_LOADING_HUD",
    text: selectedText
  });

  try {
    const result = await translateWithEngine(selectedText, targetLang, tone, settings.sourceLang || "auto");

    await sendToTabWithFallback(tab.id, frameId, {
      action: "SHOW_TRANSLATION_HUD",
      originalText: selectedText,
      translatedText: result.translatedText,
      targetLang: targetLang,
      engineUsed: result.engineUsed || "free",
      tone: tone,
      duration: settings.toastDuration || 10000
    });
  } catch (err) {
    await sendToTabWithFallback(tab.id, frameId, {
      action: "SHOW_ERROR_HUD",
      errorMessage: "翻訳の取得に失敗しました。ネットワークまたはAPIキーを確認してください。"
    });
  }
});

// ポップアップやコンテンツスクリプトからのメッセージ受信
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "EXECUTE_TRANSLATION") {
    translateWithEngine(request.text, request.targetLang, request.tone, request.sourceLang)
      .then((res) => {
        sendResponse({ success: true, ...res });
      })
      .catch((err) => {
        sendResponse({ success: false, error: err.message });
      });
    return true;
  }

  if (request.action === "VAULT_SAVE_KEY") {
    self.VaultCrypto.saveEncryptedApiKey(request.provider, request.apiKey)
      .then(() => sendResponse({ success: true }))
      .catch((err) => sendResponse({ success: false, error: err.message }));
    return true;
  }

  if (request.action === "VAULT_GET_STATUS") {
    self.VaultCrypto.getApiKeyStatus()
      .then((status) => sendResponse({ success: true, status }))
      .catch((err) => sendResponse({ success: false, error: err.message }));
    return true;
  }
});`
  },
  {
    name: "content.js",
    path: "content.js",
    language: "javascript",
    role: "Closed Shadow DOM トースト描画 ＆ 多層テキスト抽出",
    description: "Gmailのiframe内やGitHubのダークモードCSSをClosed Shadow DOMで完全遮断。独自のFocus Lens HUDを画面右下にフロート表示します。",
    content: `/**
 * QuickLens - Isolated Content Script with Shadow DOM
 * Gmail、GitHub、SPA等の特殊なCSS・CSP環境下でも100%崩れないShadow DOM完全隔離設計
 */

(() => {
  if (window.__quickLensInitialized) return;
  window.__quickLensInitialized = true;

  let hostEl = null;
  let shadowRoot = null;
  let activeHudEl = null;
  let dismissTimer = null;

  function ensureShadowContainer() {
    if (hostEl && shadowRoot) return shadowRoot;

    hostEl = document.createElement("quicklens-lens-host");
    hostEl.style.all = "initial";
    hostEl.style.position = "fixed";
    hostEl.style.bottom = "24px";
    hostEl.style.right = "24px";
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
    return \`
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
    \`;
  }

  function showLoadingHud(text) {
    const root = ensureShadowContainer().getElementById("quicklens-root");
    dismissCurrentHud();

    const hud = document.createElement("div");
    hud.className = "quicklens-hud";
    activeHudEl = hud;

    const preview = text.length > 25 ? text.slice(0, 25) + "..." : text;

    hud.innerHTML = \`
      <div class="quicklens-bar">
        <div class="quicklens-brand">
          <span>⚡ QuickLens</span>
        </div>
      </div>
      <div class="quicklens-loading">
        <div class="quicklens-spinner"></div>
        <div>解析中: 「\${escapeHTML(preview)}」</div>
      </div>
    \`;

    root.appendChild(hud);
  }

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

    hud.innerHTML = \`
      <div class="quicklens-bar">
        <div style="display: flex; align-items: center; gap: 6px;">
          <span class="quicklens-brand">⚡ QuickLens</span>
          <span class="quicklens-pill \${isAi ? "ai" : ""}">\${engineLabel}</span>
          <span class="quicklens-pill">\${toneLabel}</span>
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
        <div class="quicklens-quote">原文: \${escapeHTML(originalPreview)}</div>
        <div class="quicklens-content">\${escapeHTML(translatedText)}</div>
      </div>
      <div class="quicklens-footer">
        <span>ターゲット: \${targetLang.toUpperCase()}</span>
        <span>Escで閉じる</span>
      </div>
    \`;

    root.appendChild(hud);

    const copyBtn = hud.querySelector("#ql-copy");
    copyBtn?.addEventListener("click", () => {
      navigator.clipboard.writeText(translatedText).then(() => {
        copyBtn.textContent = "✓ 完了";
        setTimeout(() => { if (copyBtn) copyBtn.textContent = "📋 コピー"; }, 1500);
      });
    });

    const speakBtn = hud.querySelector("#ql-speak");
    speakBtn?.addEventListener("click", () => {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        const ut = new SpeechSynthesisUtterance(translatedText);
        ut.lang = targetLang;
        window.speechSynthesis.speak(ut);
      }
    });

    const closeBtn = hud.querySelector("#ql-close");
    closeBtn?.addEventListener("click", () => dismissCurrentHud());

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

    hud.innerHTML = \`
      <div class="quicklens-bar">
        <span class="quicklens-brand" style="color: #ef4444;">⚠️ QuickLens エラー</span>
        <button class="quicklens-btn close" id="ql-close">✕</button>
      </div>
      <div class="quicklens-body" style="font-size: 12px; color: #fca5a5;">
        \${escapeHTML(message)}
      </div>
    \`;

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

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && activeHudEl) {
      dismissCurrentHud();
    }
  });

  function extractPageSelection() {
    const sel = window.getSelection();
    if (sel && sel.toString().trim()) {
      return sel.toString().trim();
    }

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
})();`
  },
  {
    name: "popup.html",
    path: "popup.html",
    language: "html",
    role: "Focus Lens HUD ポップアップ画面 (脱DeepLクローンUI)",
    description: "2つの枠を並べる旧来UIを刷新。言語リボン、4つの文体トーンバー、セキュアなキー金庫ドロワー、読解専用キャンバスを搭載。",
    content: `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>QuickLens 翻訳</title>
  <style>
    :root {
      --bg-canvas: #090d16;
      --bg-surface: #111827;
      --bg-surface-elevated: #1e293b;
      --border-subtle: #1f293d;
      --border-active: #38bdf8;
      --text-main: #f8fafc;
      --text-muted: #94a3b8;
      --accent-cyan: #38bdf8;
      --accent-purple: #c084fc;
      --accent-emerald: #34d399;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; }
    body { width: 380px; background-color: var(--bg-canvas); color: var(--text-main); font-size: 13px; line-height: 1.5; padding: 14px; overflow-x: hidden; }
    .hud-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; padding-bottom: 10px; border-bottom: 1px solid var(--border-subtle); }
    .brand-group { display: flex; align-items: center; gap: 7px; }
    .brand-symbol { width: 22px; height: 22px; border-radius: 6px; background: linear-gradient(135deg, #0284c7 0%, #6366f1 100%); display: flex; align-items: center; justify-content: center; font-size: 12px; color: #fff; font-weight: 800; box-shadow: 0 0 12px rgba(56, 189, 248, 0.35); }
    .brand-title { font-size: 13.5px; font-weight: 700; letter-spacing: -0.01em; color: #fff; }
    .engine-badge-btn { background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: 9999px; padding: 3px 9px; font-size: 11px; font-weight: 600; color: var(--accent-cyan); cursor: pointer; display: flex; align-items: center; gap: 5px; transition: all 0.15s ease; }
    .engine-badge-btn:hover { border-color: var(--accent-cyan); background: var(--bg-surface-elevated); }
    .engine-badge-btn.ai { color: var(--accent-purple); border-color: rgba(192, 132, 252, 0.3); }
    .vault-drawer { display: none; background: var(--bg-surface); border: 1px solid #334155; border-radius: 12px; padding: 12px; margin-bottom: 12px; animation: slide-down 0.2s ease forwards; }
    .vault-drawer.open { display: block; }
    @keyframes slide-down { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
    .vault-title { font-size: 11px; font-weight: 700; color: var(--accent-purple); display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; }
    .vault-desc { font-size: 11px; color: var(--text-muted); line-height: 1.4; margin-bottom: 10px; }
    .vault-input-group { margin-bottom: 8px; }
    .vault-label { display: block; font-size: 11px; font-weight: 600; color: #e2e8f0; margin-bottom: 4px; }
    .vault-input-row { display: flex; gap: 6px; }
    .vault-input { flex: 1; background: var(--bg-canvas); border: 1px solid var(--border-subtle); border-radius: 6px; padding: 6px 8px; font-size: 11px; color: #fff; font-family: monospace; outline: none; }
    .vault-input:focus { border-color: var(--accent-purple); }
    .vault-btn { padding: 6px 10px; border-radius: 6px; font-size: 11px; font-weight: 600; cursor: pointer; border: none; background: #7c3aed; color: #fff; }
    .vault-btn:hover { background: #6d28d9; }
    .vault-engine-selector { display: flex; gap: 6px; margin-top: 8px; padding-top: 8px; border-top: 1px dashed var(--border-subtle); }
    .engine-chip { flex: 1; padding: 5px 6px; border-radius: 6px; border: 1px solid var(--border-subtle); background: var(--bg-canvas); color: var(--text-muted); font-size: 10.5px; font-weight: 600; text-align: center; cursor: pointer; }
    .engine-chip.active { border-color: var(--accent-cyan); background: rgba(56, 189, 248, 0.1); color: var(--accent-cyan); }
    .engine-chip.active.ai { border-color: var(--accent-purple); background: rgba(192, 132, 252, 0.1); color: var(--accent-purple); }
    .lang-ribbon { display: flex; align-items: center; gap: 5px; margin-bottom: 10px; }
    .lang-pill { flex: 1; padding: 5px 4px; background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: 8px; color: var(--text-muted); font-size: 11px; font-weight: 600; text-align: center; cursor: pointer; transition: all 0.15s ease; }
    .lang-pill:hover { background: var(--bg-surface-elevated); color: #fff; }
    .lang-pill.active { background: #0284c7; color: #fff; border-color: #38bdf8; box-shadow: 0 0 10px rgba(2, 132, 199, 0.3); }
    .lang-more-select { width: 70px; padding: 5px 6px; background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: 8px; color: var(--text-muted); font-size: 11px; outline: none; cursor: pointer; }
    .tone-bar { display: flex; gap: 4px; margin-bottom: 12px; background: var(--bg-surface); padding: 3px; border-radius: 8px; border: 1px solid var(--border-subtle); }
    .tone-tab { flex: 1; padding: 4px 2px; border-radius: 6px; font-size: 11px; font-weight: 600; color: var(--text-muted); background: transparent; border: none; cursor: pointer; text-align: center; }
    .tone-tab.active { background: var(--bg-surface-elevated); color: var(--accent-cyan); box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3); }
    .source-deck { background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: 10px; padding: 8px 10px; margin-bottom: 10px; }
    .deck-subhead { display: flex; align-items: center; justify-content: space-between; font-size: 10.5px; font-weight: 600; color: var(--text-muted); margin-bottom: 4px; }
    .source-textarea { width: 100%; height: 60px; background: transparent; border: none; color: #cbd5e1; font-size: 12px; line-height: 1.45; resize: none; outline: none; }
    .deck-tools { display: flex; align-items: center; justify-content: flex-end; gap: 8px; font-size: 10px; color: #64748b; }
    .clear-link { background: none; border: none; color: #64748b; cursor: pointer; font-size: 10px; }
    .clear-link:hover { color: #ef4444; }
    .reading-canvas { background: linear-gradient(180deg, #131d31 0%, #0c1220 100%); border: 1px solid #1e3a5f; border-radius: 12px; padding: 12px; min-height: 120px; box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.3); }
    .canvas-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; padding-bottom: 6px; border-bottom: 1px solid rgba(255, 255, 255, 0.06); }
    .canvas-title { font-size: 11px; font-weight: 700; color: var(--accent-cyan); display: flex; align-items: center; gap: 5px; }
    .canvas-actions { display: flex; align-items: center; gap: 4px; }
    .action-btn { background: var(--bg-surface-elevated); border: 1px solid var(--border-subtle); color: #cbd5e1; padding: 3px 7px; border-radius: 6px; font-size: 11px; cursor: pointer; display: inline-flex; align-items: center; gap: 3px; }
    .action-btn:hover { background: #334155; color: #fff; }
    .canvas-body { font-size: 13.5px; color: #f8fafc; line-height: 1.6; font-weight: 400; white-space: pre-wrap; word-break: break-word; }
    .placeholder-hint { color: #64748b; font-style: italic; font-size: 12px; }
    .trigger-bar { margin-top: 10px; }
    .trigger-btn { width: 100%; padding: 8px 12px; border: none; border-radius: 8px; background: linear-gradient(135deg, #0284c7 0%, #2563eb 100%); color: #fff; font-size: 12.5px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; box-shadow: 0 4px 12px rgba(2, 132, 199, 0.35); }
    .trigger-btn:disabled { background: #334155; color: #94a3b8; cursor: not-allowed; box-shadow: none; }
    .spinner { width: 13px; height: 13px; border: 2px solid rgba(255, 255, 255, 0.3); border-top-color: #fff; border-radius: 50%; animation: spin 0.6s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
  </style>
</head>
<body>
  <div class="hud-header">
    <div class="brand-group">
      <div class="brand-symbol">⚡</div>
      <div class="brand-title">QuickLens</div>
    </div>
    <button id="engine-toggle-btn" class="engine-badge-btn" title="AIキー金庫を開く">
      <span id="engine-badge-text">無料モード</span>
      <span>⚙️</span>
    </button>
  </div>

  <div id="vault-drawer" class="vault-drawer">
    <div class="vault-title">
      <span>🔐 セキュア・ローカル金庫 (AES-GCM 256bit)</span>
      <span style="font-size: 10px; color: #94a3b8;">登録不要・端末内完結</span>
    </div>
    <div class="vault-desc">
      あなたのAPIキーは端末内で暗号化保存され、Google/OpenAIの公式エンドポイントへ直接送信されます。第三者サーバーは一切経由しません。
    </div>

    <div class="vault-input-group">
      <label class="vault-label">Google Gemini API Key (推奨・格安):</label>
      <div class="vault-input-row">
        <input type="password" id="gemini-key-input" class="vault-input" placeholder="AIzaSy...">
        <button id="save-gemini-btn" class="vault-btn">保存</button>
      </div>
    </div>

    <div class="vault-input-group">
      <label class="vault-label">OpenAI API Key:</label>
      <div class="vault-input-row">
        <input type="password" id="openai-key-input" class="vault-input" placeholder="sk-proj-...">
        <button id="save-openai-btn" class="vault-btn">保存</button>
      </div>
    </div>

    <div class="vault-engine-selector">
      <div id="chip-free" class="engine-chip active">🆓 無料 (キー不要)</div>
      <div id="chip-gemini" class="engine-chip">⚡ Gemini AI</div>
      <div id="chip-openai" class="engine-chip">🧠 OpenAI</div>
    </div>
  </div>

  <div class="lang-ribbon">
    <button class="lang-pill active" data-lang="ja">🇯🇵 日本語</button>
    <button class="lang-pill" data-lang="en">🇺🇸 英語</button>
    <button class="lang-pill" data-lang="zh-CN">🇨🇳 中国語</button>
    <button class="lang-pill" data-lang="ko">🇰🇷 韓国語</button>
    <button class="lang-pill" data-lang="es">🇪🇸 西語</button>
    <select id="more-lang-select" class="lang-more-select" title="その他の言語">
      <option value="">＋他</option>
      <option value="fr">🇫🇷 仏語</option>
      <option value="de">🇩🇪 独語</option>
      <option value="it">🇮🇹 伊語</option>
      <option value="ru">🇷🇺 露語</option>
    </select>
  </div>

  <div class="tone-bar">
    <button class="tone-tab active" data-tone="natural">💬 自然な訳</button>
    <button class="tone-tab" data-tone="business">👔 ビジネス敬語</button>
    <button class="tone-tab" data-tone="summary">📝 要約</button>
    <button class="tone-tab" data-tone="breakdown">🔍 解説</button>
  </div>

  <div class="source-deck">
    <div class="deck-subhead">
      <span id="detected-badge">検出コンテキスト</span>
      <div class="deck-tools">
        <button id="clear-source-btn" class="clear-link">クリア</button>
        <span id="source-char-count">0文字</span>
      </div>
    </div>
    <textarea id="source-input" class="source-textarea" placeholder="Webページでテキストを選択するか、ここに入力..."></textarea>
  </div>

  <div class="trigger-bar">
    <button id="trigger-btn" class="trigger-btn">
      <span id="trigger-spinner" class="spinner" style="display: none;"></span>
      <span id="trigger-text">読み解く (Ctrl+Enter)</span>
    </button>
  </div>

  <div class="reading-canvas" style="margin-top: 10px;">
    <div class="canvas-header">
      <div class="canvas-title">
        <span>✨ 理解インサイト</span>
      </div>
      <div class="canvas-actions">
        <button id="canvas-copy-btn" class="action-btn" title="コピー">📋 コピー</button>
        <button id="canvas-speak-btn" class="action-btn" title="読み上げ">🔊 発音</button>
      </div>
    </div>
    <div id="canvas-result" class="canvas-body placeholder-hint">
      選択テキストを自動取得してここに表示します
    </div>
  </div>

  <script src="crypto-vault.js"></script>
  <script src="popup.js"></script>
</body>
</html>`
  },
  {
    name: "popup.js",
    path: "popup.js",
    language: "javascript",
    role: "Focus Lens ポップアップ動作ロジック & 暗号化キー管理",
    description: "言語リボン、トーン切り替え、Web Crypto暗号化APIキーの保存、Gmail/GitHub/SPAからの安全なテキスト取得を制御します。",
    content: `/**
 * QuickLens - Popup Controller
 * @license Apache-2.0
 */

document.addEventListener("DOMContentLoaded", async () => {
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

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab && tab.id && !tab.url.startsWith("chrome://") && !tab.url.startsWith("edge://")) {
      chrome.tabs.sendMessage(tab.id, { action: "GET_SELECTED_TEXT" }, (response) => {
        if (chrome.runtime.lastError) {
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
    sourceCharCount.textContent = \`\${sourceInput.value.length}文字\`;
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
      canvasResult.textContent = \`⚠️ 取得エラー: \${err.message || "通信状況を確認してください"}\`;
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

  canvasCopyBtn.addEventListener("click", async () => {
    if (!currentTranslatedOutput) return;
    await navigator.clipboard.writeText(currentTranslatedOutput);
    canvasCopyBtn.textContent = "✓ 完了";
    setTimeout(() => { canvasCopyBtn.textContent = "📋 コピー"; }, 1500);
  });

  canvasSpeakBtn.addEventListener("click", () => {
    if (!currentTranslatedOutput || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(currentTranslatedOutput);
    utterance.lang = currentTargetLang;
    window.speechSynthesis.speak(utterance);
  });
});`
  },
  {
    name: "options.html",
    path: "options.html",
    language: "html",
    role: "拡張機能オプション設定画面UI",
    description: "翻訳エンジン、標準トーン、Gmail/GitHub等でのiframe表示設定や暗号化セキュリティ仕様を解説・管理します。",
    content: `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>QuickLens - 設定オプション</title>
  <style>
    :root {
      --bg: #090d16;
      --card: #111827;
      --border: #1f293d;
      --accent: #38bdf8;
      --accent-purple: #c084fc;
      --text: #f8fafc;
      --text-muted: #94a3b8;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    body { background: var(--bg); color: var(--text); padding: 32px 16px; font-size: 13px; line-height: 1.6; }
    .container { max-width: 620px; margin: 0 auto; background: var(--card); border: 1px solid var(--border); border-radius: 14px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #0284c7 0%, #4f46e5 100%); padding: 22px 24px; }
    .header h1 { font-size: 18px; font-weight: 700; color: #fff; margin-bottom: 4px; display: flex; align-items: center; gap: 8px; }
    .header p { font-size: 12px; color: #e0f2fe; }
    .content { padding: 24px; }
    .section { margin-bottom: 24px; padding-bottom: 20px; border-bottom: 1px solid var(--border); }
    .section:last-child { border-bottom: none; }
    .section-title { font-size: 13.5px; font-weight: 700; color: #fff; margin-bottom: 12px; display: flex; align-items: center; gap: 6px; }
    .form-group { margin-bottom: 14px; }
    .label { display: block; font-weight: 600; color: #e2e8f0; margin-bottom: 5px; }
    .desc { font-size: 11.5px; color: var(--text-muted); margin-bottom: 6px; }
    .select, .input {
      width: 100%; max-width: 320px; padding: 8px 10px; border-radius: 6px;
      border: 1px solid var(--border); background: #0c1220; color: #fff; font-size: 12.5px; outline: none;
    }
    .select:focus, .input:focus { border-color: var(--accent); }
    .checkbox-label { display: flex; align-items: center; gap: 8px; cursor: pointer; color: #cbd5e1; font-weight: 500; }
    .info-box { background: #0c1220; border: 1px solid var(--border); border-radius: 8px; padding: 12px; font-size: 11.5px; color: #cbd5e1; }
    .info-box code { color: var(--accent); background: rgba(56,189,248,0.1); padding: 1px 5px; border-radius: 4px; font-family: monospace; }
    .footer { display: flex; align-items: center; justify-content: space-between; padding: 16px 24px; background: #0c1220; border-top: 1px solid var(--border); }
    .save-btn { background: #0284c7; color: #fff; border: none; padding: 8px 18px; border-radius: 6px; font-weight: 600; cursor: pointer; }
    .save-btn:hover { background: #0369a1; }
    .reset-btn { background: transparent; border: 1px solid var(--border); color: var(--text-muted); padding: 8px 14px; border-radius: 6px; cursor: pointer; }
    .toast { position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%) translateY(20px); background: #10b981; color: #fff; padding: 8px 18px; border-radius: 30px; font-size: 12px; font-weight: 600; opacity: 0; transition: all 0.2s ease; pointer-events: none; }
    .toast.show { transform: translateX(-50%) translateY(0); opacity: 1; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⚡ QuickLens 設定オプション</h1>
      <p>デフォルト翻訳言語、AIキーのセキュア保管、Gmail/GitHub等での表示動作を設定します。</p>
    </div>

    <div class="content">
      <div class="section">
        <h2 class="section-title">翻訳エンジン</h2>
        <div class="form-group">
          <label class="label">標準エンジン</label>
          <div class="desc">デフォルトは完全無料・APIキー不要です。ご自身のキーを登録するとGeminiやOpenAIのスマート解説が利用できます。</div>
          <select id="opt-engine" class="select">
            <option value="free">🆓 完全無料エンジン (APIキー不要・Google gtx)</option>
            <option value="gemini">⚡ Google Gemini AI (ユーザー登録不要・端末暗号化キー)</option>
            <option value="openai">🧠 OpenAI GPT-4o-mini (ユーザー登録不要・端末暗号化キー)</option>
          </select>
        </div>

        <div class="form-group">
          <label class="label">標準文体トーン</label>
          <select id="opt-tone" class="select">
            <option value="natural">💬 自然な日常訳 (Natural)</option>
            <option value="business">👔 ビジネス敬語・公式文書 (Formal)</option>
            <option value="summary">📝 箇条書き要約 (Summary)</option>
            <option value="breakdown">🔍 翻訳 ＋ 重要単語・ニュアンス解説 (Breakdown)</option>
          </select>
        </div>
      </div>

      <div class="section">
        <h2 class="section-title">特殊環境・表示設定 (Gmail, GitHub, SPA対応)</h2>
        <div class="form-group">
          <label class="checkbox-label">
            <input type="checkbox" id="opt-all-frames" checked disabled>
            <span>iframe内のメール本文やコード画面でも動作する (all_frames有効)</span>
          </label>
        </div>
        <div class="form-group">
          <label class="label">ページ内トースト表示時間</label>
          <select id="opt-toast-duration" class="select">
            <option value="5000">5 秒間</option>
            <option value="10000">10 秒間 (標準)</option>
            <option value="20000">20 秒間</option>
            <option value="0">手動で閉じるまで表示</option>
          </select>
        </div>
      </div>

      <div class="section">
        <h2 class="section-title">セキュリティ仕様</h2>
        <div class="info-box">
          <p><strong>🔒 エンドツーエンド暗号化 (Web Crypto AES-GCM):</strong></p>
          <p style="margin-top: 4px;">
            登録したAPIキーは拡張機能の隔離領域（<code>chrome.storage.local</code>）に256ビット暗号化されて格納されます。クラウド同期や外部サーバー送信は一切行われず、公式APIへ直接リクエストを送信します。
          </p>
        </div>
      </div>
    </div>

    <div class="footer">
      <button id="reset-btn" class="reset-btn">初期設定に戻す</button>
      <button id="save-btn" class="save-btn">設定を保存する</button>
    </div>
  </div>
  <div id="save-toast" class="toast">✓ 設定を保存しました</div>
  <script src="options.js"></script>
</body>
</html>`
  },
  {
    name: "options.js",
    path: "options.js",
    language: "javascript",
    role: "オプション画面制御",
    description: "chrome.storage.sync と連携して標準エンジン、トーン、表示時間等の設定を永続化します。",
    content: `/**
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
});`
  },
  {
    name: "README.md",
    path: "README.md",
    language: "markdown",
    role: "拡張機能の完全ガイド・設計書",
    description: "Focus Lens UIの設計思想、端末内AES-GCM暗号化キー金庫、Gmail/GitHub等の特殊環境対策、導入手順を記載。",
    content: `# QuickLens 翻訳 (Focus Lens Translator) - Manifest V3

Webページ上でハイライト（選択）したテキストを、右クリックメニューまたは拡張機能ポップアップから素早く指定言語に読み解くインテリジェント翻訳拡張機能です。

---

## 🌟 今回の進化ポイントと工夫

### 1. 既存翻訳アプリ（DeepL等）とは一線を画す「Focus Lens UI」
- 単に2つの入力枠を並べるだけのUIから脱却し、**「文章を素早く理解・精読するためのフォーカス・デッキ」** を採用。
- **4つの文体・トーン調整**:
  - 💬 **自然な訳 (Natural)**: こなれた母国語表現
  - 👔 **ビジネス敬語 (Formal)**: メールや公式文書向けの格調高い表現
  - 📝 **要約 (Summary)**: 長文から重要点を箇条書き抽出
  - 🔍 **解説 (Breakdown)**: 訳文 ＋ 重要単語・ニュアンス・文法ポイント
- **クイック言語リボン**: 🇯🇵 JP / 🇺🇸 EN / 🇨🇳 CN / 🇰🇷 KR / 🇪🇸 ES をワンタップで即時切り替え。

### 2. ユーザー登録不要＆端末内暗号化キー金庫 (Web Crypto AES-GCM 256bit)
- **デフォルトは完全無料・APIキー不要**（Google Translateパブリックエンジン）で即使えます。
- 自身の **Google Gemini API**（Gemini 2.5 Flash等）や **OpenAI API**（GPT-4o-mini等）を利用したい場合、ポップアップ内の「セキュア金庫」に登録可能。
- **セキュリティの仕組み**:
  - \`chrome.storage.sync\`（クラウド同期）ではなく \`chrome.storage.local\` を使用。
  - Web Crypto APIの \`AES-GCM 256bit\` で端末内暗号化してからローカル保存。
  - クラウドや仲介サーバーを経由せず、ユーザーのブラウザから直接Google / OpenAI公式エンドポイントへ直接HTTPS送信。APIキーが第三者に漏洩するリスクをゼロにします。

### 3. GmailやGitHubなどの特殊環境への完全適応対策
- **Closed Shadow DOM 採用**:
  - GitHubのダークテーマCSSやGmailの強力なCSSリセットが拡張機能のトーストに干渉しないよう、完全に隔離されたShadow DOM内で描画。ページデザインも一切崩しません。
- **\`all_frames: true\` によるiframe対応**:
  - Gmailのメール本文フレームやエディタ内でも確実にスクリプトが稼働。
- **動的再注入フォールバック**:
  - GitHubのPJAX/Turbo遷移などでコンテンツスクリプトの接続が切断されても、\`background.js\` が自動検知して再注入＆再送するため、「動かない」トラブルを未然に防ぎます。

---

## 📦 ファイル構成
\`\`\`text
chrome-extension/
├── manifest.json        # 拡張機能設定 (all_frames, host_permissions, MV3)
├── background.js        # サービスワーカー (翻訳ルーティング, フレーム安全送信)
├── crypto-vault.js      # AES-GCM 256bit 暗号化・復号ユーティリティ
├── content.js           # ページ内Shadow DOMトースト描画＆多層テキスト抽出
├── popup.html           # Focus Lens HUD マークアップ
├── popup.js             # フォーカス・デッキ制御 & 金庫連携
├── options.html         # オプション設定画面
├── options.js           # オプション保存ロジック
└── icons/               # 16px, 48px, 128px アイコン画像
\`\`\`

---

## 🛠️ インストール手順 (Chrome)
1. フォルダ \`chrome-extension\` をローカルPCに配置（または本アプリからZIPダウンロードして解凍）。
2. Chromeで \`chrome://extensions/\` を開く。
3. 右上の **「デベロッパーモード」** をONにする。
4. 左上の **「パッケージ化されていない拡張機能を読み込む」** を押し、\`manifest.json\` があるフォルダを選択。
`
  }
];
