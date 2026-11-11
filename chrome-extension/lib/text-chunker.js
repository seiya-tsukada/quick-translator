/**
 * QuickLens - Long text splitting
 * Splits text into chunks no longer than maxChars while preserving the original
 * line breaks, so that translated chunks can be re-joined with the same structure.
 *
 * Model: text = seg[0] + sep[0] + seg[1] + sep[1] + ... where every sep is pure
 * whitespace containing line breaks. Each segment is translated independently
 * (or further split by sentence), separators are kept verbatim.
 */

(() => {
  if (globalThis.QuickLensChunker) return;

  // Sentence end: CJK full stops, or Latin punctuation followed by whitespace.
  const SENTENCE_RE = /[^。！？!?.]*(?:[。！？]+|[!?.]+(?=\s|$)|$)\s*/gu;

  function splitSentences(text) {
    const parts = text.match(SENTENCE_RE) || [];
    return parts.filter((p) => p.length > 0);
  }

  function hardSplit(text, maxChars) {
    const out = [];
    for (let i = 0; i < text.length; i += maxChars) out.push(text.slice(i, i + maxChars));
    return out;
  }

  /** Pack sentences of one paragraph into chunks of <= maxChars */
  function packParagraph(paragraph, maxChars) {
    if (paragraph.length <= maxChars) return [paragraph];
    const chunks = [];
    let buf = "";
    for (const sentence of splitSentences(paragraph)) {
      const pieces = sentence.length > maxChars ? hardSplit(sentence, maxChars) : [sentence];
      for (const piece of pieces) {
        if (buf.length + piece.length > maxChars && buf) {
          chunks.push(buf);
          buf = "";
        }
        buf += piece;
      }
    }
    if (buf) chunks.push(buf);
    return chunks;
  }

  /**
   * @param {string} text
   * @param {number} maxChars
   * @returns {{ units: Array<{ type: "text"|"sep", value: string, joinWith?: string }> }}
   *   "text" units are to be translated; "sep" units are kept verbatim.
   *   Sentences of the same paragraph are joined with "" (their own trailing spaces are kept in the chunk).
   */
  function plan(text, maxChars) {
    if (!(maxChars > 0)) throw new Error("maxChars must be positive");
    const units = [];
    const tokens = String(text).split(/(\s*\n\s*)/);
    tokens.forEach((token, i) => {
      if (token === "") return;
      if (i % 2 === 1) {
        units.push({ type: "sep", value: token });
        return;
      }
      // Preserve leading/trailing spaces of a paragraph outside the translated text
      const lead = token.match(/^\s*/)[0];
      const trail = token.slice(lead.length).match(/\s*$/)[0];
      const core = token.slice(lead.length, token.length - trail.length);
      if (lead) units.push({ type: "sep", value: lead });
      if (core) {
        packParagraph(core, maxChars).forEach((chunk) => units.push({ type: "text", value: chunk }));
      }
      if (trail) units.push({ type: "sep", value: trail });
    });
    return { units };
  }

  /** Convenience: only the chunks that need translation */
  function chunkText(text, maxChars) {
    return plan(text, maxChars).units.filter((u) => u.type === "text").map((u) => u.value);
  }

  /**
   * Translate text chunk by chunk (sequentially) and rejoin with the original separators.
   * When two chunks of the same paragraph were separated by whitespace in the original
   * (e.g. "...end. Next...") and the translation dropped it, a single space is restored.
   */
  async function translateInChunks(text, maxChars, translateChunk, onProgress) {
    const { units } = plan(text, maxChars);
    const total = units.filter((u) => u.type === "text").length;
    let done = 0;
    let out = "";
    let prevTextEndedWithSpace = false;
    let prevWasText = false;
    for (const unit of units) {
      if (unit.type === "sep") {
        out += unit.value;
        prevWasText = false;
        continue;
      }
      const translated = String(await translateChunk(unit.value.trimEnd()));
      if (prevWasText && prevTextEndedWithSpace && out && !/\s$/.test(out)) out += " ";
      out += translated.trim();
      prevTextEndedWithSpace = /\s$/.test(unit.value);
      prevWasText = true;
      done += 1;
      if (onProgress) onProgress(done, total);
    }
    return out;
  }

  globalThis.QuickLensChunker = Object.freeze({ plan, chunkText, splitSentences, translateInChunks });
})();
