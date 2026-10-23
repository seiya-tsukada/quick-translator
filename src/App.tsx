/**
 * QuickLens - Chrome Extension Studio & Live Simulation Environment
 */

import { useState } from "react";
import AppHeader from "./components/AppHeader";
import CodeTab from "./components/tabs/CodeTab";
import GuideTab from "./components/tabs/GuideTab";
import SecurityTab from "./components/tabs/SecurityTab";
import SimulatorTab from "./components/tabs/SimulatorTab";
import { DEFAULT_TAB, FEEDBACK_DURATION, ZIP_FILE_NAME, type TabId } from "./config/app";
import { useSimulator } from "./hooks/useSimulator";
import { copyToClipboard, downloadBlob } from "./lib/browser";
import { buildExtensionZip } from "./lib/zip";

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>(DEFAULT_TAB);
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [copiedFileName, setCopiedFileName] = useState<string | null>(null);
  const [isZipping, setIsZipping] = useState(false);
  const [zipSuccess, setZipSuccess] = useState(false);

  // タブ切り替え後も状態を保持するため App 直下で保持する
  const sim = useSimulator();

  const handleCopyFile = async (content: string, name: string) => {
    if (await copyToClipboard(content)) {
      setCopiedFileName(name);
      setTimeout(() => setCopiedFileName(null), FEEDBACK_DURATION.FILE_COPIED);
    }
  };

  const handleDownloadZip = async () => {
    setIsZipping(true);
    try {
      const blob = await buildExtensionZip();
      downloadBlob(blob, ZIP_FILE_NAME);

      setZipSuccess(true);
      setTimeout(() => setZipSuccess(false), FEEDBACK_DURATION.ZIP_SUCCESS);
    } catch (err) {
      console.error("Failed to generate ZIP:", err);
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <AppHeader
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isZipping={isZipping}
        zipSuccess={zipSuccess}
        onDownloadZip={handleDownloadZip}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6">
        {activeTab === "simulator" && <SimulatorTab sim={sim} />}
        {activeTab === "security" && <SecurityTab />}
        {activeTab === "code" && (
          <CodeTab
            activeFileIndex={activeFileIndex}
            onSelectFile={setActiveFileIndex}
            copiedFileName={copiedFileName}
            onCopyFile={handleCopyFile}
            onDownloadZip={handleDownloadZip}
          />
        )}
        {activeTab === "guide" && <GuideTab />}
      </main>

      <footer className="border-t border-slate-800 bg-slate-900/60 py-4 text-center text-xs text-slate-500">
        <div>QuickLens 翻訳 (Focus Lens UI &amp; Web Crypto Vault) • Manifest V3</div>
      </footer>
    </div>
  );
}
