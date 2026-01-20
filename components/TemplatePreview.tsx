
import React, { useMemo } from 'react';
import { MaisokuData, Language } from '../types';

interface TemplatePreviewProps {
  data: MaisokuData;
  originalImage: string | null;
  language: Language;
}

const TemplatePreview: React.FC<TemplatePreviewProps> = ({ data, originalImage, language }) => {
  const isChinese = language === Language.CHINESE;
  
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
    features: isChinese ? "物業特色" : "Key Features",
    originalRef: isChinese ? "參考原圖" : "Original"
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
      <div className="print-area flex flex-col bg-white border border-slate-300">
        
        {/* PREMIUM HEADER */}
        <div className="bg-[#1e293b] text-white px-10 py-6 flex justify-between items-center shrink-0 border-b-4 border-indigo-500">
          <div className="flex-1">
            <h1 className="text-2xl font-black tracking-tight leading-tight uppercase">{data.propertyName || "PROPERTY INFORMATION"}</h1>
            <p className="text-[9px] opacity-40 font-bold tracking-[0.3em] mt-1">SORA REAL ESTATE INVESTMENT PORTFOLIO</p>
          </div>
          <div className="text-right border-l border-white/10 pl-10">
            <p className="text-[10px] opacity-70 font-black mb-1 uppercase tracking-widest">{labels.price}</p>
            <p className="text-4xl font-black text-yellow-400 tabular-nums">{data.price}</p>
          </div>
        </div>

        {/* CONTENT AREA */}
        <div className="flex-1 p-10 grid grid-cols-12 gap-10 overflow-hidden">
          
          {/* LEFT: IMAGE & DESC */}
          <div className="col-span-5 flex flex-col gap-6">
            <div className="aspect-[4/3] bg-slate-100 border border-slate-200 relative rounded-lg overflow-hidden flex items-center justify-center shadow-inner group">
              {originalImage ? (
                /* Object-fit contain ensures the whole image is visible; can use cover if you want full bleed */
                <img src={originalImage} alt="Property" className="w-full h-full object-contain" />
              ) : (
                <div className="text-slate-300 font-black text-xs uppercase">Photo Area</div>
              )}
            </div>

            <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 flex-1">
              <h3 className="text-[10px] font-black text-indigo-900 mb-3 uppercase tracking-widest border-l-4 border-indigo-500 pl-3">{labels.description}</h3>
              <p className="text-[11px] leading-relaxed text-slate-600 font-medium italic mb-6">"{data.description}"</p>
              
              <h3 className="text-[10px] font-black text-indigo-900 mb-3 uppercase tracking-widest border-l-4 border-indigo-500 pl-3">{labels.facilities}</h3>
              <div className="text-[10px] text-slate-700 leading-relaxed font-medium">
                {data.facilities || "-"}
              </div>
            </div>
          </div>

          {/* RIGHT: SPECS */}
          <div className="col-span-7 flex flex-col gap-6">
            <div className="border-t-2 border-slate-900">
              {tableRows.map((row, ridx) => (
                <div key={ridx} className="flex min-h-[36px]">
                  {row.map((cell, cidx) => (
                    <div key={cidx} className={`flex border-b border-slate-200 ${cell.span === 2 ? 'w-full' : 'w-1/2'}`}>
                      <div className="w-24 bg-slate-50 text-[9px] font-black flex items-center px-4 text-slate-400 uppercase shrink-0 border-r border-slate-100">
                        {cell.l}
                      </div>
                      <div className={`flex-1 flex items-center px-4 py-2 text-[11px] font-bold ${cell.h ? 'text-indigo-600' : 'text-slate-900'}`}>
                        {cell.v || "-"}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            <div className="flex-1 bg-white flex flex-col">
              <h3 className="text-[11px] font-black text-slate-900 mb-4 uppercase tracking-[0.2em] flex items-center gap-3">
                <span className="w-8 h-[2px] bg-indigo-500"></span> {labels.features}
              </h3>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                {(data.features || []).map((f, i) => (
                  <div key={i} className="text-[10px] flex items-center gap-2 text-slate-600 font-bold p-2 bg-slate-50 rounded border-l-2 border-indigo-200">
                    <span className="text-indigo-500 text-[6px]">●</span> {f}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* MODERN CLEAN FOOTER (NO TABLE) */}
        <div className="bg-[#1e293b] text-white px-10 py-8 flex justify-between items-end shrink-0 mt-auto border-t border-white/10">
          
          {/* Brand/Identity */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-600 text-white font-black flex items-center justify-center text-2xl rounded shadow-lg">S</div>
              <div>
                <p className="font-black text-xl tracking-tight leading-none text-white">{companyInfo.name}</p>
                <p className="text-[9px] text-indigo-400 mt-1 uppercase tracking-widest font-black">{companyInfo.license}</p>
              </div>
            </div>
            <div className="text-[9px] text-slate-400 font-medium space-y-0.5">
              <p>{companyInfo.assoc}</p>
              <p>{companyInfo.branch}</p>
            </div>
          </div>

          {/* Details & Contact */}
          <div className="flex gap-10">
            <div className="text-right space-y-4">
              <div className="space-y-0.5">
                <p className="text-[8px] text-indigo-400 font-black tracking-widest uppercase">Office Address</p>
                <p className="text-[11px] font-bold text-slate-200">〒{companyInfo.zip} {companyInfo.addr1}</p>
                <p className="text-[11px] font-bold text-slate-200">{companyInfo.addr2}</p>
              </div>
              <div className="flex gap-6 justify-end">
                <div>
                  <p className="text-[8px] text-indigo-400 font-black tracking-widest uppercase">Phone</p>
                  <p className="text-[12px] font-black text-white">{companyInfo.tel}</p>
                </div>
                <div>
                  <p className="text-[8px] text-indigo-400 font-black tracking-widest uppercase">Fax</p>
                  <p className="text-[12px] font-black text-white">{companyInfo.fax}</p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col justify-end border-l border-white/10 pl-10">
              <p className="text-[8px] text-indigo-400 font-black tracking-widest uppercase mb-1">Web & Mail</p>
              <p className="text-[11px] font-black text-white">{companyInfo.web}</p>
              <p className="text-[11px] font-bold text-indigo-300">{companyInfo.email}</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default TemplatePreview;
