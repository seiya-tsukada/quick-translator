import { Globe, Layers, Lock, Mail, ShieldCheck } from "lucide-react";

const SECURITY_POINTS = [
  {
    icon: Lock,
    titleClassName: "text-purple-400",
    codeClassName: "text-purple-300",
    title: "1. 端末内暗号化 (Web Crypto AES-GCM 256bit)",
    body: (
      <>
        APIキーはクラウド（<code>chrome.storage.sync</code>）には一切保存されません。拡張機能のローカル隔離領域（<code>chrome.storage.local</code>）に、端末固有ソルトとPBKDF2で導出したAES-GCMキーで暗号化して保管されます。
      </>
    ),
    code: <>暗号化ペイロード: &#123; iv, ciphertext, updatedAt &#125;</>
  },
  {
    icon: Globe,
    titleClassName: "text-cyan-400",
    codeClassName: "text-cyan-300",
    title: "2. ゼロ・トラスト直接通信 (サーバー仲介なし)",
    body: (
      <>
        中継サーバーやプロキシを挟まず、ブラウザのバックグラウンド（Service Worker）からGoogle GeminiまたはOpenAIの公式エンドポイントへ直接HTTPS接続。第三者にキーや翻訳テキストが漏洩する懸念はありません。
      </>
    ),
    code: <>Browser &rarr; https://generativelanguage.googleapis.com</>
  },
  {
    icon: Layers,
    titleClassName: "text-emerald-400",
    codeClassName: "text-emerald-300",
    title: "3. Closed Shadow DOM によるCSS完全隔離",
    body: (
      <>
        GitHubのダークモードCSSやGmailのリセットスタイルが拡張機能のUIを破壊しないよう、<code>element.attachShadow(&#123; mode: 'closed' &#125;)</code> を使用。ページのスタイルに一切影響されず、ページ側へもスタイル汚染を起こしません。
      </>
    ),
    code: <>attachShadow(&#123; mode: "closed" &#125;)</>
  },
  {
    icon: Mail,
    titleClassName: "text-blue-400",
    codeClassName: "text-blue-300",
    title: "4. all_frames & 動的再注入フォールバック",
    body: (
      <>
        Gmailのメール本文iframeにもスクリプトが展開されるよう <code>all_frames: true</code> を指定。GitHubのPJAX遷移で接続が切れた場合も、Service Workerが自動で再注入（Scripting Fallback）を行ってからメッセージを再送します。
      </>
    ),
    code: <>chrome.scripting.executeScript() &rarr; Retry send</>
  }
];

export default function SecurityTab() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-cyan-400" />
          <span>ユーザーAPIキーのセキュア保管 ＆ Gmail・GitHub環境対策</span>
        </h2>
        <p className="text-sm text-slate-400 leading-relaxed">
          エンドユーザーが自身のAIキーを安心して利用できるよう、端末内暗号化とゼロ・トラスト通信を徹底。さらに、CSPやiframeの制約を受ける特殊なWeb環境でも確実に動く設計を採用しています。
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {SECURITY_POINTS.map(({ icon: Icon, titleClassName, codeClassName, title, body, code }) => (
          <div key={title} className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-3">
            <div className={`flex items-center gap-2 ${titleClassName} font-bold text-sm`}>
              <Icon className="w-4 h-4" />
              <span>{title}</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">{body}</p>
            <div className={`bg-slate-950 p-2.5 rounded text-[11px] font-mono ${codeClassName}`}>{code}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
