# QuickLens 翻訳 (Focus Lens Translator) - Manifest V3

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
  - `chrome.storage.sync`（クラウド同期）ではなく `chrome.storage.local` を使用。
  - Web Crypto APIの `AES-GCM 256bit` で端末内暗号化してからローカル保存。
  - クラウドや仲介サーバーを経由せず、ユーザーのブラウザから直接Google / OpenAI公式エンドポイントへ直接HTTPS送信。APIキーが第三者に漏洩するリスクをゼロにします。

### 3. GmailやGitHubなどの特殊環境への完全適応対策
- **Closed Shadow DOM 採用**:
  - GitHubのダークテーマCSSやGmailの強力なCSSリセットが拡張機能のトーストに干渉しないよう、完全に隔離されたShadow DOM内で描画。ページデザインも一切崩しません。
- **`all_frames: true` によるiframe対応**:
  - Gmailのメール本文フレームやエディタ内でも確実にスクリプトが稼働。
- **動的再注入フォールバック**:
  - GitHubのPJAX/Turbo遷移などでコンテンツスクリプトの接続が切断されても、`background.js` が自動検知して再注入＆再送するため、「動かない」トラブルを未然に防ぎます。

---

## 📦 ファイル構成
```text
chrome-extension/
├── manifest.json        # 拡張機能設定 (all_frames, host_permissions, MV3)
├── config.js            # 共通定義ファイル (設定初期値, API, タイミング等の定数)
├── background.js        # サービスワーカー (翻訳ルーティング, フレーム安全送信)
├── crypto-vault.js      # AES-GCM 256bit 暗号化・復号ユーティリティ
├── content.js           # ページ内Shadow DOMトースト描画＆多層テキスト抽出
├── popup.html           # Focus Lens HUD マークアップ
├── popup.js             # フォーカス・デッキ制御 & 金庫連携
├── options.html         # オプション設定画面
├── options.js           # オプション保存ロジック
└── icons/               # 16px, 48px, 128px アイコン画像
```

---

## 🛠️ インストール手順 (Chrome)
1. フォルダ `chrome-extension` をローカルPCに配置（または本アプリからZIPダウンロードして解凍）。
2. Chromeで `chrome://extensions/` を開く。
3. 右上の **「デベロッパーモード」** をONにする。
4. 左上の **「パッケージ化されていない拡張機能を読み込む」** を押し、`manifest.json` があるフォルダを選択。
