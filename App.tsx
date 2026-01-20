
import React, { useState, useRef, useEffect } from 'react';
import { extractAndTranslateMaisoku } from './services/geminiService.ts';
import { Language, MaisokuData, ProcessingState } from './types.ts';
import TemplatePreview from './components/TemplatePreview.tsx';

const App: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [targetLang, setTargetLang] = useState<Language>(Language.CHINESE);
  const [data, setData] = useState<MaisokuData | null>(null);
  const [state, setState] = useState<ProcessingState>({ isProcessing: false, status: '待機中' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getPdfLib = () => {
    // @ts-ignore
    return window['pdfjs-dist/build/pdf'] || window['pdfjsLib'];
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
        setState({ isProcessing: false, status: 'エラー', error: 'PDFライブラリがロードされていません。' });
        return;
      }
      setState({ isProcessing: true, status: 'PDFを変換中...' });
      try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
        const page = await pdf.getPage(1);
        const viewport = page.getViewport({ scale: 2.0 });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        if (context) {
          await page.render({ canvasContext: context, viewport: viewport }).promise;
          setOriginalImage(canvas.toDataURL('image/jpeg', 0.8));
          setData(null);
          setState({ isProcessing: false, status: '待機中', error: undefined });
        }
      } catch (err) {
        setState({ isProcessing: false, status: 'エラー', error: 'PDFの読み込み失敗' });
      }
    } else {
      const reader = new FileReader();
      reader.onload = () => { 
        setOriginalImage(reader.result as string); 
        setData(null); 
        setState({ isProcessing: false, status: '待機中', error: undefined });
      };
      reader.readAsDataURL(file);
    }
  };

  const processMaisoku = async () => {
    if (!originalImage) return;
    setState({ isProcessing: true, status: 'AI解析中...' });
    try {
      const base64Data = originalImage.split(',')[1];
      const result = await extractAndTranslateMaisoku(base64Data, targetLang);
      setData(result);
      setState({ isProcessing: false, status: '完了' });
    } catch (err: any) {
      console.error(err);
      setState({ 
        isProcessing: false, 
        status: 'エラー', 
        error: err.message || '解析失敗。画像の鮮明さや設定を確認してください。' 
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="no-print bg-slate-900 text-white p-4 shadow-md">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-1.5 rounded">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
            </div>
            <h1 className="font-bold text-lg">マイソク AI 翻訳</h1>
          </div>
          <div className="flex gap-2">
            <select 
              className="bg-slate-800 text-xs rounded px-2 py-1 outline-none border border-slate-700"
              value={targetLang}
              onChange={(e) => setTargetLang(e.target.value as Language)}
            >
              <option value={Language.CHINESE}>中文 (繁體)</option>
              <option value={Language.ENGLISH}>English</option>
            </select>
            {data && <button onClick={() => window.print()} className="bg-indigo-600 text-xs px-3 py-1 rounded hover:bg-indigo-500 transition-colors">印刷 / 保存</button>}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 space-y-4 no-print">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <h2 className="font-bold mb-3 flex items-center gap-2 text-slate-700 text-sm uppercase tracking-wider">
              <span className="w-5 h-5 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-[10px]">1</span>
              資料をアップロード
            </h2>
            <div 
              className="border-2 border-dashed border-slate-200 rounded-lg p-6 text-center cursor-pointer hover:bg-slate-50 transition-all hover:border-indigo-300"
              onClick={() => fileInputRef.current?.click()}
            >
              <input type="file" accept="image/*,application/pdf" onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])} className="hidden" ref={fileInputRef} />
              <svg className="w-10 h-10 mx-auto text-slate-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
              <p className="text-slate-400 text-sm font-medium">画像(JPG/PNG)またはPDF</p>
            </div>
            {originalImage && (
              <div className="mt-3 relative group">
                <img src={originalImage} className="w-full h-32 object-cover rounded border shadow-inner" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded">
                   <p className="text-white text-xs font-bold">クリックで変更</p>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <h2 className="font-bold mb-3 flex items-center gap-2 text-slate-700 text-sm uppercase tracking-wider">
              <span className="w-5 h-5 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-[10px]">2</span>
              AI 解析・翻訳
            </h2>
            <button 
              onClick={processMaisoku}
              disabled={!originalImage || state.isProcessing}
              className={`w-full py-3 rounded-lg font-bold transition-all active:scale-95 shadow-lg shadow-indigo-200 ${
                state.isProcessing 
                ? 'bg-slate-100 text-slate-400' 
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
              } disabled:opacity-50 disabled:shadow-none`}
            >
              {state.isProcessing ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-slate-400" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  {state.status}
                </span>
              ) : 'AI 翻訳を実行する'}
            </button>
            {state.error && (
              <div className="mt-3 p-3 bg-red-50 border border-red-100 rounded-lg">
                <p className="text-red-600 text-[11px] leading-tight break-all font-medium">
                  {state.error}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-8 flex justify-center">
          {data ? (
            <TemplatePreview data={data} originalImage={originalImage} />
          ) : (
            <div className="no-print w-full bg-white border border-slate-200 rounded-2xl p-12 md:p-24 flex flex-col items-center justify-center text-slate-300 text-center">
              <div className="bg-slate-50 p-6 rounded-full mb-6">
                <svg className="w-12 h-12 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              </div>
              <p className="font-bold text-slate-400 text-lg">プレビューエリア</p>
              <p className="text-sm mt-2 max-w-xs">資料をアップロードして翻訳を開始すると、ここに生成されたマイソクが表示されます。</p>
            </div>
          )}
        </div>
      </main>
      <footer className="no-print p-6 text-center text-[10px] text-slate-400 border-t bg-white mt-auto">
        <p>© 2025 SORA AI Real Estate Solution | Japanese Property Flyer Translator</p>
      </footer>
    </div>
  );
};

export default App;
