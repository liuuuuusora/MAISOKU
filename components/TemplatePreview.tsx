
import React, { useMemo } from 'react';
import { MaisokuData, Language } from '../types';

interface TemplatePreviewProps {
  data: MaisokuData;
  originalImage: string | null; // This is the flyer
  extraImages: string[]; // These are user-uploaded clean photos
  language: Language;
}

const TemplatePreview: React.FC<TemplatePreviewProps> = ({ data, originalImage, extraImages, language }) => {
  const isChinese = language === Language.CHINESE;
  
  // Decide which images to show. Priority: Extra 1, Extra 2, then Original Flyer
  const displayImages = useMemo(() => {
    let imgs = [...extraImages];
    if (imgs.length === 0 && originalImage) imgs.push(originalImage);
    if (imgs.length === 1 && originalImage && extraImages.length > 0) imgs.push(originalImage);
    return imgs.slice(0, 2);
  }, [extraImages, originalImage]);

  const labels = useMemo(() => ({
    price: isChinese ? "銷售價格" : "Listing Price",
    location: isChinese ? "所在地" : "Location",
    access: isChinese ? "交通詳情" : "Access",
    layout: isChinese ? "格局" : "Layout",
    size: isChinese ? "面積" : "Size",
    built: isChinese ? "建築年份" : "Built Year",
    management: isChinese ? "管理費" : "Management Fee",
    repair: isChinese ? "修繕積立金" : "Repair Fund",
    coverage: isChinese ? "建蔽率" : "Coverage",
    far: isChinese ? "容積率" : "FAR",
    floor: isChinese ? "樓層" : "Floor",
    restrictions: isChinese ? "建物限制" : "Restrictions",
    facilities: isChinese ? "物業設備" : "Facilities",
    description: isChinese ? "物業簡介" : "Description",
    features: isChinese ? "物業特色" : "Key Features"
  }), [isChinese]);

  const companyInfo = useMemo(() => ({
    name: isChinese ? "SORA 株式會社" : "SORA Co., Ltd.",
    zip: "540-0058",
    addr1: isChinese ? "大阪市西區京町堀 1-16-8" : "1-16-8 Kyomachibori, Nishi-ku, Osaka",
    addr2: "RE-021 10F",
    tel: "06-4400-7569",
    fax: "06-7635-8611",
    license: isChinese ? "大阪府知事 (1) 第 65866 號" : "Osaka Governor (1) No. 65866",
    assoc: isChinese ? "(公社) 全國宅地建物取引業保證協會" : "National Real Estate Transaction Guarantee Association",
    branch: isChinese ? "(一社) 大阪府宅地建物取引業協會 中央支部" : "Osaka Real Estate Transaction Association, Central Branch",
    web: "www.sora-jp.net",
    email: "info@sora-jp.net"
  }), [isChinese]);

  const tableRows = [
    [ { l: labels.location, v: data.location, span: 2 } ],
    [ { l: labels.access, v: data.access, span: 2 } ],
    [ { l: labels.layout, v: data.layout, h: true }, { l: labels.size, v: data.size } ],
    [ { l: labels.built, v: data.builtYear }, { l: labels.floor, v: data.floor } ],
    [ { l: labels.coverage, v: data.coverageRatio }, { l: labels.far, v: data.floorAreaRatio } ],
    [ { l: labels.management, v: data.managementFee }, { l: labels.repair, v: data.repairFund } ],
    [ { l: labels.restrictions, v: data.restrictions, span: 2 } ],
  ];

  return (
    <div className="preview-scaler-container">
      {/* Strict A4 dimensions for PDF stability */}
      <div className="print-area flex flex-col bg-white border border-slate-100 shadow-2xl overflow-hidden relative" style={{ boxSizing: 'border-box' }}>
        
        {/* HEADER: COMPACT */}
        <div className="bg-slate-50 px-10 py-5 flex justify-between items-center shrink-0 border-b border-slate-200 h-[85px]">
          <div className="flex-1 border-l-4 border-indigo-600 pl-6">
            <h1 className="text-xl font-black tracking-tight text-slate-800 uppercase leading-none truncate max-w-[600px]">{data.propertyName || "PROPERTY INFORMATION"}</h1>
            <p className="text-[8px] text-slate-400 font-bold tracking-[0.2em] mt-1.5">PROPERTY INVESTMENT PORTFOLIO BY SORA</p>
          </div>
          <div className="text-right">
            <p className="text-[8px] text-slate-400 font-black mb-0.5 uppercase tracking-widest">{labels.price}</p>
            <p className="text-3xl font-black text-indigo-600 tabular-nums">{data.price}</p>
          </div>
        </div>

        {/* CONTENT AREA: 1:1 BALANCE */}
        <div className="flex-1 p-8 grid grid-cols-2 gap-8 overflow-hidden bg-white">
          
          {/* LEFT: TWO IMAGES & DESC */}
          <div className="flex flex-col gap-5 overflow-hidden">
            {/* Double Image Grid */}
            <div className="grid grid-cols-2 gap-3 h-[220px]">
              {displayImages.map((img, idx) => (
                <div key={idx} className="bg-slate-50 border border-slate-100 rounded-lg overflow-hidden flex items-center justify-center shadow-sm">
                  <img src={img} alt="Property" className="w-full h-full object-contain" />
                </div>
              ))}
              {displayImages.length < 2 && (
                <div className="bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center">
                  <span className="text-[10px] text-slate-200 font-bold uppercase tracking-widest">No Image</span>
                </div>
              )}
            </div>

            <div className="flex-1 flex flex-col gap-5 overflow-hidden">
              <section>
                <h3 className="text-[9px] font-black text-slate-400 mb-1.5 uppercase tracking-widest flex items-center gap-2">
                  <span className="w-3 h-[1px] bg-slate-200"></span> {labels.description}
                </h3>
                <p className="text-[10px] leading-relaxed text-slate-600 font-medium italic line-clamp-3">"{data.description}"</p>
              </section>
              
              <section className="flex-1 overflow-hidden">
                <h3 className="text-[9px] font-black text-slate-400 mb-1.5 uppercase tracking-widest flex items-center gap-2">
                  <span className="w-3 h-[1px] bg-slate-200"></span> {labels.facilities}
                </h3>
                <div className="text-[9px] text-slate-500 leading-normal font-semibold overflow-hidden line-clamp-5">
                  {data.facilities || "-"}
                </div>
              </section>
            </div>
          </div>

          {/* RIGHT: SPECS TABLE & FEATURES */}
          <div className="flex flex-col gap-6 overflow-hidden">
            <div className="border border-slate-100 rounded-lg overflow-hidden shadow-sm shrink-0">
              {tableRows.map((row, ridx) => (
                <div key={ridx} className="flex min-h-[34px]">
                  {row.map((cell, cidx) => (
                    <div key={cidx} className={`flex border-b border-slate-100 ${cell.span === 2 ? 'w-full' : 'w-1/2'} ${ridx === tableRows.length - 1 ? 'border-b-0' : ''}`}>
                      <div className="w-20 bg-slate-50/80 text-[8px] font-black flex items-center px-3 text-slate-400 uppercase shrink-0 border-r border-slate-100">
                        {cell.l}
                      </div>
                      <div className={`flex-1 flex items-center px-3 py-1.5 text-[10px] font-bold truncate ${cell.h ? 'text-indigo-600' : 'text-slate-700'}`}>
                        {cell.v || "-"}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            <div className="flex-1 flex flex-col overflow-hidden">
              <h3 className="text-[9px] font-black text-slate-400 mb-3 uppercase tracking-[0.2em] flex items-center gap-3">
                <span className="w-6 h-[1px] bg-indigo-500"></span> {labels.features}
              </h3>
              <div className="grid grid-cols-2 gap-2 overflow-hidden">
                {(data.features || []).slice(0, 8).map((f, i) => (
                  <div key={i} className="text-[9px] flex items-center gap-2 text-slate-600 font-bold p-2 bg-slate-50/50 rounded border border-slate-100 truncate">
                    <span className="text-indigo-400 text-[6px]">●</span> {f}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* CORPORATE FOOTER: LIGHT & STABLE AT BOTTOM */}
        <div className="bg-slate-50 border-t border-slate-200 px-10 py-6 grid grid-cols-3 gap-8 shrink-0 h-[120px] items-center">
          
          {/* Identity */}
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-white border border-slate-200 text-indigo-600 font-black flex items-center justify-center text-xl rounded-lg shadow-sm shrink-0">S</div>
            <div className="overflow-hidden">
              <p className="font-black text-base tracking-tight leading-tight text-slate-800 truncate">{companyInfo.name}</p>
              <p className="text-[8px] text-indigo-500 font-black tracking-widest uppercase mt-0.5 truncate">{companyInfo.license}</p>
            </div>
          </div>

          {/* Address */}
          <div className="border-x border-slate-200 px-6 flex flex-col justify-center gap-0.5 h-full">
            <p className="text-[7px] text-slate-300 font-black tracking-widest uppercase mb-0.5">Location</p>
            <p className="text-[10px] font-bold text-slate-600 truncate">〒{companyInfo.zip} {companyInfo.addr1}</p>
            <p className="text-[10px] font-bold text-slate-600 truncate">{companyInfo.addr2}</p>
          </div>

          {/* Contact */}
          <div className="flex flex-col justify-center h-full pl-2">
            <div className="flex justify-between mb-2">
              <div>
                <p className="text-[7px] text-slate-300 font-black tracking-widest uppercase">Phone</p>
                <p className="text-[10px] font-black text-slate-700">{companyInfo.tel}</p>
              </div>
              <div className="text-right">
                <p className="text-[7px] text-slate-300 font-black tracking-widest uppercase">Fax</p>
                <p className="text-[10px] font-black text-slate-700">{companyInfo.fax}</p>
              </div>
            </div>
            <div className="pt-1.5 border-t border-slate-100 flex justify-between items-center">
              <p className="text-[9px] font-bold text-indigo-600">{companyInfo.web}</p>
              <p className="text-[9px] font-bold text-slate-400">{companyInfo.email}</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default TemplatePreview;
