import { Globe, Layers, Lock, Mail, ShieldCheck } from "lucide-react";

const SECURITY_POINTS = [
  {
    icon: Lock,
    titleClassName: "text-purple-400",
    codeClassName: "text-purple-300",
    title: "1. API キーは端末内にのみ保存",
    body: (
      <>
        API キーは同期される <code>chrome.storage.sync</code> ではなく、この端末の <code>chrome.storage.local</code> に保存されます。保存時に AES-GCM で暗号化しますが、鍵は同じ端末内の情報から作るため、難読化に近い仕組みです。キーは開発者のサーバーには送信されません（開発者はサーバーを運営していません）。
      </>
    ),
    code: <>暗号化ペイロード: &#123; iv, ciphertext, updatedAt &#125;</>
  },
  {
    icon: Globe,
    titleClassName: "text-cyan-400",
    codeClassName: "text-cyan-300",
    title: "2. 送信先はエンジンごとに明確",
    body: (
      <>
        標準の端末内翻訳ではテキストを外部へ送信しません。自分のキーを登録して OpenAI / DeepL を選んだ場合に限り、テキストがブラウザからその事業者の公式 API へ直接送信されます。
      </>
    ),
    code: <>Browser &rarr; https://api.openai.com</>
  },
  {
    icon: Layers,
    titleClassName: "text-emerald-400",
    codeClassName: "text-emerald-300",
    title: "3. Closed Shadow DOM による CSS の隔離",
    body: (
      <>
        ページの CSS が翻訳カードの表示に干渉しにくいよう、<code>element.attachShadow(&#123; mode: 'closed' &#125;)</code> の中に描画します。拡張機能側のスタイルもページへ漏れません。
      </>
    ),
    code: <>attachShadow(&#123; mode: "closed" &#125;)</>
  },
  {
    icon: Mail,
    titleClassName: "text-blue-400",
    codeClassName: "text-blue-300",
    title: "4. 必要なときだけ注入（activeTab）",
    body: (
      <>
        全サイトへの常時注入はせず、右クリック・ショートカット・ポップアップの操作時だけ <code>activeTab</code> と <code>scripting</code> で上位フレームに注入します。SPA 遷移後も操作のたびに注入状態を確認します。
      </>
    ),
    code: <>activeTab &rarr; chrome.scripting.executeScript()</>
  }
];

export default function SecurityTab() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-cyan-400" />
          <span>プライバシーと権限の考え方</span>
        </h2>
        <p className="text-sm text-slate-400 leading-relaxed">
          開発者はサーバーを運営せず、ユーザーのデータを収集しません。権限は必要な操作のときだけ使い、AI 事業者への接続はキーを登録したときにだけ許可を求めます。
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
