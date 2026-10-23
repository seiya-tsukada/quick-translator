import { FREE_TRANSLATE_URL, type Tone } from "../config/translation";

/** トーンに応じてシミュレーター用の表示形式に整形する */
function applyTone(baseTranslation: string, tone: Tone): string {
  switch (tone) {
    case "business":
      return `【ビジネス敬語】\n${baseTranslation.replace(/だ。|である。/g, "でございます。").replace(/する。/g, "いたします。")}`;
    case "summary":
      return `【重要要点まとめ】\n• ${baseTranslation}\n• セキュリティ要件と分離機構の遵守が推奨されます。`;
    case "breakdown":
      return `【翻訳】\n${baseTranslation}\n\n【語彙・ニュアンス解説】\n• strict security boundaries: 厳格なセキュリティ境界\n• isolated origins: 独立した実行コンテキスト (Shadow DOMなど)\n• high-performance execution: 高速・低負荷な動作特性`;
    default:
      return baseTranslation;
  }
}

/** 無料の Google Translate エンドポイントで翻訳し、トーンに応じた整形を行う */
export async function translateText(text: string, targetLang: string, tone: Tone): Promise<string> {
  if (!text.trim()) return "";
  try {
    const url = `${FREE_TRANSLATE_URL}?client=gtx&sl=auto&tl=${encodeURIComponent(targetLang)}&dt=t&q=${encodeURIComponent(text)}`;

    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
    const data = await res.json();
    let baseTranslation = "";
    if (data && Array.isArray(data[0])) {
      baseTranslation = data[0].map((item: any) => item[0] || "").join("");
    }
    return applyTone(baseTranslation, tone);
  } catch (err: any) {
    console.error("Translation API error:", err);
    return `[翻訳エラー] ネットワーク状況を確認してください (${err.message || "error"})`;
  }
}
