
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

  // Company Information based on provided image
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
      <div className="print-area flex flex-col bg-white border border-slate-400">
        
        {/* HEADER */}
        <div className="bg-[#3b608e] text-white px-8 py-4 flex justify-between items-center shrink-0">
          <div className="flex-1">
            <h1 className="text-2xl font-black tracking-tight leading-tight uppercase">{data.propertyName || "PROPERTY INFORMATION"}</h1>
          </div>
          <div className="text-right border-l border-white/20 pl-8 shrink-0">
            <p className="text-[9px] opacity-70 font-black mb-1 uppercase tracking-widest">{labels.price}</p>
            <p className="text-3xl font-black text-yellow-300 tabular-nums">{data.price}</p>
          </div>
        </div>

        {/* MAIN BODY */}
        <div className="flex-1 p-6 grid grid-cols-12 gap-6 overflow-hidden">
          
          {/* LEFT: PHOTO & FACILITIES */}
          <div className="col-span-5 flex flex-col gap-4">
            <div className="aspect-video bg-slate-50 border border-slate-200 relative rounded overflow-hidden flex items-center justify-center">
              {originalImage ? (
                <img src={originalImage} alt="Property" className="w-full h-full object-contain" />
              ) : (
                <div className="text-slate-300 font-bold text-[10px]">PHOTO</div>
              )}
            </div>

            <div className="bg-slate-50 p-4 rounded border border-slate-100 flex-1">
              <h3 className="text-[10px] font-black text-slate-800 mb-2 uppercase border-b border-slate-900 pb-1">{labels.description}</h3>
              <p className="text-[11px] leading-relaxed text-slate-600 font-medium italic mb-4">"{data.description}"</p>
              
              <h3 className="text-[10px] font-black text-slate-800 mb-2 uppercase border-b border-slate-900 pb-1">{labels.facilities}</h3>
              <div className="text-[10px] text-slate-700 leading-snug font-medium line-clamp-6">
                {data.facilities || "-"}
              </div>
            </div>
          </div>

          {/* RIGHT: SPEC TABLE & FEATURES */}
          <div className="col-span-7 flex flex-col gap-4">
            <div className="border-t border-l border-slate-900">
              {tableRows.map((row, ridx) => (
                <div key={ridx} className="flex min-h-[30px]">
                  {row.map((cell, cidx) => (
                    <div key={cidx} className={`flex border-r border-b border-slate-900 ${cell.span === 2 ? 'w-full' : 'w-1/2'}`}>
                      <div className="w-20 bg-[#3b608e] text-[8px] text-white font-black flex items-center px-2 border-r border-slate-900 uppercase shrink-0">
                        {cell.l}
                      </div>
                      <div className={`flex-1 flex items-center px-2 py-1 text-[10px] font-bold ${cell.h ? 'text-indigo-700' : 'text-slate-900'}`}>
                        {cell.v || "-"}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            <div className="flex-1 bg-white border border-slate-200 p-3 rounded flex flex-col min-h-0">
              <h3 className="text-[10px] font-black text-slate-900 mb-2 uppercase tracking-widest flex items-center gap-2">
                <span className="w-1.5 h-3 bg-[#3b608e]"></span> {labels.features}
              </h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 overflow-y-auto pr-2 custom-scrollbar">
                {(data.features || []).map((f, i) => (
                  <div key={i} className="text-[9px] flex items-start gap-1.5 text-slate-600 font-bold pb-1 border-b border-slate-50">
                    <span className="text-[#3b608e] mt-0.5">■</span> {f}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* CORPORATE FOOTER - MATCHING PROVIDED IMAGE STYLE */}
        <div className="grid grid-cols-12 border-t-2 border-[#3b608e] shrink-0 mt-auto bg-[#fdf2f2]">
          {/* Label Column */}
          <div className="col-span-3 bg-[#3b608e] text-white text-[9px] font-bold uppercase">
            {[
              isChinese ? "會社名" : "Company Name",
              isChinese ? "郵便番號" : "Zip Code",
              isChinese ? "住所 1" : "Address 1",
              isChinese ? "住所 2" : "Address 2",
              "T E L",
              "F A X",
              isChinese ? "免許番號" : "License No.",
              isChinese ? "保證協會" : "Assoc.",
              isChinese ? "網址 / Email" : "Web / Email"
            ].map((l, i) => (
              <div key={i} className={`h-6 flex items-center px-4 ${i !== 8 ? 'border-b border-white/20' : ''}`}>
                {l}
              </div>
            ))}
          </div>
          {/* Value Column */}
          <div className="col-span-9 text-slate-900 text-[10px] font-bold">
            <div className="h-6 flex items-center px-4 border-b border-slate-900">{companyInfo.name}</div>
            <div className="h-6 flex items-center px-4 border-b border-slate-900">{companyInfo.zip}</div>
            <div className="h-6 flex items-center px-4 border-b border-slate-900">{companyInfo.addr1}</div>
            <div className="h-6 flex items-center px-4 border-b border-slate-900">{companyInfo.addr2}</div>
            <div className="h-6 flex items-center px-4 border-b border-slate-900">{companyInfo.tel}</div>
            <div className="h-6 flex items-center px-4 border-b border-slate-900">{companyInfo.fax}</div>
            <div className="h-6 flex items-center px-4 border-b border-slate-900">{companyInfo.license}</div>
            <div className="h-6 flex items-center px-4 border-b border-slate-900 text-[8px] leading-tight">
              {companyInfo.assoc} / {companyInfo.branch}
            </div>
            <div className="h-6 flex items-center px-4 text-blue-600 text-[9px] truncate">
              {companyInfo.web} | {companyInfo.email}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default TemplatePreview;
