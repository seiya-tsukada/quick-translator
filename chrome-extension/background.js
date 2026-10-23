/**
 * QuickLens - Manifest V3 Background Service Worker
 */

importScripts("config.js", "crypto-vault.js");

const { DEFAULT_SETTINGS, CONTEXT_MENU, ACTIONS, API, TIMING, CONTENT_SCRIPT_FILES } = self.QUICKLENS_CONFIG;

// インストール時の初期化
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get(DEFAULT_SETTINGS, (items) => {
    chrome.storage.sync.set(items);
  });

  // 右クリックコンテキストメニュー
  chrome.contextMenus.create({
    id: CONTEXT_MENU.ID,
    title: CONTEXT_MENU.TITLE,
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
async function translateWithEngine(text, targetLang = DEFAULT_SETTINGS.targetLang, tone = DEFAULT_SETTINGS.tone, sourceLang = DEFAULT_SETTINGS.sourceLang) {
  if (!text || !text.trim()) return { translatedText: "", meta: {} };

  const settings = await chrome.storage.sync.get(DEFAULT_SETTINGS);
  const engine = settings.engine || DEFAULT_SETTINGS.engine;

  // 1. ユーザー所有のAIキー (Gemini / OpenAI) を使用する場合
  const aiTranslator = AI_TRANSLATORS[engine];
  if (aiTranslator) {
    const apiKey = await self.VaultCrypto.getDecryptedApiKey(engine);
    if (apiKey) {
      try {
        return await aiTranslator.translate(text, targetLang, tone, sourceLang, apiKey);
      } catch (aiError) {
        // フォールバックして無料エンジンで実行
        console.warn(`[QuickLens] ${aiTranslator.label} API失敗のため無料エンジンへ自動フォールバック:`, aiError);
      }
    }
  }

  // 2. デフォルト / フォールバック: 無料GoogleパブリックAPI
  return await translateViaFreeEngine(text, targetLang, sourceLang);
}

/**
 * 無料 GoogleパブリックGTXエンジン（キー不要・即時）
 */
async function translateViaFreeEngine(text, targetLang = DEFAULT_SETTINGS.targetLang, sourceLang = DEFAULT_SETTINGS.sourceLang) {
  const url = `${API.FREE_TRANSLATE_URL}?client=gtx&sl=${encodeURIComponent(
    sourceLang
  )}&tl=${encodeURIComponent(targetLang)}&dt=t&q=${encodeURIComponent(text)}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`翻訳サーバー応答エラー: HTTP ${response.status}`);
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
    natural: `以下のテキストを、文脈に即した自然でこなれた${targetLang}に翻訳してください。直訳にならず、母国語話者が自然に読む文章にしてください。余計な挨拶や前置きは省き、翻訳文のみを出力してください。`,
    business: `以下のテキストを、丁寧で格調の高いビジネス敬語の${targetLang}に翻訳してください。ビジネスメールや公式な仕様書にふさわしい文体にしてください。翻訳文のみを出力してください。`,
    summary: `以下のテキストの主要なポイントを要約し、分かりやすい${targetLang}の箇条書き（3〜4行以内）で出力してください。`,
    breakdown: `以下のテキストを翻訳した上で、文中に含まれる重要な語彙や慣用表現、ニュアンスの解説を添えて${targetLang}で出力してください。`
  };

  const systemInstruction = promptMap[tone] || promptMap.natural;
  const endpoint = `${API.GEMINI_BASE_URL}/${API.GEMINI_MODEL}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const payload = {
    contents: [
      {
        role: "user",
        parts: [
          { text: `${systemInstruction}\n\n対象テキスト:\n"""\n${text}\n"""` }
        ]
      }
    ],
    generationConfig: {
      temperature: API.TEMPERATURE,
      maxOutputTokens: API.GEMINI_MAX_OUTPUT_TOKENS
    }
  };

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini APIエラー (${res.status}): ${errText}`);
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
    natural: `Natural, native-sounding ${targetLang}`,
    business: `Professional, formal polite ${targetLang}`,
    summary: `Concise bulleted summary in ${targetLang}`,
    breakdown: `Translation in ${targetLang} followed by brief vocabulary and nuance nuances breakdown`
  }[tone] || `Accurate ${targetLang}`;

  const res = await fetch(API.OPENAI_CHAT_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: API.OPENAI_MODEL,
      temperature: API.TEMPERATURE,
      messages: [
        {
          role: "system",
          content: `You are a precision reading assistant. Translate the text into ${toneDesc}. Output only the result without conversational filler.`
        },
        { role: "user", content: text }
      ]
    })
  });

  if (!res.ok) {
    throw new Error(`OpenAI APIエラー: HTTP ${res.status}`);
  }

  const data = await res.json();
  return {
    translatedText: data.choices?.[0]?.message?.content?.trim() || "",
    engineUsed: "openai",
    tone: tone
  };
}

// ユーザー所有キーで利用できるAIエンジン
const AI_TRANSLATORS = {
  gemini: { label: "Gemini", translate: translateViaGemini },
  openai: { label: "OpenAI", translate: translateViaOpenAI }
};

/**
 * Gmail / GitHub / 動的SPA 等の特殊環境に対応した安全なメッセージ送信＆自動スクリプト注入
 */
async function sendToTabWithFallback(tabId, frameId, message) {
  const options = typeof frameId === "number" ? { frameId } : {};

  try {
    // まず通常のタブ（または特定フレーム）へのメッセージ送信を試行
    await chrome.tabs.sendMessage(tabId, message, options);
  } catch (err) {
    // 接続確立失敗（GitHub PJAX遷移後、Gmailのiframe内、または未ロード環境）
    // 動的にコンテンツスクリプトを注入して即座に再試行
    try {
      await chrome.scripting.executeScript({
        target: {
          tabId: tabId,
          frameIds: typeof frameId === "number" ? [frameId] : [0]
        },
        files: [...CONTENT_SCRIPT_FILES]
      });

      // 注入完了をわずかに待機して再送
      setTimeout(() => {
        chrome.tabs.sendMessage(tabId, message, options).catch((retryErr) => {
          console.warn("[QuickLens] 再送メッセージのエラー（保護ページ等の可能性）:", retryErr);
        });
      }, TIMING.REINJECT_RETRY_DELAY);
    } catch (injectErr) {
      console.warn("[QuickLens] スクリプトの動的注入が拒否されました（chrome:// 等の保護ページ）:", injectErr);
    }
  }
}

// 右クリックメニューのクリックハンドラー
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId !== CONTEXT_MENU.ID) return;
  if (!tab || !tab.id) return;

  const selectedText = info.selectionText ? info.selectionText.trim() : "";
  if (!selectedText) return;

  const settings = await chrome.storage.sync.get(DEFAULT_SETTINGS);
  const targetLang = settings.targetLang || DEFAULT_SETTINGS.targetLang;
  const tone = settings.tone || DEFAULT_SETTINGS.tone;
  const frameId = info.frameId || 0;

  // 1. ローディングトーストを表示（Gmailの特定iframe内でも正確に表示）
  await sendToTabWithFallback(tab.id, frameId, {
    action: ACTIONS.SHOW_LOADING_HUD,
    text: selectedText
  });

  try {
    // 2. 翻訳実行
    const result = await translateWithEngine(selectedText, targetLang, tone, settings.sourceLang || DEFAULT_SETTINGS.sourceLang);

    // 3. 完了トーストを表示
    await sendToTabWithFallback(tab.id, frameId, {
      action: ACTIONS.SHOW_TRANSLATION_HUD,
      originalText: selectedText,
      translatedText: result.translatedText,
      targetLang: targetLang,
      engineUsed: result.engineUsed || DEFAULT_SETTINGS.engine,
      tone: tone,
      duration: settings.toastDuration || DEFAULT_SETTINGS.toastDuration
    });
  } catch (err) {
    await sendToTabWithFallback(tab.id, frameId, {
      action: ACTIONS.SHOW_ERROR_HUD,
      errorMessage: "翻訳の取得に失敗しました。ネットワークまたはAPIキーを確認してください。"
    });
  }
});

// ポップアップやコンテンツスクリプトからのメッセージ受信
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === ACTIONS.EXECUTE_TRANSLATION) {
    translateWithEngine(request.text, request.targetLang, request.tone, request.sourceLang)
      .then((res) => {
        sendResponse({ success: true, ...res });
      })
      .catch((err) => {
        sendResponse({ success: false, error: err.message });
      });
    return true; // 非同期レスポンス
  }

  // 暗号化キー管理
  if (request.action === ACTIONS.VAULT_SAVE_KEY) {
    self.VaultCrypto.saveEncryptedApiKey(request.provider, request.apiKey)
      .then(() => sendResponse({ success: true }))
      .catch((err) => sendResponse({ success: false, error: err.message }));
    return true;
  }

  if (request.action === ACTIONS.VAULT_GET_STATUS) {
    self.VaultCrypto.getApiKeyStatus()
      .then((status) => sendResponse({ success: true, status }))
      .catch((err) => sendResponse({ success: false, error: err.message }));
    return true;
  }
});
