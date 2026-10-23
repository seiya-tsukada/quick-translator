/**
 * 翻訳まわりの定義（言語・トーン・エンジン・エンドポイント）
 */

export const FREE_TRANSLATE_URL = "https://translate.googleapis.com/translate_a/single";

export const DEFAULT_TARGET_LANG = "ja";

export const LANGUAGES = [
  { code: "ja", label: "🇯🇵 日本語" },
  { code: "en", label: "🇺🇸 英語" },
  { code: "zh-CN", label: "🇨🇳 中国語" },
  { code: "ko", label: "🇰🇷 韓国語" },
  { code: "es", label: "🇪🇸 西語" }
] as const;

export type Tone = "natural" | "business" | "summary" | "breakdown";

export const DEFAULT_TONE: Tone = "natural";

export const TONES: ReadonlyArray<{ id: Tone; label: string }> = [
  { id: "natural", label: "💬 自然な訳" },
  { id: "business", label: "👔 ビジネス敬語" },
  { id: "summary", label: "📝 要約" },
  { id: "breakdown", label: "🔍 解説" }
];

export type Engine = "free" | "gemini" | "openai";

export const DEFAULT_ENGINE: Engine = "free";

export const ENGINE_BADGE_LABELS: Record<Engine, string> = {
  free: "無料モード",
  gemini: "Gemini AI",
  openai: "OpenAI"
};

/** 金庫ドロワー内のエンジン選択チップ */
export const ENGINE_CHIPS: ReadonlyArray<{ id: Engine; label: string; activeClassName: string }> = [
  { id: "free", label: "🆓 無料 (キー不要)", activeClassName: "bg-cyan-950/60 border-cyan-500 text-cyan-300" },
  { id: "gemini", label: "⚡ Gemini AI", activeClassName: "bg-purple-950/60 border-purple-500 text-purple-300" },
  { id: "openai", label: "🧠 OpenAI", activeClassName: "bg-emerald-950/60 border-emerald-500 text-emerald-300" }
];

/** ポップアップ上部のエンジンバッジの配色 */
export const ENGINE_BADGE_CLASS_NAMES: Record<Engine, string> = {
  free: "bg-slate-900 text-cyan-400 border-cyan-500/30",
  gemini: "bg-purple-950/40 text-purple-300 border-purple-500/40",
  openai: "bg-emerald-950/40 text-emerald-300 border-emerald-500/40"
};
