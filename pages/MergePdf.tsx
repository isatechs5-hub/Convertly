
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Download, Loader2, Files, Trash2, Plus, AlertCircle, Eye, Settings } from 'lucide-react';
import { AppView } from '../types';
import { mergePdfDocuments, renderPdfToImages, compressPdfDocument } from '../services/pdfUtils';
import { auth } from '../services/firebase.config';
import { saveConversionHistory } from '../services/firebase.service';

interface FileWithThumbnail {
  file: File;
  thumbnail: string | null;
}

interface Props {
  setView: (view: AppView) => void;
}

export const MergePdf: React.FC<Props> = ({ setView }) => {
  const [files, setFiles] = useState<FileWithThumbnail[]>([]);
  const [isMerging, setIsMerging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [compressOutput, setCompressOutput] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).filter((f: File) => f.type === 'application/pdf');
      if (newFiles.length === 0) {
        setError("Please select valid PDF files.");
        return;
      }

      const filesWithThumbs: FileWithThumbnail[] = await Promise.all(
        newFiles.map(async (file) => {
          try {
            const thumbs = await renderPdfToImages(file, 1);
            return { file, thumbnail: thumbs[0] };
          } catch (_e) {
            return { file, thumbnail: null };
          }
        })
      );

      setFiles(prev => [...prev, ...filesWithThumbs]);
      setError(null);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleMerge = async () => {
    if (files.length < 2) {
      setError("Please add at least 2 PDF files to merge.");
      return;
    }

    // Check Free Limit
    const userPlan = localStorage.getItem('user_plan');
    if (files.length > 5 && userPlan !== 'pro' && userPlan !== 'max') {
      setView(AppView.PRICING);
      return;
    }

    setIsMerging(true);
    setError(null);
    try {
      let mergedBytes = await mergePdfDocuments(files.map(f => f.file));

      if (compressOutput) {
        const tempFile = new File([mergedBytes], "merged_temp.pdf", { type: 'application/pdf' });
        mergedBytes = await compressPdfDocument(tempFile, 'recommended');
      }

      const blob = new Blob([mergedBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'merged_document.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      if (auth.currentUser) {
        await saveConversionHistory(auth.currentUser.uid, {
          toolName: 'Merge PDF',
          fileName: 'merged_document.pdf'
        });
      }
    } catch (err: any) {
      setError(err.message || "Failed to merge PDFs.");
    } finally {
      setIsMerging(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col">
      <div className="bg-white border-b border-slate-200 py-4 px-6 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button onClick={() => setView(AppView.HOME)} className="flex items-center text-slate-500 hover:text-brand-600 font-bold transition-all">
            <ArrowLeft className="h-5 w-5 mr-2" /> Back
          </button>
          <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Files className="h-5 w-5 text-brand-600" /> Merge PDFs
          </h1>
          <div className="w-20"></div>
        </div>
      </div>

      <div className="flex-grow flex flex-col md:flex-row">
        {/* Left Control Panel */}
        <div className="w-full md:w-[400px] bg-white border-r border-slate-200 p-8 flex flex-col shadow-inner">
          <div className="mb-10 text-center md:text-left">
            <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Combine Documents</h2>
            <p className="text-slate-500 font-medium">Add multiple PDFs to join them into one professional document instantly.</p>
          </div>

          <div className="space-y-6 flex-grow">
            <label className="flex flex-col items-center justify-center w-full h-40 border-4 border-slate-100 border-dashed rounded-[32px] cursor-pointer bg-slate-50 hover:bg-slate-100 hover:border-brand-100 transition-all group">
              <div className="flex flex-col items-center justify-center">
                <Plus className="w-12 h-12 mb-3 text-brand-400 group-hover:scale-110 transition-transform" />
                <p className="text-sm font-black text-slate-900 uppercase tracking-widest">Select PDF Files</p>
              </div>
              <input type="file" className="hidden" accept="application/pdf" multiple onChange={handleFileChange} />
            </label>

            {files.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest">File Queue</span>
                  <span className="text-xs font-black text-brand-600">{files.length} Files</span>
                </div>
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {files.map((f, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-slate-50 border border-slate-200 p-3 rounded-2xl group transition-all hover:border-brand-200">
                      <span className="text-sm font-bold text-slate-700 truncate max-w-[180px]">{f.file.name}</span>
                      <button onClick={() => removeFile(idx)} className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-xl">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {files.length >= 2 && (
            <div className="mt-4 flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <input
                type="checkbox"
                id="compressMerge"
                checked={compressOutput}
                onChange={(e) => setCompressOutput(e.target.checked)}
                className="w-4 h-4 text-brand-600 rounded focus:ring-brand-500 border-gray-300"
              />
              <label htmlFor="compressMerge" className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <Settings className="h-3 w-3 text-slate-400" /> Compress Output File
              </label>
            </div>
          )}

          <button
            onClick={handleMerge}
            disabled={files.length < 2 || isMerging}
            className={`w-full py-5 rounded-[24px] font-black text-lg text-white shadow-xl flex items-center justify-center gap-3 transition-all active:scale-95 mt-4 ${files.length < 2 ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-brand-600 hover:bg-brand-700 shadow-brand-100'}`}
          >
            {isMerging ? <Loader2 className="animate-spin h-6 w-6" /> : <Files className="h-6 w-6" />}
            {isMerging ? 'Merging...' : 'Merge & Download'}
          </button>
          {error && <p className="mt-4 text-xs font-bold text-red-500 bg-red-50 p-3 rounded-xl border border-red-100 flex items-center gap-2"><AlertCircle className="h-4 w-4" /> {error}</p>}
        </div>

        {/* Right Preview Panel */}
        <div className="flex-grow bg-slate-100 p-8 overflow-y-auto min-h-[400px]">
          <div className="max-w-4xl mx-auto">
            {files.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center py-24 text-slate-300">
                <Eye className="h-24 w-24 mb-6 opacity-20" />
                <p className="text-xl font-black uppercase tracking-[0.2em] opacity-40">Workspace Preview</p>
                <p className="mt-2 font-medium opacity-50">Uploaded documents will appear here for visual confirmation</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-8">
                {files.map((f, idx) => (
                  <div key={idx} className="group relative animate-in zoom-in-95 duration-300">
                    <div className="bg-white p-3 rounded-[32px] shadow-xl border border-slate-200 transition-all group-hover:shadow-2xl group-hover:-translate-y-2">
                      <div className="aspect-[3/4] bg-slate-50 rounded-[20px] overflow-hidden border border-slate-100 relative">
                        {f.thumbnail ? (
                          <img src={f.thumbnail} className="w-full h-full object-cover" alt="Preview" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center"><Files className="h-10 w-10 text-slate-200" /></div>
                        )}
                        <div className="absolute top-4 left-4 bg-slate-900/80 text-white text-[10px] font-black px-3 py-1 rounded-full backdrop-blur-md">
                          PAGE 1
                        </div>
                      </div>
                      <div className="mt-4 px-2">
                        <p className="text-sm font-black text-slate-900 truncate">{f.file.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{(f.file.size / 1024).toFixed(0)} KB</p>
                      </div>
                    </div>
                    <div className="absolute -top-3 -left-3 h-10 w-10 bg-brand-600 text-white rounded-full flex items-center justify-center font-black shadow-lg ring-4 ring-slate-100">
                      {idx + 1}
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
