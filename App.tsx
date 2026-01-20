
import React, { useState, useRef } from 'react';
import { extractAndTranslateMaisoku } from './services/geminiService';
import { Language, MaisokuData, ProcessingState } from './types';
import TemplatePreview from './components/TemplatePreview';

// Ensure PDF.js worker is loaded
const pdfjsLib = window['pdfjs-dist/build/pdf'];
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

const App: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [targetLang, setTargetLang] = useState<Language>(Language.CHINESE);
  const [data, setData] = useState<MaisokuData | null>(null);
  const [state, setState] = useState<ProcessingState>({ isProcessing: false, status: '待機中' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File) => {
    if (file.type === 'application/pdf') {
      setState({ isProcessing: true, status: 'PDFを画像に変換中...' });
      try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
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
        setState({ isProcessing: false, status: 'エラー', error: 'PDFの読み込みに失敗しました。' });
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
      setState({ isProcessing: false, status: 'エラー', error: '解析に失敗しました。画像の鮮明度やAPIキーを確認してください。' });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen">
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
              <p className="text-xs text-slate-400">日本の物件資料を多言語のプロフェッショナルな資料へ変換</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 no-print">
            <select 
              className="bg-slate-800 border-slate-700 text-sm rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none text-white"
              value={targetLang}
              onChange={(e) => setTargetLang(e.target.value as Language)}
            >
              <option value={Language.CHINESE}>中国語（繁体字）に翻訳</option>
              <option value={Language.ENGLISH}>英語に翻訳</option>
            </select>
            
            {data && (
              <button 
                onClick={handlePrint}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md font-medium transition flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                PDF出力 / 印刷
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
                <span className="bg-indigo-100 text-indigo-600 w-6 h-6 flex items-center justify-center rounded-full text-xs">1</span>
                元資料のアップロード
              </h2>
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:border-indigo-400 transition-colors">
                <input 
                  type="file" 
                  accept="image/*,application/pdf" 
                  onChange={handleFileUpload} 
                  className="hidden" 
                  id="file-upload" 
                  ref={fileInputRef}
                />
                <label htmlFor="file-upload" className="cursor-pointer group">
                  <svg className="w-12 h-12 mx-auto text-slate-300 group-hover:text-indigo-400 transition-colors mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <span className="text-slate-600 block font-medium">クリックしてファイルを選択</span>
                  <span className="text-slate-400 text-xs mt-1 block">画像 (JPG, PNG) または PDF 対応</span>
                </label>
              </div>
              {originalImage && (
                <div className="mt-4 p-2 bg-slate-50 border rounded-lg flex items-center gap-2">
                  <div className="w-10 h-10 bg-slate-200 rounded overflow-hidden">
                    <img src={originalImage} className="w-full h-full object-cover" />
                  </div>
                  <p className="text-xs text-slate-500 truncate">プレビュー準備完了</p>
                </div>
              )}
            </section>

            <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <h2 className="text-lg font-semibold mb-4 text-slate-800 flex items-center gap-2">
                <span className="bg-indigo-100 text-indigo-600 w-6 h-6 flex items-center justify-center rounded-full text-xs">2</span>
                翻訳・解析実行
              </h2>
              <button 
                onClick={processMaisoku}
                disabled={!originalImage || state.isProcessing}
                className={`w-full py-3 rounded-xl font-bold transition flex items-center justify-center gap-3 ${
                  !originalImage || state.isProcessing 
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                  : 'bg-slate-900 text-white hover:bg-black active:scale-[0.98]'
                }`}
              >
                {state.isProcessing ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    <span>{state.status}</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    <span>AI 変換スタート</span>
                  </>
                )}
              </button>
              
              {state.error && (
                <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">
                  {state.error}
                </div>
              )}
            </section>

            <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl">
              <h3 className="text-indigo-900 font-bold text-sm mb-2">使い方</h3>
              <ul className="text-xs text-indigo-700 space-y-2 leading-relaxed">
                <li>1. 日本語のマイソク（画像またはPDF）をアップロードします。</li>
                <li>2. AIが自動的にテキストを抽出し、指定言語へ翻訳します。</li>
                <li>3. 抽出された情報を元に、多言語用のテンプレートを生成します。</li>
                <li>4. 完成した資料はPDFとして保存・印刷が可能です。</li>
              </ul>
            </div>
          </div>

          <div className="lg:col-span-8 flex justify-center">
            {data ? (
              <TemplatePreview data={data} originalImage={originalImage} />
            ) : (
              <div className="no-print w-full bg-white border-2 border-dashed border-slate-200 rounded-3xl p-20 flex flex-col items-center justify-center text-slate-300">
                <svg className="w-20 h-20 mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-lg font-medium text-slate-400">変換結果プレビュー</p>
                <p className="text-sm">ファイルをアップロードするとここに結果が表示されます</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="no-print mt-12 py-8 bg-slate-50 border-t text-center text-slate-400 text-sm">
        <p>© 2025 SORA株式会社 AI不動産ソリューション</p>
      </footer>
    </div>
  );
};

export default App;
