
import React from 'react';
import { MaisokuData } from '../types';

interface TemplatePreviewProps {
  data: MaisokuData;
  originalImage: string | null;
}

const TemplatePreview: React.FC<TemplatePreviewProps> = ({ data, originalImage }) => {
  return (
    <div className="bg-white border shadow-2xl mx-auto print-area overflow-hidden" style={{ width: '210mm', minHeight: '297mm', padding: '10mm' }}>
      {/* Header / Title Area */}
      <div className="border-b-4 border-slate-800 pb-4 mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">{data.propertyName}</h1>
          <p className="text-xl text-slate-500 mt-1 uppercase tracking-widest">Premium Property Offering</p>
        </div>
        <div className="text-right">
          <span className="text-3xl font-bold text-red-600">{data.price}</span>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left Column: Visuals */}
        <div className="col-span-7 space-y-4">
          <div className="aspect-[4/3] bg-slate-100 border rounded-lg overflow-hidden relative">
            {originalImage ? (
              <img src={originalImage} alt="Property" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400">
                Property Visual
              </div>
            )}
            <div className="absolute top-2 left-2 bg-black/60 text-white px-2 py-1 text-xs rounded no-print">
              Original Reference
            </div>
          </div>
          
          <div className="bg-slate-50 p-4 rounded-lg border">
            <h3 className="font-bold text-slate-800 mb-2 border-b pb-1">Property Description</h3>
            <p className="text-sm text-slate-600 leading-relaxed">{data.description}</p>
          </div>
        </div>

        {/* Right Column: Key Details Table */}
        <div className="col-span-5 flex flex-col">
          <table className="w-full border-collapse border border-slate-300 text-sm">
            <tbody>
              <tr>
                <td className="bg-slate-800 text-white p-2 font-semibold border border-slate-300 w-1/3 text-center">Location</td>
                <td className="p-2 border border-slate-300">{data.location}</td>
              </tr>
              <tr>
                <td className="bg-slate-800 text-white p-2 font-semibold border border-slate-300 text-center">Access</td>
                <td className="p-2 border border-slate-300">{data.access}</td>
              </tr>
              <tr>
                <td className="bg-slate-800 text-white p-2 font-semibold border border-slate-300 text-center">Layout</td>
                <td className="p-2 border border-slate-300 font-bold">{data.layout}</td>
              </tr>
              <tr>
                <td className="bg-slate-800 text-white p-2 font-semibold border border-slate-300 text-center">Size</td>
                <td className="p-2 border border-slate-300">{data.size}</td>
              </tr>
              <tr>
                <td className="bg-slate-800 text-white p-2 font-semibold border border-slate-300 text-center">Built</td>
                <td className="p-2 border border-slate-300">{data.builtYear}</td>
              </tr>
              <tr>
                <td className="bg-slate-800 text-white p-2 font-semibold border border-slate-300 text-center">Management</td>
                <td className="p-2 border border-slate-300">{data.managementFee}</td>
              </tr>
              <tr>
                <td className="bg-slate-800 text-white p-2 font-semibold border border-slate-300 text-center">Repair Fund</td>
                <td className="p-2 border border-slate-300">{data.repairFund}</td>
              </tr>
            </tbody>
          </table>

          <div className="mt-6">
            <h3 className="font-bold text-slate-800 mb-3 text-lg underline decoration-slate-300 decoration-2">Key Features</h3>
            <ul className="space-y-2">
              {data.features.map((f, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-slate-700">
                  <span className="w-1.5 h-1.5 bg-slate-800 rounded-full"></span>
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Corporate Footer Area */}
      <div className="mt-auto pt-10">
        <div className="border-t-2 border-slate-200 pt-6 flex items-start gap-4">
          <div className="flex-1 border-2 border-slate-900 p-4 flex items-center gap-6">
             <div className="bg-slate-900 text-white font-black text-3xl p-3 h-16 w-16 flex items-center justify-center">S</div>
             <div>
                <h2 className="text-2xl font-black text-slate-900 leading-tight">SORA株式会社</h2>
                <div className="text-[10px] text-slate-600 leading-tight mt-1">
                  宅建免許 大阪府知事(1)第65866号<br/>
                  保証協会 (公社)全国宅地建物取引業保証協会<br/>
                  所属協会 (一社)大阪府宅地建物取引業協会 西支部
                </div>
             </div>
             <div className="ml-auto text-[10px] text-slate-800 text-right space-y-0.5">
                <p>TEL: 06-4400-7569</p>
                <p>FAX: 06-7635-9734</p>
                <p>Email: info@sora-jp.net</p>
                <p>Web: www.sora-jp.net</p>
                <p>所在地: 550-0003 大阪府大阪市西区京町堀1-16-8 RE-021-10F</p>
             </div>
          </div>
          
          <div className="w-48 grid grid-cols-1 gap-1">
            <div className="border border-slate-300 p-1 text-[10px] bg-slate-50">
              <span className="font-bold block uppercase opacity-50">Transaction</span>
              <span className="font-semibold">General Mediation</span>
            </div>
            <div className="border border-slate-300 p-1 text-[10px] bg-slate-50">
               <span className="font-bold block uppercase opacity-50">Advertising</span>
               <span className="font-semibold">Not Permitted</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplatePreview;
