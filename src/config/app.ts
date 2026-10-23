/**
 * アプリ全体の定義（タブ・ZIP出力・UIフィードバック時間・表示文言）
 */

export type TabId = "simulator" | "code" | "security" | "guide";

export const DEFAULT_TAB: TabId = "simulator";

export const ZIP_FILE_NAME = "quicklens-focus-translator-mv3.zip";
export const ZIP_ICONS_FOLDER = "icons";

/** ボタン押下後のフィードバック表示時間 (ms) */
export const FEEDBACK_DURATION = {
  FILE_COPIED: 2000,
  ZIP_SUCCESS: 3000,
  RESULT_COPIED: 1500,
  KEY_SAVED: 1800
} as const;

export const STATUS_TEXT = {
  POPUP_TRANSLATING: "読み解き中...",
  HUD_ANALYZING: "解析中...",
  KEY_SAVED: "✓ 暗号化保存しました"
} as const;
