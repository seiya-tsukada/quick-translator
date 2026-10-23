/**
 * QuickLens - Secure Local Cryptographic Vault
 * Web Crypto API (AES-GCM 256bit) を利用し、ユーザーのAPIキーを暗号化してローカル保存するユーティリティ
 * サーバー不要・ユーザー登録不要・端末内完結
 */

const VAULT_CONFIG = self.QUICKLENS_CONFIG.VAULT;
const VAULT_STORAGE_KEY = VAULT_CONFIG.STORAGE_KEY;
const DEVICE_SALT_KEY = VAULT_CONFIG.DEVICE_SALT_KEY;

// 端末固有の暗号化ソルトを取得または生成
async function getOrCreateDeviceSalt() {
  const result = await chrome.storage.local.get(DEVICE_SALT_KEY);
  if (result[DEVICE_SALT_KEY]) {
    return new Uint8Array(result[DEVICE_SALT_KEY]);
  }
  const newSalt = crypto.getRandomValues(new Uint8Array(VAULT_CONFIG.SALT_BYTES));
  await chrome.storage.local.set({ [DEVICE_SALT_KEY]: Array.from(newSalt) });
  return newSalt;
}

// 端末固有のマスターキーを導出
async function deriveVaultKey() {
  const salt = await getOrCreateDeviceSalt();
  // Chrome拡張機能固有のIDと拡張スコープに基づく安全なシード
  const extensionId = chrome.runtime.id || VAULT_CONFIG.FALLBACK_EXTENSION_ID;
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(`${VAULT_CONFIG.SECRET_PREFIX}${extensionId}`),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: VAULT_CONFIG.PBKDF2_ITERATIONS,
      hash: VAULT_CONFIG.PBKDF2_HASH
    },
    keyMaterial,
    { name: "AES-GCM", length: VAULT_CONFIG.AES_KEY_LENGTH },
    false,
    ["encrypt", "decrypt"]
  );
}

/**
 * APIキーをAES-GCMで暗号化してchrome.storage.localに保存
 * @param {string} provider - 'gemini' | 'openai' | 'deepl'
 * @param {string} apiKey - 平文のAPIキー
 */
async function saveEncryptedApiKey(provider, apiKey) {
  if (!apiKey || !apiKey.trim()) {
    // 削除処理
    const existing = await getEncryptedVault();
    delete existing[provider];
    await chrome.storage.local.set({ [VAULT_STORAGE_KEY]: existing });
    return;
  }

  const key = await deriveVaultKey();
  const iv = crypto.getRandomValues(new Uint8Array(VAULT_CONFIG.IV_BYTES));
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
 * @param {string} provider - 'gemini' | 'openai' | 'deepl'
 * @returns {Promise<string | null>}
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

// Service worker / browser export
if (typeof self !== "undefined") {
  self.VaultCrypto = {
    saveEncryptedApiKey,
    getDecryptedApiKey,
    getApiKeyStatus
  };
}
