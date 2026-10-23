/**
 * Chrome Extension Source Code & Asset Registry
 * chrome-extension/ 配下の実ファイルをビルド時に読み込み、表示用メタデータと組み合わせて提供します。
 */

import manifestJson from "../chrome-extension/manifest.json?raw";
import configJs from "../chrome-extension/config.js?raw";
import cryptoVaultJs from "../chrome-extension/crypto-vault.js?raw";
import backgroundJs from "../chrome-extension/background.js?raw";
import contentJs from "../chrome-extension/content.js?raw";
import popupHtml from "../chrome-extension/popup.html?raw";
import popupJs from "../chrome-extension/popup.js?raw";
import optionsHtml from "../chrome-extension/options.html?raw";
import optionsJs from "../chrome-extension/options.js?raw";
import readmeMd from "../chrome-extension/README.md?raw";
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

export const EXTENSION_FILES: ExtensionFile[] = [
  {
    name: "manifest.json",
    path: "manifest.json",
    language: "json",
    role: "拡張機能の基本構成・権限（Gmail/GitHub対応）",
    description: "all_frames: true および match_about_blank: true でGmailのiframe内メールやGitHubのSPA遷移でも稼働。Gemini/OpenAIへのホスト権限も完備。",
    content: manifestJson
  },
  {
    name: "config.js",
    path: "config.js",
    language: "javascript",
    role: "共通定義ファイル（設定初期値・API・タイミング等の定数）",
    description: "background / content / popup / options / crypto-vault から参照される定数を一元管理します。エンドポイントやモデル名、表示時間などはここで変更できます。",
    content: configJs
  },
  {
    name: "crypto-vault.js",
    path: "crypto-vault.js",
    language: "javascript",
    role: "ローカル暗号化金庫 (Web Crypto AES-GCM 256bit)",
    description: "ユーザーのAPIキーを端末内だけで暗号化してchrome.storage.localに保存。ユーザー登録不要・外部サーバー一切非経由の安全な仕組みです。",
    content: cryptoVaultJs
  },
  {
    name: "background.js",
    path: "background.js",
    language: "javascript",
    role: "サービスワーカー（無料エンジン ＆ Gemini/OpenAI ルーター）",
    description: "デフォルトの無料Googleパブリック翻訳、マイAIキーによるスマート翻訳、Gmail/GitHubフレームへの動的再注入フォールバックを統括します。",
    content: backgroundJs
  },
  {
    name: "content.js",
    path: "content.js",
    language: "javascript",
    role: "Closed Shadow DOM トースト描画 ＆ 多層テキスト抽出",
    description: "Gmailのiframe内やGitHubのダークモードCSSをClosed Shadow DOMで完全遮断。独自のFocus Lens HUDを画面右下にフロート表示します。",
    content: contentJs
  },
  {
    name: "popup.html",
    path: "popup.html",
    language: "html",
    role: "Focus Lens HUD ポップアップ画面 (脱DeepLクローンUI)",
    description: "2つの枠を並べる旧来UIを刷新。言語リボン、4つの文体トーンバー、セキュアなキー金庫ドロワー、読解専用キャンバスを搭載。",
    content: popupHtml
  },
  {
    name: "popup.js",
    path: "popup.js",
    language: "javascript",
    role: "Focus Lens ポップアップ動作ロジック & 暗号化キー管理",
    description: "言語リボン、トーン切り替え、Web Crypto暗号化APIキーの保存、Gmail/GitHub/SPAからの安全なテキスト取得を制御します。",
    content: popupJs
  },
  {
    name: "options.html",
    path: "options.html",
    language: "html",
    role: "拡張機能オプション設定画面UI",
    description: "翻訳エンジン、標準トーン、Gmail/GitHub等でのiframe表示設定や暗号化セキュリティ仕様を解説・管理します。",
    content: optionsHtml
  },
  {
    name: "options.js",
    path: "options.js",
    language: "javascript",
    role: "オプション画面制御",
    description: "chrome.storage.sync と連携して標準エンジン、トーン、表示時間等の設定を永続化します。",
    content: optionsJs
  },
  {
    name: "README.md",
    path: "README.md",
    language: "markdown",
    role: "拡張機能の完全ガイド・設計書",
    description: "Focus Lens UIの設計思想、端末内AES-GCM暗号化キー金庫、Gmail/GitHub等の特殊環境対策、導入手順を記載。",
    content: readmeMd
  }
];
