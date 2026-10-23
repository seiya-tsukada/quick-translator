import { BookOpen, Check, Copy, Lock, RefreshCw, Settings, Volume2 } from "lucide-react";
import { FEEDBACK_DURATION, STATUS_TEXT } from "../../config/app";
import { ENGINE_BADGE_CLASS_NAMES, ENGINE_BADGE_LABELS, ENGINE_CHIPS, LANGUAGES, TONES } from "../../config/translation";
import type { SimulatorState } from "../../hooks/useSimulator";
import { copyToClipboard, speakText } from "../../lib/browser";

export default function FocusLensPopup({ sim }: { sim: SimulatorState }) {
  const isResultUnavailable = !sim.popupResultText || sim.popupResultText === STATUS_TEXT.POPUP_TRANSLATING;

  return (
    <div className="lg:col-span-5 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></span>
          <h2 className="font-semibold text-sm text-slate-200">
            【新考案】Focus Lens ポップアップUI
          </h2>
        </div>
        <span className="text-[11px] text-slate-400">実機と同じ設計で動作</span>
      </div>

      {/* Simulated Focus Lens Popup Frame */}
      <div className="bg-slate-950 text-slate-100 rounded-2xl shadow-2xl border border-slate-800 p-4 w-full max-w-[410px] mx-auto overflow-hidden">
        {/* Top HUD Header */}
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-800 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
              ⚡
            </div>
            <span className="font-bold text-sm text-white">QuickLens</span>
          </div>

          <button
            onClick={() => sim.setVaultOpen(!sim.vaultOpen)}
            className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 border transition ${
              ENGINE_BADGE_CLASS_NAMES[sim.selectedEngine]
            }`}
          >
            <span>●</span>
            <span>{ENGINE_BADGE_LABELS[sim.selectedEngine]}</span>
            <Settings className="w-3 h-3 text-slate-400" />
          </button>
        </div>

        {/* Collapsible Key Vault Drawer */}
        {sim.vaultOpen && (
          <div className="bg-slate-900 border border-slate-700/80 rounded-xl p-3 mb-3 animate-in fade-in duration-150">
            <div className="flex items-center justify-between mb-1.5 text-xs font-bold text-purple-400">
              <span className="flex items-center gap-1">
                <Lock className="w-3.5 h-3.5" />
                <span>セキュア・暗号化金庫 (AES-GCM 256bit)</span>
              </span>
              <span className="text-[10px] text-slate-400 font-normal">端末内完結</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed mb-2.5">
              ユーザー登録不要。登録されたキーは端末内暗号化され、公式エンドポイントへ直接送信されます。
            </p>

            <div className="space-y-2 mb-2">
              <div>
                <label className="text-[11px] font-medium text-slate-300 block mb-1">
                  Google Gemini API Key:
                </label>
                <div className="flex gap-1.5">
                  <input
                    type="password"
                    value={sim.simulatedApiKey}
                    onChange={(e) => sim.setSimulatedApiKey(e.target.value)}
                    placeholder="AIzaSy... (空欄で削除)"
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-md px-2 py-1 text-xs text-white font-mono"
                  />
                  <button
                    onClick={sim.saveSimulatedKey}
                    className="px-2.5 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded text-xs font-semibold"
                  >
                    保存
                  </button>
                </div>
              </div>
            </div>

            {sim.savedKeyMessage && (
              <div className="text-[11px] text-emerald-400 mb-2 font-medium">{sim.savedKeyMessage}</div>
            )}

            <div className="grid grid-cols-3 gap-1 pt-2 border-t border-slate-800 text-[10.5px]">
              {ENGINE_CHIPS.map((chip) => (
                <button
                  key={chip.id}
                  onClick={() => sim.setSelectedEngine(chip.id)}
                  className={`p-1 rounded text-center font-medium border ${
                    sim.selectedEngine === chip.id ? chip.activeClassName : "bg-slate-950 border-slate-800 text-slate-400"
                  }`}
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Language Quick Ribbon */}
        <div className="flex items-center gap-1.5 mb-2.5">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => sim.setPopupTargetLang(lang.code)}
              className={`flex-1 py-1 px-1 rounded-lg text-xs font-semibold border transition ${
                sim.popupTargetLang === lang.code
                  ? "bg-cyan-600 border-cyan-400 text-white shadow-md shadow-cyan-600/30"
                  : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>

        {/* 4 Smart Tone Tabs */}
        <div className="grid grid-cols-4 gap-1 p-1 bg-slate-900 rounded-lg border border-slate-800 mb-2.5 text-xs font-semibold">
          {TONES.map((t) => (
            <button
              key={t.id}
              onClick={() => sim.setPopupTone(t.id)}
              className={`py-1 rounded text-[11px] transition ${
                sim.popupTone === t.id
                  ? "bg-slate-800 text-cyan-400 shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Context Deck (Input / Detected text) */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 mb-2.5">
          <div className="flex items-center justify-between text-[10.5px] font-semibold text-slate-400 mb-1">
            <span className="text-cyan-400 flex items-center gap-1">
              <span>⚡</span>
              <span>検出テキスト (クリックして編集可能)</span>
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => sim.setPopupInputText("")}
                className="hover:text-red-400 text-slate-500"
              >
                クリア
              </button>
              <span>{sim.popupInputText.length}文字</span>
            </div>
          </div>
          <textarea
            value={sim.popupInputText}
            onChange={(e) => sim.setPopupInputText(e.target.value)}
            className="w-full h-16 bg-transparent text-xs text-slate-200 resize-none outline-none font-sans leading-relaxed"
          />
        </div>

        {/* Trigger Action Bar */}
        <button
          onClick={sim.handlePopupTranslate}
          disabled={sim.isPopupTranslating || !sim.popupInputText.trim()}
          className="w-full py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 disabled:bg-slate-800 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-cyan-600/20 transition mb-3"
        >
          {sim.isPopupTranslating ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>{STATUS_TEXT.POPUP_TRANSLATING}</span>
            </>
          ) : (
            <>
              <BookOpen className="w-3.5 h-3.5" />
              <span>読み解く (Ctrl+Enter)</span>
            </>
          )}
        </button>

        {/* Primary Reading Canvas */}
        <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-cyan-900/40 rounded-xl p-3 min-h-[110px] relative">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800/80 mb-2">
            <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
              <span>✨</span>
              <span>理解インサイト</span>
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  copyToClipboard(sim.popupResultText);
                  sim.setHasPopupCopied(true);
                  setTimeout(() => sim.setHasPopupCopied(false), FEEDBACK_DURATION.RESULT_COPIED);
                }}
                disabled={isResultUnavailable}
                className="px-2 py-0.5 rounded text-[11px] border border-slate-700 bg-slate-850 hover:bg-slate-800 text-slate-300 flex items-center gap-1 transition"
              >
                {sim.hasPopupCopied ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400">完了</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>コピー</span>
                  </>
                )}
              </button>
              <button
                onClick={() => speakText(sim.popupResultText, sim.popupTargetLang)}
                disabled={isResultUnavailable}
                className="p-1 rounded text-slate-400 hover:text-white border border-slate-700 bg-slate-850 transition"
                title="発音を聞く"
              >
                <Volume2 className="w-3 h-3" />
              </button>
            </div>
          </div>
          <div className="text-xs text-slate-100 leading-relaxed font-sans whitespace-pre-wrap">
            {sim.popupResultText}
          </div>
        </div>
      </div>
    </div>
  );
}
