
import React, { useState, useRef, useEffect } from 'react';
import { extractAndTranslateMaisoku } from './services/geminiService';
import { Language, MaisokuData, ProcessingState } from './types';
import TemplatePreview from './components/TemplatePreview';

const App: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [targetLang, setTargetLang] = useState<Language>(Language.CHINESE);
  const [data, setData] = useState<MaisokuData | null>(null);
  const [state, setState] = useState<ProcessingState>({ isProcessing: false, status: '待機中' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper to get PDF.js library safely
  const getPdfLib = () => {
    // @ts-ignore
    const lib = window['pdfjs-dist/build/pdf'] || window['pdfjsLib'];
    if (!lib) {
      console.error("PDF.js library not found on window");
      return null;
    }
    return lib;
  };

  useEffect(() => {
    const pdfjs = getPdfLib();
    if (pdfjs) {
      pdfjs.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    }
  }, []);

  const processFile = async (file: File) => {
    if (file.type === 'application/pdf') {
      const pdfjs = getPdfLib();
      if (!pdfjs) {
        setState({ isProcessing: false, status: 'エラー', error: 'PDFライブラリの読み込みに失敗しました。ページを更新してください。' });
        return;
      }

      setState({ isProcessing: true, status: 'PDFを画像に変換中...' });
      try {
        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        const page = await pdf.getPage(1);
        const viewport = page.getViewport({ scale: 2.0 });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        if (context) {
          await page.render({ canvasContext: context, viewport: viewport }).promise;
          const base64 = canvas.toDataURL('image/jpeg', 0.8);
          setOriginalImage(base64);
          setData(null);
          setState({ isProcessing: false, status: '待機中' });
        }
      } catch (err) {
        console.error(err);
        setState({ isProcessing: false, status: 'エラー', error: 'PDFの解析に失敗しました。' });
      }
    } else {
      const reader = new FileReader();
      reader.onload = () => {
        setOriginalImage(reader.result as string);
        setData(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const processMaisoku = async () => {
    if (!originalImage) return;

    setState({ isProcessing: true, status: 'AIがマイソクを解析中...' });
    try {
      const base64Data = originalImage.split(',')[1];
      const result = await extractAndTranslateMaisoku(base64Data, targetLang);
      setData(result);
      setState({ isProcessing: false, status: '完了' });
    } catch (err) {
      console.error(err);
      setState({ isProcessing: false, status: 'エラー', error: '解析に失敗しました。APIキーまたは画像の鮮明度を確認してください。' });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <header className="no-print bg-slate-900 text-white p-6 shadow-lg">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-500 p-2 rounded-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold">マイソク AI 翻訳機</h1>
              <p className="text-xs text-slate-400">物件資料を自動で翻訳・データ化</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <select 
              className="bg-slate-800 border-slate-700 text-sm rounded-md px-3 py-2 text-white outline-none focus:ring-2 focus:ring-indigo-500"
              value={targetLang}
              onChange={(e) => setTargetLang(e.target.value as Language)}
            >
              <option value={Language.CHINESE}>中国語（繁体字）</option>
              <option value={Language.ENGLISH}>英語</option>
            </select>
            
            {data && (
              <button 
                onClick={handlePrint}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md font-medium transition flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                PDF出力
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          <div className="lg:col-span-4 space-y-6 no-print">
            <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <h2 className="text-lg font-semibold mb-4 text-slate-800 flex items-center gap-2">
                <span className="bg-indigo-100 text-indigo-600 w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold">1</span>
                資料アップロード
              </h2>
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:border-indigo-400 transition-all cursor-pointer bg-slate-50 hover:bg-white" onClick={() => fileInputRef.current?.click()}>
                <input 
                  type="file" 
                  accept="image/*,application/pdf" 
                  onChange={handleFileUpload} 
                  className="hidden" 
                  ref={fileInputRef}
                />
                <svg className="w-12 h-12 mx-auto text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span className="text-slate-600 block font-medium">マイソクを選択</span>
                <span className="text-slate-400 text-xs mt-1 block">JPG, PNG, PDF 対応</span>
              </div>
              {originalImage && (
                <div className="mt-4 p-2 bg-indigo-50 border border-indigo-100 rounded-lg flex items-center gap-3">
                  <img src={originalImage} className="w-12 h-12 object-cover rounded shadow-sm border border-white" />
                  <p className="text-xs text-indigo-700 font-medium font-bold">読み込み完了</p>
                </div>
              )}
            </section>

            <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <h2 className="text-lg font-semibold mb-4 text-slate-800 flex items-center gap-2">
                <span className="bg-indigo-100 text-indigo-600 w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold">2</span>
                AI 変換実行
              </h2>
              <button 
                onClick={processMaisoku}
                disabled={!originalImage || state.isProcessing}
                className={`w-full py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-3 shadow-md ${
                  !originalImage || state.isProcessing 
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none' 
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95'
                }`}
              >
                {state.isProcessing ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    <span>{state.status}</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    <span>変換を開始する</span>
                  </>
                )}
              </button>
              
              {state.error && (
                <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg text-xs border border-red-100 font-medium">
                  {state.error}
                </div>
              )}
            </section>

            <div className="p-4 bg-slate-100 rounded-xl border border-slate-200">
              <h3 className="text-slate-700 font-bold text-sm mb-2">💡 ヒント</h3>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                ・スキャン済みの鮮明な画像を使用してください。<br/>
                ・PDFは1ページ目のみが解析対象となります。<br/>
                ・変換後、上部の「PDF出力」で保存できます。
              </p>
            </div>
          </div>

          <div className="lg:col-span-8 flex justify-center">
            {data ? (
              <TemplatePreview data={data} originalImage={originalImage} />
            ) : (
              <div className="no-print w-full bg-white border-2 border-dashed border-slate-200 rounded-3xl p-24 flex flex-col items-center justify-center text-slate-300">
                <div className="bg-slate-50 p-6 rounded-full mb-6">
                  <svg className="w-16 h-16 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-xl font-bold text-slate-400">変換後のプレビュー</p>
                <p className="text-sm mt-2">解析が完了するとここに新しい資料が表示されます</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="no-print mt-12 py-8 text-center text-slate-400 text-xs border-t bg-white">
        <p>© 2025 SORA株式会社 AI不動産ソリューション | マイソクAI v1.0</p>
      </footer>
    </div>
  );
};

export default App;
