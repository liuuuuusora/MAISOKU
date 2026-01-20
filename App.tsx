
import React, { useState, useCallback } from 'react';
import { extractAndTranslateMaisoku } from './services/geminiService';
import { Language, MaisokuData, ProcessingState } from './types';
import TemplatePreview from './components/TemplatePreview';

const App: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [targetLang, setTargetLang] = useState<Language>(Language.CHINESE);
  const [data, setData] = useState<MaisokuData | null>(null);
  const [state, setState] = useState<ProcessingState>({ isProcessing: false, status: 'Idle' });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setOriginalImage(reader.result as string);
      setData(null);
    };
    reader.readAsDataURL(file);
  };

  const processMaisoku = async () => {
    if (!originalImage) return;

    setState({ isProcessing: true, status: 'AI is analyzing the Maisoku...' });
    try {
      // Remove data:image/jpeg;base64, prefix
      const base64Data = originalImage.split(',')[1];
      const result = await extractAndTranslateMaisoku(base64Data, targetLang);
      setData(result);
      setState({ isProcessing: false, status: 'Completed' });
    } catch (err) {
      console.error(err);
      setState({ isProcessing: false, status: 'Error', error: 'Failed to process. Please check your image quality or API key.' });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen">
      {/* Header - Hidden on Print */}
      <header className="no-print bg-slate-900 text-white p-6 shadow-lg">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-500 p-2 rounded-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold">Maisoku AI Translator</h1>
              <p className="text-xs text-slate-400">Transform Japanese property flyers into professional listings</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 no-print">
            <select 
              className="bg-slate-800 border-slate-700 text-sm rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
              value={targetLang}
              onChange={(e) => setTargetLang(e.target.value as Language)}
            >
              <option value={Language.CHINESE}>Translate to Chinese</option>
              <option value={Language.ENGLISH}>Translate to English</option>
            </select>
            
            {data && (
              <button 
                onClick={handlePrint}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md font-medium transition flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                Export PDF
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Controls - Hidden on Print */}
          <div className="lg:col-span-4 space-y-6 no-print">
            <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <h2 className="text-lg font-semibold mb-4 text-slate-800 flex items-center gap-2">
                <span className="bg-indigo-100 text-indigo-600 w-6 h-6 flex items-center justify-center rounded-full text-xs">1</span>
                Upload Original Maisoku
              </h2>
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:border-indigo-400 transition-colors">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileUpload} 
                  className="hidden" 
                  id="file-upload" 
                />
                <label htmlFor="file-upload" className="cursor-pointer group">
                  <svg className="w-12 h-12 mx-auto text-slate-300 group-hover:text-indigo-400 transition-colors mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-slate-600 block font-medium">Click to select flyer</span>
                  <span className="text-slate-400 text-xs mt-1 block">Supports JPG, PNG (Max 5MB)</span>
                </label>
              </div>
              {originalImage && (
                <div className="mt-4 p-2 bg-slate-50 border rounded-lg">
                  <p className="text-xs text-slate-500 truncate">{originalImage.substring(0, 50)}...</p>
                </div>
              )}
            </section>

            <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <h2 className="text-lg font-semibold mb-4 text-slate-800 flex items-center gap-2">
                <span className="bg-indigo-100 text-indigo-600 w-6 h-6 flex items-center justify-center rounded-full text-xs">2</span>
                Translate & Generate
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
                    <span>Start AI Conversion</span>
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
              <h3 className="text-indigo-900 font-bold text-sm mb-2">Instructions</h3>
              <ul className="text-xs text-indigo-700 space-y-2 leading-relaxed">
                <li>1. Upload a Japanese Maisoku (property flyer).</li>
                <li>2. Our AI will automatically perform OCR and translation.</li>
                <li>3. Property features and photos will be extracted.</li>
                <li>4. A new PDF-ready flyer with SORA branding will be created.</li>
              </ul>
            </div>
          </div>

          {/* Result / Preview Area */}
          <div className="lg:col-span-8 flex justify-center">
            {data ? (
              <TemplatePreview data={data} originalImage={originalImage} />
            ) : (
              <div className="no-print w-full bg-white border-2 border-dashed border-slate-200 rounded-3xl p-20 flex flex-col items-center justify-center text-slate-300">
                <svg className="w-20 h-20 mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-lg font-medium">New Flyer Preview</p>
                <p className="text-sm">Upload and convert to see the generated result here</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Persistent Footer - Hidden on Print */}
      <footer className="no-print mt-12 py-8 bg-slate-50 border-t text-center text-slate-400 text-sm">
        <p>© 2025 SORA株式会社 AI Real Estate Solutions</p>
      </footer>
    </div>
  );
};

export default App;
