
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Download, Loader2, Plus, Trash2, Shield, Printer, ArrowRightLeft, FileText, CheckCircle2, Eye } from 'lucide-react';
import { AppView } from '../types';
import { redactPdfDocument, convertHtmlToPdf, comparePdfDocuments, renderPdfToImages } from '../services/pdfUtils';

interface Props {
  setView: (view: AppView) => void;
  type: 'redact' | 'html' | 'compare';
}

export const GenericTool: React.FC<Props> = ({ setView, type }) => {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<{ data: Uint8Array, name: string } | null>(null);
  const [report, setReport] = useState<string | null>(null);
  const [previewThumbnail, setPreviewThumbnail] = useState<string | null>(null);

  const config = {
      redact: { title: 'Redact PDF', icon: Shield, description: 'Permanently hide sensitive info from your document.', accept: '.pdf', multiple: false, actionLabel: 'Redact PDF' },
      html: { title: 'HTML to PDF', icon: Printer, description: 'Convert HTML files to a professional PDF layout.', accept: '.html,.htm', multiple: false, actionLabel: 'Convert to PDF' },
      compare: { title: 'Compare PDF', icon: ArrowRightLeft, description: 'Spot differences between two PDF document versions.', accept: '.pdf', multiple: true, actionLabel: 'Compare Files' },
  }[type];

  // Logic to generate a preview thumbnail when a result is generated
  useEffect(() => {
    const generatePreview = async () => {
      if (result) {
        try {
          // Create a temporary file from the Uint8Array to use our renderer
          const blob = new Blob([result.data], { type: 'application/pdf' });
          const file = new File([blob], 'preview.pdf', { type: 'application/pdf' });
          const thumbs = await renderPdfToImages(file, 1);
          setPreviewThumbnail(thumbs[0]);
        } catch (e) {
          console.error("Preview generation failed", e);
        }
      }
    };
    generatePreview();
  }, [result]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
        const newFiles = Array.from(e.target.files);
        setFiles(prev => config.multiple ? [...prev, ...newFiles] : newFiles);
        setResult(null);
        setReport(null);
        setPreviewThumbnail(null);
    }
  };

  const handleRun = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    setResult(null);
    setReport(null);

    try {
      if (type === 'redact') {
          const data = await redactPdfDocument(files[0]);
          setResult({ data, name: `redacted_${files[0].name}` });
      } else if (type === 'html') {
          const data = await convertHtmlToPdf(files[0]);
          setResult({ data, name: `${files[0].name.split('.')[0]}.pdf` });
      } else if (type === 'compare') {
          const res = await comparePdfDocuments(files);
          setReport(res);
      }
    } catch (error) {
      console.error(error);
      alert(`${config.title} encountered an error. Please try again with a different file.`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!result) return;
    const blob = new Blob([result.data], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = result.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
            <config.icon className="h-5 w-5 text-brand-600" /> {config.title}
          </h1>
          <div className="w-20"></div>
        </div>
      </div>

      <div className="flex-grow flex flex-col md:flex-row">
        {/* Left Side: Controls */}
        <div className="w-full md:w-[420px] bg-white border-r border-slate-200 p-10 flex flex-col shadow-inner">
            <div className="text-center md:text-left mb-10">
                <div className="w-20 h-20 bg-brand-50 text-brand-600 rounded-[24px] flex items-center justify-center mb-6 shadow-sm">
                    <config.icon className="h-10 w-10" />
                </div>
                <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">{config.title}</h2>
                <p className="text-slate-500 font-medium">{config.description}</p>
            </div>
            
            {!result && !report ? (
                <div className="space-y-8 flex-grow">
                    {files.length === 0 ? (
                        <label className="flex flex-col items-center justify-center w-full h-56 border-4 border-slate-100 border-dashed rounded-[32px] cursor-pointer bg-slate-50 hover:bg-slate-100 hover:border-brand-100 transition-all group">
                            <Plus className="w-12 h-12 text-brand-400 mb-3 group-hover:scale-110 transition-transform" />
                            <span className="text-slate-900 font-black uppercase tracking-widest text-xs">Choose {config.accept} files</span>
                            <input type="file" className="hidden" accept={config.accept} multiple={config.multiple} onChange={handleFileChange} />
                        </label>
                    ) : (
                        <div className="space-y-4">
                            {files.map((file, idx) => (
                                <div key={idx} className="p-5 bg-slate-50 rounded-[24px] border border-slate-200 flex justify-between items-center animate-in fade-in slide-in-from-bottom-2 shadow-sm">
                                    <div className="flex items-center gap-4 overflow-hidden">
                                        <div className="p-3 bg-brand-100 rounded-xl text-brand-600 flex-shrink-0">
                                            <FileText className="h-6 w-6" />
                                        </div>
                                        <div className="overflow-hidden">
                                            <p className="font-black text-slate-900 truncate">{file.name}</p>
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{(file.size / 1024).toFixed(1)} KB</p>
                                        </div>
                                    </div>
                                    <button onClick={() => setFiles(prev => prev.filter((_, i) => i !== idx))} className="text-slate-400 hover:text-red-500 p-2 hover:bg-red-50 rounded-xl transition-colors">
                                        <Trash2 className="h-5 w-5" />
                                    </button>
                                </div>
                            ))}
                            
                            {config.multiple && (
                                 <label className="flex items-center justify-center gap-2 p-4 border border-dashed border-slate-200 rounded-[20px] cursor-pointer text-slate-500 hover:bg-slate-50 transition-colors">
                                    <Plus className="h-5 w-5" /> Add another file
                                    <input type="file" className="hidden" accept={config.accept} multiple={config.multiple} onChange={handleFileChange} />
                                 </label>
                            )}

                            <button 
                                onClick={handleRun} 
                                disabled={isProcessing || (config.multiple && files.length < 2)} 
                                className="w-full py-5 bg-slate-900 text-white rounded-[24px] font-black text-lg flex items-center justify-center gap-3 shadow-xl hover:bg-black transition-all active:scale-95 disabled:opacity-50 mt-8"
                            >
                                 {isProcessing ? <Loader2 className="animate-spin h-6 w-6" /> : <Download className="h-6 w-6" />}
                                 {isProcessing ? 'Processing...' : config.actionLabel}
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <div className="text-center py-10 animate-zoom-in flex-grow flex flex-col justify-center">
                    <div className="w-24 h-24 bg-green-50 text-green-600 rounded-[32px] flex items-center justify-center mx-auto mb-6 shadow-sm">
                        <CheckCircle2 className="h-12 w-12" />
                    </div>
                    <h3 className="text-3xl font-black text-slate-900 mb-2">Success!</h3>
                    <p className="text-slate-500 font-medium mb-10">Your PDF has been generated.</p>
                    
                    <div className="space-y-4">
                        {result && (
                          <button 
                              onClick={handleDownload}
                              className="w-full py-5 bg-brand-600 text-white rounded-[24px] font-black text-lg flex items-center justify-center gap-3 shadow-xl hover:bg-brand-700 transition-all active:scale-95"
                          >
                              <Download className="h-6 w-6" /> Download PDF
                          </button>
                        )}
                        <button 
                            onClick={() => { setFiles([]); setResult(null); setReport(null); setPreviewThumbnail(null); }}
                            className="text-slate-400 font-black uppercase tracking-widest text-xs hover:text-brand-600 py-2"
                        >
                            Convert Another
                        </button>
                    </div>
                </div>
            )}
        </div>

        {/* Right Side: Workspace Preview */}
        <div className="flex-grow bg-slate-100 p-12 overflow-y-auto min-h-[500px]">
           <div className="max-w-4xl mx-auto h-full flex items-center justify-center">
              {report ? (
                 <div className="w-full animate-in fade-in slide-in-from-right-4">
                    <div className="p-8 bg-slate-900 text-green-400 rounded-[40px] font-mono text-sm whitespace-pre shadow-2xl border border-slate-800 leading-relaxed max-h-[600px] overflow-auto custom-scrollbar">
                        {report}
                    </div>
                 </div>
              ) : !files.length && !result ? (
                <div className="text-center text-slate-300">
                    <Eye className="h-24 w-24 mb-6 opacity-20 mx-auto" />
                    <p className="text-xl font-black uppercase tracking-[0.2em] opacity-40">Document Workspace</p>
                    <p className="mt-2 font-medium opacity-50">Converted files will appear here for preview</p>
                </div>
              ) : (
                <div className="w-full max-w-lg bg-white p-8 rounded-[48px] shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-500">
                   <div className="aspect-[3/4] bg-slate-50 rounded-[32px] overflow-hidden border border-slate-100 shadow-inner flex items-center justify-center relative">
                      {isProcessing ? (
                        <div className="flex flex-col items-center gap-4 text-brand-600 animate-pulse">
                           <Loader2 className="h-12 w-12 animate-spin" />
                           <p className="text-[10px] font-black uppercase tracking-widest">Generating Preview...</p>
                        </div>
                      ) : previewThumbnail ? (
                        <img src={previewThumbnail} className="w-full h-full object-cover animate-in fade-in" alt="PDF Preview" />
                      ) : (
                        <div className="flex flex-col items-center text-slate-200">
                           <FileText className="h-24 w-24 opacity-20" />
                           <p className="text-[10px] font-black uppercase tracking-widest mt-4 opacity-50">Preview Pending</p>
                        </div>
                      )}
                      
                      {previewThumbnail && (
                        <div className="absolute top-6 left-6 bg-slate-900/90 text-white text-[10px] font-black px-4 py-1.5 rounded-full backdrop-blur-md shadow-lg border border-white/10 uppercase">
                           Page 1 Preview
                        </div>
                      )}
                   </div>
                   
                   <div className="mt-10 flex justify-between items-center px-6">
                      <div className="overflow-hidden">
                        <p className="text-xl font-black text-slate-900 truncate">{result ? result.name : files[0]?.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                          {result ? 'Successfully Processed' : 'Ready for Conversion'}
                        </p>
                      </div>
                      <div className={`p-4 rounded-2xl shadow-sm ${result ? 'bg-green-50 text-green-600' : 'bg-brand-50 text-brand-600'}`}>
                         <CheckCircle2 className="h-6 w-6" />
                      </div>
                   </div>
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};
