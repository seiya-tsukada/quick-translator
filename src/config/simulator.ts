/**
 * シミュレーターの定義（サンプルテキスト・疑似ページ環境・コンテキストメニュー配置）
 */

export const DEFAULT_POPUP_INPUT =
  "Google Chrome Extensions Manifest V3 guarantees strict security boundaries, isolated origins, and high-performance execution across modern web apps.";

export type PageEnv = "github" | "gmail";

export const DEFAULT_PAGE_ENV: PageEnv = "github";

export const PAGE_ENVS: Record<PageEnv, { label: string; url: string; sampleText: string }> = {
  github: {
    label: "GitHub",
    url: "github.com/organization/project/pull/1428",
    sampleText:
      "Warning: The current build pipeline encountered an unexpected dependency resolution conflict on branch main."
  },
  gmail: {
    label: "Gmail (iframe)",
    url: "mail.google.com/mail/u/0/#inbox/FMfcgz...",
    sampleText: "Please review the attached contract proposal before our cross-functional sync tomorrow afternoon."
  }
};

export const CONTEXT_MENU = {
  DEFAULT_POSITION: { x: 260, y: 140 },
  /** カーソル位置からのオフセット (px) */
  CURSOR_OFFSET: 10,
  /** 記事領域からはみ出さないための右端・下端の余白 (px) */
  EDGE_MARGIN_X: 250,
  EDGE_MARGIN_Y: 80,
  /** メニューに表示する選択テキストの文字数 */
  PREVIEW_LENGTH: 20
} as const;
