/**
 * Chrome Extension Source Code & Asset Registry
 * chrome-extension/ 配下のテキストファイルをビルド時にすべて取り込み、表示用メタデータと組み合わせて提供します。
 * ファイルを追加しても自動で反映されます（説明文は FILE_META に追記してください）。
 */

import icon16 from "../chrome-extension/icons/icon16.png?inline";
import icon48 from "../chrome-extension/icons/icon48.png?inline";
import icon128 from "../chrome-extension/icons/icon128.png?inline";

export interface ExtensionFile {
  name: string;
  path: string;
  language: string;
  description: string;
  role: string;
  content: string;
  isBinary?: boolean;
}

/** `data:image/png;base64,...` 形式から base64 本体のみを取り出す */
function toBase64(dataUrl: string): string {
  return dataUrl.slice(dataUrl.indexOf(",") + 1);
}

export const EXTENSION_ICONS_BASE64 = {
  "icon16.png": toBase64(icon16),
  "icon48.png": toBase64(icon48),
  "icon128.png": toBase64(icon128)
};

const RAW_FILES = import.meta.glob("../chrome-extension/**/*.{js,json,html,css,md}", {
  query: "?raw",
  import: "default",
  eager: true
}) as Record<string, string>;

const FILE_META: Record<string, { role: string; description: string }> = {
  "manifest.json": {
    role: "拡張機能の構成・権限",
    description: "activeTab + scripting による必要時のみの注入。AI 事業者のドメインは optional_host_permissions で、キー保存時にだけ許可を求めます。"
  },
  "config.js": {
    role: "共通定義（設定初期値・言語対応表・API・タイミング）",
    description: "言語名の変換表、DeepL の言語コード対応表、モデル名、寄付リンクなどの定数を一元管理します。"
  },
  "background.js": {
    role: "サービスワーカー（起点の処理・動的注入・AI 翻訳）",
    description: "右クリック / ショートカットを受けて上位フレームに HUD を注入し、ユーザー自身のキーによる AI 翻訳を中継します。"
  },
  "content.js": {
    role: "ページ内 HUD（Shadow DOM）",
    description: "Closed Shadow DOM 内に翻訳カードを描画します。キーボード操作・Esc で閉じる・フォーカス復帰に対応。"
  },
  "crypto-vault.js": {
    role: "API キーの端末内保存",
    description: "キーを chrome.storage.local に AES-GCM で暗号化して保存します（同じ端末内の情報から鍵を作るため、難読化に近い仕組みです）。"
  },
  "lib/builtin-translator.js": {
    role: "端末内翻訳（Translator / Language Detector API）",
    description: "モデルの状態確認・ダウンロード進捗・言語判定・長文分割をまとめた Chrome 組み込み翻訳のラッパーです。"
  },
  "lib/ai-engines.js": { role: "AI エンジン（OpenAI / DeepL）", description: "ユーザー自身のキーで各事業者の公式 API を呼び出します。" },
  "lib/router.js": { role: "翻訳ルーター", description: "エンジンを選び、AI が失敗したときは理由つきで端末内翻訳に切り替えます。" }
};

function languageOf(path: string): string {
  if (path.endsWith(".json")) return "json";
  if (path.endsWith(".html")) return "html";
  if (path.endsWith(".css")) return "css";
  if (path.endsWith(".md")) return "markdown";
  return "javascript";
}

export const EXTENSION_FILES: ExtensionFile[] = Object.entries(RAW_FILES)
  .map(([key, content]) => {
    const path = key.replace("../chrome-extension/", "");
    const meta = FILE_META[path];
    return {
      name: path.split("/").pop() || path,
      path,
      language: languageOf(path),
      role: meta?.role ?? path,
      description: meta?.description ?? "",
      content
    };
  })
  .sort((a, b) => {
    const order = (p: string) => (p === "manifest.json" ? 0 : p === "config.js" ? 1 : p.includes("/") ? 3 : 2);
    return order(a.path) - order(b.path) || a.path.localeCompare(b.path);
  });
