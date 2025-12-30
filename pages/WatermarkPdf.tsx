import React, { useState } from 'react';
import { ArrowLeft, Download, Loader2, Stamp, Plus, Trash2 } from 'lucide-react';
import { AppView } from '../types';
import { watermarkPdfDocument } from '../services/pdfUtils';

interface Props {
  setView: (view: AppView) => void;
}

export const WatermarkPdf: React.FC<Props> = ({ setView }) => {
  const [file, setFile] = useState<File | null>(null);
  const [watermark, setWatermark] = useState('CONFIDENTIAL');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        if(e.target.files[0].type === 'application/pdf') {
            setFile(e.target.files[0]);
        } else {
            alert("Please upload a PDF file.");
        }
    }
  };

  const handleWatermark = async () => {
    if (!file || !watermark) return;
    setIsProcessing(true);
    try {
      const bytes = await watermarkPdfDocument(file, watermark);
      const blob = new Blob([bytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `watermarked_${file.name}`;
      link.click();
    } catch (error) {
      console.error(error);
      alert("Failed to watermark PDF.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-12">
       <div className="bg-white border-b border-slate-200 py-6 px-4 mb-8 shadow-sm">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
            <button onClick={() => setView(AppView.HOME)} className="flex items-center text-slate-500 hover:text-brand-600 font-medium transition-colors">
                <ArrowLeft className="h-5 w-5 mr-2" /> Back to Tools
            </button>
            <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Stamp className="h-5 w-5 text-brand-600" />
                Add Watermark
            </h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="p-8 text-center border-b border-slate-100 bg-slate-50/50">
             <div className="w-16 h-16 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Stamp className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Watermark PDF</h2>
            <p className="text-slate-500 max-w-md mx-auto">Add text overlay to your PDF pages.</p>
          </div>

          <div className="p-8">
             {!file ? (
                <div className="mb-8">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 border-dashed rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Plus className="w-8 h-8 mb-2 text-slate-400" />
                            <p className="text-sm text-slate-500"><span className="font-semibold">Click to upload</span> PDF</p>
                        </div>
                        <input type="file" className="hidden" accept="application/pdf" onChange={handleFileChange} />
                    </label>
                </div>
             ) : (
                <div className="mb-8">
                     <div className="flex items-center justify-between bg-white border border-slate-200 p-4 rounded-lg shadow-sm mb-6">
                        <div className="flex items-center gap-3">
                             <div className="h-10 w-10 bg-red-100 rounded flex items-center justify-center flex-shrink-0 text-red-600 font-bold text-xs">PDF</div>
                             <div>
                                 <p className="font-medium text-slate-800">{file.name}</p>
                                 <p className="text-xs text-slate-500">{(file.size/1024).toFixed(1)} KB</p>
                             </div>
                        </div>
                        <button onClick={() => setFile(null)} className="text-red-500 hover:bg-red-50 p-2 rounded"><Trash2 className="h-5 w-5"/></button>
                    </div>

                    <label className="block text-sm font-medium text-slate-700 mb-2">Watermark Text</label>
                    <input 
                        type="text" 
                        className="w-full p-3 border border-slate-300 rounded-lg outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                        placeholder="e.g. DRAFT"
                        value={watermark}
                        onChange={(e) => setWatermark(e.target.value)}
                    />
                </div>
             )}

            <button
              onClick={handleWatermark}
              disabled={!file || !watermark || isProcessing}
              className={`w-full py-4 rounded-xl font-bold text-lg text-white shadow-lg flex items-center justify-center gap-2 transition-all ${!file || !watermark ? 'bg-slate-300 cursor-not-allowed' : 'bg-brand-600 hover:bg-brand-700 hover:scale-[1.02]'}`}
            >
              {isProcessing ? <Loader2 className="animate-spin h-6 w-6" /> : <Stamp className="h-6 w-6" />}
              {isProcessing ? 'Processing...' : 'Add Watermark'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};