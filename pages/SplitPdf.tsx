
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Download, Loader2, Scissors, Plus, Trash2, Eye } from 'lucide-react';
import { AppView } from '../types';
import { splitPdfDocument, renderPdfToImages } from '../services/pdfUtils';

interface Props {
  setView: (view: AppView) => void;
}

export const SplitPdf: React.FC<Props> = ({ setView }) => {
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoadingPages, setIsLoadingPages] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        const selected = e.target.files[0];
        if(selected.type === 'application/pdf') {
            setFile(selected);
            setIsLoadingPages(true);
            try {
                const images = await renderPdfToImages(selected);
                setPages(images);
            } catch (err) {
                alert("Could not load PDF pages.");
            } finally {
                setIsLoadingPages(false);
            }
        } else {
            alert("Please upload a PDF file.");
        }
    }
  };

  const handleSplit = async () => {
    if (!file) return;
    setIsProcessing(true);
    try {
      const pageBytes = await splitPdfDocument(file);
      const limit = Math.min(pageBytes.length, 5); 
      for(let i=0; i<limit; i++) {
        const blob = new Blob([pageBytes[i]], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${file.name.replace('.pdf', '')}_page_${i+1}.pdf`;
        link.click();
        await new Promise(r => setTimeout(r, 500)); 
      }
      if(pageBytes.length > 5) alert("Downloaded first 5 pages.");
    } catch (error) {
      alert("Failed to split PDF.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col">
      <div className="bg-white border-b border-slate-200 py-4 px-6 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
            <button onClick={() => setView(AppView.HOME)} className="flex items-center text-slate-500 hover:text-brand-600 font-bold transition-all">
                <ArrowLeft className="h-5 w-5 mr-2" /> Back
            </button>
            <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2 uppercase">
                <Scissors className="h-5 w-5 text-brand-600" /> Split PDF
            </h1>
            <div className="w-20"></div>
        </div>
      </div>

      <div className="flex-grow flex flex-col md:flex-row">
        {/* Left Side: Controls */}
        <div className="w-full md:w-[400px] bg-white border-r border-slate-200 p-8 flex flex-col shadow-inner">
           <div className="mb-10 text-center md:text-left">
              <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Extract Pages</h2>
              <p className="text-slate-500 font-medium">Split your PDF into separate documents. Each page will be saved as its own file.</p>
           </div>

           {!file ? (
             <label className="flex flex-col items-center justify-center w-full h-56 border-4 border-slate-100 border-dashed rounded-[32px] cursor-pointer bg-slate-50 hover:bg-slate-100 hover:border-brand-100 transition-all group">
                <Plus className="w-12 h-12 text-brand-400 mb-3 group-hover:scale-110 transition-transform" />
                <span className="text-slate-900 font-black uppercase tracking-widest text-sm text-center px-4">Upload PDF to Split</span>
                <input type="file" className="hidden" accept="application/pdf" onChange={handleFileChange} />
             </label>
           ) : (
             <div className="space-y-6">
                <div className="bg-slate-50 border border-slate-200 p-6 rounded-[24px] shadow-sm flex items-center justify-between">
                    <div className="flex items-center gap-4 overflow-hidden">
                        <div className="h-12 w-12 bg-brand-100 rounded-xl flex items-center justify-center text-brand-600 font-black text-xs flex-shrink-0">PDF</div>
                        <div className="overflow-hidden">
                           <p className="font-black text-slate-900 truncate">{file.name}</p>
                           <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{(file.size/1024).toFixed(1)} KB</p>
                        </div>
                    </div>
                    <button onClick={() => {setFile(null); setPages([]);}} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"><Trash2 className="h-5 w-5"/></button>
                </div>
                
                <button
                  onClick={handleSplit}
                  disabled={isProcessing}
                  className="w-full py-5 bg-brand-600 text-white rounded-[24px] font-black text-lg flex items-center justify-center gap-3 shadow-xl hover:bg-brand-700 transition-all active:scale-95 shadow-brand-100"
                >
                  {isProcessing ? <Loader2 className="animate-spin h-6 w-6" /> : <Download className="h-6 w-6" />}
                  {isProcessing ? 'Processing PDF...' : 'Split & Download'}
                </button>
             </div>
           )}
        </div>

        {/* Right Side: Workspace Preview Grid */}
        <div className="flex-grow bg-slate-100 p-12 overflow-y-auto">
           <div className="max-w-5xl mx-auto h-full">
              {!file ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-300">
                    <Eye className="h-24 w-24 mb-6 opacity-20" />
                    <p className="text-xl font-black uppercase tracking-[0.2em] opacity-40">Document Grid Preview</p>
                    <p className="mt-2 font-medium opacity-50">Upload a PDF to see all its pages visually</p>
                </div>
              ) : isLoadingPages ? (
                <div className="h-full flex flex-col items-center justify-center text-brand-600 animate-pulse">
                    <Loader2 className="h-12 w-12 animate-spin mb-4" />
                    <p className="font-black uppercase tracking-widest text-sm">Rendering Workspace...</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-10">
                   {pages.map((img, idx) => (
                     <div key={idx} className="group relative animate-in fade-in zoom-in-95 duration-500" style={{ animationDelay: `${idx * 50}ms` }}>
                        <div className="bg-white p-3 rounded-[28px] shadow-lg border border-slate-200 transition-all group-hover:shadow-2xl group-hover:-translate-y-2">
                           <div className="aspect-[3/4] bg-slate-50 rounded-[20px] overflow-hidden border border-slate-100">
                              <img src={img} className="w-full h-full object-cover" alt={`Page ${idx+1}`} />
                           </div>
                        </div>
                        <div className="absolute -top-3 -left-3 h-10 w-10 bg-slate-900 text-white rounded-full flex items-center justify-center font-black text-xs shadow-lg ring-4 ring-slate-100 z-10">
                           {idx + 1}
                        </div>
                        <div className="absolute bottom-6 left-0 w-full text-center pointer-events-none">
                           <span className="text-[10px] font-black text-slate-400 bg-white/80 backdrop-blur-md px-4 py-1 rounded-full border border-slate-100 uppercase tracking-widest shadow-sm">Page {idx+1}</span>
                        </div>
                     </div>
                   ))}
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};
