
import React, { useState } from 'react';
import { ArrowLeft, Download, Loader2, Image as ImageIcon, Trash2, Plus, Eye, CheckCircle2 } from 'lucide-react';
import { AppView } from '../types';
import { convertImagesToPdf } from '../services/pdfUtils';
import { auth } from '../services/firebase.config';
import { saveConversionHistory } from '../services/firebase.service';

interface Props {
  setView: (view: AppView) => void;
}

interface ImageFile {
  file: File;
  preview: string;
}

export const ImageToPdf: React.FC<Props> = ({ setView }) => {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [isConverting, setIsConverting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const newImages = newFiles.map(file => ({
        file,
        preview: URL.createObjectURL(file as any)
      }));
      setImages(prev => [...prev, ...newImages]);
      setIsSuccess(false);
    }
  };

  const removeImage = (index: number) => {
    URL.revokeObjectURL(images[index].preview);
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleConvert = async () => {
    if (images.length === 0) return;
    setIsConverting(true);
    try {
      const pdfBytes = await convertImagesToPdf(images.map(img => img.file));
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'convertly_images.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setIsSuccess(true);

      if (auth.currentUser) {
        await saveConversionHistory(auth.currentUser.uid, {
          toolName: 'Image to PDF',
          fileName: 'convertly_images.pdf'
        });
      }
    } catch (error) {
      console.error(error);
      alert("Failed to convert images.");
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col font-sans">
      <div className="bg-white border-b border-slate-200 py-4 px-6 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button onClick={() => setView(AppView.HOME)} className="flex items-center text-slate-500 hover:text-brand-600 font-bold transition-all">
            <ArrowLeft className="h-5 w-5 mr-2" /> Back
          </button>
          <h1 className="text-xl font-black text-slate-900 uppercase tracking-tighter flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-brand-600" /> Image to PDF
          </h1>
          <div className="w-20"></div>
        </div>
      </div>

      <div className="flex-grow flex flex-col md:flex-row">
        {/* Left Side: Controls */}
        <div className="w-full md:w-[420px] bg-white border-r border-slate-200 p-10 flex flex-col shadow-inner">
          <div className="text-center md:text-left mb-10">
            <div className="w-20 h-20 bg-brand-50 text-brand-600 rounded-[28px] flex items-center justify-center mb-6 shadow-sm rotate-3">
              <ImageIcon className="h-10 w-10 -rotate-3" />
            </div>
            <h2 className="text-4xl font-black text-slate-900 mb-2 tracking-tighter">Instant Gallery</h2>
            <p className="text-slate-500 font-medium">Convert your favorite snapshots into a clean, searchable PDF portfolio.</p>
          </div>

          <div className="space-y-6 flex-grow">
            <label className="flex flex-col items-center justify-center w-full h-44 border-4 border-slate-100 border-dashed rounded-[40px] cursor-pointer bg-slate-50 hover:bg-slate-100 hover:border-brand-100 transition-all group overflow-hidden relative">
              <div className="flex flex-col items-center justify-center relative z-10">
                <Plus className="w-12 h-12 mb-3 text-brand-400 group-hover:scale-110 transition-transform" />
                <p className="text-xs font-black text-slate-900 uppercase tracking-[0.2em]">Add Images</p>
              </div>
              <input type="file" className="hidden" accept="image/*" multiple onChange={handleFileChange} />
            </label>

            {images.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between px-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Selected Assets</span>
                  <span className="text-[10px] font-black text-brand-600 px-2 py-0.5 bg-brand-50 rounded-md">{images.length}</span>
                </div>
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {images.map((img, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-slate-50 border border-slate-200 p-3 rounded-2xl group transition-all hover:border-brand-200 shadow-sm">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <img src={img.preview} className="w-10 h-10 object-cover rounded-lg border border-white shadow-sm" alt="Small" />
                        <span className="text-sm font-bold text-slate-700 truncate max-w-[150px]">{img.file.name}</span>
                      </div>
                      <button onClick={() => removeImage(idx)} className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-xl transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handleConvert}
            disabled={images.length === 0 || isConverting}
            className={`w-full py-5 rounded-[28px] font-black text-lg text-white shadow-2xl flex items-center justify-center gap-3 transition-all active:scale-95 mt-8 ${images.length === 0 ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-slate-900 hover:bg-black'}`}
          >
            {isConverting ? <Loader2 className="animate-spin h-6 w-6" /> : <Download className="h-6 w-6" />}
            {isConverting ? 'Processing...' : 'Create PDF'}
          </button>

          {isSuccess && (
            <p className="mt-6 p-4 bg-green-50 text-green-600 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 border border-green-100 animate-in fade-in zoom-in">
              <CheckCircle2 className="h-4 w-4" /> Export Complete
            </p>
          )}
        </div>

        {/* Right Side: Visual Workspace */}
        <div className="flex-grow bg-slate-100 p-12 overflow-y-auto min-h-[500px]">
          <div className="max-w-5xl mx-auto h-full flex flex-col items-center justify-center">
            {images.length === 0 ? (
              <div className="text-center text-slate-300">
                <Eye className="h-24 w-24 mb-6 opacity-20 mx-auto" />
                <p className="text-xl font-black uppercase tracking-[0.2em] opacity-40">Visualizer</p>
                <p className="mt-2 font-medium opacity-50">Upload images to see how they'll look in your PDF</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-10 w-full animate-in fade-in slide-in-from-right-8 duration-700">
                {images.map((img, idx) => (
                  <div key={idx} className="group relative">
                    <div className="bg-white p-4 rounded-[40px] shadow-2xl border border-slate-200 transition-all hover:-translate-y-3 hover:shadow-brand-500/10 hover:border-brand-200">
                      <div className="aspect-[3/4] bg-slate-50 rounded-[32px] overflow-hidden relative border border-slate-100">
                        <img src={img.preview} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Preview" />
                        <div className="absolute top-5 left-5 bg-slate-900/90 text-white text-[10px] font-black px-4 py-1.5 rounded-full backdrop-blur-md border border-white/10 uppercase tracking-widest">
                          Image {idx + 1}
                        </div>
                        <div className="absolute inset-0 bg-brand-600/0 group-hover:bg-brand-600/10 transition-colors pointer-events-none"></div>
                      </div>
                    </div>
                    <div className="absolute -top-4 -right-4 h-12 w-12 bg-white text-slate-900 rounded-full flex items-center justify-center font-black shadow-2xl border-4 border-slate-100 z-10 scale-0 group-hover:scale-100 transition-transform">
                      {idx + 1}
                    </div>
                  </div>
                ))}

                {/* Empty page slot indicator */}
                <div className="bg-slate-200/50 border-4 border-slate-300 border-dashed rounded-[40px] aspect-[3/4] flex items-center justify-center opacity-30 group">
                  <Plus className="h-12 w-12 text-slate-400 group-hover:scale-110 transition-transform" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}</style>
    </div>
  );
};
