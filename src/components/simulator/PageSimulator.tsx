import { Copy, Github, Mail, MousePointerClick, RefreshCw, Volume2, Zap } from "lucide-react";
import { FEEDBACK_DURATION } from "../../config/app";
import { CONTEXT_MENU, PAGE_ENVS, type PageEnv } from "../../config/simulator";
import { ENGINE_BADGE_LABELS } from "../../config/translation";
import type { SimulatorState } from "../../hooks/useSimulator";
import { copyToClipboard, speakText } from "../../lib/browser";

const PAGE_ENV_ICONS: Record<PageEnv, typeof Github> = {
  github: Github,
  gmail: Mail
};

export default function PageSimulator({ sim }: { sim: SimulatorState }) {
  return (
    <div className="lg:col-span-7 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <h2 className="font-semibold text-sm text-slate-200">
            【特殊環境テスト】Gmail ＆ GitHub 実証シミュレーター
          </h2>
        </div>
        <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-xs">
          {(Object.keys(PAGE_ENVS) as PageEnv[]).map((env) => {
            const Icon = PAGE_ENV_ICONS[env];
            return (
              <button
                key={env}
                onClick={() => sim.switchPageEnv(env)}
                className={`px-2.5 py-1 rounded flex items-center gap-1.5 transition ${
                  sim.simulatedPageEnv === env ? "bg-slate-800 text-white font-semibold" : "text-slate-400"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{PAGE_ENVS[env].label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Simulated Web Page Frame */}
      <div className="bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl relative">
        {/* Browser Window Chrome Top Bar */}
        <div className="bg-slate-800/90 px-4 py-2.5 border-b border-slate-700 flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-rose-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
          </div>
          <div className="flex-1 bg-slate-950/60 rounded-md px-3 py-1 text-xs text-slate-400 border border-slate-800 flex items-center gap-2">
            <span className="text-slate-600">https://</span>
            <span className="text-slate-300 font-mono">{PAGE_ENVS[sim.simulatedPageEnv].url}</span>
          </div>
          <button
            onClick={sim.handleSimulateContextMenuTranslate}
            className="text-[11px] bg-cyan-600/20 text-cyan-400 hover:bg-cyan-600/30 border border-cyan-500/40 px-2.5 py-1 rounded-md font-medium transition flex items-center gap-1"
          >
            <MousePointerClick className="w-3 h-3" />
            <span>右クリック翻訳</span>
          </button>
        </div>

        {/* Web Page Article Body */}
        <div
          ref={sim.articleRef}
          onMouseUp={sim.handleArticleMouseUp}
          className="p-6 bg-slate-950 text-slate-300 min-h-[420px] relative select-text"
        >
          {sim.simulatedPageEnv === "github" ? (
            <GithubPage selectedWebText={sim.selectedWebText} />
          ) : (
            <GmailPage selectedWebText={sim.selectedWebText} />
          )}

          {/* Simulated Context Menu Popup */}
          {sim.showContextMenu && (
            <div
              style={{ top: `${sim.contextMenuPos.y}px`, left: `${sim.contextMenuPos.x}px` }}
              className="absolute z-30 bg-slate-800 text-white rounded-lg shadow-2xl border border-slate-600 py-1.5 w-64 animate-in fade-in zoom-in-95 duration-150"
            >
              <div className="px-3 py-1 text-[11px] text-slate-400 border-b border-slate-700 font-mono truncate">
                選択: "{sim.selectedWebText.slice(0, CONTEXT_MENU.PREVIEW_LENGTH)}..."
              </div>
              <button
                onClick={sim.handleSimulateContextMenuTranslate}
                className="w-full text-left px-3 py-2 text-xs hover:bg-cyan-600 text-white flex items-center gap-2 font-medium transition"
              >
                <Zap className="w-3.5 h-3.5 text-cyan-400" />
                <span>QuickLens で読み解く</span>
              </button>
            </div>
          )}

          {/* In-page Toast HUD (Simulating Closed Shadow DOM) */}
          {sim.showHud && <TranslationHud sim={sim} />}
        </div>
      </div>
    </div>
  );
}

/* GitHub Environment View (Dark Mode & Code formatting) */
function GithubPage({ selectedWebText }: { selectedWebText: string }) {
  return (
    <div className="max-w-xl mx-auto space-y-4">
      <div className="flex items-center gap-2">
        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/40">
          Merged #1428
        </span>
        <span className="text-xs text-slate-400">by core-maintainer 2 hours ago</span>
      </div>
      <h2 className="text-lg font-bold text-white">
        Fix(runtime): isolate Shadow DOM container for third-party extensions
      </h2>
      <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono text-cyan-300">
        {selectedWebText}
      </div>
      <p className="text-xs text-slate-400 leading-relaxed">
        💡 <strong>GitHub環境での耐性検証:</strong> GitHubはグローバルにダークテーマCSSや厳格なリセットスタイルを適用していますが、QuickLensは <strong>Closed Shadow DOM</strong> を採用しているため、トーストのスタイルが絶対に崩れません。
      </p>
    </div>
  );
}

/* Gmail Environment View (Nested iframe simulation) */
function GmailPage({ selectedWebText }: { selectedWebText: string }) {
  return (
    <div className="max-w-xl mx-auto space-y-4">
      <div className="border border-slate-800 rounded-xl p-4 bg-slate-900/50">
        <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-2 mb-2">
          <span className="font-semibold text-white">From: Alex Johnson &lt;alex@partner-corp.com&gt;</span>
          <span>Yesterday, 14:32</span>
        </div>
        <div className="text-xs text-slate-300 space-y-2">
          <p className="font-semibold text-white">Subject: Urgent Q3 Sync & Architecture Review</p>
          <div className="p-2.5 rounded bg-slate-950 border border-slate-800 text-cyan-200">
            {selectedWebText}
          </div>
          <p className="text-[11px] text-slate-400">
            💡 <strong>Gmail環境での耐性検証:</strong> Gmailのメール本文は動的iframeやcontenteditable内に描画されます。QuickLensは <code>all_frames: true</code> と多層テキスト抽出により、入れ子になったiframe内からも確実にテキストを読み取ります。
          </p>
        </div>
      </div>
    </div>
  );
}

function TranslationHud({ sim }: { sim: SimulatorState }) {
  const { hudData } = sim;

  return (
    <div className="absolute bottom-4 right-4 z-40 w-80 bg-slate-900 text-white rounded-xl shadow-2xl border border-slate-700 overflow-hidden animate-in slide-in-from-bottom-4 duration-200">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-slate-850 border-b border-slate-700">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold text-cyan-400">⚡ QuickLens</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
            {ENGINE_BADGE_LABELS[sim.selectedEngine]}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              copyToClipboard(hudData.translated);
              sim.setHasHudCopied(true);
              setTimeout(() => sim.setHasHudCopied(false), FEEDBACK_DURATION.RESULT_COPIED);
            }}
            className="px-2 py-0.5 text-[11px] rounded hover:bg-slate-700 text-slate-300 transition flex items-center gap-1"
          >
            {sim.hasHudCopied ? <span className="text-emerald-400 font-bold">✓</span> : <Copy className="w-3 h-3" />}
            <span>コピー</span>
          </button>
          <button
            onClick={() => speakText(hudData.translated, sim.popupTargetLang)}
            className="p-1 text-slate-400 hover:text-white rounded"
          >
            <Volume2 className="w-3 h-3" />
          </button>
          <button
            onClick={() => sim.setShowHud(false)}
            className="p-1 text-slate-400 hover:text-red-400 rounded"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="p-3 max-h-56 overflow-y-auto">
        {sim.hudStatus === "loading" ? (
          <div className="flex items-center gap-2 text-xs text-slate-400 py-3">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
            <span>解析しています...</span>
          </div>
        ) : (
          <>
            <div className="text-[11px] text-slate-400 mb-1.5 pl-2 border-l-2 border-cyan-500 line-clamp-2">
              原文: {hudData.original}
            </div>
            <div className="text-xs text-slate-100 font-medium leading-relaxed whitespace-pre-wrap">
              {hudData.translated}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
