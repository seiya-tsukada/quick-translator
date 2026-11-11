# QuickLens 翻訳（QuickLens Translator）

Web ページで選んだテキストを、その場で翻訳する Chrome 拡張機能（Manifest V3）です。

- **右クリック**・**ショートカット（Alt+T）**・**ポップアップ**の 3 つの起点
- 標準は Chrome 組み込みの **端末内翻訳**（Translator API / Language Detector API）。無料・キー不要で、テキストは端末の外に出ません
- 任意で **自分の API キー**（Google Gemini / OpenAI / DeepL）を登録すると、ビジネス敬語・要約・解説つきなどのトーンが使えます
- 開発者はサーバーを運営せず、データを収集しません（[プライバシーポリシー](docs/privacy-policy.md)）
- 収益化は寄付のみ。すべての機能を誰でも無料で使えます

## 動作要件

- 端末内翻訳：デスクトップ版 Chrome 138 以降（モバイル非対応）。言語の組み合わせごとに初回だけモデルをダウンロードします。モデルのダウンロードを始めるにはページ上でのクリックが必要なため、必要なときは翻訳カードに「モデルをダウンロードして翻訳」ボタンが出ます
- AI エンジン：各事業者の API キー

## インストール（開発版）

1. `chrome://extensions/` を開き、右上の「デベロッパー モード」をオンにする
2. 「パッケージ化されていない拡張機能を読み込む」で `chrome-extension/` フォルダを選ぶ

## 構成

```text
chrome-extension/
  manifest.json            権限：contextMenus, storage, activeTab, scripting（+ AI 事業者は optional_host_permissions）
  config.js                定数（設定初期値・言語名の変換表・DeepL コード対応表・モデル名・寄付 URL など）
  background.js            サービスワーカー：右クリック / ショートカット / 動的注入 / AI 翻訳（BYOK）
  content.js               ページ内の翻訳カード（Closed Shadow DOM）
  popup.html, popup.js     ポップアップ
  options.html, options.js 設定画面（API キー・表示・ショートカット・応援）
  onboarding.html, .js     初回インストール時の案内ページ
  crypto-vault.js          API キーの端末内保存
  lib/                     翻訳ルーター、端末内翻訳、AI エンジン、長文分割、エラー分類、i18n、テーマ、アイコン
  styles/common.css        拡張機能ページ共通のテーマトークン
  _locales/{en,ja}/        UI 文字列
docs/
  privacy-policy.md        プライバシーポリシー（日英）
  store-listing.md         ストア掲載情報の下書き
tests/                     ユニットテスト（node:test）
scripts/zip-extension.mjs  chrome-extension/ だけを zip にするスクリプト
```

### 翻訳の流れ

- 端末内翻訳は **ページ（上位フレーム）またはポップアップ** で実行します。Translator API は Worker では使えず、既定ではトップレベルのウィンドウと同一オリジンの iframe でのみ使えるためです（サービスワーカーでは実行しません）
- AI 翻訳はサービスワーカーが端末内に保存したキーを使って事業者の API を呼びます
- AI が失敗したときは端末内翻訳で表示し、**理由をカードに表示** します（黙って切り替えません）
- 長文は段落・文単位で分割して翻訳し、改行構造を保って結合します

## 開発

```bash
npm install
npm test               # ユニットテスト
npm run lint           # tsc --noEmit + ESLint
npm run zip:extension  # dist/quicklens-translator-v<version>.zip を作成
npm run mock           # http://localhost:3100 で拡張の画面をモック表示（chrome.* API と翻訳はダミー）
```

### リリース

`package.json` と `chrome-extension/manifest.json` の `version` を揃えて、`v<version>` のタグを push すると、GitHub Actions が lint・テスト・zip 作成を行い、Release に zip を添付します。

## 補足：Web シミュレーター

`src/` は、拡張機能の UI を Web ページ上で試せるシミュレーターと、ソースの閲覧・ZIP ダウンロード用の Web アプリです（拡張機能の動作には不要です）。

```bash
npm run dev      # http://localhost:3000
npm run build
npm run icons    # 拡張機能アイコンの再生成
```
