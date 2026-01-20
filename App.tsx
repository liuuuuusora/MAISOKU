
import React, { useState, useRef, useEffect } from 'react';
import { extractAndTranslateMaisoku } from './services/geminiService.ts';
import { Language, MaisokuData, ProcessingState } from './types.ts';
import TemplatePreview from './components/TemplatePreview.tsx';

const App: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [propertyImage, setPropertyImage] = useState<string | null>(null);
  const [targetLang, setTargetLang] = useState<Language>(Language.CHINESE);
  const [data, setData] = useState<MaisokuData | null>(null);
  const [state, setState] = useState<ProcessingState>({ isProcessing: false, status: '待機中' });
  const [cooldown, setCooldown] = useState(0);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const propertyImgRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

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

  const handleSourceFile = async (file: File) => {
    if (file.type === 'application/pdf') {
      const pdfjs = getPdfLib();
      if (!pdfjs) {
        setState({ isProcessing: false, status: '錯誤', error: 'PDF 函式庫未載入。' });
        return;
      }
      setState({ isProcessing: true, status: 'PDF 轉換中...' });
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
        setState({ isProcessing: false, status: '錯誤', error: 'PDF 讀取失敗' });
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

  const handlePropertyImage = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      setPropertyImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const processMaisoku = async () => {
    if (!originalImage) return;
    setState({ isProcessing: true, status: 'AI 分析中...' });
    try {
      const base64Data = originalImage.split(',')[1];
      const result = await extractAndTranslateMaisoku(base64Data, targetLang);
      setData(result);
      setState({ isProcessing: false, status: '完成' });
    } catch (err: any) {
      console.error(err);
      setState({ 
        isProcessing: false, 
        status: '失敗', 
        error: err.message 
      });
      if (err.message.includes("額度")) {
        setCooldown(60); 
      }
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
            <h1 className="font-bold text-lg">邁速 (Maisoku) AI 翻譯</h1>
          </div>
          <div className="flex gap-2">
            <select 
              className="bg-slate-800 text-xs rounded px-2 py-1 outline-none border border-slate-700 cursor-pointer"
              value={targetLang}
              onChange={(e) => setTargetLang(e.target.value as Language)}
            >
              <option value={Language.CHINESE}>切換至 中文 (繁體)</option>
              <option value={Language.ENGLISH}>Switch to English</option>
            </select>
            {data && <button onClick={() => window.print()} className="bg-indigo-600 text-xs px-3 py-1 rounded hover:bg-indigo-500 transition-colors">列印 A4 橫向</button>}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-[1400px] mx-auto w-full p-4 flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 no-print">
          {/* STEP 1: Source Document */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col">
            <h2 className="font-bold mb-3 flex items-center gap-2 text-slate-700 text-xs uppercase tracking-wider">
              <span className="w-5 h-5 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-[10px]">1</span>
              上傳日文原始檔 (PDF/JPG)
            </h2>
            <div 
              className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-slate-50 transition-all flex-1 flex flex-col justify-center ${originalImage ? 'border-indigo-200 bg-indigo-50/30' : 'border-slate-200'}`}
              onClick={() => fileInputRef.current?.click()}
            >
              <input type="file" accept="image/*,application/pdf" onChange={(e) => e.target.files?.[0] && handleSourceFile(e.target.files[0])} className="hidden" ref={fileInputRef} />
              {originalImage ? (
                <div className="flex flex-col items-center">
                  <img src={originalImage} className="h-16 w-auto object-contain mb-2 rounded border shadow-sm" />
                  <p className="text-indigo-600 text-[10px] font-bold underline">更換檔案</p>
                </div>
              ) : (
                <p className="text-slate-400 text-[11px]">點擊上傳日文傳單</p>
              )}
            </div>
          </div>

          {/* STEP 2: Optional Clean Image */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col">
            <h2 className="font-bold mb-3 flex items-center gap-2 text-slate-700 text-xs uppercase tracking-wider">
              <span className="w-5 h-5 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-[10px]">2</span>
              上傳純淨物業圖片 (非必填)
            </h2>
            <div 
              className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-slate-50 transition-all flex-1 flex flex-col justify-center ${propertyImage ? 'border-emerald-200 bg-emerald-50/30' : 'border-slate-200'}`}
              onClick={() => propertyImgRef.current?.click()}
            >
              <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && handlePropertyImage(e.target.files[0])} className="hidden" ref={propertyImgRef} />
              {propertyImage ? (
                <div className="flex flex-col items-center">
                  <img src={propertyImage} className="h-16 w-auto object-contain mb-2 rounded border shadow-sm" />
                  <p className="text-emerald-600 text-[10px] font-bold underline">更換圖片</p>
                </div>
              ) : (
                <p className="text-slate-400 text-[11px]">上傳更清晰的照片取代傳單圖</p>
              )}
            </div>
          </div>

          {/* ACTION BUTTON */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center">
            <button 
              onClick={processMaisoku}
              disabled={!originalImage || state.isProcessing || cooldown > 0}
              className={`w-full py-4 rounded-lg font-black text-sm uppercase tracking-widest transition-all shadow-lg ${
                state.isProcessing || cooldown > 0
                ? 'bg-slate-100 text-slate-400 shadow-none' 
                : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:-translate-y-0.5 active:translate-y-0'
              }`}
            >
              {cooldown > 0 ? `冷卻中 (${cooldown}s)` : state.isProcessing ? `正在翻譯...` : '生成翻譯件'}
            </button>
            {state.error && <p className="text-red-500 text-[10px] mt-3 text-center font-bold px-2">{state.error}</p>}
          </div>
        </div>

        <div className="flex-1 flex justify-center items-start overflow-x-auto pb-12">
          {data ? (
            <TemplatePreview 
              data={data} 
              originalImage={propertyImage || originalImage} 
              language={targetLang} 
            />
          ) : (
            <div className="no-print w-full max-w-4xl bg-white border border-slate-200 rounded-2xl py-32 flex flex-col items-center justify-center text-slate-300 text-center shadow-sm">
              <div className="bg-slate-50 p-6 rounded-full mb-6">
                <svg className="w-12 h-12 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              </div>
              <p className="font-black text-slate-400 uppercase tracking-widest text-sm">尚未生成翻譯預覽</p>
              <p className="text-xs text-slate-300 mt-2">請完成上方上傳步驟並點擊生成按鈕</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
