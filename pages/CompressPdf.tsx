import React, { useState, useEffect } from 'react';
import { ArrowLeft, Download, Loader2, Plus, Trash2, CheckCircle2, FileText, Minimize, Zap, Shield, Gauge } from 'lucide-react';
import { AppView } from '../types';
import { renderPdfToImages } from '../services/pdfUtils';
import { compressPdfDocument } from '../services/pdfUtils';

interface Props {
  setView: (view: AppView) => void;
}

type CompressionLevel = 'extreme' | 'recommended' | 'less';

const compressionOptions = {
  extreme: {
    title: 'Extreme Compression',
    description: 'Less quality, high compression',
    icon: Zap,
    color: 'red',
    bgColor: 'bg-red-50 dark:bg-red-950',
    borderColor: 'border-red-200 dark:border-red-800',
    textColor: 'text-red-600 dark:text-red-400'
  },
  recommended: {
    title: 'Recommended Compression',
    description: 'Good quality, good compression',
    icon: Shield,
    color: 'brand',
    bgColor: 'bg-brand-50 dark:bg-brand-950',
    borderColor: 'border-brand-200 dark:border-brand-800',
    textColor: 'text-brand-600 dark:text-brand-400'
  },
  less: {
    title: 'Less Compression',
    description: 'High quality, less compression',
    icon: Gauge,
    color: 'emerald',
    bgColor: 'bg-emerald-50 dark:bg-emerald-950',
    borderColor: 'border-emerald-200 dark:border-emerald-800',
    textColor: 'text-emerald-600 dark:text-emerald-400'
  }
};

export const CompressPdf: React.FC<Props> = ({ setView }) => {
  const [file, setFile] = useState<File | null>(null);
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<Uint8Array | null>(null);
  const [compressionLevel, setCompressionLevel] = useState<CompressionLevel>('recommended');
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [compressedSize, setCompressedSize] = useState<number>(0);

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
        const selectedFile = e.target.files[0];
        setFile(selectedFile);
        setOriginalSize(selectedFile.size);
        setResult(null);
        setCompressedSize(0);
    }
  };

  const handleRun = async () => {
    if (!file) return;
    setIsProcessing(true);
    try {
      const bytes = await compressPdfDocument(file, compressionLevel);
      setResult(bytes);
      setCompressedSize(bytes.length);
    } catch (error) {
      console.error('Compression error:', error);
      alert('Compression failed. Please try again with a different file.');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 KB';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getCompressionRatio = (): string => {
    if (originalSize === 0 || compressedSize === 0) return '0%';
    const reduction = ((originalSize - compressedSize) / originalSize) * 100;
    return reduction.toFixed(1) + '%';
  };

  const handleDownload = () => {
    if (!result) return;
    const blob = new Blob([result], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Compressed_${compressionLevel}_${file?.name}`;
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
            <Minimize className="h-5 w-5 text-brand-600" /> Compress PDF
          </h1>
          <div className="w-20"></div>
        </div>
      </div>

      <div className="flex-grow flex flex-col md:flex-row">
        {/* Left Side: Controls */}
        <div className="w-full md:w-[450px] bg-white border-r border-slate-200 p-10 flex flex-col shadow-inner">
            <div className="text-center md:text-left mb-10">
                <div className="w-20 h-20 bg-brand-50 text-brand-600 rounded-[24px] flex items-center justify-center mb-6 shadow-sm">
                    <Minimize className="h-10 w-10" />
                </div>
                <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Compress PDF</h2>
                <p className="text-slate-500 font-medium">Optimize file size for sharing</p>
            </div>
            
            {!result ? (
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

                            {/* Compression Level Selection */}
                            <div className="space-y-4">
                                <h3 className="font-black text-slate-900 text-lg">Compression Level</h3>
                                <div className="space-y-3">
                                    {(Object.keys(compressionOptions) as CompressionLevel[]).map((level) => {
                                        const option = compressionOptions[level];
                                        const Icon = option.icon;
                                        return (
                                            <button
                                                key={level}
                                                onClick={() => setCompressionLevel(level)}
                                                className={`w-full p-4 rounded-xl border-2 transition-all ${
                                                    compressionLevel === level
                                                        ? `${option.bgColor} ${option.borderColor} ${option.textColor}`
                                                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                                                }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-10 h-10 ${compressionLevel === level ? option.bgColor : 'bg-slate-100'} rounded-lg flex items-center justify-center`}>
                                                        <Icon className={`h-5 w-5 ${compressionLevel === level ? option.textColor : 'text-slate-600'}`} />
                                                    </div>
                                                    <div className="text-left">
                                                        <div className="font-bold">{option.title}</div>
                                                        <div className="text-sm opacity-75">{option.description}</div>
                                                    </div>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <button 
                                onClick={handleRun} 
                                disabled={isProcessing} 
                                className="w-full py-5 bg-slate-900 text-white rounded-[24px] font-black text-lg flex items-center justify-center gap-3 shadow-xl hover:bg-black transition-all active:scale-95 disabled:opacity-50 mt-8"
                            >
                                 {isProcessing ? <Loader2 className="animate-spin h-6 w-6" /> : <Minimize className="h-6 w-6" />}
                                 {isProcessing ? 'Compressing...' : `Start Compression`}
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <div className="text-center py-10 animate-zoom-in flex-grow flex flex-col justify-center">
                    <div className="w-24 h-24 bg-green-50 text-green-600 rounded-[32px] flex items-center justify-center mx-auto mb-6 shadow-sm">
                        <CheckCircle2 className="h-12 w-12" />
                    </div>
                    <h3 className="text-3xl font-black text-slate-900 mb-2">Compression Complete!</h3>
                    <p className="text-slate-500 font-medium mb-2">
                        Your PDF has been compressed using <span className="font-bold text-brand-600">{compressionOptions[compressionLevel].title}</span>
                    </p>
                    <p className="text-slate-400 text-sm mb-6">File size reduced while maintaining {compressionLevel === 'extreme' ? 'minimal' : compressionLevel === 'recommended' ? 'good' : 'high'} quality</p>

                    {/* Compression Statistics */}
                    <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-6 mb-8 border border-slate-200 dark:border-slate-700">
                        <h4 className="font-black text-slate-900 dark:text-white mb-4">Compression Results</h4>
                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                                <div className="text-2xl font-black text-slate-900 dark:text-white">{formatFileSize(originalSize)}</div>
                                <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">Original</div>
                            </div>
                            <div>
                                <div className="text-2xl font-black text-green-600 dark:text-green-400">{formatFileSize(compressedSize)}</div>
                                <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">Compressed</div>
                            </div>
                            <div>
                                <div className="text-2xl font-black text-brand-600 dark:text-brand-400">{getCompressionRatio()}</div>
                                <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">Saved</div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <button 
                            onClick={handleDownload}
                            className="w-full py-5 bg-brand-600 text-white rounded-[24px] font-black text-lg flex items-center justify-center gap-3 shadow-xl hover:bg-brand-700 transition-all active:scale-95"
                        >
                            <Download className="h-6 w-6" /> Download Compressed PDF
                        </button>
                        <button 
                            onClick={() => { setFile(null); setResult(null); }}
                            className="text-slate-400 font-black uppercase tracking-widest text-xs hover:text-brand-600 py-2"
                        >
                            Compress Another
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
                    <Minimize className="h-24 w-24 mb-6 opacity-20 mx-auto" />
                    <p className="text-xl font-black uppercase tracking-[0.2em] opacity-40">Compression Preview</p>
                    <p className="mt-2 font-medium opacity-50">Upload a PDF to see it here</p>
                </div>
              ) : (
                <div className="bg-white p-10 rounded-[56px] shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-500 text-center relative overflow-hidden group">
                   <div className="absolute inset-0 translate-x-[-100%] group-hover:animate-shimmer-premium bg-gradient-to-r from-transparent via-slate-50/50 to-transparent pointer-events-none"></div>
                   
                   <div className="aspect-[3/4] bg-slate-50 border-8 border-slate-50 rounded-[40undles
40px] flex items-center justify-center p-6 shadow-inner relative z-10 mx-auto">
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
                      <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                          Ready for {compressionOptions[compressionLevel].title}
                      </p>
                   </div>
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};
