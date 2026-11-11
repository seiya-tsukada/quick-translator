# QuickLens 翻訳 プライバシーポリシー / Privacy Policy

最終更新日 / Last updated: 2026-11-11

- [日本語](#日本語)
- [English](#english)

---

## 日本語

### 1. 基本方針

QuickLens 翻訳（以下「本拡張機能」）の開発者は、サーバーを運営していません。
本拡張機能は、利用者のデータを開発者に送信したり、収集・分析したりしません。
アクセス解析や広告のための仕組みも含みません。

### 2. 選択テキストの送信先

翻訳するテキスト（ページで選択したテキスト、またはポップアップに入力したテキスト）の扱いは、利用者が選んだエンジンによって決まります。

| エンジン | テキストの送信先 | 条件 |
| --- | --- | --- |
| 端末内翻訳（Chrome 組み込みの Translator API / Language Detector API） | 送信しません。この端末の Chrome の中で処理されます | 標準の設定 |
| OpenAI | OpenAI（`api.openai.com`） | 利用者が自分の API キーを登録し、OpenAI を選んだ場合のみ |
| DeepL | DeepL（`api-free.deepl.com` または `api.deepl.com`） | 利用者が自分の API キーを登録し、DeepL を選んだ場合のみ |

AI エンジンを選んだ場合、テキストは利用者のブラウザからその事業者へ直接送信され、利用者の API キーで認証されます。送信後のデータは各事業者のポリシーに従って扱われます。

- OpenAI プライバシーポリシー: https://openai.com/policies/privacy-policy/
- DeepL プライバシーポリシー: https://www.deepl.com/privacy

AI エンジンが失敗した場合、本拡張機能は端末内翻訳で結果を表示することがあります。その際は、失敗した理由とともに画面に表示します。

### 3. 端末内に保存するもの

| データ | 保存場所 | 内容 |
| --- | --- | --- |
| 設定 | `chrome.storage.sync` | 翻訳先・翻訳元の言語、エンジン、トーン、表示位置、テーマ、表示時間など。Chrome の同期を有効にしている場合、利用者の Google アカウントを通じて利用者の他の端末に同期されます |
| API キー | `chrome.storage.local`（この端末のみ） | 利用者が登録したキー。AES-GCM で暗号化して保存しますが、鍵は同じ端末内の情報から作るため、難読化に近い仕組みです。キーは対応する事業者への通信にのみ使われ、開発者には送信されません |
| 翻訳回数 | `chrome.storage.local`（この端末のみ） | 応援メッセージを表示するかどうかの判定にだけ使う回数と、メッセージを閉じた日時 |

翻訳したテキストや翻訳結果は保存しません。

### 4. 権限

- `activeTab` / `scripting`: 右クリック・ショートカット・ポップアップの操作をしたときだけ、そのタブに翻訳カードを表示し、選択テキストを読み取るために使います。
- `contextMenus`: 右クリックメニューに「QuickLens で翻訳」を追加します。
- `storage`: 上記の設定・キー・回数を保存します。
- 任意のホスト権限（OpenAI / DeepL のドメイン）: 利用者がその事業者の API キーを保存したときにだけ許可を求めます。キーを削除すると許可も解除します。

### 5. データの削除

拡張機能を削除すると、端末内に保存されたデータは Chrome によって削除されます。API キーは設定画面の「削除」でいつでも削除できます。

### 6. お問い合わせ

GitHub リポジトリの Issues からご連絡ください。

---

## English

### 1. Summary

The developer of QuickLens Translator ("the extension") does not run any server.
The extension does not send your data to the developer, and does not collect or analyse it.
It contains no analytics or advertising code.

### 2. Where selected text is sent

What happens to the text you translate (text selected on a page, or typed in the popup) depends on the engine you choose.

| Engine | Where the text goes | When |
| --- | --- | --- |
| On-device (Chrome's built-in Translator API / Language Detector API) | Nowhere. It is processed inside Chrome on your device | Default |
| OpenAI | OpenAI (`api.openai.com`) | Only if you register your own API key and choose OpenAI |
| DeepL | DeepL (`api-free.deepl.com` or `api.deepl.com`) | Only if you register your own API key and choose DeepL |

With an AI engine, the text is sent directly from your browser to that provider and authenticated with your own key. The provider then handles it under its own policy:

- OpenAI Privacy Policy: https://openai.com/policies/privacy-policy/
- DeepL Privacy Policy: https://www.deepl.com/privacy

If an AI engine fails, the extension may show an on-device translation instead. When it does, it says so on screen together with the reason.

### 3. What is stored on your device

| Data | Where | Details |
| --- | --- | --- |
| Settings | `chrome.storage.sync` | Target/source language, engine, tone, card position, theme, display time, etc. If Chrome sync is on, Chrome syncs them to your other devices through your Google account |
| API keys | `chrome.storage.local` (this device only) | Keys you register. They are encrypted with AES-GCM, but the encryption key is derived from data on the same device, so this is closer to obfuscation. Keys are used only to call the matching provider and are never sent to the developer |
| Translation count | `chrome.storage.local` (this device only) | A counter used only to decide whether to show the support message, and when you dismissed it |

Translated text and results are not stored.

### 4. Permissions

- `activeTab` / `scripting`: used only when you use the right-click menu, the shortcut or the popup, to show the translation card in that tab and read the selected text.
- `contextMenus`: adds "Translate with QuickLens" to the right-click menu.
- `storage`: stores the settings, keys and counter described above.
- Optional host permissions (OpenAI / DeepL domains): requested only when you save a key for that provider, and removed when you delete the key.

### 5. Deleting data

Removing the extension makes Chrome delete the data stored on your device. You can delete API keys at any time with "Remove" on the settings page.

### 6. Contact

Please open an issue in the GitHub repository.
