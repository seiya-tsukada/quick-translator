import { Layers, Lock, Zap } from "lucide-react";
import type { SimulatorState } from "../../hooks/useSimulator";
import FocusLensPopup from "../simulator/FocusLensPopup";
import PageSimulator from "../simulator/PageSimulator";

const HIGHLIGHTS = [
  {
    icon: Zap,
    iconClassName: "bg-cyan-500/10 text-cyan-400",
    title: "脱DeepLクローン: Focus Lens UI",
    body: <>2つの枠を並べる旧来型UIを刷新。言語リボン、4つのトーン切替（自然・ビジネス・要約・解説）、読解キャンバスを提供。</>
  },
  {
    icon: Lock,
    iconClassName: "bg-purple-500/10 text-purple-400",
    title: "登録不要＆端末内AES-GCM暗号化",
    body: <>デフォルトは完全無料・キー不要。GeminiやOpenAIのマイキーは端末内暗号化保存され、公式APIへ直接通信。</>
  },
  {
    icon: Layers,
    iconClassName: "bg-emerald-500/10 text-emerald-400",
    title: "Gmail・GitHub・SPA環境に完全耐性",
    body: (
      <>
        Closed Shadow DOMでCSSの衝突を根絶。<code>all_frames: true</code> と動的再注入でiframeやSPA遷移でも確実に稼働。
      </>
    )
  }
];

export default function SimulatorTab({ sim }: { sim: SimulatorState }) {
  return (
    <div className="space-y-6">
      {/* Architectural Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {HIGHLIGHTS.map(({ icon: Icon, iconClassName, title, body }) => (
          <div key={title} className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-start gap-3">
            <div className={`w-9 h-9 rounded-lg ${iconClassName} flex items-center justify-center shrink-0`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-white">{title}</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">{body}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Split Simulator Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <FocusLensPopup sim={sim} />
        <PageSimulator sim={sim} />
      </div>
    </div>
  );
}
