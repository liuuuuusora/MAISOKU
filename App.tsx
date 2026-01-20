
import React, { useState, useRef, useEffect } from 'react';
import { extractAndTranslateMaisoku } from './services/geminiService.ts';
import { Language, MaisokuData, ProcessingState } from './types.ts';
import TemplatePreview from './components/TemplatePreview.tsx';

const App: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [propertyImg1, setPropertyImg1] = useState<string | null>(null);
  const [propertyImg2, setPropertyImg2] = useState<string | null>(null);
  const [targetLang, setTargetLang] = useState<Language>(Language.CHINESE);
  const [data, setData] = useState<MaisokuData | null>(null);
  const [state, setState] = useState<ProcessingState>({ isProcessing: false, status: '待機中' });
  const [cooldown, setCooldown] = useState(0);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pImgRef1 = useRef<HTMLInputElement>(null);
  const pImgRef2 = useRef<HTMLInputElement>(null);

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

  const handleExtraImage = (file: File, setter: (val: string | null) => void) => {
    const reader = new FileReader();
    reader.onload = () => setter(reader.result as string);
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
      setState({ isProcessing: false, status: '失敗', error: err.message });
      if (err.message.includes("額度")) setCooldown(60); 
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
            <h1 className="font-bold text-lg tracking-tight">SORA AI <span className="text-indigo-400">邁速翻譯</span></h1>
          </div>
          <div className="flex gap-3">
            <select 
              className="bg-slate-800 text-xs rounded px-3 py-1.5 outline-none border border-slate-700 cursor-pointer focus:ring-1 ring-indigo-500 transition-all"
              value={targetLang}
              onChange={(e) => setTargetLang(e.target.value as Language)}
            >
              <option value={Language.CHINESE}>中文 (繁體)</option>
              <option value={Language.ENGLISH}>English</option>
            </select>
            {data && <button onClick={() => window.print()} className="bg-indigo-600 text-xs px-4 py-1.5 rounded font-bold hover:bg-indigo-500 transition-all shadow-lg active:scale-95">下載 PDF / 列印</button>}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-[1600px] mx-auto w-full p-6 flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 no-print">
          {/* STEP 1: Source */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col">
            <h2 className="font-bold mb-3 flex items-center gap-2 text-slate-700 text-[10px] uppercase tracking-wider">
              <span className="w-5 h-5 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-black">1</span>
              日文原始傳單
            </h2>
            <div 
              className={`border-2 border-dashed rounded-lg p-3 text-center cursor-pointer hover:bg-slate-50 transition-all flex-1 flex flex-col justify-center min-h-[100px] ${originalImage ? 'border-indigo-200 bg-indigo-50/20' : 'border-slate-200'}`}
              onClick={() => fileInputRef.current?.click()}
            >
              <input type="file" accept="image/*,application/pdf" onChange={(e) => e.target.files?.[0] && handleSourceFile(e.target.files[0])} className="hidden" ref={fileInputRef} />
              {originalImage ? (
                <div className="flex flex-col items-center">
                  <img src={originalImage} className="h-12 w-auto object-contain mb-1 rounded border shadow-sm" />
                  <p className="text-indigo-600 text-[10px] font-bold">已載入</p>
                </div>
              ) : (
                <p className="text-slate-400 text-[10px]">點擊上傳原始檔</p>
              )}
            </div>
          </div>

          {/* STEP 2: Photo 1 */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col">
            <h2 className="font-bold mb-3 flex items-center gap-2 text-slate-700 text-[10px] uppercase tracking-wider">
              <span className="w-5 h-5 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center font-black">2</span>
              物業照片 1
            </h2>
            <div 
              className={`border-2 border-dashed rounded-lg p-3 text-center cursor-pointer hover:bg-slate-50 transition-all flex-1 flex flex-col justify-center min-h-[100px] ${propertyImg1 ? 'border-emerald-200 bg-emerald-50/20' : 'border-slate-200'}`}
              onClick={() => pImgRef1.current?.click()}
            >
              <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && handleExtraImage(e.target.files[0], setPropertyImg1)} className="hidden" ref={pImgRef1} />
              {propertyImg1 ? (
                <div className="flex flex-col items-center">
                  <img src={propertyImg1} className="h-12 w-auto object-contain mb-1 rounded border shadow-sm" />
                  <p className="text-emerald-600 text-[10px] font-bold">已上傳</p>
                </div>
              ) : (
                <p className="text-slate-400 text-[10px]">上傳主要照片</p>
              )}
            </div>
          </div>

          {/* STEP 3: Photo 2 */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col">
            <h2 className="font-bold mb-3 flex items-center gap-2 text-slate-700 text-[10px] uppercase tracking-wider">
              <span className="w-5 h-5 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center font-black">3</span>
              物業照片 2
            </h2>
            <div 
              className={`border-2 border-dashed rounded-lg p-3 text-center cursor-pointer hover:bg-slate-50 transition-all flex-1 flex flex-col justify-center min-h-[100px] ${propertyImg2 ? 'border-amber-200 bg-amber-50/20' : 'border-slate-200'}`}
              onClick={() => pImgRef2.current?.click()}
            >
              <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && handleExtraImage(e.target.files[0], setPropertyImg2)} className="hidden" ref={pImgRef2} />
              {propertyImg2 ? (
                <div className="flex flex-col items-center">
                  <img src={propertyImg2} className="h-12 w-auto object-contain mb-1 rounded border shadow-sm" />
                  <p className="text-amber-600 text-[10px] font-bold">已上傳</p>
                </div>
              ) : (
                <p className="text-slate-400 text-[10px]">上傳次要照片</p>
              )}
            </div>
          </div>

          {/* ACTION */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center">
            <button 
              onClick={processMaisoku}
              disabled={!originalImage || state.isProcessing || cooldown > 0}
              className={`w-full py-4 rounded-lg font-black text-xs uppercase tracking-[0.2em] transition-all shadow-md ${
                state.isProcessing || cooldown > 0 ? 'bg-slate-100 text-slate-400' : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95'
              }`}
            >
              {cooldown > 0 ? `冷卻 (${cooldown}s)` : state.isProcessing ? `AI 分析中...` : '開始翻譯生成'}
            </button>
          </div>
        </div>

        <div className="flex-1 flex justify-center items-start overflow-x-auto overflow-y-visible py-4">
          {data ? (
            <TemplatePreview 
              data={data} 
              originalImage={originalImage}
              extraImages={[propertyImg1, propertyImg2].filter(Boolean) as string[]}
              language={targetLang} 
            />
          ) : (
            <div className="no-print w-full max-w-5xl bg-white border border-slate-200 rounded-3xl py-40 flex flex-col items-center justify-center text-slate-300 shadow-sm">
              <div className="p-8 bg-slate-50 rounded-full mb-8">
                <svg className="w-16 h-16 opacity-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              </div>
              <p className="font-black text-slate-400 uppercase tracking-widest text-sm italic">Ready to translate your Maisoku</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
