
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Download, Loader2, Plus, Trash2, CheckCircle2, FileText, Clipboard, Eye } from 'lucide-react';
import { AppView } from '../types';
import { renderPdfToImages } from '../services/pdfUtils';

interface Props {
  setView: (view: AppView) => void;
  title: string;
  icon: any;
  action: (file: File) => Promise<Uint8Array>;
  description: string;
  isTextResponse?: boolean;
}

export const GenericProcessPage: React.FC<Props> = ({ setView, title, icon: Icon, action, description, isTextResponse = false }) => {
  const [file, setFile] = useState<File | null>(null);
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<Uint8Array | null>(null);
  const [textContent, setTextContent] = useState<string | null>(null);

  useEffect(() => {
    const getPreview = async () => {
        if (file && file.type === 'application/pdf') {
            try {
                const imgs = await renderPdfToImages(file, 1);
                setThumbnail(imgs[0]);
            } catch (e) {
                setThumbnail(null);
            }
        } else {
            setThumbnail(null);
        }
    };
    getPreview();
  }, [file]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
        setFile(e.target.files[0]);
        setResult(null);
        setTextContent(null);
    }
  };

  const handleRun = async () => {
    if (!file) return;
    setIsProcessing(true);
    try {
      const bytes = await action(file);
      if (isTextResponse) {
          setTextContent(new TextDecoder().decode(bytes));
      } else {
          setResult(bytes);
      }
    } catch (error) {
      alert(`${title} encountered an error.`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!result && !textContent) return;
    const blob = isTextResponse 
        ? new Blob([textContent || ''], { type: 'text/plain' }) 
        : new Blob([result!], { type: 'application/pdf' });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = isTextResponse ? `${title.replace(/\s+/g, '_')}_Result.txt` : `${title.replace(/\s+/g, '_')}_${file?.name}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col">
      <div className="bg-white border-b border-slate-200 py-4 px-6 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button onClick={() => setView(AppView.HOME)} className="flex items-center text-slate-500 hover:text-brand-600 font-bold transition-all">
            <ArrowLeft className="h-5 w-5 mr-2" /> Back
          </button>
          <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
            <Icon className="h-5 w-5 text-brand-600" /> {title}
          </h1>
          <div className="w-20"></div>
        </div>
      </div>

      <div className="flex-grow flex flex-col md:flex-row">
        {/* Left Side: Controls */}
        <div className="w-full md:w-[450px] bg-white border-r border-slate-200 p-10 flex flex-col shadow-inner">
            <div className="text-center md:text-left mb-10">
                <div className="w-20 h-20 bg-brand-50 text-brand-600 rounded-[24px] flex items-center justify-center mb-6 shadow-sm">
                    <Icon className="h-10 w-10" />
                </div>
                <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">{title}</h2>
                <p className="text-slate-500 font-medium">{description}</p>
            </div>
            
            {!result && !textContent ? (
                <div className="space-y-8 flex-grow">
                    {!file ? (
                        <label className="flex flex-col items-center justify-center w-full h-56 border-4 border-slate-100 border-dashed rounded-[32px] cursor-pointer bg-slate-50 hover:bg-slate-100 hover:border-brand-100 transition-all group">
                            <Plus className="w-12 h-12 text-brand-400 mb-3 group-hover:scale-110 transition-transform" />
                            <span className="text-slate-900 font-black uppercase tracking-widest text-xs">Select Document</span>
                            <input type="file" className="hidden" accept="application/pdf" onChange={handleFileChange} />
                        </label>
                    ) : (
                        <div className="space-y-6 animate-in fade-in">
                            <div className="flex items-center justify-between p-6 bg-slate-50 rounded-[24px] border border-slate-200 shadow-sm">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-brand-100 rounded-xl text-brand-600 flex-shrink-0">
                                        <FileText className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <p className="font-black text-slate-900 truncate max-w-[180px]">{file.name}</p>
                                        <p className="text-xs font-bold text-slate-400">{(file.size / 1024).toFixed(1)} KB</p>
                                    </div>
                                </div>
                                <button onClick={() => setFile(null)} className="text-slate-400 hover:text-red-500 p-2 hover:bg-red-50 rounded-xl transition-colors">
                                    <Trash2 className="h-5 w-5" />
                                </button>
                            </div>
                            <button 
                                onClick={handleRun} 
                                disabled={isProcessing} 
                                className="w-full py-5 bg-slate-900 text-white rounded-[24px] font-black text-lg flex items-center justify-center gap-3 shadow-xl hover:bg-black transition-all active:scale-95 disabled:opacity-50 mt-8"
                            >
                                 {isProcessing ? <Loader2 className="animate-spin h-6 w-6" /> : <Icon className="h-6 w-6" />}
                                 {isProcessing ? 'Processing...' : `Start ${title}`}
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <div className="text-center py-10 animate-zoom-in flex-grow flex flex-col justify-center">
                    <div className="w-24 h-24 bg-green-50 text-green-600 rounded-[32px] flex items-center justify-center mx-auto mb-6 shadow-sm">
                        <CheckCircle2 className="h-12 w-12" />
                    </div>
                    <h3 className="text-3xl font-black text-slate-900 mb-2">Done!</h3>
                    <p className="text-slate-500 font-medium mb-10">Your {isTextResponse ? 'analysis' : 'document'} is ready.</p>
                    
                    {isTextResponse && textContent && (
                        <div className="mb-10 p-6 bg-slate-50 rounded-[32px] text-left max-h-[250px] overflow-y-auto whitespace-pre-wrap text-sm font-medium leading-relaxed text-slate-700 shadow-inner border border-slate-100">
                            {textContent}
                        </div>
                    )}

                    <div className="space-y-4">
                        <button 
                            onClick={handleDownload}
                            className="w-full py-5 bg-brand-600 text-white rounded-[24px] font-black text-lg flex items-center justify-center gap-3 shadow-xl hover:bg-brand-700 transition-all active:scale-95"
                        >
                            <Download className="h-6 w-6" /> Download Now
                        </button>
                        <button 
                            onClick={() => { setFile(null); setResult(null); setTextContent(null); }}
                            className="text-slate-400 font-black uppercase tracking-widest text-xs hover:text-brand-600 py-2"
                        >
                            Process Another
                        </button>
                    </div>
                </div>
            )}
        </div>

        {/* Right Side: Workspace Preview */}
        <div className="flex-grow bg-slate-100 p-12 overflow-y-auto min-h-[500px] flex items-center justify-center">
           <div className="max-w-xl w-full">
              {!file ? (
                <div className="text-center text-slate-300">
                    <Eye className="h-24 w-24 mb-6 opacity-20 mx-auto" />
                    <p className="text-xl font-black uppercase tracking-[0.2em] opacity-40">Workspace Preview</p>
                    <p className="mt-2 font-medium opacity-50">Upload a PDF to see it here</p>
                </div>
              ) : (
                <div className="bg-white p-10 rounded-[56px] shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-500 text-center relative overflow-hidden group">
                   <div className="absolute inset-0 translate-x-[-100%] group-hover:animate-shimmer-premium bg-gradient-to-r from-transparent via-slate-50/50 to-transparent pointer-events-none"></div>
                   
                   <div className="aspect-[3/4] bg-slate-50 border-8 border-slate-50 rounded-[40px] flex items-center justify-center p-6 shadow-inner relative z-10 mx-auto">
                      {thumbnail ? (
                        <img src={thumbnail} className="w-full h-full object-cover animate-in fade-in" alt="Document Preview" />
                      ) : (
                        <div className="flex flex-col items-center text-slate-200">
                            <FileText className="h-24 w-24 opacity-20" />
                            <p className="text-[10px] font-black uppercase tracking-widest mt-4 opacity-50">Preview Loading...</p>
                        </div>
                      )}
                      
                      {thumbnail && (
                        <div className="absolute top-4 left-4 bg-slate-900/90 text-white text-[10px] font-black px-4 py-1.5 rounded-full backdrop-blur-md shadow-lg border border-white/10 uppercase">
                           Page 1 Preview
                        </div>
                      )}
                   </div>

                   <div className="mt-12 space-y-2">
                      <p className="text-2xl font-black text-slate-900 tracking-tight truncate">{file.name}</p>
                      <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Ready for {title}</p>
                   </div>
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};
