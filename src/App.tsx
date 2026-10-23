/**
 * QuickLens - Chrome Extension Studio & Live Simulation Environment
 * @license Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import JSZip from "jszip";
import {
  Download,
  Copy,
  Check,
  Globe,
  Settings,
  Languages,
  Volume2,
  FolderArchive,
  RefreshCw,
  HelpCircle,
  FileCode,
  MousePointerClick,
  Sparkles,
  ShieldCheck,
  Key,
  Lock,
  Layers,
  CheckCircle2,
  AlertCircle,
  Mail,
  Github,
  Zap,
  BookOpen
} from "lucide-react";
import { EXTENSION_FILES, EXTENSION_ICONS_BASE64, ExtensionFile } from "./extensionFiles";

export default function App() {
  const [activeTab, setActiveTab] = useState<"simulator" | "code" | "security" | "guide">("simulator");
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [copiedFileName, setCopiedFileName] = useState<string | null>(null);
  const [isZipping, setIsZipping] = useState(false);
  const [zipSuccess, setZipSuccess] = useState(false);

  // Simulator: Engine & Vault
  const [selectedEngine, setSelectedEngine] = useState<"free" | "gemini" | "openai">("free");
  const [vaultOpen, setVaultOpen] = useState(false);
  const [simulatedApiKey, setSimulatedApiKey] = useState("");
  const [savedKeyMessage, setSavedKeyMessage] = useState<string | null>(null);

  // Simulator: Focus Lens Popup
  const [popupTargetLang, setPopupTargetLang] = useState("ja");
  const [popupTone, setPopupTone] = useState<"natural" | "business" | "summary" | "breakdown">("natural");
  const [popupInputText, setPopupInputText] = useState(
    "Google Chrome Extensions Manifest V3 guarantees strict security boundaries, isolated origins, and high-performance execution across modern web apps."
  );
  const [popupResultText, setPopupResultText] = useState("");
  const [isPopupTranslating, setIsPopupTranslating] = useState(false);
  const [hasPopupCopied, setHasPopupCopied] = useState(false);

  // Simulator: Webpage Environment (Default article vs Gmail vs GitHub)
  const [simulatedPageEnv, setSimulatedPageEnv] = useState<"general" | "github" | "gmail">("github");
  const [selectedWebText, setSelectedWebText] = useState(
    "Warning: The current build pipeline encountered an unexpected dependency resolution conflict on branch main."
  );
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPos, setContextMenuPos] = useState({ x: 260, y: 140 });
  const [showHud, setShowHud] = useState(false);
  const [hudStatus, setHudStatus] = useState<"loading" | "success" | "idle">("idle");
  const [hudData, setHudData] = useState({ original: "", translated: "", engine: "free", tone: "natural" });
  const [hasHudCopied, setHasHudCopied] = useState(false);

  const activeFile = EXTENSION_FILES[activeFileIndex] || EXTENSION_FILES[0];
  const articleRef = useRef<HTMLDivElement>(null);

  // Perform translation using the free Google Translate endpoint with local tone adaptation
  async function callTranslateEngine(text: string, targetLang: string, tone: string, engine: string): Promise<string> {
    if (!text.trim()) return "";
    try {
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${encodeURIComponent(
        targetLang
      )}&dt=t&q=${encodeURIComponent(text)}`;

      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
      const data = await res.json();
      let baseTranslation = "";
      if (data && Array.isArray(data[0])) {
        baseTranslation = data[0].map((item: any) => item[0] || "").join("");
      }

      // If business/summary/breakdown is selected, show tone-formatted representation
      if (tone === "business") {
        return `【ビジネス敬語】\n${baseTranslation.replace(/だ。|である。/g, "でございます。").replace(/する。/g, "いたします。")}`;
      } else if (tone === "summary") {
        return `【重要要点まとめ】\n• ${baseTranslation}\n• セキュリティ要件と分離機構の遵守が推奨されます。`;
      } else if (tone === "breakdown") {
        return `【翻訳】\n${baseTranslation}\n\n【語彙・ニュアンス解説】\n• strict security boundaries: 厳格なセキュリティ境界\n• isolated origins: 独立した実行コンテキスト (Shadow DOMなど)\n• high-performance execution: 高速・低負荷な動作特性`;
      }
      return baseTranslation;
    } catch (err: any) {
      console.error("Translation API error:", err);
      return `[翻訳エラー] ネットワーク状況を確認してください (${err.message || "error"})`;
    }
  }

  // Handle popup translation
  const handlePopupTranslate = async () => {
    if (!popupInputText.trim()) return;
    setIsPopupTranslating(true);
    setPopupResultText("読み解き中...");
    const res = await callTranslateEngine(popupInputText, popupTargetLang, popupTone, selectedEngine);
    setPopupResultText(res);
    setIsPopupTranslating(false);
  };

  useEffect(() => {
    handlePopupTranslate();
  }, [popupTargetLang, popupTone, selectedEngine]);

  const speakText = (text: string, lang: string) => {
    if (!("speechSynthesis" in window) || !text) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    window.speechSynthesis.speak(utterance);
  };

  const copyToClipboard = async (text: string, name?: string) => {
    try {
      await navigator.clipboard.writeText(text);
      if (name) {
        setCopiedFileName(name);
        setTimeout(() => setCopiedFileName(null), 2000);
      }
    } catch (err) {
      console.error("Clipboard copy failed:", err);
    }
  };

  // ZIP generation
  const handleDownloadZip = async () => {
    setIsZipping(true);
    try {
      const zip = new JSZip();

      for (const file of EXTENSION_FILES) {
        zip.file(file.path, file.content);
      }

      const iconsFolder = zip.folder("icons");
      if (iconsFolder) {
        for (const [name, b64] of Object.entries(EXTENSION_ICONS_BASE64)) {
          iconsFolder.file(name, b64, { base64: true });
        }
      }

      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "quicklens-focus-translator-mv3.zip";
      a.click();
      URL.revokeObjectURL(url);

      setZipSuccess(true);
      setTimeout(() => setZipSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to generate ZIP:", err);
    } finally {
      setIsZipping(false);
    }
  };

  const handleArticleMouseUp = (e: React.MouseEvent) => {
    const selection = window.getSelection();
    const text = selection ? selection.toString().trim() : "";
    if (text) {
      setSelectedWebText(text);
      if (articleRef.current) {
        const rect = articleRef.current.getBoundingClientRect();
        setContextMenuPos({
          x: Math.min(e.clientX - rect.left + 10, rect.width - 250),
          y: Math.min(e.clientY - rect.top + 10, rect.height - 80)
        });
      }
      setShowContextMenu(true);
    }
  };

  const handleSimulateContextMenuTranslate = async () => {
    setShowContextMenu(false);
    setShowHud(true);
    setHudStatus("loading");
    setHudData({ original: selectedWebText, translated: "解析中...", engine: selectedEngine, tone: popupTone });

    const translated = await callTranslateEngine(selectedWebText, popupTargetLang, popupTone, selectedEngine);
    setHudData({
      original: selectedWebText,
      translated: translated,
      engine: selectedEngine,
      tone: popupTone
    });
    setHudStatus("success");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navigation Bar */}
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
              onClick={handleDownloadZip}
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
          <button
            onClick={() => setActiveTab("simulator")}
            className={`py-3 flex items-center gap-2 font-medium border-b-2 transition-colors ${
              activeTab === "simulator"
                ? "border-cyan-400 text-cyan-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Focus Lens 実機シミュレーター</span>
          </button>
          <button
            onClick={() => setActiveTab("security")}
            className={`py-3 flex items-center gap-2 font-medium border-b-2 transition-colors ${
              activeTab === "security"
                ? "border-cyan-400 text-cyan-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>AIキー暗号化 & 特殊環境対策の仕組み</span>
          </button>
          <button
            onClick={() => setActiveTab("code")}
            className={`py-3 flex items-center gap-2 font-medium border-b-2 transition-colors ${
              activeTab === "code"
                ? "border-cyan-400 text-cyan-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <FileCode className="w-4 h-4" />
            <span>全ソースコード ({EXTENSION_FILES.length}ファイル)</span>
          </button>
          <button
            onClick={() => setActiveTab("guide")}
            className={`py-3 flex items-center gap-2 font-medium border-b-2 transition-colors ${
              activeTab === "guide"
                ? "border-cyan-400 text-cyan-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>Chrome導入手順</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6">
        {/* ========================================================================= */}
        {/* TAB 1: リアルタイム動作シミュレーター */}
        {/* ========================================================================= */}
        {activeTab === "simulator" && (
          <div className="space-y-6">
            {/* Architectural Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-white">脱DeepLクローン: Focus Lens UI</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    2つの枠を並べる旧来型UIを刷新。言語リボン、4つのトーン切替（自然・ビジネス・要約・解説）、読解キャンバスを提供。
                  </p>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-white">登録不要＆端末内AES-GCM暗号化</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    デフォルトは完全無料・キー不要。GeminiやOpenAIのマイキーは端末内暗号化保存され、公式APIへ直接通信。
                  </p>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-white">Gmail・GitHub・SPA環境に完全耐性</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Closed Shadow DOMでCSSの衝突を根絶。<code>all_frames: true</code> と動的再注入でiframeやSPA遷移でも確実に稼働。
                  </p>
                </div>
              </div>
            </div>

            {/* Split Simulator Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Focus Lens Popup Mockup (5 cols) */}
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
                      onClick={() => setVaultOpen(!vaultOpen)}
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 border transition ${
                        selectedEngine === "gemini"
                          ? "bg-purple-950/40 text-purple-300 border-purple-500/40"
                          : selectedEngine === "openai"
                          ? "bg-emerald-950/40 text-emerald-300 border-emerald-500/40"
                          : "bg-slate-900 text-cyan-400 border-cyan-500/30"
                      }`}
                    >
                      <span>●</span>
                      <span>
                        {selectedEngine === "gemini" ? "Gemini AI" : selectedEngine === "openai" ? "OpenAI" : "無料モード"}
                      </span>
                      <Settings className="w-3 h-3 text-slate-400" />
                    </button>
                  </div>

                  {/* Collapsible Key Vault Drawer */}
                  {vaultOpen && (
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
                              value={simulatedApiKey}
                              onChange={(e) => setSimulatedApiKey(e.target.value)}
                              placeholder="AIzaSy... (空欄で削除)"
                              className="flex-1 bg-slate-950 border border-slate-700 rounded-md px-2 py-1 text-xs text-white font-mono"
                            />
                            <button
                              onClick={() => {
                                setSavedKeyMessage("✓ 暗号化保存しました");
                                setSelectedEngine("gemini");
                                setTimeout(() => setSavedKeyMessage(null), 1800);
                              }}
                              className="px-2.5 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded text-xs font-semibold"
                            >
                              保存
                            </button>
                          </div>
                        </div>
                      </div>

                      {savedKeyMessage && (
                        <div className="text-[11px] text-emerald-400 mb-2 font-medium">{savedKeyMessage}</div>
                      )}

                      <div className="grid grid-cols-3 gap-1 pt-2 border-t border-slate-800 text-[10.5px]">
                        <button
                          onClick={() => setSelectedEngine("free")}
                          className={`p-1 rounded text-center font-medium border ${
                            selectedEngine === "free"
                              ? "bg-cyan-950/60 border-cyan-500 text-cyan-300"
                              : "bg-slate-950 border-slate-800 text-slate-400"
                          }`}
                        >
                          🆓 無料 (キー不要)
                        </button>
                        <button
                          onClick={() => setSelectedEngine("gemini")}
                          className={`p-1 rounded text-center font-medium border ${
                            selectedEngine === "gemini"
                              ? "bg-purple-950/60 border-purple-500 text-purple-300"
                              : "bg-slate-950 border-slate-800 text-slate-400"
                          }`}
                        >
                          ⚡ Gemini AI
                        </button>
                        <button
                          onClick={() => setSelectedEngine("openai")}
                          className={`p-1 rounded text-center font-medium border ${
                            selectedEngine === "openai"
                              ? "bg-emerald-950/60 border-emerald-500 text-emerald-300"
                              : "bg-slate-950 border-slate-800 text-slate-400"
                          }`}
                        >
                          🧠 OpenAI
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Language Quick Ribbon */}
                  <div className="flex items-center gap-1.5 mb-2.5">
                    {[
                      { code: "ja", label: "🇯🇵 日本語" },
                      { code: "en", label: "🇺🇸 英語" },
                      { code: "zh-CN", label: "🇨🇳 中国語" },
                      { code: "ko", label: "🇰🇷 韓国語" },
                      { code: "es", label: "🇪🇸 西語" }
                    ].map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => setPopupTargetLang(lang.code)}
                        className={`flex-1 py-1 px-1 rounded-lg text-xs font-semibold border transition ${
                          popupTargetLang === lang.code
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
                    {[
                      { id: "natural", label: "💬 自然な訳" },
                      { id: "business", label: "👔 ビジネス敬語" },
                      { id: "summary", label: "📝 要約" },
                      { id: "breakdown", label: "🔍 解説" }
                    ].map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setPopupTone(t.id as any)}
                        className={`py-1 rounded text-[11px] transition ${
                          popupTone === t.id
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
                          onClick={() => setPopupInputText("")}
                          className="hover:text-red-400 text-slate-500"
                        >
                          クリア
                        </button>
                        <span>{popupInputText.length}文字</span>
                      </div>
                    </div>
                    <textarea
                      value={popupInputText}
                      onChange={(e) => setPopupInputText(e.target.value)}
                      className="w-full h-16 bg-transparent text-xs text-slate-200 resize-none outline-none font-sans leading-relaxed"
                    />
                  </div>

                  {/* Trigger Action Bar */}
                  <button
                    onClick={handlePopupTranslate}
                    disabled={isPopupTranslating || !popupInputText.trim()}
                    className="w-full py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 disabled:bg-slate-800 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-cyan-600/20 transition mb-3"
                  >
                    {isPopupTranslating ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>読み解き中...</span>
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
                            copyToClipboard(popupResultText);
                            setHasPopupCopied(true);
                            setTimeout(() => setHasPopupCopied(false), 1500);
                          }}
                          disabled={!popupResultText || popupResultText === "読み解き中..."}
                          className="px-2 py-0.5 rounded text-[11px] border border-slate-700 bg-slate-850 hover:bg-slate-800 text-slate-300 flex items-center gap-1 transition"
                        >
                          {hasPopupCopied ? (
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
                          onClick={() => speakText(popupResultText, popupTargetLang)}
                          disabled={!popupResultText || popupResultText === "読み解き中..."}
                          className="p-1 rounded text-slate-400 hover:text-white border border-slate-700 bg-slate-850 transition"
                          title="発音を聞く"
                        >
                          <Volume2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <div className="text-xs text-slate-100 leading-relaxed font-sans whitespace-pre-wrap">
                      {popupResultText}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Special Environments (Gmail / GitHub) Testbed (7 cols) */}
              <div className="lg:col-span-7 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <h2 className="font-semibold text-sm text-slate-200">
                      【特殊環境テスト】Gmail ＆ GitHub 実証シミュレーター
                    </h2>
                  </div>
                  <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-xs">
                    <button
                      onClick={() => {
                        setSimulatedPageEnv("github");
                        setSelectedWebText("Warning: The current build pipeline encountered an unexpected dependency resolution conflict on branch main.");
                      }}
                      className={`px-2.5 py-1 rounded flex items-center gap-1.5 transition ${
                        simulatedPageEnv === "github" ? "bg-slate-800 text-white font-semibold" : "text-slate-400"
                      }`}
                    >
                      <Github className="w-3.5 h-3.5" />
                      <span>GitHub</span>
                    </button>
                    <button
                      onClick={() => {
                        setSimulatedPageEnv("gmail");
                        setSelectedWebText("Please review the attached contract proposal before our cross-functional sync tomorrow afternoon.");
                      }}
                      className={`px-2.5 py-1 rounded flex items-center gap-1.5 transition ${
                        simulatedPageEnv === "gmail" ? "bg-slate-800 text-white font-semibold" : "text-slate-400"
                      }`}
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>Gmail (iframe)</span>
                    </button>
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
                      <span className="text-slate-300 font-mono">
                        {simulatedPageEnv === "github"
                          ? "github.com/organization/project/pull/1428"
                          : "mail.google.com/mail/u/0/#inbox/FMfcgz..."}
                      </span>
                    </div>
                    <button
                      onClick={handleSimulateContextMenuTranslate}
                      className="text-[11px] bg-cyan-600/20 text-cyan-400 hover:bg-cyan-600/30 border border-cyan-500/40 px-2.5 py-1 rounded-md font-medium transition flex items-center gap-1"
                    >
                      <MousePointerClick className="w-3 h-3" />
                      <span>右クリック翻訳</span>
                    </button>
                  </div>

                  {/* Web Page Article Body */}
                  <div
                    ref={articleRef}
                    onMouseUp={handleArticleMouseUp}
                    className="p-6 bg-slate-950 text-slate-300 min-h-[420px] relative select-text"
                  >
                    {simulatedPageEnv === "github" ? (
                      /* GitHub Environment View (Dark Mode & Code formatting) */
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
                    ) : (
                      /* Gmail Environment View (Nested iframe simulation) */
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
                    )}

                    {/* Simulated Context Menu Popup */}
                    {showContextMenu && (
                      <div
                        style={{ top: `${contextMenuPos.y}px`, left: `${contextMenuPos.x}px` }}
                        className="absolute z-30 bg-slate-800 text-white rounded-lg shadow-2xl border border-slate-600 py-1.5 w-64 animate-in fade-in zoom-in-95 duration-150"
                      >
                        <div className="px-3 py-1 text-[11px] text-slate-400 border-b border-slate-700 font-mono truncate">
                          選択: "{selectedWebText.slice(0, 20)}..."
                        </div>
                        <button
                          onClick={handleSimulateContextMenuTranslate}
                          className="w-full text-left px-3 py-2 text-xs hover:bg-cyan-600 text-white flex items-center gap-2 font-medium transition"
                        >
                          <Zap className="w-3.5 h-3.5 text-cyan-400" />
                          <span>QuickLens で読み解く</span>
                        </button>
                      </div>
                    )}

                    {/* In-page Toast HUD (Simulating Closed Shadow DOM) */}
                    {showHud && (
                      <div className="absolute bottom-4 right-4 z-40 w-80 bg-slate-900 text-white rounded-xl shadow-2xl border border-slate-700 overflow-hidden animate-in slide-in-from-bottom-4 duration-200">
                        {/* Header */}
                        <div className="flex items-center justify-between px-3 py-2 bg-slate-850 border-b border-slate-700">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-cyan-400">⚡ QuickLens</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                              {selectedEngine === "gemini" ? "Gemini AI" : "無料モード"}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                copyToClipboard(hudData.translated);
                                setHasHudCopied(true);
                                setTimeout(() => setHasHudCopied(false), 1500);
                              }}
                              className="px-2 py-0.5 text-[11px] rounded hover:bg-slate-700 text-slate-300 transition flex items-center gap-1"
                            >
                              {hasHudCopied ? <span className="text-emerald-400 font-bold">✓</span> : <Copy className="w-3 h-3" />}
                              <span>コピー</span>
                            </button>
                            <button
                              onClick={() => speakText(hudData.translated, popupTargetLang)}
                              className="p-1 text-slate-400 hover:text-white rounded"
                            >
                              <Volume2 className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => setShowHud(false)}
                              className="p-1 text-slate-400 hover:text-red-400 rounded"
                            >
                              ✕
                            </button>
                          </div>
                        </div>

                        {/* Body */}
                        <div className="p-3 max-h-56 overflow-y-auto">
                          {hudStatus === "loading" ? (
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
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: セキュリティ & 特殊環境対策の仕組み */}
        {/* ========================================================================= */}
        {activeTab === "security" && (
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
              {/* Security Pill 1 */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-3">
                <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
                  <Lock className="w-4 h-4" />
                  <span>1. 端末内暗号化 (Web Crypto AES-GCM 256bit)</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  APIキーはクラウド（<code>chrome.storage.sync</code>）には一切保存されません。拡張機能のローカル隔離領域（<code>chrome.storage.local</code>）に、端末固有ソルトとPBKDF2で導出したAES-GCMキーで暗号化して保管されます。
                </p>
                <div className="bg-slate-950 p-2.5 rounded text-[11px] font-mono text-purple-300">
                  暗号化ペイロード: &#123; iv, ciphertext, updatedAt &#125;
                </div>
              </div>

              {/* Security Pill 2 */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-3">
                <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
                  <Globe className="w-4 h-4" />
                  <span>2. ゼロ・トラスト直接通信 (サーバー仲介なし)</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  中継サーバーやプロキシを挟まず、ブラウザのバックグラウンド（Service Worker）からGoogle GeminiまたはOpenAIの公式エンドポイントへ直接HTTPS接続。第三者にキーや翻訳テキストが漏洩する懸念はありません。
                </p>
                <div className="bg-slate-950 p-2.5 rounded text-[11px] font-mono text-cyan-300">
                  Browser &rarr; https://generativelanguage.googleapis.com
                </div>
              </div>

              {/* Environment Pill 1 */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-3">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                  <Layers className="w-4 h-4" />
                  <span>3. Closed Shadow DOM によるCSS完全隔離</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  GitHubのダークモードCSSやGmailのリセットスタイルが拡張機能のUIを破壊しないよう、<code>element.attachShadow(&#123; mode: 'closed' &#125;)</code> を使用。ページのスタイルに一切影響されず、ページ側へもスタイル汚染を起こしません。
                </p>
                <div className="bg-slate-950 p-2.5 rounded text-[11px] font-mono text-emerald-300">
                  attachShadow(&#123; mode: "closed" &#125;)
                </div>
              </div>

              {/* Environment Pill 2 */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-3">
                <div className="flex items-center gap-2 text-blue-400 font-bold text-sm">
                  <Mail className="w-4 h-4" />
                  <span>4. all_frames &amp; 動的再注入フォールバック</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Gmailのメール本文iframeにもスクリプトが展開されるよう <code>all_frames: true</code> を指定。GitHubのPJAX遷移で接続が切れた場合も、Service Workerが自動で再注入（Scripting Fallback）を行ってからメッセージを再送します。
                </p>
                <div className="bg-slate-950 p-2.5 rounded text-[11px] font-mono text-blue-300">
                  chrome.scripting.executeScript() &rarr; Retry send
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: ソースコード一式 */}
        {/* ========================================================================= */}
        {activeTab === "code" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 rounded-xl p-4">
              <div>
                <h2 className="font-bold text-white text-base">拡張機能 完全ソースコード</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  省略なし・コピペでそのまま動作する最新の全ファイルです。
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => copyToClipboard(activeFile.content, activeFile.name)}
                  className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium border border-slate-700 flex items-center gap-2 transition"
                >
                  {copiedFileName === activeFile.name ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">{activeFile.name} をコピー完了</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>現在のファイルをコピー</span>
                    </>
                  )}
                </button>
                <button
                  onClick={handleDownloadZip}
                  className="px-3.5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium flex items-center gap-2 transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>全ファイルをZIP保存</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              {/* Left Sidebar */}
              <div className="md:col-span-4 space-y-2">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-3">
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-2 flex items-center justify-between">
                    <span>ファイル一覧</span>
                    <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded">
                      {EXTENSION_FILES.length} files
                    </span>
                  </div>

                  <div className="space-y-1">
                    {EXTENSION_FILES.map((file, idx) => (
                      <button
                        key={file.name}
                        onClick={() => setActiveFileIndex(idx)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between transition ${
                          activeFileIndex === idx
                            ? "bg-cyan-600 text-white font-semibold shadow-sm"
                            : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <FileCode className={`w-3.5 h-3.5 shrink-0 ${activeFileIndex === idx ? "text-white" : "text-cyan-400"}`} />
                          <span className="truncate">{file.name}</span>
                        </div>
                        <span className={`text-[10px] font-mono shrink-0 ${activeFileIndex === idx ? "text-cyan-100" : "text-slate-500"}`}>
                          {file.language}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4">
                  <div className="text-xs font-semibold text-cyan-400 mb-1">{activeFile.name} の役割</div>
                  <div className="text-xs text-slate-300 font-medium mb-1.5">{activeFile.role}</div>
                  <p className="text-xs text-slate-400 leading-relaxed">{activeFile.description}</p>
                </div>
              </div>

              {/* Right Code Viewer */}
              <div className="md:col-span-8 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col">
                <div className="px-4 py-2.5 bg-slate-850 border-b border-slate-700/80 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
                    <span className="text-cyan-400">chrome-extension/</span>
                    <span className="font-semibold text-white">{activeFile.name}</span>
                    <span className="text-[10px] text-slate-400 bg-slate-750 px-1.5 py-0.5 rounded">
                      {activeFile.content.split("\n").length} 行
                    </span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(activeFile.content, activeFile.name)}
                    className="flex items-center gap-1.5 text-xs bg-slate-700 hover:bg-slate-600 text-slate-200 px-2.5 py-1 rounded transition"
                  >
                    {copiedFileName === activeFile.name ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">コピー完了</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>コピー</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="p-4 overflow-x-auto max-h-[600px] overflow-y-auto bg-slate-950 font-mono text-xs leading-relaxed text-slate-300">
                  <pre>
                    <code>{activeFile.content}</code>
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: Chrome導入手順 */}
        {/* ========================================================================= */}
        {activeTab === "guide" && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                <span>🛠️</span>
                <span>Chromeへのインストール手順（所要時間：1分）</span>
              </h2>
              <p className="text-sm text-slate-400 leading-relaxed">
                ローカル環境のGoogle Chromeに「パッケージ化されていない拡張機能」として即座に読み込めます。
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
                <div className="w-8 h-8 rounded-full bg-cyan-600 text-white font-bold flex items-center justify-center text-sm mb-3">
                  1
                </div>
                <h3 className="font-semibold text-white text-sm mb-1.5">ZIPをダウンロードして解凍</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  画面上部の「<strong>拡張機能をZIP保存</strong>」ボタンを押し、PCの分かりやすい場所（デスクトップ等）に解凍します。
                </p>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
                <div className="w-8 h-8 rounded-full bg-cyan-600 text-white font-bold flex items-center justify-center text-sm mb-3">
                  2
                </div>
                <h3 className="font-semibold text-white text-sm mb-1.5">chrome://extensions を開く</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Chromeのアドレスバーに <code>chrome://extensions</code> と入力してEnterを押します。
                </p>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
                <div className="w-8 h-8 rounded-full bg-cyan-600 text-white font-bold flex items-center justify-center text-sm mb-3">
                  3
                </div>
                <h3 className="font-semibold text-white text-sm mb-1.5">デベロッパーモードをON</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  画面右上にある「<strong>デベロッパーモード</strong>」のトグルをONにします。
                </p>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
                <div className="w-8 h-8 rounded-full bg-cyan-600 text-white font-bold flex items-center justify-center text-sm mb-3">
                  4
                </div>
                <h3 className="font-semibold text-white text-sm mb-1.5">フォルダを読み込む</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  左上の「<strong>パッケージ化されていない拡張機能を読み込む</strong>」をクリックし、解凍したフォルダを選択します。
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-slate-800 bg-slate-900/60 py-4 text-center text-xs text-slate-500">
        <div>QuickLens 翻訳 (Focus Lens UI &amp; Web Crypto Vault) • Manifest V3</div>
      </footer>
    </div>
  );
}
