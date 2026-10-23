const INSTALL_STEPS = [
  {
    title: "ZIPをダウンロードして解凍",
    body: (
      <>
        画面上部の「<strong>拡張機能をZIP保存</strong>」ボタンを押し、PCの分かりやすい場所（デスクトップ等）に解凍します。
      </>
    )
  },
  {
    title: "chrome://extensions を開く",
    body: (
      <>
        Chromeのアドレスバーに <code>chrome://extensions</code> と入力してEnterを押します。
      </>
    )
  },
  {
    title: "デベロッパーモードをON",
    body: (
      <>
        画面右上にある「<strong>デベロッパーモード</strong>」のトグルをONにします。
      </>
    )
  },
  {
    title: "フォルダを読み込む",
    body: (
      <>
        左上の「<strong>パッケージ化されていない拡張機能を読み込む</strong>」をクリックし、解凍したフォルダを選択します。
      </>
    )
  }
];

export default function GuideTab() {
  return (
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
        {INSTALL_STEPS.map((step, idx) => (
          <div key={step.title} className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
            <div className="w-8 h-8 rounded-full bg-cyan-600 text-white font-bold flex items-center justify-center text-sm mb-3">
              {idx + 1}
            </div>
            <h3 className="font-semibold text-white text-sm mb-1.5">{step.title}</h3>
            <p className="text-xs text-slate-400 leading-relaxed">{step.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
