import { Check, Copy, Download, FileCode } from "lucide-react";
import { EXTENSION_FILES } from "../../extensionFiles";

interface CodeTabProps {
  activeFileIndex: number;
  onSelectFile: (index: number) => void;
  copiedFileName: string | null;
  onCopyFile: (content: string, name: string) => void;
  onDownloadZip: () => void;
}

export default function CodeTab({ activeFileIndex, onSelectFile, copiedFileName, onCopyFile, onDownloadZip }: CodeTabProps) {
  const activeFile = EXTENSION_FILES[activeFileIndex] || EXTENSION_FILES[0];
  const isActiveFileCopied = copiedFileName === activeFile.name;

  return (
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
            onClick={() => onCopyFile(activeFile.content, activeFile.name)}
            className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium border border-slate-700 flex items-center gap-2 transition"
          >
            {isActiveFileCopied ? (
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
            onClick={onDownloadZip}
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
                  onClick={() => onSelectFile(idx)}
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
              onClick={() => onCopyFile(activeFile.content, activeFile.name)}
              className="flex items-center gap-1.5 text-xs bg-slate-700 hover:bg-slate-600 text-slate-200 px-2.5 py-1 rounded transition"
            >
              {isActiveFileCopied ? (
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
  );
}
