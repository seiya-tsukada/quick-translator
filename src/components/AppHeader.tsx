import { CheckCircle2, FileCode, FolderArchive, HelpCircle, RefreshCw, ShieldCheck, Sparkles, Zap } from "lucide-react";
import type { TabId } from "../config/app";
import { EXTENSION_FILES } from "../extensionFiles";

const TABS: ReadonlyArray<{ id: TabId; icon: typeof Zap; label: string }> = [
  { id: "simulator", icon: Sparkles, label: "Focus Lens 実機シミュレーター" },
  { id: "security", icon: ShieldCheck, label: "AIキー暗号化 & 特殊環境対策の仕組み" },
  { id: "code", icon: FileCode, label: `全ソースコード (${EXTENSION_FILES.length}ファイル)` },
  { id: "guide", icon: HelpCircle, label: "Chrome導入手順" }
];

interface AppHeaderProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  isZipping: boolean;
  zipSuccess: boolean;
  onDownloadZip: () => void;
}

export default function AppHeader({ activeTab, onTabChange, isZipping, zipSuccess, onDownloadZip }: AppHeaderProps) {
  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/25">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-base sm:text-lg text-white">QuickLens 翻訳</h1>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-400 font-semibold border border-cyan-500/30">
                Focus Lens UI
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-400 font-medium border border-purple-500/30 hidden sm:inline-flex">
                AES-GCM 暗号化金庫
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-medium border border-emerald-500/30 hidden md:inline-flex">
                Gmail・GitHub完全対応
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              既存翻訳アプリの枠を超えた「フォーカス・レンズ読解UI」とセキュアなAIキー保管
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onDownloadZip}
            disabled={isZipping}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-xs sm:text-sm shadow-md transition-all ${
              zipSuccess
                ? "bg-emerald-600 text-white"
                : "bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white shadow-cyan-600/25 active:scale-95"
            }`}
          >
            {isZipping ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>ZIP生成中...</span>
              </>
            ) : zipSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>ダウンロード完了！</span>
              </>
            ) : (
              <>
                <FolderArchive className="w-4 h-4" />
                <span>拡張機能をZIP保存</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Sub Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-6 border-t border-slate-800/60 text-sm">
        {TABS.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            className={`py-3 flex items-center gap-2 font-medium border-b-2 transition-colors ${
              activeTab === id
                ? "border-cyan-400 text-cyan-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Icon className="w-4 h-4" />
            <span>{label}</span>
          </button>
        ))}
      </div>
    </header>
  );
}
