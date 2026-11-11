# Chrome Web Store 掲載情報（下書き）/ Store listing draft

> 申請前に、実際の動作・権限・寄付リンクと一致しているか確認してください。

## 名前 / Name

- ja: QuickLens 翻訳
- en: QuickLens Translator

## 短い説明（132 文字以内）/ Summary (≤132 chars)

`_locales/*/messages.json` の `extDescription` と同じです。

- ja: 選択テキストを右クリック・ショートカット・ポップアップで翻訳。標準は端末内で翻訳し、自分の Gemini / OpenAI / DeepL キーも使えます。
- en: Translate selected text via right-click, shortcut or popup. On-device by default, or use your own Gemini/OpenAI/DeepL key.

## 詳しい説明 / Description

### 日本語

Web ページで選んだテキストを、その場で翻訳する拡張機能です。

使い方は 3 つあります。
- 右クリック：テキストを選んで「QuickLens で翻訳」
- ショートカット：テキストを選んで Alt+T（chrome://extensions/shortcuts で変更できます）
- ポップアップ：ツールバーのアイコンから。選択中のテキストが自動で入ります

翻訳エンジン
- 端末内翻訳（標準）：Chrome に組み込まれた翻訳機能を使います。無料・キー不要で、テキストは端末の外に出ません。デスクトップ版 Chrome 138 以降が必要で、言語の組み合わせごとに初回だけモデルをダウンロードします。
- 自分のキーで AI 翻訳（任意）：Google Gemini、OpenAI、DeepL の API キーを登録すると、ビジネス敬語・要約・解説つきなどのトーンを使えます。テキストはその事業者に直接送信されます。

その他
- 翻訳カードは選択範囲の近く、または右下に表示（設定で切り替え）
- ライト / ダーク / システムに合わせるテーマ
- キーボードだけで操作可能（Esc で閉じる）
- 日本語・英語の UI

プライバシー
- 開発者はサーバーを運営しておらず、データを収集しません。
- API キーはこの端末にのみ保存され、開発者には送信されません。

すべての機能を無料で使えます。

### English

Translate text you select on any web page, right where you are reading.

Three ways to use it:
- Right-click: select text and choose "Translate with QuickLens"
- Shortcut: select text and press Alt+T (change it at chrome://extensions/shortcuts)
- Popup: click the toolbar icon; the selected text is filled in automatically

Engines
- On-device (default): uses Chrome's built-in translation. Free, no key, and the text stays on your device. Requires desktop Chrome 138 or later; the model for each language pair is downloaded once.
- AI with your own key (optional): register a Google Gemini, OpenAI or DeepL API key to use tones such as Formal, Summary or With notes. The text is then sent directly to that provider.

Also
- Translation card near the selection or in the bottom-right corner
- Light / dark / system theme
- Fully usable from the keyboard (Esc to close)
- English and Japanese UI

Privacy
- The developer runs no server and collects no data.
- API keys are stored only on this device and never sent to the developer.

Every feature is free for everyone.

## 単一用途の説明 / Single purpose

- ja: Web ページで選択したテキスト、またはポップアップに入力したテキストを翻訳して表示すること。
- en: Translating text that the user selects on a web page or types into the popup, and showing the result.

## 権限ごとの使用理由 / Permission justifications

| 権限 / Permission | 理由（ja） | Justification (en) |
| --- | --- | --- |
| `activeTab` | 利用者が右クリックメニュー・ショートカット・ポップアップを操作したときだけ、そのタブの選択テキストを読み取り、翻訳カードを表示するため。全サイトへの常時アクセスは求めません。 | To read the selected text and show the translation card in the current tab only after the user invokes the context menu, the shortcut or the popup. No always-on access to sites. |
| `scripting` | `activeTab` で許可されたタブに、翻訳カードのスクリプトを必要なときだけ注入するため。 | To inject the translation-card script into the tab granted by `activeTab`, only when needed. |
| `contextMenus` | 選択テキストの右クリックメニューに「QuickLens で翻訳」を追加するため。 | To add "Translate with QuickLens" to the context menu for selected text. |
| `storage` | 設定（同期）、利用者の API キー（端末内のみ）、応援メッセージ表示判定用の翻訳回数（端末内のみ）を保存するため。 | To store settings (synced), the user's API keys (local only) and a local translation counter used only for the support message. |
| 任意のホスト権限 / Optional host permissions: `generativelanguage.googleapis.com`, `api.openai.com`, `api-free.deepl.com`, `api.deepl.com` | 利用者が自分の API キーを保存したときにだけ許可を求め、その事業者の公式 API に翻訳を依頼するため。キー削除時に解除します。 | Requested only when the user saves their own API key, to call that provider's official API. Removed when the key is deleted. |

リモートコード / Remote code: 使用しません。すべてのスクリプトはパッケージに含まれます。 / None. All scripts are bundled in the package.

## データ利用の申告（下書き）/ Data usage disclosure (draft)

Chrome Web Store の「プライバシーへの取り組み」タブで申告する内容の案です。

- 収集するデータ / Data collected:
  - 「ウェブサイトのコンテンツ」(Website content): 利用者が選択したテキストを扱います。端末内翻訳では端末の外に出ません。利用者が AI エンジン（自分のキー）を選んだ場合に限り、翻訳のためにその事業者へ送信されます。開発者は受け取りません。
  - 「認証情報」(Authentication information): 利用者が任意で登録する API キーを端末内に保存します。対応する事業者への認証にのみ使い、開発者は受け取りません。
- 開発者による収集 / Collected by the developer: なし / None.
- 以下を宣誓 / Certify:
  - 承認されている用途以外で、ユーザーデータを第三者に販売、転送しない（利用者が選んだ AI 事業者への送信は、利用者が要求した単一用途の機能のため）
  - 単一用途と関係のない目的で、ユーザーデータを使用、転送しない
  - 信用力の判断や融資目的で、ユーザーデータを使用、転送しない

プライバシーポリシーの URL / Privacy policy URL: `docs/privacy-policy.md` を公開した URL（例：GitHub Pages またはリポジトリの該当ファイル）

## 申請前のチェックリスト

- [ ] `chrome-extension/config.js` の `DONATION_URL` を設定した（空のままなら寄付リンクは表示されません）
- [ ] スクリーンショット（1280×800 または 640×400）を用意した：右クリック翻訳、ポップアップ、設定画面、ダークテーマ
- [ ] プロモーション用タイル（440×280）を用意した
- [ ] プライバシーポリシーを公開し、URL を登録した
- [ ] `npm run zip:extension` で作った zip をアップロードした
