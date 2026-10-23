import React, { useEffect, useRef, useState } from "react";
import { FEEDBACK_DURATION, STATUS_TEXT } from "../config/app";
import { CONTEXT_MENU, DEFAULT_PAGE_ENV, DEFAULT_POPUP_INPUT, PAGE_ENVS, type PageEnv } from "../config/simulator";
import { DEFAULT_ENGINE, DEFAULT_TARGET_LANG, DEFAULT_TONE, type Engine, type Tone } from "../config/translation";
import { translateText } from "../lib/translate";

export type HudStatus = "loading" | "success" | "idle";

export interface HudData {
  original: string;
  translated: string;
  engine: Engine;
  tone: Tone;
}

/**
 * シミュレーターの状態とハンドラー。
 * タブを切り替えても状態が保持されるよう App 直下で利用する。
 */
export function useSimulator() {
  // Engine & Vault
  const [selectedEngine, setSelectedEngine] = useState<Engine>(DEFAULT_ENGINE);
  const [vaultOpen, setVaultOpen] = useState(false);
  const [simulatedApiKey, setSimulatedApiKey] = useState("");
  const [savedKeyMessage, setSavedKeyMessage] = useState<string | null>(null);

  // Focus Lens Popup
  const [popupTargetLang, setPopupTargetLang] = useState<string>(DEFAULT_TARGET_LANG);
  const [popupTone, setPopupTone] = useState<Tone>(DEFAULT_TONE);
  const [popupInputText, setPopupInputText] = useState(DEFAULT_POPUP_INPUT);
  const [popupResultText, setPopupResultText] = useState("");
  const [isPopupTranslating, setIsPopupTranslating] = useState(false);
  const [hasPopupCopied, setHasPopupCopied] = useState(false);

  // Webpage Environment (Gmail / GitHub)
  const [simulatedPageEnv, setSimulatedPageEnv] = useState<PageEnv>(DEFAULT_PAGE_ENV);
  const [selectedWebText, setSelectedWebText] = useState(PAGE_ENVS[DEFAULT_PAGE_ENV].sampleText);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPos, setContextMenuPos] = useState<{ x: number; y: number }>(CONTEXT_MENU.DEFAULT_POSITION);
  const [showHud, setShowHud] = useState(false);
  const [hudStatus, setHudStatus] = useState<HudStatus>("idle");
  const [hudData, setHudData] = useState<HudData>({ original: "", translated: "", engine: DEFAULT_ENGINE, tone: DEFAULT_TONE });
  const [hasHudCopied, setHasHudCopied] = useState(false);

  const articleRef = useRef<HTMLDivElement>(null);

  const handlePopupTranslate = async () => {
    if (!popupInputText.trim()) return;
    setIsPopupTranslating(true);
    setPopupResultText(STATUS_TEXT.POPUP_TRANSLATING);
    const res = await translateText(popupInputText, popupTargetLang, popupTone);
    setPopupResultText(res);
    setIsPopupTranslating(false);
  };

  useEffect(() => {
    handlePopupTranslate();
  }, [popupTargetLang, popupTone, selectedEngine]);

  const saveSimulatedKey = () => {
    setSavedKeyMessage(STATUS_TEXT.KEY_SAVED);
    setSelectedEngine("gemini");
    setTimeout(() => setSavedKeyMessage(null), FEEDBACK_DURATION.KEY_SAVED);
  };

  const switchPageEnv = (env: PageEnv) => {
    setSimulatedPageEnv(env);
    setSelectedWebText(PAGE_ENVS[env].sampleText);
  };

  const handleArticleMouseUp = (e: React.MouseEvent) => {
    const selection = window.getSelection();
    const text = selection ? selection.toString().trim() : "";
    if (text) {
      setSelectedWebText(text);
      if (articleRef.current) {
        const rect = articleRef.current.getBoundingClientRect();
        setContextMenuPos({
          x: Math.min(e.clientX - rect.left + CONTEXT_MENU.CURSOR_OFFSET, rect.width - CONTEXT_MENU.EDGE_MARGIN_X),
          y: Math.min(e.clientY - rect.top + CONTEXT_MENU.CURSOR_OFFSET, rect.height - CONTEXT_MENU.EDGE_MARGIN_Y)
        });
      }
      setShowContextMenu(true);
    }
  };

  const handleSimulateContextMenuTranslate = async () => {
    setShowContextMenu(false);
    setShowHud(true);
    setHudStatus("loading");
    setHudData({ original: selectedWebText, translated: STATUS_TEXT.HUD_ANALYZING, engine: selectedEngine, tone: popupTone });

    const translated = await translateText(selectedWebText, popupTargetLang, popupTone);
    setHudData({
      original: selectedWebText,
      translated: translated,
      engine: selectedEngine,
      tone: popupTone
    });
    setHudStatus("success");
  };

  return {
    selectedEngine,
    setSelectedEngine,
    vaultOpen,
    setVaultOpen,
    simulatedApiKey,
    setSimulatedApiKey,
    savedKeyMessage,
    saveSimulatedKey,
    popupTargetLang,
    setPopupTargetLang,
    popupTone,
    setPopupTone,
    popupInputText,
    setPopupInputText,
    popupResultText,
    isPopupTranslating,
    hasPopupCopied,
    setHasPopupCopied,
    handlePopupTranslate,
    simulatedPageEnv,
    switchPageEnv,
    selectedWebText,
    showContextMenu,
    contextMenuPos,
    showHud,
    setShowHud,
    hudStatus,
    hudData,
    hasHudCopied,
    setHasHudCopied,
    articleRef,
    handleArticleMouseUp,
    handleSimulateContextMenuTranslate
  };
}

export type SimulatorState = ReturnType<typeof useSimulator>;
