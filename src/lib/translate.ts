import type { Tone } from "../config/translation";

/** シミュレーター用：トーンの違いを示すための表示整形（実際の AI 呼び出しは行わない） */
function applyTone(baseTranslation: string, tone: Tone): string {
  switch (tone) {
    case "business":
      return `【ビジネス敬語（AI エンジン利用時のイメージ）】\n${baseTranslation}`;
    case "summary":
      return `【要約（AI エンジン利用時のイメージ）】\n• ${baseTranslation}`;
    case "breakdown":
      return `【翻訳＋解説（AI エンジン利用時のイメージ）】\n${baseTranslation}`;
    default:
      return baseTranslation;
  }
}

interface BuiltinTranslator {
  translate(text: string): Promise<string>;
}
interface TranslatorStatic {
  availability(opts: { sourceLanguage: string; targetLanguage: string }): Promise<string>;
  create(opts: { sourceLanguage: string; targetLanguage: string }): Promise<BuiltinTranslator>;
}
interface DetectorStatic {
  create(): Promise<{ detect(text: string): Promise<Array<{ detectedLanguage: string; confidence: number }>> }>;
}

/** 拡張機能と同じ language code の対応（zh-CN → zh） */
const BUILTIN_CODES: Record<string, string> = { "zh-CN": "zh", "zh-TW": "zh-Hant" };

/**
 * Chrome 組み込みの Translator API（端末内翻訳）で翻訳する。
 * 非対応ブラウザでは、その旨をメッセージとして返す（外部の非公式エンドポイントは使わない）。
 */
export async function translateText(text: string, targetLang: string, tone: Tone): Promise<string> {
  if (!text.trim()) return "";
  const g = globalThis as unknown as { Translator?: TranslatorStatic; LanguageDetector?: DetectorStatic };
  if (!g.Translator || !g.LanguageDetector) {
    return "[シミュレーター] このブラウザでは Chrome の端末内翻訳（Translator API）を利用できません。デスクトップ版 Chrome 138 以降で開くと実際に翻訳されます。";
  }
  try {
    const detector = await g.LanguageDetector.create();
    const [top] = await detector.detect(text);
    const source = (top?.detectedLanguage || "en").split("-")[0];
    const target = BUILTIN_CODES[targetLang] || targetLang;
    if (source === target.split("-")[0]) return applyTone(text, tone);
    const translator = await g.Translator.create({ sourceLanguage: source, targetLanguage: target });
    return applyTone(await translator.translate(text), tone);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return `[翻訳エラー] 端末内翻訳を実行できませんでした（${message}）。モデルのダウンロードにはページ上での操作が必要な場合があります。`;
  }
}
