# quick-translator

Chrome 拡張機能「QuickLens 翻訳」(Manifest V3) と、その動作シミュレーター / ZIP ダウンロード用 Web アプリです。

## 構成

```text
chrome-extension/   拡張機能本体（そのまま Chrome に読み込み可能）
  config.js         拡張機能の定義ファイル（設定初期値・API・タイミング等）
src/
  config/           Web アプリの定義ファイル（言語・トーン・エンジン・文言・タイミング等）
  components/       画面コンポーネント
  hooks/            シミュレーターの状態管理
  lib/              翻訳・ZIP生成・ブラウザAPIのユーティリティ
  extensionFiles.ts chrome-extension/ のファイルをビルド時に取り込み、表示・ZIP化に使用
generate-icons.ts   拡張機能アイコンの生成スクリプト
```

Web アプリのコード表示・ZIP は `chrome-extension/` の実ファイルを `?raw` で読み込んでいるため、拡張機能を修正すればそのまま反映されます。

## 開発

**前提:** Node.js

```bash
npm install
npm run dev      # http://localhost:3000
npm run build
npm run lint     # 型チェック
npm run icons    # アイコン再生成
```
